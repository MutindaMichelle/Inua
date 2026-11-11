"""
U-CS 5 (session-value) Contract Schemas
Re-exports Request and Response matching strathmore-skeleton/starters/session-value/app/schemas.py
"""
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from models.schemas import UCS5PredictRequest as Request, UCS5PredictResponse as Response

__all__ = ["Request", "Response", "UCS5PredictRequest", "UCS5PredictResponse"]
