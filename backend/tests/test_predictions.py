"""
INUA Mentorship Platform: Prediction Integration Tests (FR-05, FR-06, IR-02)
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Tests:
  - POST /predictions with session_id (evaluates, explains with TreeSHAP, stores in DB)
  - POST /predictions with raw session_features
  - GET /predictions (role-based listing)
  - GET /predictions/{prediction_id} (retrieval with access control)
  - GET /sessions/{session_id}/prediction (session link check)
  - Automatic prediction trigger upon feedback submission

Run from project root:
    python backend/tests/test_predictions.py
"""

import sys
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
BACKEND = ROOT / "backend"
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from fastapi.testclient import TestClient
from app.main import app
from db.session import get_db
from models.database import MentorshipSession, Mentee, Mentor, User, Feedback, PredictionRecord

client = TestClient(app)

PASS = "[PASS]"
FAIL = "[FAIL]"

MENTEE_EMAIL  = "michelle.mutinda@strathmore.edu"
MENTOR_EMAIL  = "david.mwangi@safaricom.co.ke"
ADMIN_EMAIL   = "admin@inua.strathmore.edu"
PASSWORD      = "Password123!"

results = {"passed": 0, "failed": 0}


def run(label: str, ok: bool, detail: str = ""):
    if ok:
        results["passed"] += 1
        print(f"  {PASS} {label}")
    else:
        results["failed"] += 1
        print(f"  {FAIL} {label}" + (f" -- {detail}" if detail else ""))


def login(email: str) -> str:
    r = client.post("/api/v1/auth/login", json={"email": email, "password": PASSWORD})
    assert r.status_code == 200, f"Login failed for {email}: {r.text}"
    return r.json()["access_token"]


def auth(token: str):
    return {"Authorization": f"Bearer {token}"}


print("\n[test_predictions.py] INUA - Prediction Pipeline Tests (FR-05, FR-06, IR-02)")
print("=" * 65)

# 1. Setup tokens
print("\n>> Setup: Authenticate test personas")
mentee_token = login(MENTEE_EMAIL)
mentor_token = login(MENTOR_EMAIL)
admin_token  = login(ADMIN_EMAIL)
run("Mentee token acquired", bool(mentee_token))
run("Mentor token acquired", bool(mentor_token))
run("Admin token acquired",  bool(admin_token))

# 2. Prepare test session in DB
print("\n>> Setup: Prepare completed test session")
db = next(get_db())
try:
    mentee_user = db.query(User).filter(User.email == MENTEE_EMAIL).first()
    mentee_obj = db.query(Mentee).filter(Mentee.user_id == mentee_user.user_id).first()

    mentor_user = db.query(User).filter(User.email == MENTOR_EMAIL).first()
    mentor_obj = db.query(Mentor).filter(Mentor.user_id == mentor_user.user_id).first()

    test_session = MentorshipSession(
        mentor_id=mentor_obj.mentor_id,
        mentee_id=mentee_obj.mentee_id,
        session_date=datetime.now(timezone.utc) - timedelta(days=1),
        duration=60,
        session_type="Technical Coaching",
        meeting_platform="Teams",
        interaction_frequency=5,
        goal_category="Technical Skills",
        career_support_score=4.5,
        psychosocial_score=4.0,
        status="Completed",
    )
    db.add(test_session)
    db.commit()
    db.refresh(test_session)
    test_session_id = test_session.session_id

    # Add feedback to this session
    fb = Feedback(
        session_id=test_session_id,
        communication_score=4.8,
        goal_progress=4.5,
        confidence_growth=4.6,
        overall_rating=5.0,
        comments="Superb session on distributed systems.",
    )
    db.add(fb)
    db.commit()
finally:
    db.close()

run("Created completed test session with feedback", test_session_id is not None)


# 3. Input Validation
print("\n>> Input Validation")

