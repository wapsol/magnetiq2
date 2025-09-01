from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from app.core.permissions import UserRole


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: UserRole = UserRole.VIEWER


class UserUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None


class UserResponse(BaseModel):
    id: int
    email: str
    first_name: str
    last_name: str
    full_name: str
    role: str
    is_active: bool
    last_login: Optional[datetime] = None
    created_at: datetime
    timezone: Optional[str] = None
    language: Optional[str] = None
    phone_number: Optional[str] = None
    department: Optional[str] = None
    job_title: Optional[str] = None

    class Config:
        from_attributes = True


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str


# ===== User Management Schemas =====

class UserCreateRequest(BaseModel):
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    role: UserRole = UserRole.VIEWER
    password: Optional[str] = Field(None, min_length=8, max_length=128)
    timezone: Optional[str] = Field("UTC", max_length=50)
    language: Optional[str] = Field("en", pattern=r"^(en|de)$")
    phone_number: Optional[str] = Field(None, max_length=20)
    department: Optional[str] = Field(None, max_length=100)
    job_title: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = Field(None, max_length=1000)
    send_invitation: bool = Field(True, description="Send email invitation to user")

    @validator('email')
    def validate_email_domain(cls, v):
        # Add corporate domain validation if needed
        allowed_domains = ['voltaic.systems', 'voltaic.de']  # Configure as needed
        domain = v.split('@')[1].lower()
        # For now, allow all domains - uncomment below for stricter validation
        # if domain not in allowed_domains:
        #     raise ValueError(f'Email domain {domain} not allowed')
        return v


class UserUpdateRequest(BaseModel):
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    timezone: Optional[str] = Field(None, max_length=50)
    language: Optional[str] = Field(None, pattern=r"^(en|de)$")
    phone_number: Optional[str] = Field(None, max_length=20)
    department: Optional[str] = Field(None, max_length=100)
    job_title: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = Field(None, max_length=1000)


class UserDetailResponse(UserResponse):
    """Extended user response with additional details"""
    failed_login_attempts: int
    locked_until: Optional[datetime] = None
    last_password_change: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    last_login_ip: Optional[str] = None
    created_by: Optional[int] = None
    updated_by: Optional[int] = None
    notes: Optional[str] = None
    is_locked: bool = False
    can_manage_users: bool = False
    permissions: List[str] = []


class UserListResponse(BaseModel):
    users: List[UserResponse]
    total: int
    page: int
    size: int
    total_pages: int


class UserSearchQuery(BaseModel):
    q: Optional[str] = Field(None, description="Search query for name or email")
    role: Optional[UserRole] = Field(None, description="Filter by role")
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    department: Optional[str] = Field(None, description="Filter by department")
    page: int = Field(1, ge=1, description="Page number")
    size: int = Field(20, ge=1, le=100, description="Page size")
    sort_by: Optional[str] = Field("created_at", pattern=r"^(created_at|last_login|first_name|last_name|email|role)$")
    sort_desc: bool = Field(True, description="Sort in descending order")


class UserPasswordResetRequest(BaseModel):
    user_id: int
    send_notification: bool = Field(True, description="Send email notification to user")


class UserBulkActionRequest(BaseModel):
    user_ids: List[int] = Field(..., min_items=1, max_items=50)
    action: str = Field(..., pattern=r"^(activate|deactivate|delete)$")
    reason: Optional[str] = Field(None, max_length=500, description="Reason for bulk action")


class UserStatsResponse(BaseModel):
    total_users: int
    active_users: int
    inactive_users: int
    locked_users: int
    users_by_role: dict
    recent_logins: int  # Last 7 days
    never_logged_in: int


class UserActivityResponse(BaseModel):
    user_id: int
    email: str
    full_name: str
    last_login: Optional[datetime]
    login_count: int
    failed_attempts: int
    is_locked: bool
    created_at: datetime