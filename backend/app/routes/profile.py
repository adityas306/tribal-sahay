from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.user import User

from app.schemas.profile import ProfileUpdateRequest


router = APIRouter(
    prefix="/api/profile",
    tags=["Profile"]
)


def profile_data(user):

    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "phone": user.phone,
        "state": user.state,
        "category": user.category,
        "income": user.income,
        "education": user.education,
        "course": user.course,
        "year": user.year,
        "institution": user.institution,
        "has_disability": user.has_disability,
        "net_jrf": user.net_jrf
    }


@router.get("")
def get_profile(
    user: User = Depends(get_current_user)
):

    return profile_data(user)


@router.put("")
def update_profile(
    data: ProfileUpdateRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    user.name = data.name
    user.phone = data.phone
    user.state = data.state
    user.income = data.income
    user.education = data.education
    user.course = data.course
    user.year = data.year
    user.institution = data.institution
    user.has_disability = data.has_disability
    user.net_jrf = data.net_jrf

    db.commit()
    db.refresh(user)

    return profile_data(user)