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
    
    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    
    # GitHub OAuth
    github_client_id: str = ""
    github_client_secret: str = ""
    
    # JWT Settings
    jwt_algorithm: str = "HS256"
    jwt_expiration_hours: int = 24
    
    class Config:
        env_file = ".env"
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
