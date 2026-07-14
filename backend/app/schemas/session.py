from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class SessionOut(BaseModel):
    active: bool
    remaining_time: int
    session_code: Optional[str] = None
    status: str

    class Config:
        from_attributes = True
