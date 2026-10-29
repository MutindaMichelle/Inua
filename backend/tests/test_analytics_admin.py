"""
INUA Mentorship Platform: Mentor Quality & Administrator Analytics Tests (FR-07, FR-08)
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Tests:
  - GET /mentors/{id}/quality (Mentor Quality Profile)
  - GET /mentors/quality-profiles (All Mentor Quality Profiles)
  - GET /analytics/admin/overview (System-wide analytics, RBAC admin restriction)
  - GET /analytics/admin/mentors (Admin mentor audit rankings, RBAC admin restriction)

Run from project root:
    python backend/tests/test_analytics_admin.py
"""

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
BACKEND = ROOT / "backend"
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from fastapi.testclient import TestClient
from app.main import app

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


print("\n[test_analytics_admin.py] INUA - Quality Profiles & Admin Analytics Tests (FR-07, FR-08)")
print("=" * 70)

# 1. Setup tokens
print("\n>> Setup: Authenticate test personas")
mentee_token = login(MENTEE_EMAIL)
mentor_token = login(MENTOR_EMAIL)
admin_token  = login(ADMIN_EMAIL)
run("Mentee token acquired", bool(mentee_token))
run("Mentor token acquired", bool(mentor_token))
run("Admin token acquired",  bool(admin_token))

# Grab first verified mentor's ID
mentors_res = client.get("/api/v1/mentors", headers=auth(mentee_token))
assert mentors_res.status_code == 200, f"Could not list mentors: {mentors_res.text}"
mentor_id = mentors_res.json()[0]["mentor_id"]


# 2. Mentor Quality Profiles (FR-07)
print("\n>> Mentor Quality Profiles (FR-07)")

r = client.get(f"/api/v1/mentors/{mentor_id}/quality", headers=auth(mentee_token))
run(f"GET /mentors/{mentor_id}/quality returns 200 for mentee", r.status_code == 200, r.text[:120])
if r.status_code == 200:
    data = r.json()
    run("Quality profile has mentor_id", data.get("mentor_id") == mentor_id)
    run("Quality profile has completed_sessions", "completed_sessions" in data)
    run("Quality profile has unique_mentees_count", "unique_mentees_count" in data)
    run("Quality profile has average_overall_rating", "average_overall_rating" in data)
    run("Quality profile has aggregate_effectiveness_score", "aggregate_effectiveness_score" in data)
    run("Quality profile has recent_comments list", isinstance(data.get("recent_comments"), list))

# Non-existent mentor quality profile -> 404
r = client.get("/api/v1/mentors/99999/quality", headers=auth(mentee_token))
run("GET /mentors/99999/quality returns 404 Not Found", r.status_code == 404, r.text[:120])

# All mentors quality rankings
r = client.get("/api/v1/mentors/quality-profiles", headers=auth(mentee_token))
run("GET /mentors/quality-profiles returns 200", r.status_code == 200, r.text[:120])
if r.status_code == 200:
    profiles = r.json()
    run("GET /mentors/quality-profiles returns a list", isinstance(profiles, list))
    run("List contains at least 1 mentor profile", len(profiles) > 0)


# 3. Administrator Analytics Overview (FR-08)
print("\n>> Administrator Analytics Overview (FR-08)")

# Admin access -> 200
r = client.get("/api/v1/analytics/admin/overview", headers=auth(admin_token))
run("GET /analytics/admin/overview returns 200 for Administrator", r.status_code == 200, r.text[:120])
if r.status_code == 200:
    overview = r.json()
    run("Overview contains total_users", overview.get("total_users", 0) > 0)
    run("Overview contains users_by_role dictionary", isinstance(overview.get("users_by_role"), dict))
    run("Overview contains total_sessions", "total_sessions" in overview)
    run("Overview contains sessions_by_status dictionary", isinstance(overview.get("sessions_by_status"), dict))
    run("Overview contains total_feedback_entries", "total_feedback_entries" in overview)
    run("Overview contains total_predictions", "total_predictions" in overview)
    run("Overview contains average_platform_satisfaction", "average_platform_satisfaction" in overview)
    run("Overview contains top_performing_mentors list", isinstance(overview.get("top_performing_mentors"), list))


# 4. Role-Based Access Control Guarding (NFR-02)
print("\n>> Role-Based Access Control on Admin Analytics (NFR-02)")

# Mentee attempting admin analytics -> 403 Forbidden
r = client.get("/api/v1/analytics/admin/overview", headers=auth(mentee_token))
run("Mentee accessing /analytics/admin/overview returns 403 Forbidden", r.status_code == 403, r.text[:120])

# Mentor attempting admin analytics -> 403 Forbidden
r = client.get("/api/v1/analytics/admin/overview", headers=auth(mentor_token))
run("Mentor accessing /analytics/admin/overview returns 403 Forbidden", r.status_code == 403, r.text[:120])

# Unauthenticated access -> 401 or 403
r = client.get("/api/v1/analytics/admin/overview")
run("Unauthenticated request to /analytics/admin/overview rejected", r.status_code in (401, 403))

# Admin mentor audit rankings -> 200 for admin, 403 for mentee/mentor
r = client.get("/api/v1/analytics/admin/mentors", headers=auth(admin_token))
run("Admin accessing /analytics/admin/mentors returns 200", r.status_code == 200)

r = client.get("/api/v1/analytics/admin/mentors", headers=auth(mentee_token))
run("Mentee accessing /analytics/admin/mentors returns 403 Forbidden", r.status_code == 403)

r = client.get("/api/v1/analytics/admin/mentors", headers=auth(mentor_token))
run("Mentor accessing /analytics/admin/mentors returns 403 Forbidden", r.status_code == 403)


# Summary
total = results["passed"] + results["failed"]
print(f"\n{'=' * 70}")
print(f"  Results: {results['passed']}/{total} passed, {results['failed']} failed")
if results["failed"] == 0:
    print("  [SUCCESS] All mentor quality & admin analytics tests passed!")
else:
    print(f"  [ERROR] {results['failed']} test(s) failed.")
print(f"{'=' * 70}\n")

sys.exit(0 if results["failed"] == 0 else 1)
