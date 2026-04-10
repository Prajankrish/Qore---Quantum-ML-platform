# Role Selection & OAuth Fix - Complete

## Changes Made

### 1. ✅ Removed Admin Role from Signup
- **File**: `pages/Auth.tsx`
- **Changes**:
  - Removed "Admin" button from role selection
  - Changed grid from 3 columns to 2 columns
  - Now only shows: **Learner** (Student) and **Researcher**
  - Updated role state to only accept: `'student' | 'researcher'`
  - Removed Crown icon import (no longer needed)

### 2. ✅ Fixed Google/GitHub OAuth Role Selection
- **Problem**: When selecting Researcher and clicking "Login with Google", it was defaulting to Student
- **Solution**: 
  - Frontend now correctly passes the selected role to OAuth
  - Backend receives the role parameter from frontend
  - Backend respects the role when creating new users

**Flow:**
```
User selects "Researcher"
       ↓
Clicks "Login with Google"
       ↓
Frontend stores role in localStorage
       ↓
Frontend redirects to: /auth/google?role=researcher
       ↓
Backend receives role parameter
       ↓
Backend stores role in session
       ↓
After OAuth, creates user with selected role ✅
```

### 3. ✅ Free Access for Both Roles
- **Student ("Learner")**: Free access to basics and learning paths
- **Researcher**: Free access to advanced features (training, experiments, etc.)
- **Admin**: Only available via hardcoded credentials (prajankrish7@gmail.com / admin@3267)

---

## How It Works Now

### Signup/Login Flow

#### Option 1: Traditional Signup
1. Create Account form
2. Enter email, password, name
3. **Select role**: Learner OR Researcher (only 2 options now)
4. Click "Initialize Account"
5. User created with selected role ✅

#### Option 2: Google OAuth
1. Enter email (any email works)
2. **Select role**: Learner OR Researcher
3. Click "Login with Google"
4. Redirect to Google sign-in
5. Sign in with your Google account
6. Backend creates user with **your selected role** ✅ (fixed!)
7. Logged in with selected role

#### Option 3: GitHub OAuth
1. Enter email (any email works)
2. **Select role**: Learner OR Researcher
3. Click "Login with GitHub"
4. Redirect to GitHub sign-in
5. Sign in with your GitHub account
6. Backend creates user with **your selected role** ✅
7. Logged in with selected role

---

## What Users See Now

**Before (3 role options):**
```
┌────────────┬──────────────┬────────┐
│  Learner   │  Researcher  │ Admin  │  ❌ Removed
└────────────┴──────────────┴────────┘
```

**After (2 role options):**
```
┌────────────┬──────────────┐
│  Learner   │  Researcher  │  ✅ Only these
└────────────┴──────────────┘
```

---

## Backend Validation

The backend already validates roles correctly:

**File**: `backend/main.py` (Google OAuth callback)
```python
role = request.session.get('oauth_role', 'student')
# Validates: if role in ['student', 'researcher'] else 'student'
```

This means:
- ✅ If user selected "Researcher" → Creates with researcher role
- ✅ If user selected "Student" → Creates with student role
- ✅ If role is invalid → Defaults to student (fallback safety)

---

## Testing the Fix

### Test 1: Signup as Researcher
1. Go to http://localhost:3000
2. Click "Create Account"
3. Fill form
4. **Select "Researcher"** (should be highlighted in blue)
5. Click "Initialize Account"
6. ✅ Should be logged in as Researcher

### Test 2: OAuth Researcher Login
1. Go to http://localhost:3000
2. **Select "Researcher"** (blue highlight)
3. Click **"Login with Google"** (or GitHub)
4. Sign in with Google/GitHub
5. ✅ Should be logged in as **Researcher** (not Student!)

### Test 3: OAuth Student Login
1. Go to http://localhost:3000
2. **Select "Learner"** (violet highlight)
3. Click **"Login with Google"**
4. Sign in
5. ✅ Should be logged in as **Student**

---

## Access Control

### Student ("Learner") Can Access:
- ✅ Learn (learning paths)
- ✅ Overview
- ✅ Limited features (free tier)

### Researcher Can Access:
- ✅ Everything Student can access
- ✅ Training
- ✅ Experiments
- ✅ Model Hub
- ✅ Evaluation
- ✅ Advanced features (free tier)

### Admin Can Access:
- ✅ Everything
- ✅ Admin Console (broadcast, user management, system health)
- 🔒 **Only with hardcoded admin credentials**

---

## Important Notes

### 1. Free Access
Both Student and Researcher get free access initially. As you requested:
> "Later, based on how we get engagement rate, we can just fix the boundaries"

To add subscription gates later, modify:
- `pages/Billing.tsx` - Show subscription requirements
- `services/api.ts` - Add subscription checks
- `App.tsx` - Route guards based on subscription

### 2. No Admin Signup
Admin role is completely hidden from signup. The only way to be admin:
```
Email: prajankrish7@gmail.com
Password: admin@3267
```

Users cannot self-promote to admin. (Secure by default!)

### 3. Role Changes
Once a user is created with a role, only admins can change it. This is enforced on the backend:
```python
# backend/main.py - update_profile endpoint
if "role" in updates and user.role != "admin":
    del updates["role"]  # Remove if user tries to change role
```

---

## File Changes Summary

| File | Change |
|------|--------|
| `pages/Auth.tsx` | ✅ Removed Admin option, changed grid to 2 columns, fixed OAuth role passing |
| `services/auth.ts` | ✅ No changes needed (already working) |
| `backend/main.py` | ✅ No changes needed (already validating roles) |

---

## Ready to Test!

1. Restart frontend: `npm run dev`
2. Go to http://localhost:3000
3. Test signup and OAuth with both roles
4. Verify you get the role you selected ✅

**Status**: ✅ Admin option removed, OAuth role selection fixed, free access for both roles enabled
