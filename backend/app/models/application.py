from datetime import datetime, timezone

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    ForeignKey
)

from app.core.database import Base


class Application(Base):

    __tablename__ = "applications"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False
    )

    scheme_id = Column(
        String(100),
        nullable=False
    )

    status = Column(
        String(100),
        default="Submitted"
    )

    stage = Column(
        String(100),
        default="Initial Review"
    )

    amount = Column(
        Integer,
        default=0
    )

    payment = Column(
        String(100),
        default="Not Disbursed"
    )

    deficiency = Column(
        String(500),
        nullable=True
    )

    submitted_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )