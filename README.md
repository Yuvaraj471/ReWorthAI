# ReWorth.AI 🌿

AI-powered Smart Recycling Platform. ReWorth AI provides live waste detection via YOLOv11s, EcoCredits management, rewards redemption, and real-time WebSocket feeds for smart bin IoT integration.

## 🚀 Getting Started (Local Development)

### Prerequisites
- Node.js (v18+)
- Python (3.10+)

### 1. Start the Backend (FastAPI)
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Start the Frontend (Next.js)
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser.

## 🛠️ Production Deployment

### 1. Environment Variables
Create a `.env` file in the root directory (use `.env.example` as a template). 
**CRITICAL**: You MUST generate a secure `SECRET_KEY` for the backend and set the correct `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` values.

### 2. Build the Frontend
```bash
npm install
npm run build
npm start
```
*Note: For Vercel deployment, simply connect the GitHub repository and set the `NEXT_PUBLIC_*` environment variables in the Vercel dashboard.*

### 3. Run the Backend in Production
```bash
cd backend
pip install -r requirements.txt
# Run with Gunicorn and Uvicorn workers for production stability
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8000
```

### Production Checklist
- [ ] Secrets (like JWT keys and SMTP passwords) are read from `.env` and NOT hardcoded.
- [ ] Cross-Origin Resource Sharing (CORS) is configured for the exact production domain.
- [ ] Database is using PostgreSQL in production (SQLite is only for dev/testing).
- [ ] Camera hardware API permissions are served over HTTPS (required by browsers).
