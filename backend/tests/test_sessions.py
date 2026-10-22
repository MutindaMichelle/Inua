"""
INUA Mentorship Platform: Session Endpoint Tests
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Tests: FR-02 (Session Booking), FR-03 (Status Management), NFR-02 (RBAC)

Run from project root (with venv active):
    python backend/tests/test_sessions.py
"""

import sys
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
BACKEND = ROOT / "backend"
if str(BACKEND) not in sys.path:
    sys.path.insert(0, str(BACKEND))

from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

PASS = "\033[92m[PASS]\033[0m"
FAIL = "\033[91m[FAIL]\033[0m"

# â”€â”€â”€ Seeded credentials â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
MENTEE_EMAIL    = "michelle.mutinda@strathmore.edu"
MENTOR_EMAIL    = "david.mwangi@safaricom.co.ke"
MENTOR2_EMAIL   = "amina.ochieng@microsoft.com"
ADMIN_EMAIL     = "admin@inua.strathmore.edu"
PASSWORD        = "Password123!"

results = {"passed": 0, "failed": 0}


def run(label: str, ok: bool, detail: str = ""):
    if ok:
        results["passed"] += 1
        print(f"  {PASS} {label}")
    else:
        results["failed"] += 1
        print(f"  {FAIL} {label}" + (f" â€” {detail}" if detail else ""))


def login(email: str) -> str:
    r = client.post("/api/v1/auth/login", json={"email": email, "password": PASSWORD})
    assert r.status_code == 200, f"Login failed for {email}: {r.text}"
    return r.json()["access_token"]


# â”€â”€â”€ Test helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

def auth(token: str):
    return {"Authorization": f"Bearer {token}"}


# â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
print("\n[test_sessions.py] INUA â€” Session & Mentor Endpoint Tests")
print("=" * 62)

# â”€â”€ Obtain tokens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("\nâ–¶ Setup: Authenticate test accounts")
mentee_token  = login(MENTEE_EMAIL)
mentor_token  = login(MENTOR_EMAIL)
admin_token   = login(ADMIN_EMAIL)
run("Mentee login returns token", bool(mentee_token))
run("Mentor login returns token", bool(mentor_token))
run("Admin  login returns token", bool(admin_token))


# â”€â”€ GET /api/v1/mentors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("\nâ–¶ Mentor Directory")

r = client.get("/api/v1/mentors", headers=auth(mentee_token))
run("GET /mentors returns 200 for mentee", r.status_code == 200, r.text[:120])
if r.status_code == 200:
    data = r.json()
    run("GET /mentors returns a list",              isinstance(data, list))
    run("GET /mentors items have mentor_id field",  len(data) > 0 and "mentor_id" in data[0])

r_noauth = client.get("/api/v1/mentors")
run("GET /mentors returns 401 without token", r_noauth.status_code in (401, 403), r_noauth.text[:80])

# Grab first verified mentor's ID for booking tests
mentor_list = client.get("/api/v1/mentors", headers=auth(mentee_token)).json()
MENTOR_ID = mentor_list[0]["mentor_id"] if mentor_list else 1

r = client.get(f"/api/v1/mentors/{MENTOR_ID}", headers=auth(mentee_token))
run(f"GET /mentors/{MENTOR_ID} returns 200", r.status_code == 200, r.text[:120])

r = client.get("/api/v1/mentors/99999", headers=auth(mentee_token))
run("GET /mentors/99999 returns 404", r.status_code == 404, r.text[:80])


# â”€â”€ POST /api/v1/sessions/book â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("\nâ–¶ Session Booking (FR-02)")

booking_payload = {
    "mentor_id":       MENTOR_ID,
    "session_date":    "2027-03-15T10:00:00",
    "duration":        60,
    "session_type":    "Career Guidance",
    "meeting_platform":"Teams",
    "goal_category":   "Internship",
}

r = client.post("/api/v1/sessions/book", json=booking_payload, headers=auth(mentee_token))
run("POST /sessions/book returns 201 for mentee", r.status_code == 201, r.text[:200])

booked_session_id = None
if r.status_code == 201:
    body = r.json()
    booked_session_id = body.get("session_id")
    run("Booked session has session_id",      booked_session_id is not None)
    run("Booked session status is Scheduled", body.get("status") == "Scheduled")
    run("Booked session has correct mentor",  body.get("mentor_id") == MENTOR_ID)

# Mentors cannot book sessions
r = client.post("/api/v1/sessions/book", json=booking_payload, headers=auth(mentor_token))
run("POST /sessions/book returns 403 for mentor", r.status_code == 403, r.text[:80])

# Unauthenticated booking
r = client.post("/api/v1/sessions/book", json=booking_payload)
run("POST /sessions/book returns 401/403 without token", r.status_code in (401, 403))

# Conflict detection: same slot same mentor
r = client.post("/api/v1/sessions/book", json=booking_payload, headers=auth(mentee_token))
run("POST /sessions/book returns 409 on duplicate slot", r.status_code == 409, r.text[:120])

# Booking with non-existent mentor
bad_booking = {**booking_payload, "mentor_id": 99999, "session_date": "2027-04-01T11:00:00"}
r = client.post("/api/v1/sessions/book", json=bad_booking, headers=auth(mentee_token))
run("POST /sessions/book returns 404 for unknown mentor", r.status_code == 404, r.text[:80])


