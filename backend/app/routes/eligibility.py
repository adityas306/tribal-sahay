from fastapi import APIRouter, Depends

from app.core.security import get_current_user
from app.models.user import User

from app.services.eligibility import check_eligibility


router = APIRouter(
    prefix="/api/eligibility",
    tags=["Eligibility"]
)


@router.get("")
def eligibility(
    user: User = Depends(get_current_user)
):

    return check_eligibility(user)