from sqlalchemy import Column, Integer, String
from app.database.session import Base

class Credit(Base):
    __tablename__ = "credits"

    id = Column(Integer, primary_key=True, index=True)
    waste_type = Column(String, unique=True, index=True, nullable=False)
    credits = Column(Integer, nullable=False)
