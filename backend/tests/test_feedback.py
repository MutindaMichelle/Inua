"""
INUA Mentorship Platform: Feedback Endpoint Tests (FR-04)
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Tests: FR-04 (Feedback Submission), NFR-02 (Role-Based Access Control)

Run from project root:
    python backend/tests/test_feedback.py
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
from models.database import MentorshipSession, Mentee, Mentor, User, Feedback

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


print("\n[test_feedback.py] INUA - Feedback Submission Tests (FR-04)")
print("=" * 62)

# 1. Setup tokens
print("\n>> Setup: Authenticate test personas")
mentee_token = login(MENTEE_EMAIL)
mentor_token = login(MENTOR_EMAIL)
admin_token  = login(ADMIN_EMAIL)
run("Mentee token acquired", bool(mentee_token))
run("Mentor token acquired", bool(mentor_token))
run("Admin token acquired",  bool(admin_token))

# 2. Prepare test sessions in DB
print("\n>> Setup: Create test sessions")
db = next(get_db())
try:
    mentee_user = db.query(User).filter(User.email == MENTEE_EMAIL).first()
    mentee_obj = db.query(Mentee).filter(Mentee.user_id == mentee_user.user_id).first() if mentee_user else db.query(Mentee).first()

    mentor_user = db.query(User).filter(User.email == MENTOR_EMAIL).first()
    mentor_obj = db.query(Mentor).filter(Mentor.user_id == mentor_user.user_id).first() if mentor_user else db.query(Mentor).first()
    
    # Create fresh completed test session with David Mwangi and Michelle
    completed_session = MentorshipSession(
        mentor_id=mentor_obj.mentor_id,
        mentee_id=mentee_obj.mentee_id,
        session_date=datetime.now(timezone.utc) - timedelta(days=2),
        duration=60,
        session_type="Technical Coaching",
        meeting_platform="Teams",
        interaction_frequency=4,
        goal_category="Technical Skills",
        status="Completed",
    )
    db.add(completed_session)

    # Create fresh scheduled test session (not completed)
    scheduled_session = MentorshipSession(
        mentor_id=mentor_obj.mentor_id,
        mentee_id=mentee_obj.mentee_id,
        session_date=datetime.now(timezone.utc) + timedelta(days=5),
        duration=45,
        session_type="Career Guidance",
        meeting_platform="Zoom",
        interaction_frequency=5,
        goal_category="Internship",
        status="Scheduled",
    )
    db.add(scheduled_session)
    db.commit()
    db.refresh(completed_session)
    db.refresh(scheduled_session)

    comp_session_id = completed_session.session_id
    sched_session_id = scheduled_session.session_id
finally:
    db.close()

run("Created fresh Completed test session", comp_session_id is not None)
run("Created fresh Scheduled test session", sched_session_id is not None)


# 3. Test feedback submission on Completed session
print("\n>> Feedback Submission (FR-04)")

valid_feedback = {
    "communication_score": 4.5,
    "goal_progress": 4.0,
    "confidence_growth": 4.5,
    "overall_rating": 5.0,
    "comments": "Insightful session on systems architecture and cloud deployment.",
}

# Mentee submits feedback -> 201
r = client.post(
    f"/api/v1/sessions/{comp_session_id}/feedback",
    json=valid_feedback,
    headers=auth(mentee_token),
)
run("POST /sessions/{id}/feedback returns 201 for mentee", r.status_code == 201, r.text[:120])
if r.status_code == 201:
    fb_data = r.json()
    run("Feedback response includes feedback_id", "feedback_id" in fb_data)
    run("Feedback session_id matches", fb_data.get("session_id") == comp_session_id)
    run("Feedback overall_rating is 5.0", fb_data.get("overall_rating") == 5.0)

# Duplicate submission check -> 409 Conflict
r = client.post(
    f"/api/v1/sessions/{comp_session_id}/feedback",
    json=valid_feedback,
    headers=auth(mentee_token),
)
run("Duplicate feedback submission returns 409 Conflict", r.status_code == 409, r.text[:120])


# 4. Test feedback on NON-completed session -> 422
print("\n>> Validation & Pre-condition Enforcement")

r = client.post(
    f"/api/v1/sessions/{sched_session_id}/feedback",
    json=valid_feedback,
    headers=auth(mentee_token),
)
run("Feedback on Scheduled session returns 422", r.status_code == 422, r.text[:120])

# Out of range scores -> 422
bad_scores = {
    "communication_score": 6.5,  # Invalid (> 5.0)
    "goal_progress": 0.5,        # Invalid (< 1.0)
    "confidence_growth": 4.0,
    "overall_rating": 4.0,
}
r = client.post(
    f"/api/v1/sessions/{sched_session_id}/feedback",
    json=bad_scores,
    headers=auth(mentee_token),
)
run("Out of range score (1-5) returns 422", r.status_code == 422, r.text[:120])


# 5. Access control & permissions
print("\n>> Role-Based Access Control (NFR-02)")

# Mentor attempts to submit feedback -> 403
r = client.post(
    f"/api/v1/sessions/{sched_session_id}/feedback",
    json=valid_feedback,
    headers=auth(mentor_token),
)
run("Mentor submitting feedback returns 403 Forbidden", r.status_code == 403, r.text[:120])

# Admin attempts to submit feedback -> 403
r = client.post(
    f"/api/v1/sessions/{sched_session_id}/feedback",
    json=valid_feedback,
    headers=auth(admin_token),
)
run("Admin submitting feedback returns 403 Forbidden", r.status_code == 403, r.text[:120])

# Unauthenticated request -> 401 or 403
r = client.post(f"/api/v1/sessions/{comp_session_id}/feedback", json=valid_feedback)
run("Unauthenticated feedback submission returns 401/403", r.status_code in (401, 403))

# Non-existent session -> 404
r = client.post(
    "/api/v1/sessions/99999/feedback",
    json=valid_feedback,
    headers=auth(mentee_token),
)
run("Feedback on non-existent session returns 404", r.status_code == 404, r.text[:120])


# 6. GET feedback verification
print("\n>> Retrieve Session Feedback")

# Mentee gets feedback
r = client.get(f"/api/v1/sessions/{comp_session_id}/feedback", headers=auth(mentee_token))
run("GET /sessions/{id}/feedback returns 200 for mentee", r.status_code == 200, r.text[:120])

# Assigned mentor gets feedback
r = client.get(f"/api/v1/sessions/{comp_session_id}/feedback", headers=auth(mentor_token))
run("GET /sessions/{id}/feedback returns 200 for assigned mentor", r.status_code == 200, r.text[:120])

# Admin gets feedback
r = client.get(f"/api/v1/sessions/{comp_session_id}/feedback", headers=auth(admin_token))
run("GET /sessions/{id}/feedback returns 200 for admin", r.status_code == 200, r.text[:120])

# Feedback on session without feedback -> 404
r = client.get(f"/api/v1/sessions/{sched_session_id}/feedback", headers=auth(mentee_token))
run("GET feedback for session without feedback returns 404", r.status_code == 404, r.text[:120])


# Summary
total = results["passed"] + results["failed"]
print(f"\n{'=' * 62}")
print(f"  Results: {results['passed']}/{total} passed, {results['failed']} failed")
if results["failed"] == 0:
    print("  [SUCCESS] All feedback endpoint tests passed!")
else:
    print(f"  [ERROR] {results['failed']} test(s) failed.")
print(f"{'=' * 62}\n")

sys.exit(0 if results["failed"] == 0 else 1)
