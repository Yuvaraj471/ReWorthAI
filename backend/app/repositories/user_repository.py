from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.user import User
from app.core.constants import UserRole

class UserRepository:
    @staticmethod
    def get_by_id(db: Session, user_id: int) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_email(db: Session, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    @staticmethod
    def create(db: Session, user: User) -> User:
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_students(
        db: Session, 
        search: Optional[str] = None, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[User]:
        query = db.query(User).filter(User.role == UserRole.STUDENT.value)
        if search:
            query = query.filter(
                (User.name.ilike(f"%{search}%")) | 
                (User.email.ilike(f"%{search}%"))
            )
        return query.offset(skip).limit(limit).all()

    @staticmethod
    def get_top_rankings(db: Session, limit: int = 50) -> List[User]:
        return db.query(User)\
            .filter(User.role == UserRole.STUDENT.value)\
            .order_by(User.eco_credits.desc())\
            .limit(limit)\
            .all()

    @staticmethod
    def update(db: Session, user: User) -> User:
        db.commit()
        db.refresh(user)
        return user
