from pydantic import BaseModel, EmailStr, Field, model_validator
from typing import Optional

class UserCreate(BaseModel):
    name: str = Field(..., min_length=2)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    register_number: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None

    @model_validator(mode="after")
    def verify_passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("passwords do not match")
        return self

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    register_number: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6)

class UserOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    is_active: bool
    eco_credits: int
    carbon_saved: float
    total_sessions: int
    bottles_recycled: int = 0
    rank: Optional[int] = None
    register_number: Optional[str] = None
    department: Optional[str] = None
    year: Optional[str] = None

    class Config:
        from_attributes = True
