# Sheryians Backend — Flask + MongoDB API

Full REST API for Sheryians Coding School with JWT auth, email notifications, course management, enrollment, and admin panel.

---

## 🏗 Project Structure

```
sheryians-backend/
├── app.py                    # Flask app factory + entry point
├── config.py                 # Config from .env
├── extensions.py             # MongoDB, JWT, Mail init
├── requirements.txt
├── .env.example              # Copy to .env and fill in
│
├── routes/
│   ├── auth.py               # Register, Login, Refresh, Forgot/Reset password
│   ├── courses.py            # CRUD courses, Enroll, Reviews, Progress
│   ├── callbacks.py          # Callback requests + email
│   ├── students.py           # Student dashboard, admin list
│   └── admin.py              # Admin stats
│
├── utils/
│   ├── helpers.py            # success/error response, serialize, paginate
│   ├── validators.py         # Input validation
│   └── email_service.py      # All email templates (5 types)
│
└── seeds/
    ├── seed_courses.py       # Seed 6 courses into MongoDB
    └── seed_admin.py         # Create default admin user
```

---

## ⚡ Quick Start

### 1. Clone & install

```bash
cd sheryians-backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URI, email credentials, JWT secret
```

### 3. Seed the database

```bash
python seeds/seed_courses.py   # Insert 6 courses
python seeds/seed_admin.py     # Create admin user
```

### 4. Run

```bash
python app.py
# Server starts at http://localhost:5000
```

---

## 📧 Email Setup (Gmail)

1. Enable **2-Step Verification** on your Google account
2. Go to **Google Account → Security → App Passwords**
3. Generate an App Password for "Mail"
4. Use that 16-character password as `MAIL_PASSWORD` in `.env`

---

## 🔑 API Reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | — | Register new student |
| POST | `/api/auth/login` | — | Login → returns tokens |
| POST | `/api/auth/refresh` | Refresh token | Get new access token |
| GET | `/api/auth/me` | Bearer | Get own profile |
| PUT | `/api/auth/me` | Bearer | Update profile / password |
| POST | `/api/auth/forgot-password` | — | Send reset email |
| POST | `/api/auth/reset-password` | — | Reset with token |

### Courses

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/courses/` | — | List all courses (paginated) |
| GET | `/api/courses/:id` | — | Get course detail |
| POST | `/api/courses/` | Admin | Create course |
| PUT | `/api/courses/:id` | Admin | Update course |
| DELETE | `/api/courses/:id` | Admin | Delete course |
| POST | `/api/courses/:id/enroll` | Bearer | Enroll + send email |
| GET | `/api/courses/:id/enrollment` | Bearer | Get my enrollment |
| PUT | `/api/courses/:id/progress` | Bearer | Update progress % |
| GET | `/api/courses/:id/reviews` | — | List reviews |
| POST | `/api/courses/:id/reviews` | Bearer | Add review |

### Callbacks

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/callbacks/` | — | Submit callback request + emails |
| GET | `/api/callbacks/` | Admin | List all callbacks |
| GET | `/api/callbacks/my` | Bearer | My callback requests |
| PUT | `/api/callbacks/:id/status` | Admin | Update status |
| DELETE | `/api/callbacks/:id` | Admin | Delete request |

### Students

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/students/dashboard` | Bearer | Student dashboard |
| GET | `/api/students/enrollments` | Bearer | My enrollments |
| GET | `/api/students/all` | Admin | List all students |
| GET | `/api/students/:id` | Admin | Student detail |
| PUT | `/api/students/:id/role` | Admin | Promote/demote |

### Admin

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/admin/stats` | Admin | Platform stats |

---

## 📬 Email Notifications

| Trigger | Recipients | Template |
|---------|-----------|----------|
| Register | Student | Welcome email with CTA |
| Callback request | Student + Admin | Confirmation + admin alert |
| Enrollment | Student | Confirmation with course link |
| Forgot password | Student | Reset link (30 min expiry) |

---

## 🔒 Security Notes

- Passwords hashed with `bcrypt` (12 rounds)
- JWT access tokens expire in 24h, refresh tokens in 30 days
- Admin endpoints check `role: "admin"` from DB (not just token)
- Password reset tokens expire in 30 minutes
- Email enumeration prevented on forgot-password endpoint
- CORS restricted to frontend origin

---

## 🛠 Default Admin

After seeding:
- **Email:** `admin@sheryians.com`
- **Password:** `admin1234`
- ⚠️ Change before production!

---

## 🔗 Connect Frontend

Update your React app's API calls:

```js
// src/api/index.js
const BASE = 'http://localhost:5000/api'

export const fetchCourses  = () => fetch(`${BASE}/courses/`).then(r => r.json())
export const fetchCourse   = (id) => fetch(`${BASE}/courses/${id}`).then(r => r.json())
export const login         = (data) => fetch(`${BASE}/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json())
export const register      = (data) => fetch(`${BASE}/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json())
export const submitCallback = (data) => fetch(`${BASE}/callbacks/`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) }).then(r => r.json())
export const enroll        = (id, token) => fetch(`${BASE}/courses/${id}/enroll`, { method:'POST', headers:{'Authorization': `Bearer ${token}`} }).then(r => r.json())
```
