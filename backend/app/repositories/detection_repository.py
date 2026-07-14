from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from app.models.detection import Detection
from app.models.session import RecyclingSession
from app.core.constants import SUPPORTED_WASTE_CLASSES

class DetectionRepository:
    @staticmethod
    def get_by_id(db: Session, detection_id: int) -> Optional[Detection]:
        return db.query(Detection).filter(Detection.id == detection_id).first()

    @staticmethod
    def get_by_hash_in_session(db: Session, session_id: int, image_hash: str) -> Optional[Detection]:
        return db.query(Detection).filter(
            Detection.session_id == session_id,
            Detection.image_hash == image_hash
        ).first()

    @staticmethod
    def create(db: Session, detection: Detection) -> Detection:
        db.add(detection)
        db.commit()
        db.refresh(detection)
        return detection

    @staticmethod
    def get_by_session(db: Session, session_id: int) -> List[Detection]:
        return db.query(Detection).filter(Detection.session_id == session_id).all()

    @staticmethod
    def get_all(db: Session) -> List[Detection]:
        return db.query(Detection).order_by(Detection.created_at.desc()).all()

    @staticmethod
    def get_all_by_user(db: Session, user_id: int) -> List[Detection]:
        return db.query(Detection)\
            .join(RecyclingSession, Detection.session_id == RecyclingSession.id)\
            .filter(RecyclingSession.user_id == user_id)\
            .order_by(Detection.created_at.desc())\
            .all()

    @staticmethod
    def get_waste_type_totals(db: Session) -> Dict[str, int]:
        """Returns per-category item counts for all 8 waste types (0 if none detected)."""
        rows = db.query(
            Detection.waste_type,
            func.count(Detection.id).label("count")
        ).group_by(Detection.waste_type).all()

        # Build dict from DB results
        db_counts = {r.waste_type: r.count for r in rows}

        # Ensure all 8 standard classes are present, defaulting to 0
        totals = {}
        for cls in SUPPORTED_WASTE_CLASSES:
            totals[cls] = db_counts.get(cls, 0)
        return totals

    @staticmethod
    def get_analytics_summary(db: Session) -> Dict[str, Any]:
        # Category distribution ratio
        ratios = db.query(
            Detection.waste_type,
            func.count(Detection.id).label("count"),
            func.sum(Detection.credits_earned).label("credits")
        ).group_by(Detection.waste_type).all()

        total_collected = db.query(func.count(Detection.id)).scalar() or 0
        total_credits = db.query(func.sum(Detection.credits_earned)).scalar() or 0

        # Ensure all 8 categories appear even with 0 count
        db_map = {r.waste_type: {"count": r.count, "credits": r.credits or 0} for r in ratios}
        distribution = []
        for cls in SUPPORTED_WASTE_CLASSES:
            entry = db_map.get(cls, {"count": 0, "credits": 0})
            distribution.append({
                "category": cls,
                "count": entry["count"],
                "credits": entry["credits"]
            })

        return {
            "total_items": total_collected,
            "total_credits": total_credits,
            "distribution": distribution
        }
