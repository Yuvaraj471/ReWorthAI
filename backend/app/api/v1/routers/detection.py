from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.services.detection_service import DetectionService
from app.repositories.detection_repository import DetectionRepository
from app.schemas.detection import DetectionOut
from app.core.dependencies import get_current_student
from app.models.user import User
from datetime import datetime

router = APIRouter(prefix="/detect", tags=["Detection"])

@router.post("/upload")
async def detect_from_upload(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student)
):
    """Upload an image file for waste detection and automatic credit award."""
    image_data = await file.read()
    detections = DetectionService.process_frame(db, current_user.id, image_data)
    total_credits = sum(d.get("credits", 0) for d in detections)
    return {
        "detections": detections,
        "total_credits_earned": total_credits,
        "timestamp": datetime.utcnow().isoformat()
    }

from pydantic import BaseModel
from typing import Optional, List, Dict, Any

class DetectionItem(BaseModel):
    waste_class: str
    confidence: float
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None

class FinalizeDetectionIn(BaseModel):
    waste_class: Optional[str] = None
    confidence: Optional[float] = None
    x: Optional[float] = None
    y: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None
    detections: Optional[List[DetectionItem]] = None

class DetectFrameIn(BaseModel):
    frame: str

@router.post("/finalize")
async def finalize_detection(
    body: FinalizeDetectionIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student)
):
    """Finalize a detection and award credits."""
    result = DetectionService.finalize_detection(
        db, current_user.id, body.waste_class, body.confidence, getattr(body, "detections", None)
    )
    return result

@router.post("/frame")
async def detect_from_base64(
    body: DetectFrameIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student)
):
    """Submit a base64-encoded camera frame for live waste detection."""
    import base64
    import logging
    
    logger = logging.getLogger(__name__)
    frame_b64 = body.frame
    logger.info(f"Received frame from user {current_user.id}, size: {len(frame_b64)} chars")
    
    if not frame_b64:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Empty frame data"
        )
        
    try:
        # Strip the data URL prefix if present
        if "base64," in frame_b64:
            frame_b64 = frame_b64.split("base64,")[1]
        image_data = base64.b64decode(frame_b64)
        logger.info("Successfully decoded base64 image")
    except Exception as e:
        logger.error(f"Failed to decode base64: {e}")
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid base64 image frame"
        )
        
    try:
        detections = DetectionService.process_frame(db, current_user.id, image_data)
        logger.info(f"YOLO inference successful. Found {len(detections)} objects.")
    except Exception as e:
        logger.error(f"YOLO inference failed: {e}")
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Detection processing failed"
        )
        
    return {
        "detections": detections,
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/history", response_model=List[DetectionOut])
def get_detection_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student)
):
    """Get a student's complete detection history across all sessions."""
    return DetectionRepository.get_all_by_user(db, current_user.id)
