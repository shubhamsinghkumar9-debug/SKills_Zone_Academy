from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
import datetime

from extensions import get_db
from utils.helpers import success, error, serialize

students_bp = Blueprint("students", __name__, url_prefix="/api/students")


def _user_role(user_id: str) -> str:
    db = get_db()
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"role": 1})
    return (user or {}).get("role", "student")


# ── GET /api/students/dashboard  (student's personal dashboard) ───
@students_bp.get("/dashboard")
@jwt_required()
def dashboard():
    user_id = get_jwt_identity()
    db      = get_db()
    user    = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return error("User not found.", 404)

    # All enrollments
    enrollments = list(db.enrollments.find({"user_id": user_id}))

    # Enrich with course data
    enriched = []
    for enr in enrollments:
        course = db.courses.find_one({"id": enr["course_id"]}, {
            "title": 1, "emoji": 1, "subtitle": 1, "instructor": 1,
            "hours": 1, "accent": 1, "gradient": 1,
        })
        rec = serialize(enr)
        rec["course"] = serialize(course) if course else {}
        enriched.append(rec)

    completed = sum(1 for e in enrollments if e.get("completed"))
    in_progress = len(enrollments) - completed

    return success(data={
        "user": {
            "_id":      str(user["_id"]),
            "name":     user["name"],
            "email":    user["email"],
            "avatar":   user.get("avatar", ""),
            "role":     user.get("role", "student"),
        },
        "stats": {
            "total_enrolled":  len(enrollments),
            "completed":       completed,
            "in_progress":     in_progress,
        },
        "enrollments": enriched,
    })


# ── GET /api/students/enrollments  (student's enrolled courses) ───
@students_bp.get("/enrollments")
@jwt_required()
def my_enrollments():
    user_id = get_jwt_identity()
    db      = get_db()
    records = list(db.enrollments.find({"user_id": user_id}).sort("enrolled_at", -1))
    return success(data={"enrollments": serialize(records)})


# ── GET /api/students/all  (admin: list all students) ─────────────
@students_bp.get("/all")
@jwt_required()
def list_all_students():
    user_id = get_jwt_identity()
    if _user_role(user_id) != "admin":
        return error("Forbidden.", 403)

    db   = get_db()
    page = int(request.args.get("page", 1))
    per  = int(request.args.get("per_page", 20))
    q    = request.args.get("q", "")

    query = {"role": "student"}
    if q:
        query["$or"] = [
            {"name":  {"$regex": q, "$options": "i"}},
            {"email": {"$regex": q, "$options": "i"}},
        ]

    total = db.users.count_documents(query)
    users = list(
        db.users.find(query, {"password_hash": 0, "reset_token": 0, "reset_expires": 0})
        .sort("created_at", -1)
        .skip((page - 1) * per)
        .limit(per)
    )

    return success(data={
        "students": serialize(users),
        "pagination": {
            "page": page, "per_page": per, "total": total,
            "pages": (total + per - 1) // per,
        },
    })


# ── GET /api/students/:id  (admin: single student detail) ─────────
@students_bp.get("/<student_id>")
@jwt_required()
def get_student(student_id):
    user_id = get_jwt_identity()
    # Allow student to fetch themselves, or admin any
    if user_id != student_id and _user_role(user_id) != "admin":
        return error("Forbidden.", 403)

    db      = get_db()
    student = db.users.find_one(
        {"_id": ObjectId(student_id)},
        {"password_hash": 0, "reset_token": 0, "reset_expires": 0},
    )
    if not student:
        return error("Student not found.", 404)

    enrollments = list(db.enrollments.find({"user_id": student_id}))
    reviews     = list(db.reviews.find({"user_id": student_id}))

    return success(data={
        "student":     serialize(student),
        "enrollments": serialize(enrollments),
        "reviews":     serialize(reviews),
    })


# ── PUT /api/students/:id/role  (admin: promote/demote) ───────────
@students_bp.put("/<student_id>/role")
@jwt_required()
def change_role(student_id):
    user_id = get_jwt_identity()
    if _user_role(user_id) != "admin":
        return error("Forbidden.", 403)

    data = request.get_json(silent=True) or {}
    role = data.get("role")
    if role not in ("student", "admin"):
        return error("Role must be 'student' or 'admin'.", 422)

    db  = get_db()
    res = db.users.update_one(
        {"_id": ObjectId(student_id)},
        {"$set": {"role": role, "updated_at": datetime.datetime.utcnow()}},
    )
    if res.matched_count == 0:
        return error("User not found.", 404)
    return success(message=f"Role updated to '{role}'.")


# ── DELETE /api/students/:id  (admin: remove student) ─────────────
@students_bp.delete("/<student_id>")
@jwt_required()
def delete_student(student_id):
    user_id = get_jwt_identity()
    if _user_role(user_id) != "admin":
        return error("Forbidden.", 403)

    db = get_db()
    # Remove user and their enrollments/reviews
    result = db.users.delete_one({"_id": ObjectId(student_id)})
    if result.deleted_count == 0:
        return error("Student not found.", 404)

    # Cascade: remove enrollments and reviews
    db.enrollments.delete_many({"user_id": student_id})
    db.reviews.delete_many({"user_id": student_id})
    db.callback_requests.delete_many({"user_id": student_id})

    return success(message="Student removed.")


# ── PUT /api/students/:id  (admin: update student info) ────────────
@students_bp.put("/<student_id>")
@jwt_required()
def update_student(student_id):
    user_id = get_jwt_identity()
    if _user_role(user_id) != "admin" and user_id != student_id:
        return error("Forbidden.", 403)

    data = request.get_json(silent=True) or {}
    db   = get_db()

    allowed = ["name", "email", "avatar", "phone"]
    updates = {k: data[k] for k in allowed if k in data}
    updates["updated_at"] = datetime.datetime.utcnow()

    res = db.users.update_one(
        {"_id": ObjectId(student_id)},
        {"$set": updates},
    )
    if res.matched_count == 0:
        return error("User not found.", 404)

    user = db.users.find_one(
        {"_id": ObjectId(student_id)},
        {"password_hash": 0, "reset_token": 0},
    )
    return success(data={"student": serialize(user)}, message="Student updated.")
