from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.session import get_db
from app.schemas.user import UserOut
from app.schemas.credit import CreditOut, CreditUpdate
from app.schemas.redemption import RedemptionOut
from app.services.admin_service import AdminService
from app.services.credit_service import CreditService
from app.services.redemption_service import RedemptionService
from app.core.dependencies import get_current_admin
from app.models.user import User
from app.repositories.detection_repository import DetectionRepository

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/stats")
def get_platform_stats(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    raw = AdminService.get_platform_stats(db)
    waste_totals = DetectionRepository.get_waste_type_totals(db)
    return {
        "total_students": raw.get("total_students", 0),
        "total_items": raw.get("total_items_collected", 0),
        "total_credits_distributed": raw.get("total_credits_awarded", 0),
        "pending_vouchers": raw.get("pending_vouchers", 0),
        "carbon_saved_kg": sum(
            (u.get("carbon_saved") or 0) for u in raw.get("top_students", [])
        ),
        "top_students": raw.get("top_students", []),
        "waste_totals": waste_totals,
    }

@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    from app.repositories.detection_repository import DetectionRepository
    return DetectionRepository.get_analytics_summary(db)

@router.get("/students", response_model=List[UserOut])
def list_students(
    search: Optional[str] = Query(None),
    skip: int = Query(0),
    limit: int = Query(100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    return AdminService.get_students(db, search=search, skip=skip, limit=limit)

@router.patch("/students/{user_id}/block", response_model=UserOut)
def block_student(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    return AdminService.block_student(db, user_id)

@router.patch("/students/{user_id}/unblock", response_model=UserOut)
def unblock_student(
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    return AdminService.unblock_student(db, user_id)

@router.get("/credits", response_model=List[CreditOut])
def get_credits_config(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    return CreditService.get_credits_config(db)

@router.put("/credits")
def update_credits_config(
    credits_map: dict,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    return CreditService.update_credits_config(db, credits_map)

@router.get("/vouchers", response_model=List[RedemptionOut])
def list_vouchers(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    redemptions = RedemptionService.get_all_redemptions(db, status=status)
    result = []
    for r in redemptions:
        result.append(RedemptionOut(
            id=r.id,
            user_id=r.user_id,
            student_name=r.user.name if r.user else None,
            student_email=r.user.email if r.user else None,
            reward_id=r.reward_id,
            voucher_title=r.reward.title if r.reward else None,
            category=r.reward.category if r.reward else None,
            cost=r.reward.cost if r.reward else None,
            code=r.code,
            status=r.status,
            created_at=r.created_at
        ))
    return result

@router.patch("/vouchers/{redemption_id}/approve", response_model=RedemptionOut)
def approve_voucher(
    redemption_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    updated = RedemptionService.update_status(db, redemption_id, "APPROVED")
    return RedemptionOut(
        id=updated.id,
        user_id=updated.user_id,
        reward_id=updated.reward_id,
        code=updated.code,
        status=updated.status,
        created_at=updated.created_at
    )

@router.patch("/vouchers/{redemption_id}/redeem", response_model=RedemptionOut)
def mark_redeemed(
    redemption_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    updated = RedemptionService.update_status(db, redemption_id, "REDEEMED")
    return RedemptionOut(
        id=updated.id,
        user_id=updated.user_id,
        reward_id=updated.reward_id,
        code=updated.code,
        status=updated.status,
        created_at=updated.created_at
    )
