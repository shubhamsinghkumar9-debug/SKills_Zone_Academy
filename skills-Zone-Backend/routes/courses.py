from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from bson import ObjectId
import datetime

from extensions import get_db
from utils.helpers import success, error, serialize, paginate
from utils.email_service import send_enrollment_confirmation

courses_bp = Blueprint("courses", __name__, url_prefix="/api/courses")


def _is_admin(jwt_data: dict) -> bool:
    return jwt_data.get("role") == "admin"


def _user_role(user_id: str) -> str:
    db = get_db()
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"role": 1})
    return (user or {}).get("role", "student")


# ── GET /api/courses  (public, paginated) ─────────────────────────
@courses_bp.get("/")
def list_courses():
    db   = get_db()
    page = int(request.args.get("page", 1))
    per  = int(request.args.get("per_page", 20))
    tag  = request.args.get("tag")        # e.g. BESTSELLER
    q    = request.args.get("q")          # text search

    query = {}
    if tag:
        query["tag"] = tag.upper()
    if q:
        query["$or"] = [
            {"title":    {"$regex": q, "$options": "i"}},
            {"subtitle": {"$regex": q, "$options": "i"}},
            {"desc":     {"$regex": q, "$options": "i"}},
        ]

    result = paginate(db.courses, query, page=page, per_page=per, sort_by="_id", sort_dir=1)
    return success(data=result)


# ── GET /api/courses/:id_or_slug  (public) ────────────────────────
@courses_bp.get("/<course_id>")
def get_course(course_id):
    db = get_db()
    # Try slug first, then ObjectId
    course = db.courses.find_one({"id": course_id})
    if not course and ObjectId.is_valid(course_id):
        course = db.courses.find_one({"_id": ObjectId(course_id)})
    if not course:
        return error("Course not found.", 404)
    return success(data={"course": serialize(course)})


# ── POST /api/courses  (admin only) ───────────────────────────────
@courses_bp.post("/")
@jwt_required()
def create_course():
    user_id = get_jwt_identity()
    if _user_role(user_id) != "admin":
        return error("Forbidden.", 403)

    data = request.get_json(silent=True) or {}
    db   = get_db()

    required = ["id", "title", "subtitle", "desc", "price", "originalPrice"]
    missing  = [f for f in required if not data.get(f)]
    if missing:
        return error(f"Missing fields: {', '.join(missing)}", 422)

    if db.courses.find_one({"id": data["id"]}):
        return error(f"Course with id '{data['id']}' already exists.", 409)

    now = datetime.datetime.utcnow()
    course = {
        "id":            data["id"],
        "emoji":         data.get("emoji", "📚"),
        "tag":           data.get("tag", ""),
        "tagColor":      data.get("tagColor", "green"),
        "title":         data["title"],
        "subtitle":      data.get("subtitle", ""),
        "desc":          data.get("desc", ""),
        "longDesc":      data.get("longDesc", ""),
        "instructor":    data.get("instructor", "Harsh Sharma"),
        "instructorRole":data.get("instructorRole", "Founder, Sheryians"),
        "rating":        data.get("rating", "4.9"),
        "students":      data.get("students", "0"),
        "hours":         data.get("hours", "0"),
        "updated":       data.get("updated", now.strftime("%b %Y")),
        "price":         data["price"],
        "originalPrice": data["originalPrice"],
        "gradient":      data.get("gradient", "from-green-500/25 to-emerald-500/10"),
        "accent":        data.get("accent", "#9EFF00"),
        "features":      data.get("features", []),
        "curriculum":    data.get("curriculum", []),
        "notes":         data.get("notes", []),
        "reviews":       data.get("reviews", []),
        "created_at":    now,
        "updated_at":    now,
    }

    result = db.courses.insert_one(course)
    course["_id"] = result.inserted_id
    return success(data={"course": serialize(course)}, message="Course created.", status=201)


# ── PUT /api/courses/:id  (admin only) ────────────────────────────
@courses_bp.put("/<course_id>")
@jwt_required()
def update_course(course_id):
    user_id = get_jwt_identity()
    if _user_role(user_id) != "admin":
        return error("Forbidden.", 403)

    data = request.get_json(silent=True) or {}
    db   = get_db()

    course = db.courses.find_one({"id": course_id})
    if not course:
        return error("Course not found.", 404)

    # Whitelist updatable fields
    allowed = [
        "emoji", "tag", "tagColor", "title", "subtitle", "desc", "longDesc",
        "instructor", "instructorRole", "rating", "students", "hours", "updated",
        "price", "originalPrice", "gradient", "accent", "features",
        "curriculum", "notes",
    ]
    updates = {k: data[k] for k in allowed if k in data}
    updates["updated_at"] = datetime.datetime.utcnow()

    db.courses.update_one({"id": course_id}, {"$set": updates})
    course = db.courses.find_one({"id": course_id})
    return success(data={"course": serialize(course)}, message="Course updated.")


