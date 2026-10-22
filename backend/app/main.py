"""
INUA Mentorship Platform: FastAPI Application Entrypoint
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
"""

import sys
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse

# Ensure backend directory is in sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.config import API_TITLE, API_DESCRIPTION, API_VERSION, CORS_ORIGINS
from routes.predict import router as predict_router
from routes.analytics import router as analytics_router
from routes.health import router as health_router
from routes.auth import router as auth_router
from routes.sessions import router as sessions_router
from routes.mentors import router as mentors_router
from routes.feedback import router as feedback_router
from db.session import init_db
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

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(health_router, prefix="/api/v1")
app.include_router(auth_router, prefix="/api/v1")
app.include_router(predict_router, prefix="/api/v1")
app.include_router(analytics_router, prefix="/api/v1")
app.include_router(sessions_router, prefix="/api/v1")
app.include_router(mentors_router, prefix="/api/v1")
app.include_router(feedback_router, prefix="/api/v1")

# Mount Frontend Dashboard
from fastapi.staticfiles import StaticFiles
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
