from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    get_current_user
)

from app.models.user import User
from app.schemas.auth import (
    RegisterRequest,
    LoginRequest
)


router = APIRouter(
    prefix="/api/auth",
    tags=["Authentication"]
)


def user_data(user):

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


@router.post("/register")
def register(
    data: RegisterRequest,
    db: Session = Depends(get_db)
):

    existing = (
        db.query(User)
        .filter(User.email == data.email.lower())
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Account already exists"
        )

    user = User(
        name=data.name.strip(),
        email=data.email.lower(),
        password_hash=hash_password(data.password),
        phone=data.phone,
        state=data.state,
        category=data.category,
        income=data.income,
        education=data.education,
        course=data.course,
        year=data.year,
        institution=data.institution,
        has_disability=data.has_disability,
        net_jrf=data.net_jrf
    )

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Account created successfully"
    }


@router.post("/login")
def login(
    data: LoginRequest,
    db: Session = Depends(get_db)
):

    user = (
        db.query(User)
        .filter(User.email == data.email.lower())
        .first()
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(
        data.password,
        user.password_hash
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    token = create_access_token(user.id)

    return {
        "message": "Login successful",
        "token": token,
        "user": user_data(user)
    }


@router.get("/me")
def me(
    user: User = Depends(get_current_user)
):

    return user_data(user)


@router.get("/profile")
def profile(
    user: User = Depends(get_current_user)
):

    return user_data(user)