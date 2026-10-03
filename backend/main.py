from dotenv import load_dotenv
import os


# --------------------------------------------------
# Load environment variables FIRST
# --------------------------------------------------

load_dotenv()


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine


# --------------------------------------------------
# Import ALL models before create_all()
# --------------------------------------------------

from app.models import (
    User,
    Application,
    Document,
    Notification
)

from app.models.chat_conversation import ChatConversation
from app.models.chat_message import ChatMessage


# --------------------------------------------------
# Import Routes
# --------------------------------------------------

from app.routes import (
    auth_router,
    profile_router,
    schemes_router,
    eligibility_router,
    applications_router,
    documents_router,
    notifications_router,
    stats_router,
    chat_router
)


# --------------------------------------------------
# Database
# --------------------------------------------------

print("DATABASE INITIALIZATION STARTED")

try:

    Base.metadata.create_all(bind=engine)

    print("DATABASE TABLES CREATED / VERIFIED")

except Exception as e:

    print("DATABASE INITIALIZATION ERROR:", str(e))


# --------------------------------------------------
# FastAPI App
# --------------------------------------------------

app = FastAPI(
    title="TribalSahay API",
    description="Unified Scholarship Platform for Tribal Students",
    version="1.0.0"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://tribal-sahay.vercel.app",
    "http://127.0.0.1:8000",
]


# Add FRONTEND_URL if configured
if getattr(settings, "FRONTEND_URL", None):

    for origin in settings.FRONTEND_URL.split(","):

        origin = origin.strip()

        if origin and origin not in origins:
            origins.append(origin)


app.add_middleware(
    CORSMiddleware,

    allow_origins=origins,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# --------------------------------------------------
# Routes
# --------------------------------------------------

app.include_router(auth_router)

app.include_router(profile_router)

app.include_router(schemes_router)

app.include_router(eligibility_router)

app.include_router(applications_router)

app.include_router(documents_router)

app.include_router(notifications_router)

app.include_router(stats_router)

app.include_router(chat_router)


# --------------------------------------------------
# Root
# --------------------------------------------------

@app.get("/")
def root():

    return {
        "service": "TribalSahay API",
        "status": "online",
        "version": "1.0.0"
    }


# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/health")
def health():

    return {
        "status": "ok"
    }


# --------------------------------------------------
# Groq Configuration Check
# --------------------------------------------------

key = os.getenv("GROQ_API_KEY")

print("Groq Key exists:", bool(key))
print("Groq Key length:", len(key) if key else 0)
print("Groq Key prefix:", key[:6] if key else None)