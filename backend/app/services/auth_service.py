import logging
from datetime import timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Optional, Tuple
from app.models.user import User
from app.schemas.user import UserCreate
from app.schemas.auth import Token
from app.repositories.user_repository import UserRepository
from app.core import security
from app.core.config import settings
from app.core.constants import UserRole

logger = logging.getLogger(__name__)

class AuthService:
    @staticmethod
    def register_student(db: Session, user_in: UserCreate) -> User:
        # Check if user already exists
        existing_user = UserRepository.get_by_email(db, user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email already exists"
            )

        hashed_password = security.get_password_hash(user_in.password)
        new_user = User(
            name=user_in.name,
            email=user_in.email,
            hashed_password=hashed_password,
            role=UserRole.STUDENT.value,
            is_active=True,
            eco_credits=0,
            carbon_saved=0.0,
            total_sessions=0,
            register_number=user_in.register_number,
            department=user_in.department,
            year=user_in.year
        )
        return UserRepository.create(db, new_user)

    @staticmethod
    def authenticate_user(
        db: Session, 
        email: str, 
        password: str, 
        required_role: Optional[str] = None
    ) -> User:
        user = UserRepository.get_by_email(db, email)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        if not security.verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Your account has been suspended by system administrator"
            )

        if required_role and user.role != required_role:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to access this route"
            )

        return user

    @staticmethod
    def generate_tokens(user_id: int) -> Token:
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_token_expires = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        access_token = security.create_access_token(user_id, expires_delta=access_token_expires)
        refresh_token = security.create_refresh_token(user_id, expires_delta=refresh_token_expires)
        
        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer"
        )

    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str) -> str:
        payload = security.decode_token(refresh_token)
        user_id = payload.get("sub")
        token_type = payload.get("type")

        if not user_id or token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        user = UserRepository.get_by_id(db, int(user_id))
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive or deleted"
            )

        # Generate new short-lived access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return security.create_access_token(user.id, expires_delta=access_token_expires)

    @staticmethod
    def process_forgot_password(db: Session, email: str) -> None:
        user = UserRepository.get_by_email(db, email)
        if not user:
            # Avoid leaking user emails, return silently
            return

        # Generate password reset token valid for 15 minutes
        expires = timedelta(minutes=15)
        reset_token = security.create_access_token(f"reset:{user.id}", expires_delta=expires)

        reset_link = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"

        # Try to send real email via SMTP
        try:
            import smtplib
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart

            smtp_host = settings.SMTP_HOST
            smtp_port = settings.SMTP_PORT
            smtp_user = settings.SMTP_USER
            smtp_pass = settings.SMTP_PASSWORD

            if smtp_user and smtp_pass:
                msg = MIMEMultipart("alternative")
                msg["Subject"] = "ReWorth AI – Password Reset Request"
                msg["From"] = smtp_user
                msg["To"] = email

                html_body = f"""
                <html><body style="font-family:sans-serif;background:#0d1117;color:#e6edf3;padding:32px;">
                  <div style="max-width:480px;margin:auto;background:#161b22;border-radius:12px;padding:32px;border:1px solid #30363d;">
                    <h2 style="color:#3fb950;margin-bottom:8px;">🌿 ReWorth AI</h2>
                    <p>Hello <strong>{user.name}</strong>,</p>
                    <p>We received a request to reset your password. Click the button below to set a new password. This link expires in <strong>15 minutes</strong>.</p>
                    <a href="{reset_link}" style="display:inline-block;margin:24px 0;padding:12px 28px;background:linear-gradient(90deg,#3fb950,#a8f387);color:#0d1117;font-weight:bold;border-radius:8px;text-decoration:none;">
                      Reset My Password
                    </a>
                    <p style="font-size:12px;color:#8b949e;">If you did not request a password reset, ignore this email. Your account remains secure.</p>
                    <hr style="border-color:#30363d;margin:24px 0;">
                    <p style="font-size:11px;color:#8b949e;">ReWorth AI · Campus Smart Recycling Platform</p>
                  </div>
                </body></html>
                """

                msg.attach(MIMEText(html_body, "html"))

                with smtplib.SMTP(smtp_host, smtp_port) as server:
                    server.ehlo()
                    server.starttls()
                    server.login(smtp_user, smtp_pass)
                    server.sendmail(smtp_user, email, msg.as_string())

                logger.info(f"Password reset email sent to: {email}")
                return
        except Exception as e:
            logger.error(f"SMTP send failed ({e}), logging token to console.")

        # Console fallback for local testing
        logger.info(f"PASSWORD RESET REQUEST FOR: {email} | RESET LINK: {reset_link}")


    @staticmethod
    def process_reset_password(db: Session, token: str, new_password: str) -> None:
        payload = security.decode_token(token)
        subject = payload.get("sub", "")
        
        if not subject.startswith("reset:"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired password reset token"
            )

        user_id = int(subject.split(":")[1])
        user = UserRepository.get_by_id(db, user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found or inactive"
            )

        user.hashed_password = security.get_password_hash(new_password)
        UserRepository.update(db, user)
