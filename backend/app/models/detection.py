from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class Detection(Base):
    __tablename__ = "detections"

    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("recycling_sessions.id", ondelete="CASCADE"), nullable=False)
    waste_type = Column(String, nullable=False)
    confidence = Column(Float, nullable=False) # e.g. 0.95
    credits_earned = Column(Integer, nullable=False)
    image_hash = Column(String, index=True, nullable=True) # Prevent double credits for duplicate scans
    created_at = Column(DateTime, nullable=False)

    # Relationships
    session = relationship("RecyclingSession", back_populates="detections")
