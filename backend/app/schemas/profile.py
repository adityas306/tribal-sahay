from pydantic import BaseModel, Field


class ProfileUpdateRequest(BaseModel):

    name: str = Field(
        min_length=2,
        max_length=120
    )

    phone: str = ""

    state: str = ""

    income: int = 0

    education: str = ""

    course: str = ""

    year: int = 1

    institution: str = ""

    has_disability: bool = False

    net_jrf: bool = False