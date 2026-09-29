from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.application import Application

from app.schemas.application import ApplicationCreate

from app.services.eligibility import SCHEMES


router = APIRouter(
    prefix="/api/applications",
    tags=["Applications"]
)


def application_data(application):

    return {
        "id": application.id,
        "scheme_id": application.scheme_id,
        "status": application.status,
        "stage": application.stage,
        "amount": application.amount,
        "payment": application.payment,
        "deficiency": application.deficiency,
        "submitted_at": application.submitted_at.isoformat()
    }


@router.get("")
def get_applications(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    applications = (
        db.query(Application)
        .filter(Application.user_id == user.id)
        .order_by(Application.submitted_at.desc())
        .all()
    )

    return [
        application_data(a)
        for a in applications
    ]


@router.post("")
def create_application(
    data: ApplicationCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    scheme = next(
        (
            s for s in SCHEMES
            if s["id"] == data.scheme_id
        ),
        None
    )

    if not scheme:

        raise HTTPException(
            status_code=404,
            detail="Scheme not found"
        )

    existing = (
        db.query(Application)
        .filter(
            Application.user_id == user.id,
            Application.scheme_id == data.scheme_id
        )
        .first()
    )

    if existing:

        raise HTTPException(
            status_code=400,
            detail="Application already exists"
        )

    application = Application(
        user_id=user.id,
        scheme_id=data.scheme_id,
        status="Submitted",
        stage="Initial Review",
        amount=0,
        payment="Not Disbursed",
        deficiency=None,
        submitted_at=datetime.now(timezone.utc)
    )

    db.add(application)
    db.commit()
    db.refresh(application)

    return application_data(application)


@router.post("/{scheme_id}")
def create_application_by_scheme(
    scheme_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return create_application(
        ApplicationCreate(scheme_id=scheme_id),
        user,
        db
    )