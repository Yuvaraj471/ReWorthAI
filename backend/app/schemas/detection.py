from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional

class CameraFrameInput(BaseModel):
    frame: str # Base64 encoded image frame

class DetectionItem(BaseModel):
    waste_class: str = Field(..., serialization_alias="class")
    confidence: float

class DetectionResponse(BaseModel):
    detections: List[DetectionItem]

class DetectionOut(BaseModel):
    id: int
    session_id: int
    waste_type: str
    confidence: float
    credits_earned: int
    created_at: datetime

    class Config:
        from_attributes = True
