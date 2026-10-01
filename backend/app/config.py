"""
INUA Platform: Backend Configuration & Environment Settings
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
"""

import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ML_DIR = BASE_DIR / "ml"
MODELS_DIR = ML_DIR / "saved_models"
DATA_DIR = ML_DIR / "data"
FIGURES_DIR = ML_DIR / "figures"

# API Settings
API_TITLE = "INUA Mentorship Intelligence API"
API_DESCRIPTION = (
    "Backend REST API for INUA – Intelligent Mentorship Effectiveness Analytics & "
    "Matching Platform (Strathmore University BICS Final Year Project). Powered by "
    "Random Forest, AdaBoost, and XGBoost machine learning classifiers."
)
API_VERSION = "1.0.0"

# Database Settings (Dual PostgreSQL / SQLite local development fallback)
DEFAULT_SQLITE_PATH = BASE_DIR / "backend" / "inua.db"
DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{DEFAULT_SQLITE_PATH}")

# Security & JWT Token Settings (FR-01 / IR-01)
SECRET_KEY = os.getenv("SECRET_KEY", "inua-secret-key-bics-strathmore-2026-michelle-project")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# Model Defaults
DEFAULT_MODEL = "XGBoost"
AVAILABLE_MODELS = ["XGBoost", "Random Forest", "AdaBoost"]

# CORS Origins
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "*",
]
