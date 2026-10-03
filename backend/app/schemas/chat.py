from typing import Literal

from pydantic import BaseModel, Field


class ChatHistoryItem(BaseModel):

    role: Literal["user", "assistant", "bot"]
    text: str = Field(
        min_length=1,
        max_length=5000
    )


class ChatRequest(BaseModel):

    message: str = Field(
        min_length=1,
        max_length=5000
    )

    history: list[ChatHistoryItem] = Field(
        default_factory=list
    )

    language: Literal[
        "auto",
        "english",
        "hindi",
        "hinglish"
    ] = "auto"

    conversation_id: int | None = None


class ConversationRenameRequest(BaseModel):

    title: str = Field(
        min_length=1,
        max_length=200
    )


class ConversationLanguageRequest(BaseModel):

    language: Literal[
        "auto",
        "english",
        "hindi",
        "hinglish"
    ]