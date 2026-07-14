from sqlalchemy.orm import Session
from typing import List
from app.models.reward import Reward
from app.schemas.reward import RewardCreate, RewardUpdate
from app.repositories.reward_repository import RewardRepository
from fastapi import HTTPException, status

class RewardService:
    @staticmethod
    def get_catalog(db: Session) -> List[Reward]:
        return RewardRepository.get_all(db)

    @staticmethod
    def get_reward(db: Session, reward_id: int) -> Reward:
        reward = RewardRepository.get_by_id(db, reward_id)
        if not reward:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reward item not found"
            )
        return reward

    @staticmethod
    def create_reward(db: Session, reward_in: RewardCreate) -> Reward:
        new_reward = Reward(
            title=reward_in.title,
            category=reward_in.category,
            description=reward_in.description,
            cost=reward_in.cost,
            stock=reward_in.stock,
            image=reward_in.image
        )
        return RewardRepository.create(db, new_reward)

    @staticmethod
    def update_reward(db: Session, reward_id: int, reward_in: RewardUpdate) -> Reward:
        reward = RewardRepository.get_by_id(db, reward_id)
        if not reward:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reward item not found"
            )
            
        update_data = reward_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(reward, field, value)
            
        return RewardRepository.update(db, reward)

    @staticmethod
    def delete_reward(db: Session, reward_id: int) -> None:
        reward = RewardRepository.get_by_id(db, reward_id)
        if not reward:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reward item not found"
            )
        RewardRepository.delete(db, reward)
