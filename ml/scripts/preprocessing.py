"""
INUA Mentorship Platform: Feature Preprocessing Pipeline
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Sprint: Sprint 3 · Machine Learning Pipeline
Deliverable: Preprocessed training and test partitions & serialized preprocessor

Prevents Data Leakage:
- `session_id` is an arbitrary identifier and is dropped.
- `effectiveness_index` is an outcome proxy and is dropped to prevent target leakage.
- Preprocessing transformers (StandardScaler, OneHotEncoder) are fitted strictly
  on the training partition (80%) and applied to the test partition (20%).
"""

import os
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer


def build_preprocessor(categorical_cols: list, numerical_cols: list) -> ColumnTransformer:
    """Creates a ColumnTransformer pipeline handling categorical and continuous features."""
    preprocessor = ColumnTransformer(
        transformers=[
            (
                "num",
                StandardScaler(),
                numerical_cols,
            ),
            (
                "cat",
                OneHotEncoder(handle_unknown="ignore", sparse_output=False),
                categorical_cols,
            ),
        ],
        remainder="drop",
    )
    return preprocessor


def run_preprocessing(
    csv_path: str = None,
    output_dir: str = None,
    models_dir: str = None,
    test_size: float = 0.20,
    random_state: int = 42,
):
    """
    Executes full data preprocessing, creates stratified train-test splits,
    saves the fitted preprocessor, and exports processed datasets.
    """
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    if csv_path is None:
        csv_path = os.path.join(base_dir, "data", "inua_mentorship_dataset.csv")
    if output_dir is None:
        output_dir = os.path.join(base_dir, "data")
    if models_dir is None:
        models_dir = os.path.join(base_dir, "saved_models")

    os.makedirs(output_dir, exist_ok=True)
    os.makedirs(models_dir, exist_ok=True)

    print("=" * 60)
    print("INUA SPRINT 3: FEATURE PREPROCESSING PIPELINE")
    print("=" * 60)

    df = pd.read_csv(csv_path)
    print(f"[PREPROCESS] Raw dataset loaded: {df.shape[0]} rows, {df.shape[1]} columns")

    # Target variable and columns to drop
    target_col = "session_effectiveness"
    leakage_cols = [
        "session_id",
        "effectiveness_index",
        "mentor_experience_level_encoded",  # Dropped per NFR-05 (duplicates mentor_experience_years)
    ]
    
    # Feature columns
    feature_cols = [c for c in df.columns if c not in [target_col] + leakage_cols]
    
    categorical_cols = [
        "career_stage",
        "field_of_study",
        "career_interest",
        "mentor_industry",
        "mentor_specialization",
        "mentor_availability",
        "session_type",
        "attendance_status",
        "meeting_platform",
        "goal_category",
    ]
    
    numerical_cols = [
        "prior_sessions",
        "mentor_experience_years",
        "session_duration_minutes",
        "career_support_score",
        "psychosocial_support_score",
        "communication_quality",
        "goal_progress_score",
        "confidence_growth_score",
        "mentor_responsiveness_score",
    ]

    print(f"[PREPROCESS] Identified {len(categorical_cols)} categorical features & {len(numerical_cols)} numerical features")
    print(f"[PREPROCESS] Excluding target leakage variables: {leakage_cols}")

    X = df[feature_cols]
    y = df[target_col]

    # Stratified Train-Test split
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    print(f"[PREPROCESS] Train split: {len(X_train)} samples ({1-test_size:.0%})")
    print(f"[PREPROCESS] Test split:  {len(X_test)} samples ({test_size:.0%})")

    # Fit preprocessor strictly on training data
    preprocessor = build_preprocessor(categorical_cols, numerical_cols)
    preprocessor.fit(X_train)

    # Transform both splits
    X_train_trans = preprocessor.transform(X_train)
    X_test_trans = preprocessor.transform(X_test)

    # Get feature names after one-hot encoding
    encoded_cat_names = preprocessor.named_transformers_["cat"].get_feature_names_out(categorical_cols)
    transformed_feature_names = numerical_cols + list(encoded_cat_names)
    print(f"[PREPROCESS] Transformed feature space dimensionality: {len(transformed_feature_names)} features")

    # Save processed DataFrames
    train_processed_df = pd.DataFrame(X_train_trans, columns=transformed_feature_names)
    train_processed_df["session_effectiveness"] = y_train.values

    test_processed_df = pd.DataFrame(X_test_trans, columns=transformed_feature_names)
    test_processed_df["session_effectiveness"] = y_test.values

    full_processed_df = pd.concat([train_processed_df, test_processed_df], axis=0).reset_index(drop=True)
    processed_csv_path = os.path.join(output_dir, "processed_dataset.csv")
    full_processed_df.to_csv(processed_csv_path, index=False)
    print(f"[PREPROCESS] Saved full processed dataset -> {processed_csv_path}")

    # Serialize preprocessor and feature schema
    preprocessor_path = os.path.join(models_dir, "preprocessor.pkl")
    joblib.dump(preprocessor, preprocessor_path)
    print(f"[PREPROCESS] Serialized preprocessor pipeline -> {preprocessor_path}")

    meta = {
        "categorical_cols": categorical_cols,
        "numerical_cols": numerical_cols,
        "transformed_feature_names": transformed_feature_names,
    }
    meta_path = os.path.join(models_dir, "feature_metadata.pkl")
    joblib.dump(meta, meta_path)
    print(f"[PREPROCESS] Saved feature metadata -> {meta_path}")

    return X_train_trans, X_test_trans, y_train.values, y_test.values, transformed_feature_names


if __name__ == "__main__":
    run_preprocessing()
