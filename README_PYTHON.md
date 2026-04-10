# Qore Platform - Complete Python Backend

A full-featured Python backend for the Qore Quantum ML Platform using FastAPI, SQLAlchemy, and OAuth authentication.

## 🚀 Quick Start

### Prerequisites
- **Python 3.9+** (Python 3.11 recommended)
- **pip** (Python package manager)

### Step 1: Navigate to Backend Directory
```bash
cd backend
```

### Step 2: Create Virtual Environment (Recommended)
```bash
# Windows
python -m venv venv
venv\Scripts\activate

# macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

### Step 3: Install Dependencies
```bash
pip install -r requirements.txt
```

### Step 4: Configure Environment
```bash
# Copy the example environment file
copy .env.example .env    # Windows
cp .env.example .env      # macOS/Linux

# Edit .env with your settings (optional for basic usage)
```

### Step 5: Run the Server
```bash
# Option 1: Direct Python
python main.py

# Option 2: Uvicorn with auto-reload (recommended for development)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at: **http://localhost:8000**

## 📚 API Documentation

Once the server is running, access the interactive API docs:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🔑 Environment Variables

Edit your `.env` file to configure:

| Variable | Description | Required |
|----------|-------------|----------|
| `SECRET_KEY` | JWT signing key | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `BACKEND_URL` | Backend URL for OAuth callbacks | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Optional |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | Optional |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | Optional |
| `GEMINI_API_KEY` | Google Gemini AI API key | Optional |

## 📁 Project Structure

```
backend/
├── main.py           # FastAPI application with all endpoints
├── models.py         # SQLAlchemy database models
├── database.py       # Database connection and session management
├── config.py         # Configuration and environment settings
├── auth.py           # JWT authentication utilities
├── requirements.txt  # Python dependencies
├── .env.example      # Environment variables template
├── .env              # Your local environment (not in git)
└── qore.db           # SQLite database (auto-created)
```

## 🛠️ API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login with email/password |
| GET | `/auth/me` | Get current user |
| PUT | `/auth/profile` | Update user profile |
| GET | `/auth/google` | Google OAuth login |
| GET | `/auth/github` | GitHub OAuth login |

### Experiments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/experiments` | List user experiments |
| POST | `/experiments` | Create experiment |
| POST | `/experiments/{id}/run` | Run experiment |
| DELETE | `/experiments/{id}` | Delete experiment |

### Models
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/models` | List user models |
| POST | `/models` | Create model |
| POST | `/models/{id}/analyze` | Analyze resources |
| DELETE | `/models/{id}` | Delete model |

### Datasets
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/datasets` | List user datasets |
| POST | `/datasets` | Upload CSV dataset |
| DELETE | `/datasets/{id}` | Delete dataset |

### Predictions
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict/quantum` | Quantum prediction |
| POST | `/predict/classical` | Classical prediction |
| POST | `/quantum/state` | Compute quantum state |

### Training & Evaluation
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/training/run` | Run training job |
| POST | `/evaluate` | Evaluate model |
| POST | `/mitigation/run` | Error mitigation |

### Research
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/research/papers?query=` | Search papers |
| GET | `/research/trending` | Trending topics |
| GET | `/research/saved` | Saved papers |
| POST | `/research/save` | Save paper |

### Learning
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/learning/path` | Generate learning path |
| POST | `/learning/explain` | Explain concept |

### Code
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/code/analyze` | Analyze quantum code |
| POST | `/code/generate` | Generate code snippet |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/broadcasts` | List broadcasts |
| POST | `/broadcasts` | Send broadcast (admin) |
| GET | `/notifications` | User notifications |

### Billing
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/billing/invoices` | User invoices |
| POST | `/billing/subscribe` | Subscribe to plan |

## 🗄️ Database

The backend uses **SQLite** by default (file: `qore.db`). Tables are auto-created on first run:

- `users` - User accounts and profiles
- `experiments` - Quantum experiments
- `models` - Trained model artifacts
- `datasets` - Custom uploaded datasets
- `notifications` - User notifications
- `broadcasts` - Admin broadcasts
- `invoices` - Billing records
- `saved_papers` - Bookmarked research papers

## 🔐 Authentication Flow

1. **Local Auth**: Register/login with email + password (bcrypt hashed)
2. **Google OAuth**: Redirect flow with JWT callback
3. **GitHub OAuth**: Redirect flow with JWT callback

All protected endpoints require: `Authorization: Bearer <token>`

## 🌐 OAuth Setup Guide

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create a new project (or select existing)
3. Go to **Credentials** → **Create Credentials** → **OAuth client ID**
4. Select **Web application**
5. Add **Authorized JavaScript origins**: `http://localhost:5173`
6. Add **Authorized redirect URIs**: `http://localhost:8000/auth/google/callback`
7. Copy the **Client ID** and **Client Secret**
8. Add to your `backend/.env`:
   ```
   GOOGLE_CLIENT_ID=your-client-id
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: Qore Platform
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:8000/auth/github/callback`
4. Click **Register application**
5. Copy the **Client ID**
6. Click **Generate a new client secret** and copy it
7. Add to your `backend/.env`:
   ```
   GITHUB_CLIENT_ID=your-client-id
   GITHUB_CLIENT_SECRET=your-client-secret
   ```

### Verifying OAuth Configuration

Once configured, restart the backend and check:
```bash
curl http://localhost:8000/health
```

Response should show OAuth status:
```json
{
  "status": "healthy",
  "oauth": {
    "google": true,
    "github": true
  }
}
```

The frontend will automatically enable/disable OAuth buttons based on this status.

## 🧪 Testing the API

```bash
# Health check
curl http://localhost:8000/health

# Register user
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123", "name": "Test User"}'

# Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Windows - find and kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :8000
kill -9 <PID>
```

### Module Not Found
```bash
# Make sure virtual environment is activated
# Windows
venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Database Issues
```bash
# Delete and recreate database
del qore.db     # Windows
rm qore.db      # macOS/Linux
python main.py  # Will recreate tables
```

## 📦 Dependencies

Core packages:
- **FastAPI** - Modern web framework
- **Uvicorn** - ASGI server
- **SQLAlchemy** - ORM and database toolkit
- **Pydantic** - Data validation
- **Authlib** - OAuth integration
- **python-jose** - JWT tokens
- **Passlib** - Password hashing
- **httpx** - Async HTTP client

## 🚀 Production Deployment

For production:
1. Use a production database (PostgreSQL)
2. Set strong `SECRET_KEY`
3. Use HTTPS with proper certificates
4. Deploy with Gunicorn + Uvicorn workers:

```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```
