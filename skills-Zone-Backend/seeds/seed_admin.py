"""
Creates an admin user if one doesn't exist.
Run: python seeds/seed_admin.py
"""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from dotenv import load_dotenv
load_dotenv()

import bcrypt
import datetime
from extensions import get_db

ADMIN_EMAILS   = ["ehosa976@gmail.com", "admin@sheryians.com"]
ADMIN_PASSWORD = "Admin@123"
ADMIN_NAME     = "Skill-Zone Admin"

def seed():
    db = get_db()
    password_hash = bcrypt.hashpw(ADMIN_PASSWORD.encode(), bcrypt.gensalt(12))
    now = datetime.datetime.utcnow()

    for email in ADMIN_EMAILS:
        existing = db.users.find_one({"email": email})
        if existing:
            print(f"ℹ  Admin already exists: {email}")
            continue

        db.users.insert_one({
            "name":          ADMIN_NAME,
            "email":         email,
            "password_hash": password_hash,
            "role":          "admin",
            "avatar":        "",
            "enrolled":      [],
            "reset_token":   None,
            "reset_expires": None,
            "created_at":    now,
            "updated_at":    now,
        })
        print(f"✅ Admin created: {email} / {ADMIN_PASSWORD}")
    print("   ⚠  Change this password after first login!")


if __name__ == "__main__":
    seed()
