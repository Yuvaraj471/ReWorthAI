from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database.session import Base

class Reward(Base):
    __tablename__ = "rewards"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    category = Column(String, nullable=False)
    description = Column(String, nullable=False)
    cost = Column(Integer, nullable=False)
    stock = Column(Integer, default=0, nullable=False)
    image = Column(String, nullable=True) # Icon representation or image path

    # Relationships
    redemptions = relationship("Redemption", back_populates="reward", cascade="all, delete-orphan")
