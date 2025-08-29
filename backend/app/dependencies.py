from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.database import get_db
from app.core.security import verify_token
from app.core.permissions import UserRole, Permission, has_permission
from app.models.user import AdminUser

security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> AdminUser:
    """Get current authenticated user"""
    token = credentials.credentials
    
    try:
        payload = verify_token(token, "access")
        user_id = payload.get("sub")
        
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
            )
        
        # Get user from database
        result = await db.execute(
            select(AdminUser).where(
                AdminUser.id == int(user_id),
                AdminUser.is_active == True,
                AdminUser.deleted_at.is_(None)
            )
        )
        user = result.scalar_one_or_none()
        
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found",
            )
        
        return user
    
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
        )


async def get_current_active_user(
    current_user: AdminUser = Depends(get_current_user)
) -> AdminUser:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


def require_permission(required_permission: Permission):
    """Dependency factory for permission-based access control"""
    def permission_checker(
        current_user: AdminUser = Depends(get_current_active_user)
    ) -> AdminUser:
        user_role = UserRole(current_user.role)
        
        if not has_permission(user_role, required_permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions"
            )
        
        return current_user
    
    return permission_checker


def require_admin():
    """Require admin role"""
    return require_permission(Permission.ADMIN)


def require_editor():
    """Require editor or admin role"""
    return require_permission(Permission.WRITE)


def require_viewer():
    """Require viewer, editor or admin role"""
    return require_permission(Permission.READ)


class CommonQueryParams:
    """Common query parameters for list endpoints"""
    def __init__(
        self,
        page: int = 1,
        per_page: int = 20,
        search: Optional[str] = None,
        sort_by: Optional[str] = None,
        order: str = "desc"
    ):
        self.page = max(1, page)
        self.per_page = min(100, max(1, per_page))  # Limit to 100 items per page
        self.search = search
        self.sort_by = sort_by
        self.order = order.lower() if order.lower() in ["asc", "desc"] else "desc"
        self.offset = (self.page - 1) * self.per_page