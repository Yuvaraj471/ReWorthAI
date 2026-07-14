from fastapi import APIRouter
from app.api.v1.routers import auth, admin, session, detection, rewards, leaderboard, websocket

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(admin.router)
api_router.include_router(session.router)
api_router.include_router(detection.router)
api_router.include_router(rewards.router)
api_router.include_router(leaderboard.router)
api_router.include_router(websocket.router)
