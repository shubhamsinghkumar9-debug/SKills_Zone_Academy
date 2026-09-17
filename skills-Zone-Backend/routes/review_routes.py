# ─────────────────────────────────────────────────────────────────────────────
#  reviews_routes.py
#  Mount in your app:  app.register_blueprint(reviews_bp, url_prefix='/api')
# ─────────────────────────────────────────────────────────────────────────────
from flask import Blueprint, request, jsonify, current_app
from extensions import get_db
from utils.email_service import send_review_admin_notification, send_review_thank_you
import datetime

reviews_bp = Blueprint('reviews', __name__,url_prefix='/api')


@reviews_bp.route('/reviews', methods=['POST'])
def submit_review():
    data = request.get_json(silent=True) or {}

    # ── Basic validation ──────────────────────────────────────────────────────
    name    = (data.get('name')    or '').strip()
    email   = (data.get('email')   or '').strip()
    message = (data.get('message') or '').strip()
    rating  = data.get('rating', 0)

    if not name:
        return jsonify(success=False, message='Name is required.'), 400
    if not email:
        return jsonify(success=False, message='Email is required.'), 400
    if not message:
        return jsonify(success=False, message='Review message is required.'), 400
    if not isinstance(rating, int) or not (1 <= rating <= 5):
        return jsonify(success=False, message='Rating must be between 1 and 5.'), 400

    # ── Build document ────────────────────────────────────────────────────────
    review_doc = {
        'name':       name,
        'email':      email,
        'course':     (data.get('course') or 'General / Institute Feedback').strip(),
        'rating':     rating,
        'title':      (data.get('title')   or '').strip(),
        'message':    message[:1000],          # cap at 1000 chars
        'tags':       data.get('tags', [])[:6],
        'status':     'pending',               # pending | approved | rejected
        'created_at': datetime.datetime.utcnow(),
    }

    # ── Persist ───────────────────────────────────────────────────────────────
    result = get_db().reviews.insert_one(review_doc)
    review_doc['_id'] = str(result.inserted_id)

    # ── Send emails (non-blocking — errors are swallowed by _send) ────────────
    admin_email = current_app.config.get('ADMIN_EMAIL', '')
    if admin_email:
        send_review_admin_notification(review_doc, admin_email)

    send_review_thank_you(email, name, review_doc['course'], rating)

    return jsonify(success=True, message='Review submitted successfully.', id=review_doc['_id']), 201


# ─────────────────────────────────────────────────────────────────────────────
#  Admin: list all reviews  GET /api/admin/reviews?status=pending&page=1
# ─────────────────────────────────────────────────────────────────────────────
@reviews_bp.route('/admin/reviews', methods=['GET'])
def admin_list_reviews():
    # Add your @admin_required decorator here
    status   = request.args.get('status', '')          # '' = all
    page     = max(int(request.args.get('page', 1)), 1)
    per_page = int(request.args.get('per_page', 20))

    query = {}
    if status in ('pending', 'approved', 'rejected'):
        query['status'] = status

    total   = get_db().reviews.count_documents(query)
    reviews = list(
        get_db().reviews.find(query)
        .sort('created_at', -1)
        .skip((page - 1) * per_page)
        .limit(per_page)
    )
    for r in reviews:
        r['_id'] = str(r['_id'])
        r['created_at'] = r['created_at'].isoformat() if r.get('created_at') else None

    return jsonify(success=True, data={
        'reviews': reviews,
        'pagination': {'page': page, 'per_page': per_page, 'total': total, 'pages': -(-total // per_page)},
    })


# ─────────────────────────────────────────────────────────────────────────────
#  Admin: approve / reject a review  PATCH /api/admin/reviews/<id>
# ─────────────────────────────────────────────────────────────────────────────
@reviews_bp.route('/admin/reviews/<review_id>', methods=['PATCH'])
def admin_update_review(review_id):
    from bson import ObjectId
    data   = request.get_json(silent=True) or {}
    status = data.get('status', '')

    if status not in ('approved', 'rejected', 'pending'):
        return jsonify(success=False, message='Invalid status.'), 400

    get_db().reviews.update_one(
        {'_id': ObjectId(review_id)},
        {'$set': {'status': status, 'updated_at': datetime.datetime.utcnow()}},
    )
    return jsonify(success=True, message=f'Review {status}.')


# ─────────────────────────────────────────────────────────────────────────────
#  Public: fetch approved reviews  GET /api/reviews?course=...&limit=10
# ─────────────────────────────────────────────────────────────────────────────
@reviews_bp.route('/reviews', methods=['GET'])
def public_reviews():
    course = request.args.get('course', '')
    limit  = min(int(request.args.get('limit', 10)), 50)

    query = {'status': 'approved'}
    if course:
        query['course'] = course

    reviews = list(
       get_db().reviews.find(query, {'email': 0})   # hide email from public
        .sort('created_at', -1)
        .limit(limit)
    )
    for r in reviews:
        r['_id'] = str(r['_id'])
        r['created_at'] = r['created_at'].isoformat() if r.get('created_at') else None

    return jsonify(success=True, data={'reviews': reviews})