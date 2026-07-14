from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Optional
from app.models.redemption import Redemption
from app.repositories.redemption_repository import RedemptionRepository
from app.repositories.reward_repository import RewardRepository
from app.repositories.user_repository import UserRepository
from app.utils.redemption_code import generate_redemption_code
from app.core.constants import RedemptionStatus
from app.websocket.manager import manager

class RedemptionService:
    @staticmethod
    def redeem_reward(db: Session, user_id: int, reward_id: int) -> Redemption:
        # Fetch student and reward details
        user = UserRepository.get_by_id(db, user_id)
        reward = RewardRepository.get_by_id(db, reward_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Student profile not found"
            )
        if not reward:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reward catalog item not found"
            )

        if reward.stock <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This reward is currently out of stock"
            )

        if user.eco_credits < reward.cost:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient EcoCredits balance. Required: {reward.cost}, Current: {user.eco_credits}"
            )

        # Deduct credits and update stock
        user.eco_credits -= reward.cost
        reward.stock -= 1

        UserRepository.update(db, user)
        RewardRepository.update(db, reward)

        # Generate unique verification code
        # Ensure it is globally unique in DB
        code = generate_redemption_code()
        while RedemptionRepository.get_by_code(db, code) is not None:
            code = generate_redemption_code()

        new_redemption = Redemption(
            user_id=user_id,
            reward_id=reward_id,
            code=code,
            status=RedemptionStatus.PENDING.value,
            created_at=datetime.utcnow()
        )
        
        created = RedemptionRepository.create(db, new_redemption)

        # Broadcast live updates to client WebSocket connections
        manager.broadcast_to_user(
            user_id,
            {
                "event": "credits_updated",
                "credits": user.eco_credits
            }
        )

        return created

    @staticmethod
    def get_student_redemptions(db: Session, user_id: int) -> List[Redemption]:
        return RedemptionRepository.get_by_user(db, user_id)

    @staticmethod
    def get_all_redemptions(db: Session, status: Optional[str] = None) -> List[Redemption]:
        return RedemptionRepository.get_all(db, status)

    @staticmethod
    def update_status(
        db: Session, 
        redemption_id: int, 
        new_status: str
    ) -> Redemption:
        redemption = RedemptionRepository.get_by_id(db, redemption_id)
        if not redemption:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Voucher redemption log not found"
            )

        if new_status not in [RedemptionStatus.APPROVED.value, RedemptionStatus.REDEEMED.value]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid voucher status request"
            )

        redemption.status = new_status
        updated = RedemptionRepository.update(db, redemption)

        # Notify student via websocket
        manager.broadcast_to_user(
            redemption.user_id,
            {
                "event": "voucher_updated",
                "code": redemption.code,
                "status": new_status
            }
        )

        return updated
