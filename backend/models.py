"""
Qore Database Models - Complete Schema
"""
from sqlalchemy import Column, String, DateTime, Boolean, Integer, Float, Text, JSON, ForeignKey
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime
import uuid

Base = declarative_base()


def generate_uuid():
    return str(uuid.uuid4())


class User(Base):
    __tablename__ = "users"
    
    id = Column(String, primary_key=True, default=generate_uuid)
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
    
    # Learning Progress
    progress = Column(JSON, default=lambda: {
        "basics": "in-progress",
        "gates": "locked", 
        "vqc": "locked",
        "mitigation": "locked"
    })
    
    # Subscription
    subscription_plan = Column(String, default="Starter")
    subscription_status = Column(String, default="active")
    subscription_end = Column(DateTime, nullable=True)
    
    # Relationships
    experiments = relationship("Experiment", back_populates="user", cascade="all, delete-orphan")
    models = relationship("ModelArtifact", back_populates="user", cascade="all, delete-orphan")
    datasets = relationship("CustomDataset", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Experiment(Base):
    __tablename__ = "experiments"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="pending")  # pending, running, completed, failed
    
    # Configuration
    dataset = Column(String, nullable=True)
    feature_map = Column(String, default="ZZFeatureMap")
    ansatz = Column(String, default="RealAmplitudes")
    optimizer = Column(String, default="COBYLA")
    shots = Column(Integer, default=1024)
    epochs = Column(Integer, default=50)
    
    # Results
    accuracy = Column(Float, nullable=True)
    loss = Column(Float, nullable=True)
    training_history = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="experiments")


class ModelArtifact(Base):
    __tablename__ = "models"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    model_type = Column(String, default="VQC")  # VQC, QSVM, QNN
    
    # Configuration
    config = Column(JSON, nullable=True)
    qubits = Column(Integer, default=4)
    layers = Column(Integer, default=2)
    
    # Metrics
    accuracy = Column(Float, nullable=True)
    resource_metrics = Column(JSON, nullable=True)
    ai_docs = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="models")


class CustomDataset(Base):
    __tablename__ = "datasets"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    features = Column(JSON, nullable=True)  # List of feature names
    rows = Column(Integer, default=0)
    preview = Column(JSON, nullable=True)  # First few rows
    stats = Column(JSON, nullable=True)  # Column statistics
    file_path = Column(String, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="datasets")


class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")  # info, warning, success, error
    read = Column(Boolean, default=False)
    is_broadcast = Column(Boolean, default=False)
    target_role = Column(String, nullable=True)  # all, student, researcher, admin
    
    # Timestamps
    timestamp = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user = relationship("User", back_populates="notifications")


class Broadcast(Base):
    __tablename__ = "broadcasts"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    title = Column(String, nullable=False)
    message = Column(Text, nullable=False)
    type = Column(String, default="info")
    target_role = Column(String, default="all")
    author = Column(String, default="Admin")
    
    # Timestamps
    timestamp = Column(DateTime, default=datetime.utcnow)


class Invoice(Base):
    __tablename__ = "invoices"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    amount = Column(Integer, default=0)  # In cents
    currency = Column(String, default="usd")
    status = Column(String, default="pending")  # pending, paid, failed
    plan = Column(String, nullable=True)
    
    # Timestamps
    date = Column(DateTime, default=datetime.utcnow)


class ResearchPaper(Base):
    __tablename__ = "saved_papers"
    
    id = Column(String, primary_key=True, default=generate_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    summary = Column(Text, nullable=True)
    pdf_url = Column(String, nullable=True)
    web_url = Column(String, nullable=True)
    source = Column(String, nullable=True)
    category = Column(String, nullable=True)
    ai_insight = Column(Text, nullable=True)
    published_date = Column(String, nullable=True)
    
    # Timestamps
    saved_at = Column(DateTime, default=datetime.utcnow)
