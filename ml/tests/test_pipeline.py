"""
tests/test_pipeline.py

Comprehensive test suite verifying the INUA Machine Learning pipeline (U-CS 5):
- Synthetic dataset generation schema (2,000 samples, pre-session features + chronological timestamps)
- Chronological time-split preprocessing and strict target/post-session leakage prevention
- Inference contract (IR-02) and TreeSHAP local explainability (NFR-05)
"""

import sys
from pathlib import Path

ML_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ML_ROOT))

from generate_dataset import create_dataset
from preprocessing import run_preprocessing
from predict import predict_session_effectiveness


def test_generated_dataset_schema():
    """Validates the synthetic dataset conforms to U-CS 5 pre-session & outcome bootstrapping schema."""
    df = create_dataset(n=100, random_state=42)
    assert len(df) == 100

    expected_columns = {
        "session_id", "created_at", "leadTimeHours", "hasAgenda", "isFirstSession",
        "career_stage", "field_of_study", "career_interest",
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
    """Validates that all post-session feedback scores and target proxies are excluded from X."""
    csv_path = ML_ROOT / "data" / "inua_mentorship_dataset.csv"
    if csv_path.exists():
        X_train, X_test, y_train, y_test, feature_names = run_preprocessing(
            csv_path=str(csv_path),
        )
        forbidden_post_session = [
            "session_id",
            "created_at",
            "effectiveness_index",
            "mentor_experience_level_encoded",
            "session_effectiveness",
            "career_support_score",
            "psychosocial_support_score",
            "communication_quality",
            "goal_progress_score",
            "confidence_growth_score",
            "mentor_responsiveness_score",
            "attendance_status",
            "session_duration_minutes",
        ]
        for col in forbidden_post_session:
            assert col not in feature_names, f"Leakage column {col} found in feature_names!"

        required_pre_session = [
            "leadTimeHours",
            "hasAgenda",
            "isFirstSession",
            "mentor_experience_years",
            "prior_sessions",
        ]
        for col in required_pre_session:
            assert col in feature_names, f"Required pre-session feature {col} missing from feature_names!"
        print("  [PASS] test_preprocessing_leakage_prevention")


def test_prediction_contract_and_nfr05():
    """Validates IR-02 pre-session prediction output and NFR-05 TreeSHAP local attribution."""
    strong_session = {
        "leadTimeHours": 48,
        "hasAgenda": True,
        "isFirstSession": False,
        "career_stage": "Year4",
        "field_of_study": "Computer Science",
        "career_interest": "Software Engineering",
        "prior_sessions": 3,
        "mentor_experience_years": 8,
        "mentor_industry": "Technology",
        "mentor_specialization": "Backend Engineering",
        "mentor_availability": "High",
        "session_type": "Interview Preparation",
        "meeting_platform": "Teams",
        "goal_category": "Internship",
    }
    result = predict_session_effectiveness(strong_session)
    assert result["effectiveness_label"] == "Effective"
    assert result["confidence_score"] > 0.90
    assert result["model_version"] == "XGBoost_v1.0"
    assert result["isSynthetic"] is True
    assert len(result["top_features"]) > 0
    top_feature_name, top_feature_contrib = result["top_features"][0]
    assert top_feature_contrib > 0
    print("  [PASS] test_prediction_contract_and_nfr05")


if __name__ == "__main__":
    print("[RUNNING ML PIPELINE TESTS]")
    test_generated_dataset_schema()
    test_preprocessing_leakage_prevention()
    test_prediction_contract_and_nfr05()
    print("[ALL ML PIPELINE TESTS PASSED!]")
