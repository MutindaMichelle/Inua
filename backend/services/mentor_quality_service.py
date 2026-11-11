"""
INUA Mentorship Platform: Mentor Quality Profiles & Admin Analytics Service
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Requirements: FR-07 (Mentor Quality Profile), FR-08 (Administrator Analytics), NFR-02 (RBAC)
"""

import sys
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, List, Optional

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, distinct

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from models.database import (
    Mentor,
    Mentee,
    User,
    MentorshipSession,
    Feedback,
    PredictionRecord,
    MentorQualityProfile,
)
from models.schemas import (
    MentorQualityProfileResponse,
    AdminAnalyticsOverviewResponse,
)


def compute_mentor_quality(db: Session, mentor_id: int) -> MentorQualityProfileResponse:
    """
    Computes real-time longitudinal mentorship statistics for a mentor
    and synchronizes the relational 'mentor_quality_profiles' record (FR-07).
    """
    mentor = db.query(Mentor).filter(Mentor.mentor_id == mentor_id).first()
    if not mentor:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Mentor with ID #{mentor_id} not found.",
        )

    # 1. Session Counts
    total_sessions = db.query(MentorshipSession).filter(
        MentorshipSession.mentor_id == mentor_id
    ).count()

    completed_sessions = db.query(MentorshipSession).filter(
        MentorshipSession.mentor_id == mentor_id,
        MentorshipSession.status == "Completed",
    ).count()

    # 2. Distinct mentees coached
    unique_mentees = db.query(
        func.count(distinct(MentorshipSession.mentee_id))
    ).filter(
        MentorshipSession.mentor_id == mentor_id
    ).scalar() or 0

    # 3. Feedback aggregations (PostgreSQL / SQLite aggregations)
    feedback_stats = db.query(
        func.count(Feedback.feedback_id),
        func.avg(Feedback.communication_score),
        func.avg(Feedback.goal_progress),
        func.avg(Feedback.confidence_growth),
        func.avg(Feedback.overall_rating),
    ).join(
        MentorshipSession, Feedback.session_id == MentorshipSession.session_id
    ).filter(
        MentorshipSession.mentor_id == mentor_id
    ).first()

    fb_count = feedback_stats[0] or 0
    avg_comm = round(float(feedback_stats[1]), 2) if feedback_stats[1] is not None else 0.0
    avg_goal = round(float(feedback_stats[2]), 2) if feedback_stats[2] is not None else 0.0
    avg_conf = round(float(feedback_stats[3]), 2) if feedback_stats[3] is not None else 0.0
    avg_rate = round(float(feedback_stats[4]), 2) if feedback_stats[4] is not None else 0.0

    # 4. ML Prediction Statistics
    pred_stats = db.query(
        func.count(PredictionRecord.prediction_id),
        func.avg(PredictionRecord.probability),
    ).join(
        MentorshipSession, PredictionRecord.session_id == MentorshipSession.session_id
    ).filter(
        MentorshipSession.mentor_id == mentor_id
    ).first()

    total_preds = pred_stats[0] or 0
    effective_count = db.query(PredictionRecord).join(
        MentorshipSession, PredictionRecord.session_id == MentorshipSession.session_id
    ).filter(
        MentorshipSession.mentor_id == mentor_id,
        PredictionRecord.effectiveness_label.ilike("%effective%"),
        ~PredictionRecord.effectiveness_label.ilike("%ineffective%"),
    ).count()

    eff_rate = round((effective_count / total_preds * 100.0), 1) if total_preds > 0 else 0.0

    # Calculate overall aggregate score (0-100 scale)
    if avg_rate > 0:
        agg_score = round((avg_rate / 5.0) * 100.0, 1)
    elif pred_stats[1] is not None:
        agg_score = round(float(pred_stats[1]) * 100.0, 1)
    else:
        agg_score = 0.0

    # 5. Synchronize with mentor_quality_profiles table
    qp = db.query(MentorQualityProfile).filter(MentorQualityProfile.mentor_id == mentor_id).first()
    now_utc = datetime.now(timezone.utc)
    if not qp:
        qp = MentorQualityProfile(
            mentor_id=mentor_id,
            aggregate_effectiveness_score=agg_score,
            total_sessions=completed_sessions,
            last_update=now_utc,
        )
        db.add(qp)
    else:
        qp.aggregate_effectiveness_score = agg_score
        qp.total_sessions = completed_sessions
        qp.last_update = now_utc
    db.commit()

    # 6. Recent written comments
    recent_comments = [
        c[0] for c in db.query(Feedback.comments).join(
            MentorshipSession, Feedback.session_id == MentorshipSession.session_id
        ).filter(
            MentorshipSession.mentor_id == mentor_id,
            Feedback.comments.isnot(None),
            Feedback.comments != "",
        ).order_by(Feedback.submitted_at.desc()).limit(5).all()
    ]

    return MentorQualityProfileResponse(
        mentor_id=mentor.mentor_id,
        name=mentor.user.name if mentor.user else "Unknown",
        email=mentor.user.email if mentor.user else "",
        industry=mentor.industry,
        expertise=mentor.expertise,
        experience_years=mentor.experience_years,
        is_verified=mentor.is_verified,
        verification_status=mentor.verification_status or ("Verified" if mentor.is_verified else "Pending"),
        credential_type=mentor.credential_type,
        credential_issuer=mentor.credential_issuer,
        credential_reference=mentor.credential_reference,
        credential_document_url=mentor.credential_document_url,
        verification_notes=mentor.verification_notes,
        total_sessions=total_sessions,
        completed_sessions=completed_sessions,
        unique_mentees_count=unique_mentees,
        average_communication_score=avg_comm,
        average_goal_progress=avg_goal,
        average_confidence_growth=avg_conf,
        average_overall_rating=avg_rate,
        total_feedback_count=fb_count,
        effective_sessions_count=effective_count,
        effectiveness_rate_percentage=eff_rate,
        aggregate_effectiveness_score=agg_score,
        recent_comments=recent_comments,
        last_update=qp.last_update.isoformat() if qp.last_update else None,
    )


