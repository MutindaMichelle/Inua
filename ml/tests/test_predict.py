"""
INUA ML Unit Tests: Per-Prediction Feature Explanations (NFR-05)
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
"""

import sys
import os
from pathlib import Path

# Add ml/scripts to path
ML_SCRIPTS_DIR = Path(__file__).resolve().parent.parent / "scripts"
sys.path.insert(0, str(ML_SCRIPTS_DIR))

from predict import MentorshipEffectivenessPredictor


def test_per_prediction_contributions_and_contrast():
    """
    Validates NFR-05 requirements:
    1. Returns local feature contributions via pred_contribs.
    2. A strong and a weak session produce different top features.
    3. Handles and drops mentor_experience_level_encoded gracefully.
    """
    predictor = MentorshipEffectivenessPredictor()

    strong_session = {
        "career_stage": "Year4",
        "field_of_study": "Computer Science",
        "career_interest": "Software Engineering",
        "prior_sessions": 3,
        "mentor_experience_years": 8,
        "mentor_experience_level_encoded": 2,  # Must be dropped per NFR-05
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

    weak_session = {
        "career_stage": "Year1",
        "field_of_study": "Business",
        "career_interest": "Finance",
        "prior_sessions": 0,
        "mentor_experience_years": 1,
        "mentor_experience_level_encoded": 0,  # Must be dropped per NFR-05
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
    }

    # 1. Evaluate Strong Session
    res_strong = predictor.predict_session(strong_session, model_name="XGBoost")
    assert res_strong["prediction"] == 1
    assert res_strong["effectiveness_probability"] > 0.85
    assert "feature_contributions" in res_strong
    assert len(res_strong["feature_contributions"]) > 0

    strong_top = res_strong["feature_contributions"][0]
    # Strong session top feature must have a positive contribution towards effectiveness
    assert strong_top["contribution"] > 0
    assert strong_top["effect"] == "increases_effectiveness"

    # 2. Evaluate Weak Session
    res_weak = predictor.predict_session(weak_session, model_name="XGBoost")
    assert res_weak["prediction"] == 0
    assert res_weak["effectiveness_probability"] < 0.20
    assert "feature_contributions" in res_weak
    assert len(res_weak["feature_contributions"]) > 0

    weak_top = res_weak["feature_contributions"][0]
    # Weak session top feature must have a negative contribution
    assert weak_top["contribution"] < 0
    assert weak_top["effect"] == "decreases_effectiveness"

    # 3. Verify distinct feature contributions between strong and weak
    assert strong_top["contribution"] != weak_top["contribution"]
    assert strong_top["effect"] != weak_top["effect"]

    # 4. Verify mentor_experience_level_encoded is not in feature names
    assert "mentor_experience_level_encoded" not in predictor.feature_names

    print("[PASS] test_per_prediction_contributions_and_contrast passed successfully!")


if __name__ == "__main__":
    test_per_prediction_contributions_and_contrast()
