"""
Entry point for development and production.
  dev:   python run.py
  prod:  gunicorn "run:app" --bind 0.0.0.0:5000 --workers 4
"""
from app import create_app

app = create_app()

if __name__ == "__main__":
    port = app.config.get("PORT", 8080)
    app.run(host="0.0.0.0", port=port, debug=True)