# â”€â”€ GET /api/v1/sessions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("\nâ–¶ Session Listing & Access Control")

r = client.get("/api/v1/sessions", headers=auth(mentee_token))
run("GET /sessions returns 200 for mentee", r.status_code == 200, r.text[:120])
if r.status_code == 200:
    body = r.json()
    run("Session list has 'total' field",    "total" in body)
    run("Session list has 'sessions' field", "sessions" in body)
    run("Mentee sees at least 1 session",    body.get("total", 0) >= 1)

r = client.get("/api/v1/sessions", headers=auth(mentor_token))
run("GET /sessions returns 200 for mentor", r.status_code == 200, r.text[:80])

r = client.get("/api/v1/sessions", headers=auth(admin_token))
run("GET /sessions returns 200 for admin",  r.status_code == 200, r.text[:80])
if r.status_code == 200:
    body = r.json()
    run("Admin sees all sessions (total > 1)", body.get("total", 0) > 1)

# Status filter
r = client.get("/api/v1/sessions?status=Scheduled", headers=auth(mentee_token))
run("GET /sessions?status=Scheduled returns 200", r.status_code == 200, r.text[:80])

r = client.get("/api/v1/sessions")
run("GET /sessions returns 401/403 without token", r.status_code in (401, 403))


# â”€â”€ GET /api/v1/sessions/{id} â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("\nâ–¶ Session Detail & Ownership")

if booked_session_id:
    r = client.get(f"/api/v1/sessions/{booked_session_id}", headers=auth(mentee_token))
    run(f"GET /sessions/{booked_session_id} owner (mentee) gets 200", r.status_code == 200, r.text[:120])

    r = client.get(f"/api/v1/sessions/{booked_session_id}", headers=auth(admin_token))
    run(f"GET /sessions/{booked_session_id} admin gets 200", r.status_code == 200)

r = client.get("/api/v1/sessions/99999", headers=auth(mentee_token))
run("GET /sessions/99999 returns 404", r.status_code == 404, r.text[:80])


# â”€â”€ PATCH /api/v1/sessions/{id}/status â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
print("\nâ–¶ Status Transitions (FR-03)")

if booked_session_id:
    # Scheduled â†’ Completed
    r = client.patch(
        f"/api/v1/sessions/{booked_session_id}/status",
        json={"status": "Completed"},
        headers=auth(admin_token),
    )
    run("PATCH status Scheduledâ†’Completed returns 200", r.status_code == 200, r.text[:120])
    if r.status_code == 200:
        run("Session status is now Completed", r.json().get("status") == "Completed")

    # Completed is terminal â€” no further transitions allowed
    r = client.patch(
        f"/api/v1/sessions/{booked_session_id}/status",
        json={"status": "Cancelled"},
        headers=auth(admin_token),
    )
    run("PATCH Completedâ†’Cancelled returns 422 (terminal)", r.status_code == 422, r.text[:120])


# Book a second session to test reschedule + cancel flows
booking_payload2 = {
    "mentor_id":       MENTOR_ID,
    "session_date":    "2027-05-20T14:00:00",
    "duration":        45,
    "session_type":    "CV Review",
    "meeting_platform":"Zoom",
    "goal_category":   "Portfolio Development",
}
r2 = client.post("/api/v1/sessions/book", json=booking_payload2, headers=auth(mentee_token))
run("Book second session for transition tests", r2.status_code == 201, r2.text[:120])
second_id = r2.json().get("session_id") if r2.status_code == 201 else None

if second_id:
    # Scheduled â†’ Rescheduled (with new date)
    r = client.patch(
        f"/api/v1/sessions/{second_id}/status",
        json={"status": "Rescheduled", "rescheduled_date": "2027-06-01T09:00:00"},
        headers=auth(admin_token),
    )
    run("PATCH Scheduledâ†’Rescheduled returns 200", r.status_code == 200, r.text[:120])
    if r.status_code == 200:
        run("Rescheduled status confirmed", r.json().get("status") == "Rescheduled")

    # Rescheduled â†’ Cancelled
    r = client.patch(
        f"/api/v1/sessions/{second_id}/status",
        json={"status": "Cancelled"},
        headers=auth(admin_token),
    )
    run("PATCH Rescheduledâ†’Cancelled returns 200", r.status_code == 200, r.text[:120])

# Invalid transition
r = client.patch(
    "/api/v1/sessions/1/status",
    json={"status": "Pending"},
    headers=auth(admin_token),
)
run("PATCH invalid transition returns 422", r.status_code == 422, r.text[:80])


# â”€â”€ Summary â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
total = results["passed"] + results["failed"]
print(f"\n{'=' * 62}")
print(f"  Results: {results['passed']}/{total} passed, {results['failed']} failed")
if results["failed"] == 0:
    print(f"  \033[92mâœ“ All tests passed!\033[0m")
else:
    print(f"  \033[91mâœ— {results['failed']} test(s) failed â€” review output above.\033[0m")
print(f"{'=' * 62}\n")

sys.exit(0 if results["failed"] == 0 else 1)

