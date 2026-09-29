from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.application import Application
from app.models.document import Document


router = APIRouter(
    prefix="/api/stats",
    tags=["Dashboard"]
)


@router.get("")
def get_stats(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    applications = (
        db.query(Application)
        .filter(
            Application.user_id == user.id
        )
        .count()
    )

    documents = (
        db.query(Document)
        .filter(
            Document.user_id == user.id
        )
        .all()
    )

    verified = sum(
        d.status == "Verified"
        for d in documents
    )

    pending = sum(
        d.status != "Verified"
        for d in documents
    )

    return {
        "total_schemes": 5,
        "applications": applications,
        "verified_documents": verified,
        "pending_actions": pending
    }