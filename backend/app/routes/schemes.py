from fastapi import APIRouter

from app.services.eligibility import SCHEMES


router = APIRouter(
    prefix="/api/schemes",
    tags=["Scholarship Schemes"]
)


@router.get("")
def get_schemes():

    return SCHEMES