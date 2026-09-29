from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from jose import jwt, JWTError

from passlib.context import CryptContext

from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.models.user import User


# --------------------------------------------------
# JWT
# --------------------------------------------------

ALGORITHM = "HS256"


# --------------------------------------------------
# Password Hashing
# --------------------------------------------------

# bcrypt compatibility issue avoid karne ke liye
# PBKDF2-SHA256 use kiya gaya hai.
pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    deprecated="auto"
)


# --------------------------------------------------
# HTTP Authentication
# --------------------------------------------------

security = HTTPBearer()


# --------------------------------------------------
# Password Functions
# --------------------------------------------------

def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# --------------------------------------------------
# JWT Access Token
# --------------------------------------------------

def create_access_token(user_id: int) -> str:

    expire = datetime.now(timezone.utc) + timedelta(
        hours=24
    )

    payload = {
        "sub": str(user_id),
        "exp": expire
    }

    return jwt.encode(
        payload,
        settings.SECRET_KEY,
        algorithm=ALGORITHM
    )


# --------------------------------------------------
# Current User
# --------------------------------------------------

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):

    token = credentials.credentials

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired token"
    )

    try:

        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("sub")

        if not user_id:
            raise credentials_exception

    except JWTError:

        raise credentials_exception

    try:
        user_id = int(user_id)
    except (ValueError, TypeError):
        raise credentials_exception

    user = db.get(User, user_id)

    if not user:
        raise credentials_exception

    return user