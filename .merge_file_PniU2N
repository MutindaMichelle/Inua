# INUA Development Diary & Comprehensive Engineering Log

**Project Title:** Supporting Career Mentorship Outcomes Among University Students and Early-Career Professionals in Kenya: An XGBoost-Based System for Predicting Session Effectiveness  
**Use Case Alignment:** U-CS 5 (`session-value`) — Career Mentor OS Session Effectiveness Predictor  
**Student:** Mutinda Michelle Mutio (Admission No. 154727)  
**Programme:** Bachelor of Business Information Technology / Computer Science (BICS Year 4)  
**Institution:** Strathmore University, School of Computing and Engineering Sciences  
**Supervisor:** Dr. Dickson Owuor  
**Repository:** [https://github.com/MutindaMichelle/Inua](https://github.com/MutindaMichelle/Inua)  
**Last Updated:** 11 November 2026  
**Current Status:** All Milestones Complete (Milestone 1 Backend MVP + Milestone 2 React SPA Prototype + U-CS 5 Pre-Session Contract & Containerization)

---

## 1. Executive Summary & Purpose

This Development Diary serves as the authoritative, end-to-end chronological engineering log for the **INUA Mentorship Platform** from initial project inception (28 September 2026) through full-stack implementation, React SPA deployment, and U-CS 5 pre-session machine learning standardization (11 November 2026).

It records:
1. **Chronological Development Phases (Phases 0–18)** with dates, Git commits/branches, and requirements satisfied (`FR-01` to `FR-08`, `IR-01`, `IR-02`, `NFR-01` to `NFR-05`, and `U-CS 5`).
2. **How Every Feature Works Architecturally & Algorithmically** across the ML pipeline, PostgreSQL/SQLite database layer, FastAPI backend, and React 18 + Vite + Tailwind CSS frontend.
3. **Every Error, Bug, and Technical Challenge Encountered** during development, root-cause diagnostics, and the exact code fixes applied.
4. **Reproducible Examiner & Reviewer Execution Instructions** to test every component independently.

---

## 2. Chronological Development Log (From Beginning to Present)

### Phase 0: Project Proposal, System Analysis & Wireframe Prototyping
* **Date:** 28 September 2026
* **Commits:** `3033d10`, `00746bd`, `c1482f6`, `ff2a950`, `bad1151`, `045a534`, `348728c`, `582dd4d`, `e179154`
* **Problem Addressed:** Establish a clear problem formulation, academic literature foundation, formal software requirements, system architecture diagrams, and user interface wireframes before writing application code.
* **Work Executed & How It Worked:**
  * **Repository & Environment Initialization (`3033d10`, `582dd4d`, `e179154`):** Initialized Git repository structure (`ml/`, `backend/`, `frontend/`, `design/`, `docs/`), VS Code workspace configurations, `.gitignore`, a 2-week implementation roadmap (`ROADMAP.md`), and a feature-branch Git/GitHub workflow (`WORKFLOW.md`).
  * **Revised Proposal & Panel Review Fixes (`00746bd`, `348728c`):** Completed Chapters 1–3 (`docs/proposal/Inua_Proposal.docx`), proposal defense presentation (`docs/defense/Inua_Proposal_Defense.pptx`), presenter script, and Q&A defense cheat sheet.
  * **System Analysis & Design Diagrams (`c1482f6`, `045a534`):** Created 5 formal software engineering diagrams in `design/diagrams/`:
    1. `use_case_diagram.png`: Maps actor interactions across Mentee, Mentor, and Administrator roles.
    2. `system_architecture.png`: Defines the 3-tier architecture (React SPA Client $\leftrightarrow$ FastAPI REST + JWT Layer $\leftrightarrow$ XGBoost/TreeSHAP Inference Engine & PostgreSQL Database).
    3. `class_diagram.png`: Object-oriented domain model and service relationships.
    4. `entity_relationship_diagram.png`: Conceptual cardinality across the 8 domain entities.
    5. `logical_database_schema.png`: Physical table columns, primary keys, and foreign key constraints.
  * **High-Fidelity Wireframes & Interactive Prototypes (`ff2a950`, `bad1151`):** Designed 13 screen wireframes in `design/wireframes/` covering public homepage, login/registration, mentee dashboard, session booking, goal tracking, feedback submission, AI effectiveness diagnosis, mentor dashboard, mentor quality profile, and admin analytics, alongside interactive HTML prototypes in `design/prototypes/`.

---

### Phase 1: Theoretical Framing & Synthetic Dataset Architecture (Sprint 1)
* **Date:** 28 September 2026
* **Commit:** `b22a331`, `e6dc618`
* **Problem Addressed:** Empirical university mentorship records in Kenya contain private student academic and counseling records protected under the **Kenya Data Protection Act 2019 (Section 25)** and institutional ethics rules. Real-world historical datasets were unavailable at project start.
* **Theoretical Solution & How It Worked:**
  * Built a deterministic, domain-calibrated synthetic data generator (`ml/scripts/dataset_generator.py` and `ml/generate_dataset.py`, PRNG seed `42`, $N = 2,000$ sessions) grounded in five peer-reviewed mentorship theories:
    1. **Kram's Mentor Role Theory (1985):** Models mentoring along two distinct dimensions — *instrumental career support* (sponsorship, coaching, exposure) and *psychosocial support* (counseling, role modeling, acceptance).
    2. **Noe's Assigned Mentoring Determinants (1988) & Scandura & Ragins (1993):** Establishes how pre-session readiness, dyad interaction frequency, and mentor responsiveness drive composite session effectiveness ($\ge 3.8 / 5.0$ threshold).
    3. **Bandura's Social Cognitive Theory (1997):** Models post-session *confidence growth* (self-efficacy progression) as a function of psychosocial support and goal progress.
    4. **Allen et al. Meta-Analysis (2004):** Models the diminishing logarithmic returns of mentor industry tenure (`mentor_experience_years`) on career coaching quality:
       $$\mu_{\text{career\_support}} = 1.95 + 0.68 \cdot \ln(\text{mentor\_experience\_years} + 1) + \Delta_{\text{prep}}$$
* **Artifacts Created:**
  * `ml/data/data_dictionary.md`: Authoritative schema documentation defining all features, data types, and domain bounds.
  * `ml/data/inua_mentorship_dataset.csv`: 2,000 synthetic mentorship session records explicitly tagged as synthetic (`isSynthetic = True`).
  * `ml/notebooks/01_data_generation.ipynb`: Interactive Jupyter notebook documenting the mathematical distributions.

---

### Phase 2: Exploratory Data Analysis & Statistical Validation (Sprint 2)
* **Date:** 28 September 2026
* **Commits:** `6a49fea`, `2b75eb8`
* **Problem Addressed:** Validate that the synthesized dataset exhibits realistic demographic distributions, domain-consistent variances, and theoretical correlations before fitting machine learning classifiers.
* **Work Executed & How It Worked:**
  * Created `ml/scripts/exploratory_analysis.py` and `ml/notebooks/02_exploratory_analysis.ipynb`.
  * Generated 7 publication-quality 300 DPI statistical figures in `ml/figures/`:
    * `figure_4_1_career_stage_distribution.png`: Undergraduate (`Year1`–`Year4`), `Graduate`, and `EarlyCareer` cohort breakdown calibrated to Strathmore University demographics.
    * `figure_4_2_field_of_study.png`: Academic discipline distribution (`Computer Science`, `Engineering`, `Business`, `Data Analytics`, etc.).
    * `figure_4_3_session_type.png`: Breakdown across `Career Guidance`, `CV Review`, `Interview Preparation`, `Technical Coaching`, and `Networking`.
    * `figure_4_4_mentor_exp_vs_career_support.png`: Empirical verification of the logarithmic mentor tenure curve.
    * `figure_4_5_duration_by_session_type.png`: Truncated Gaussian duration distributions by session category.
    * `figure_4_6_correlation_heatmap.png`: Pearson correlation matrix confirming Kram's theoretical construct relationships.
    * `figure_4_7_target_class_distribution.png`: Ground-truth binary class balance (`Effective = 1` vs. `Ineffective = 0`).
  * Exported Chapter 4 dissertation summary tables: `table_4_1_missing_values.csv`, `table_4_2_numerical_summary.csv`, and `table_4_3_categorical_summary.csv`.

---

### Phase 3: Initial Machine Learning Pipeline, Cross-Validation & Diagnostics (Sprint 3)
* **Date:** 28 September – 1 October 2026
* **Commits:** `6a49fea`, `c15188e`, `a4fcd70`, `d9abf1d`
* **Problem Addressed:** Build a reusable feature engineering and classification pipeline using `scikit-learn` `ColumnTransformer` (`StandardScaler` for numerical features + `OneHotEncoder(handle_unknown="ignore")` for categorical features) and compare tree-based ensemble classifiers.
* **Work Executed & How It Worked:**
  * Fitted the `ColumnTransformer` strictly on the training partition (80%, $N=1,600$) and transformed the held-out test partition (20%, $N=400$) to prevent scaler/encoder statistics leakage.
  * Dropped `session_id` (unique string identifier) and `effectiveness_index` (direct continuous proxy of the binary target label).
  * Trained and compared **AdaBoost**, **Random Forest**, and **XGBoost** (`max_depth=4`, `learning_rate=0.1`, `subsample=0.85`, `colsample_bytree=0.85`).
  * Generated diagnostic plots: Confusion Matrices (`figure_4_8_confusion_matrices.png`), ROC Curves (`figure_4_9_roc_curves.png`), and Feature Importances (`figure_4_10_feature_importances.png`).
  * Serialized trained artifacts (`xgboost_model.pkl`, `random_forest.pkl`, `adaboost.pkl`, `preprocessor.pkl`, `feature_metadata.pkl`) in `ml/saved_models/`.

---

### Phase 4: Local Per-Prediction Feature Explanations via TreeSHAP (Issue #2 / NFR-05 — CLOSED)
* **Date:** 1 October 2026
* **Commit:** `2b75eb8`
* **Problem / Error Encountered:**
  * **Bug:** The initial version of `ml/predict.py` extracted global `model.feature_importances_` from the fitted classifier. As a result, *every single session*—whether it had a 96% effectiveness probability or a 12% probability—displayed the exact same static list of top features with identical unsigned weights. This violated **NFR-05**, which requires instance-specific local explanations showing what helped or hurt *that specific mentorship session*.
  * **Second Issue Found:** Feature audit revealed `mentor_experience_level_encoded` was collinear with `mentor_experience_years` and contributed 0.0000 split gain.
* **How It Was Fixed & How It Works:**
  * Upgraded `MentorshipEffectivenessPredictor` in `ml/predict.py` and `ml/scripts/predict.py` to compute **exact TreeSHAP local feature attributions** using `xgboost.DMatrix(X_trans, feature_names=...)` with `booster.predict(dmat, pred_contribs=True)`.
  * For every prediction, the booster outputs signed log-odds SHAP values ($\phi_i$) for each transformed one-hot and numerical feature, plus the bias term.
  * Built an aggregation mapper (`_aggregate_shap_by_raw_feature`) that sums one-hot category attributions back to their parent semantic feature (e.g., all `session_type_*` columns map back to `session_type`) and ranks the top $K$ positive/negative drivers for that specific session.
  * Removed the redundant `mentor_experience_level_encoded` column from preprocessing.
  * Added automated unit test `ml/tests/test_predict.py` verifying that a high-readiness session produces positive SHAP contributions (`+`) while an unprepared session produces negative SHAP contributions (`-`).

---

### Phase 5: Relational Database Schema, Dual-Engine Manager & Seeding (Issue #3 — CLOSED)
* **Date:** 1 October 2026
* **Commit:** `2b75eb8`
* **Problem Addressed:** Translate the logical database schema into a physical 8-table PostgreSQL database and SQLAlchemy 2.0 ORM layer with automated seeding for reproducible evaluation.
* **Deliverables & How They Work:**
  1. **`backend/db/schema.sql`:** Pure PostgreSQL DDL defining all **8 relational tables** with `ON DELETE CASCADE` foreign keys, `CHECK` constraints, and B-Tree indexes:
     * `users`: Authentication identity (`user_id`, `name`, `email`, `password_hash`, `role IN ('mentee', 'mentor', 'administrator')`).
     * `mentees`: Student profile (`mentee_id`, `user_id`, `university`, `career_stage`, `career_interest`).
     * `mentors`: Advisor profile (`mentor_id`, `user_id`, `experience_years`, `industry`, `expertise`, `is_verified`).
     * `sessions`: Mentorship booking record (`session_id`, `mentee_id`, `mentor_id`, `session_type`, `session_date`, `duration`, `status`, `meeting_platform`, `goal_category`, `interaction_frequency`, `notes`).
     * `goals`: Mentee career milestones (`goal_id`, `mentee_id`, `goal_title`, `progress_percentage` 0–100%).
     * `feedback`: Post-session Likert evaluations (`feedback_id`, `session_id`, `communication_score`, `goal_progress_score`, `confidence_growth_score`, `overall_rating`, `comments`).
     * `predictions`: Persisted ML inference outcomes (`prediction_id`, `session_id`, `effectiveness_label`, `probability`, `model_version`, `predicted_at`).
     * `mentor_quality_profiles`: Longitudinal aggregated mentor metrics (`profile_id`, `mentor_id`, `average_rating`, `total_sessions`, `effectiveness_score`, `updated_at`).
  2. **`backend/models/database.py`:** SQLAlchemy 2.0 declarative ORM models with bidirectional `relationship()` mappings and `.to_dict()` serializers.
  3. **`backend/db/session.py`:** Dual-mode database engine manager that connects to PostgreSQL when `DATABASE_URL` is configured and automatically falls back to local SQLite (`backend/inua.db`) for zero-configuration testing.
  4. **`backend/db/seed.py`:** Idempotent database seeder creating 1 Administrator (`admin@inua.strathmore.edu`), 4 Mentors (Safaricom, Microsoft ADC, Equity Bank, Strathmore Faculty), 4 Mentees (including `michelle.mutinda@strathmore.edu`), 7 Goals, 8 Sessions (5 completed with feedback & predictions, 3 upcoming), and 4 Mentor Quality Profiles, all secured with salted `bcrypt` hashes (`Password123!`).
  5. **`backend/tests/test_db.py`:** Automated database test verifying all 8 tables, foreign keys, and cascade deletions.

---

### Phase 6: FastAPI Application Scaffold & Service Layer (Issue #4 — CLOSED)
* **Date:** 1 October 2026
* **Commit:** `2b75eb8`
* **Problem Addressed:** Create a clean, modular FastAPI backend architecture separating HTTP routing, Pydantic validation schemas, business logic services, and ML inference.
* **Deliverables & How They Work:**
  * `backend/app/main.py`: FastAPI application with an `asynccontextmanager` lifespan hook that initializes database tables, runs idempotent seeding, and pre-warms the `MLService` singleton on server startup so prediction requests have zero cold-start latency.
  * `backend/app/config.py`: Centralized configuration reading environment variables (`DATABASE_URL`, `JWT_SECRET_KEY`, `DEFAULT_MODEL`, `CORS_ORIGINS`).
  * `backend/services/ml_service.py`: Singleton wrapper around `MentorshipEffectivenessPredictor` that loads serialized models once into memory, detects dyadic risk factors, and constructs actionable intervention recommendations.
  * `backend/routes/health.py`, `backend/routes/predict.py`, `backend/routes/analytics.py`: Initial REST endpoints validated by `backend/tests/test_api.py`.

---

### Phase 7: Repository Alignment, Legacy Artifact Pruning & Branch Protection (Issue #1 — CLOSED)
* **Date:** 1 October 2026
* **Commits:** `2b75eb8`, `4142bce`
* **Problem / Error Encountered:**
  * Early exploratory runs had left conflicting legacy `.pkl` files in `ml/models/` (from an uncalibrated 78% prototype) alongside the canonical models in `ml/saved_models/`, causing confusion about which directory the backend should load.
  * Duplicate draft diagram files existed in `design/diagrams/`.
* **How It Was Fixed:**
  * Deleted the legacy `ml/models/` directory and standardized `MODELS_DIR = ML_DIR / "saved_models"` in `backend/app/config.py`.
  * Cleaned `design/diagrams/` to keep the 5 canonical PNG diagrams and updated `design/wireframes/` with all 13 high-fidelity PNG wireframes.
  * Configured GitHub branch protection on `main` and closed Milestone 1 foundational Issues #1, #2, #3, and #4.

---

### Phase 8: Authentication, JWT Bearer Token Issuance & RBAC (Issue #5 / FR-01, IR-01, NFR-02 — CLOSED)
* **Date:** 22 October 2026
* **Branch:** `5-featbackend-implement-authregister-and-authlogin-fr-01` (Merged via PR #19, commit `eb50a45`, `2271a1e`)
* **Problem Addressed:** Securely register and authenticate users across the three system personas (`mentee`, `mentor`, `administrator`), hash passwords with salted `bcrypt`, issue stateless JWT Bearer tokens (`IR-01`), and enforce strict Role-Based Access Control (`NFR-02`).
* **Deliverables & How They Work:**
  1. **`backend/services/auth_service.py`:**
     * `hash_password()` and `verify_password()` using `bcrypt.gensalt()` and constant-time comparison.
     * `create_access_token()` and `decode_access_token()` using `PyJWT` (`HS256` algorithm, 24-hour expiry, `sub`, `email`, `name`, `role` claims).
     * `get_current_user`: FastAPI `HTTPBearer` security dependency that extracts and validates the Bearer token on protected routes or raises `401 Unauthorized`.
     * `require_roles(*allowed_roles)`: Higher-order dependency factory that checks `current_user.role` against permitted roles or raises `403 Forbidden`.
  2. **`backend/routes/auth.py`:**
     * `POST /api/v1/auth/register`: Atomically creates the `User` row and linked `Mentee` or `Mentor` specialization profile in a single transaction, returning a signed JWT token immediately (`201 Created`). Rejects duplicate emails with `409 Conflict` and missing role attributes with `422 Unprocessable Entity`.
     * `POST /api/v1/auth/login`: Verifies email and password and returns `TokenResponse`.
     * `GET /api/v1/auth/me`: Returns the authenticated user's identity and nested role profile.
  3. **`backend/tests/test_auth.py`:** 14 automated assertions verifying registration, login, invalid credentials, token tampering rejection, and RBAC route isolation (**14/14 PASS**).

---

### Phase 9: Session Booking, Conflict Detection, Lifecycle State Machine & Initial UI (Issue #6 / FR-02, FR-03 — CLOSED)
* **Date:** 22 October 2026
* **Branch:** `feat/sessions` (Merged via commit `5ea6e96`, `9fbdce6`, `6e2b58a`, `cd23cfc`)
* **Problem Addressed:** Enable mentees to browse verified mentors, book mentorship sessions with automatic schedule overlap detection (`FR-02`), and transition sessions through their lifecycle states (`FR-03`).
* **Deliverables & How They Work:**
  1. **`backend/services/session_service.py`:**
     * **Temporal Conflict Detection (`check_session_conflict`):** Computes `[start_time, end_time]` using `session_date + timedelta(minutes=duration)` and checks all active (`Pending`, `Scheduled`, `Rescheduled`) sessions for both the mentor and mentee using interval intersection:
       $$\max(\text{start}_1, \text{start}_2) < \min(\text{end}_1, \text{end}_2)$$
       If an overlap exists, raises `409 Conflict` identifying whether the mentor or mentee has the conflicting slot.
     * **Lifecycle State Machine (`ALLOWED_STATUS_TRANSITIONS`):**
       * `Pending` $\rightarrow$ `Scheduled` or `Cancelled`
       * `Scheduled` $\rightarrow$ `Completed`, `Rescheduled`, or `Cancelled`
       * `Rescheduled` $\rightarrow$ `Completed` or `Cancelled`
       * `Completed` and `Cancelled` are enforced as **terminal states** (any further transition raises `422 Unprocessable Entity`).
     * **Dyadic Interaction Frequency Counter:** Automatically counts prior sessions between the `(mentee_id, mentor_id)` pair and increments `interaction_frequency` on each new booking.
  2. **`backend/routes/mentors.py` & `backend/routes/sessions.py`:** Implemented `GET /api/v1/mentors`, `POST /api/v1/sessions/book`, `GET /api/v1/sessions`, and `PATCH /api/v1/sessions/{session_id}/status`.
  3. **Bugs Encountered & Fixed (`6e2b58a`):**
     * **Bug 1 (Modal Blocking Landing Page):** In the initial single-file HTML dashboard (`frontend/index.html`), the login modal overlay had its CSS display property active on initial page load, blocking visitors from reading the landing page. Fixed by initializing modals in a hidden state (`display: none`) and only opening on explicit CTA click.
     * **Bug 2 (Health Endpoint Field Mismatch):** The frontend status badge read `data.models_loaded` as an integer, whereas `/api/v1/health` returned a list of model names. Updated the badge logic to check `Array.isArray(data.models_loaded) ? data.models_loaded.length : ...`.
  4. **`backend/tests/test_sessions.py`:** 37 automated test assertions covering mentor filtering, booking, double-booking rejection (`409`), rescheduling, and illegal terminal state transitions (**37/37 PASS**).

---

### Phase 10: Post-Session Mentee Feedback Submission (Issue #7 / FR-04 — CLOSED)
* **Date:** 22–29 October 2026
* **Branch:** `feat/feedback` (Merged via PR #20, commits `f8db5f2`, `716fcd6`, `7e1c135`)
* **Problem Addressed:** Allow mentees to submit structured post-session Likert evaluations (communication quality, goal progress, confidence growth, overall rating) and qualitative reflections once a session is marked `Completed` (`FR-04`).
* **Deliverables & How They Work:**
  1. **`backend/services/feedback_service.py`:**
     * Enforces three strict domain invariants before persisting a `Feedback` record:
       1. **Ownership Guard:** Only the mentee assigned to that specific session can submit feedback (`403 Forbidden` if another mentee or mentor attempts it).
       2. **Completion Pre-condition:** Feedback is rejected with `422 Unprocessable Entity` if the session is still `Pending`, `Scheduled`, or `Cancelled`.
       3. **Idempotency / Duplicate Guard:** Each session can receive at most one feedback evaluation (`409 Conflict` on duplicate submission).
  2. **`backend/routes/feedback.py`:** Exposed `POST /api/v1/sessions/{session_id}/feedback` (`201 Created`) and `GET /api/v1/sessions/{session_id}/feedback` (accessible to the dyad's mentee, mentor, or an administrator).
  3. **`backend/tests/test_feedback.py`:** 20 automated test assertions verifying valid submissions, uncompleted session rejection, unauthorized user rejection, and duplicate prevention (**20/20 PASS**).

---

### Phase 11: Automated ML Prediction Pipeline & Persistence (Issue #8 / FR-05, FR-06, IR-02 — CLOSED)
* **Date:** 29 October 2026
* **Branch:** `feat/predictions` (Merged via PR #21, commits `a8c58dd`, `99dfeea`, `9ad52d5`)
* **Problem Addressed:** Connect the relational database entities (`Mentee`, `Mentor`, `MentorshipSession`) to the ML inference engine (`IR-02`), generate session effectiveness predictions (`FR-05`) with local TreeSHAP attributions (`FR-06`), and persist outcomes in the `predictions` table.
* **Deliverables & How They Work:**
  1. **`backend/services/prediction_service.py`:**
     * `build_session_features(db, session_id)`: Queries the session, mentee profile, and mentor profile from the database, normalizes domain categories, computes dyad interaction history, and constructs a validated `MentorshipSessionInput` schema.
     * `predict_and_store_session(db, session_id, model_name)`: Runs inference via `MLService`, extracts the binary label (`Effective` / `Ineffective`), probability score, risk factors, recommendation, and top TreeSHAP feature contributions, and upserts the `PredictionRecord` in the `predictions` table.
  2. **Automated Trigger in `backend/routes/feedback.py`:** Submitting post-session feedback automatically triggers `predict_and_store_session`, ensuring every evaluated session has an up-to-date AI effectiveness record.
  3. **`backend/routes/predictions.py`:** Added `POST /api/v1/predictions`, `GET /api/v1/predictions`, `GET /api/v1/predictions/{prediction_id}`, and `GET /api/v1/sessions/{session_id}/prediction` with dyad-level access control.
  4. **`backend/tests/test_predictions.py`:** 34 automated assertions (**34/34 PASS**).

---

### Phase 12: Longitudinal Mentor Quality Profiles & Administrator Analytics (Issue #9 / FR-07, FR-08 — CLOSED)
* **Date:** 29 October 2026
* **Branch:** `feat/9-mentor-quality-admin-analytics` (Merged via PR #22, commits `5735e47`, `e600497`, `c944338`)
* **Problem Addressed:** Aggregate completed sessions, student feedback scores, and AI effectiveness predictions into longitudinal Mentor Quality Profiles (`FR-07`) and provide platform-wide oversight metrics for Administrators (`FR-08`).
* **Deliverables & How They Work:**
  1. **`backend/services/mentor_quality_service.py`:**
     * `compute_mentor_quality(db, mentor_id)`: Calculates total sessions, completed/cancelled/rescheduled counts, unique mentees mentored, mean Likert scores (communication, goal progress, confidence growth, overall rating), AI effectiveness rate percentage, and composite `effectiveness_score`, persisting the result into `mentor_quality_profiles`.
     * `compute_admin_analytics_overview(db)`: Computes platform-wide user totals by role, session status breakdowns, feedback rating averages, ML prediction effectiveness rates, and top-performing mentor rankings.
  2. **`backend/routes/mentors.py` & `backend/routes/analytics.py`:**
     * `GET /api/v1/mentors/{mentor_id}/quality` and `GET /api/v1/mentors/quality-profiles` (`FR-07`).
     * `GET /api/v1/analytics/admin/overview` and `GET /api/v1/analytics/admin/mentors` guarded by `require_roles("administrator")` (`FR-08`, `NFR-02`).
  3. **`backend/tests/test_analytics_admin.py`:** 29 automated assertions verifying profile calculations and strict `403 Forbidden` rejection when mentees or mentors attempt to access admin routes (**29/29 PASS**).

---

### Phase 13: End-to-End Integration Test Suite & Timezone Normalization Fix (Issue #10 — Milestone 1 Complete)
* **Date:** 29 October 2026
* **Branch:** `test/10-integration-core-api-workflows` (Merged via PR #23, commits `1f2ae69`, `6d82494`)
* **Problem / Error Encountered:**
  * **Bug (`TypeError: can't compare offset-naive and offset-aware datetimes`):** During end-to-end integration testing, booking a second session with ISO-8601 UTC strings (`2026-11-15T10:00:00Z`) caused Python to raise `TypeError` inside `check_session_conflict()`.
  * **Root Cause:** Pydantic v2 parsed incoming ISO strings with `"Z"` or `"+00:00"` as timezone-aware `datetime` objects (`tzinfo=timezone.utc`), whereas SQLite returned stored `session_date` columns as timezone-naive `datetime` objects (`tzinfo=None`). Comparing them directly in `max(start_time, existing_start) < min(end_time, existing_end)` crashed.
  * **How It Was Fixed:** Implemented `_to_naive_utc(dt: datetime)` in `backend/services/session_service.py`, which converts any timezone-aware datetime to UTC via `.astimezone(timezone.utc).replace(tzinfo=None)` before performing interval overlap comparisons.
* **Deliverables Implemented:**
  * `backend/tests/test_integration_workflows.py`: 8-stage, 44-assertion end-to-end workflow test verifying registration $\rightarrow$ login $\rightarrow$ mentor discovery $\rightarrow$ session booking $\rightarrow$ conflict prevention $\rightarrow$ completion $\rightarrow$ feedback $\rightarrow$ ML prediction & TreeSHAP $\rightarrow$ mentor quality recalculation $\rightarrow$ admin analytics (**44/44 PASS**).
  * `backend/tests/run_all_tests.py`: Master test runner executing all 7 backend test suites sequentially (**183/183 total assertions passing**).

---

### Phase 14: React 18 + Vite + Tailwind CSS SPA Architecture (Issues #11–#15 — Milestone 2 Prototype)
* **Date:** 5–8 November 2026
* **Branches & PRs:** `feat/11` (PR #25, `3d8e469`, `7408674`), `feat/12` (PR #27, `c003c6c`, `3b44972`), `feat/13` (PR #24, `23fc3c5`, `739949f`), `feat/14` (PR #26, `8f668fa`, `01016bf`), `feat/15` (PR #28, `d5e6f79`, `80cede7`)
* **Problem Addressed:** Transition from the single-file prototype (`frontend/index.html`, archived to `frontend/legacy/index.html`) to a modular, production-grade React 18 Single-Page Application (SPA) powered by Vite and Tailwind CSS where all three user personas can execute their complete workflows in the browser.
* **Deliverables & How They Work:**
  1. **Axios API Client & JWT Interceptor (`frontend/src/api/client.js`):** Configured Axios with `baseURL: '/api/v1'`, a request interceptor that automatically attaches `Authorization: Bearer <token>` from `localStorage`, and a response interceptor that handles `401 Unauthorized` session expiry cleanly.
  2. **Authentication & Toast Contexts (`AuthContext.jsx`, `ToastContext.jsx`):** Provides global reactive state for `user`, `token`, `isAuthenticated`, `login()`, `register()`, `logout()`, and non-blocking toast notifications.
  3. **Role-Guarded Routing (`frontend/src/App.jsx`):** Built `<Private>` and `<RoleGuard roles={[...]}>` wrapper components protecting Mentee (`/mentors`, `/sessions`, `/predict`), Mentor (`/mentor/sessions`, `/mentor/quality`), and Administrator (`/admin/overview`, `/admin/mentors`) screens.
  4. **Bug Encountered & Fixed (Navbar Import Depth):** `src/components/layout/Navbar.jsx` initially used single-level relative imports (`../context/AuthContext`), which failed Vite module resolution because `Navbar.jsx` is nested two levels deep under `src/`. Fixed all imports to `../../context/...` and `../../utils/...`.

---

### Phase 15: Full-Stack Contract Audit, Bug Resolution & Windows UTF-8 Hardening (Issues #16–#17 — Milestone 2 Complete)
* **Date:** 8 November 2026
* **Branches & PRs:** `test/16-e2e-verification-fixes` (PR #29, `03abb79`, `8b6bee5`), `chore/17-final-polish-docs` (PR #30, `08b0a35`, `0fb2695`)
* **Problems / Errors Encountered & How Each Was Resolved:**
  1. **Demo Credentials Mismatch (`src/pages/LoginPage.jsx`):**
     * *Error:* One-click demo login buttons used placeholder emails that did not match `backend/db/seed.py`, causing `401 Unauthorized` on click.
     * *Fix:* Aligned demo buttons to the exact seeded accounts (`michelle.mutinda@strathmore.edu`, `david.mwangi@safaricom.co.ke`, `admin@inua.strathmore.edu` with `Password123!`).
  2. **Admin Role Identifier Mismatch (`src/components/layout/Navbar.jsx`):**
     * *Error:* The Navbar checked `role === 'admin'`, whereas the database and JWT claims store `role === 'administrator'`, hiding admin navigation links after admin login.
     * *Fix:* Updated role checks across `Navbar.jsx` and `App.jsx` to accept `(role === 'administrator' || role === 'admin')`.
  3. **Mentee Registration Payload Field Mismatch (`src/pages/RegisterPage.jsx`):**
     * *Error:* The registration form submitted `academic_level` instead of `career_stage`, triggering a `422 Unprocessable Entity` from `UserRegisterRequest`.
     * *Fix:* Updated form state and payload key to `career_stage` and wired `RegisterPage` to consume the returned `TokenResponse` directly for instant login.
  4. **Session Status Transition Payload Key (`SessionsPage.jsx` & `MentorSessionsPage.jsx`):**
     * *Error:* Frontend `PATCH /api/v1/sessions/{id}/status` sent `{ new_status: ... }`, whereas `SessionStatusUpdateRequest` in `backend/models/schemas.py` required `{ status: ... }`.
     * *Fix:* Standardized the request body to `{ status }` and added transition buttons for `Pending` $\rightarrow$ `Scheduled` / `Cancelled`.
  5. **Incomplete TreeSHAP Data in Session Prediction Modal (`src/pages/mentee/SessionsPage.jsx`):**
     * *Error:* `GET /api/v1/sessions/{id}/prediction` returned only the summary `StoredPredictionResponse` columns from the DB table without live `feature_contributions` or `risk_factors`.
     * *Fix:* Updated `PredictionModal` to invoke `POST /api/v1/predictions` with `{ session_id }`, returning the full `PredictionDetailResponse` including signed TreeSHAP bars, risk factors, and intervention advice.
  6. **Windows PowerShell `UnicodeEncodeError` in Test Runner (`backend/tests/run_all_tests.py`):**
     * *Error:* Running test suites on Windows PowerShell threw `UnicodeEncodeError: 'charmap' codec can't encode character` when printing Unicode checkmarks or arrows under the default `cp1252` console encoding.
     * *Fix:* Added `sys.stdout.reconfigure(encoding="utf-8", errors="replace")` and passed `PYTHONIOENCODING="utf-8"` into subprocess environments.

---

### Phase 16: High-Fidelity Wireframe UI Alignment & Dark-Navy Sidebar Shell
* **Date:** 9 November 2026
* **Commit:** `c1936a3` (`Enhancing LandingPage`)
* **Problem Addressed:** Align the visual layout of the React SPA (`LandingPage.jsx`, `Navbar.jsx`, `LoginPage.jsx`, `RegisterPage.jsx`, `MentorsPage.jsx`) pixel-for-pixel with the 13 high-fidelity design wireframes (`design/wireframes/`).
* **Work Executed & How It Worked:**
  * **Public Homepage (`LandingPage.jsx`):** Implemented the full multi-section landing page matching `inua-public-homepage.png` — Kenyan Tech & Career Hub hero section, 3-step Premise cards (`01 Set Your Direction`, `02 Find Guidance`, `03 Measure Your Growth`), 6 Platform Feature cards, 5-stage Mentorship Journey timeline, Industry Sectors showcase, and live AI Insights preview.
  * **Authenticated Dark-Navy Sidebar Shell (`Navbar.jsx`):** Built a responsive dual-layout navigation shell: public pages render a clean sticky top header, while authenticated pages render a **Dark Navy (`#0B1324`) Left Sidebar** (`MENTEE HUB`, `SESSION HUB`, `AdminPortal`) paired with a contextual top header bar showing the active screen title and user avatar badge.
  * **Mentee Dashboard KPI Header & AI Breakthrough Banner (`MentorsPage.jsx`):** Added the 3 live KPI cards (`Completed Sessions & Goals`, `Hours in Coaching Sessions`, `Next Session Confirmed`), the teal/amber `0.96 Highly Probable Career Breakthrough Anticipated` banner, and interactive domain track filter pills (`All Tracks`, `Technology`, `Finance`, `Cloud`, `Machine Learning`, `Backend`) matching `2-mentee-dashboard.png` and `3-book-mentorship-session.png`.

---

### Phase 17: Mentee Goal Progression (`FR-04` / Wireframe 4) & User Profile Management
* **Date:** 10 November 2026
* **Branch:** `chore/17-final-polish-docs`
* **Problem Addressed:** Wireframe 4 (`4-track-career-goals.png`) and the `goals` database table required dedicated CRUD endpoints and an interactive frontend screen so mentees can create career milestones, check off preparation steps, and track completion velocity, as well as edit their pre-session profile attributes.
* **Deliverables & How They Work:**
  1. **Goal Progression Backend (`backend/routes/goals.py` & `backend/models/schemas.py`):**
     * `GET /api/v1/goals`: Lists all developmental goals for the authenticated mentee ordered by creation date.
     * `POST /api/v1/goals`: Creates a new `Goal` milestone (`goal_title`, `progress_percentage` clamped to `0–100%`).
     * `PATCH /api/v1/goals/{goal_id}`: Updates milestone progress percentage or title with ownership verification (`403 Forbidden` if another mentee attempts modification).
     * `DELETE /api/v1/goals/{goal_id}`: Removes a developmental goal (`204 No Content`).
  2. **Goal Progression Frontend (`frontend/src/pages/mentee/GoalsPage.jsx`):**
     * Displays 4 live Velocity KPI cards (`Active Goals`, `Completed (100%)`, `Completion Velocity %`, `Checklists Cleared`).
     * Provides an interactive **4-Stage Milestone Checklist** on every goal card (`25% Define SMART objective`, `50% Submit pre-session agenda & deliverable draft`, `75% Incorporate mentor technical feedback`, `100% Final review & milestone sign-off`). Clicking any checkpoint immediately calls `PATCH /api/v1/goals/{id}` and animates the progress bar.
  3. **Profile Management Backend & Frontend (`GET/PUT /api/v1/auth/profile` in `backend/routes/auth.py` & `frontend/src/pages/ProfilePage.jsx`):**
     * Allows Mentees (`university`, `career_stage`, `career_interest`) and Mentors (`industry`, `expertise`, `experience_years`) to view and update their domain attributes, which directly feed into the pre-session ML effectiveness predictor.

---

### Phase 18: U-CS 5 (`session-value`) Pre-Session ML Refactoring, Zero-Leakage Time-Split, Baseline Benchmarking & Containerization
* **Date:** 10–11 November 2026
* **Branch:** `chore/17-final-polish-docs`
* **Requirements Covered:** Career Mentor OS Use Case **U-CS 5 (`session-value`)** Service Contract, Lecturer Evaluation Mandate (`baseline -> evaluation -> model -> integration`), Zero Target Leakage, Chronological Time-Series Splitting, and Docker Containerization.
* **Problems / Architectural Gaps Identified & Solved:**
  1. **Problem 1 — Post-Session Target Leakage in Early ML Pipeline:**
     * *Issue:* In Phases 1–3, the classifier included post-session Likert feedback ratings (`career_support_score`, `goal_progress_score`, `confidence_growth_score`, `communication_quality`, `mentor_responsiveness_score`) and `attendance_status` inside the input feature matrix $X$. However, those ratings are only known **after** a session finishes. For Use Case **U-CS 5**, the system must predict whether an upcoming session will be effective **before it takes place** so that a pre-session intervention (e.g., prompting the mentee to submit a 3-point agenda) can be triggered in time.
     * *Solution:* Refactored `ml/generate_dataset.py` and `ml/preprocessing.py` to strictly separate **Pre-Session Features ($X$)** from **Post-Session Outcome Bootstrapping ($Y$)**:
       * **Pre-Session Numerical Features (5):** `leadTimeHours` (booking notice in hours), `hasAgenda` (`0` or `1`), `isFirstSession` (`0` or `1`), `mentor_experience_years`, and `prior_sessions` (`historical_interaction_frequency`).
       * **Pre-Session Categorical Features (9):** `career_stage`, `field_of_study`, `career_interest`, `mentor_industry`, `mentor_specialization`, `mentor_availability`, `session_type`, `meeting_platform`, and `goal_category`.
       * **Strict Leakage Exclusion (`POST_SESSION_LEAKAGE_COLS`):** All 12 post-session variables (`career_support_score`, `psychosocial_support_score`, `communication_quality`, `goal_progress_score`, `confidence_growth_score`, `mentor_responsiveness_score`, `attendance_status`, `session_duration_minutes`, `effectiveness_index`, `session_id`, `created_at`, `mentor_experience_level_encoded`) are completely dropped from $X$ before training and inference. Post-session Likert constructs are used *only offline* during synthetic dataset generation to derive ground-truth binary $Y \in \{0, 1\}$ using the literature threshold ($\text{composite} \ge 3.8 / 5.0$ per Noe, 1988 and Scandura & Ragins, 1993).
  2. **Problem 2 — Random Train/Test Split vs. Chronological Time Split:**
     * *Issue:* Random splitting (`train_test_split(shuffle=True)`) allows future sessions to leak into the training set when predicting earlier sessions.
     * *Solution:* Added monotonically increasing `created_at` UTC timestamps to all 2,000 synthetic sessions in `ml/generate_dataset.py`. In `ml/preprocessing.py`, the dataset is sorted chronologically by `created_at`: the **earliest 80% ($N = 1,600$) forms the training set** and the **most recent 20% ($N = 400$) forms the held-out future test set**, with 5-fold `TimeSeriesSplit` cross-validation during training.
  3. **Problem 3 — Establishing a Measured Heuristic Baseline Before Complex Models:**
     * *Issue:* Per the lecturer's evaluation rules (`documents/00-START-HERE.md` & `MASTER_PROMPT.md`), a complex ML model cannot be graded without first implementing and measuring the simplest rule-based baseline.
     * *Solution:* Implemented `evaluate_heuristic_baseline()` in `ml/train_model.py` and `heuristic_baseline()` in `backend/app/service.py` using the explicit domain rule:
       $$\hat{y}_{\text{baseline}} = \mathbb{I}\big(\text{hasAgenda} == \text{True} \;\wedge\; \text{leadTimeHours} \ge 24\big)$$
       Then benchmarked **Heuristic Baseline $\rightarrow$ Decision Tree $\rightarrow$ AdaBoost $\rightarrow$ Random Forest $\rightarrow$ XGBoost** on the exact same held-out chronological test partition ($N = 400$), saving results to `ml/figures/table_4_5_baseline_benchmark.csv` and `ml/saved_models/baseline_metrics.json`:

| Model / Method | Test Accuracy | Precision | Recall | F1-Score | ROC-AUC | 5-Split TimeSeries CV Mean |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Step 1: Heuristic Baseline** (`hasAgenda & leadTime >= 24h`) | 84.25% | 0.8833 | 0.8731 | 0.8781 | 0.8371 | 84.25% |
| **Baseline 1: Decision Tree** (`max_depth=5`) | 83.00% | 0.8404 | 0.9115 | 0.8745 | 0.8501 | 80.45% |
| **Baseline 2: AdaBoost** (`n_estimators=50`) | **86.50%** | 0.8815 | 0.9154 | **0.8981** | **0.8914** | **82.56%** |
| **Benchmark: Random Forest** (`n_estimators=100`) | 85.50% | 0.8412 | **0.9577** | 0.8957 | 0.8911 | 81.88% |
| **Primary Model: XGBoost + TreeSHAP** (`max_depth=4`) | 85.25% | 0.8681 | 0.9115 | 0.8893 | 0.8864 | 82.33% |

  4. **Problem 4 — U-CS 5 Root Contract & `app.main:app` Import Path Resolution:**
     * *Error Encountered:* External platform graders and Docker containers invoke `uvicorn app.main:app` from the **repository root** and call root `GET /health` and `POST /predict` with `{ menteeId, mentorId, leadTimeHours, hasAgenda, isFirstSession }`. Previously, `app/` lived inside `backend/app/`, so running `uvicorn app.main:app` from the repo root failed with `ModuleNotFoundError: No module named 'app'`, and `/predict` was only mounted under `/api/v1/predict`.
     * *Fix Implemented:*
       * Created a root `app/__init__.py` package bridge extending `__path__` to `backend/app`, allowing `from app.main import app` and `uvicorn app.main:app` to execute identically from either the project root or `backend/`.
       * Implemented Dual-Interface Routing in `backend/app/main.py` and `backend/app/service.py`:
         * Root `GET /health` $\rightarrow$ `{"status": "ok"}`
         * Root `POST /predict` $\rightarrow$ Accepts U-CS 5 contract payload `{ menteeId, mentorId, leadTimeHours, hasAgenda, isFirstSession, method }`, resolves `mentorId` and `menteeId` against the database (with safe fallback for synthetic grader IDs), runs either `method="xgboost"` (with TreeSHAP factors) or `method="baseline"`, and returns `{ probability, factors, suggestedIntervention, isSynthetic: true, method }`.
       * Added `tests/test_contract.py` to automatically verify the U-CS 5 contract endpoints (`[PASS] All U-CS 5 root contract tests passed!`).
  5. **Problem 5 — Cloud PostgreSQL URI Dialect Compatibility (`postgres://` vs. `postgresql://`):**
     * *Error Encountered:* Managed cloud hosts (Render, Railway, Heroku) inject `DATABASE_URL` starting with `postgres://`, which SQLAlchemy 2.0 rejects with `NoSuchModuleError: Can't load plugin: sqlalchemy.dialects:postgres`.
     * *Fix Implemented:* Added URI normalization in `backend/db/session.py` (`normalized_db_url.replace("postgres://", "postgresql://", 1)`) and configured connection pooling (`pool_pre_ping=True`, `pool_size=5`, `max_overflow=10`).
  6. **Deployment & One-Click Tooling (`Dockerfile`, `.env.example`, `demo/index.html`, `start_inua.bat`):**
     * Created `Dockerfile` (`python:3.11-slim`) and root `requirements.txt` for zero-config container builds.
     * Created `demo/index.html` mounted at `/demo` for instant U-CS 5 payload testing.
     * Created `start_inua.bat` to launch both the FastAPI backend (`http://127.0.0.1:8000`) and React Vite frontend (`http://localhost:5173`) in one click on Windows.

---

## 3. Summary of Errors & Bugs Encountered and How They Were Resolved

| # | Phase / Date | Component | Error / Issue Encountered | Root Cause | Engineering Fix Applied |
| :- | :--- | :--- | :--- | :--- | :--- |
| **1** | Phase 4 (1 Oct 2026) | `ml/predict.py` | Every predicted session returned the exact same top features and weights regardless of session quality. | Used static global `model.feature_importances_` instead of instance-specific local attributions; `mentor_experience_level_encoded` duplicated `mentor_experience_years`. | Implemented **TreeSHAP** (`xgboost.DMatrix` with `pred_contribs=True`) for signed per-session log-odds attributions and dropped the collinear column. |
| **2** | Phase 7 (1 Oct 2026) | `ml/models/` vs `ml/saved_models/` | Model loader ambiguity between early 78% prototype pickles and calibrated ensemble models. | Legacy artifacts from initial experiments remained in `ml/models/`. | Pruned `ml/models/` and locked `MODELS_DIR = ML_DIR / "saved_models"` in `backend/app/config.py`. |
| **3** | Phase 9 (22 Oct 2026) | `frontend/index.html` | Login modal blocked the landing page on initial page load; `/health` badge displayed `undefined` models count. | Modal CSS lacked initial `display: none`; health endpoint returned an array `models_loaded` rather than an integer. | Hid modal overlays by default and updated health check parser to inspect `models_loaded.length`. |
| **4** | Phase 13 (29 Oct 2026) | `backend/services/session_service.py` | `TypeError: can't compare offset-naive and offset-aware datetimes` during session conflict detection. | Pydantic parsed ISO-8601 `"Z"` timestamps as UTC-aware datetimes, whereas SQLite returned naive datetimes. | Added `_to_naive_utc(dt)` helper converting aware timestamps to UTC and stripping `tzinfo` before interval comparison. |
| **5** | Phase 14 (5 Nov 2026) | `frontend/src/components/layout/Navbar.jsx` | Vite build error: failed to resolve `../context/AuthContext` from `Navbar.jsx`. | `Navbar.jsx` was placed inside `src/components/layout/` (two levels deep) but used single-level `../` relative paths. | Updated imports in `Navbar.jsx` to `../../context/AuthContext`, `../../context/ToastContext`, and `../../utils/helpers`. |
| **6** | Phase 15 (8 Nov 2026) | `LoginPage.jsx`, `Navbar.jsx`, `RegisterPage.jsx`, `SessionsPage.jsx` | 5 full-stack integration mismatches: demo login `401`, missing Admin navbar links, mentee registration `422`, status update `422`, and missing SHAP bars in session modal. | Seed email mismatch; `admin` vs `administrator` role string; `academic_level` vs `career_stage`; `{ new_status }` vs `{ status }`; `GET` summary vs `POST /predictions` detail response. | Aligned demo emails to `seed.py`; checked `administrator` role; sent `career_stage` and `{ status }`; updated `PredictionModal` to call `POST /api/v1/predictions`. |
| **7** | Phase 15 (8 Nov 2026) | `backend/tests/run_all_tests.py` | `UnicodeEncodeError: 'charmap' codec can't encode character` on Windows PowerShell terminals. | Windows Python subprocesses defaulted to `cp1252` console encoding when printing UTF-8 symbols. | Added `sys.stdout.reconfigure(encoding="utf-8", errors="replace")` and injected `PYTHONIOENCODING="utf-8"` into test subprocesses. |
| **8** | Phase 18 (10 Nov 2026) | `ml/preprocessing.py` & `ml/train_model.py` | Post-session feedback scores leaked into pre-session prediction; random split leaked temporal ordering; no heuristic baseline benchmark existed. | Initial pipeline used post-session Likert scores as input $X$ and shuffled train/test splits randomly. | Excluded all 12 post-session columns from $X$; sorted chronologically by `created_at` (earliest 80% train / latest 20% test); implemented and benchmarked Step 1 Heuristic Baseline (`84.25%` acc) against Decision Tree, AdaBoost (`86.50%`), Random Forest (`85.50%`), and XGBoost (`85.25%`, `0.8864` ROC-AUC). |
| **9** | Phase 18 (11 Nov 2026) | `app/__init__.py` & `backend/db/session.py` | `ModuleNotFoundError: No module named 'app'` when running `uvicorn app.main:app` from repo root; `postgres://` URI rejection in SQLAlchemy 2.0. | `app` package was nested inside `backend/`; cloud hosts use `postgres://` prefix. | Added root `app/__init__.py` namespace bridge and normalized `postgres://` to `postgresql://` in `session.py`. |

---

## 4. Complete Feature Inventory & How the System Works End-to-End

### 4.1 System Personas & Workflows
1. **Mentee Workflow (`michelle.mutinda@strathmore.edu`):**
   * **Dashboard & Mentor Discovery (`/mentors`):** Views live KPI cards (completed sessions, coaching hours, next session date), AI breakthrough banner, and filters verified mentors by track or keyword.
   * **Session Booking (`BookingModal` $\rightarrow$ `POST /api/v1/sessions/book`):** Selects session type, goal category, date/time, duration, platform, and agenda notes. Backend checks mentor and mentee calendars for interval overlaps (`409 Conflict` if busy) and increments dyad `interaction_frequency`.
   * **Goal Progression (`/goals` $\rightarrow$ `GET/POST/PATCH/DELETE /api/v1/goals`):** Tracks developmental targets, completion velocity, and toggles 4-stage SMART milestone checklists (`25%`, `50%`, `75%`, `100%`).
   * **Session Lifecycle & Feedback (`/sessions` $\rightarrow$ `PATCH /sessions/{id}/status`, `POST /sessions/{id}/feedback`):** Transitions session status (`Scheduled` $\rightarrow$ `Completed`), submits 1–5 Likert feedback ratings, and opens the **AI TreeSHAP Diagnosis Modal** showing effectiveness probability, signed feature drivers, risk factors, and recommended intervention.
   * **Pre-Session Effectiveness Predictor (`/predict` $\rightarrow$ `POST /api/v1/predict`):** Interactive U-CS 5 sandbox where mentees adjust pre-session readiness parameters (`leadTimeHours`, `hasAgenda`, `isFirstSession`, `prior_sessions`, `mentor_experience_years`) and compare `XGBoost`, `Decision Tree`, `AdaBoost`, `Random Forest`, and `Heuristic Baseline` predictions before a session happens.
2. **Mentor Workflow (`david.mwangi@safaricom.co.ke`):**
   * **Mentor Sessions Hub (`/mentor/sessions`):** Filters assigned mentorship bookings (`All`, `Scheduled`, `Completed`, `Cancelled`, `Rescheduled`), marks sessions completed, and reads student feedback evaluations.
   * **Longitudinal Quality Profile (`/mentor/quality` $\rightarrow$ `GET /api/v1/mentors/quality-profiles`):** Displays the mentor's AI effectiveness rate percentage, Likert rating breakdowns (communication, goal progress, confidence growth, overall), completed session volume, and qualitative student reflections.
3. **Administrator Workflow (`admin@inua.strathmore.edu`):**
   * **Platform Overview (`/admin/overview` $\rightarrow$ `GET /api/v1/analytics/admin/overview`):** Displays system-wide KPIs (total users by role, session status distribution, platform satisfaction averages, ML effectiveness rate, and top mentors).
   * **Mentor Audit Rankings (`/admin/mentors` $\rightarrow$ `GET /api/v1/analytics/admin/mentors`):** Searchable, sortable quality audit table of all mentors with drill-down inspection modals.
4. **U-CS 5 Career Mentor OS Grader Contract (`GET /health` & `POST /predict`):**
   * Exposes the exact standardized microservice contract at root level for cross-team integration and automated grading.

---

## 5. How to Run & Verify the Project (Examiner & Reviewer Guide)

### Option A: One-Click Windows Launcher (Full-Stack)
From the project root on Windows:
```powershell
.\start_inua.bat
```
* Automatically launches the **FastAPI Backend** on `http://127.0.0.1:8000` (Swagger UI at `http://127.0.0.1:8000/docs` and U-CS 5 Demo at `http://127.0.0.1:8000/demo`) and the **React + Vite Frontend** on `http://localhost:5173`.

### Option B: Step-by-Step Terminal Verification

#### Step 1: Run the U-CS 5 Root Contract Test
```powershell
python tests/test_contract.py
```
*Expected Output:* `[PASS] All U-CS 5 root contract tests passed!`

#### Step 2: Run the Machine Learning Pipeline & TreeSHAP Tests
```powershell
python ml/tests/test_pipeline.py
python ml/tests/test_predict.py
```
*Expected Output:* Confirms 2,000 synthetic records (`isSynthetic=True`), chronological 80/20 split, zero post-session leakage in $X$, and opposite TreeSHAP contribution polarities for prepared vs. unprepared sessions.

#### Step 3: Run the Complete Backend & End-to-End Integration Test Suite (7 Suites, 183 Assertions)
```powershell
python backend/tests/run_all_tests.py
```
*Expected Output:*
```text
Total Test Suites Executed : 7
Suites Passed              : 7
Suites Failed              : 0
ALL BACKEND MVP TEST SUITES PASSED WITH 100% SUCCESS!
```

#### Step 4: Start the Backend & Frontend Manually
```powershell
# Terminal 1 — FastAPI Backend (works from repo root via uvicorn or backend/run.py)
uvicorn app.main:app --reload --port 8000

# Terminal 2 — React 18 + Vite Frontend
cd frontend
npm install
npm run dev
```

### Pre-Seeded Demo Accounts (One-Click Login Available on `/login`)
| Persona | Email | Password |
| :--- | :--- | :--- |
| **Mentee (Student)** | `michelle.mutinda@strathmore.edu` | `Password123!` |
| **Mentor (Advisor)** | `david.mwangi@safaricom.co.ke` | `Password123!` |
| **Administrator** | `admin@inua.strathmore.edu` | `Password123!` |
