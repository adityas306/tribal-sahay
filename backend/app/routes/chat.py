import json
from datetime import datetime, timezone

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from fastapi.responses import StreamingResponse

from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user

from app.models.user import User
from app.models.application import Application
from app.models.document import Document
from app.models.chat_conversation import ChatConversation
from app.models.chat_message import ChatMessage

from app.schemas.chat import (
    ChatRequest,
    ConversationRenameRequest,
)

from app.services.jago_ai import stream_jago_response


router = APIRouter(
    prefix="/api/chat",
    tags=["JAGO"],
)


# =========================================================
# CHECK WHETHER DATABASE CONTEXT IS REQUIRED
# =========================================================

def needs_database(message: str):

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
        "योग्यता",
    ]

    message = message.lower()

    return any(
        word in message
        for word in keywords
    )


# =========================================================
# BUILD USER / APPLICATION / DOCUMENT CONTEXT
# =========================================================

def build_context(
    user,
    db,
    message,
):

    context = {
        "name": getattr(
            user,
            "name",
            None,
        ),
        "state": getattr(
            user,
            "state",
            None,
        ),
        "category": getattr(
            user,
            "category",
            None,
        ),
        "education": getattr(
            user,
            "education",
            None,
        ),
        "course": getattr(
            user,
            "course",
            None,
        ),
        "year": getattr(
            user,
            "year",
            None,
        ),
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
            "id": getattr(
                application,
                "id",
                None,
            ),
            "status": getattr(
                application,
                "status",
                None,
            ),
        }
        for application in applications
    ]

    context["documents"] = [
        {
            "name": getattr(
                document,
                "name",
                None,
            ),
            "status": getattr(
                document,
                "status",
                None,
            ),
        }
        for document in documents
    ]

    return context


# =========================================================
# GENERATE CHAT TITLE
# =========================================================

def generate_title(message: str):

    title = message.strip()

    if len(title) > 45:
        title = (
            title[:45].rstrip()
            + "..."
        )

    return title or "New Chat"


# =========================================================
# CREATE / CONTINUE CHAT
# =========================================================

@router.post("")
def chat(
    request: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    try:

        # =================================================
        # FIND EXISTING CONVERSATION
        # =================================================

        conversation = None
        is_new_conversation = False

        if request.conversation_id:

            conversation = (
                db.query(ChatConversation)
                .filter(
                    ChatConversation.id
                    == request.conversation_id,

                    ChatConversation.user_id
                    == user.id,
                )
                .first()
            )

            if not conversation:

                raise HTTPException(
                    status_code=404,
                    detail="Conversation not found.",
                )

        # =================================================
        # CREATE NEW CONVERSATION
        # =================================================

        else:

            conversation = ChatConversation(
                user_id=user.id,

                title=generate_title(
                    request.message
                ),

                language=(
                    request.language
                    or "auto"
                ),
            )

            db.add(conversation)

            # IMPORTANT:
            # Conversation ID must exist
            # before streaming starts.

            db.commit()

            db.refresh(
                conversation
            )

            is_new_conversation = True

        # =================================================
        # UPDATE LANGUAGE
        # =================================================

        if request.language:
            conversation.language = (
                request.language
            )

        conversation.updated_at = (
            datetime.now(timezone.utc)
        )

        db.commit()

        db.refresh(
            conversation
        )

        conversation_id = (
            conversation.id
        )

        # =================================================
        # SAVE USER MESSAGE
        # =================================================

        user_message = ChatMessage(
            conversation_id=conversation_id,
            role="user",
            content=request.message,
        )

        db.add(user_message)

        # Explicitly update conversation
        conversation.updated_at = (
            datetime.now(timezone.utc)
        )

        # IMPORTANT:
        # User message is permanently saved
        # BEFORE AI streaming begins.

        db.commit()

        db.refresh(
            user_message
        )

        print(
            "JAGO USER MESSAGE SAVED:",
            {
                "message_id": user_message.id,
                "conversation_id": conversation_id,
                "user_id": user.id,
            },
        )

        # =================================================
        # BUILD CONTEXT
        # =================================================

        context = build_context(
            user,
            db,
            request.message,
        )

        # =================================================
        # GET PREVIOUS DATABASE MESSAGES
        # =================================================

        previous_messages = (
            db.query(ChatMessage)
            .filter(
                ChatMessage.conversation_id
                == conversation_id
            )
            .order_by(
                ChatMessage.created_at.asc(),
                ChatMessage.id.asc(),
            )
            .all()
        )

        # Remove current user message
        previous_messages = (
            previous_messages[:-1]
        )

        # Only last 8 messages
        previous_messages = (
            previous_messages[-8:]
        )

        history = []

        for item in previous_messages:

            history.append(
                type(
                    "HistoryItem",
                    (),
                    {
                        "role": item.role,
                        "text": item.content,
                    },
                )
            )

        # =================================================
        # STREAM GENERATOR
        # =================================================

        def generate():

            full_response = ""

            try:

                # =========================================
                # SEND CONVERSATION ID
                # =========================================

                conversation_event = {
                    "type": "conversation_id",
                    "conversation_id": conversation_id,
                    "new": is_new_conversation,
                }

                yield (
                    "data: "
                    + json.dumps(
                        conversation_event,
                        ensure_ascii=False,
                    )
                    + "\n\n"
                )

                # =========================================
                # AI STREAM
                # =========================================

                print(
                    "JAGO AI STREAM START:",
                    conversation_id,
                )

                for text in stream_jago_response(
                    message=request.message,
                    context=context,
                    history=history,
                    language=(
                        request.language
                        or "auto"
                    ),
                ):

                    if not text:
                        continue

                    full_response += text

                    # =====================================
                    # STRUCTURED SSE TEXT EVENT
                    # =====================================
                    #
                    # IMPORTANT:
                    # Do NOT manually replace "\n"
                    # with "\ndata: ".
                    #
                    # JSON safely carries:
                    # - Markdown
                    # - new lines
                    # - bullets
                    # - headings
                    # - bold text
                    # - Hindi text
                    # - code blocks
                    #
                    # Frontend can parse this JSON and
                    # render the text using ReactMarkdown.
                    # =====================================

                    text_event = {
                        "type": "text",
                        "text": text,
                    }

                    yield (
                        "data: "
                        + json.dumps(
                            text_event,
                            ensure_ascii=False,
                        )
                        + "\n\n"
                    )

                print(
                    "JAGO AI STREAM COMPLETE:",
                    conversation_id,
                    "characters=",
                    len(full_response),
                )

                # =========================================
                # SAVE ASSISTANT MESSAGE
                # =========================================

                if full_response.strip():

                    assistant_message = (
                        ChatMessage(
                            conversation_id=(
                                conversation_id
                            ),
                            role="assistant",
                            content=(
                                full_response
                            ),
                        )
                    )

                    db.add(
                        assistant_message
                    )

                    conversation.updated_at = (
                        datetime.now(
                            timezone.utc
                        )
                    )

                    db.commit()

                    db.refresh(
                        assistant_message
                    )

                    print(
                        "JAGO ASSISTANT MESSAGE SAVED:",
                        {
                            "message_id":
                                assistant_message.id,
                            "conversation_id":
                                conversation_id,
                        },
                    )

                else:

                    print(
                        "JAGO WARNING: EMPTY AI RESPONSE",
                        conversation_id,
                    )

                # =========================================
                # DONE
                # =========================================

                yield (
                    "data: [DONE]\n\n"
                )

            except Exception as error:

                print(
                    "JAGO STREAM ERROR:",
                    repr(error),
                )

                try:
                    db.rollback()
                except Exception:
                    pass

                # =========================================
                # IMPORTANT:
                # User message is already committed.
                # Therefore chat will still exist even
                # if AI generation fails.
                # =========================================

                error_event = {
                    "type": "error",
                    "message": (
                        "JAGO temporarily "
                        "unavailable. "
                        "Please try again."
                    ),
                }

                yield (
                    "data: "
                    + json.dumps(
                        error_event,
                        ensure_ascii=False,
                    )
                    + "\n\n"
                )

                yield (
                    "data: [DONE]\n\n"
                )

        # =================================================
        # RETURN SSE
        # =================================================

        return StreamingResponse(
            generate(),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "X-Accel-Buffering": "no",
            },
        )

    except HTTPException:
        raise

    except Exception as error:

        db.rollback()

        print(
            "JAGO CHAT ERROR:",
            repr(error),
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to process JAGO request.",
        )


