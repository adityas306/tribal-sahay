import os
import uuid

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    HTTPException
)

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.document import Document


router = APIRouter(
    prefix="/api/documents",
    tags=["Documents"]
)


UPLOAD_DIR = "uploads"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png"
}


def document_data(document):

    return {
        "id": document.id,
        "name": document.name,
        "filename": document.filename,
        "source": document.source,
        "status": document.status,
        "uploaded_at": document.uploaded_at.isoformat()
    }


@router.get("")
def get_documents(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    docs = (
        db.query(Document)
        .filter(Document.user_id == user.id)
        .order_by(Document.uploaded_at.desc())
        .all()
    )

    return [
        document_data(d)
        for d in docs
    ]


@router.post("")
async def upload_document(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    original_name = file.filename or "document"

    extension = os.path.splitext(
        original_name
    )[1].lower()

    if extension not in ALLOWED_EXTENSIONS:

        raise HTTPException(
            status_code=400,
            detail="Only PDF, JPG, JPEG and PNG files are allowed"
        )

    content = await file.read()

    if len(content) > 10 * 1024 * 1024:

        raise HTTPException(
            status_code=400,
            detail="Maximum file size is 10 MB"
        )

    unique_name = (
        str(uuid.uuid4())
        + extension
    )

    path = os.path.join(
        UPLOAD_DIR,
        unique_name
    )

    with open(path, "wb") as f:
        f.write(content)

    document = Document(
        user_id=user.id,
        name=original_name,
        filename=unique_name,
        file_path=path,
        source="Student Upload",
        status="Pending Verification"
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document_data(document)


@router.post("/upload")
async def upload_document_legacy(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    return await upload_document(
        file=file,
        user=user,
        db=db
    )


@router.post("/{doc_id}/verify")
def verify_document(
    doc_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):

    document = (
        db.query(Document)
        .filter(
            Document.id == doc_id,
            Document.user_id == user.id
        )
        .first()
    )

    if not document:

        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    document.status = "Verified"

    db.commit()
    db.refresh(document)

    return document_data(document)