"""
INUA Mentorship Platform: End-to-End Core API Workflow Integration Tests
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Requirements: Issue #10 (Milestone 1 - Backend MVP Completion)

Tests:
  1. Mentee & Mentor Registration and Login
  2. Mentor Discovery & Quality Profile Inspection
  3. Session Booking, Conflict Prevention & Lifecycle Transition to Completed
  4. Post-Session Feedback Submission & Duplicate Prevention
  5. Automated Machine Learning Outcome Prediction & TreeSHAP Local Attributions
  6. Mentor Quality Profile Recalculation & Aggregation Update
  7. Administrator Platform Analytics & Strict RBAC Enforcement
  8. Security, Boundary & Unauthorized Access Validations

Run from project root:
    python backend/tests/test_integration_workflows.py
"""

import sys
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
BACKEND = ROOT / "backend"
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from fastapi.testclient import TestClient
from app.main import app
from db.session import get_db
from models.database import User, Mentee, Mentor, MentorshipSession, Feedback, PredictionRecord

client = TestClient(app)

PASS = "[PASS]"
FAIL = "[FAIL]"

ADMIN_EMAIL = "admin@inua.strathmore.edu"
ADMIN_PASSWORD = "Password123!"

results = {"passed": 0, "failed": 0}


def run(label: str, ok: bool, detail: str = ""):
    if ok:
        results["passed"] += 1
        print(f"  {PASS} {label}")
    else:
        results["failed"] += 1
        print(f"  {FAIL} {label}" + (f" -- {detail}" if detail else ""))


def auth(token: str):
    return {"Authorization": f"Bearer {token}"}


print("\n[test_integration_workflows.py] INUA - End-to-End Core API Workflow Integration")
print("=" * 75)

# Generate unique run identifiers to allow repeatable testing
run_id = uuid.uuid4().hex[:6]
mentee_email = f"student_{run_id}@strathmore.edu"
mentor_email = f"lead_{run_id}@safari.tech"
shared_password = "SecurePassword123!"

# ═══════════════════════════════════════════════════════════════════
# Stage 1: Registration and Authentication Workflow
# ═══════════════════════════════════════════════════════════════════
print("\n>> Stage 1: Persona Registration & Authentication Workflow")

# 1. Register new Mentee
mentee_reg_payload = {
    "name": f"Kiprono Koech {run_id}",
    "email": mentee_email,
    "password": shared_password,
    "role": "mentee",
    "university": "Strathmore University",
    "career_stage": "Year3",
    "career_interest": "Software Engineering",
}
r_mentee_reg = client.post("/api/v1/auth/register", json=mentee_reg_payload)
run("Register new Mentee returns 201 Created", r_mentee_reg.status_code == 201, r_mentee_reg.text[:120])
mentee_token = r_mentee_reg.json().get("access_token") if r_mentee_reg.status_code == 201 else None
run("Mentee registration issues JWT access token", bool(mentee_token))

# 2. Register new Mentor
mentor_reg_payload = {
    "name": f"Dr. Angela Waweru {run_id}",
    "email": mentor_email,
    "password": shared_password,
    "role": "mentor",
    "industry": "Technology",
    "expertise": "Cloud Architecture & Scalability",
    "experience_years": 10.0,
}
r_mentor_reg = client.post("/api/v1/auth/register", json=mentor_reg_payload)
run("Register new Mentor returns 201 Created", r_mentor_reg.status_code == 201, r_mentor_reg.text[:120])
mentor_token = r_mentor_reg.json().get("access_token") if r_mentor_reg.status_code == 201 else None
run("Mentor registration issues JWT access token", bool(mentor_token))

# 3. Log in both personas to verify credential round-trip
r_mentee_login = client.post("/api/v1/auth/login", json={"email": mentee_email, "password": shared_password})
run("Mentee login successful", r_mentee_login.status_code == 200)

r_mentor_login = client.post("/api/v1/auth/login", json={"email": mentor_email, "password": shared_password})
run("Mentor login successful", r_mentor_login.status_code == 200)

