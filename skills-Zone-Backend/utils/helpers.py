from flask import jsonify
from bson import ObjectId
import datetime


def success(data=None, message="Success", status=200):
    payload = {"success": True, "message": message}
    if data is not None:
        payload["data"] = data
    return jsonify(payload), status


def error(message="An error occurred", status=400, errors=None):
    payload = {"success": False, "message": message}
    if errors:
        payload["errors"] = errors
    return jsonify(payload), status


def serialize(doc):
    """Recursively convert MongoDB document to JSON-safe dict."""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize(d) for d in doc]
    if isinstance(doc, dict):
        out = {}
        for k, v in doc.items():
            if k == "_id":
                out["_id"] = str(v)
            elif isinstance(v, ObjectId):
                out[k] = str(v)
            elif isinstance(v, datetime.datetime):
                out[k] = v.isoformat()
            elif isinstance(v, (dict, list)):
                out[k] = serialize(v)
            else:
                out[k] = v
        return out
    return doc


def paginate(collection, query, page=1, per_page=10, sort_by="created_at", sort_dir=-1):
    """Return paginated results from a MongoDB collection."""
    total = collection.count_documents(query)
    docs = list(
        collection.find(query)
        .sort(sort_by, sort_dir)
        .skip((page - 1) * per_page)
        .limit(per_page)
    )
    return {
        "items": serialize(docs),
        "pagination": {
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page,
        },
    }
