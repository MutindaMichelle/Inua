# INUA Backend REST API

FastAPI backend connecting the React SPA (`frontend/`) to the PostgreSQL/SQLite relational database (`db/`) and the trained machine learning pipeline (`ml/`).

## Architecture & Directory Structure

```
backend/
├── app/
│   ├── config.py            # Environment & CORS configuration
│   └── main.py              # FastAPI app entrypoint & lifespan model pre-warming
├── db/
│   ├── schema.sql           # Pure PostgreSQL DDL (8 relational tables)
│   ├── session.py           # SQLAlchemy engine & session dependency (PostgreSQL / SQLite fallback)
│   └── seed.py              # Idempotent seed script with Strathmore University demo data
├── models/
│   ├── database.py          # SQLAlchemy 2.0 ORM models (User, Mentee, Mentor, Session, Goal, Feedback, Prediction, QualityProfile)
│   └── schemas.py           # Pydantic v2 request/response contracts
├── routes/
│   ├── auth.py              # POST /auth/register, POST /auth/login, GET /auth/me (FR-01, IR-01, NFR-02)
│   ├── mentors.py           # GET /mentors, GET /mentors/quality-profiles, GET /mentors/{id}/quality (FR-02, FR-07)
│   ├── sessions.py          # POST /sessions/book, GET /sessions, PATCH /sessions/{id}/status (FR-02, FR-03)
│   ├── feedback.py          # POST /sessions/{id}/feedback, GET /sessions/{id}/feedback (FR-04)
│   ├── predictions.py       # POST /predictions, GET /predictions, GET /sessions/{id}/prediction (FR-05, FR-06, IR-02)
│   ├── predict.py           # POST /predict, POST /predict/batch, GET /predict/models (stateless ML scorer)
│   ├── analytics.py         # GET /analytics/admin/overview, GET /analytics/admin/mentors (FR-08)
│   └── health.py            # GET /health
├── services/
│   ├── auth_service.py      # Bcrypt hashing, HS256 JWT issuance, RBAC guards
│   ├── session_service.py   # Temporal overlap conflict detection & lifecycle state machine
│   ├── feedback_service.py  # Post-session Likert evaluation & auto-prediction trigger
│   ├── prediction_service.py# 18-feature assembly & DB persistence
│   ├── ml_service.py        # Model inference singleton & TreeSHAP local attributions
│   └── mentor_quality_service.py # Longitudinal mentor profiling & admin aggregations
├── tests/
│   ├── run_all_tests.py     # Unified runner executing all 7 test suites (183 assertions)
│   ├── test_db.py
│   ├── test_api.py
│   ├── test_auth.py
│   ├── test_sessions.py
│   ├── test_feedback.py
│   ├── test_predictions.py
│   ├── test_analytics_admin.py
│   └── test_integration_workflows.py
├── requirements.txt
└── run.py                   # Uvicorn server launcher
```

## Running Locally

```bash
# 1. Seed the database
python backend/db/seed.py

# 2. Run the full automated test suite
python backend/tests/run_all_tests.py

# 3. Start the API server (http://127.0.0.1:8000)
python backend/run.py
```
Interactive OpenAPI documentation is available at `http://127.0.0.1:8000/docs`.