# Empty payload -> 422
r = client.post("/api/v1/predictions", json={}, headers=auth(mentee_token))
run("POST /predictions with empty body returns 422", r.status_code == 422, r.text[:120])

# Non-existent session_id -> 404
r = client.post("/api/v1/predictions", json={"session_id": 99999}, headers=auth(mentee_token))
run("POST /predictions with non-existent session_id returns 404", r.status_code == 404, r.text[:120])


# 4. POST /predictions with session_id
print("\n>> Session Prediction & Persistence (FR-05, FR-06, IR-02)")

r = client.post(
    "/api/v1/predictions",
    json={"session_id": test_session_id, "model_name": "XGBoost"},
    headers=auth(mentee_token),
)
run("POST /predictions returns 201 Created", r.status_code == 201, r.text[:120])

pred_id = None
if r.status_code == 201:
    body = r.json()
    pred_id = body.get("prediction_id")
    run("Response includes prediction_id", pred_id is not None)
    run("Prediction binary label is 0 or 1", body.get("prediction") in (0, 1))
    run("Status is Effective or Ineffective", "Effective" in body.get("status", ""))
    run("Effectiveness probability is valid float", 0.0 <= body.get("effectiveness_probability", -1) <= 1.0)
    run("Model used matches request", body.get("model_used") == "XGBoost")
    run("Recommendation text is generated", len(body.get("recommendation", "")) > 10)
    run("Feature contributions (TreeSHAP) included", len(body.get("feature_contributions", [])) > 0)
    if body.get("feature_contributions"):
        first_feat = body["feature_contributions"][0]
        run("Feature contribution has 'feature' key", "feature" in first_feat)
        run("Feature contribution has 'contribution' key", "contribution" in first_feat)

# Verify record actually saved in database
db = next(get_db())
try:
    record = db.query(PredictionRecord).filter(PredictionRecord.session_id == test_session_id).first()
    run("PredictionRecord persisted in database table", record is not None)
    if record:
        run("Stored model_version starts with XGBoost", record.model_version.startswith("XGBoost"))
finally:
    db.close()


# 5. Ad-Hoc Prediction with raw session_features
print("\n>> Direct Feature Prediction (Stateless)")

raw_features = {
    "career_stage": "Year4",
    "field_of_study": "Computer Science",
    "career_interest": "Software Engineering",
    "prior_sessions": 4,
    "mentor_experience_years": 8,
    "mentor_industry": "Technology",
    "mentor_specialization": "Backend Engineering",
    "mentor_availability": "High",
    "session_type": "Technical Coaching",
    "session_duration_minutes": 60,
    "attendance_status": "Attended",
    "meeting_platform": "Teams",
    "goal_category": "Technical Skills",
    "career_support_score": 5,
    "psychosocial_support_score": 4,
    "communication_quality": 5,
    "goal_progress_score": 4,
    "confidence_growth_score": 5,
    "mentor_responsiveness_score": 5,
}

r = client.post(
    "/api/v1/predictions",
    json={"session_features": raw_features, "model_name": "Random Forest"},
    headers=auth(mentee_token),
)
run("POST /predictions with raw features returns 201", r.status_code == 201, r.text[:120])
if r.status_code == 201:
    body = r.json()
    run("Ad-hoc prediction uses Random Forest", body.get("model_used") == "Random Forest")
    run("Ad-hoc prediction returns binary score", body.get("prediction") in (0, 1))


# 6. GET /predictions endpoints
print("\n>> Stored Prediction Retrieval")

if pred_id:
    # GET /predictions/{id}
    r = client.get(f"/api/v1/predictions/{pred_id}", headers=auth(mentee_token))
    run(f"GET /predictions/{pred_id} returns 200 for mentee", r.status_code == 200, r.text[:120])

    r = client.get(f"/api/v1/predictions/{pred_id}", headers=auth(admin_token))
    run(f"GET /predictions/{pred_id} returns 200 for admin", r.status_code == 200, r.text[:120])

