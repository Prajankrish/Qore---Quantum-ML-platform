"""
Qore Platform - FastAPI Backend with OAuth Authentication
"""
from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse, JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from authlib.integrations.starlette_client import OAuth
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from typing import Optional
import httpx

from config import get_settings
from database import init_db, get_db
from models import User
from auth import create_access_token, hash_password, verify_password, decode_access_token

# Load settings
settings = get_settings()

# Initialize FastAPI
app = FastAPI(
    title="Qore Quantum ML Platform API",
    description="Backend API for Qore - AI Enhanced Quantum ML Platform",
    version="1.0.0"
)

# Session middleware for OAuth state
app.add_middleware(SessionMiddleware, secret_key=settings.secret_key)

# CORS - Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000"],
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


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ==================== STARTUP ====================

@app.on_event("startup")
async def startup():
    await init_db()
    print("✅ Database initialized")
    print(f"🔗 Frontend URL: {settings.frontend_url}")
    print(f"🔐 Google OAuth: {'Configured' if settings.google_client_id else 'Not configured'}")
    print(f"🔐 GitHub OAuth: {'Configured' if settings.github_client_id else 'Not configured'}")


# ==================== HEALTH CHECK ====================

@app.get("/")
async def root():
    return {
        "message": "Qore Backend API is running!",
        "version": "1.0.0",
        "oauth": {
            "google": bool(settings.google_client_id),
            "github": bool(settings.github_client_id)
        }
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


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
    result = await db.execute(select(User).where(User.email == user_data.email))
    user = result.scalar_one_or_none()
    
    if not user or not user.hashed_password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not verify_password(user_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
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
            token=token
        )
    )


# ==================== GOOGLE OAUTH ====================

@app.get("/auth/google")
async def google_login(request: Request):
    if not settings.google_client_id:
        raise HTTPException(status_code=501, detail="Google OAuth not configured")
    
    redirect_uri = f"{settings.backend_url}/auth/google/callback"
    return await oauth.google.authorize_redirect(request, redirect_uri)


@app.get("/auth/google/callback")
async def google_callback(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get('userinfo')
        
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")
        
        # Find or create user
        result = await db.execute(select(User).where(User.email == user_info['email']))
        user = result.scalar_one_or_none()
        
        if not user:
            user = User(
                email=user_info['email'],
                name=user_info.get('name', user_info['email']),
                avatar=user_info.get('picture'),
                provider="google",
                provider_id=user_info.get('sub'),
                role="student"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        # Generate JWT
        access_token = create_access_token({"sub": user.id, "email": user.email})
        
        # Redirect to frontend with token
        return RedirectResponse(
            url=f"{settings.frontend_url}/auth/callback?token={access_token}&provider=google"
        )
        
    except Exception as e:
        print(f"Google OAuth Error: {e}")
        return RedirectResponse(url=f"{settings.frontend_url}/auth/callback?error=google_auth_failed")


# ==================== GITHUB OAUTH ====================

@app.get("/auth/github")
async def github_login(request: Request):
    if not settings.github_client_id:
        raise HTTPException(status_code=501, detail="GitHub OAuth not configured")
    
    redirect_uri = f"{settings.backend_url}/auth/github/callback"
    return await oauth.github.authorize_redirect(request, redirect_uri)


@app.get("/auth/github/callback")
async def github_callback(request: Request, db: AsyncSession = Depends(get_db)):
    try:
        token = await oauth.github.authorize_access_token(request)
        
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
                role="student"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        
        # Generate JWT
        access_token = create_access_token({"sub": user.id, "email": user.email})
        
        # Redirect to frontend with token
        return RedirectResponse(
            url=f"{settings.frontend_url}/auth/callback?token={access_token}&provider=github"
        )
        
    except Exception as e:
        print(f"GitHub OAuth Error: {e}")
        return RedirectResponse(url=f"{settings.frontend_url}/auth/callback?error=github_auth_failed")


# ==================== USER ENDPOINTS ====================

@app.get("/auth/me")
async def get_current_user(request: Request, db: AsyncSession = Depends(get_db)):
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
    
    return UserResponse(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        avatar=user.avatar,
        provider=user.provider,
        streak=user.streak or "1"
    )


# ==================== MAIN ====================

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
