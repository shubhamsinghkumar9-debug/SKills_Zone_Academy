from flask_mail import Message
from extensions import mail
from flask import current_app
import datetime


def _send(subject, recipients, html_body, text_body=None):
    """Low-level send wrapper — swallows errors gracefully in dev."""
    try:
        msg = Message(subject=subject, recipients=recipients, html=html_body, body=text_body or "")
        mail.send(msg)
        return True
    except Exception as e:
        current_app.logger.error(f"Email send failed: {e}")
        return False


# ──────────────────────────────────────────────────────────────────
#  1. Welcome email after registration
# ──────────────────────────────────────────────────────────────────
def send_welcome_email(user_email: str, name: str):
    html = f"""
    <div style="font-family:sans-serif;max-width:560px;margin:auto;background:#0e0e0e;color:#f0f0f0;border-radius:16px;overflow:hidden">
      <div style="background:#9EFF00;padding:24px 32px">
        <h1 style="color:#0A0A0A;margin:0;font-size:24px">Welcome to SKill Zone Academy! 🎉</h1>
      </div>
      <div style="padding:32px">
        <p style="font-size:16px">Hey <strong>{name}</strong>,</p>
        <p style="color:#aaa;line-height:1.7">
          You're now part of India's #1 creative coding community.
          50,000+ students are already building amazing things — and you're next.
        </p>
        <a href="{current_app.config['FRONTEND_URL']}/courses"
           style="display:inline-block;margin-top:20px;background:#9EFF00;color:#0A0A0A;font-weight:700;padding:14px 28px;border-radius:50px;text-decoration:none">
          Browse Courses →
        </a>
        <p style="margin-top:32px;color:#666;font-size:13px">
          If you didn't create this account, ignore this email.
        </p>
      </div>
      <div style="padding:16px 32px;border-top:1px solid #1f1f1f;color:#555;font-size:12px">
        © {datetime.datetime.now().year} SKill Zone Academy
      </div>
    </div>
    """
    return _send(
        subject="Welcome to SKill Zone Academy 🚀",
        recipients=[user_email],
        html_body=html,
    )


# ──────────────────────────────────────────────────────────────────
#  2. Callback request confirmation (to student)
# ──────────────────────────────────────────────────────────────────
def send_callback_confirmation(user_email: str, name: str, request_data: dict):
    scheduled = request_data.get("scheduled_at", "To be confirmed")
    enquiry = request_data.get("enquiry_for", "General")
    html = f"""
    <div style="font-family:sans-serif;max-width:560px;margin:auto;background:#0e0e0e;color:#f0f0f0;border-radius:16px;overflow:hidden">
      <div style="background:#1a1a1a;padding:24px 32px;border-bottom:3px solid #9EFF00">
        <h1 style="color:#fff;margin:0;font-size:22px">📞 Callback Requested</h1>
      </div>
      <div style="padding:32px">
        <p>Hi <strong>{name}</strong>,</p>
        <p style="color:#aaa;line-height:1.7">
          We've received your callback request. Our team will reach you at the scheduled time.
        </p>
        <table style="width:100%;border-collapse:collapse;margin-top:20px">
          <tr style="border-bottom:1px solid #222">
            <td style="padding:10px 0;color:#666;font-size:14px">Enquiry For</td>
            <td style="padding:10px 0;color:#fff;font-size:14px;text-align:right">{enquiry}</td>
          </tr>
          <tr style="border-bottom:1px solid #222">
            <td style="padding:10px 0;color:#666;font-size:14px">Scheduled At</td>
            <td style="padding:10px 0;color:#9EFF00;font-size:14px;text-align:right">{scheduled}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#666;font-size:14px">Notes</td>
            <td style="padding:10px 0;color:#fff;font-size:14px;text-align:right">{request_data.get('notes','—')}</td>
          </tr>
        </table>
        <p style="margin-top:24px;color:#666;font-size:13px">
          Need to reschedule? Reply to this email.
        </p>
      </div>
    </div>
    """
    return _send(
        subject="✅ Callback Request Confirmed — SKill Zone Academy",
        recipients=[user_email],
        html_body=html,
    )


