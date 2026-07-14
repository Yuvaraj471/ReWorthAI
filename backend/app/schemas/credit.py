from pydantic import BaseModel, Field

class CreditUpdate(BaseModel):
    credits: int = Field(..., gt=0, description="EcoCredits value must be greater than zero")

class CreditOut(BaseModel):
    id: int
    waste_type: str
    credits: int

    class Config:
        from_attributes = True
