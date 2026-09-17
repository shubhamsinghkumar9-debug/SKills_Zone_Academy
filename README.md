# Full Stack


- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Flask + MongoDB + JWT Auth
- **Admin**: Dashboard with live API data

---

## 🚀 Quick Start (Dev)

### Prerequisites
- Node.js 18+
- Python 3.10+
- MongoDB running locally (or Atlas URI)

### One-command start
```bash
./start.sh
```
This will:
1. Install Python deps + Node deps
2. Seed admin user and courses
3. Start backend on :5000 and frontend on :5173

### Manual start

**Backend**
```bash
cd sheryians-backend
python3 -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
python seeds/seed_admin.py        # creates admin user
python seeds/seed_courses.py      # seeds course data
python run.py                     # starts on :5000
```

**Frontend** (in a new terminal)
```bash
cd sheryians-clone
npm install
npm run dev                       # starts on :5173
```

Open → http://localhost:5173

---

## 🔑 Default Credentials

| Role  | Email                   | Password   |
|-------|-------------------------|------------|
| Admin | ********************    | Admin@123  |

> ⚠️ Change the admin password after first login in production!

---

## 🔗 API Endpoints

| Method | Path                        | Auth     | Description             |
|--------|-----------------------------|----------|-------------------------|
| POST   | /api/auth/register          | —        | Register new user       |
| POST   | /api/auth/login             | —        | Login                   |
| GET    | /api/auth/me                | JWT      | Get current user        |
| GET    | /api/courses/               | —        | List all courses        |
| POST   | /api/callbacks/             | optional | Submit callback request |
| GET    | /api/admin/stats            | Admin    | Dashboard stats         |
| GET    | /api/callbacks/             | Admin    | All callback requests   |
| PUT    | /api/callbacks/:id/status   | Admin    | Update callback status  |

Full health check → http://localhost:5001/api/health

---

## 🌐 Deploying to Production

### Backend → Render / Railway

1. Push `sheryians-backend/` to GitHub
2. Set environment variables (from `.env`):
   - `MONGO_URI` — your MongoDB Atlas URI
   - `JWT_SECRET_KEY` — a long random string
   - `SECRET_KEY` — another long random string
   - `FRONTEND_URL` — your frontend domain
   - `MAIL_USERNAME`, `MAIL_PASSWORD` — Gmail App Password
3. Build command: `pip install -r requirements.txt`
4. Start command: `gunicorn "run:app" --bind 0.0.0.0:$PORT --workers 2`

### Frontend → Vercel / Netlify

1. Push `sheryians-clone/` to GitHub
2. Set env variable: `VITE_API_URL=https://your-backend.onrender.com/api`
3. Build command: `npm run build`
4. Output dir: `dist`

---

## 📁 Project Structure

```
sheryians-backend/
├── app.py              Flask app factory
├── run.py              Dev/prod entrypoint
├── config.py           Config from .env
├── extensions.py       MongoDB + JWT + Mail setup
├── routes/
│   ├── auth.py         Register, login, JWT refresh
│   ├── courses.py      Course CRUD + enrollment
│   ├── callbacks.py    Callback requests
│   ├── students.py     Student dashboard
│   └── admin.py        Admin stats
├── seeds/
│   ├── seed_admin.py   Creates admin user
│   └── seed_courses.py Seeds course data
└── utils/
    ├── email_service.py Gmail SMTP emails
    ├── helpers.py      Response helpers
    └── validators.py   Input validation

sheryians-clone/
├── src/
│   ├── api/index.js         All API calls
│   ├── context/
│   │   └── AuthContext.jsx  Auth state (login/logout/session)
│   ├── components/
│   │   ├── Navbar.jsx       Auth-aware navbar
│   │   ├── SignInModal.jsx  Login + Register (real API)
│   │   ├── CallbackModal.jsx Callback form (real API)
│   │   └── AdminDashboard.jsx Live stats from API
│   └── App.jsx              Role-based admin access
└── vite.config.js           /api proxy → :5000
```
