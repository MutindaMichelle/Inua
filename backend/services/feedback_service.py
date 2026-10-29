"""
INUA Mentorship Platform: Feedback Business Logic Service
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Requirements: FR-04 (Feedback Submission), NFR-02 (Role-Based Access Control)
"""

import sys
from pathlib import Path
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from models.database import Feedback, MentorshipSession, Mentee, User


def get_completed_session_for_mentee(
    db: Session,
    user: User,
    session_id: int,
) -> MentorshipSession:
    """
    Retrieves a completed session and validates that:
      - The session exists.
      - The authenticated user is the mentee of this session.
      - The session status is 'Completed' (FR-04 pre-condition).
    Raises appropriate HTTP errors on any violation.
    """
    session = db.query(MentorshipSession).filter(
        MentorshipSession.session_id == session_id
    ).first()

    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session #{session_id} not found.",
        )

    # Verify the caller is the mentee belonging to this session
    mentee = db.query(Mentee).filter(Mentee.user_id == user.user_id).first()
    if not mentee or session.mentee_id != mentee.mentee_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the mentee assigned to this session can submit feedback.",
        )

    # Session must be in 'Completed' status
    if session.status != "Completed":
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Feedback can only be submitted for completed sessions. "
                f"This session is currently '{session.status}'. "
                f"Please mark it as Completed first."
            ),
        )

    return session


def check_duplicate_feedback(db: Session, session_id: int) -> Optional[Feedback]:
    """Returns existing feedback for the session, or None if none exists yet."""
    return db.query(Feedback).filter(Feedback.session_id == session_id).first()


def create_feedback(
    db: Session,
    session: MentorshipSession,
    communication_score: float,
    goal_progress: float,
    confidence_growth: float,
    overall_rating: float,
    comments: Optional[str] = None,
) -> Feedback:
    """
    Persists a new Feedback record matching the DB schema.
    Enforces uniqueness (409 Conflict if feedback already exists).
    """
    existing = check_duplicate_feedback(db, session.session_id)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Feedback has already been submitted for Session #{session.session_id}.",
        )

    feedback = Feedback(
        session_id=session.session_id,
        communication_score=communication_score,
        goal_progress=goal_progress,
        confidence_growth=confidence_growth,
        overall_rating=overall_rating,
        comments=comments,
    )
    db.add(feedback)
    db.commit()
    db.refresh(feedback)
    return feedback


def get_feedback_for_session(
    db: Session,
    user: User,
    session_id: int,
) -> Feedback:
    """
    Retrieves feedback for a session if the current user has access
    (the mentee, the mentor, or an administrator).
    """
    session = db.query(MentorshipSession).filter(
        MentorshipSession.session_id == session_id
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session #{session_id} not found.",
        )

    # Access check: mentee of session, mentor of session, or admin
    if user.role != "administrator":
        if user.role == "mentee":
            mentee = db.query(Mentee).filter(Mentee.user_id == user.user_id).first()
            if not mentee or session.mentee_id != mentee.mentee_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to view feedback for this session.",
                )
        elif user.role == "mentor":
            from models.database import Mentor
            mentor = db.query(Mentor).filter(Mentor.user_id == user.user_id).first()
            if not mentor or session.mentor_id != mentor.mentor_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have permission to view feedback for this session.",
                )

    feedback = db.query(Feedback).filter(Feedback.session_id == session_id).first()
    if not feedback:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No feedback found for Session #{session_id}.",
        )
    return feedback
