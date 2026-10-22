import sys
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure backend root is on sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app
from db.session import SessionLocal, init_db
from db.seed import seed_database
from models.database import User

client = TestClient(app)


def setup_module():
    """Ensure database is initialized and seeded before tests."""
    init_db()
    seed_database(reset=True)


def test_register_mentee_success():
    """Verify new mentee registration creates User, Mentee record, and returns JWT."""
    payload = {
        "name": "Grace Kerubo",
        "email": "grace.kerubo@strathmore.edu",
        "password": "SecurePassword123!",
        "role": "mentee",
        "university": "Strathmore University",
        "career_stage": "Year2",
        "career_interest": "Artificial Intelligence",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201, response.text
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["expires_in"] > 0
    assert data["user"]["email"] == "grace.kerubo@strathmore.edu"
    assert data["user"]["role"] == "mentee"
    assert data["user"]["profile"]["career_stage"] == "Year2"
    assert data["user"]["profile"]["career_interest"] == "Artificial Intelligence"


def test_register_mentor_success():
    """Verify new mentor registration creates User, Mentor record, and returns JWT."""
    payload = {
        "name": "Caleb Kiprono",
        "email": "caleb.kiprono@safari.tech",
        "password": "MentorPass789!",
        "role": "mentor",
        "experience_years": 7.5,
        "industry": "Technology",
        "expertise": "DevOps & Cloud",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["user"]["role"] == "mentor"
    assert data["user"]["profile"]["experience_years"] == 7.5
    assert data["user"]["profile"]["industry"] == "Technology"
    assert data["user"]["profile"]["expertise"] == "DevOps & Cloud"


def test_register_admin_success():
    """Verify administrator registration creates User record and returns JWT."""
    payload = {
        "name": "Operations Lead",
        "email": "ops.lead@inua.strathmore.edu",
        "password": "AdminSecurity456!",
        "role": "administrator",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 201, response.text
    data = response.json()
    assert data["user"]["role"] == "administrator"
    assert data["user"]["profile"] is None


def test_register_duplicate_email_conflict():
    """Verify duplicate email registration is rejected with 409 Conflict."""
    payload = {
        "name": "Duplicate Grace",
        "email": "grace.kerubo@strathmore.edu",
        "password": "SomeOtherPass123!",
        "role": "mentee",
        "career_stage": "Year1",
        "career_interest": "Finance",
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 409
    assert "already exists" in response.json()["detail"]


def test_register_mentee_missing_profile_rejected():
    """Verify mentee registration without required specialization fields returns 422."""
    payload = {
        "name": "Incomplete Mentee",
        "email": "incomplete@strathmore.edu",
        "password": "Password123!",
        "role": "mentee",
        # Missing career_stage and career_interest
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_register_mentor_missing_profile_rejected():
    """Verify mentor registration without required specialization fields returns 422."""
    payload = {
        "name": "Incomplete Mentor",
        "email": "incomplete.mentor@tech.co.ke",
        "password": "Password123!",
        "role": "mentor",
        # Missing experience_years, industry, expertise
    }
    response = client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 422


def test_login_all_three_roles_success():
    """Verify successful login and token issuance for Admin, Mentor, and Mentee."""
    accounts = [
        ("admin@inua.strathmore.edu", "Password123!", "administrator"),
        ("david.mwangi@safaricom.co.ke", "Password123!", "mentor"),
        ("michelle.mutinda@strathmore.edu", "Password123!", "mentee"),
    ]

    for email, password, expected_role in accounts:
        response = client.post(
            "/api/v1/auth/login",
            json={"email": email, "password": password},
        )
        assert response.status_code == 200, f"Login failed for {email}: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert data["user"]["role"] == expected_role
        assert data["user"]["email"] == email


def test_login_invalid_credentials_rejected():
    """Verify invalid password returns 401 Unauthorized."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "michelle.mutinda@strathmore.edu", "password": "WrongPassword999!"},
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]


def test_login_nonexistent_email_rejected():
    """Verify unknown email returns 401 Unauthorized."""
    response = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@doesnotexist.com", "password": "Password123!"},
    )
    assert response.status_code == 401


def test_get_me_authenticated():
    """Verify /api/v1/auth/me returns current user profile when authenticated."""
    # Login to get token
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "michelle.mutinda@strathmore.edu", "password": "Password123!"},
    )
    token = login_resp.json()["access_token"]

    # Call /me with Bearer token
    headers = {"Authorization": f"Bearer {token}"}
    me_resp = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    data = me_resp.json()
    assert data["email"] == "michelle.mutinda@strathmore.edu"
    assert data["role"] == "mentee"
    assert data["profile"]["career_stage"] == "Year4"


def test_get_me_unauthenticated_rejected():
    """Verify /api/v1/auth/me rejects request without Authorization header (401)."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_get_me_invalid_token_rejected():
    """Verify /api/v1/auth/me rejects malformed or fabricated JWT token (401)."""
    headers = {"Authorization": "Bearer invalid.garbage.token"}
    response = client.get("/api/v1/auth/me", headers=headers)
    assert response.status_code == 401


def test_rbac_role_enforcement():
    """Verify role-protected routes reject users with the wrong role (NFR-02)."""
    # 1. Login as Mentee
    mentee_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "michelle.mutinda@strathmore.edu", "password": "Password123!"},
    )
    mentee_headers = {"Authorization": f"Bearer {mentee_resp.json()['access_token']}"}

    # 2. Login as Mentor
    mentor_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "david.mwangi@safaricom.co.ke", "password": "Password123!"},
    )
    mentor_headers = {"Authorization": f"Bearer {mentor_resp.json()['access_token']}"}

    # 3. Login as Administrator
    admin_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@inua.strathmore.edu", "password": "Password123!"},
    )
    admin_headers = {"Authorization": f"Bearer {admin_resp.json()['access_token']}"}

    # Mentee checks
    assert client.get("/api/v1/auth/mentee-only", headers=mentee_headers).status_code == 200
    assert client.get("/api/v1/auth/mentor-only", headers=mentee_headers).status_code == 403
    assert client.get("/api/v1/auth/admin-only", headers=mentee_headers).status_code == 403

    # Mentor checks
    assert client.get("/api/v1/auth/mentor-only", headers=mentor_headers).status_code == 200
    assert client.get("/api/v1/auth/mentee-only", headers=mentor_headers).status_code == 403
    assert client.get("/api/v1/auth/admin-only", headers=mentor_headers).status_code == 403

    # Admin checks
    assert client.get("/api/v1/auth/admin-only", headers=admin_headers).status_code == 200
    assert client.get("/api/v1/auth/mentee-only", headers=admin_headers).status_code == 403
    assert client.get("/api/v1/auth/mentor-only", headers=admin_headers).status_code == 403