# ── DELETE /api/courses/:id  (admin only) ─────────────────────────
@courses_bp.delete("/<course_id>")
@jwt_required()
def delete_course(course_id):
    user_id = get_jwt_identity()
    if _user_role(user_id) != "admin":
        return error("Forbidden.", 403)

    db     = get_db()
    result = db.courses.delete_one({"id": course_id})
    if result.deleted_count == 0:
        return error("Course not found.", 404)
    return success(message="Course deleted.")


# ── POST /api/courses/:id/enroll  (auth required) ─────────────────
@courses_bp.post("/<course_id>/enroll")
@jwt_required()
def enroll(course_id):
    user_id = get_jwt_identity()
    db      = get_db()

    course = db.courses.find_one({"id": course_id})
    if not course:
        return error("Course not found.", 404)

    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return error("User not found.", 404)

    # Check already enrolled
    existing = db.enrollments.find_one({"user_id": user_id, "course_id": course_id})
    if existing:
        return error("You are already enrolled in this course.", 409)

    now = datetime.datetime.utcnow()
    enrollment = {
        "user_id":       user_id,
        "course_id":     course_id,
        "course_title":  course["title"],
        "enrolled_at":   now,
        "progress":      0,     # 0-100
        "completed":     False,
        "last_accessed": now,
    }
    db.enrollments.insert_one(enrollment)

    # Also push to user.enrolled array for quick lookup
    db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$addToSet": {"enrolled": course_id}},
    )

    # Increment student count
    db.courses.update_one({"id": course_id}, {"$inc": {"enrolled_count": 1}})

    send_enrollment_confirmation(user["email"], user["name"], course["title"], course_id)

    return success(data={"enrollment": serialize(enrollment)}, message="Enrolled successfully!", status=201)


# ── GET /api/courses/:id/enrollment  (auth) ───────────────────────
@courses_bp.get("/<course_id>/enrollment")
@jwt_required()
def get_enrollment(course_id):
    user_id = get_jwt_identity()
    db      = get_db()
    record  = db.enrollments.find_one({"user_id": user_id, "course_id": course_id})
    if not record:
        return error("Not enrolled.", 404)
    return success(data={"enrollment": serialize(record)})


# ── PUT /api/courses/:id/progress  (auth) ─────────────────────────
@courses_bp.put("/<course_id>/progress")
@jwt_required()
def update_progress(course_id):
    user_id = get_jwt_identity()
    data    = request.get_json(silent=True) or {}
    progress = data.get("progress")

    if not isinstance(progress, (int, float)) or not (0 <= progress <= 100):
        return error("Progress must be a number between 0 and 100.", 422)

    db  = get_db()
    res = db.enrollments.update_one(
        {"user_id": user_id, "course_id": course_id},
        {"$set": {
            "progress":      int(progress),
            "completed":     progress >= 100,
            "last_accessed": datetime.datetime.utcnow(),
        }},
    )
    if res.matched_count == 0:
        return error("Enrollment not found.", 404)
    return success(message="Progress updated.")


# ── GET /api/courses/:id/reviews  (public) ────────────────────────
@courses_bp.get("/<course_id>/reviews")
def list_reviews(course_id):
    db   = get_db()
    page = int(request.args.get("page", 1))
    per  = int(request.args.get("per_page", 10))
    result = paginate(db.reviews, {"course_id": course_id}, page=page, per_page=per)
    return success(data=result)


# ── POST /api/courses/:id/reviews  (auth, enrolled) ───────────────
@courses_bp.post("/<course_id>/reviews")
@jwt_required()
def add_review(course_id):
    from utils.validators import validate_review
    user_id = get_jwt_identity()
    data    = request.get_json(silent=True) or {}

    errs = validate_review(data)
    if errs:
        return error("Validation failed", 422, errs)

    db = get_db()

    # Must be enrolled
    if not db.enrollments.find_one({"user_id": user_id, "course_id": course_id}):
        return error("You must be enrolled to leave a review.", 403)

    # One review per user per course
    if db.reviews.find_one({"user_id": user_id, "course_id": course_id}):
        return error("You have already reviewed this course.", 409)

    user = db.users.find_one({"_id": ObjectId(user_id)}, {"name": 1})
    now  = datetime.datetime.utcnow()
    review = {
        "user_id":    user_id,
        "course_id":  course_id,
        "name":       user["name"],
        "rating":     data["rating"],
        "text":       data["text"].strip(),
        "created_at": now,
    }
    db.reviews.insert_one(review)

    # Recompute average rating on course
    pipeline = [
        {"$match": {"course_id": course_id}},
        {"$group": {"_id": None, "avg": {"$avg": "$rating"}, "count": {"$sum": 1}}},
    ]
    agg = list(db.reviews.aggregate(pipeline))
    if agg:
        avg = round(agg[0]["avg"], 1)
        db.courses.update_one({"id": course_id}, {"$set": {"rating": str(avg)}})

    return success(data={"review": serialize(review)}, message="Review added.", status=201)
