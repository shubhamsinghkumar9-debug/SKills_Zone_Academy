from flask_jwt_extended import JWTManager
from flask_mail import Mail
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, ConfigurationError
import os
import certifi

jwt = JWTManager()
mail = Mail()
_mongo_client = None
_db = None


def _seed_fallback_data(db):
    try:
        import bcrypt
        import datetime
        now = datetime.datetime.utcnow()

        # Seed admins (both configured ADMIN_EMAIL and default admin@sheryians.com)
        admin_emails = list(dict.fromkeys([os.getenv("ADMIN_EMAIL", "ehosa976@gmail.com"), "admin@sheryians.com"]))
        pw_hash = bcrypt.hashpw("Admin@123".encode(), bcrypt.gensalt(12))
        for adm in admin_emails:
            if db.users.count_documents({"email": adm}) == 0:
                db.users.insert_one({
                    "name": "Skill-Zone Admin",
                    "email": adm,
                    "password_hash": pw_hash,
                    "role": "admin",
                    "avatar": "",
                    "enrolled": [],
                    "reset_token": None,
                    "reset_expires": None,
                    "created_at": now,
                    "updated_at": now,
                })
                print(f"🌱 In-memory database seeded with admin: {adm} / Admin@123")


        # Seed courses
        if db.courses.count_documents({}) == 0:
            try:
                from seeds.seed_courses import courses
                db.courses.insert_many([c.copy() for c in courses])
                print(f"🌱 In-memory database seeded with {len(courses)} courses")
            except Exception as ce:
                print("⚠️  Could not seed courses into fallback DB:", ce)
    except Exception as e:
        print("⚠️  Fallback data seed warning:", e)


def get_db():
    """Return the MongoDB database instance (lazy singleton). Falls back to mongomock if unavailable."""
    global _mongo_client, _db
    if _db is not None:
        return _db

    uri = os.getenv("MONGO_URI", "mongodb://localhost:27017/sheryians")
    try:
        # Use certifi for SSL (fixes Atlas SSL errors on Mac)
        if uri.startswith("mongodb+srv") or "ssl=true" in uri.lower():
            client = MongoClient(
                uri,
                serverSelectionTimeoutMS=2500,
                tlsCAFile=certifi.where()
            )
        else:
            client = MongoClient(uri, serverSelectionTimeoutMS=2500)

        # Ping to test connectivity
        client.admin.command("ping")
        db_name = uri.rsplit("/", 1)[-1].split("?")[0] or "sheryians"
        _mongo_client = client
        _db = _mongo_client[db_name]
        print("✅  MongoDB connected:", _db.name)
        return _db
    except Exception as e:
        print(f"⚠️  MongoDB connection failed ({type(e).__name__}: {e}).")
        print("💡  Falling back to in-memory mongomock database. Data will reset on server restart.")
        import mongomock
        _mongo_client = mongomock.MongoClient()
        _db = _mongo_client["sheryians"]
        _seed_fallback_data(_db)
        return _db


def init_extensions(app):
    jwt.init_app(app)
    mail.init_app(app)

    db = get_db()

    # Ensure indexes
    try:
        db.users.create_index("email", unique=True)
        db.courses.create_index("id", unique=True)
        db.enrollments.create_index([("user_id", 1), ("course_id", 1)], unique=True)
        db.callback_requests.create_index("created_at")
        db.reviews.create_index([("course_id", 1), ("user_id", 1)])
        db.notes.create_index("created_at")
        print("✅  Indexes ensured")
    except Exception as e:
        print("⚠️   Could not create indexes:", e)