# ──────────────────────────────────────────────────────────────────
#  3. Admin notification for new callback request
# ──────────────────────────────────────────────────────────────────
def send_callback_admin_notification(request_data: dict, admin_email: str):
    html = f"""
    <div style="font-family:sans-serif;max-width:560px;margin:auto;background:#fff;border-radius:12px;border:1px solid #eee">
      <div style="background:#0A0A0A;padding:20px 28px;border-radius:12px 12px 0 0">
        <h2 style="color:#9EFF00;margin:0;font-size:18px">🔔 New Callback Request</h2>
      </div>
      <div style="padding:28px">
        <table style="width:100%;border-collapse:collapse">
          <tr style="border-bottom:1px solid #f0f0f0">
            <td style="padding:10px 0;color:#888;font-size:14px">Name</td>
            <td style="padding:10px 0;font-size:14px;font-weight:600">{request_data.get('name','—')}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0">
            <td style="padding:10px 0;color:#888;font-size:14px">Email</td>
            <td style="padding:10px 0;font-size:14px">{request_data.get('email','—')}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0">
            <td style="padding:10px 0;color:#888;font-size:14px">Phone</td>
            <td style="padding:10px 0;font-size:14px;font-weight:600">{request_data.get('phone','—')}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0">
            <td style="padding:10px 0;color:#888;font-size:14px">Enquiry For</td>
            <td style="padding:10px 0;font-size:14px">{request_data.get('enquiry_for','—')}</td>
          </tr>
          <tr style="border-bottom:1px solid #f0f0f0">
            <td style="padding:10px 0;color:#888;font-size:14px">Scheduled</td>
            <td style="padding:10px 0;font-size:14px;color:#0070f3">{request_data.get('scheduled_at','—')}</td>
          </tr>
          <tr>
            <td style="padding:10px 0;color:#888;font-size:14px">Notes</td>
            <td style="padding:10px 0;font-size:14px">{request_data.get('notes','—')}</td>
          </tr>
        </table>
      </div>
    </div>
    """
    return _send(
        subject=f"[SKill Zone Academy] New Callback — {request_data.get('name','Unknown')}",
        recipients=[admin_email],
        html_body=html,
    )


# ──────────────────────────────────────────────────────────────────
#  4. Enrollment confirmation
# ──────────────────────────────────────────────────────────────────
def send_enrollment_confirmation(user_email: str, name: str, course_title: str, course_id: str):
    html = f"""
    <div style="font-family:sans-serif;max-width:560px;margin:auto;background:#0e0e0e;color:#f0f0f0;border-radius:16px;overflow:hidden">
      <div style="background:#9EFF00;padding:24px 32px">
        <h1 style="color:#0A0A0A;margin:0;font-size:22px">🎓 Enrollment Confirmed!</h1>
      </div>
      <div style="padding:32px">
        <p>Hey <strong>{name}</strong>,</p>
        <p style="color:#aaa;line-height:1.7">
          You're now enrolled in <strong style="color:#fff">{course_title}</strong>.
          Start learning right away — your content is waiting!
        </p>
        <a href="{current_app.config['FRONTEND_URL']}/courses/{course_id}"
           style="display:inline-block;margin-top:20px;background:#9EFF00;color:#0A0A0A;font-weight:700;padding:14px 28px;border-radius:50px;text-decoration:none">
          Start Learning →
        </a>
        <div style="margin-top:28px;padding:16px;background:#1a1a1a;border-radius:10px;border-left:3px solid #9EFF00">
          <p style="margin:0;font-size:13px;color:#aaa">
            💡 <strong style="color:#fff">Pro tip:</strong> Join our Discord community to connect with 
            50,000+ students, get doubts resolved, and find accountability partners.
          </p>
        </div>
      </div>
    </div>
    """
    return _send(
        subject=f"✅ Enrolled in {course_title} — SKill Zone Academy",
        recipients=[user_email],
        html_body=html,
    )


