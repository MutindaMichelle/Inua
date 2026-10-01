"""
INUA Platform: Analytics & Reporting Service
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
"""

import os
import pandas as pd
from typing import Dict, Any, List
from app.config import FIGURES_DIR, DATA_DIR


class AnalyticsService:
    def __init__(self):
        self.figures_dir = FIGURES_DIR
        self.data_dir = DATA_DIR

    def get_model_comparison(self) -> List[Dict[str, Any]]:
        """Returns Table 4.4 metrics for Random Forest, AdaBoost, and XGBoost."""
        path = os.path.join(self.figures_dir, "table_4_4_model_comparison.csv")
        if not os.path.exists(path):
            return []
        df = pd.read_csv(path)
        return df.to_dict(orient="records")

    def get_dataset_summary(self) -> Dict[str, Any]:
        """Returns overall statistical metadata, cohort volumes, and class split."""
        csv_path = os.path.join(self.data_dir, "inua_mentorship_dataset.csv")
        if not os.path.exists(csv_path):
            return {"error": "Dataset not found"}

        df = pd.read_csv(csv_path)

        return {
            "total_sessions": len(df),
            "total_features": len(df.columns),
            "missing_values_count": int(df.isnull().sum().sum()),
            "overall_effectiveness_rate": round(float(df["session_effectiveness"].mean() * 100), 1),
            "career_stages_distribution": df["career_stage"].value_counts().to_dict(),
            "field_of_study_distribution": df["field_of_study"].value_counts().to_dict(),
            "session_types_distribution": df["session_type"].value_counts().to_dict(),
            "attendance_breakdown": df["attendance_status"].value_counts().to_dict(),
            "effectiveness_by_attendance": pd.crosstab(
                df["attendance_status"], df["session_effectiveness"], normalize="index"
            )[1].round(3).to_dict(),
        }
