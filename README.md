# Inua

**Supporting Career Mentorship Outcomes Among University Students and Early-Career Professionals in Kenya: An XGBoost-Based System for Predicting Session Effectiveness**

Capstone project — Mutinda Michelle Mutio (154727), Strathmore University, School of Computing and Engineering Sciences. Supervisor: Dr. Dickson Owuor.

*Inua* is Swahili for "to lift up" — a digital mentorship platform that moves mentorship evaluation from subjective ratings to objective, predictive assessment using structured session data and an XGBoost classifier with TreeSHAP local explanations.

## Repository Structure

```
Inua/
├── docs/                    Proposal, full report, development diary, defense materials
│   ├── proposal/
│   ├── full-report/
│   ├── development-diary/
│   └── defense/
├── design/                  All system design artifacts
│   ├── diagrams/            Use case, class, ERD, logical schema, architecture
│   ├── wireframes/          Mentee / mentor / admin screen flows
│   └── prototypes/          Interactive HTML demos
├── ml/                      Machine learning pipeline (dataset, EDA, training, TreeSHAP prediction)
│   ├── data/                Generated dataset & data dictionary
│   ├── figures/             300 DPI dissertation figures (Figures 4.1–4.10)
│   ├── notebooks/           Jupyter notebooks (generation, EDA, model training)
│   ├── saved_models/        Serialized XGBoost, Random Forest, AdaBoost & preprocessor
│   └── tests/               ML pipeline & TreeSHAP unit tests
├── backend/                 FastAPI REST API & SQLAlchemy 2.0 ORM data layer
│   ├── app/                 Application entrypoint & configuration
│   ├── db/                  PostgreSQL DDL schema, session manager, idempotent seed script
│   ├── models/              ORM entities & Pydantic v2 request/response schemas
│   ├── routes/              REST endpoints (auth, mentors, sessions, feedback, predictions, analytics)
│   ├── services/            Business logic, RBAC, ML inference & TreeSHAP integration
│   └── tests/               7 automated test suites (183 assertions)
├── frontend/                React 18 + Vite + Tailwind CSS Single-Page Application
│   ├── src/
│   │   ├── api/             Axios client with JWT interceptor
│   │   ├── components/      Role-aware navigation & layout
│   │   ├── context/         Auth & Toast providers
│   │   ├── pages/           Public, Mentee, Mentor, and Administrator views
│   │   └── utils/           Formatting & UI helpers
├── ROADMAP.md               The 2-week implementation plan
└── WORKFLOW.md              Git/GitHub conventions used on this project
```

## Quick Start (Full-Stack Prototype)

### 1. Machine Learning Pipeline (`ml/`)
```bash
python ml/generate_dataset.py
python ml/train_model.py
python ml/predict.py
python ml/tests/test_pipeline.py
python ml/tests/test_predict.py
```

### 2. Backend API & Database (`backend/`)
```bash
# Install backend dependencies
pip install -r backend/requirements.txt

# Seed database with Strathmore University demo records
python backend/db/seed.py

# Run all 7 backend & integration test suites (183 assertions)
python backend/tests/run_all_tests.py

# Start FastAPI server on http://127.0.0.1:8000 (Swagger UI at /docs)
python backend/run.py
```

### 3. React Frontend (`frontend/`)
```bash
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser. Vite automatically proxies `/api/v1` calls to the FastAPI backend on port `8000`.

### Demo Credentials (Pre-Seeded)
| Role | Email | Password |
| :--- | :--- | :--- |
| **Mentee** | `michelle.mutinda@strathmore.edu` | `Password123!` |
| **Mentor** | `david.mwangi@safaricom.co.ke` | `Password123!` |
| **Administrator** | `admin@inua.strathmore.edu` | `Password123!` |

## Status

- [x] Proposal (Chapters 1–3), reviewed and corrected
- [x] Chapter 4 — system requirements, analysis and design diagrams
- [x] Modelling pipeline — dataset generation, preprocessing, training (XGBoost vs Random Forest vs AdaBoost), TreeSHAP prediction interface, tests
- [x] Backend REST API (FastAPI + SQLAlchemy 2.0 + JWT RBAC, FR-01 to FR-08)
- [x] Frontend SPA (React 18 + Vite + Tailwind CSS across Mentee, Mentor, and Admin flows)
- [x] End-to-End Integration (Frontend ↔ Backend REST API ↔ ML Pipeline & TreeSHAP)
- [x] Testing & verification (183 backend/integration assertions + production frontend build)

See `ROADMAP.md` for the milestone plan, `WORKFLOW.md` for Git/GitHub conventions, and `docs/development-diary/development_diary.md` for the full engineering log.
