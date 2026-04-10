#!/usr/bin/env python3
"""
OAuth Configuration Diagnostic Script
Run this to check if Google and GitHub OAuth are properly configured
"""

import os
import sys
from pathlib import Path

def load_env():
    """Load environment variables from .env file"""
    env_path = Path(__file__).parent / ".env"
    
    if not env_path.exists():
        print("❌ .env file not found!")
        print(f"   Expected at: {env_path}")
        return None
    
    env_vars = {}
    with open(env_path, 'r') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key.strip()] = value.strip()
    
    return env_vars

def check_oauth_config():
    """Check OAuth configuration"""
    print("=" * 60)
    print("QORE PLATFORM - OAuth Configuration Diagnostic")
    print("=" * 60)
    print()
    
    # Load environment
    print("📁 Loading environment from backend/.env...")
    env_vars = load_env()
    
    if env_vars is None:
        print("   ❌ Failed to load .env file")
        return False
    
    print("   ✅ .env file loaded successfully")
    print()
    
    # Check Google OAuth
    print("🔵 GOOGLE OAUTH")
    print("-" * 60)
    
    google_id = env_vars.get("GOOGLE_CLIENT_ID", "").strip()
    google_secret = env_vars.get("GOOGLE_CLIENT_SECRET", "").strip()
    
    if not google_id:
        print("❌ GOOGLE_CLIENT_ID is empty or missing")
        print("   Action: Get from https://console.cloud.google.com/apis/credentials")
    else:
        print(f"✅ GOOGLE_CLIENT_ID: {google_id[:20]}...")
    
    if not google_secret:
        print("❌ GOOGLE_CLIENT_SECRET is empty or missing")
        print("   Action: Get from https://console.cloud.google.com/apis/credentials")
    else:
        print(f"✅ GOOGLE_CLIENT_SECRET: {google_secret[:10]}...")
    
    print()
    
    # Check GitHub OAuth
    print("⚫ GITHUB OAUTH")
    print("-" * 60)
    
    github_id = env_vars.get("GITHUB_CLIENT_ID", "").strip()
    github_secret = env_vars.get("GITHUB_CLIENT_SECRET", "").strip()
    
    if not github_id:
        print("❌ GITHUB_CLIENT_ID is empty or missing")
        print("   Action: Get from https://github.com/settings/developers")
    else:
        print(f"✅ GITHUB_CLIENT_ID: {github_id[:20]}...")
    
    if not github_secret:
        print("❌ GITHUB_CLIENT_SECRET is empty or missing")
        print("   Action: Get from https://github.com/settings/developers")
    else:
        print(f"✅ GITHUB_CLIENT_SECRET: {github_secret[:10]}...")
    
    print()
    
    # Check other important URLs
    print("🌐 URLs")
    print("-" * 60)
    
    frontend_url = env_vars.get("FRONTEND_URL", "").strip()
    backend_url = env_vars.get("BACKEND_URL", "").strip()
    
    if frontend_url:
        print(f"✅ FRONTEND_URL: {frontend_url}")
    else:
        print(f"⚠️  FRONTEND_URL: Not set (default: http://localhost:5173)")
    
    if backend_url:
        print(f"✅ BACKEND_URL: {backend_url}")
    else:
        print(f"⚠️  BACKEND_URL: Not set (default: http://localhost:8000)")
    
    print()
    
    # Summary
    print("=" * 60)
    print("SUMMARY")
    print("=" * 60)
    
    all_valid = google_id and google_secret and github_id and github_secret
    
    if all_valid:
        print("✅ All OAuth credentials are configured!")
        print()
        print("Next steps:")
        print("1. Restart your backend: uvicorn main:app --reload")
        print("2. Check backend logs for:")
        print("   🔐 Google OAuth: ✅ Configured")
        print("   🔐 GitHub OAuth: ✅ Configured")
        print("3. Go to http://localhost:5173 and test OAuth login")
        print()
    else:
        print("❌ Some OAuth credentials are missing!")
        print()
        print("Next steps:")
        print("1. Get Google credentials from:")
        print("   https://console.cloud.google.com/apis/credentials")
        print("   - Create web application OAuth 2.0 credentials")
        print("   - Add redirect URI: http://localhost:8000/auth/google/callback")
        print()
        print("2. Get GitHub credentials from:")
        print("   https://github.com/settings/developers")
        print("   - Create new OAuth App")
        print("   - Set callback URL: http://localhost:8000/auth/github/callback")
        print()
        print("3. Update backend/.env with your credentials")
        print()
        print("4. Restart backend and try again")
    
    print()
    
    return all_valid

if __name__ == "__main__":
    # Check if we're in backend directory
    if not Path(".env").exists():
        print("❌ Please run this script from the backend/ directory:")
        print("   cd backend")
        print("   python oauth_check.py")
        sys.exit(1)
    
    success = check_oauth_config()
    sys.exit(0 if success else 1)
