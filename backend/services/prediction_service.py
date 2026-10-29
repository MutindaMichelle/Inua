"""
INUA Mentorship Platform: Prediction Business Logic & ML Pipeline Integration
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Requirements: FR-05 (Session Outcome Prediction), FR-06 (Explanation Generation), IR-02 (ML Integration)
"""

import sys
from pathlib import Path
from typing import Optional, List, Dict, Any

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from models.database import PredictionRecord, MentorshipSession, Mentee, Mentor, User, Feedback
from models.schemas import MentorshipSessionInput, SessionPredictionResponse
from services.ml_service import MLService

# Canonical category lists matching ML preprocessor vocabulary
ALLOWED_CAREER_STAGES = {"Year1", "Year2", "Year3", "Year4", "Graduate", "EarlyCareer"}
ALLOWED_CAREER_INTERESTS = {
    "Data Science", "Software Engineering", "Cybersecurity",
    "Artificial Intelligence", "Cloud Computing", "UI/UX",
    "Product Management", "Finance", "Entrepreneurship"
}
ALLOWED_SESSION_TYPES = {
    "Career Guidance", "CV Review", "Interview Preparation",
    "Technical Coaching", "Networking"
}
ALLOWED_MEETING_PLATFORMS = {"Teams", "Zoom", "Meet", "Physical"}
ALLOWED_GOAL_CATEGORIES = {
    "Internship", "Portfolio Development", "Technical Skills",
    "Career Transition", "Leadership", "Research"
}


def build_session_features(db: Session, session_id: int) -> MentorshipSessionInput:
    """
    Constructs an authoritative 18-feature input payload from database entities:
    MentorshipSession, Mentee, Mentor, and Feedback.
    """
    session = db.query(MentorshipSession).filter(
        MentorshipSession.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session #{session_id} not found.",
        )

    mentee = session.mentee
    mentor = session.mentor
    feedback = session.feedback

    if not mentee:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Session #{session_id} has no associated Mentee profile.",
        )
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Session #{session_id} has no associated Mentor profile.",
        )

    # 1. Mentee features
    career_stage = mentee.career_stage if mentee.career_stage in ALLOWED_CAREER_STAGES else "Year4"
    career_interest = mentee.career_interest if mentee.career_interest in ALLOWED_CAREER_INTERESTS else "Software Engineering"
    field_of_study = "Business" if "Finance" in career_interest else "Computer Science"

    # 2. Dyad & Encounter history
    prior_sessions = max(0, min(20, (session.interaction_frequency or 1) - 1))

    # 3. Mentor features
    exp_years = max(1, min(40, int(round(mentor.experience_years or 5))))
    industry = mentor.industry or "Technology"
    specialization = mentor.expertise or "Backend Engineering"

    # 4. Session parameters
    s_type = session.session_type if session.session_type in ALLOWED_SESSION_TYPES else "Technical Coaching"
    duration = max(15, min(180, session.duration or 60))
    platform = session.meeting_platform if session.meeting_platform in ALLOWED_MEETING_PLATFORMS else "Teams"
    goal = session.goal_category if session.goal_category in ALLOWED_GOAL_CATEGORIES else "Technical Skills"

    attendance = "Attended"
    if session.status == "Cancelled":
        attendance = "Cancelled"
    elif session.status == "Rescheduled":
        attendance = "Rescheduled"

    # 5. Scores (from feedback if completed, or session defaults)
    if feedback:
        comm_score = max(1, min(5, int(round(feedback.communication_score))))
        goal_score = max(1, min(5, int(round(feedback.goal_progress))))
        conf_score = max(1, min(5, int(round(feedback.confidence_growth))))
        resp_score = max(1, min(5, int(round(feedback.overall_rating))))
    else:
        comm_score = 4
        goal_score = 4
        conf_score = 4
        resp_score = 4

    career_sup = max(1, min(5, int(round(session.career_support_score or 4))))
    psycho_sup = max(1, min(5, int(round(session.psychosocial_score or 4))))

    return MentorshipSessionInput(
        career_stage=career_stage,
        field_of_study=field_of_study,
        career_interest=career_interest,
        prior_sessions=prior_sessions,
        mentor_experience_years=exp_years,
        mentor_industry=industry,
        mentor_specialization=specialization,
        mentor_availability="High",
        session_type=s_type,
        session_duration_minutes=duration,
        attendance_status=attendance,
        meeting_platform=platform,
        goal_category=goal,
        career_support_score=career_sup,
        psychosocial_support_score=psycho_sup,
        communication_quality=comm_score,
        goal_progress_score=goal_score,
        confidence_growth_score=conf_score,
        mentor_responsiveness_score=resp_score,
    )


