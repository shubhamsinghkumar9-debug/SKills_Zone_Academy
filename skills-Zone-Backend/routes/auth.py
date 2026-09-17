from flask import Blueprint, request
from flask_jwt_extended import (
    create_access_token, create_refresh_token,
    jwt_required, get_jwt_identity, get_jwt
)
import bcrypt
import datetime
import secrets
from bson import ObjectId

from extensions import get_db
from utils.helpers import success, error, serialize
from utils.validators import validate_register, validate_login
from utils.email_service import send_welcome_email, send_password_reset_email

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


# ── helpers ────────────────────────────────────────────────────────
def _hash(password: str) -> bytes:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt(12))

def _check(password: str, hashed: bytes) -> bool:
    return bcrypt.checkpw(password.encode(), hashed)

def _safe_user(user: dict) -> dict:
    """Strip sensitive fields before returning user to client."""
    return {
        "_id":        str(user["_id"]),
        "name":       user["name"],
        "email":      user["email"],
        "role":       user.get("role", "student"),
        "avatar":     user.get("avatar", ""),
        "enrolled":   [str(c) for c in user.get("enrolled", [])],
        "created_at": user["created_at"].isoformat() if isinstance(user.get("created_at"), datetime.datetime) else "",
    }


# ── POST /api/auth/register ────────────────────────────────────────
@auth_bp.post("/register")
def register():
    data = request.get_json(silent=True) or {}
    errs = validate_register(data)
    if errs:
        return error("Validation failed", 422, errs)

    db = get_db()
    email = data["email"].strip().lower()

    if db.users.find_one({"email": email}):
        return error("An account with this email already exists.", 409)

    now = datetime.datetime.utcnow()
    user = {
        "name":            data["name"].strip(),
        "email":           email,
        "password_hash":   _hash(data["password"]),
        "role":            "student",
        "avatar":          "",
        "enrolled":        [],          # list of course IDs (strings)
        "reset_token":     None,
        "reset_expires":   None,
        "created_at":      now,
        "updated_at":      now,
    }

    result = db.users.insert_one(user)
    user["_id"] = result.inserted_id

    # Fire welcome email (non-blocking in prod you'd use a queue)
    send_welcome_email(email, user["name"])

    access  = create_access_token(identity=str(result.inserted_id))
    refresh = create_refresh_token(identity=str(result.inserted_id))

    return success(
        data={"user": _safe_user(user), "access_token": access, "refresh_token": refresh},
        message="Account created successfully.",
        status=201,
    )


# ── POST /api/auth/login ───────────────────────────────────────────
@auth_bp.post("/login")
def login():
    data = request.get_json(silent=True) or {}
    errs = validate_login(data)
    if errs:
        return error("Validation failed", 422, errs)

    db   = get_db()
    email = data["email"].strip().lower()
    user = db.users.find_one({"email": email})

    if not user or not _check(data["password"], user["password_hash"]):
        return error("Invalid email or password.", 401)

    access  = create_access_token(identity=str(user["_id"]))
    refresh = create_refresh_token(identity=str(user["_id"]))

    return success(
        data={"user": _safe_user(user), "access_token": access, "refresh_token": refresh},
        message="Login successful.",
    )


# ── POST /api/auth/refresh ─────────────────────────────────────────
@auth_bp.post("/refresh")
@jwt_required(refresh=True)
def refresh():
    user_id = get_jwt_identity()
    access  = create_access_token(identity=user_id)
    return success(data={"access_token": access})


# ── GET /api/auth/me ───────────────────────────────────────────────
@auth_bp.get("/me")
@jwt_required()
def me():
    user_id = get_jwt_identity()
    db   = get_db()
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        return error("User not found.", 404)
    return success(data={"user": _safe_user(user)})


# ── PUT /api/auth/me ───────────────────────────────────────────────
@auth_bp.put("/me")
@jwt_required()
def update_me():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}
    db   = get_db()

    updates = {}
    if data.get("name"):
        updates["name"] = data["name"].strip()
    if data.get("avatar"):
        updates["avatar"] = data["avatar"].strip()

    # Password change
    if data.get("current_password") and data.get("new_password"):
        user = db.users.find_one({"_id": ObjectId(user_id)})
        if not _check(data["current_password"], user["password_hash"]):
            return error("Current password is incorrect.", 400)
        if len(data["new_password"]) < 6:
            return error("New password must be at least 6 characters.", 422)
        updates["password_hash"] = _hash(data["new_password"])

    if not updates:
        return error("Nothing to update.", 400)

    updates["updated_at"] = datetime.datetime.utcnow()
    db.users.update_one({"_id": ObjectId(user_id)}, {"$set": updates})
    user = db.users.find_one({"_id": ObjectId(user_id)})
    return success(data={"user": _safe_user(user)}, message="Profile updated.")


# ── POST /api/auth/forgot-password ────────────────────────────────
@auth_bp.post("/forgot-password")
def forgot_password():
    data  = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    if not email:
        return error("Email is required.", 422)

    db   = get_db()
    user = db.users.find_one({"email": email})

    # Always respond 200 to prevent email enumeration
    if user:
        token   = secrets.token_urlsafe(48)
        expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=30)
        db.users.update_one(
            {"_id": user["_id"]},
            {"$set": {"reset_token": token, "reset_expires": expires}},
        )
        send_password_reset_email(email, user["name"], token)

    return success(message="If that email is registered, a reset link was sent.")


# ── POST /api/auth/reset-password ─────────────────────────────────
@auth_bp.post("/reset-password")
def reset_password():
    data  = request.get_json(silent=True) or {}
    token = (data.get("token") or "").strip()
    new_pw = data.get("password") or ""

    if not token:
        return error("Reset token is required.", 422)
    if len(new_pw) < 6:
        return error("Password must be at least 6 characters.", 422)

    db   = get_db()
    now  = datetime.datetime.utcnow()
    user = db.users.find_one({
        "reset_token":   token,
        "reset_expires": {"$gt": now},
    })

    if not user:
        return error("Reset link is invalid or has expired.", 400)

    db.users.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "password_hash":  _hash(new_pw),
            "reset_token":    None,
            "reset_expires":  None,
            "updated_at":     now,
        }},
    )
    return success(message="Password reset successfully. You can now log in.")
