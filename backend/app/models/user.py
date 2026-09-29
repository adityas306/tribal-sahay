from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime
)

from app.core.database import Base


class User(Base):

    __tablename__ = "users"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(120),
        nullable=False
    )

    email = Column(
        String(200),
        unique=True,
        index=True,
        nullable=False
    )

    password_hash = Column(
        String(255),
        nullable=False
    )

    phone = Column(
        String(20),
        default=""
    )

    state = Column(
        String(100),
        default="Uttar Pradesh"
    )

    category = Column(
        String(20),
        default="ST"
    )

    income = Column(
        Integer,
        default=0
    )

    education = Column(
        String(100),
        default="College"
    )

    course = Column(
        String(150),
        default=""
    )

    year = Column(
        Integer,
        default=1
    )

    institution = Column(
        String(200),
        default=""
    )

    has_disability = Column(
        Boolean,
        default=False
    )

    net_jrf = Column(
        Boolean,
        default=False
    )

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )