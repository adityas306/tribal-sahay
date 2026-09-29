from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.application import Application
from app.models.document import Document

from app.schemas.chat import ChatRequest

from app.services.eligibility import check_eligibility


router = APIRouter(
    prefix="/api/chat",
    tags=["JAGO"]
)


@router.post("")
def chat(
    req: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    q = req.message.lower().strip()

    applications = (
        db.query(Application)
        .filter(
            Application.user_id == user.id
        )
        .order_by(
            Application.submitted_at.desc()
        )
        .all()
    )

    documents = (
        db.query(Document)
        .filter(
            Document.user_id == user.id
        )
        .all()
    )

    if "status" in q or "application" in q:

        if not applications:

            return {
                "reply":
                "You have not submitted any scholarship application yet."
            }

        latest = applications[0]

        return {
            "reply":
            f"Your latest application status is "
            f"{latest.status}. "
            f"Current stage: {latest.stage}."
        }

    if (
        "document" in q
        or "documents" in q
        or "doc" in q
    ):

        pending = [
            d.name
            for d in documents
            if d.status != "Verified"
        ]

        if pending:

            return {
                "reply":
                "Pending document actions: "
                + ", ".join(pending)
            }

        return {
            "reply":
            "All your uploaded documents are verified."
        }

    if (
        "scholarship" in q
        or "eligible" in q
        or "eligibility" in q
        or "which" in q
    ):

        eligible = [
            x["name"]
            for x in check_eligibility(user)
            if x["eligible"]
        ]

        if not eligible:

            return {
                "reply":
                "No matching scheme was found by the demo eligibility engine. "
                "Please check official scheme criteria."
            }

        return {
            "reply":
            "Based on the demo eligibility engine, "
            "matching schemes are: "
            + ", ".join(eligible)
            + ". Final eligibility must be verified "
              "against official scheme rules."
        }

    if (
        "payment" in q
        or "dbt" in q
    ):

        if not applications:

            return {
                "reply":
                "There is no scholarship application to show payment status for."
            }

        return {
            "reply":
            f"Your latest application payment status is: "
            f"{applications[0].payment}."
        }

    if "hello" in q or "hi" in q:

        return {
            "reply":
            "Hello! I am JAGO, your TribalSahay scholarship assistant. "
            "You can ask me about eligibility, applications, documents "
            "or payment status."
        }

    return {
        "reply":
        "I can help with scholarship eligibility, application status, "
        "documents, verification, payment/DBT status and scheme information."
    }