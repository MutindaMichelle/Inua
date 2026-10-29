"""
INUA Mentorship Platform: Session Business Logic Service
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Requirements: FR-02 (Session Booking), FR-03 (Status Management), NFR-02 (Role Access)
"""

import sys
from pathlib import Path
from datetime import datetime, timedelta, timezone
from typing import Optional, List

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from models.database import MentorshipSession, Mentee, Mentor, User


VALID_TRANSITIONS = {
    "Pending":    ["Scheduled", "Cancelled"],
    "Scheduled":  ["Completed", "Cancelled", "Rescheduled"],
    "Rescheduled":["Completed", "Cancelled", "Scheduled"],
    "Completed":  [],
    "Cancelled":  [],
}


def _session_end(start: datetime, duration_minutes: int) -> datetime:
    """Returns the computed end timestamp for a session."""
    return start + timedelta(minutes=duration_minutes)


def _to_naive_utc(dt) -> "datetime":
    """Normalize datetime to timezone-naive UTC for safe comparison."""
    from datetime import timezone as _tz
    if dt.tzinfo is not None:
        return dt.astimezone(_tz.utc).replace(tzinfo=None)
    return dt


def check_session_conflict(
    db: Session,
    mentor_id: int,
    mentee_id: int,
    start_time: datetime,
    duration_minutes: int,
    exclude_session_id: Optional[int] = None,
) -> Optional[str]:
    """
    Checks for temporal overlap conflicts.
    Returns a human-readable conflict message string, or None if clear.
    Two sessions conflict when their intervals overlap:
        max(start1, start2) < min(end1, end2)
    All datetimes are normalized to naive UTC before comparison to avoid
    TypeError from mixing offset-aware and offset-naive datetimes.
    """
    # Normalize incoming datetime to naive UTC
    start_time = _to_naive_utc(start_time)
    end_time = _session_end(start_time, duration_minutes)
    active_statuses = ("Scheduled", "Pending", "Rescheduled")

    # Query all active sessions for this mentor or mentee
    query = db.query(MentorshipSession).filter(
        MentorshipSession.status.in_(active_statuses),
    )
    if exclude_session_id:
        query = query.filter(MentorshipSession.session_id != exclude_session_id)

    active_sessions = query.filter(
        or_(
            MentorshipSession.mentor_id == mentor_id,
            MentorshipSession.mentee_id == mentee_id,
        )
    ).all()

    for s in active_sessions:
        # Normalize stored datetime to naive UTC for safe comparison
        s_start = _to_naive_utc(s.session_date)
        s_end = _session_end(s_start, s.duration)

        # Overlap condition: max(start1, start2) < min(end1, end2)
        if max(start_time, s_start) < min(end_time, s_end):
            if s.mentor_id == mentor_id:
                return (
                    f"Mentor is already booked for another session from "
                    f"{s_start.strftime('%Y-%m-%d %H:%M')} to {s_end.strftime('%H:%M')} "
                    f"(Session #{s.session_id})."
                )
            else:
                return (
                    f"You already have a mentorship session scheduled from "
                    f"{s_start.strftime('%Y-%m-%d %H:%M')} to {s_end.strftime('%H:%M')} "
                    f"(Session #{s.session_id})."
                )
    return None


def get_interaction_frequency(db: Session, mentor_id: int, mentee_id: int) -> int:
    """Returns the count of all historical sessions between this mentor-mentee dyad."""
    return db.query(MentorshipSession).filter(
        MentorshipSession.mentor_id == mentor_id,
        MentorshipSession.mentee_id == mentee_id,
    ).count()


def get_mentee_profile(db: Session, user: User) -> Mentee:
    """Retrieves the Mentee profile for the given user, raising 403 if not found."""
    mentee = db.query(Mentee).filter(Mentee.user_id == user.user_id).first()
    if not mentee:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only mentees can book sessions. No mentee profile found for this account.",
        )
    return mentee


def get_mentor_or_404(db: Session, mentor_id: int) -> Mentor:
    """Fetches a verified mentor by ID or raises 404."""
    mentor = db.query(Mentor).filter(
        Mentor.mentor_id == mentor_id,
        Mentor.is_verified == True,
    ).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Verified mentor with ID {mentor_id} not found.",
        )
    return mentor


def get_session_with_access_check(db: Session, user: User, session_id: int) -> MentorshipSession:
    """
    Fetches a session by ID and verifies the current user has permission to view it.
    - Mentees may only see their own sessions.
    - Mentors may only see sessions where they are assigned.
    - Administrators see all sessions.
    """
    session = db.query(MentorshipSession).filter(
        MentorshipSession.session_id == session_id
    ).first()
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Session #{session_id} not found.",
        )

    if user.role == "administrator":
        return session

    if user.role == "mentee":
        mentee = db.query(Mentee).filter(Mentee.user_id == user.user_id).first()
        if not mentee or session.mentee_id != mentee.mentee_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this session.",
            )

    elif user.role == "mentor":
        mentor = db.query(Mentor).filter(Mentor.user_id == user.user_id).first()
        if not mentor or session.mentor_id != mentor.mentor_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this session.",
            )

    return session


def validate_status_transition(current_status: str, new_status: str) -> None:
    """Raises 422 if the requested status transition is not permitted."""
    allowed = VALID_TRANSITIONS.get(current_status, [])
    if new_status not in allowed:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=(
                f"Cannot transition session from '{current_status}' to '{new_status}'. "
                f"Allowed transitions from '{current_status}': {allowed or ['none']}."
            ),
        )
