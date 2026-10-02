from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.application import Application
from app.models.document import Document

from app.schemas.chat import ChatRequest
from app.services.jago_ai import stream_jago_response


router = APIRouter(
    prefix="/api/chat",
    tags=["JAGO"]
)


def needs_database(message):

    keywords = [
        "application",
        "status",
        "scholarship",
        "document",
        "documents",
        "eligibility",
        "eligible",
        "payment",
        "apply",
        "आवेदन",
        "छात्रवृत्ति",
        "दस्तावेज",
        "पेमेंट",
        "पैसा",
        "योग्यता"
    ]

    message = message.lower()

    return any(
        word in message
        for word in keywords
    )


def build_context(user, db, message):

    context = {
        "name": getattr(user, "name", None),
        "state": getattr(user, "state", None),
        "category": getattr(user, "category", None),
        "education": getattr(user, "education", None),
        "course": getattr(user, "course", None),
        "year": getattr(user, "year", None),
    }

    if not needs_database(message):
        return context

    applications = (
        db.query(Application)
        .filter(
            Application.user_id == user.id
        )
        .limit(5)
        .all()
    )

    documents = (
        db.query(Document)
        .filter(
            Document.user_id == user.id
        )
        .limit(10)
        .all()
    )

    context["applications"] = [
        {
            "id": getattr(app, "id", None),
            "status": getattr(app, "status", None)
        }
        for app in applications
    ]

    context["documents"] = [
        {
            "name": getattr(doc, "name", None),
            "status": getattr(doc, "status", None)
        }
        for doc in documents
    ]

    return context


@router.post("")
def chat(
    request: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    context = build_context(
        user,
        db,
        request.message
    )

    def generate():

        try:

            for text in stream_jago_response(
                message=request.message,
                context=context,
                history=request.history
            ):
                yield f"data: {text}\n\n"

            yield "data: [DONE]\n\n"

        except Exception as error:

            print(
                "JAGO ERROR:",
                error
            )

            yield (
                "data: JAGO temporarily "
                "unavailable.\n\n"
            )

            yield "data: [DONE]\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"
        }
    )