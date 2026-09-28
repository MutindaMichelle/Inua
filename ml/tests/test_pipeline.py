"""
tests/test_pipeline.py

A small pytest suite covering the parts of the pipeline most likely to
break silently: dataset generation shape/labels, preprocessing
consistency between train-time and predict-time, and the predict.py
contract (IR-02) including its error handling (IR-03).

Run from the ml/ folder:
    pytest tests/ -v
"""

import os
import sys
import subprocess

import pandas as pd
import pytest

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from generate_dataset import generate_raw_dataset
from preprocessing import clean_dataframe, encode_and_scale, FEATURE_COLUMNS, EXPERIENCE_LEVELS


# ---------- generate_dataset.py ----------

def test_generated_dataset_has_expected_columns():
    df = generate_raw_dataset(n=50)
    expected = {
        "session_id", "mentor_id", "mentee_id", "duration_minutes",
        "interaction_frequency_per_month", "mentor_experience_years",
        "goal_progress_pct", "career_support_score", "psychosocial_score",
        "status", "mentor_experience_level", "communication_score",
        "overall_rating", "session_effectiveness",
    }
    assert expected.issubset(set(df.columns))


def test_generated_dataset_has_both_classes():
    df = generate_raw_dataset(n=200)
    labels = set(df["session_effectiveness"].unique())
    assert labels == {"Effective", "Ineffective"}


def test_generated_dataset_has_deliberate_messiness():
    """The dataset intentionally includes missing values and duplicate
    session_ids (Section 3.2.1) so preprocessing has real work to do."""
    df = generate_raw_dataset(n=200)
    assert df["overall_rating"].isna().sum() > 0
    assert df["session_id"].duplicated().sum() > 0


# ---------- preprocessing.py ----------

def test_clean_dataframe_removes_duplicates_and_imputes():
    df = generate_raw_dataset(n=100)
    cleaned = clean_dataframe(df)
    assert cleaned["session_id"].duplicated().sum() == 0
    assert cleaned["overall_rating"].isna().sum() == 0


def test_feature_columns_exclude_composite_scores():
    """Regression test for the leakage fix: career_support_score and
    psychosocial_score must never be model features, since both are
    derived from the same variables used to build the label."""
    assert "career_support_score" not in FEATURE_COLUMNS
    assert "psychosocial_score" not in FEATURE_COLUMNS


def test_encode_and_scale_transform_matches_fit_shape():
    df = clean_dataframe(generate_raw_dataset(n=100))
    X_train, encoder, scaler = encode_and_scale(df)
    assert list(X_train.columns) == FEATURE_COLUMNS

    # transforming new data with the fitted encoder/scaler should produce
    # the same columns, simulating what predict.py does at inference time
    df2 = clean_dataframe(generate_raw_dataset(n=20))
    X_new, _, _ = encode_and_scale(df2, encoder=encoder, scaler=scaler)
    assert list(X_new.columns) == FEATURE_COLUMNS


# ---------- predict.py (requires a trained model in models/) ----------

MODEL_PRESENT = os.path.exists(
    os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "models", "model.joblib")
)


@pytest.mark.skipif(not MODEL_PRESENT, reason="Run train_model.py first to generate models/model.joblib")
def test_predict_returns_expected_contract():
    from predict import predict_session_effectiveness

    result = predict_session_effectiveness({
        "mentor_experience_years": 5.0,
        "duration_minutes": 40,
        "interaction_frequency_per_month": 5,
        "goal_progress_pct": 60.0,
        "communication_score": 4,
        "overall_rating": 4,
        "mentor_experience_level": "Mid",
    })
    assert result["effectiveness_label"] in {"Effective", "Ineffective"}
    assert 0.0 <= result["confidence_score"] <= 1.0
    assert isinstance(result["model_version"], str)
    assert len(result["top_features"]) == 3


@pytest.mark.skipif(not MODEL_PRESENT, reason="Run train_model.py first to generate models/model.joblib")
def test_predict_raises_on_missing_field():
    from predict import predict_session_effectiveness

    with pytest.raises(ValueError):
        predict_session_effectiveness({"mentor_experience_years": 5.0})


@pytest.mark.skipif(not MODEL_PRESENT, reason="Run train_model.py first to generate models/model.joblib")
def test_predict_raises_on_invalid_experience_level():
    from predict import predict_session_effectiveness

    payload = {
        "mentor_experience_years": 5.0, "duration_minutes": 40,
        "interaction_frequency_per_month": 5, "goal_progress_pct": 60.0,
        "communication_score": 4, "overall_rating": 4,
        "mentor_experience_level": "Expert",  # not in EXPERIENCE_LEVELS
    }
    with pytest.raises(ValueError):
        predict_session_effectiveness(payload)
