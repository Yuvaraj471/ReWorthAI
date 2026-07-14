from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.redemption import Redemption

class RedemptionRepository:
    @staticmethod
    def get_by_id(db: Session, redemption_id: int) -> Optional[Redemption]:
        return db.query(Redemption).filter(Redemption.id == redemption_id).first()

    @staticmethod
    def get_by_code(db: Session, code: str) -> Optional[Redemption]:
        return db.query(Redemption).filter(Redemption.code == code).first()

    @staticmethod
    def get_all(db: Session, status: Optional[str] = None) -> List[Redemption]:
        query = db.query(Redemption)
        if status:
            query = query.filter(Redemption.status == status)
        return query.order_by(Redemption.created_at.desc()).all()

    @staticmethod
    def get_by_user(db: Session, user_id: int) -> List[Redemption]:
        return db.query(Redemption)\
            .filter(Redemption.user_id == user_id)\
            .order_by(Redemption.created_at.desc())\
            .all()

    @staticmethod
    def create(db: Session, redemption: Redemption) -> Redemption:
        db.add(redemption)
        db.commit()
        db.refresh(redemption)
        return redemption

    @staticmethod
    def update(db: Session, redemption: Redemption) -> Redemption:
        db.commit()
        db.refresh(redemption)
        return redemption