# ──────────────────────────────────────────────────────────────────
#  5. Password reset email
# ──────────────────────────────────────────────────────────────────
def send_password_reset_email(user_email: str, name: str, reset_token: str):
    reset_url = f"{current_app.config['FRONTEND_URL']}/reset-password?token={reset_token}"
    html = f"""
    <div style="font-family:sans-serif;max-width:560px;margin:auto;background:#0e0e0e;color:#f0f0f0;border-radius:16px;overflow:hidden">
      <div style="background:#1a1a1a;padding:24px 32px;border-bottom:3px solid #9EFF00">
        <h1 style="color:#fff;margin:0;font-size:22px">🔐 Reset Your Password</h1>
      </div>
      <div style="padding:32px">
        <p>Hi <strong>{name}</strong>,</p>
        <p style="color:#aaa;line-height:1.7">
          We received a request to reset your SKill Zone Academy password.
          Click below — this link expires in <strong style="color:#fff">30 minutes</strong>.
        </p>
        <a href="{reset_url}"
           style="display:inline-block;margin-top:20px;background:#9EFF00;color:#0A0A0A;font-weight:700;padding:14px 28px;border-radius:50px;text-decoration:none">
          Reset Password →
        </a>
        <p style="margin-top:28px;color:#555;font-size:13px">
          If you didn't request this, you can safely ignore this email.
          Your password won't change unless you click the link above.
        </p>
      </div>
    </div>
    """
    return _send(
        subject="Reset your SKill Zone Academy password 🔐",
        recipients=[user_email],
        html_body=html,
    )


# ──────────────────────────────────────────────────────────────────
#  6. Admin notification — student login alert
#     Call this from your login route after a successful login.
#     Usage:
#       send_login_alert_to_admin(
#           user_data={"name": user.name, "email": user.email,
#                      "role": user.role, "enrolled_count": len(user.enrolled)},
#           admin_email=current_app.config["ADMIN_EMAIL"],
#           ip=request.remote_addr,
#           user_agent=request.headers.get("User-Agent", "—"),
#       )
# ──────────────────────────────────────────────────────────────────
def send_login_alert_to_admin(
    user_data: dict,
    admin_email: str,
    ip: str = "—",
    user_agent: str = "—",
):
    now = datetime.datetime.now().strftime("%d %b %Y, %I:%M %p")
    name          = user_data.get("name", "—")
    email         = user_data.get("email", "—")
    role          = user_data.get("role", "student")
    enrolled      = user_data.get("enrolled_count", 0)
    role_badge_bg = "#7c3aed" if role == "admin" else "#1a2e00"
    role_badge_cl = "#c4b5fd" if role == "admin" else "#9EFF00"

    html = f"""
    <div style="font-family:sans-serif;max-width:580px;margin:auto;background:#0e0e0e;color:#f0f0f0;border-radius:16px;overflow:hidden;border:1px solid #1f1f1f">

      <!-- Header -->
      <div style="background:#0A0A0A;padding:22px 28px;border-bottom:2px solid #9EFF00;display:flex;align-items:center;gap:12px">
        <div style="width:36px;height:36px;background:#9EFF00;border-radius:8px;display:flex;align-items:center;justify-content:center;font-weight:900;color:#0A0A0A;font-size:18px;line-height:36px;text-align:center">S</div>
        <div>
          <h2 style="margin:0;color:#fff;font-size:16px">Student Login Detected</h2>
          <p style="margin:0;color:#666;font-size:12px">SKill Zone Academy · Admin Alert</p>
        </div>
      </div>

      <!-- Body -->
      <div style="padding:28px">

        <!-- Student card -->
        <div style="background:#141414;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #222">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
            <div style="width:44px;height:44px;border-radius:10px;background:#9EFF00;display:flex;align-items:center;justify-content:center;font-weight:800;color:#0A0A0A;font-size:18px">
              {name[0].upper() if name and name != '—' else '?'}
            </div>
            <div>
              <div style="font-size:16px;font-weight:700;color:#fff">{name}</div>
              <div style="font-size:13px;color:#888">{email}</div>
            </div>
            <div style="margin-left:auto;background:{role_badge_bg};color:{role_badge_cl};font-size:11px;font-weight:700;padding:4px 10px;border-radius:20px;text-transform:uppercase;letter-spacing:0.5px">
              {role}
            </div>
          </div>
          <div style="display:flex;gap:12px">
            <div style="flex:1;background:#0e0e0e;border-radius:8px;padding:12px;text-align:center;border:1px solid #1f1f1f">
              <div style="font-size:22px;font-weight:800;color:#9EFF00">{enrolled}</div>
              <div style="font-size:11px;color:#555;margin-top:2px">Courses Enrolled</div>
            </div>
            <div style="flex:1;background:#0e0e0e;border-radius:8px;padding:12px;text-align:center;border:1px solid #1f1f1f">
              <div style="font-size:14px;font-weight:700;color:#fff">{now}</div>
              <div style="font-size:11px;color:#555;margin-top:2px">Login Time</div>
            </div>
          </div>
        </div>

        <!-- Technical details -->
        <div style="background:#141414;border-radius:10px;padding:16px;border:1px solid #222">
          <p style="margin:0 0 12px;font-size:12px;color:#555;text-transform:uppercase;letter-spacing:0.8px;font-weight:600">Session Details</p>
          <table style="width:100%;border-collapse:collapse">
            <tr style="border-bottom:1px solid #1e1e1e">
              <td style="padding:8px 0;color:#666;font-size:13px;width:110px">IP Address</td>
              <td style="padding:8px 0;font-size:13px;color:#d4d4d4;font-family:monospace">{ip}</td>
            </tr>
            <tr>
              <td style="padding:8px 0;color:#666;font-size:13px">User Agent</td>
              <td style="padding:8px 0;font-size:12px;color:#888;word-break:break-all">{user_agent[:120]}{'…' if len(user_agent) > 120 else ''}</td>
            </tr>
          </table>
        </div>

        <!-- Action button -->
        <div style="margin-top:20px;text-align:center">
          <a href="{current_app.config['FRONTEND_URL']}/admin"
             style="display:inline-block;background:#9EFF00;color:#0A0A0A;font-weight:700;padding:12px 28px;border-radius:50px;text-decoration:none;font-size:14px">
            Open Admin Dashboard →
          </a>
        </div>

      </div>

      <!-- Footer -->
      <div style="padding:14px 28px;border-top:1px solid #1a1a1a;color:#444;font-size:11px;text-align:center">
        © {datetime.datetime.now().year} SKill Zone Academy · Automated security alert
      </div>
    </div>
    """
    return _send(
        subject=f"[SKill Zone] 🔑 Login — {name} ({email})",
        recipients=[admin_email],
        html_body=html,
    )


