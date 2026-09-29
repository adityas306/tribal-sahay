from pydantic import BaseModel


class ApplicationCreate(BaseModel):

    scheme_id: str


class ApplicationResponse(BaseModel):

    id: int
    scheme_id: str
    status: str
    stage: str
    amount: int
    payment: str
    deficiency: str | None
    submitted_at: str