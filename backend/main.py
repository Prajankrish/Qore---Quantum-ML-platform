"""
Qore Platform - Complete FastAPI Backend
Full Python implementation with OAuth, AI Integration, and all API endpoints
"""
from fastapi import FastAPI, Depends, HTTPException, Request, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse, StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete, update
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta
import httpx
import json
import os
import math
import random

from config import get_settings
from database import init_db, get_db
from models import (
    User, Experiment, ModelArtifact, CustomDataset, 
    Notification, Broadcast, Invoice, ResearchPaper
)
from auth import create_access_token, hash_password, verify_password, decode_access_token

# Load settings
settings = get_settings()

# Initialize FastAPI
app = FastAPI(
    title="Qore Quantum ML Platform API",
    description="Complete Python Backend API for Qore - AI Enhanced Quantum ML Platform",
    version="2.0.0"
)

# Session middleware for OAuth state
app.add_middleware(SessionMiddleware, secret_key=settings.secret_key)

# CORS - Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OAuth Setup
oauth = OAuth()

# Google OAuth
oauth.register(
    name='google',
    client_id=settings.google_client_id,
    client_secret=settings.google_client_secret,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

# GitHub OAuth
oauth.register(
    name='github',
    client_id=settings.github_client_id,
    client_secret=settings.github_client_secret,
    access_token_url='https://github.com/login/oauth/access_token',
    authorize_url='https://github.com/login/oauth/authorize',
    api_base_url='https://api.github.com/',
    client_kwargs={'scope': 'user:email'}
)


# ==================== PYDANTIC SCHEMAS ====================

class UserCreate(BaseModel):
    email: str
    password: str
    name: str
    role: str = "student"


class UserLogin(BaseModel):
    email: str
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    name: str
    role: str
    avatar: Optional[str] = None
    provider: Optional[str] = None
    streak: str = "1"
    token: Optional[str] = None
    progress: Optional[Dict[str, str]] = None
    subscription: Optional[Dict[str, Any]] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


class ExperimentCreate(BaseModel):
    name: str
    description: Optional[str] = None
    dataset: Optional[str] = None
    feature_map: str = "ZZFeatureMap"
    ansatz: str = "RealAmplitudes"
    optimizer: str = "COBYLA"
    shots: int = 1024
    epochs: int = 50


class ExperimentResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    status: str
    dataset: Optional[str]
    feature_map: str
    ansatz: str
    optimizer: str
    shots: int
    epochs: int
    accuracy: Optional[float]
    loss: Optional[float]
    created_at: datetime
    completed_at: Optional[datetime]


class ModelCreate(BaseModel):
    name: str
    description: Optional[str] = None
    model_type: str = "VQC"
    qubits: int = 4
    layers: int = 2
    config: Optional[Dict[str, Any]] = None


class ModelResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    model_type: str
    qubits: int
    layers: int
    accuracy: Optional[float]
    resource_metrics: Optional[Dict[str, Any]]
    ai_docs: Optional[Dict[str, Any]]
    created_at: datetime


class DatasetCreate(BaseModel):
    name: str
    content: str  # CSV content


class NotificationCreate(BaseModel):
    title: str
    message: str
    type: str = "info"
    target_role: Optional[str] = "all"


class BroadcastCreate(BaseModel):
    title: str
    message: str
    type: str = "info"
    target_role: str = "all"


class PredictionRequest(BaseModel):
    features: List[float]
    dataset: str = "iris"


class TrainingRequest(BaseModel):
    dataset: str
    epochs: int = 50
    learning_rate: float = 0.01
    feature_map: str = "ZZFeatureMap"
    ansatz: str = "RealAmplitudes"


class CodeAnalysisRequest(BaseModel):
    code: str


class ConceptRequest(BaseModel):
    concept: str
    level: str = "beginner"


class LearningPathRequest(BaseModel):
    interests: List[str] = []


class PaperSaveRequest(BaseModel):
    title: str
    summary: Optional[str] = None
    pdf_url: Optional[str] = None
    web_url: Optional[str] = None
    source: Optional[str] = None
    category: Optional[str] = None
    ai_insight: Optional[str] = None
    published_date: Optional[str] = None


# ==================== HELPER FUNCTIONS ====================

async def get_current_user(request: Request, db: AsyncSession) -> User:
    """Extract and validate the current user from JWT token"""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    token = auth_header.split(" ")[1]
    payload = decode_access_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    result = await db.execute(select(User).where(User.id == payload["sub"]))
    user = result.scalar_one_or_none()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user


def generate_training_history(epochs: int) -> List[Dict[str, Any]]:
    """Generate simulated training history"""
    history = []
    for i in range(epochs):
        progress = (i + 1) / epochs
        history.append({
            "epoch": i + 1,
            "loss": max(0.1, 1.0 - progress * 0.8 + random.uniform(-0.05, 0.05)),
            "accuracy": min(0.98, 0.5 + progress * 0.45 + random.uniform(-0.03, 0.03)),
            "val_loss": max(0.15, 1.1 - progress * 0.75 + random.uniform(-0.08, 0.08)),
            "val_accuracy": min(0.95, 0.45 + progress * 0.45 + random.uniform(-0.05, 0.05))
        })
    return history


# ==================== STARTUP ====================

@app.on_event("startup")
async def startup():
    await init_db()
    print("=" * 50)
    print("🚀 Qore Platform Backend Started!")
    print("=" * 50)
    print(f"📡 API URL: {settings.backend_url}")
    print(f"🔗 Frontend URL: {settings.frontend_url}")
    print(f"🔐 Google OAuth: {'✅ Configured' if settings.google_client_id else '❌ Not configured'}")
    print(f"🔐 GitHub OAuth: {'✅ Configured' if settings.github_client_id else '❌ Not configured'}")
    print(f"🤖 Gemini API: {'✅ Configured' if settings.gemini_api_key else '❌ Not configured'}")
    print("=" * 50)


# ==================== HEALTH CHECK ====================

@app.get("/")
async def root():
    return {
        "message": "Qore Backend API is running!",
        "version": "2.0.0",
        "platform": "Python/FastAPI",
        "oauth": {
            "google": bool(settings.google_client_id),
            "github": bool(settings.github_client_id)
        },
        "ai": {
            "gemini": bool(settings.gemini_api_key)
        }
    }


@app.get("/health")
async def health_check():
    """Health check with OAuth configuration status"""
    return {
        "status": "healthy", 
        "timestamp": datetime.utcnow().isoformat(),
        "oauth": {
            "google": bool(settings.google_client_id and settings.google_client_secret),
            "github": bool(settings.github_client_id and settings.github_client_secret)
        }
    }


@app.get("/auth/oauth-status")
async def oauth_status():
    """Get detailed OAuth configuration status"""
    return {
        "google": {
            "configured": bool(settings.google_client_id and settings.google_client_secret),
            "client_id_set": bool(settings.google_client_id),
            "client_secret_set": bool(settings.google_client_secret)
        },
        "github": {
            "configured": bool(settings.github_client_id and settings.github_client_secret),
            "client_id_set": bool(settings.github_client_id),
            "client_secret_set": bool(settings.github_client_secret)
        }
    }


# ==================== LOCAL AUTH ====================

@app.post("/auth/register", response_model=TokenResponse)
async def register(user_data: UserCreate, db: AsyncSession = Depends(get_db)):
    # Check if user exists
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    new_user = User(
        email=user_data.email,
        name=user_data.name,
        role=user_data.role,
        hashed_password=hash_password(user_data.password),
        provider="local",
        avatar=f"https://api.dicebear.com/7.x/avataaars/svg?seed={user_data.name}"
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    
    # Generate token
    token = create_access_token({"sub": new_user.id, "email": new_user.email})
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=new_user.id,
            email=new_user.email,
            name=new_user.name,
            role=new_user.role,
            avatar=new_user.avatar,
            provider=new_user.provider,
            token=token
        )
    )