# ──────────────────────────────────────────────────────────────────
#  7. Admin notification — student submits a query / support request
#     Call this from your contact / query submission route.
#     Usage:
#       send_query_to_admin(
#           query_data={"name": ..., "email": ..., "subject": ...,
#                       "message": ..., "course": ..., "phone": ...},
#           admin_email=current_app.config["ADMIN_EMAIL"],
#       )
# ──────────────────────────────────────────────────────────────────
def send_query_to_admin(query_data: dict, admin_email: str):
    now     = datetime.datetime.now().strftime("%d %b %Y, %I:%M %p")
    name    = query_data.get("name", "—")
    email   = query_data.get("email", "—")
    phone   = query_data.get("phone", "—")
    subject = query_data.get("subject", "General Query")
    message = query_data.get("message", "—")
    course  = query_data.get("course", "—")

    html = f"""
    <div style="font-family:sans-serif;max-width:580px;margin:auto;background:#0e0e0e;color:#f0f0f0;border-radius:16px;overflow:hidden;border:1px solid #1f1f1f">

      <!-- Header -->
      <div style="background:#0A0A0A;padding:22px 28px;border-bottom:2px solid #9EFF00">
        <h2 style="margin:0;color:#fff;font-size:17px">💬 New Student Query</h2>
        <p style="margin:4px 0 0;color:#666;font-size:12px">Received on {now}</p>
      </div>

      <div style="padding:28px">

        <!-- From -->
        <div style="background:#141414;border-radius:12px;padding:18px;margin-bottom:18px;border:1px solid #222">
          <p style="margin:0 0 10px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.8px;font-weight:600">From</p>
          <div style="display:flex;align-items:center;gap:12px">
            <div style="width:40px;height:40px;border-radius:10px;background:#9EFF00;display:flex;align-items:center;justify-content:center;font-weight:800;color:#0A0A0A;font-size:16px;flex-shrink:0">
              {name[0].upper() if name and name != '—' else '?'}
            </div>
            <div>
              <div style="font-size:15px;font-weight:700;color:#fff">{name}</div>
              <div style="font-size:13px;color:#888">{email}</div>
              {f'<div style="font-size:13px;color:#666;margin-top:2px">📞 {phone}</div>' if phone and phone != '—' else ''}
            </div>
          </div>
        </div>

        <!-- Subject + Course -->
        <div style="display:flex;gap:12px;margin-bottom:18px">
          <div style="flex:1;background:#141414;border-radius:10px;padding:14px;border:1px solid #222">
            <p style="margin:0 0 4px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.7px">Subject</p>
            <p style="margin:0;font-size:14px;color:#fff;font-weight:600">{subject}</p>
          </div>
          <div style="flex:1;background:#141414;border-radius:10px;padding:14px;border:1px solid #222">
            <p style="margin:0 0 4px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.7px">Related Course</p>
            <p style="margin:0;font-size:14px;color:#9EFF00;font-weight:600">{course}</p>
          </div>
        </div>

        <!-- Message bubble -->
        <div style="background:#141414;border-radius:12px;padding:20px;border:1px solid #222;border-left:3px solid #9EFF00">
          <p style="margin:0 0 10px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.8px;font-weight:600">Message</p>
          <p style="margin:0;font-size:14px;color:#d4d4d4;line-height:1.75;white-space:pre-wrap">{message}</p>
        </div>

        <!-- Quick reply button -->
        <div style="margin-top:22px;text-align:center">
          <a href="mailto:{email}?subject=Re: {subject} — SKill Zone Academy"
             style="display:inline-block;background:#9EFF00;color:#0A0A0A;font-weight:700;padding:12px 28px;border-radius:50px;text-decoration:none;font-size:14px">
            Reply to {name} →
          </a>
        </div>

      </div>

      <!-- Footer -->
      <div style="padding:14px 28px;border-top:1px solid #1a1a1a;color:#444;font-size:11px;text-align:center">
        © {datetime.datetime.now().year} SKill Zone Academy · Query notification
      </div>
    </div>
    """
    return _send(
        subject=f"[SKill Zone] 💬 Query from {name} — {subject}",
        recipients=[admin_email],
        html_body=html,
    )


