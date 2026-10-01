from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.application import Application
from app.models.document import Document

from app.schemas.chat import ChatRequest

from app.services.eligibility import check_eligibility
from app.services.jago_ai import generate_jago_response


router = APIRouter(
    prefix="/api/chat",
    tags=["JAGO"]
)


def build_user_context(
    user: User,
    applications: list,
    documents: list
):

    application_data = []

    for app in applications:

        application_data.append({
            "id": app.id,
            "scheme_id": app.scheme_id,
            "status": app.status,
            "stage": app.stage,
            "amount": app.amount,
            "payment": app.payment,
            "deficiency": app.deficiency,
            "submitted_at": app.submitted_at
        })


    document_data = []

    for doc in documents:

        document_data.append({
            "name": doc.name,
            "status": doc.status
        })


    try:

        eligibility_data = check_eligibility(user)

    except Exception:

        eligibility_data = []


    return {

        "user": {
            "name": user.name,
            "state": user.state,
            "category": user.category,
            "income": user.income,
            "education": user.education,
            "course": user.course,
            "year": user.year,
            "institution": user.institution,
            "has_disability": user.has_disability,
            "net_jrf": user.net_jrf
        },

        "applications": application_data,

        "documents": document_data,

        "eligibility": eligibility_data
    }


@router.post("")
def chat(
    req: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

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


    context = build_user_context(
        user,
        applications,
        documents
    )


    history = getattr(
        req,
        "history",
        []
    )


    try:

        reply = generate_jago_response(
            message=req.message,
            context=context,
            history=history
        )

        return {
            "reply": reply,
            "ai": True
        }

    except Exception as e:

        print(
            "JAGO AI ERROR:",
            str(e)
        )

        return {
            "reply": (
                "JAGO AI ko abhi AI service se connect "
                "karne mein problem aa rahi hai. "
                "Please thodi der baad try karo."
            ),
            "ai": False
        }