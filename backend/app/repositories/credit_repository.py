from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.credit import Credit

class CreditRepository:
    @staticmethod
    def get_by_waste_type(db: Session, waste_type: str) -> Optional[Credit]:
        return db.query(Credit).filter(Credit.waste_type == waste_type).first()

    @staticmethod
    def get_all(db: Session) -> List[Credit]:
        return db.query(Credit).all()

    @staticmethod
    def create(db: Session, credit: Credit) -> Credit:
        db.add(credit)
        db.commit()
        db.refresh(credit)
        return credit

    @staticmethod
    def update(db: Session, credit: Credit) -> Credit:
        db.commit()
        db.refresh(credit)
        return credit