# ──────────────────────────────────────────────────────────────────
#  8. Student confirmation — query received
#     Send this to the student right after they submit a query.
# ──────────────────────────────────────────────────────────────────
def send_query_confirmation_to_student(user_email: str, name: str, subject: str, message: str):
    html = f"""
    <div style="font-family:sans-serif;max-width:560px;margin:auto;background:#0e0e0e;color:#f0f0f0;border-radius:16px;overflow:hidden">
      <div style="background:#1a1a1a;padding:24px 32px;border-bottom:3px solid #9EFF00">
        <h1 style="color:#fff;margin:0;font-size:21px">💬 We got your message!</h1>
      </div>
      <div style="padding:32px">
        <p>Hi <strong>{name}</strong>,</p>
        <p style="color:#aaa;line-height:1.7">
          Thanks for reaching out. We've received your query and our team will
          get back to you within <strong style="color:#fff">24 hours</strong>.
        </p>

        <!-- Echo back their message -->
        <div style="margin-top:20px;background:#141414;border-radius:12px;padding:18px;border-left:3px solid #9EFF00">
          <p style="margin:0 0 6px;font-size:12px;color:#555;text-transform:uppercase;letter-spacing:0.7px">Your query</p>
          <p style="margin:0 0 4px;font-size:14px;font-weight:600;color:#fff">{subject}</p>
          <p style="margin:0;font-size:13px;color:#888;line-height:1.65;white-space:pre-wrap">{message[:400]}{'…' if len(message) > 400 else ''}</p>
        </div>

        <p style="margin-top:28px;color:#666;font-size:13px">
          In the meantime, you can check our
          <a href="{current_app.config['FRONTEND_URL']}/courses" style="color:#9EFF00;text-decoration:none">courses</a>
          or join our Discord for instant community help.
        </p>
      </div>
      <div style="padding:16px 32px;border-top:1px solid #1f1f1f;color:#555;font-size:12px">
        © {datetime.datetime.now().year} SKill Zone Academy
      </div>
    </div>
    """
    return _send(
        subject=f"✅ We received your query — SKill Zone Academy",
        recipients=[user_email],
        html_body=html,
    )

