from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from bson import ObjectId
import datetime

from extensions import get_db
from utils.helpers import success, error, serialize

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


def _require_admin(user_id: str):
    db   = get_db()
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"role": 1})
    if not user or user.get("role") != "admin":
        return False
    return True


# ── GET /api/admin/stats ──────────────────────────────────────────
@admin_bp.get("/stats")
@jwt_required()
def stats():
    user_id = get_jwt_identity()
    if not _require_admin(user_id):
        return error("Forbidden.", 403)

    db  = get_db()
    now = datetime.datetime.utcnow()
    month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

    total_students   = db.users.count_documents({"role": "student"})
    total_courses    = db.courses.count_documents({})
    total_enrollments = db.enrollments.count_documents({})
    total_reviews    = db.reviews.count_documents({})
    pending_callbacks = db.callback_requests.count_documents({"status": "pending"})

    new_students_this_month = db.users.count_documents({
        "role": "student",
        "created_at": {"$gte": month_start},
    })
    new_enrollments_this_month = db.enrollments.count_documents({
        "enrolled_at": {"$gte": month_start},
    })

    # Most popular courses
    pipeline = [
        {"$group": {"_id": "$course_id", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 5},
    ]
    top_courses_raw = list(db.enrollments.aggregate(pipeline))
    top_courses = []
    for tc in top_courses_raw:
        c = db.courses.find_one({"id": tc["_id"]}, {"title": 1, "emoji": 1, "id": 1})
        top_courses.append({
            "course_id":   tc["_id"],
            "title":       c["title"] if c else "Unknown",
            "emoji":       c.get("emoji", "📚") if c else "📚",
            "enrollments": tc["count"],
        })

    # Recent activity
    recent_enrollments = serialize(list(
        db.enrollments.find({}).sort("enrolled_at", -1).limit(5)
    ))
    recent_callbacks = serialize(list(
        db.callback_requests.find({}).sort("created_at", -1).limit(5)
    ))

    return success(data={
        "overview": {
            "total_students":            total_students,
            "total_courses":             total_courses,
            "total_enrollments":         total_enrollments,
            "total_reviews":             total_reviews,
            "pending_callbacks":         pending_callbacks,
            "new_students_this_month":   new_students_this_month,
            "new_enrollments_this_month":new_enrollments_this_month,
        },
        "top_courses":         top_courses,
        "recent_enrollments":  recent_enrollments,
        "recent_callbacks":    recent_callbacks,
    })


# ── Notes CRUD for Admin Dashboard ────────────────────────────────
@admin_bp.get("/notes")
def list_notes():
    """List all notes files (used by Admin Dashboard and students)."""
    db = get_db()
    notes = list(db.notes.find({}).sort("created_at", -1))
    return success(data={"notes": serialize(notes)})


@admin_bp.post("/notes")
def create_note():
    data = request.get_json(silent=True) or {}
    title = (data.get("title") or "").strip()
    drive_link = (data.get("driveLink") or "").strip()

    if not title:
        return error("Title is required.", 422)
    if not drive_link:
        return error("Google Drive link is required.", 422)

    db = get_db()
    now = datetime.datetime.utcnow()
    note = {
        "title":       title,
        "description": (data.get("description") or "").strip(),
        "courseId":    data.get("courseId") or "",
        "driveLink":   drive_link,
        "fileSize":    (data.get("fileSize") or "").strip(),
        "visible":     data.get("visible", True) if isinstance(data.get("visible"), bool) else True,
        "created_at":  now,
        "updated_at":  now,
    }

    result = db.notes.insert_one(note)
    note["_id"] = result.inserted_id
    return success(data={"note": serialize(note)}, message="Note created successfully.", status=201)


@admin_bp.put("/notes/<note_id>")
def update_note(note_id):
    data = request.get_json(silent=True) or {}
    db = get_db()

    query = {"_id": ObjectId(note_id)} if ObjectId.is_valid(note_id) else {"_id": note_id}
    existing = db.notes.find_one(query)
    if not existing:
        return error("Note not found.", 404)

    allowed = ["title", "description", "courseId", "driveLink", "fileSize", "visible"]
    updates = {k: data[k] for k in allowed if k in data}
    updates["updated_at"] = datetime.datetime.utcnow()

    db.notes.update_one(query, {"$set": updates})
    updated = db.notes.find_one(query)
    return success(data={"note": serialize(updated)}, message="Note updated successfully.")


@admin_bp.delete("/notes/<note_id>")
def delete_note(note_id):
    db = get_db()
    query = {"_id": ObjectId(note_id)} if ObjectId.is_valid(note_id) else {"_id": note_id}
    result = db.notes.delete_one(query)
    if result.deleted_count == 0:
        return error("Note not found.", 404)
    return success(message="Note deleted successfully.")