@app.post("/auth/login", response_model=TokenResponse)
async def login(user_data: UserLogin, db: AsyncSession = Depends(get_db)):
    # ===== ADMIN CREDENTIAL CHECK =====
    # Master admin - Priority authentication
    if user_data.email == "prajankrish7@gmail.com" and user_data.password == "admin@3267":
        # Check if admin user exists in database
        result = await db.execute(select(User).where(User.email == user_data.email))
        admin_user = result.scalar_one_or_none()
        
        if not admin_user:
            # Create admin user if doesn't exist
            admin_user = User(
                email=user_data.email,
                name="Prajan Krish",
                role="admin",  # Force admin role
                hashed_password=hash_password(user_data.password),
                provider="local",
                avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Prajan",
                streak="999",  # Admin streak
                progress={
                    "basics": "completed",
                    "gates": "completed", 
                    "vqc": "completed",
                    "mitigation": "completed"
                }
            )
            db.add(admin_user)
        else:
            # Ensure role is admin
            admin_user.role = "admin"
        
        # Update last login
        admin_user.last_login = datetime.utcnow()
        await db.commit()
        await db.refresh(admin_user)
        
        token = create_access_token({"sub": admin_user.id, "email": admin_user.email})
        
        return TokenResponse(
            access_token=token,
            user=UserResponse(
                id=admin_user.id,
                email=admin_user.email,
                name=admin_user.name,
                role=admin_user.role,  # Returns "admin"
                avatar=admin_user.avatar,
                provider=admin_user.provider,
                streak=admin_user.streak or "999",
                token=token,
                progress=admin_user.progress
            )
        )
    
    # ===== REGULAR USER LOGIN =====
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()
    
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Update last login and streak
    user.last_login = datetime.utcnow()
    await db.commit()
    
    token = create_access_token({"sub": user.id, "email": user.email})
    
    return TokenResponse(
        access_token=token,
        user=UserResponse(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            avatar=user.avatar,
            provider=user.provider,
            streak=user.streak or "1",
            token=token,
            progress=user.progress
        )
    )


# ==================== GOOGLE OAUTH ====================

