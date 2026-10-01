"""
INUA Mentorship Platform: Database Engine & Session Management
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Sprint: Week 1 · Database Infrastructure (feat(db))
"""

import sys
from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

# Ensure backend root is on sys.path
BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.config import DATABASE_URL

# Handle SQLite concurrency & connection arguments
connect_args = {}
if DATABASE_URL.startswith("sqlite"):
    connect_args["check_same_thread"] = False

# Create Engine
engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args,
    echo=False,
    future=True,
)

# Session Factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True,
)

# Declarative Base for ORM Entities
Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
    """FastAPI dependency yielding isolated transactional database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Creates all defined database tables if they do not already exist."""
    # Import all models to ensure they are registered with Base.metadata
    from models import database  # noqa: F401
    Base.metadata.create_all(bind=engine)
