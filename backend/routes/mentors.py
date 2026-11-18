"""
INUA Mentorship Platform: Mentor Directory, Credential Verification & Quality Profile Routes
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Requirements: FR-02 (Mentor Discovery), FR-07 (Mentor Quality Profile), Mentor Credential Verification
"""

import sys
from pathlib import Path
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from db.session import get_db
from models.database import Mentor, User
from models.schemas import (
    MentorSummaryResponse,
    MentorQualityProfileResponse,
    MentorVerificationRequest,
)
from services.auth_service import get_current_user, require_roles
from services.mentor_quality_service import (
    compute_mentor_quality,
    compute_all_mentor_profiles,
)

router = APIRouter(prefix="/mentors", tags=["Mentors"])


def _to_mentor_summary(m: Mentor) -> MentorSummaryResponse:
    return MentorSummaryResponse(
        mentor_id=m.mentor_id,
        name=m.user.name if m.user else "Unknown",
        email=m.user.email if m.user else "",
        industry=m.industry,
        expertise=m.expertise,
        experience_years=m.experience_years,
        is_verified=m.is_verified,
        verification_status=m.verification_status or ("Verified" if m.is_verified else "Pending"),
        credential_type=m.credential_type,
        credential_issuer=m.credential_issuer,
        credential_reference=m.credential_reference,
        credential_document_url=m.credential_document_url,
        verification_notes=m.verification_notes,
    )


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
    Returns all verified mentors whose credentials have been approved by an Administrator.
    Optionally filter by `industry` or `expertise`.
    """
    query = db.query(Mentor).filter(Mentor.is_verified == True)
    if industry:
        query = query.filter(Mentor.industry.ilike(f"%{industry}%"))
    if expertise:
        query = query.filter(Mentor.expertise.ilike(f"%{expertise}%"))

    mentors = query.all()
    return [_to_mentor_summary(m) for m in mentors]


@router.get(
    "/pending",
    response_model=List[MentorSummaryResponse],
    summary="List mentors awaiting credential verification (Administrator only)",
)
def list_pending_mentors(
    status_filter: Optional[str] = Query(
        None, alias="status", description="Optional filter: 'Pending', 'Verified', or 'Rejected'"
    ),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_roles("administrator")),
):
    """
    Returns mentors filtered by verification status (defaults to all mentors so Admin can inspect Pending, Verified, and Rejected).
    """
    query = db.query(Mentor)
    if status_filter:
        query = query.filter(Mentor.verification_status == status_filter)
    mentors = query.order_by(Mentor.is_verified.asc(), Mentor.mentor_id.desc()).all()
    return [_to_mentor_summary(m) for m in mentors]


@router.post(
    "/{mentor_id}/verify",
    response_model=MentorSummaryResponse,
    summary="Approve or reject a mentor's submitted credentials (Administrator only)",
)
def verify_mentor_credentials(
    mentor_id: int,
    payload: MentorVerificationRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_roles("administrator")),
):
    """
    Allows a platform Administrator to review a mentor's degree, certification,
    employer verification letter, or consultancy registration and set their verification status.
    """
    mentor = db.query(Mentor).filter(Mentor.mentor_id == mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mentor with ID #{mentor_id} not found.",
        )

    mentor.verification_status = payload.status
    mentor.is_verified = payload.status == "Verified"
    if payload.verification_notes is not None:
        mentor.verification_notes = payload.verification_notes.strip()
    elif payload.status == "Verified":
        mentor.verification_notes = f"Credentials verified and approved by {current_admin.name}."
    elif payload.status == "Rejected":
        mentor.verification_notes = f"Credentials rejected by {current_admin.name}. Please provide verifiable proof."

    db.commit()
    db.refresh(mentor)
    return _to_mentor_summary(mentor)


@router.get(
    "/quality-profiles",
    response_model=List[MentorQualityProfileResponse],
    summary="Get aggregated quality profiles for all verified mentors (FR-07)",
)
def get_all_mentor_quality_profiles(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns performance, feedback, and effectiveness rankings for all verified mentors.
    Accessible to all authenticated users.
    """
    return compute_all_mentor_profiles(db, include_unverified=False)


@router.get(
    "/{mentor_id}/quality",
    response_model=MentorQualityProfileResponse,
    summary="Get longitudinal quality profile and feedback summary for a mentor (FR-07)",
)
def get_mentor_quality(
    mentor_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns longitudinal metrics and credential verification status for a specific mentor.
    """
    return compute_mentor_quality(db, mentor_id)


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
    return _to_mentor_summary(mentor)
