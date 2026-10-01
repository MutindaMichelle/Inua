"""
INUA Platform: Health Check & System Status Endpoint
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
"""

from fastapi import APIRouter
from app.config import API_VERSION, DEFAULT_MODEL
from services.ml_service import MLService

router = APIRouter(tags=["System Health"])


@router.get("/health")
def health_check():
    """Returns runtime health status and active machine learning model registry."""
    ml_service = MLService()
    return {
        "status": "healthy",
        "service": "INUA Mentorship Intelligence Backend",
        "version": API_VERSION,
        "loaded_models": ml_service.get_loaded_models(),
        "default_model": DEFAULT_MODEL,
    }
