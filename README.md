# Inua

**Supporting Career Mentorship Outcomes Among University Students and Early-Career Professionals in Kenya: An XGBoost-Based System for Predicting Session Effectiveness**

Capstone project — Mutinda Michelle Mutio (154727), Strathmore University, School of Computing and Engineering Sciences. Supervisor: Dr. Dickson Owuor.

*Inua* is Swahili for "to lift up" — a digital mentorship platform that moves mentorship evaluation from subjective ratings to objective, predictive assessment using structured session data and an XGBoost classifier.

## Repository structure

```
Inua/
├── docs/                    Proposal, full report, defense materials
│   ├── proposal/
│   ├── full-report/
│   └── defense/
├── design/                  All system design artifacts
│   ├── diagrams/            Use case, class, ERD, logical schema, architecture (PNG + SVG + .mmd source)
│   ├── wireframes/          Mentee / mentor / admin screen flows
│   └── prototypes/          Interactive HTML demos (open directly in a browser)
├── ml/                      Modelling implementation (dataset, preprocessing, training, prediction)
│   ├── data/                Generated dataset (gitignored by default, regenerate via script)
│   ├── models/              Trained model artifacts (gitignored, regenerate via script)
│   └── tests/                Pytest suite
├── backend/                 REST API (not yet started -- see backend/README.md)
├── frontend/                React app (not yet started -- see frontend/README.md)
├── ROADMAP.md               The 2-week implementation plan
├── WORKFLOW.md               Git/GitHub conventions used on this project
└── .vscode/                  Shared editor config (settings, recommended extensions, debug configs)
```

## Getting started (VS Code)

1. Open the `Inua/` folder as a VS Code workspace (not a subfolder).
2. Install the recommended extensions when prompted (or `Extensions: Show Recommended Extensions`).
3. Set up the ML environment:
   ```bash
   cd ml
   python3 -m venv .venv
   source .venv/bin/activate      # Windows: .venv\Scripts\activate
   pip install -r requirements.txt
   ```
4. Run the pipeline (or use the debug configs in the Run and Debug panel):
   ```bash
   python generate_dataset.py
   python train_model.py
   python predict.py
   pytest tests/ -v
   ```

## Status

- [x] Proposal (Chapters 1–3), reviewed and corrected
- [x] Chapter 4 — system requirements, analysis and design diagrams
- [x] Modelling pipeline — dataset generation, preprocessing, training (XGBoost vs Random Forest vs AdaBoost), prediction interface, tests
- [ ] Backend REST API
- [ ] Frontend
- [ ] Integration
- [ ] Testing & deployment (prototype)

See `ROADMAP.md` for the day-by-day plan and `WORKFLOW.md` for how this repository is meant to be used (branches, commits, issues, milestones).
