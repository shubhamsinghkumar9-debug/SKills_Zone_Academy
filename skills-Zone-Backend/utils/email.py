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