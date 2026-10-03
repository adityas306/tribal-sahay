import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    SECRET_KEY = os.getenv(
        "SECRET_KEY",
        "change-this-secret"
    )

    DATABASE_URL = os.getenv(
        "DATABASE_URL",
        "sqlite:///./tribalsahay.db",
        
    )

    FRONTEND_URL = os.getenv(
        "FRONTEND_URL",
        "http://localhost:5173"
    )


settings = Settings()