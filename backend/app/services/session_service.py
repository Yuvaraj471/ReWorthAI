from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional, Dict, Any
from app.models.session import RecyclingSession
from app.repositories.session_repository import SessionRepository
from app.repositories.user_repository import UserRepository
from app.core.config import settings
from app.core.constants import SessionStatus

class SessionService:
    @staticmethod
    def start_session(db: Session, user_id: int) -> RecyclingSession:
        # Check system-wide active session locks
        active_session = SessionRepository.get_any_active_session(db)
        if active_session:
            # Check if it has timed out
            now = datetime.utcnow()
            if now > active_session.expires_at:
                active_session.status = SessionStatus.EXPIRED.value
                SessionRepository.update(db, active_session)
            else:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Another recycling terminal session is currently active. Please try again shortly."
                )

        # Generate a random 6-character alphanumeric session token
        import uuid
        session_code = f"SES-{uuid.uuid4().hex[:6].upper()}"
        
        now = datetime.utcnow()
        expires_at = now + timedelta(seconds=settings.SESSION_DURATION_SECONDS)

        new_session = RecyclingSession(
            user_id=user_id,
            session_code=session_code,
            status=SessionStatus.ACTIVE.value,
            created_at=now,
            expires_at=expires_at
        )
        return SessionRepository.create(db, new_session)

    @staticmethod
    def get_session_status(db: Session, user_id: int) -> Dict[str, Any]:
        session = SessionRepository.get_active_session_by_user(db, user_id)
        if not session:
            return {"active": False, "remaining_time": 0, "status": "idle"}

        now = datetime.utcnow()
        if now > session.expires_at:
            session.status = SessionStatus.EXPIRED.value
            SessionRepository.update(db, session)
            return {"active": False, "remaining_time": 0, "status": SessionStatus.EXPIRED.value}

        remaining = int((session.expires_at - now).total_seconds())
        return {
            "active": True,
            "remaining_time": remaining,
            "session_code": session.session_code,
            "status": session.status
        }

    @staticmethod
    def end_session(db: Session, user_id: int, commit_state: str = "COMPLETED") -> RecyclingSession:
        session = SessionRepository.get_active_session_by_user(db, user_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No active recycling session found for this student profile"
            )

        session.status = commit_state
        SessionRepository.update(db, session)

        # Increment total sessions for student on successful deposits completion
        if commit_state == SessionStatus.COMPLETED.value:
            user = UserRepository.get_by_id(db, user_id)
            if user:
                user.total_sessions += 1
                UserRepository.update(db, user)

        return session
