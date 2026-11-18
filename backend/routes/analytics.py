"""
INUA Platform: Analytics & Figures Endpoints
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Requirements: FR-08 (Administrator Analytics), NFR-02 (Role-Based Access Control)
"""

import sys
import os
from pathlib import Path
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from db.session import get_db
from models.database import User
from models.schemas import AdminAnalyticsOverviewResponse, MentorQualityProfileResponse
from services.analytics_service import AnalyticsService
from services.mentor_quality_service import (
    compute_admin_analytics_overview,
    compute_all_mentor_profiles,
)
from services.auth_service import require_roles
from app.config import FIGURES_DIR

router = APIRouter(prefix="/analytics", tags=["Mentorship Analytics & Chapter 4 Reports"])
analytics_service = AnalyticsService()


@router.get("/model-comparison")
def get_model_comparison_metrics():
    """
    Returns Table 4.4 metrics comparing Random Forest, AdaBoost, and XGBoost
    across 5-Fold Cross Validation and the held-out test partition.
    """
    data = analytics_service.get_model_comparison()
    if not data:
        raise HTTPException(status_code=404, detail="Model comparison metrics not found.")
    return {"metrics": data}


@router.get("/dataset-summary")
def get_dataset_summary_statistics():
    """
    Returns high-level distribution metrics, faculty breakdown, and attendance rates
    for the frontend dashboard.
    """
    summary = analytics_service.get_dataset_summary()
    return summary


@router.get("/figures/{figure_name}")
def get_dissertation_figure(figure_name: str):
    """
    Serves 300 DPI high-resolution dissertation figures (Figures 4.1 through 4.10).
    """
    if not figure_name.endswith(".png"):
        figure_name += ".png"

    fig_path = os.path.join(FIGURES_DIR, figure_name)
    if not os.path.exists(fig_path):
        raise HTTPException(status_code=404, detail=f"Figure '{figure_name}' not found.")

    return FileResponse(fig_path, media_type="image/png")


# ==========================================
# Administrator Analytics (FR-08)
# ==========================================

@router.get(
    "/admin/overview",
    response_model=AdminAnalyticsOverviewResponse,
    summary="Get aggregated system-wide mentorship statistics (FR-08 - Admin only)",
)
def get_admin_overview(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_roles("administrator")),
):
    """
    Aggregates live database statistics across the platform.
    Strictly restricted to users with the 'administrator' role (NFR-02).
    """
    return compute_admin_analytics_overview(db)


@router.get(
    "/admin/mentors",
    response_model=List[MentorQualityProfileResponse],
    summary="Get full mentor quality audit rankings & credential review queue (FR-07, FR-08 - Admin only)",
)
def get_admin_mentors_ranking(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_roles("administrator")),
):
    """
    Returns ranked quality audit profiles and credential verification records for all mentors
    (including Pending, Verified, and Rejected mentors) for Administrator review (NFR-02).
    """
    return compute_all_mentor_profiles(db, include_unverified=True)