def compute_all_mentor_profiles(db: Session, include_unverified: bool = False) -> List[MentorQualityProfileResponse]:
    """Retrieves computed quality profiles for mentors (verified only by default, or all for Admin audit)."""
    query = db.query(Mentor)
    if not include_unverified:
        query = query.filter(Mentor.is_verified == True)
    mentors = query.all()
    profiles = [compute_mentor_quality(db, m.mentor_id) for m in mentors]
    profiles.sort(key=lambda p: (not p.is_verified, p.aggregate_effectiveness_score, p.completed_sessions), reverse=True)
    return profiles


def compute_admin_analytics_overview(db: Session) -> AdminAnalyticsOverviewResponse:
    """
    Computes system-wide aggregated metrics across all users, sessions,
    evaluations, and predictions for platform administrators (FR-08).
    """
    # 1. Users Breakdown
    total_users = db.query(User).count()
    user_roles_query = db.query(User.role, func.count(User.user_id)).group_by(User.role).all()
    users_by_role = {role: count for role, count in user_roles_query}

    # 2. Sessions Breakdown
    total_sessions = db.query(MentorshipSession).count()
    session_status_query = db.query(
        MentorshipSession.status, func.count(MentorshipSession.session_id)
    ).group_by(MentorshipSession.status).all()
    sessions_by_status = {st: count for st, count in session_status_query}

    # 3. Feedback Aggregations
    total_feedback = db.query(Feedback).count()
    avg_fb = db.query(
        func.avg(Feedback.overall_rating),
        func.avg(Feedback.communication_score),
        func.avg(Feedback.goal_progress),
        func.avg(Feedback.confidence_growth),
    ).first()

    avg_satisfaction = round(float(avg_fb[0]), 2) if avg_fb[0] is not None else 0.0
    avg_comm = round(float(avg_fb[1]), 2) if avg_fb[1] is not None else 0.0
    avg_goal = round(float(avg_fb[2]), 2) if avg_fb[2] is not None else 0.0
    avg_conf = round(float(avg_fb[3]), 2) if avg_fb[3] is not None else 0.0

    # 4. Predictions Aggregations
    total_predictions = db.query(PredictionRecord).count()
    pred_query = db.query(
        PredictionRecord.effectiveness_label, func.count(PredictionRecord.prediction_id)
    ).group_by(PredictionRecord.effectiveness_label).all()
    predictions_breakdown = {lbl: count for lbl, count in pred_query}

    # 5. Cohort engagement counts
    active_mentors = db.query(func.count(distinct(MentorshipSession.mentor_id))).scalar() or 0
    active_mentees = db.query(func.count(distinct(MentorshipSession.mentee_id))).scalar() or 0

    # 6. Top mentors (verified only)
    all_profiles = compute_all_mentor_profiles(db, include_unverified=False)
    top_mentors = [
        {
            "mentor_id": p.mentor_id,
            "name": p.name,
            "industry": p.industry,
            "expertise": p.expertise,
            "completed_sessions": p.completed_sessions,
            "average_overall_rating": p.average_overall_rating,
            "aggregate_effectiveness_score": p.aggregate_effectiveness_score,
        }
        for p in all_profiles[:5]
    ]

    return AdminAnalyticsOverviewResponse(
        total_users=total_users,
        users_by_role=users_by_role,
        total_sessions=total_sessions,
        sessions_by_status=sessions_by_status,
        total_feedback_entries=total_feedback,
        total_predictions=total_predictions,
        predictions_breakdown=predictions_breakdown,
        average_platform_satisfaction=avg_satisfaction,
        average_communication_score=avg_comm,
        average_goal_progress=avg_goal,
        average_confidence_growth=avg_conf,
        active_mentors_count=active_mentors,
        active_mentees_count=active_mentees,
        top_performing_mentors=top_mentors,
    )
