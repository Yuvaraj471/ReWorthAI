from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.reward import Reward

class RewardRepository:
    @staticmethod
    def get_by_id(db: Session, reward_id: int) -> Optional[Reward]:
        return db.query(Reward).filter(Reward.id == reward_id).first()

    @staticmethod
    def get_all(db: Session) -> List[Reward]:
        return db.query(Reward).all()

    @staticmethod
    def create(db: Session, reward: Reward) -> Reward:
        db.add(reward)
        db.commit()
        db.refresh(reward)
        return reward

    @staticmethod
    def delete(db: Session, reward: Reward) -> None:
        db.delete(reward)
        db.commit()

    @staticmethod
    def update(db: Session, reward: Reward) -> Reward:
        db.commit()
        db.refresh(reward)
        return reward