def test_password_hashing_security():
    """Verify passwords in the database are stored as salted bcrypt hashes, never plaintext."""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        assert len(users) >= 9
        for user in users:
            # Bcrypt hashes begin with $2a$ or $2b$ and are 60 chars long
            assert user.password_hash.startswith("$2b$") or user.password_hash.startswith("$2a$")
            assert len(user.password_hash) == 60
            assert "Password123!" not in user.password_hash
            assert "SecurePassword123!" not in user.password_hash
    finally:
        db.close()


if __name__ == "__main__":
    print("[TEST_AUTH] Executing Authentication & RBAC Test Suite...")
    setup_module()
    test_register_mentee_success()
    print("  [PASS] test_register_mentee_success")
    test_register_mentor_success()
    print("  [PASS] test_register_mentor_success")
    test_register_admin_success()
    print("  [PASS] test_register_admin_success")
    test_register_duplicate_email_conflict()
    print("  [PASS] test_register_duplicate_email_conflict")
    test_register_mentee_missing_profile_rejected()
    print("  [PASS] test_register_mentee_missing_profile_rejected")
    test_register_mentor_missing_profile_rejected()
    print("  [PASS] test_register_mentor_missing_profile_rejected")
    test_login_all_three_roles_success()
    print("  [PASS] test_login_all_three_roles_success")
    test_login_invalid_credentials_rejected()
    print("  [PASS] test_login_invalid_credentials_rejected")
    test_login_nonexistent_email_rejected()
    print("  [PASS] test_login_nonexistent_email_rejected")
    test_get_me_authenticated()
    print("  [PASS] test_get_me_authenticated")
    test_get_me_unauthenticated_rejected()
    print("  [PASS] test_get_me_unauthenticated_rejected")
    test_get_me_invalid_token_rejected()
    print("  [PASS] test_get_me_invalid_token_rejected")
    test_rbac_role_enforcement()
    print("  [PASS] test_rbac_role_enforcement (NFR-02)")
    test_password_hashing_security()
    print("  [PASS] test_password_hashing_security")
    print("\n[ALL AUTHENTICATION & RBAC TESTS PASSED SUCCESSFULLY!]")
