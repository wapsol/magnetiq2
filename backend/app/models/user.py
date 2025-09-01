from sqlalchemy import Column, Integer, String, DateTime, Boolean, Text
from sqlalchemy.sql import func
from app.database import Base
from app.core.permissions import UserRole


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    
    # Profile Information
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    avatar_url = Column(String(500))
    timezone = Column(String(50), default='UTC')
    language = Column(String(10), default='en')
    
    # Role & Permissions
    role = Column(String(20), nullable=False, default=UserRole.VIEWER)
    
    # Status & Activity
    is_active = Column(Boolean, nullable=False, default=True)
    last_login = Column(DateTime(timezone=True))
    failed_login_attempts = Column(Integer, default=0)
    locked_until = Column(DateTime(timezone=True))
    last_password_change = Column(DateTime(timezone=True))
    
    # Enhanced Profile Information
    phone_number = Column(String(20))
    department = Column(String(100))
    job_title = Column(String(100))
    notes = Column(Text)
    
    # Password Reset
    reset_token = Column(String(255))
    reset_token_expires = Column(DateTime(timezone=True))
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    deleted_at = Column(DateTime(timezone=True))
    
    # Audit Information
    created_by = Column(Integer)  # AdminUser ID who created this user
    updated_by = Column(Integer)  # AdminUser ID who last updated this user
    last_login_ip = Column(String(45))
    last_login_user_agent = Column(Text)

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    @property
    def is_super_admin(self) -> bool:
        return self.role == UserRole.SUPER_ADMIN

    @property
    def is_admin(self) -> bool:
        return self.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN]

    @property
    def is_editor(self) -> bool:
        return self.role in [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.EDITOR]
    
    @property
    def can_manage_users(self) -> bool:
        from app.core.permissions import can_manage_users
        return can_manage_users(UserRole(self.role))
    
    @property
    def is_locked(self) -> bool:
        from datetime import datetime
        return self.locked_until and self.locked_until > datetime.utcnow()


class UserSession(Base):
    __tablename__ = "user_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False, index=True)
    session_token = Column(String(500), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    user_agent = Column(Text)
    ip_address = Column(String(45))
    created_at = Column(DateTime(timezone=True), server_default=func.now())