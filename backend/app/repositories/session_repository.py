from sqlalchemy.orm import Session
from typing import Optional
from app.models.session import RecyclingSession
from app.core.constants import SessionStatus

class SessionRepository:
    @staticmethod
    def get_by_id(db: Session, session_id: int) -> Optional[RecyclingSession]:
        return db.query(RecyclingSession).filter(RecyclingSession.id == session_id).first()

    @staticmethod
    def get_by_code(db: Session, code: str) -> Optional[RecyclingSession]:
        return db.query(RecyclingSession).filter(RecyclingSession.session_code == code).first()

    @staticmethod
    def get_active_session_by_user(db: Session, user_id: int) -> Optional[RecyclingSession]:
        return db.query(RecyclingSession).filter(
            RecyclingSession.user_id == user_id,
            RecyclingSession.status == SessionStatus.ACTIVE.value
        ).first()

    @staticmethod
    def get_any_active_session(db: Session) -> Optional[RecyclingSession]:
        return db.query(RecyclingSession).filter(
            RecyclingSession.status == SessionStatus.ACTIVE.value
        ).first()

    @staticmethod
    def create(db: Session, session: RecyclingSession) -> RecyclingSession:
        db.add(session)
        db.commit()
        db.refresh(session)
        return session

    @staticmethod
    def update(db: Session, session: RecyclingSession) -> RecyclingSession:
        db.commit()
        db.refresh(session)
        return session
