from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class RedemptionCreate(BaseModel):
    reward_id: int

class RedemptionOut(BaseModel):
    id: int
    user_id: int
    student_name: Optional[str] = None
    student_email: Optional[str] = None
    reward_id: int
    voucher_title: Optional[str] = None
    category: Optional[str] = None
    cost: Optional[int] = None
    code: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