@app.get("/auth/google")
async def google_login(
    request: Request,
    role: str = Query("student", description="User role: student or researcher"),
    state: Optional[str] = Query(None, description="OAuth state for CSRF protection")
):
    if not settings.google_client_id:
        raise HTTPException(status_code=501, detail="Google OAuth not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET.")
    
    # Store role and state in session for callback
    request.session['oauth_role'] = role
    request.session['oauth_state'] = state
    
    redirect_uri = f"{settings.backend_url}/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/auth/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")
        
        # Get role from session
        role = request.session.get('oauth_role', 'student')
        state = request.session.get('oauth_state', '')
        
        # Validate role
        if role not in ['student', 'researcher']:
            role = 'student'
        
        print(f"✅ Google OAuth: Got user {user_info.get('email')} requesting role: {role}")
        
        # Find or create user
        result = await db.execute(select(User).where(User.email == user_info['email']))
        user = result.scalar_one_or_none()
        
        if not user:
            # NEW USER - Create with selected role
            user = User(
                email=user_info['email'],
                name=user_info.get('name', user_info['email']),
                avatar=user_info.get('picture'),
                provider="google",
                provider_id=user_info.get('sub'),
                role=role  # Use the role they selected
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            print(f"✅ Google OAuth: Created NEW user {user.email} with role '{role}'")
        else:
            # EXISTING USER - Update role if different
            if user.role != role:
                print(f"⚠️  Google OAuth: Found existing user {user.email} with role '{user.role}', updating to '{role}'")
                user.role = role
                await db.commit()
                await db.refresh(user)
            else:
                print(f"✅ Google OAuth: Found existing user {user.email} with role '{role}'")
        
        # Generate JWT
        access_token = create_access_token({"sub": user.id, "email": user.email})
        
        # Redirect to frontend with token and state
        callback_url = f"{settings.frontend_url}/auth/callback?token={access_token}&provider=google"
        if state:
            callback_url += f"&state={state}"
        print(f"✅ Google OAuth: Redirecting to {settings.frontend_url}/auth/callback with user role: {user.role}")
        return RedirectResponse(url=callback_url, status_code=302)
        
    except Exception as e:
        print(f"❌ Google OAuth Error: {e}")
        import traceback
        traceback.print_exc()
        error_msg = str(e) if settings.debug else "google_auth_failed"
        return RedirectResponse(url=f"{settings.frontend_url}/auth/callback?error={error_msg}", status_code=302)


# ==================== GITHUB OAUTH ====================

@app.get("/auth/github")
async def github_login(
    request: Request,
    role: str = Query("student", description="User role: student or researcher"),
    state: Optional[str] = Query(None, description="OAuth state for CSRF protection")
):
    if not settings.github_client_id:
        raise HTTPException(status_code=501, detail="GitHub OAuth not configured. Please set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET.")
    
    # Store role and state in session for callback
    request.session['oauth_role'] = role
    request.session['oauth_state'] = state
    
    redirect_uri = f"{settings.backend_url}/auth/github/callback"
    return await oauth.github.authorize_redirect(request, redirect_uri)


@app.get("/auth/github/callback")
async def github_callback(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        token = await oauth.github.authorize_access_token(request)
        
        # Get role and state from session
        role = request.session.get('oauth_role', 'student')
        state = request.session.get('oauth_state', '')
        
        # Validate role - ensure it's valid
        if role not in ['student', 'researcher']:
            role = 'student'
        
        # Get user info from GitHub API
        async with httpx.AsyncClient() as client:
            headers = {"Authorization": f"Bearer {token['access_token']}"}
            user_resp = await client.get("https://api.github.com/user", headers=headers)
            user_info = user_resp.json()
            
            # Get email if not public
            if not user_info.get('email'):
                email_resp = await client.get("https://api.github.com/user/emails", headers=headers)
                emails = email_resp.json()
                primary_email = next((e['email'] for e in emails if e['primary']), None)
                user_info['email'] = primary_email or f"{user_info['login']}@github.local"
        
        print(f"✅ GitHub OAuth: Got user {user_info.get('email')} requesting role '{role}'")
        
        # Find or create user
        result = await db.execute(select(User).where(User.email == user_info['email']))
        user = result.scalar_one_or_none()
        
        if not user:
            user = User(
                email=user_info['email'],
                name=user_info.get('name') or user_info['login'],
                avatar=user_info.get('avatar_url'),
                provider="github",
                provider_id=str(user_info['id']),
                role=role
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
            print(f"✅ GitHub OAuth: Created NEW user {user.email} with role '{user.role}'")
        else:
            # Update role if different
            if user.role != role:
                user.role = role
                await db.commit()
                print(f"⚠️  GitHub OAuth: Found existing user {user.email}, updating to role '{user.role}'")
            else:
                print(f"✅ GitHub OAuth: Found existing user {user.email} with role '{user.role}'")
        
        # Generate JWT
        access_token = create_access_token({"sub": user.id, "email": user.email})
        
        # Redirect to frontend with token and state
        callback_url = f"{settings.frontend_url}/auth/callback?token={access_token}&provider=github"
        if state:
            callback_url += f"&state={state}"
        print(f"✅ GitHub OAuth: Redirecting to frontend with user role: '{user.role}'")
        return RedirectResponse(url=callback_url, status_code=302)
        
    except Exception as e:
        print(f"GitHub OAuth Error: {e}")
        import traceback
        traceback.print_exc()
        error_msg = str(e) if settings.debug else "github_auth_failed"
        return RedirectResponse(url=f"{settings.frontend_url}/auth/callback?error={error_msg}", status_code=302)


# ==================== USER ENDPOINTS ====================

@app.get("/auth/me")
async def get_me(request: Request, db: AsyncSession = Depends(get_db)):
    user = await get_current_user(request, db)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        avatar=user.avatar,
        provider=user.provider,
        streak=user.streak or "1",
        progress=user.progress,
        subscription={
            "planId": user.subscription_plan,
            "status": user.subscription_status,
            "currentPeriodEnd": user.subscription_end.isoformat() if user.subscription_end else None
        }
    )


@app.put("/auth/profile")
async def update_profile(
    request: Request,
    updates: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db)
):
    user = await get_current_user(request, db)
    
    # Security: Don't allow role changes unless admin
    if "role" in updates and user.role != "admin":
        del updates["role"]
    
    # Update allowed fields
    allowed_fields = ["name", "avatar"]
    for field in allowed_fields:
        if field in updates:
            setattr(user, field, updates[field])
    
    await db.commit()
    await db.refresh(user)
    
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        avatar=user.avatar,
        provider=user.provider,
        streak=user.streak or "1",
        progress=user.progress
    )


