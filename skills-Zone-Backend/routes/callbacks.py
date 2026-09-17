from flask import Blueprint, request, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from bson import ObjectId
import datetime

from extensions import get_db
from utils.helpers import success, error, serialize, paginate
from utils.validators import validate_callback
from utils.email_service import (
    send_callback_confirmation,
    send_callback_admin_notification,
)

callbacks_bp = Blueprint("callbacks", __name__, url_prefix="/api/callbacks")


def _user_role(user_id: str) -> str:
    db = get_db()
    user = db.users.find_one({"_id": ObjectId(user_id)}, {"role": 1})
    return (user or {}).get("role", "student")


# ── POST /api/callbacks  (public — anyone can request) ────────────
@callbacks_bp.post("/")
def create_callback():
    data = request.get_json(silent=True) or {}
    errs = validate_callback(data)
    if errs:
        return error("Validation failed", 422, errs)

    # Optional: attach logged-in user
    user_id = None
    try:
        verify_jwt_in_request(optional=True)
        from flask_jwt_extended import get_jwt_identity as _gji
        user_id = _gji()
    except Exception:
        pass

    db  = get_db()
    now = datetime.datetime.utcnow()

    # Resolve scheduled_at string to something readable
    raw_dt = data.get("scheduled_at") or ""
    try:
        parsed = datetime.datetime.fromisoformat(raw_dt)
        friendly = parsed.strftime("%d %b %Y at %I:%M %p")
    except Exception:
        friendly = raw_dt or "To be confirmed"

    callback_doc = {
        "user_id":      user_id,
        "name":         data["name"].strip(),
        "email":        (data.get("email") or "").strip().lower(),
        "phone":        data["phone"].strip(),
        "enquiry_for":  data.get("enquiry_for", "General"),
        "scheduled_at": friendly,
        "notes":        (data.get("notes") or "").strip(),
        "status":       "pending",   # pending | confirmed | completed | cancelled
        "created_at":   now,
        "updated_at":   now,
    }

    db.callback_requests.insert_one(callback_doc)

    # Email to student (if email provided)
    student_email = callback_doc["email"]
    if student_email:
        send_callback_confirmation(student_email, callback_doc["name"], callback_doc)

    # Email to admin
    send_callback_admin_notification(
        callback_doc,
        current_app.config["ADMIN_EMAIL"],
    )

    return success(
        data={"callback": serialize(callback_doc)},
        message="Callback request submitted. You'll receive a confirmation email shortly.",
        status=201,
    )


# ── GET /api/callbacks  (admin only) ──────────────────────────────
@callbacks_bp.get("/")
@jwt_required()
def list_callbacks():
    user_id = get_jwt_identity()
    if _user_role(user_id) != "admin":
        return error("Forbidden.", 403)

    db     = get_db()
    page   = int(request.args.get("page", 1))
    per    = int(request.args.get("per_page", 20))
    status = request.args.get("status")

    query = {}
    if status:
        query["status"] = status

    result = paginate(db.callback_requests, query, page=page, per_page=per)
    return success(data=result)


# ── GET /api/callbacks/my  (student's own requests) ───────────────
@callbacks_bp.get("/my")
@jwt_required()
def my_callbacks():
    user_id = get_jwt_identity()
    db      = get_db()
    items   = list(db.callback_requests.find({"user_id": user_id}).sort("created_at", -1))
    return success(data={"callbacks": serialize(items)})


# ── PUT /api/callbacks/:id/status  (admin only) ───────────────────
@callbacks_bp.put("/<cb_id>/status")
@jwt_required()
def update_status(cb_id):
    user_id = get_jwt_identity()
    if _user_role(user_id) != "admin":
        return error("Forbidden.", 403)

    data   = request.get_json(silent=True) or {}
    status = data.get("status")
    valid_statuses = ["pending", "confirmed", "completed", "cancelled"]
    if status not in valid_statuses:
        return error(f"Status must be one of: {', '.join(valid_statuses)}", 422)

    db  = get_db()
    res = db.callback_requests.update_one(
        {"_id": ObjectId(cb_id)},
        {"$set": {"status": status, "updated_at": datetime.datetime.utcnow()}},
    )
    if res.matched_count == 0:
        return error("Callback request not found.", 404)
    return success(message=f"Status updated to '{status}'.")


# ── DELETE /api/callbacks/:id  (admin only) ───────────────────────
@callbacks_bp.delete("/<cb_id>")
@jwt_required()
def delete_callback(cb_id):
    user_id = get_jwt_identity()
    if _user_role(user_id) != "admin":
        return error("Forbidden.", 403)

    db     = get_db()
    result = db.callback_requests.delete_one({"_id": ObjectId(cb_id)})
    if result.deleted_count == 0:
        return error("Callback request not found.", 404)
    return success(message="Callback request deleted.")
