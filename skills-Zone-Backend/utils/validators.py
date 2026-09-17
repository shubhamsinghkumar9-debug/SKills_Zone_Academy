import re


EMAIL_RE = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
PHONE_RE = re.compile(r"^\+?[0-9\s\-()]{7,20}$")


def validate_register(data: dict) -> list[str]:
    errs = []
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""

    if not name or len(name) < 2:
        errs.append("Name must be at least 2 characters.")
    if not email or not EMAIL_RE.match(email):
        errs.append("A valid email is required.")
    if not password or len(password) < 6:
        errs.append("Password must be at least 6 characters.")
    return errs


def validate_login(data: dict) -> list[str]:
    errs = []
    if not (data.get("email") or "").strip():
        errs.append("Email is required.")
    if not data.get("password"):
        errs.append("Password is required.")
    return errs


def validate_callback(data: dict) -> list[str]:
    errs = []
    if not (data.get("name") or "").strip():
        errs.append("Name is required.")
    phone = (data.get("phone") or "").strip()
    if not phone or not PHONE_RE.match(phone):
        errs.append("A valid phone number is required.")
    if not data.get("enquiry_for"):
        errs.append("Enquiry type is required.")
    return errs


def validate_review(data: dict) -> list[str]:
    errs = []
    rating = data.get("rating")
    if not isinstance(rating, int) or not (1 <= rating <= 5):
        errs.append("Rating must be an integer between 1 and 5.")
    text = (data.get("text") or "").strip()
    if not text or len(text) < 10:
        errs.append("Review text must be at least 10 characters.")
    return errs
