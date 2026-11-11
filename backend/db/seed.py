"""
INUA Mentorship Platform: Realistic Database Seed Script
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Milestone: Week 1 · Database Infrastructure (feat(db))
Context: Strathmore University Mentorship Ecosystem with Nairobi Tech/Business Partners
"""

import sys
from pathlib import Path
from datetime import datetime, timedelta, timezone

import bcrypt
from sqlalchemy.orm import Session

# Ensure backend root is on sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from db.session import SessionLocal, init_db
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


def hash_password(password: str) -> str:
    """Computes standard salted bcrypt password hash."""
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def seed_database(db: Session = None, reset: bool = True) -> None:
    """Seeds the database idempotently with users, mentors, mentees, sessions, feedback, and predictions."""
    close_at_end = False
    if db is None:
        init_db()
        db = SessionLocal()
        close_at_end = True

    try:
        # Check if already seeded
        existing_users = db.query(User).count()
        if existing_users > 0 and not reset:
            print(f"[SEED] Database already contains {existing_users} users. Skipping.")
            return

        if reset:
            print("[SEED] Resetting existing records...")
            # Delete in cascade order
            db.query(MentorQualityProfile).delete()
            db.query(PredictionRecord).delete()
            db.query(Feedback).delete()
            db.query(Goal).delete()
            db.query(MentorshipSession).delete()
            db.query(Mentor).delete()
            db.query(Mentee).delete()
            db.query(User).delete()
            db.commit()

        print("[SEED] Seeding administrator, mentors, mentees, and historical sessions...")
        common_password_hash = hash_password("Password123!")

        # 1. Administrator
        admin_user = User(
            name="Strathmore System Admin",
            email="admin@inua.strathmore.edu",
            password_hash=common_password_hash,
            role="administrator",
        )
        db.add(admin_user)
        db.flush()

        # 2. Mentors (4 Verified + 2 Pending Admin Credential Approval)
        mentors_data = [
            {
                "name": "Dr. Joseph K. Mutua",
                "email": "joseph.mutua@strathmore.edu",
                "role": "mentor",
                "experience_years": 12.0,
                "industry": "Technology",
                "expertise": "Cloud Architecture & Distributed Systems",
                "is_verified": True,
                "verification_status": "Verified",
                "credential_type": "Academic Degree / Diploma",
                "credential_issuer": "Strathmore University — School of Computing & Engineering Sciences",
                "credential_reference": "SU-SCES-FAC-00419 (PhD Distributed Systems)",
                "credential_document_url": "https://sces.strathmore.edu/faculty/joseph-mutua-credentials",
                "verification_notes": "Verified Senior Faculty appointment & PhD degree certificate.",
            },
            {
                "name": "David Mwangi",
                "email": "david.mwangi@safaricom.co.ke",
                "role": "mentor",
                "experience_years": 8.0,
                "industry": "Technology",
                "expertise": "Backend Engineering & API Design",
                "is_verified": True,
                "verification_status": "Verified",
                "credential_type": "Employer Verification Letter",
                "credential_issuer": "Safaricom PLC — M-PESA Core Platform Engineering",
                "credential_reference": "SAF-HR-VER-2025-8831",
                "credential_document_url": "https://www.safaricom.co.ke/verify/mentor/SAF-HR-VER-2025-8831",
                "verification_notes": "Verified Employer Letter & AWS Certified Solutions Architect Professional badge.",
            },
            {
                "name": "Grace Ochieng",
                "email": "grace.o@microsoft.com",
                "role": "mentor",
                "experience_years": 6.0,
                "industry": "Technology",
                "expertise": "Machine Learning & AI Engineering",
                "is_verified": True,
                "verification_status": "Verified",
                "credential_type": "Professional Certification",
                "credential_issuer": "Microsoft Africa Development Centre (ADC) Nairobi",
                "credential_reference": "MS-ADC-AI-99204",
                "credential_document_url": "https://learn.microsoft.com/en-us/users/graceochieng/credentials/MS-ADC-AI-99204",
                "verification_notes": "Verified Microsoft Senior Applied AI Engineer credential & Azure AI certification.",
            },
            {
                "name": "Sarah Wambui",
                "email": "sarah.wambui@equitybank.co.ke",
                "role": "mentor",
                "experience_years": 7.0,
                "industry": "Finance",
                "expertise": "FinTech Systems & Data Analytics",
                "is_verified": True,
                "verification_status": "Verified",
                "credential_type": "Employer Verification Letter",
                "credential_issuer": "Equity Group Holdings PLC — FinTech & Analytics Division",
                "credential_reference": "EQB-HR-2025-4410",
                "credential_document_url": "https://equitygroupholdings.com/verify/EQB-HR-2025-4410",
                "verification_notes": "Verified Lead Data Analyst employment confirmation letter.",
            },
            {
                "name": "Eng.samuel Ndung'u",
                "email": "samuel.ndungu@apexconsult.co.ke",
                "role": "mentor",
                "experience_years": 9.0,
                "industry": "Consulting",
                "expertise": "Cybersecurity & Enterprise Risk Advisory",
                "is_verified": False,
                "verification_status": "Pending",
                "credential_type": "Consultancy / Firm Registration",
                "credential_issuer": "Business Registration Service (BRS) Kenya & ISACA CISM",
                "credential_reference": "PVT-2021-094812 / ISACA-CISM-77319",
                "credential_document_url": "https://brs.go.ke/verify/PVT-2021-094812",
                "verification_notes": "Submitted Certificate of Incorporation (Apex Cyber Advisory Ltd) and ISACA CISM license; awaiting Administrator review.",
            },
            {
                "name": "Amina Hassan",
                "email": "amina.hassan@kcbbankgroup.com",
                "role": "mentor",
                "experience_years": 5.0,
                "industry": "Finance",
                "expertise": "Product Management & Digital Banking",
                "is_verified": False,
                "verification_status": "Pending",
                "credential_type": "Employer Verification Letter",
                "credential_issuer": "KCB Bank Group — Digital Financial Services",
                "credential_reference": "KCB-DFS-EMP-2026-119",
                "credential_document_url": "https://ke.kcbbankgroup.com/verify/KCB-DFS-EMP-2026-119",
                "verification_notes": "Submitted Employer Confirmation Letter & PMI-ACP Product Management Certificate; awaiting Administrator review.",
            },
        ]

        created_mentors = []
        for m_data in mentors_data:
            user = User(
                name=m_data["name"],
                email=m_data["email"],
                password_hash=common_password_hash,
                role=m_data["role"],
            )
            db.add(user)
            db.flush()

            mentor = Mentor(
                user_id=user.user_id,
                experience_years=m_data["experience_years"],
                industry=m_data["industry"],
                expertise=m_data["expertise"],
                is_verified=m_data["is_verified"],
                verification_status=m_data["verification_status"],
                credential_type=m_data["credential_type"],
                credential_issuer=m_data["credential_issuer"],
                credential_reference=m_data["credential_reference"],
                credential_document_url=m_data["credential_document_url"],
                verification_notes=m_data["verification_notes"],
            )
            db.add(mentor)
            db.flush()
            created_mentors.append(mentor)

        # 3. Mentees
        mentees_data = [
            {
                "name": "Michelle Mutinda",
                "email": "michelle.mutinda@strathmore.edu",
                "role": "mentee",
                "university": "Strathmore University",
                "career_stage": "Year4",
                "career_interest": "Software Engineering",
            },
            {
                "name": "Kevin Kiprop",
                "email": "kevin.kiprop@strathmore.edu",
                "role": "mentee",
                "university": "Strathmore University",
                "career_stage": "Year3",
                "career_interest": "Cloud Infrastructure",
            },
            {
                "name": "Faith Wanjiku",
                "email": "faith.wanjiku@strathmore.edu",
                "role": "mentee",
                "university": "Strathmore University",
                "career_stage": "Year2",
                "career_interest": "Product Management",
            },
            {
                "name": "Brian Otieno",
                "email": "brian.otieno@strathmore.edu",
                "role": "mentee",
                "university": "Strathmore University",
                "career_stage": "Year1",
                "career_interest": "Data Science",
            },
        ]

        created_mentees = []
        for me_data in mentees_data:
            user = User(
                name=me_data["name"],
                email=me_data["email"],
                password_hash=common_password_hash,
                role=me_data["role"],
            )
            db.add(user)
            db.flush()

            mentee = Mentee(
                user_id=user.user_id,
                university=me_data["university"],
                career_stage=me_data["career_stage"],
                career_interest=me_data["career_interest"],
            )
            db.add(mentee)
            db.flush()
            created_mentees.append(mentee)

        # 4. Goals for Mentees
        goals_data = [
            {"mentee_idx": 0, "title": "Finalize Machine Learning Capstone Pipeline (INUA)", "pct": 90},
            {"mentee_idx": 0, "title": "Complete Full-Stack Mock Technical Interview", "pct": 75},
            {"mentee_idx": 0, "title": "Refine LinkedIn & Professional GitHub Portfolio", "pct": 95},
            {"mentee_idx": 1, "title": "Deploy Microservices Homelab with Kubernetes & Helm", "pct": 45},
            {"mentee_idx": 1, "title": "Study for AWS Solutions Architect Associate Certification", "pct": 30},
            {"mentee_idx": 2, "title": "Prepare Product Case Study for Equity FinTech Fellowship", "pct": 60},
            {"mentee_idx": 3, "title": "Complete Python for Data Science Foundation Lab", "pct": 80},
        ]
        for g in goals_data:
            goal = Goal(
                mentee_id=created_mentees[g["mentee_idx"]].mentee_id,
                goal_title=g["title"],
                progress_percentage=g["pct"],
            )
            db.add(goal)
        db.flush()

        # 5. Sessions, Feedback & ML Predictions
        now = datetime.now(timezone.utc)
        
        # Session 1: Michelle & David Mwangi (Completed & Effective)
        s1 = MentorshipSession(
            mentor_id=created_mentors[1].mentor_id,  # David
            mentee_id=created_mentees[0].mentee_id,  # Michelle
            session_date=now - timedelta(days=14),
            duration=65,
            session_type="Interview Preparation",
            meeting_platform="Teams",
            interaction_frequency=3,
            goal_category="Technical Coaching",
            career_support_score=4.5,
            psychosocial_score=4.8,
            status="Completed",
        )
        db.add(s1)
        db.flush()
        f1 = Feedback(
            session_id=s1.session_id,
            communication_score=5.0,
            goal_progress=4.8,
            confidence_growth=4.9,
            overall_rating=5.0,
            comments="Exceptional mock interview! David gave precise critique on backend API idempotency and SQL optimizations.",
        )
        db.add(f1)
        p1 = PredictionRecord(
            session_id=s1.session_id,
            effectiveness_label="Effective",
            probability=0.9982,
            model_version="XGBoost_v1.0",
        )
        db.add(p1)

        # Session 2: Michelle & Grace Ochieng (Completed & Effective)
        s2 = MentorshipSession(
            mentor_id=created_mentors[2].mentor_id,  # Grace
            mentee_id=created_mentees[0].mentee_id,  # Michelle
            session_date=now - timedelta(days=7),
            duration=85,
            session_type="Technical Coaching",
            meeting_platform="Teams",
            interaction_frequency=2,
            goal_category="Machine Learning",
            career_support_score=4.6,
            psychosocial_score=4.7,
            status="Completed",
        )
        db.add(s2)
        db.flush()
        f2 = Feedback(
            session_id=s2.session_id,
            communication_score=5.0,
            goal_progress=4.7,
            confidence_growth=4.6,
            overall_rating=5.0,
            comments="Grace guided me through TreeSHAP explanations and model deployment metrics. Extremely illuminating.",
        )
        db.add(f2)
        p2 = PredictionRecord(
            session_id=s2.session_id,
            effectiveness_label="Effective",
            probability=0.9951,
            model_version="XGBoost_v1.0",
        )
        db.add(p2)

        # Session 3: Kevin & David Mwangi (Completed & Effective)
        s3 = MentorshipSession(
            mentor_id=created_mentors[1].mentor_id,  # David
            mentee_id=created_mentees[1].mentee_id,  # Kevin
            session_date=now - timedelta(days=5),
            duration=70,
            session_type="Technical Coaching",
            meeting_platform="Google Meet",
            interaction_frequency=1,
            goal_category="Cloud Architecture",
            career_support_score=4.0,
            psychosocial_score=3.8,
            status="Completed",
        )
        db.add(s3)
        db.flush()
        f3 = Feedback(
            session_id=s3.session_id,
            communication_score=4.5,
            goal_progress=4.2,
            confidence_growth=4.0,
            overall_rating=4.5,
            comments="Clear architectural advice on container networking and load balancing.",
        )
        db.add(f3)
        p3 = PredictionRecord(
            session_id=s3.session_id,
            effectiveness_label="Effective",
            probability=0.9420,
            model_version="XGBoost_v1.0",
        )
        db.add(p3)

        # Session 4: Faith & Sarah Wambui (Completed & Effective)
        s4 = MentorshipSession(
            mentor_id=created_mentors[3].mentor_id,  # Sarah
            mentee_id=created_mentees[2].mentee_id,  # Faith
            session_date=now - timedelta(days=4),
            duration=50,
            session_type="Career Guidance",
            meeting_platform="Teams",
            interaction_frequency=1,
            goal_category="FinTech Product",
            career_support_score=4.2,
            psychosocial_score=4.3,
            status="Completed",
        )
        db.add(s4)
        db.flush()
        f4 = Feedback(
            session_id=s4.session_id,
            communication_score=4.6,
            goal_progress=4.3,
            confidence_growth=4.5,
            overall_rating=4.7,
            comments="Sarah explained stakeholder alignment and how to break into product management as a business sophomore.",
        )
        db.add(f4)
        p4 = PredictionRecord(
            session_id=s4.session_id,
            effectiveness_label="Effective",
            probability=0.9105,
            model_version="XGBoost_v1.0",
        )
        db.add(p4)

        # Session 5: Brian & Sarah Wambui (Completed with friction - Ineffective intervention detected)
        s5 = MentorshipSession(
            mentor_id=created_mentors[3].mentor_id,  # Sarah
            mentee_id=created_mentees[3].mentee_id,  # Brian
            session_date=now - timedelta(days=2),
            duration=30,
            session_type="Career Guidance",
            meeting_platform="Zoom",
            interaction_frequency=1,
            goal_category="General",
            career_support_score=2.0,
            psychosocial_score=2.1,
            status="Completed",
        )
        db.add(s5)
        db.flush()
        f5 = Feedback(
            session_id=s5.session_id,
            communication_score=2.0,
            goal_progress=1.5,
            confidence_growth=1.8,
            overall_rating=2.0,
            comments="Audio cut out multiple times and the scope of the conversation felt unstructured.",
        )
        db.add(f5)
        p5 = PredictionRecord(
            session_id=s5.session_id,
            effectiveness_label="Ineffective / Needs Intervention",
            probability=0.0820,
            model_version="XGBoost_v1.0",
        )
        db.add(p5)

        # Session 6: Michelle & Grace Ochieng (Upcoming Scheduled)
        s6 = MentorshipSession(
            mentor_id=created_mentors[2].mentor_id,  # Grace
            mentee_id=created_mentees[0].mentee_id,  # Michelle
            session_date=now + timedelta(days=2),
            duration=60,
            session_type="Technical Coaching",
            meeting_platform="Teams",
            interaction_frequency=3,
            goal_category="ML Systems",
            status="Scheduled",
        )
        db.add(s6)

        # Session 7: Kevin & Dr. Joseph K. (Upcoming Scheduled)
        s7 = MentorshipSession(
            mentor_id=created_mentors[0].mentor_id,  # Joseph
            mentee_id=created_mentees[1].mentee_id,  # Kevin
            session_date=now + timedelta(days=5),
            duration=60,
            session_type="Interview Preparation",
            meeting_platform="Teams",
            interaction_frequency=1,
            goal_category="Cloud Systems",
            status="Scheduled",
        )
        db.add(s7)

        # Session 8: Faith & David Mwangi (Pending confirmation)
        s8 = MentorshipSession(
            mentor_id=created_mentors[1].mentor_id,  # David
            mentee_id=created_mentees[2].mentee_id,  # Faith
            session_date=now + timedelta(days=7),
            duration=45,
            session_type="Career Guidance",
            meeting_platform="Teams",
            interaction_frequency=1,
            goal_category="Product & Engineering Collaboration",
            status="Pending",
        )
        db.add(s8)
        db.flush()

        # 6. Mentor Quality Profiles (Aggregates)
        # Dr. Joseph (0 completed sessions yet)
        db.add(MentorQualityProfile(mentor_id=created_mentors[0].mentor_id, aggregate_effectiveness_score=4.80, total_sessions=0))
        # David Mwangi (2 completed sessions, both effective)
        db.add(MentorQualityProfile(mentor_id=created_mentors[1].mentor_id, aggregate_effectiveness_score=4.75, total_sessions=2))
        # Grace Ochieng (1 completed session, effective)
        db.add(MentorQualityProfile(mentor_id=created_mentors[2].mentor_id, aggregate_effectiveness_score=4.85, total_sessions=1))
        # Sarah Wambui (2 completed sessions: 1 effective, 1 ineffective)
        db.add(MentorQualityProfile(mentor_id=created_mentors[3].mentor_id, aggregate_effectiveness_score=3.35, total_sessions=2))

        db.commit()
        print(f"[SEED SUCCESS] Seeded 1 admin, {len(created_mentors)} mentors (4 verified, 2 pending review), "
              f"{len(created_mentees)} mentees, {len(goals_data)} goals, 8 sessions, and 4 mentor quality profiles.")
    except Exception as e:
        db.rollback()
        print(f"[SEED ERROR] Failed to seed database: {e}")
        raise
    finally:
        if close_at_end:
            db.close()


if __name__ == "__main__":
    seed_database(reset=True)
