from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.session import SessionOut
from app.services.session_service import SessionService
from app.core.dependencies import get_current_student
from app.models.user import User

router = APIRouter(prefix="/sessions", tags=["Sessions"])

@router.post("/start", response_model=SessionOut)
def start_session(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student)
):
    session = SessionService.start_session(db, current_user.id)
    status_info = SessionService.get_session_status(db, current_user.id)
    return SessionOut(
        active=True,
        remaining_time=status_info.get("remaining_time", 60),
        session_code=session.session_code,
        status=session.status
    )

@router.get("/status", response_model=SessionOut)
def get_session_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student)
):
    status_info = SessionService.get_session_status(db, current_user.id)
    return SessionOut(**status_info)

@router.post("/end", response_model=SessionOut)
def end_session(
    status: str = "COMPLETED",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_student)
):
    session = SessionService.end_session(db, current_user.id, status)
    return SessionOut(
        active=False,
        remaining_time=0,
        session_code=session.session_code,
        status=session.status
    )
