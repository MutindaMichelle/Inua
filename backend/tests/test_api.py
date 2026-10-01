"""
INUA Platform: Automated API Test Suite
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
"""

import sys
import os
from pathlib import Path
from fastapi.testclient import TestClient

# Ensure backend root is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.main import app

client = TestClient(app)


def test_health_endpoint():
    """Verify health endpoint returns status and pre-warmed models."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "XGBoost" in data["loaded_models"]
    assert "Random Forest" in data["loaded_models"]
    assert "AdaBoost" in data["loaded_models"]


def test_models_list_endpoint():
    """Verify models catalog endpoint."""
    response = client.get("/api/v1/predict/models")
    assert response.status_code == 200
    data = response.json()
    assert data["default_model"] == "XGBoost"
    assert len(data["available_models"]) == 3


def test_predict_single_effective_session():
    """Test prediction for an engaged, high-quality interaction."""
    payload = {
        "career_stage": "Year4",
        "field_of_study": "Computer Science",
        "career_interest": "Software Engineering",
        "prior_sessions": 3,
        "mentor_experience_years": 8,
        "mentor_industry": "Technology",
        "mentor_specialization": "Backend Engineering",
        "mentor_availability": "High",
        "session_type": "Interview Preparation",
        "session_duration_minutes": 65,
        "attendance_status": "Attended",
        "meeting_platform": "Teams",
        "goal_category": "Internship",
        "career_support_score": 4,
        "psychosocial_support_score": 4,
        "communication_quality": 5,
        "goal_progress_score": 4,
        "confidence_growth_score": 4,
        "mentor_responsiveness_score": 5,
        "model_name": "XGBoost",
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == 1
    assert data["status"] == "Effective"
    assert data["effectiveness_probability"] > 0.90
    assert len(data["risk_factors"]) == 0


def test_predict_single_ineffective_session():
    """Test prediction for a cancelled or disrupted session."""
    payload = {
        "career_stage": "Year1",
        "field_of_study": "Business",
        "career_interest": "Finance",
        "prior_sessions": 0,
        "mentor_experience_years": 1,
        "mentor_industry": "Banking & Finance",
        "mentor_specialization": "Risk Management",
        "mentor_availability": "Low",
        "session_type": "Career Guidance",
        "session_duration_minutes": 25,
        "attendance_status": "Cancelled",
        "meeting_platform": "Meet",
        "goal_category": "Career Transition",
        "career_support_score": 1,
        "psychosocial_support_score": 1,
        "communication_quality": 1,
        "goal_progress_score": 1,
        "confidence_growth_score": 1,
        "mentor_responsiveness_score": 1,
        "model_name": "Random Forest",
    }
    response = client.post("/api/v1/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["prediction"] == 0
    assert "Ineffective" in data["status"]
    assert len(data["risk_factors"]) > 0


def test_analytics_endpoints():
    """Verify analytics and model comparison data."""
    # Model comparison
    comp_resp = client.get("/api/v1/analytics/model-comparison")
    assert comp_resp.status_code == 200
    assert len(comp_resp.json()["metrics"]) == 3

    # Dataset summary
    sum_resp = client.get("/api/v1/analytics/dataset-summary")
    assert sum_resp.status_code == 200
    sum_data = sum_resp.json()
    assert sum_data["total_sessions"] == 2000
    assert sum_data["missing_values_count"] == 0

    # Figure retrieval
    fig_resp = client.get("/api/v1/analytics/figures/figure_4_1_career_stage_distribution.png")
    assert fig_resp.status_code == 200
    assert fig_resp.headers["content-type"] == "image/png"


if __name__ == "__main__":
    print("[TESTS] Running automated test suite for INUA backend...")
    test_health_endpoint()
    print("  [PASS] GET /api/v1/health")
    test_models_list_endpoint()
    print("  [PASS] GET /api/v1/predict/models")
    test_predict_single_effective_session()
    print("  [PASS] POST /api/v1/predict (Effective Session)")
    test_predict_single_ineffective_session()
    print("  [PASS] POST /api/v1/predict (Ineffective Session & Risk Detection)")
    test_analytics_endpoints()
    print("  [PASS] GET /api/v1/analytics (Comparison, Summary & Dissertation Figures)")
    print("\n[ALL TESTS PASSED SUCCESSFULLY!]")
