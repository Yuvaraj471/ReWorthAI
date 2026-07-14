from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database.session import get_db
from app.schemas.reward import RewardOut, RewardCreate, RewardUpdate
from app.schemas.redemption import RedemptionOut, RedemptionCreate
from app.services.reward_service import RewardService
from app.services.redemption_service import RedemptionService
from app.core.dependencies import get_current_student, get_current_admin
from app.models.user import User
from datetime import datetime

router = APIRouter(prefix="/rewards", tags=["Rewards"])

@router.get("/", response_model=List[RewardOut])
def list_rewards(db: Session = Depends(get_db)):
    """Public: List all available rewards in the store."""
    return RewardService.get_catalog(db)

@router.get("/{reward_id}", response_model=RewardOut)
def get_reward(reward_id: int, db: Session = Depends(get_db)):
    return RewardService.get_reward(db, reward_id)

# --- Student Redemption ---
@router.post("/redeem", response_model=RedemptionOut)
def redeem_reward(
    body: RedemptionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student)
):
    """Student redeems a reward using their EcoCredits."""
    redemption = RedemptionService.redeem_reward(db, current_user.id, body.reward_id)
    return RedemptionOut(
        id=redemption.id,
        user_id=redemption.user_id,
        student_name=current_user.name,
        student_email=current_user.email,
        reward_id=redemption.reward_id,
        voucher_title=redemption.reward.title if redemption.reward else None,
        category=redemption.reward.category if redemption.reward else None,
        cost=redemption.reward.cost if redemption.reward else None,
        code=redemption.code,
        status=redemption.status,
        created_at=redemption.created_at
    )

@router.get("/my/vouchers", response_model=List[RedemptionOut])
def get_my_vouchers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student)
):
    """Student views their own redemption history."""
    redemptions = RedemptionService.get_student_redemptions(db, current_user.id)
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

# --- Admin CRUD for Rewards Catalog ---
@router.post("/admin/create", response_model=RewardOut, status_code=201)
def admin_create_reward(
    reward_in: RewardCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    return RewardService.create_reward(db, reward_in)

@router.put("/admin/{reward_id}", response_model=RewardOut)
def admin_update_reward(
    reward_id: int,
    reward_in: RewardUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    return RewardService.update_reward(db, reward_id, reward_in)

@router.delete("/admin/{reward_id}", status_code=204)
def admin_delete_reward(
    reward_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin)
):
    RewardService.delete_reward(db, reward_id)
