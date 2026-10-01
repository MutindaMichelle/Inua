"""
INUA Mentorship Platform: Automated Database Schema & Relationship Tests
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Milestone: Week 1 · Database Infrastructure (feat(db))
"""

import sys
import os
from pathlib import Path
from datetime import datetime, timezone
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker

# Ensure backend root is on sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from db.session import Base
from models.database import (
    User,
    Mentee,
    Mentor,
    MentorshipSession,
    Goal,
    Feedback,
    PredictionRecord,
    MentorQualityProfile,
)
from db.seed import seed_database, hash_password


def run_tests():
    print("[TEST_DB] Initializing isolated in-memory test database...")
    test_engine = create_engine("sqlite:///:memory:", echo=False)
    Base.metadata.create_all(bind=test_engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

    # 1. Verify all 8 tables are present
    inspector = inspect(test_engine)
    table_names = inspector.get_table_names()
    expected_tables = {
        "users",
        "mentees",
        "mentors",
        "sessions",
        "goals",
        "feedback",
        "predictions",
        "mentor_quality_profiles",
    }
    print(f"[TEST_DB] Discovered tables: {table_names}")
    for tbl in expected_tables:
        assert tbl in table_names, f"Table {tbl} missing from database schema!"
    print("  [PASS] All 8 relational tables generated successfully.")

    # 2. Test seeding on test DB
    session = TestingSessionLocal()
    try:
        seed_database(db=session, reset=False)

        # 3. Verify user counts and role-filtering
        users = session.query(User).all()
        assert len(users) == 9, f"Expected 9 users, found {len(users)}"
        mentees = session.query(Mentee).all()
        assert len(mentees) == 4, f"Expected 4 mentees, found {len(mentees)}"
        mentors = session.query(Mentor).all()
        assert len(mentors) == 4, f"Expected 4 mentors, found {len(mentors)}"
        print("  [PASS] Seeded entities verified (users=9, mentors=4, mentees=4).")

        # 4. Verify Mentee relationships (1:N goals, 1:N sessions, 1:1 user)
        michelle = session.query(Mentee).join(User).filter(User.name == "Michelle Mutinda").first()
        assert michelle is not None
        assert michelle.user.role == "mentee"
        assert len(michelle.goals) >= 3, f"Expected Michelle to have >=3 goals, found {len(michelle.goals)}"
        assert len(michelle.sessions) >= 2, f"Expected Michelle to have >=2 sessions, found {len(michelle.sessions)}"
        print(f"  [PASS] Mentee relationships: Michelle has {len(michelle.goals)} goals and {len(michelle.sessions)} sessions.")

        # 5. Verify Mentor relationships & Quality Profile
        david = session.query(Mentor).join(User).filter(User.name == "David Mwangi").first()
        assert david is not None
        assert david.quality_profile is not None
        assert david.quality_profile.aggregate_effectiveness_score > 4.0
        print(f"  [PASS] Mentor quality profile: David Mwangi aggregate score = {david.quality_profile.aggregate_effectiveness_score}")

        # 6. Verify Session -> Feedback -> Prediction linkage
        completed_sessions = session.query(MentorshipSession).filter(MentorshipSession.status == "Completed").all()
        assert len(completed_sessions) == 5
        for s in completed_sessions:
            assert s.feedback is not None, f"Session {s.session_id} is Completed but missing feedback!"
            assert s.prediction is not None, f"Session {s.session_id} is Completed but missing prediction!"
        print("  [PASS] Completed sessions have bidirectional feedback and prediction records.")

        # 7. Test Cascade Delete behavior
        # Creating a temporary user with a mentee, goal, and session
        temp_user = User(
            name="Temporary Test User",
            email="temp.test@strathmore.edu",
            password_hash=hash_password("Temp123!"),
            role="mentee",
        )
        session.add(temp_user)
        session.flush()

        temp_mentee = Mentee(
            user_id=temp_user.user_id,
            career_stage="Year1",
            career_interest="Cybersecurity",
        )
        session.add(temp_mentee)
        session.flush()

        temp_goal = Goal(
            mentee_id=temp_mentee.mentee_id,
            goal_title="Temp Goal",
            progress_percentage=20,
        )
        session.add(temp_goal)
        session.commit()

        # Delete user and ensure mentee and goal are removed
        temp_user_id = temp_user.user_id
        temp_mentee_id = temp_mentee.mentee_id
        session.delete(temp_user)
        session.commit()

        assert session.query(Mentee).filter_by(mentee_id=temp_mentee_id).first() is None
        assert session.query(Goal).filter_by(mentee_id=temp_mentee_id).first() is None
        print("  [PASS] Cascade delete verification: deleting User automatically cascades to Mentee profile and Goals.")

    finally:
        session.close()

    print("\n[ALL DATABASE SCHEMA & RELATIONSHIP TESTS PASSED!]")


if __name__ == "__main__":
    run_tests()
