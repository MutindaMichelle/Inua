"""
INUA Mentorship Platform: Session Booking & Status Management Routes
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Requirements: FR-02 (Session Booking), FR-03 (Status Management), NFR-02 (RBAC)
"""

import sys
from pathlib import Path
from typing import Optional

from fastapi import APIRouter, Depends, Query, status as http_status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from db.session import get_db
from models.database import MentorshipSession, Mentee, Mentor, User
from models.schemas import (
    SessionBookingRequest,
    SessionStatusUpdateRequest,
    SessionDetailResponse,
    SessionListResponse,
)
from services.auth_service import get_current_user
from services.session_service import (
    check_session_conflict,
    get_interaction_frequency,
    get_mentee_profile,
    get_mentor_or_404,
    get_session_with_access_check,
    validate_status_transition,
)

router = APIRouter(prefix="/sessions", tags=["Sessions"])


def _session_to_response(s: MentorshipSession) -> SessionDetailResponse:
    """Helper: converts ORM MentorshipSession to SessionDetailResponse."""
    return SessionDetailResponse(
        session_id=s.session_id,
        mentor_id=s.mentor_id,
        mentor_name=s.mentor.user.name if s.mentor and s.mentor.user else None,
        mentee_id=s.mentee_id,
        mentee_name=s.mentee.user.name if s.mentee and s.mentee.user else None,
        session_date=s.session_date.isoformat() if s.session_date else None,
        duration=s.duration,
        session_type=s.session_type,
        meeting_platform=s.meeting_platform,
        interaction_frequency=s.interaction_frequency,
        goal_category=s.goal_category,
        status=s.status,
        has_feedback=s.feedback is not None,
        has_prediction=s.prediction is not None,
    )


@router.post(
    "/book",
    response_model=SessionDetailResponse,
    status_code=201,
    summary="Book a new mentorship session (Mentee only)",
)
def book_session(
    payload: SessionBookingRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Allows an authenticated mentee to book a session with a verified mentor.

    * Verifies the user has a mentee profile.
    * Validates the mentor exists and is verified.
    * Detects and rejects overlapping bookings for both mentor and mentee (`409 Conflict`).
    * Stores the session as `Scheduled` status.
    * Increments the interaction frequency counter for the dyad.
    """
    if current_user.role != "mentee":
        from fastapi import HTTPException
        raise HTTPException(
            status_code=http_status.HTTP_403_FORBIDDEN,
            detail="Only mentees can book sessions.",
        )

    mentee = get_mentee_profile(db, current_user)
    mentor = get_mentor_or_404(db, payload.mentor_id)

    # Conflict detection (FR-02)
    conflict_msg = check_session_conflict(
        db=db,
        mentor_id=mentor.mentor_id,
        mentee_id=mentee.mentee_id,
        start_time=payload.session_date,
        duration_minutes=payload.duration,
    )
    if conflict_msg:
        from fastapi import HTTPException
        raise HTTPException(
            status_code=http_status.HTTP_409_CONFLICT,
            detail=conflict_msg,
        )

    # Calculate dyad interaction frequency
    freq = get_interaction_frequency(db, mentor.mentor_id, mentee.mentee_id)

    # Create and persist session
    new_session = MentorshipSession(
        mentor_id=mentor.mentor_id,
        mentee_id=mentee.mentee_id,
        session_date=payload.session_date,
        duration=payload.duration,
        session_type=payload.session_type,
        meeting_platform=payload.meeting_platform,
        interaction_frequency=freq + 1,
        goal_category=payload.goal_category,
        status="Scheduled",
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)

    return _session_to_response(new_session)


@router.get(
    "",
    response_model=SessionListResponse,
    summary="List sessions for the current authenticated user",
)
def list_sessions(
    status_filter: Optional[str] = Query(
        None,
        alias="status",
        description="Filter by status: Scheduled, Completed, Cancelled, Rescheduled, Pending",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns sessions visible to the current user based on role:
    - **Mentee**: sees only their own sessions.
    - **Mentor**: sees only sessions where they are assigned.
    - **Administrator**: sees all platform sessions.
    Optionally filter by `?status=Scheduled` (or any valid status).
    """
    query = db.query(MentorshipSession)

    if current_user.role == "mentee":
        mentee = db.query(Mentee).filter(Mentee.user_id == current_user.user_id).first()
        if not mentee:
            return SessionListResponse(total=0, sessions=[])
        query = query.filter(MentorshipSession.mentee_id == mentee.mentee_id)

    elif current_user.role == "mentor":
        mentor = db.query(Mentor).filter(Mentor.user_id == current_user.user_id).first()
        if not mentor:
            return SessionListResponse(total=0, sessions=[])
        query = query.filter(MentorshipSession.mentor_id == mentor.mentor_id)

    # Administrator sees all — no filter

    if status_filter:
        query = query.filter(MentorshipSession.status == status_filter)

    sessions = query.order_by(MentorshipSession.session_date.desc()).all()
    return SessionListResponse(
        total=len(sessions),
        sessions=[_session_to_response(s) for s in sessions],
    )


@router.get(
    "/{session_id}",
    response_model=SessionDetailResponse,
    summary="Get details of a specific session",
)
def get_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns the full detail of a single session.
    Access is restricted: mentees and mentors can only view sessions they belong to.
    """
    session = get_session_with_access_check(db, current_user, session_id)
    return _session_to_response(session)


@router.patch(
    "/{session_id}/status",
    response_model=SessionDetailResponse,
    summary="Update a session's lifecycle status (FR-03)",
)
def update_session_status(
    session_id: int,
    payload: SessionStatusUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Updates a session's status through the defined lifecycle transitions (FR-03).

    **Permitted transitions:**
    - `Pending` → `Scheduled`, `Cancelled`
    - `Scheduled` → `Completed`, `Cancelled`, `Rescheduled`
    - `Rescheduled` → `Completed`, `Cancelled`, `Scheduled`
    - `Completed` / `Cancelled` → (terminal — no further transitions)

    When rescheduling, provide `rescheduled_date` in the request body; the overlap
    conflict check runs again against the new proposed time slot.
    """
    session = get_session_with_access_check(db, current_user, session_id)
    validate_status_transition(session.status, payload.status)

    # Re-run conflict check when rescheduling to a new time
    if payload.status == "Rescheduled" and payload.rescheduled_date:
        conflict_msg = check_session_conflict(
            db=db,
            mentor_id=session.mentor_id,
            mentee_id=session.mentee_id,
            start_time=payload.rescheduled_date,
            duration_minutes=session.duration,
            exclude_session_id=session_id,
        )
        if conflict_msg:
            from fastapi import HTTPException
            raise HTTPException(
                status_code=http_status.HTTP_409_CONFLICT,
                detail=conflict_msg,
            )
        session.session_date = payload.rescheduled_date

    session.status = payload.status
    db.commit()
    db.refresh(session)

    return _session_to_response(session)
