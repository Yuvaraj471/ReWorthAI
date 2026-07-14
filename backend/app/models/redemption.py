from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.core.constants import RedemptionStatus

class Redemption(Base):
    __tablename__ = "redemptions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reward_id = Column(Integer, ForeignKey("rewards.id", ondelete="CASCADE"), nullable=False)
    code = Column(String, unique=True, index=True, nullable=False) # e.g. RW-9F2K8M
    status = Column(String, default=RedemptionStatus.PENDING.value, nullable=False)
    created_at = Column(DateTime, nullable=False)

    # Relationships
    user = relationship("User", back_populates="redemptions")
    reward = relationship("Reward", back_populates="redemptions")