def predict_and_store_session(
    db: Session,
    session_id: int,
    model_name: str = "XGBoost",
    custom_features: Optional[MentorshipSessionInput] = None,
) -> Dict[str, Any]:
    """
    Evaluates session effectiveness using the ML pipeline and persists the
    resulting outcome in the PostgreSQL/SQLite 'predictions' table (FR-05, FR-06).
    """
    session = db.query(MentorshipSession).filter(
        MentorshipSession.session_id == session_id
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session #{session_id} not found.",
        )

    # Build or use provided features
    features = custom_features or build_session_features(db, session_id)

    # Execute ML inference through MLService singleton
    ml_service = MLService()
    pred_res: SessionPredictionResponse = ml_service.predict_single(features, model_name=model_name)

    # Persist or update PredictionRecord (unique per session_id)
    pred_record = db.query(PredictionRecord).filter(
        PredictionRecord.session_id == session_id
    ).first()

    if not pred_record:
        pred_record = PredictionRecord(
            session_id=session_id,
            effectiveness_label=pred_res.status,
            probability=pred_res.effectiveness_probability,
            model_version=f"{model_name}_v1.0",
        )
        db.add(pred_record)
    else:
        pred_record.effectiveness_label = pred_res.status
        pred_record.probability = pred_res.effectiveness_probability
        pred_record.model_version = f"{model_name}_v1.0"

    db.commit()
    db.refresh(pred_record)

    return {
        "prediction_id": pred_record.prediction_id,
        "session_id": session_id,
        "prediction": pred_res.prediction,
        "status": pred_res.status,
        "effectiveness_probability": pred_res.effectiveness_probability,
        "model_used": pred_res.model_used,
        "recommendation": pred_res.recommendation,
        "risk_factors": pred_res.risk_factors,
        "feature_contributions": pred_res.feature_contributions,
        "predicted_at": pred_record.predicted_at.isoformat() if pred_record.predicted_at else None,
    }


def get_prediction_for_session(
    db: Session,
    session_id: int,
    user: User,
) -> PredictionRecord:
    """
    Retrieves stored prediction for a session with role-based access validation.
    """
    session = db.query(MentorshipSession).filter(
        MentorshipSession.session_id == session_id
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session #{session_id} not found.",
        )

    # RBAC Access control
    if user.role != "administrator":
        if user.role == "mentee":
            mentee = db.query(Mentee).filter(Mentee.user_id == user.user_id).first()
            if not mentee or session.mentee_id != mentee.mentee_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to view predictions for this session.",
                )
        elif user.role == "mentor":
            mentor = db.query(Mentor).filter(Mentor.user_id == user.user_id).first()
            if not mentor or session.mentor_id != mentor.mentor_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to view predictions for this session.",
                )

    pred = db.query(PredictionRecord).filter(PredictionRecord.session_id == session_id).first()
    if not pred:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No prediction record found for Session #{session_id}.",
        )
    return pred


def get_prediction_by_id(
    db: Session,
    prediction_id: int,
    user: User,
) -> PredictionRecord:
    """
    Retrieves prediction record by its primary key with access control.
    """
    pred = db.query(PredictionRecord).filter(
        PredictionRecord.prediction_id == prediction_id
    ).first()
    if not pred:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Prediction #{prediction_id} not found.",
        )

    # Verify access to the parent session
    session = pred.session
    if user.role != "administrator":
        if user.role == "mentee":
            mentee = db.query(Mentee).filter(Mentee.user_id == user.user_id).first()
            if not mentee or session.mentee_id != mentee.mentee_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to view this prediction.",
                )
        elif user.role == "mentor":
            mentor = db.query(Mentor).filter(Mentor.user_id == user.user_id).first()
            if not mentor or session.mentor_id != mentor.mentor_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to view this prediction.",
                )

    return pred
