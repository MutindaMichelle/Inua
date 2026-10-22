"""
INUA Mentorship Platform: Mentor Directory Routes
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Requirements: FR-02 (Mentor Discovery for Session Booking)
"""

import sys
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from db.session import get_db
from models.database import Mentor, User
from models.schemas import MentorSummaryResponse
from services.auth_service import get_current_user

router = APIRouter(prefix="/mentors", tags=["Mentors"])


@router.get(
    "",
    response_model=List[MentorSummaryResponse],
    summary="Browse the verified mentor directory",
)
def list_mentors(
    industry: Optional[str] = Query(None, description="Filter by industry, e.g. 'Technology'"),
    expertise: Optional[str] = Query(None, description="Filter by expertise keyword"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns all verified mentors. Optionally filter by `industry` or `expertise`.
    Accessible by all authenticated users.
    """
    query = db.query(Mentor).filter(Mentor.is_verified == True)
    if industry:
        query = query.filter(Mentor.industry.ilike(f"%{industry}%"))
    if expertise:
        query = query.filter(Mentor.expertise.ilike(f"%{expertise}%"))

    mentors = query.all()

    return [
        MentorSummaryResponse(
            mentor_id=m.mentor_id,
            name=m.user.name if m.user else "Unknown",
            email=m.user.email if m.user else "",
            industry=m.industry,
            expertise=m.expertise,
            experience_years=m.experience_years,
            is_verified=m.is_verified,
        )
        for m in mentors
    ]


@router.get(
    "/{mentor_id}",
    response_model=MentorSummaryResponse,
    summary="Get a specific verified mentor's profile",
)
def get_mentor(
    mentor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns a single verified mentor profile by ID."""
    from services.session_service import get_mentor_or_404
    mentor = get_mentor_or_404(db, mentor_id)
    return MentorSummaryResponse(
        mentor_id=mentor.mentor_id,
        name=mentor.user.name if mentor.user else "Unknown",
        email=mentor.user.email if mentor.user else "",
        industry=mentor.industry,
        expertise=mentor.expertise,
        experience_years=mentor.experience_years,
        is_verified=mentor.is_verified,
    )
