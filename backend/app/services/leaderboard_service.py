from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.repositories.user_repository import UserRepository

class LeaderboardService:
    @staticmethod
    def get_rankings(db: Session, limit: int = 50) -> List[Dict[str, Any]]:
        top_users = UserRepository.get_top_rankings(db, limit=limit)
        result = []
        for rank, user in enumerate(top_users, start=1):
            result.append({
                "rank": rank,
                "id": user.id,
                "name": user.name,
                "eco_credits": user.eco_credits,
                "carbon_saved": user.carbon_saved,
                "total_sessions": user.total_sessions,
            })
        return result
