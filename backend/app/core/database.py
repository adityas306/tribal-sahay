from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from app.core.config import settings


# --------------------------------------------------
# Database URL
# --------------------------------------------------

DATABASE_URL = settings.DATABASE_URL


# --------------------------------------------------
# SQLite configuration
# --------------------------------------------------

connect_args = {}

if DATABASE_URL.startswith("sqlite"):
    connect_args = {
        "check_same_thread": False
    }


# --------------------------------------------------
# Engine
# --------------------------------------------------

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)


# --------------------------------------------------
# Session
# --------------------------------------------------

SessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False
)


# --------------------------------------------------
# Base
# --------------------------------------------------

Base = declarative_base()


# --------------------------------------------------
# Database Dependency
# --------------------------------------------------

def get_db():

    db = SessionLocal()

    try:
        yield db

    finally:
        db.close()