# ─────────────────────────────────────────────────────────────────────────────
#  ADD THESE TWO FUNCTIONS TO YOUR EXISTING emails.py
# ─────────────────────────────────────────────────────────────────────────────

# ──────────────────────────────────────────────────────────────────
#  9. Admin notification — new student review / feedback
#     Usage:
#       send_review_admin_notification(review_doc, admin_email)
# ──────────────────────────────────────────────────────────────────
def send_review_admin_notification(review: dict, admin_email: str):
    import datetime
    name    = review.get('name',    '—')
    email   = review.get('email',   '—')
    course  = review.get('course',  '—')
    rating  = review.get('rating',  0)
    title   = review.get('title',   '')
    message = review.get('message', '—')
    tags    = review.get('tags',    [])
    now     = datetime.datetime.now().strftime("%d %b %Y, %I:%M %p")

    # Build filled / empty stars
    stars_html = ''.join([
        f'<span style="font-size:20px;color:{"#9EFF00" if i < rating else "#2a2a2a"}">★</span>'
        for i in range(5)
    ])

    # Tags pills
    tags_html = ''.join([
        f'<span style="display:inline-block;margin:2px 4px 2px 0;padding:3px 10px;background:#1a2e00;color:#9EFF00;border:1px solid #9EFF0030;border-radius:20px;font-size:11px;font-weight:600">{t}</span>'
        for t in tags
    ]) if tags else '<span style="color:#444;font-size:12px">—</span>'

    rating_colors = {1: '#ef4444', 2: '#f97316', 3: '#eab308', 4: '#84cc16', 5: '#9EFF00'}
    rating_labels = {1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Great', 5: 'Excellent'}
    r_color = rating_colors.get(rating, '#9EFF00')
    r_label = rating_labels.get(rating, '')

    html = f"""
    <div style="font-family:sans-serif;max-width:580px;margin:auto;background:#0e0e0e;color:#f0f0f0;border-radius:16px;overflow:hidden;border:1px solid #1f1f1f">

      <!-- Header -->
      <div style="background:#0A0A0A;padding:22px 28px;border-bottom:2px solid #9EFF00">
        <h2 style="margin:0;color:#fff;font-size:17px">⭐ New Student Review</h2>
        <p style="margin:4px 0 0;color:#555;font-size:12px">Received on {now}</p>
      </div>

      <div style="padding:28px">

        <!-- Student + Rating card -->
        <div style="background:#141414;border-radius:12px;padding:20px;margin-bottom:18px;border:1px solid #222">
          <div style="display:flex;align-items:center;gap:14px;margin-bottom:16px">
            <div style="width:44px;height:44px;border-radius:10px;background:#9EFF00;display:flex;align-items:center;justify-content:center;font-weight:800;color:#0A0A0A;font-size:18px;flex-shrink:0">
              {name[0].upper() if name and name != '—' else '?'}
            </div>
            <div style="flex:1">
              <div style="font-size:15px;font-weight:700;color:#fff">{name}</div>
              <div style="font-size:13px;color:#666">{email}</div>
            </div>
            <!-- Rating badge -->
            <div style="text-align:center;background:{r_color}18;border:1px solid {r_color}40;border-radius:10px;padding:8px 14px">
              <div style="font-size:22px;font-weight:900;color:{r_color};line-height:1">{rating}/5</div>
              <div style="font-size:11px;color:{r_color};margin-top:2px">{r_label}</div>
            </div>
          </div>
          <!-- Stars row -->
          <div style="margin-bottom:14px">{stars_html}</div>
          <!-- Course -->
          <div style="background:#0e0e0e;border-radius:8px;padding:10px 14px;border:1px solid #1f1f1f">
            <span style="font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.7px">Course / Area · </span>
            <span style="font-size:13px;color:#9EFF00;font-weight:600">{course}</span>
          </div>
        </div>

        <!-- Review content -->
        <div style="background:#141414;border-radius:12px;padding:20px;margin-bottom:18px;border:1px solid #222;border-left:3px solid #9EFF00">
          {f'<p style="margin:0 0 8px;font-size:15px;font-weight:700;color:#fff">{title}</p>' if title else ''}
          <p style="margin:0;font-size:14px;color:#ccc;line-height:1.75;white-space:pre-wrap">{message}</p>
        </div>

        <!-- Tags -->
        <div style="margin-bottom:22px">
          <p style="margin:0 0 8px;font-size:11px;color:#555;text-transform:uppercase;letter-spacing:0.7px">Tags</p>
          {tags_html}
        </div>

        <!-- Action buttons -->
        <div style="display:flex;gap:12px">
          <a href="{current_app.config['FRONTEND_URL']}/admin"
             style="flex:1;display:block;text-align:center;background:#9EFF00;color:#0A0A0A;font-weight:700;padding:12px;border-radius:50px;text-decoration:none;font-size:13px">
            Review in Dashboard →
          </a>
          <a href="mailto:{email}?subject=Re: Your Review on SKill Zone Academy"
             style="flex:1;display:block;text-align:center;background:#141414;color:#fff;font-weight:600;padding:12px;border-radius:50px;text-decoration:none;font-size:13px;border:1px solid #333">
            Reply to Student
          </a>
        </div>

      </div>

      <div style="padding:14px 28px;border-top:1px solid #1a1a1a;color:#444;font-size:11px;text-align:center">
        © {datetime.datetime.now().year} SKill Zone Academy · Review notification
      </div>
    </div>
    """
    return _send(
        subject=f"[SKill Zone] ⭐ New {rating}-Star Review from {name}",
        recipients=[admin_email],
        html_body=html,
    )


# ──────────────────────────────────────────────────────────────────
#  10. Student thank-you after submitting a review
#      Usage:
#        send_review_thank_you(user_email, name, course, rating)
# ──────────────────────────────────────────────────────────────────
def send_review_thank_you(user_email: str, name: str, course: str, rating: int):
    import datetime
    stars_html = ''.join([
        f'<span style="font-size:22px;color:{"#9EFF00" if i < rating else "#1f1f1f"}">★</span>'
        for i in range(5)
    ])

    html = f"""
    <div style="font-family:sans-serif;max-width:560px;margin:auto;background:#0e0e0e;color:#f0f0f0;border-radius:16px;overflow:hidden">
      <div style="background:#9EFF00;padding:24px 32px">
        <h1 style="color:#0A0A0A;margin:0;font-size:22px">Thanks for your review! 🙏</h1>
      </div>
      <div style="padding:32px">
        <p>Hi <strong>{name}</strong>,</p>
        <p style="color:#aaa;line-height:1.7">
          We genuinely appreciate you taking the time to share your experience with
          <strong style="color:#fff"> {course}</strong>.
          Reviews like yours help thousands of students make better decisions.
        </p>

        <!-- Stars echo -->
        <div style="margin:20px 0;padding:16px;background:#141414;border-radius:12px;text-align:center">
          <div>{stars_html}</div>
          <p style="margin:8px 0 0;font-size:13px;color:#666">You gave {rating} out of 5 stars</p>
        </div>

        <p style="color:#aaa;line-height:1.7;font-size:14px">
          Our team reviews every submission. Once approved, your review may be
          featured on the course page to inspire fellow learners.
        </p>

        <a href="{current_app.config['FRONTEND_URL']}/courses"
           style="display:inline-block;margin-top:20px;background:#9EFF00;color:#0A0A0A;font-weight:700;padding:14px 28px;border-radius:50px;text-decoration:none">
          Explore More Courses →
        </a>

        <p style="margin-top:28px;color:#444;font-size:12px">
          Have more feedback? Simply reply to this email — we read every message.
        </p>
      </div>
      <div style="padding:16px 32px;border-top:1px solid #1f1f1f;color:#444;font-size:12px">
        © {datetime.datetime.now().year} SKill Zone Academy
      </div>
    </div>
    """
    return _send(
        subject="Thanks for your review — SKill Zone Academy 🙏",
        recipients=[user_email],
        html_body=html,
    )