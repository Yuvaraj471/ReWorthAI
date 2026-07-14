from sqlalchemy import Column, Integer, String, Boolean, Float
from sqlalchemy.orm import relationship
from app.database.session import Base
from app.core.constants import UserRole

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default=UserRole.STUDENT.value, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    
    # Recycling and sustainability achievements
    eco_credits = Column(Integer, default=0, nullable=False)
    carbon_saved = Column(Float, default=0.0, nullable=False)
    total_sessions = Column(Integer, default=0, nullable=False)
    bottles_recycled = Column(Integer, default=0, nullable=False)
    
    # Affiliate details
    register_number = Column(String, nullable=True)
    department = Column(String, nullable=True)
    year = Column(String, nullable=True)

    # Relationships
    sessions = relationship("RecyclingSession", back_populates="user", cascade="all, delete-orphan")
    redemptions = relationship("Redemption", back_populates="user", cascade="all, delete-orphan")
