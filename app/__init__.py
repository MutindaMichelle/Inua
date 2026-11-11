"""
Root `app` package namespace bridge.
Extends package search `__path__` to `backend/app` so `from app.main import app`
and `uvicorn app.main:app` work identically from both repo root and `backend/`.
"""
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

__path__.append(str(BACKEND_DIR / "app"))
