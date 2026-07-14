import hashlib
from datetime import datetime
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import List, Dict, Any
from app.models.detection import Detection
from app.repositories.session_repository import SessionRepository
from app.repositories.detection_repository import DetectionRepository
from app.repositories.credit_repository import CreditRepository
from app.repositories.user_repository import UserRepository
from app.utils.detector import detector
from app.websocket.manager import manager
from app.core.config import settings

class DetectionService:
    @staticmethod
    def process_frame(
        db: Session, 
        user_id: int, 
        image_data: bytes
    ) -> List[Dict[str, Any]]:
        # 1. Verify that user has an active session
        session = SessionRepository.get_active_session_by_user(db, user_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active recycling session found. Scan the slot QR code to start."
            )

        # Check session timeout
        now = datetime.utcnow()
        if now > session.expires_at:
            from app.core.constants import SessionStatus
            session.status = SessionStatus.EXPIRED.value
            SessionRepository.update(db, session)
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Recycling session has expired. Please start a new session."
            )

        # 3. YOLO Inference
        yolo_detections = detector.detect(image_data)
        
        valid_detections = []

        for det in yolo_detections:
            waste_class = det["class"]
            confidence = det["confidence"]

            # Filter by configured threshold (e.g. 75%)
            # Convert decimal confidence to percent for comparison
            if (confidence * 100) < settings.YOLO_CONFIDENCE_THRESHOLD:
                continue

            # Fetch credits from DB
            credit_config = CreditRepository.get_by_waste_type(db, waste_class)
            credits_earned = credit_config.credits if credit_config else 10

            valid_detections.append({
                "class": waste_class,
                "confidence": confidence,
                "credits": credits_earned,
                "x": det.get("x"),
                "y": det.get("y"),
                "width": det.get("width"),
                "height": det.get("height")
            })

        return valid_detections

    @staticmethod
    def finalize_detection(
        db: Session,
        user_id: int,
        waste_class: str = None,
        confidence: float = None,
        detections: List[Any] = None
    ) -> Dict[str, Any]:
        session = SessionRepository.get_active_session_by_user(db, user_id)
        if not session:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No active recycling session found. Scan the slot QR code to start."
            )

        user = UserRepository.get_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )

        items_to_process = []
        if detections:
            items_to_process = detections
        elif waste_class and confidence is not None:
            class DummyItem:
                def __init__(self, wc, conf):
                    self.waste_class = wc
                    self.confidence = conf
            items_to_process = [DummyItem(waste_class, confidence)]

        if not items_to_process:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No detections provided"
            )

        total_credits = 0
        total_carbon = 0
        classes_detected = []

        for item in items_to_process:
            w_class = getattr(item, 'waste_class', None) or (item.get('waste_class') if isinstance(item, dict) else None)
            conf = getattr(item, 'confidence', None) or (item.get('confidence') if isinstance(item, dict) else None)

            if not w_class or conf is None:
                continue

            credit_config = CreditRepository.get_by_waste_type(db, w_class)
            credits_earned = credit_config.credits if credit_config else 10

            new_detection = Detection(
                session_id=session.id,
                waste_type=w_class,
                confidence=conf * 100,
                credits_earned=credits_earned,
                image_hash=None,
                created_at=datetime.utcnow()
            )
            DetectionRepository.create(db, new_detection)

            total_credits += credits_earned
            total_carbon += 0.25
            classes_detected.append(w_class)

        user.eco_credits += total_credits
        user.carbon_saved = round(user.carbon_saved + total_carbon, 2)
        user.bottles_recycled = (user.bottles_recycled or 0) + len(items_to_process)
        UserRepository.update(db, user)

        manager.broadcast_to_user(
            user_id,
            {
                "event": "credits_updated",
                "credits": user.eco_credits
            }
        )

        manager.broadcast_global({
            "event": "leaderboard_updated"
        })

        return {
            "status": "success",
            "classes": classes_detected,
            "credits_earned": total_credits,
            "total_credits": user.eco_credits
        }