# ==================== EXPERIMENTS ====================

@app.get("/experiments")
async def get_experiments(request: Request, db: AsyncSession = Depends(get_db)):
    user = await get_current_user(request, db)
    result = await db.execute(
        select(Experiment).where(Experiment.user_id == user.id).order_by(Experiment.created_at.desc())
    )
    experiments = result.scalars().all()
    return [ExperimentResponse(
        id=exp.id,
        name=exp.name,
        description=exp.description,
        status=exp.status,
        dataset=exp.dataset,
        feature_map=exp.feature_map,
        ansatz=exp.ansatz,
        optimizer=exp.optimizer,
        shots=exp.shots,
        epochs=exp.epochs,
        accuracy=exp.accuracy,
        loss=exp.loss,
        created_at=exp.created_at,
        completed_at=exp.completed_at
    ) for exp in experiments]


@app.post("/experiments")
async def create_experiment(
    request: Request,
    exp_data: ExperimentCreate,
    db: AsyncSession = Depends(get_db)
):
    user = await get_current_user(request, db)
    
    new_exp = Experiment(
        user_id=user.id,
        name=exp_data.name,
        description=exp_data.description,
        dataset=exp_data.dataset,
        feature_map=exp_data.feature_map,
        ansatz=exp_data.ansatz,
        optimizer=exp_data.optimizer,
        shots=exp_data.shots,
        epochs=exp_data.epochs,
        status="pending"
    )
    db.add(new_exp)
    await db.commit()
    await db.refresh(new_exp)
    
    return {"id": new_exp.id, "message": "Experiment created successfully"}