# 4. Log in Platform Admin
r_admin_login = client.post("/api/v1/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
run("Admin login successful", r_admin_login.status_code == 200)
admin_token = r_admin_login.json().get("access_token") if r_admin_login.status_code == 200 else None

# Grab mentor_id for the newly registered mentor
db = next(get_db())
try:
    mentor_user = db.query(User).filter(User.email == mentor_email).first()
    new_mentor_id = mentor_user.mentor_profile.mentor_id
    mentee_user = db.query(User).filter(User.email == mentee_email).first()
    new_mentee_id = mentee_user.mentee_profile.mentee_id
finally:
    db.close()
run("Resolved new Mentor and Mentee primary keys", new_mentor_id is not None and new_mentee_id is not None)


# ═══════════════════════════════════════════════════════════════════
# Stage 2: Mentor Discovery & Quality Inspection
# ═══════════════════════════════════════════════════════════════════
print("\n>> Stage 2: Mentor Discovery & Quality Profile Inspection")

r_mentors = client.get("/api/v1/mentors", headers=auth(mentee_token))
run("Mentee browses mentor catalog (200 OK)", r_mentors.status_code == 200)

r_quality_init = client.get(f"/api/v1/mentors/{new_mentor_id}/quality", headers=auth(mentee_token))
run("Inspect new mentor quality profile (200 OK)", r_quality_init.status_code == 200)
if r_quality_init.status_code == 200:
    q_data = r_quality_init.json()
    run("New mentor begins with 0 completed sessions", q_data.get("completed_sessions") == 0)


# ═══════════════════════════════════════════════════════════════════
# Stage 3: Session Booking, Conflict Guarding & Status Transitions
# ═══════════════════════════════════════════════════════════════════
print("\n>> Stage 3: Session Booking & Lifecycle Management")

session_start_time = (datetime.now(timezone.utc) + timedelta(days=2)).replace(minute=0, second=0, microsecond=0)
booking_payload = {
    "mentor_id": new_mentor_id,
    "session_date": session_start_time.isoformat(),
    "duration": 60,
    "session_type": "Technical Coaching",
    "meeting_platform": "Teams",
    "goal_category": "Technical Skills",
}

# 1. Book session
r_book = client.post("/api/v1/sessions/book", json=booking_payload, headers=auth(mentee_token))
run("Mentee books session (201 Created)", r_book.status_code == 201, r_book.text[:120])
session_id = r_book.json().get("session_id") if r_book.status_code == 201 else None
run("Session status is initialized as Scheduled", r_book.json().get("status") == "Scheduled")

# 2. Conflict Prevention: Attempt exact same time booking
r_conflict = client.post("/api/v1/sessions/book", json=booking_payload, headers=auth(mentee_token))
run("Duplicate time-slot booking rejected (409 Conflict)", r_conflict.status_code == 409)

# 3. Mentor cannot book session
r_mentor_book = client.post("/api/v1/sessions/book", json=booking_payload, headers=auth(mentor_token))
run("Mentor role prohibited from booking sessions (403 Forbidden)", r_mentor_book.status_code == 403)

# 4. Lifecycle transition: Scheduled -> Completed
r_status = client.patch(
    f"/api/v1/sessions/{session_id}/status",
    json={"status": "Completed"},
    headers=auth(mentee_token),
)
run("Session status transitioned to Completed (200 OK)", r_status.status_code == 200)
if r_status.status_code == 200:
    run("Session reflects Completed status", r_status.json().get("status") == "Completed")


# ═══════════════════════════════════════════════════════════════════
# Stage 4: Post-Session Feedback Submission & Uniqueness
# ═══════════════════════════════════════════════════════════════════
print("\n>> Stage 4: Feedback Submission & Automated ML Pipeline")

feedback_payload = {
    "communication_score": 4.8,
    "goal_progress": 4.5,
    "confidence_growth": 4.7,
    "overall_rating": 5.0,
    "comments": "Outstanding deep-dive on distributed caching and database transactions.",
}

# 1. Submit feedback
r_feedback = client.post(
    f"/api/v1/sessions/{session_id}/feedback",
    json=feedback_payload,
    headers=auth(mentee_token),
)
run("Mentee submits session feedback (201 Created)", r_feedback.status_code == 201, r_feedback.text[:120])

# 2. Duplicate prevention
r_dup_feedback = client.post(
    f"/api/v1/sessions/{session_id}/feedback",
    json=feedback_payload,
    headers=auth(mentee_token),
)
run("Duplicate feedback rejected (409 Conflict)", r_dup_feedback.status_code == 409)

# 3. Retrieve feedback
r_get_fb = client.get(f"/api/v1/sessions/{session_id}/feedback", headers=auth(mentee_token))
run("Retrieve stored feedback (200 OK)", r_get_fb.status_code == 200)


# ═══════════════════════════════════════════════════════════════════
# Stage 5: Prediction Pipeline & Explanation Verification
# ═══════════════════════════════════════════════════════════════════
print("\n>> Stage 5: Prediction Pipeline & TreeSHAP Explanations")

# Verify automated trigger created prediction
r_pred = client.get(f"/api/v1/sessions/{session_id}/prediction", headers=auth(mentee_token))
run("Prediction auto-generated on feedback submission (200 OK)", r_pred.status_code == 200, r_pred.text[:120])
if r_pred.status_code == 200:
    p_data = r_pred.json()
    run("Prediction has effectiveness_label", "effectiveness_label" in p_data)
    run("Prediction probability is between 0.0 and 1.0", 0.0 <= p_data.get("probability", -1) <= 1.0)

# Evaluate via /predictions with TreeSHAP explanations
r_pred_detail = client.post(
    "/api/v1/predictions",
    json={"session_id": session_id, "model_name": "XGBoost"},
    headers=auth(mentee_token),
)
run("POST /predictions generates detailed outcome (201 Created)", r_pred_detail.status_code == 201)
if r_pred_detail.status_code == 201:
    detail_data = r_pred_detail.json()
    run("Model used is XGBoost", detail_data.get("model_used") == "XGBoost")
    run("Actionable recommendation provided", len(detail_data.get("recommendation", "")) > 10)
    run("TreeSHAP feature contributions present", len(detail_data.get("feature_contributions", [])) > 0)


# ═══════════════════════════════════════════════════════════════════
# Stage 6: Mentor Quality Recalculation & Aggregation Update
# ═══════════════════════════════════════════════════════════════════
print("\n>> Stage 6: Mentor Quality Profile Recalculation")

r_quality_updated = client.get(f"/api/v1/mentors/{new_mentor_id}/quality", headers=auth(mentee_token))
run("Retrieve updated mentor quality profile (200 OK)", r_quality_updated.status_code == 200)
if r_quality_updated.status_code == 200:
    uq_data = r_quality_updated.json()
    run("Completed sessions incremented to 1", uq_data.get("completed_sessions") == 1)
    run("Unique mentees count updated to 1", uq_data.get("unique_mentees_count") == 1)
    run("Average overall rating reflects feedback (5.0)", uq_data.get("average_overall_rating") == 5.0)
    run("Aggregate effectiveness score computed (100.0%)", uq_data.get("aggregate_effectiveness_score") == 100.0)
    run("Recent student comment recorded", len(uq_data.get("recent_comments", [])) > 0)


# ═══════════════════════════════════════════════════════════════════
# Stage 7: Administrator Analytics & Strict RBAC Enforcement
# ═══════════════════════════════════════════════════════════════════
print("\n>> Stage 7: Administrator Analytics & Strict RBAC Enforcement")

# Admin access overview -> 200
r_admin_overview = client.get("/api/v1/analytics/admin/overview", headers=auth(admin_token))
run("Administrator accesses platform overview (200 OK)", r_admin_overview.status_code == 200)
if r_admin_overview.status_code == 200:
    ad_data = r_admin_overview.json()
    run("Admin overview reflects total_users count", ad_data.get("total_users", 0) > 0)
    run("Admin overview breaks down users by role", "mentee" in ad_data.get("users_by_role", {}))
    run("Admin overview includes predictions count", ad_data.get("total_predictions", 0) > 0)
    run("Admin overview lists top performing mentors", len(ad_data.get("top_performing_mentors", [])) > 0)

# Unauthorized role access checks -> 403 Forbidden
r_mentee_admin = client.get("/api/v1/analytics/admin/overview", headers=auth(mentee_token))
run("Mentee blocked from admin analytics (403 Forbidden)", r_mentee_admin.status_code == 403)

r_mentor_admin = client.get("/api/v1/analytics/admin/overview", headers=auth(mentor_token))
run("Mentor blocked from admin analytics (403 Forbidden)", r_mentor_admin.status_code == 403)

r_unauth_admin = client.get("/api/v1/analytics/admin/overview")
run("Unauthenticated request rejected (401/403)", r_unauth_admin.status_code in (401, 403))


# ═══════════════════════════════════════════════════════════════════
# Stage 8: Security & Boundary Validations
# ═══════════════════════════════════════════════════════════════════
print("\n>> Stage 8: Security & Boundary Validations")

# Invalid token
r_bad_token = client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid.jwt.token"})
run("Tampered / malformed token rejected (401 Unauthorized)", r_bad_token.status_code == 401)

# Feedback score out of bounds
r_bad_score = client.post(
    f"/api/v1/sessions/{session_id}/feedback",
    json={**feedback_payload, "overall_rating": 8.0},
    headers=auth(mentee_token),
)
run("Invalid Likert rating (> 5.0) rejected (422/409)", r_bad_score.status_code in (422, 409))

# Booking non-existent mentor
r_bad_mentor = client.post(
    "/api/v1/sessions/book",
    json={**booking_payload, "mentor_id": 999999},
    headers=auth(mentee_token),
)
run("Booking non-existent mentor rejected (404 Not Found)", r_bad_mentor.status_code == 404)


# ═══════════════════════════════════════════════════════════════════
# Summary
# ═══════════════════════════════════════════════════════════════════
total = results["passed"] + results["failed"]
print(f"\n{'=' * 75}")
print(f"  Results: {results['passed']}/{total} passed, {results['failed']} failed")
if results["failed"] == 0:
    print("  [SUCCESS] All end-to-end integration workflows verified successfully!")
else:
    print(f"  [ERROR] {results['failed']} workflow test(s) failed.")
print(f"{'=' * 75}\n")

sys.exit(0 if results["failed"] == 0 else 1)
