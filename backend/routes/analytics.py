"""
INUA Platform: Analytics & Figures Endpoints
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
"""

import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from services.analytics_service import AnalyticsService
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
