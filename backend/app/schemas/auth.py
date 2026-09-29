from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):

    name: str = Field(
        min_length=2,
        max_length=120
    )

    email: EmailStr

    password: str = Field(
        min_length=6
    )

    phone: str = ""

    state: str = "Uttar Pradesh"

    category: str = "ST"

    income: int = 0

    education: str = "College"

    course: str = "B.Tech"

    year: int = 1

    institution: str = ""

    has_disability: bool = False

    net_jrf: bool = False


class LoginRequest(BaseModel):

    email: EmailStr

    password: str


class UserResponse(BaseModel):

    id: int
    name: str
    email: str
    phone: str
    state: str
    category: str
    income: int
    education: str
    course: str
    year: int
    institution: str
    has_disability: bool
    net_jrf: bool


class AuthResponse(BaseModel):

    message: str
    token: str
    user: UserResponse