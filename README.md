# AI Study Strategist

### AI-powered video lecture summarizer and intelligent learning platform

> Academic Major Project | Parul Institute of Technology, Parul University, Vadodara
> Department of Computer Science & Engineering | AY 2025-2026

[![Frontend](https://img.shields.io/badge/frontend-React%2019%20%2B%20Vite-61dafb)](frontend/)
[![Backend](https://img.shields.io/badge/API-Node.js%20%2B%20Express-339933)](backend/)
[![AI service](https://img.shields.io/badge/AI-FastAPI%20%2B%20Python-009688)](python-ai-service/)
[![License](https://img.shields.io/badge/license-MIT-blue)](.)

## 🔗 Project Links

### 🌐 Live Website

[Open AI Study Strategist](https://major-project-b-tech-cse-505hsivap-major-project-b-tech-cse-ai.vercel.app)

### 📦 GitHub Repository

[View the complete source code](https://github.com/rhr10082004/Major-Project---B-Tech-CSE---AI-)

### 🧾 Latest Upload

[View the latest GitHub commit](https://github.com/rhr10082004/Major-Project---B-Tech-CSE---AI-/commit/cf2cb4f39863156609fe27ebdd0dd3d0cf40f15e)

## 1. Project overview

AI Study Strategist turns lectures, documents, and study material into structured learning resources. It combines summarisation, flashcards, quizzes, an AI tutor, coding practice, study planning, and role-based dashboards in one platform.

### Main capabilities

- Video and document summarisation
- Interactive flashcards and MCQ practice
- AI tutor, interview preparation, and resume generation
- LeetCode-style problem browsing and code workspace
- Student, faculty, and administrator dashboards
- Progress analytics, recommendations, and study planning

## 2. System architecture

| Service | Technology | Local URL | Responsibility |
| --- | --- | --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS | http://localhost:5174 | Web interface |
| Backend API | Node.js, Express, MongoDB/Mongoose | http://localhost:5000 | Auth, data, and application APIs |
| AI service | Python, FastAPI | http://localhost:8000 | Summarisation and AI endpoints |
| Database | MongoDB | mongodb://localhost:27017 | Persistent application data |

The browser calls the backend at port `5000`; the backend calls the AI service at port `8000`. Keeping these URLs consistent prevents the frontend from starting successfully while API requests fail.

## 3. Prerequisites

Choose one of the following:

- **Docker Desktop** for the recommended all-services setup
- **Node.js 20+**, **npm**, **Python 3.10+**, and optional local MongoDB for manual setup

## 4. Recommended startup: Docker Compose

From the repository root:

```bash
docker compose up --build
```

Open:

- Web app: http://localhost:5174
- Backend health: http://localhost:5000/health
- AI service health: http://localhost:8000/health
- Backend API docs are not provided by this Express service; use the repository routes and frontend for API validation.

To stop the stack:

```bash
docker compose down
```

To stop it and remove the local MongoDB volume:

```bash
docker compose down -v
```

The root Compose file uses the Dockerfiles in `docker/`, publishes the Vite server on `5174`, and supplies both frontend API URLs explicitly.

## 5. Windows one-click startup

With Node.js and Python dependencies installed, run one of these from the repository root:

```powershell
.\start-all.ps1
```

or:

```bat
start-all.bat
```

The launcher starts the services in this order:

1. Python AI service on `8000`
2. Express backend on `5000`, configured to call the AI service on `8000`
3. Vite frontend on `5174`, configured to call both services

## 6. Manual startup

### Terminal 1: AI service

```powershell
cd python-ai-service
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2: backend

```powershell
cd backend
npm install
$env:PORT = "5000"
$env:AI_SERVICE_URL = "http://localhost:8000"
node server.js
```

MongoDB is optional for the demo fallback mode. For persistent data, set `MONGODB_URI` before starting the backend.

### Terminal 3: frontend

```powershell
cd frontend
npm install
$env:VITE_API_URL = "http://localhost:5000"
$env:VITE_AI_URL = "http://localhost:8000"
npm run dev -- --port 5174 --host
```

## 7. Health checks and troubleshooting

Run these checks before opening the UI:

```powershell
Invoke-WebRequest http://localhost:8000/health
Invoke-WebRequest http://localhost:5000/health
```

If a port is already in use, stop the process holding that port or use the documented Compose setup after stopping any manually started services. If Docker containers restart repeatedly, inspect logs:

```bash
docker compose logs --tail=100 backend
docker compose logs --tail=100 python-ai-service
docker compose logs --tail=100 frontend
```

For a clean local restart:

```bash
docker compose down -v
docker compose up --build
```

## 8. Demo accounts

The application includes evaluator demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| Student | `sajid@parul.ac.in` | `password123` |
| Faculty | `gayatri.naidu@parul.ac.in` | `password123` |
| Administrator | `admin@parul.ac.in` | `password123` |

Use demo credentials only in a local or evaluation environment. Change them before any public deployment.

## 9. Deployment

The repository includes `render.yaml` for deploying the backend, Python AI service, and static frontend on Render. Configure the required secret environment variables in the hosting provider rather than committing them.

For a Vercel frontend deployment, configure:

```text
VITE_API_URL=https://<your-backend-host>
VITE_AI_URL=https://<your-ai-service-host>
```

## 10. Project sequence

```text
frontend/            React web application
backend/             Express API and application data layer
python-ai-service/   FastAPI AI microservice
docker/              Service Dockerfiles and alternate Compose setup
scripts/             Repository utilities
docker-compose.yml   Recommended local orchestration
render.yaml          Render deployment blueprint
start-all.ps1        Windows PowerShell launcher
start-all.bat        Windows Command Prompt launcher
```

## 11. Academic attribution

**Project team:** Sajid Khan, Repaka Himanshu Raj, Siddesh Surti, and Anuj N. Pandey
**Project guide:** Mrs. Gayatri Devraj Naidu, Assistant Professor, Department of CSE, PIT

Developed at Parul Institute of Technology, Vadodara.
