"""
Qore Backend Configuration
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
import secrets


class Settings(BaseSettings):
    # Server
    secret_key: str = secrets.token_urlsafe(32)
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"
    debug: bool = True  # Set to False in production
    
    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    
    # GitHub OAuth
    github_client_id: str = ""
    github_client_secret: str = ""
    
    # AI Integration
    gemini_api_key: str = ""
    openai_api_key: str = ""
    
    # JWT Settings
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./qore.db"
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
