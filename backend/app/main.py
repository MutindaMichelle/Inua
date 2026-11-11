"""
INUA Mentorship Platform: FastAPI Application Entrypoint (Dual-Interface Routing)
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Use Case: U-CS 5 (session-value) — Career Mentor OS

Exposes:
1. Platform Grader Contract (Root Endpoints):
   - GET  /health   -> {"status": "ok"}
   - POST /predict  -> { probability, factors, suggestedIntervention, isSynthetic, method }
2. Prototype App Endpoints (/api/v1/*):
   - /api/v1/health, /api/v1/auth, /api/v1/sessions, /api/v1/mentors,
     /api/v1/feedback, /api/v1/goals, /api/v1/predict, /api/v1/predictions, /api/v1/analytics
"""

import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.config import API_TITLE, API_DESCRIPTION, API_VERSION, CORS_ORIGINS
from app.schemas import Request as UCS5Request, Response as UCS5Response
from app.service import handle as handle_ucs5_predict
from routes.predict import router as predict_router
from routes.predictions import router as predictions_router
from routes.analytics import router as analytics_router
from routes.health import router as health_router
from routes.auth import router as auth_router
from routes.sessions import router as sessions_router
from routes.mentors import router as mentors_router
from routes.feedback import router as feedback_router
from routes.goals import router as goals_router
from db.session import init_db, get_db
from db.seed import seed_database
from services.ml_service import MLService


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initializes database tables and pre-warms ML models upon application startup."""
    print("[INUA API] Initializing application lifespan...")
    try:
        init_db()
        seed_database(reset=False)
        print("[INUA API] Relational database initialized & verified.")
    except Exception as e:
        print(f"[INUA API] Database initialization notice: {e}")

    try:
        service = MLService()
        print(f"[INUA API] Pre-warmed ML Models: {service.get_loaded_models()}")
    except Exception as e:
        print(f"[INUA API] Warning during model initialization: {e}")
    yield
    print("[INUA API] Shutting down application...")


app = FastAPI(
    title=API_TITLE,
    description=API_DESCRIPTION,
    version=API_VERSION,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================
# 1. U-CS 5 Platform Grader Contract (Root)
# ==========================================

@app.get("/health", tags=["U-CS 5 Platform Contract"])
def root_health():
    """Hosting platforms and Career Mentor OS adapter call this to check the service is alive."""
    return {"status": "ok"}


@app.post("/predict", response_model=UCS5Response, tags=["U-CS 5 Platform Contract"])
def root_predict(body: UCS5Request, db: Session = Depends(get_db)) -> UCS5Response:
    """
    U-CS 5 — Session Effectiveness Predictor contract endpoint:
      in : { "menteeId": "...", "mentorId": "...", "leadTimeHours": 0, "hasAgenda": false, "isFirstSession": true }
      out: { "probability": 0.0, "factors": [], "suggestedIntervention": "...", "isSynthetic": true, "method": "xgboost" }
    """
    return handle_ucs5_predict(body, db=db)


# ==========================================
# 2. INUA Full-Stack Prototype Routes (/api/v1)
# ==========================================

app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(predict_router, prefix="/api/v1")
app.include_router(predictions_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(sessions_router, prefix="/api/v1")
app.include_router(mentors_router, prefix="/api/v1")
app.include_router(feedback_router, prefix="/api/v1")
app.include_router(goals_router, prefix="/api/v1")

# Mount Demo Mini-App & Frontend Dashboard
from fastapi.staticfiles import StaticFiles

DEMO_DIR = BACKEND_DIR.parent / "demo"
if DEMO_DIR.exists():
    app.mount("/demo", StaticFiles(directory=str(DEMO_DIR), html=True), name="demo")

FRONTEND_DIR = BACKEND_DIR.parent / "frontend"
if FRONTEND_DIR.exists():
    app.mount("/dashboard", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="dashboard")


@app.get("/", include_in_schema=False)
def root():
    """Redirects root URL to the interactive visual frontend dashboard."""
    return RedirectResponse(url="/dashboard/")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
