"""
Qore Database Models
"""
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime
import uuid

Base = declarative_base()


class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    name = Column(String, nullable=False)
    avatar = Column(String, nullable=True)
    role = Column(String, default="student")  # student, researcher, admin
    provider = Column(String, nullable=True)  # google, github, local
    provider_id = Column(String, nullable=True)
    hashed_password = Column(String, nullable=True)
    
    # Tracking
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, default=datetime.utcnow)
    streak = Column(String, default="1")
    is_active = Column(Boolean, default=True)
