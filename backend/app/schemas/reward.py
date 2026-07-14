from pydantic import BaseModel, Field
from typing import Optional

class RewardCreate(BaseModel):
    title: str = Field(..., min_length=2)
    category: str
    description: str
    cost: int = Field(..., gt=0)
    stock: int = Field(..., ge=0)
    image: Optional[str] = None

class RewardUpdate(BaseModel):
    title: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    cost: Optional[int] = None
    stock: Optional[int] = None
    image: Optional[str] = None

class RewardOut(BaseModel):
    id: int
    title: str
    category: str
    description: str
    cost: int
    stock: int
    image: Optional[str] = None

    class Config:
        from_attributes = True
