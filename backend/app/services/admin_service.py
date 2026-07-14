from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional, Dict, Any
from app.repositories.user_repository import UserRepository
from app.repositories.detection_repository import DetectionRepository
from app.repositories.redemption_repository import RedemptionRepository
from app.models.user import User

class AdminService:
    @staticmethod
    def get_students(
        db: Session,
        search: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[User]:
        return UserRepository.get_students(db, search=search, skip=skip, limit=limit)

    @staticmethod
    def block_student(db: Session, user_id: int) -> User:
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
        user.is_active = False
        return UserRepository.update(db, user)

    @staticmethod
    def unblock_student(db: Session, user_id: int) -> User:
        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
        user.is_active = True
        return UserRepository.update(db, user)

    @staticmethod
    def get_platform_stats(db: Session) -> Dict[str, Any]:
        from app.core.constants import UserRole
        from app.core.constants import RedemptionStatus

        total_students = len(UserRepository.get_students(db, limit=10000))
        analytics = DetectionRepository.get_analytics_summary(db)
        all_redemptions = RedemptionRepository.get_all(db)
        pending_vouchers = len([r for r in all_redemptions if r.status == RedemptionStatus.PENDING.value])

        top_students = UserRepository.get_top_rankings(db, limit=5)

        return {
            "total_students": total_students,
            "total_items_collected": analytics["total_items"],
            "total_credits_awarded": analytics["total_credits"],
            "pending_vouchers": pending_vouchers,
            "waste_distribution": analytics["distribution"],
            "top_students": [
                {
                    "id": u.id,
                    "name": u.name,
                    "eco_credits": u.eco_credits,
                    "carbon_saved": u.carbon_saved,
                    "total_sessions": u.total_sessions
                }
                for u in top_students
            ]
        }
