import os
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    PROJECT_NAME: str = "The Royal Knot"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "royal_knot_super_secret_jwt_key_2026_luxury_weddings")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # Database
    PROJECT_ROOT: str = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'royal_knot.db')}")
    
    # Uploads
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "uploads")
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000"
    ]

    class Config:
        env_file = ".env"
        extra = "allow"

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
