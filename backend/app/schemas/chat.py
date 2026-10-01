from pydantic import BaseModel, Field


class ChatHistoryItem(BaseModel):

    role: str
    text: str


class ChatRequest(BaseModel):

    message: str = Field(
        min_length=1,
        max_length=5000
    )

    history: list[ChatHistoryItem] = []