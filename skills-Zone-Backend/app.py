from flask import Flask, jsonify, request
from flask_cors import CORS
from config import Config
from extensions import init_extensions, jwt

from routes.auth      import auth_bp
from routes.courses   import courses_bp
from routes.callbacks import callbacks_bp
from routes.students  import students_bp
from routes.admin     import admin_bp
from routes.review_routes import reviews_bp

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # ── CORS ────────────────────────────────────────────────────────
    CORS(app,
         origins=[app.config.get("FRONTEND_URL", "http://localhost:5173"), "http://localhost:3000","https://skill-zone-academy.vercel.app/"],
         supports_credentials=True,
         allow_headers=["Content-Type", "Authorization"],
         methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    )

    # ── Extensions ──────────────────────────────────────────────────
    init_extensions(app)

    # ── JWT error handlers ──────────────────────────────────────────
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({"success": False, "message": "Token has expired. Please log in again."}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"success": False, "message": "Invalid token."}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"success": False, "message": "Authorization token is missing."}), 401
    
    # ── Blueprints ───────────────────────────────────────────────────
    app.register_blueprint(auth_bp)
    app.register_blueprint(courses_bp)
    app.register_blueprint(callbacks_bp)
    app.register_blueprint(students_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(reviews_bp)


    # ── Health check ─────────────────────────────────────────────────
    @app.get("/api/health")
    def health():
        return jsonify({"status": "ok", "service": "Skill_Zone API"})

    # ── 404 / 405 handlers ───────────────────────────────────────────
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Endpoint not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"success": False, "message": "Method not allowed."}), 405

    @app.errorhandler(500)
    def internal_error(e):
        app.logger.error(f"Internal error: {e}")
        return jsonify({"success": False, "message": "Internal server error."}), 500

    return app


if __name__ == "__main__":
    app = create_app()
    port = app.config.get("PORT", 8080)
    app.run(host="0.0.0.0", port=port, debug=True)