# GET /sessions/{session_id}/prediction
r = client.get(f"/api/v1/sessions/{test_session_id}/prediction", headers=auth(mentee_token))
run(f"GET /sessions/{test_session_id}/prediction returns 200", r.status_code == 200, r.text[:120])

r = client.get(f"/api/v1/sessions/{test_session_id}/prediction", headers=auth(mentor_token))
run(f"GET /sessions/{test_session_id}/prediction returns 200 for assigned mentor", r.status_code == 200)

r = client.get("/api/v1/sessions/99999/prediction", headers=auth(mentee_token))
run("GET prediction for non-existent session returns 404", r.status_code == 404)

# GET /predictions listing
r = client.get("/api/v1/predictions", headers=auth(mentee_token))
run("GET /predictions returns 200 for mentee", r.status_code == 200)
if r.status_code == 200:
    run("GET /predictions returns a list", isinstance(r.json(), list))

r = client.get("/api/v1/predictions", headers=auth(admin_token))
run("GET /predictions returns 200 for admin", r.status_code == 200)

# Unauthenticated checks
r = client.get(f"/api/v1/predictions/{pred_id}" if pred_id else "/api/v1/predictions/1")
run("Unauthenticated GET /predictions/{id} rejected", r.status_code in (401, 403))


# 7. Automatic prediction on feedback submission
print("\n>> Auto-Trigger on Feedback Submission (FR-04 -> FR-05 link)")

db = next(get_db())
try:
    mentee_user = db.query(User).filter(User.email == MENTEE_EMAIL).first()
    mentee_obj = db.query(Mentee).filter(Mentee.user_id == mentee_user.user_id).first()

    mentor_user = db.query(User).filter(User.email == MENTOR_EMAIL).first()
    mentor_obj = db.query(Mentor).filter(Mentor.user_id == mentor_user.user_id).first()

    auto_session = MentorshipSession(
        mentor_id=mentor_obj.mentor_id,
        mentee_id=mentee_obj.mentee_id,
        session_date=datetime.now(timezone.utc) - timedelta(days=3),
        duration=60,
        session_type="Career Guidance",
        meeting_platform="Zoom",
        interaction_frequency=2,
        goal_category="Internship",
        status="Completed",
    )
    db.add(auto_session)
    db.commit()
    db.refresh(auto_session)
    auto_session_id = auto_session.session_id
finally:
    db.close()

# Submit feedback for auto_session
fb_payload = {
    "communication_score": 4.0,
    "goal_progress": 4.5,
    "confidence_growth": 4.0,
    "overall_rating": 4.5,
    "comments": "Testing automated ML pipeline evaluation on feedback submission.",
}
r = client.post(
    f"/api/v1/sessions/{auto_session_id}/feedback",
    json=fb_payload,
    headers=auth(mentee_token),
)
run("POST /sessions/{id}/feedback returns 201", r.status_code == 201, r.text[:120])

# Check that prediction was automatically created and stored
r_pred = client.get(f"/api/v1/sessions/{auto_session_id}/prediction", headers=auth(mentee_token))
run("Prediction automatically generated and retrievable via GET", r_pred.status_code == 200, r_pred.text[:120])
if r_pred.status_code == 200:
    run("Auto prediction has probability", "probability" in r_pred.json())
    run("Auto prediction has effectiveness_label", "effectiveness_label" in r_pred.json())


# Summary
total = results["passed"] + results["failed"]
print(f"\n{'=' * 65}")
print(f"  Results: {results['passed']}/{total} passed, {results['failed']} failed")
if results["failed"] == 0:
    print("  [SUCCESS] All prediction pipeline & explanation tests passed!")
else:
    print(f"  [ERROR] {results['failed']} test(s) failed.")
print(f"{'=' * 65}\n")

sys.exit(0 if results["failed"] == 0 else 1)
