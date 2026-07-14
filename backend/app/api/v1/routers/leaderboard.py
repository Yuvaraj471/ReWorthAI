from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.services.leaderboard_service import LeaderboardService

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])

@router.get("/")
def get_leaderboard(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Public: Get top students ranked by EcoCredits."""
    return LeaderboardService.get_rankings(db, limit=limit)
