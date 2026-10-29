"""
INUA Mentorship Platform: Feedback Endpoints
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Requirements: FR-04 (Feedback Submission), NFR-02 (RBAC), IR-02 (ML Integration)
"""

import sys
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from db.session import get_db
from models.database import User, Feedback
from models.schemas import FeedbackSubmitRequest, FeedbackResponse
from services.auth_service import get_current_user
from services.feedback_service import (
    get_completed_session_for_mentee,
    create_feedback,
    get_feedback_for_session,
)

router = APIRouter(tags=["Feedback"])


def _feedback_to_response(fb: Feedback) -> FeedbackResponse:
    """Helper: converts ORM Feedback to FeedbackResponse schema."""
    return FeedbackResponse(
        feedback_id=fb.feedback_id,
        session_id=fb.session_id,
        communication_score=fb.communication_score,
        goal_progress=fb.goal_progress,
        confidence_growth=fb.confidence_growth,
        overall_rating=fb.overall_rating,
        comments=fb.comments,
        submitted_at=fb.submitted_at.isoformat() if fb.submitted_at else None,
    )


@router.post(
    "/sessions/{session_id}/feedback",
    response_model=FeedbackResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit feedback for a completed mentorship session (FR-04)",
)
def submit_feedback(
    session_id: int,
    payload: FeedbackSubmitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Allows a mentee to submit evaluation ratings and written feedback for a completed session.

    Enforces:
    - User must have the 'mentee' role and be the assigned mentee of this session.
    - Session status must be 'Completed'.
    - Duplicate feedback submissions for the same session are rejected with 409 Conflict.
    - All Likert scores validated in 1.0 - 5.0 range.
    - Automatically triggers ML outcome prediction and saves prediction record (FR-05, IR-02).
    """
    if current_user.role != "mentee":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentees can submit session feedback.",
        )

    session = get_completed_session_for_mentee(db, current_user, session_id)

    feedback = create_feedback(
        db=db,
        session=session,
        communication_score=payload.communication_score,
        goal_progress=payload.goal_progress,
        confidence_growth=payload.confidence_growth,
        overall_rating=payload.overall_rating,
        comments=payload.comments,
    )

    # Automatically trigger and persist ML prediction evaluation (FR-05, FR-06, IR-02)
    try:
        from services.prediction_service import predict_and_store_session
        predict_and_store_session(db=db, session_id=session_id)
    except Exception as e:
        print(f"[PREDICTION] Notice: automatic prediction generation after feedback: {e}")

    return _feedback_to_response(feedback)


@router.get(
    "/sessions/{session_id}/feedback",
    response_model=FeedbackResponse,
    summary="Retrieve feedback for a specific mentorship session",
)
def get_session_feedback(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns feedback for a session.
    Accessible only to the session's mentee, mentor, or platform administrators.
    """
    feedback = get_feedback_for_session(db, current_user, session_id)
    return _feedback_to_response(feedback)
