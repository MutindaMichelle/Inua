"""
tests/test_pipeline.py

Comprehensive test suite verifying the INUA Machine Learning pipeline:
- Dataset generation schema (2,000 samples, 22 research-grounded variables per Kram/Bandura)
- Preprocessing and data leakage prevention (session_id, effectiveness_index, mentor_experience_level_encoded)
- Inference contract (IR-02) and TreeSHAP local explainability (NFR-05)
"""

import os
import sys
from pathlib import Path
import pandas as pd

# Add ml root to path
ML_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ML_ROOT))

from generate_dataset import create_dataset
from preprocessing import run_preprocessing
from predict import predict_session_effectiveness, MentorshipEffectivenessPredictor


def test_generated_dataset_schema():
    """Validates the synthetic dataset conforms to the master Data Dictionary v1.0."""
    df = create_dataset(n=100, random_state=42)
    assert len(df) == 100
    
    expected_columns = {
        "session_id", "career_stage", "field_of_study", "career_interest",
        "prior_sessions", "mentor_experience_years", "mentor_industry",
        "mentor_specialization", "mentor_availability", "session_type",
        "session_duration_minutes", "attendance_status", "meeting_platform",
        "goal_category", "career_support_score", "psychosocial_support_score",
        "communication_quality", "goal_progress_score", "confidence_growth_score",
        "mentor_responsiveness_score", "effectiveness_index", "session_effectiveness",
    }
    assert expected_columns.issubset(set(df.columns)), f"Missing columns: {expected_columns - set(df.columns)}"
    assert set(df["session_effectiveness"].unique()).issubset({0, 1})
    print("  [PASS] test_generated_dataset_schema")


def test_preprocessing_leakage_prevention():
    """Validates that target, session_id, effectiveness_index, and mentor_experience_level_encoded are excluded from features."""
    csv_path = ML_ROOT / "data" / "inua_mentorship_dataset.csv"
    if csv_path.exists():
        X_train, X_test, y_train, y_test, feature_names = run_preprocessing(
            csv_path=str(csv_path),
        )
        assert "session_id" not in feature_names
        assert "effectiveness_index" not in feature_names
        assert "mentor_experience_level_encoded" not in feature_names
        assert "session_effectiveness" not in feature_names
        print("  [PASS] test_preprocessing_leakage_prevention")


def test_prediction_contract_and_nfr05():
    """Validates IR-02 prediction output and NFR-05 TreeSHAP local attribution."""
    strong_session = {
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
    }
    result = predict_session_effectiveness(strong_session)
    assert result["effectiveness_label"] == "Effective"
    assert result["confidence_score"] > 0.90
    assert result["model_version"] == "XGBoost_v1.0"
    assert len(result["top_features"]) > 0
    # Top driving factor for strong session should have positive contribution
    top_feature_name, top_feature_contrib = result["top_features"][0]
    assert top_feature_contrib > 0
    print("  [PASS] test_prediction_contract_and_nfr05")


if __name__ == "__main__":
    print("[RUNNING ML PIPELINE TESTS]")
    test_generated_dataset_schema()
    test_preprocessing_leakage_prevention()
    test_prediction_contract_and_nfr05()
    print("[ALL ML PIPELINE TESTS PASSED!]")
