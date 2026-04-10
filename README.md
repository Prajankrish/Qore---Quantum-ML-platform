<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Qore - AI-Enhanced Quantum ML Platform

> **🐍 Primary Language: Python**
> 
> This project uses **Python** as the main programming language for all backend logic, data processing, authentication, and AI integration. The frontend is a thin React UI layer that calls the Python API.

---

## Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                      QORE PLATFORM                             │
├────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────┐      ┌────────────────────────────┐ │
│  │   FRONTEND (UI)      │      │   🐍 PYTHON BACKEND        │ │
│  │   React/TypeScript   │ ───► │   FastAPI + SQLAlchemy     │ │
│  │                      │      │                            │ │
│  │  • Display data      │      │  ✅ Authentication (JWT)   │ │
│  │  • User interaction  │      │  ✅ OAuth (Google/GitHub)  │ │
│  │  • Calls Python API  │      │  ✅ Database operations    │ │
│  │                      │      │  ✅ AI Integration         │ │
│  │                      │      │  ✅ All business logic     │ │
│  └──────────────────────┘      └────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Step 1: Start Python Backend (Required)

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

**Backend runs at:** http://localhost:8000
**API Docs:** http://localhost:8000/docs

### Step 2: Start Frontend (Optional)

```bash
npm install
npm run dev
```

**Frontend runs at:** http://localhost:5173

---

## 📁 Project Structure

```
Qore/
├── backend/                  # 🐍 PYTHON BACKEND (ALL LOGIC HERE)
│   ├── main.py              # FastAPI app (40+ endpoints)
│   ├── models.py            # Database models (SQLAlchemy)
│   ├── database.py          # Database connection
│   ├── config.py            # Configuration
│   ├── auth.py              # JWT authentication
│   ├── requirements.txt     # Python dependencies
│   └── .env                 # Environment variables
│
├── components/               # React components (UI only)
├── pages/                    # React pages (UI only)
├── services/
│   ├── pythonApi.ts         # API client → calls Python
│   └── auth.ts              # Auth service → calls Python
│
└── README_PYTHON.md         # Detailed Python docs
```

---

## Python Backend Features

| Feature | Description |
|---------|-------------|
| **Authentication** | JWT tokens, bcrypt password hashing |
| **OAuth** | Google and GitHub sign-in |
| **Database** | SQLAlchemy ORM with SQLite |
| **Experiments** | Create, run, track training experiments |
| **Models** | Save models, analyze resources |
| **Datasets** | Upload CSV, parse, compute stats |
| **Predictions** | Quantum and classical inference |
| **Research** | Paper search and bookmarking |
| **Learning** | Generate learning paths |
| **Notifications** | User notification system |
| **Billing** | Subscription management |

---

## 📖 Documentation

- **Backend API Docs:** http://localhost:8000/docs
- **Detailed Setup:** See [README_PYTHON.md](README_PYTHON.md)

---

## Environment Variables

Create `backend/.env`:

```env
SECRET_KEY=your-secret-key
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:8000

# Optional: OAuth
GOOGLE_CLIENT_ID=...
GITHUB_CLIENT_ID=...

# Optional: AI
GEMINI_API_KEY=...
```
