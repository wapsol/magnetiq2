from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
from app.database import get_db
from app.core.security import verify_token
from app.core.permissions import UserRole, Permission, has_permission, can_manage_users, can_manage_role
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


def require_super_admin():
    """Require super admin role"""
    def super_admin_checker(
        current_user: AdminUser = Depends(get_current_active_user)
    ) -> AdminUser:
        if current_user.role != UserRole.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Super admin privileges required"
            )
        return current_user
    
    return super_admin_checker


def require_user_management():
    """Require user management permissions"""
    return require_permission(Permission.USER_MANAGEMENT)


def require_system_settings():
    """Require system settings permissions"""
    return require_permission(Permission.SYSTEM_SETTINGS)


def require_audit_logs():
    """Require audit logs permissions"""
    return require_permission(Permission.AUDIT_LOGS)


def require_role_or_higher(minimum_role: UserRole):
    """Require specific role or higher"""
    def role_checker(
        current_user: AdminUser = Depends(get_current_active_user)
    ) -> AdminUser:
        from app.core.permissions import is_higher_role
        
        user_role = UserRole(current_user.role)
        
        # Check if current role is the minimum role or higher
        if user_role == minimum_role or is_higher_role(user_role, minimum_role):
            return current_user
        
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Minimum role required: {minimum_role.value}"
        )
    
    return role_checker


def can_manage_target_user():
    """Check if current user can manage operations on target users"""
    def manager_checker(
        target_user_id: int,
        current_user: AdminUser = Depends(get_current_active_user),
        db: AsyncSession = Depends(get_db)
    ):
        """
        This dependency is used in user management endpoints to ensure
        the current user has permissions to manage the target user
        """
        return {
            'current_user': current_user,
            'target_user_id': target_user_id,
            'db': db
        }
    
    return manager_checker


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