# =========================================================
# GET ALL CHAT HISTORY
# =========================================================

@router.get("/history")
def get_chat_history(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    conversations = (
        db.query(ChatConversation)
        .filter(
            ChatConversation.user_id
            == user.id
        )
        .order_by(
            ChatConversation.updated_at.desc(),
            ChatConversation.id.desc(),
        )
        .all()
    )

    return [
        {
            "id": conversation.id,
            "title": conversation.title,
            "language": conversation.language,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at,
        }
        for conversation in conversations
    ]


# =========================================================
# GET SINGLE CONVERSATION
# =========================================================

@router.get("/{conversation_id}")
def get_conversation(
    conversation_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    conversation = (
        db.query(ChatConversation)
        .filter(
            ChatConversation.id
            == conversation_id,

            ChatConversation.user_id
            == user.id,
        )
        .first()
    )

    if not conversation:

        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.conversation_id
            == conversation.id
        )
        .order_by(
            ChatMessage.created_at.asc(),
            ChatMessage.id.asc(),
        )
        .all()
    )

    return {
        "id": conversation.id,

        "title": conversation.title,

        "language": conversation.language,

        "messages": [
            {
                "id": message.id,
                "role": message.role,
                "text": message.content,
                "created_at": message.created_at,
            }
            for message in messages
        ],
    }


# =========================================================
# RENAME CONVERSATION
# =========================================================

@router.patch("/{conversation_id}")
def rename_conversation(
    conversation_id: int,
    request: ConversationRenameRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    conversation = (
        db.query(ChatConversation)
        .filter(
            ChatConversation.id
            == conversation_id,

            ChatConversation.user_id
            == user.id,
        )
        .first()
    )

    if not conversation:

        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    new_title = (
        request.title.strip()
    )

    if not new_title:

        raise HTTPException(
            status_code=400,
            detail="Chat title cannot be empty.",
        )

    conversation.title = new_title

    conversation.updated_at = (
        datetime.now(timezone.utc)
    )

    db.commit()

    db.refresh(
        conversation
    )

    return {
        "id": conversation.id,
        "title": conversation.title,
    }


# =========================================================
# DELETE CONVERSATION
# =========================================================

@router.delete("/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    conversation = (
        db.query(ChatConversation)
        .filter(
            ChatConversation.id
            == conversation_id,

            ChatConversation.user_id
            == user.id,
        )
        .first()
    )

    if not conversation:

        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    db.delete(conversation)

    db.commit()

    return {
        "message": (
            "Conversation deleted successfully."
        )
    }