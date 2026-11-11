"""
INUA Mentorship Platform: Database Engine & Session Management
Author: Michelle (Final Year Project - BICS Year 4, Strathmore University)
Supports live PostgreSQL (primary production/staging database via DATABASE_URL)
with graceful SQLite fallback for isolated local test execution.
"""

import sys
from pathlib import Path
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker, Session

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.config import DATABASE_URL

# Normalize Render/Heroku style postgres:// URI to SQLAlchemy 2.0 postgresql://
normalized_db_url = DATABASE_URL
if normalized_db_url.startswith("postgres://"):
    normalized_db_url = normalized_db_url.replace("postgres://", "postgresql://", 1)

connect_args = {}
engine_kwargs = {
    "echo": False,
    "future": True,
    "pool_pre_ping": True,
}

if normalized_db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False
else:
    engine_kwargs["pool_size"] = 5
    engine_kwargs["max_overflow"] = 10

engine = create_engine(
    normalized_db_url,
    connect_args=connect_args,
    **engine_kwargs,
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True,
)

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
    from models import database  # noqa: F401
    Base.metadata.create_all(bind=engine)