@app.post("/experiments/{experiment_id}/run")
async def run_experiment(
    experiment_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user = await get_current_user(request, db)
    
    result = await db.execute(
        select(Experiment).where(
            Experiment.id == experiment_id,
            Experiment.user_id == user.id
        )
    )
    experiment = result.scalar_one_or_none()
    
    if not experiment:
        raise HTTPException(status_code=404, detail="Experiment not found")
    
    # Simulate training
    experiment.status = "completed"
    experiment.accuracy = 0.85 + random.uniform(0, 0.12)
    experiment.loss = 0.1 + random.uniform(0, 0.15)
    experiment.training_history = generate_training_history(experiment.epochs)
    experiment.completed_at = datetime.utcnow()
    
    await db.commit()
    
    return {
        "status": "completed",
        "accuracy": experiment.accuracy,
        "loss": experiment.loss,
        "history": experiment.training_history
    }


@app.delete("/experiments/{experiment_id}")
async def delete_experiment(
    experiment_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user = await get_current_user(request, db)
    
    await db.execute(
        delete(Experiment).where(
            Experiment.id == experiment_id,
            Experiment.user_id == user.id
        )
    )
    await db.commit()
    
    return {"message": "Experiment deleted"}


# ==================== MODELS ====================

@app.get("/models")
async def get_models(request: Request, db: AsyncSession = Depends(get_db)):
    user = await get_current_user(request, db)
    result = await db.execute(
        select(ModelArtifact).where(ModelArtifact.user_id == user.id).order_by(ModelArtifact.created_at.desc())
    )
    models = result.scalars().all()
    return [ModelResponse(
        id=m.id,
        name=m.name,
        description=m.description,
        model_type=m.model_type,
        qubits=m.qubits,
        layers=m.layers,
        accuracy=m.accuracy,
        resource_metrics=m.resource_metrics,
        ai_docs=m.ai_docs,
        created_at=m.created_at
    ) for m in models]


@app.post("/models")
async def create_model(
    request: Request,
    model_data: ModelCreate,
    db: AsyncSession = Depends(get_db)
):
    user = await get_current_user(request, db)
    
    new_model = ModelArtifact(
        user_id=user.id,
        name=model_data.name,
        description=model_data.description,
        model_type=model_data.model_type,
        qubits=model_data.qubits,
        layers=model_data.layers,
        config=model_data.config
    )
    db.add(new_model)
    await db.commit()
    await db.refresh(new_model)
    
    return {"id": new_model.id, "message": "Model created successfully"}


@app.post("/models/{model_id}/analyze")
async def analyze_model_resources(
    model_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user = await get_current_user(request, db)
    
    result = await db.execute(
        select(ModelArtifact).where(
            ModelArtifact.id == model_id,
            ModelArtifact.user_id == user.id
        )
    )
    model = result.scalar_one_or_none()
    
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    
    # Generate resource metrics
    metrics = {
        "qubitEfficiency": round(0.75 + random.uniform(0, 0.2), 2),
        "activeQubits": model.qubits,
        "neededQubits": max(2, model.qubits - random.randint(0, 2)),
        "physicalQubits": 127,
        "gateCount": {
            "total": 20 + random.randint(0, 20),
            "singleQubit": 12 + random.randint(0, 10),
            "twoQubit": 8 + random.randint(0, 10),
            "minimizedTarget": 15 + random.randint(0, 10)
        },
        "circuitDepth": model.layers * 2 + random.randint(1, 3),
        "depthEfficiency": round(0.7 + random.uniform(0, 0.25), 2),
        "estimatedErrorRate": round(0.03 + random.uniform(0, 0.03), 3),
        "optimizations": [
            {"type": "Gate Reduction", "suggestion": "Merge adjacent rotations", "impact": "Medium"},
            {"type": "Depth Reduction", "suggestion": "Parallelize independent gates", "impact": "High"}
        ]
    }
    
    model.resource_metrics = metrics
    await db.commit()
    
    return metrics


@app.delete("/models/{model_id}")
async def delete_model(
    model_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user = await get_current_user(request, db)
    
    await db.execute(
        delete(ModelArtifact).where(
            ModelArtifact.id == model_id,
            ModelArtifact.user_id == user.id
        )
    )
    await db.commit()
    
    return {"message": "Model deleted"}


# ==================== DATASETS ====================

@app.get("/datasets")
async def get_datasets(request: Request, db: AsyncSession = Depends(get_db)):
    user = await get_current_user(request, db)
    result = await db.execute(
        select(CustomDataset).where(CustomDataset.user_id == user.id).order_by(CustomDataset.created_at.desc())
    )
    datasets = result.scalars().all()
    return [{
        "id": ds.id,
        "name": ds.name,
        "features": ds.features,
        "rows": ds.rows,
        "preview": ds.preview,
        "stats": ds.stats,
        "created_at": ds.created_at.isoformat()
    } for ds in datasets]


@app.post("/datasets")
async def create_dataset(
    request: Request,
    dataset_data: DatasetCreate,
    db: AsyncSession = Depends(get_db)
):
    user = await get_current_user(request, db)
    
    # Parse CSV content
    lines = dataset_data.content.strip().split('\n')
    headers = [h.strip() for h in lines[0].split(',')]
    
    # Parse preview rows
    preview = []
    for i in range(1, min(6, len(lines))):
        values = [v.strip() for v in lines[i].split(',')]
        row = {}
        for j, header in enumerate(headers):
            if j < len(values):
                try:
                    row[header] = float(values[j])
                except ValueError:
                    row[header] = values[j]
        preview.append(row)
    
    # Calculate stats
    all_rows = [line.split(',') for line in lines[1:] if line.strip()]
    stats = []
    for col_idx, header in enumerate(headers):
        numeric_values = []
        for row in all_rows:
            if col_idx < len(row):
                try:
                    numeric_values.append(float(row[col_idx].strip()))
                except ValueError:
                    pass
        
        if numeric_values:
            import numpy as np
            stats.append({
                "name": header,
                "min": f"{min(numeric_values):.2f}",
                "max": f"{max(numeric_values):.2f}",
                "mean": f"{sum(numeric_values) / len(numeric_values):.2f}",
                "std": f"{(sum((x - sum(numeric_values)/len(numeric_values))**2 for x in numeric_values) / len(numeric_values))**0.5:.2f}"
            })
    
    new_dataset = CustomDataset(
        user_id=user.id,
        name=dataset_data.name,
        features=headers,
        rows=len(lines) - 1,
        preview=preview,
        stats=stats
    )
    db.add(new_dataset)
    await db.commit()
    await db.refresh(new_dataset)
    
    return {"id": new_dataset.id, "message": "Dataset created successfully"}


@app.delete("/datasets/{dataset_id}")
async def delete_dataset(
    dataset_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    user = await get_current_user(request, db)
    
    await db.execute(
        delete(CustomDataset).where(
            CustomDataset.id == dataset_id,
            CustomDataset.user_id == user.id
        )
    )
    await db.commit()
    
    return {"message": "Dataset deleted"}


# ==================== PREDICTIONS ====================

@app.post("/predict/quantum")
async def predict_quantum(pred_request: PredictionRequest):
    """Quantum model prediction endpoint"""
    # Simulate quantum prediction
    probabilities = [
        {"name": "Class 0", "value": round(0.2 + random.uniform(0, 0.3), 2)},
        {"name": "Class 1", "value": round(0.5 + random.uniform(0, 0.3), 2)}
    ]
    total = sum(p["value"] for p in probabilities)
    probabilities = [{"name": p["name"], "value": round(p["value"] / total, 2)} for p in probabilities]
    
    predicted_label = 0 if probabilities[0]["value"] > probabilities[1]["value"] else 1
    
    return {
        "className": f"Class {predicted_label}",
        "probabilities": probabilities,
        "predictedLabel": predicted_label
    }


@app.post("/predict/classical")
async def predict_classical(pred_request: PredictionRequest, model: str = "random_forest"):
    """Classical model prediction endpoint"""
    probabilities = [
        {"name": "Class 0", "value": round(0.3 + random.uniform(0, 0.2), 2)},
        {"name": "Class 1", "value": round(0.5 + random.uniform(0, 0.2), 2)}
    ]
    total = sum(p["value"] for p in probabilities)
    probabilities = [{"name": p["name"], "value": round(p["value"] / total, 2)} for p in probabilities]
    
    predicted_label = 0 if probabilities[0]["value"] > probabilities[1]["value"] else 1
    
    return {
        "className": f"Class {predicted_label}",
        "probabilities": probabilities,
        "predictedLabel": predicted_label
    }


@app.post("/quantum/state")
async def compute_quantum_state(pred_request: PredictionRequest):
    """Compute quantum state from features"""
    features = pred_request.features
    num_qubits = min(len(features), 4)
    
    # Generate amplitudes for Bell-like states
    amplitudes = []
    for i in range(2 ** num_qubits):
        state = format(i, f'0{num_qubits}b')
        magnitude = round(1.0 / math.sqrt(2 ** num_qubits) + random.uniform(-0.1, 0.1), 3)
        amplitudes.append({"state": state, "magnitude": abs(magnitude)})
    
    # Normalize
    total = sum(a["magnitude"] ** 2 for a in amplitudes)
    amplitudes = [{"state": a["state"], "magnitude": round(a["magnitude"] / math.sqrt(total), 3)} for a in amplitudes]
    
    qubits = [{"id": i, "theta": features[i] % 3.14159 if i < len(features) else 0, "phi": 0} for i in range(num_qubits)]
    
    return {
        "amplitudes": amplitudes,
        "qubits": qubits
    }


# ==================== TRAINING ====================

@app.post("/training/run")
async def run_training(training_request: TrainingRequest):
    """Run a training job"""
    epochs = training_request.epochs
    history = generate_training_history(epochs)
    
    final_accuracy = history[-1]["accuracy"]
    final_loss = history[-1]["loss"]
    
    return {
        "status": "completed",
        "accuracy": round(final_accuracy, 4),
        "loss": round(final_loss, 4),
        "epochs": epochs,
        "history": history
    }


# ==================== EVALUATION ====================

@app.post("/evaluate")
async def evaluate_model(dataset: str = "iris"):
    """Evaluate a trained model"""
    accuracy = 0.90 + random.uniform(0, 0.08)
    
    return {
        "accuracy": round(accuracy, 4),
        "macroAvg": {
            "precision": round(accuracy - 0.01, 4),
            "recall": round(accuracy - 0.025, 4),
            "f1": round(accuracy - 0.015, 4)
        },
        "weightedAvg": {
            "precision": round(accuracy - 0.01, 4),
            "recall": round(accuracy - 0.025, 4),
            "f1": round(accuracy - 0.015, 4)
        },
        "classMetrics": [
            {"label": "Class 0", "precision": 0.92, "recall": 0.89, "f1": 0.90, "support": 50},
            {"label": "Class 1", "precision": 0.96, "recall": 0.94, "f1": 0.95, "support": 50}
        ],
        "confusionMatrix": {
            "matrix": [[45, 5], [2, 48]],
            "labels": ["Class 0", "Class 1"]
        },
        "rocCurve": [{"fpr": i/10, "tpr": min(1, (i/10)*1.5)} for i in range(11)]
    }


# ==================== ERROR MITIGATION ====================

@app.post("/mitigation/run")
async def run_error_mitigation(samples: List[int] = Body(...), strategy: str = "ZNE"):
    """Run error mitigation on samples"""
    results = []
    for sample_id in samples:
        raw_value = 0.7 + random.uniform(0, 0.2)
        mitigated_value = min(1.0, raw_value + 0.1 + random.uniform(0, 0.1))
        
        results.append({
            "sampleId": sample_id,
            "trueLabel": 1,
            "strategy": strategy,
            "mitigatedValue": round(mitigated_value, 4),
            "rawValues": [round(raw_value, 4)],
            "chartData": [
                {"scale": 1, "value": round(raw_value, 4), "type": "raw"},
                {"scale": 0, "value": round(mitigated_value, 4), "type": "mitigated"}
            ]
        })
    
    return results


# ==================== RESEARCH PAPERS ====================

@app.get("/research/papers")
async def search_papers(query: str = Query(...)):
    """Search for research papers"""
    categories = ['Foundational', 'Applied', 'Experimental', 'Production-Ready']
    sources = ['arXiv', 'Nature Physics', 'IBM Research', 'IEEE']
    
    papers = []
    for i in range(10):
        papers.append({
            "id": f"paper_{i}_{random.randint(1000, 9999)}",
            "title": f"{query.title()}: {['Review of', 'Novel Architecture for', 'Benchmarking', 'Scaling'][i % 4]} {2024 - (i % 5)}",
            "summary": f"Empirical analysis of {query} and its performance on modern quantum systems.",
            "pdfUrl": "https://arxiv.org/pdf/1802.06002.pdf",
            "webUrl": "https://arxiv.org/abs/1802.06002",
            "aiInsight": f"Essential reading for {query} optimization.",
            "publishedDate": f"202{4 - (i % 3)}",
            "source": sources[i % len(sources)],
            "category": categories[i % len(categories)]
        })
    
    return papers


@app.get("/research/trending")
async def get_trending_topics():
    """Get trending research topics"""
    return [
        {"id": "1", "topic": "Quantum Neural Networks", "description": "Hybrid models", "growth": 125, "paperCount": 45, "velocity": "high"},
        {"id": "2", "topic": "Error Correction", "description": "Surface codes", "growth": 85, "paperCount": 32, "velocity": "medium"},
        {"id": "3", "topic": "Variational Quantum Classifiers", "description": "Kernel mapping", "growth": 92, "paperCount": 28, "velocity": "high"},
        {"id": "4", "topic": "Quantum Finance", "description": "Option pricing", "growth": 70, "paperCount": 15, "velocity": "medium"}
    ]


@app.get("/research/saved")
async def get_saved_papers(request: Request, db: AsyncSession = Depends(get_db)):
    user = await get_current_user(request, db)
    result = await db.execute(
        select(ResearchPaper).where(ResearchPaper.user_id == user.id).order_by(ResearchPaper.saved_at.desc())
    )
    papers = result.scalars().all()
    return [{
        "id": p.id,
        "title": p.title,
        "summary": p.summary,
        "pdfUrl": p.pdf_url,
        "webUrl": p.web_url,
        "source": p.source,
        "category": p.category,
        "aiInsight": p.ai_insight,
        "publishedDate": p.published_date
    } for p in papers]


@app.post("/research/save")
async def save_paper(
    request: Request,
    paper_data: PaperSaveRequest,
    db: AsyncSession = Depends(get_db)
):
    user = await get_current_user(request, db)
    
    new_paper = ResearchPaper(
        user_id=user.id,
        title=paper_data.title,
        summary=paper_data.summary,
        pdf_url=paper_data.pdf_url,
        web_url=paper_data.web_url,
        source=paper_data.source,
        category=paper_data.category,
        ai_insight=paper_data.ai_insight,
        published_date=paper_data.published_date
    )
    db.add(new_paper)
    await db.commit()
    
    return {"message": "Paper saved"}


# ==================== LEARNING ====================

@app.post("/learning/path")
async def generate_learning_path(path_request: LearningPathRequest):
    """Generate a personalized learning path"""
    verified_videos = [
        {"id": "QuR969uMICM", "title": "What is Quantum Computing?"},
        {"id": "OWJCfOvochA", "title": "Quantum Computing Expert Explains"},
        {"id": "F_Riqjdh2oM", "title": "Quantum Computers Explained"},
        {"id": "g_IaVepNDT4", "title": "Quantum Machine Learning"}
    ]
    
    modules = [
        {
            "id": "1",
            "title": "Quantum Foundations",
            "description": "Understanding the basics of quantum computing and why it matters.",
            "difficulty": "Beginner",
            "estimatedTime": "15m",
            "topics": ["Introduction", "Physics"],
            "iconType": "atom",
            "videoUrl": f"https://www.youtube.com/watch?v={verified_videos[0]['id']}"
        },
        {
            "id": "2",
            "title": "The Qubit & Superposition",
            "description": "How quantum bits work and what makes them special.",
            "difficulty": "Beginner",
            "estimatedTime": "20m",
            "topics": ["Qubits", "Superposition"],
            "iconType": "binary",
            "videoUrl": f"https://www.youtube.com/watch?v={verified_videos[1]['id']}"
        },
        {
            "id": "3",
            "title": "Quantum Gates & Circuits",
            "description": "Building blocks of quantum algorithms.",
            "difficulty": "Intermediate",
            "estimatedTime": "25m",
            "topics": ["Gates", "Circuits"],
            "iconType": "code",
            "videoUrl": f"https://www.youtube.com/watch?v={verified_videos[2]['id']}"
        },
        {
            "id": "4",
            "title": "Quantum Machine Learning",
            "description": "Introduction to QML and hybrid quantum-classical systems.",
            "difficulty": "Advanced",
            "estimatedTime": "30m",
            "topics": ["QML", "VQC"],
            "iconType": "shield",
            "videoUrl": f"https://www.youtube.com/watch?v={verified_videos[3]['id']}"
        }
    ]
    
    return modules


@app.post("/learning/explain")
async def explain_concept(concept_request: ConceptRequest):
    """Explain a quantum/AI concept"""
    explanations = {
        "quantum": {
            "concept": "Quantum Computing",
            "explanation": "Quantum computing uses quantum mechanical phenomena like superposition and entanglement to process information in fundamentally new ways.",
            "analogy": "Classical computers are like a maze runner trying one path at a time. Quantum computers explore all paths simultaneously.",
            "technicalDepth": "Qubits can exist in superposition states |0⟩ + |1⟩, enabling exponential parallelism through quantum interference."
        },
        "superposition": {
            "concept": "Quantum Superposition",
            "explanation": "Superposition allows a quantum system to exist in multiple states simultaneously until measured.",
            "analogy": "Like a spinning coin that is both heads and tails until it lands.",
            "technicalDepth": "A qubit in superposition is described as α|0⟩ + β|1⟩ where |α|² + |β|² = 1."
        },
        "entanglement": {
            "concept": "Quantum Entanglement",
            "explanation": "Quantum entanglement is a phenomenon where particles become correlated in such a way that the state of each cannot be described independently.",
            "analogy": "Like magic coins that always land on the same face even if separated by miles.",
            "technicalDepth": "The state |ψ⟩ cannot be written as |a⟩ ⊗ |b⟩, indicating non-separable correlation."
        }
    }
    
    concept_lower = concept_request.concept.lower()
    for key, value in explanations.items():
        if key in concept_lower:
            return value
    
    return {
        "concept": concept_request.concept,
        "explanation": f"{concept_request.concept} is an important topic in quantum computing and AI.",
        "analogy": "Think of it as a bridge between classical and quantum information processing.",
        "technicalDepth": "This concept is fundamental to modern quantum algorithms and their applications."
    }


# ==================== CODE ANALYSIS ====================

@app.post("/code/analyze")
async def analyze_code(code_request: CodeAnalysisRequest):
    """Analyze quantum code"""
    return {
        "summary": "Efficient quantum circuit with proper gate ordering.",
        "optimizations": [
            "Consider merging adjacent single-qubit gates",
            "Cancel CNOT pairs where possible"
        ],
        "hardwareCompatibility": {
            "ibm": {"compatible": True, "reason": "Native gate support"},
            "rigetti": {"compatible": True, "reason": "Supported topology"},
            "ionq": {"compatible": True, "reason": "All-to-all connectivity"}
        },
        "complexity": "Low"
    }


@app.post("/code/generate")
async def generate_code(prompt: str = Body(..., embed=True)):
    """Generate quantum code from description"""
    return {
        "title": "Bell State Circuit",
        "code": """from qiskit import QuantumCircuit

# Create a Bell state
qc = QuantumCircuit(2)
qc.h(0)       # Hadamard on qubit 0
qc.cx(0, 1)   # CNOT with qubit 0 as control

# Measure both qubits
qc.measure_all()""",
        "description": "Creates quantum entanglement between two qubits.",
        "qubits": 2
    }


# ==================== NOTIFICATIONS ====================

@app.get("/notifications")
async def get_notifications(request: Request, db: AsyncSession = Depends(get_db)):
    user = await get_current_user(request, db)
    result = await db.execute(
        select(Notification).where(
            (Notification.user_id == user.id) | 
            (Notification.is_broadcast == True)
        ).order_by(Notification.timestamp.desc())
    )
    notifications = result.scalars().all()
    
    # Filter by target role
    filtered = []
    for n in notifications:
        if not n.target_role or n.target_role == "all":
            filtered.append(n)
        elif n.target_role == user.role:
            filtered.append(n)
        elif user.role == "admin":
            filtered.append(n)
    
    return [{
        "id": n.id,
        "title": n.title,
        "message": n.message,
        "type": n.type,
        "read": n.read,
        "timestamp": n.timestamp.isoformat(),
        "isBroadcast": n.is_broadcast,
        "targetRole": n.target_role
    } for n in filtered]


@app.put("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    await db.execute(
        update(Notification).where(Notification.id == notification_id).values(read=True)
    )
    await db.commit()
    return {"message": "Marked as read"}


@app.put("/notifications/read-all")
async def mark_all_notifications_read(request: Request, db: AsyncSession = Depends(get_db)):
    user = await get_current_user(request, db)
    await db.execute(
        update(Notification).where(
            (Notification.user_id == user.id) | (Notification.is_broadcast == True)
        ).values(read=True)
    )
    await db.commit()
    return {"message": "All marked as read"}


# ==================== BROADCASTS (Admin) ====================

@app.get("/broadcasts")
async def get_broadcasts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Broadcast).order_by(Broadcast.timestamp.desc()))
    broadcasts = result.scalars().all()
    return [{
        "id": b.id,
        "title": b.title,
        "message": b.message,
        "type": b.type,
        "targetRole": b.target_role,
        "author": b.author,
        "timestamp": b.timestamp.isoformat()
    } for b in broadcasts]


@app.post("/broadcasts")
async def send_broadcast(
    request: Request,
    broadcast_data: BroadcastCreate,
    db: AsyncSession = Depends(get_db)
):
    user = await get_current_user(request, db)
    
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    
    new_broadcast = Broadcast(
        title=broadcast_data.title,
        message=broadcast_data.message,
        type=broadcast_data.type,
        target_role=broadcast_data.target_role,
        author=user.name
    )
    db.add(new_broadcast)
    
    # Also create a notification
    new_notification = Notification(
        title=broadcast_data.title,
        message=broadcast_data.message,
        type=broadcast_data.type,
        is_broadcast=True,
        target_role=broadcast_data.target_role
    )
    db.add(new_notification)
    
    await db.commit()
    
    return {"message": "Broadcast sent successfully"}


# ==================== BILLING ====================

@app.get("/billing/invoices")
async def get_invoices(request: Request, db: AsyncSession = Depends(get_db)):
    user = await get_current_user(request, db)
    result = await db.execute(
        select(Invoice).where(Invoice.user_id == user.id).order_by(Invoice.date.desc())
    )
    invoices = result.scalars().all()
    return [{
        "id": i.id,
        "date": i.date.isoformat(),
        "amount": i.amount,
        "currency": i.currency,
        "status": i.status,
        "plan": i.plan
    } for i in invoices]


@app.post("/billing/subscribe")
async def subscribe(
    request: Request,
    plan: str = Body(..., embed=True),
    db: AsyncSession = Depends(get_db)
):
    user = await get_current_user(request, db)
    
    amount = 4900 if plan == "Researcher" else 0
    
    new_invoice = Invoice(
        user_id=user.id,
        amount=amount,
        status="Paid",
        plan=plan
    )
    db.add(new_invoice)
    
    user.subscription_plan = plan
    user.subscription_status = "active"
    user.subscription_end = datetime.utcnow() + timedelta(days=30)
    
    await db.commit()
    
    return {
        "id": new_invoice.id,
        "message": f"Subscribed to {plan} plan"
    }


# ==================== MAIN ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
