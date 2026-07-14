from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.auth import UserLogin, Token, ForgotPasswordRequest, ResetPasswordRequest
from app.schemas.user import UserCreate, UserOut, UserUpdate, ChangePasswordRequest
from app.services.auth_service import AuthService
from app.core.dependencies import get_current_user
from app.core.constants import UserRole
from app.models.user import User
from app.core.security import verify_password, get_password_hash

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/student/register", response_model=UserOut, status_code=201)
def student_register(user_in: UserCreate, db: Session = Depends(get_db)):
    return AuthService.register_student(db, user_in)

@router.post("/student/login", response_model=Token)
def student_login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = AuthService.authenticate_user(db, credentials.email, credentials.password, required_role=UserRole.STUDENT.value)
    return AuthService.generate_tokens(user.id)

@router.post("/admin/login", response_model=Token)
def admin_login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = AuthService.authenticate_user(db, credentials.email, credentials.password, required_role=UserRole.ADMIN.value)
    return AuthService.generate_tokens(user.id)

@router.post("/token/refresh")
def refresh_token(body: dict, db: Session = Depends(get_db)):
    refresh_token = body.get("refresh_token", "")
    new_access_token = AuthService.refresh_access_token(db, refresh_token)
    return {"access_token": new_access_token, "token_type": "bearer"}

@router.post("/forgot-password", status_code=200)
def forgot_password(body: ForgotPasswordRequest, db: Session = Depends(get_db)):
    AuthService.process_forgot_password(db, body.email)
    return {"message": "If that email exists, a reset link has been sent."}

@router.post("/reset-password", status_code=200)
def reset_password(body: ResetPasswordRequest, db: Session = Depends(get_db)):
    AuthService.process_reset_password(db, body.token, body.new_password)
    return {"message": "Password successfully updated."}

@router.get("/me", response_model=UserOut)
def get_me(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from app.core.constants import UserRole
    # Compute live rank: count of students with more credits + 1
    rank = db.query(User)\
        .filter(User.role == UserRole.STUDENT.value)\
        .filter(User.eco_credits > current_user.eco_credits)\
        .count() + 1
    # Attach rank as a transient attribute (not persisted)
    current_user.__dict__["rank"] = rank if current_user.role == UserRole.STUDENT.value else None
    return current_user

@router.put("/me", response_model=UserOut)
def update_me(
    body: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if body.name is not None:
        current_user.name = body.name
    if body.email is not None:
        current_user.email = body.email
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/change-password", status_code=200)
def change_password(
    body: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not verify_password(body.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect."
        )
    current_user.hashed_password = get_password_hash(body.new_password)
    db.commit()
    return {"message": "Password changed successfully."}
