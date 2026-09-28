# Backend (not yet started)

This folder will hold the REST API (Section 3.5.5, Chapter 4 IR-01/IR-02)
that connects the React frontend to the `ml/` prediction pipeline and the
PostgreSQL database defined in `design/diagrams/logical_database_schema.png`.

## Planned structure (fill in as you build)

```
backend/
├── app/
│   ├── main.py              # FastAPI app entrypoint
│   ├── routes/
│   │   ├── auth.py          # FR-01
│   │   ├── sessions.py      # FR-02, FR-03
│   │   ├── feedback.py      # FR-04
│   │   └── predictions.py   # FR-05, FR-06, IR-02 -- calls ml/predict.py
│   ├── models/               # SQLAlchemy models matching the logical schema
│   └── db.py
├── requirements.txt
└── tests/
```

## Before you start

- Confirm the physical database schema against `design/diagrams/logical_database_schema.png` (already logical only -- physical types belong here).
- The `ml/predict.py` function is the contract your `/predictions` route should call. Don't re-implement prediction logic in the backend -- import from `ml/`.
