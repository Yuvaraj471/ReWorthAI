from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.core.constants import SessionStatus

class RecyclingSession(Base):
    __tablename__ = "recycling_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    session_code = Column(String, unique=True, index=True, nullable=False)
    status = Column(String, default=SessionStatus.ACTIVE.value, nullable=False)
    created_at = Column(DateTime, nullable=False)
    expires_at = Column(DateTime, nullable=False)

    # Relationships
    user = relationship("User", back_populates="sessions")
    detections = relationship("Detection", back_populates="session", cascade="all, delete-orphan")
