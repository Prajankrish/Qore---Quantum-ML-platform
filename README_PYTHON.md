# Qore Platform - Python Backend Setup

To enable the real Python backend (FastAPI + Qiskit) for this application, follow these steps locally.

## 1. Install Dependencies
Ensure you have Python 3.9+ installed.

```bash
cd backend
pip install -r requirements.txt
```

## 2. Run the Server
Start the FastAPI server. It will run on `http://localhost:8000`.

```bash
python main.py
# OR
uvicorn main:app --reload
```

## 3. Connect Frontend
1. Open `services/api.ts`.
2. Find the line: `const USE_PYTHON_BACKEND = false;`
3. Change it to: `const USE_PYTHON_BACKEND = true;`

The React application will now send real HTTP requests to your Python backend instead of using the browser-based simulation.

## Key Files
- `backend/main.py`: The entry point for the API.
- `backend/quantum_logic.py`: (Optional extension) Where you can put complex Qiskit circuits.
