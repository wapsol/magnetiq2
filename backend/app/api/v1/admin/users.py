"""
Admin User Management API Endpoints

Provides comprehensive CRUD operations for managing admin users,
role assignments, and user administration.
"""

from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.user import AdminUser
from app.schemas.auth import (
    UserCreateRequest, UserUpdateRequest, UserResponse, UserDetailResponse,
    UserListResponse, UserSearchQuery, UserStatsResponse, UserActivityResponse,
    UserPasswordResetRequest, UserBulkActionRequest
)
from app.services.user_management_service import user_management_service
from app.dependencies import (
    get_current_active_user, require_user_management, require_super_admin,
    require_role_or_higher
)
from app.core.permissions import UserRole

router = APIRouter(prefix="/users", tags=["Admin User Management"])


@router.get("", response_model=UserListResponse)
async def list_users(
    q: Optional[str] = Query(None, description="Search query for name or email"),
    role: Optional[UserRole] = Query(None, description="Filter by role"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    department: Optional[str] = Query(None, description="Filter by department"),
    page: int = Query(1, ge=1, description="Page number"),
    size: int = Query(20, ge=1, le=100, description="Page size"),
    sort_by: str = Query("created_at", pattern=r"^(created_at|last_login|first_name|last_name|email|role)$"),
    sort_desc: bool = Query(True, description="Sort in descending order"),
    current_user: AdminUser = Depends(require_user_management()),
    db: AsyncSession = Depends(get_db)
):
    """
    List all admin users with search, filtering, and pagination
    
    Requires user management permissions.
    """
    query = UserSearchQuery(
        q=q,
        role=role,
        is_active=is_active,
        department=department,
        page=page,
        size=size,
        sort_by=sort_by,
        sort_desc=sort_desc
    )
    
    return await user_management_service.list_users(
        db=db,
        query=query,
        current_user_role=UserRole(current_user.role)
    )


@router.get("/stats", response_model=UserStatsResponse)
async def get_user_stats(
    current_user: AdminUser = Depends(require_user_management()),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user statistics and metrics
    
    Requires user management permissions.
    """
    return await user_management_service.get_user_stats(db)


@router.get("/{user_id}", response_model=UserDetailResponse)
async def get_user(
    user_id: int,
    current_user: AdminUser = Depends(require_user_management()),
    db: AsyncSession = Depends(get_db)
):
    """
    Get detailed information about a specific user
    
    Requires user management permissions.
    """
    return await user_management_service.get_user_details(
        db=db,
        user_id=user_id,
        current_user_role=UserRole(current_user.role)
    )


@router.post("", response_model=UserDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreateRequest,
    current_user: AdminUser = Depends(require_user_management()),
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new admin user
    
    Requires user management permissions.
    Role creation restrictions:
    - Super admins can create any role
    - Admins can create editors and viewers only
    """
    new_user = await user_management_service.create_user(
        db=db,
        user_data=user_data,
        created_by_id=current_user.id,
        current_user_role=UserRole(current_user.role)
    )
    
    return await user_management_service.get_user_details(
        db=db,
        user_id=new_user.id,
        current_user_role=UserRole(current_user.role)
    )


@router.put("/{user_id}", response_model=UserDetailResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdateRequest,
    current_user: AdminUser = Depends(require_user_management()),
    db: AsyncSession = Depends(get_db)
):
    """
    Update an existing user
    
    Requires user management permissions.
    Role modification restrictions:
    - Super admins can modify any user
    - Admins can modify editors and viewers only
    - Users cannot modify users with higher or equal roles
    """
    updated_user = await user_management_service.update_user(
        db=db,
        user_id=user_id,
        user_data=user_data,
        updated_by_id=current_user.id,
        current_user_role=UserRole(current_user.role)
    )
    
    return await user_management_service.get_user_details(
        db=db,
        user_id=updated_user.id,
        current_user_role=UserRole(current_user.role)
    )


@router.post("/{user_id}/deactivate", response_model=UserDetailResponse)
async def deactivate_user(
    user_id: int,
    current_user: AdminUser = Depends(require_user_management()),
    db: AsyncSession = Depends(get_db)
):
    """
    Deactivate a user account
    
    Requires user management permissions.
    """
    updated_user = await user_management_service.deactivate_user(
        db=db,
        user_id=user_id,
        updated_by_id=current_user.id,
        current_user_role=UserRole(current_user.role)
    )
    
    return await user_management_service.get_user_details(
        db=db,
        user_id=updated_user.id,
        current_user_role=UserRole(current_user.role)
    )


@router.post("/{user_id}/activate", response_model=UserDetailResponse)
async def activate_user(
    user_id: int,
    current_user: AdminUser = Depends(require_user_management()),
    db: AsyncSession = Depends(get_db)
):
    """
    Activate a user account
    
    Requires user management permissions.
    """
    # Get the user first
    user = await user_management_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Use the update method to activate
    from app.schemas.auth import UserUpdateRequest
    user_data = UserUpdateRequest(is_active=True)
    
    updated_user = await user_management_service.update_user(
        db=db,
        user_id=user_id,
        user_data=user_data,
        updated_by_id=current_user.id,
        current_user_role=UserRole(current_user.role)
    )
    
    return await user_management_service.get_user_details(
        db=db,
        user_id=updated_user.id,
        current_user_role=UserRole(current_user.role)
    )


@router.delete("/{user_id}", response_model=dict)
async def delete_user(
    user_id: int,
    current_user: AdminUser = Depends(require_user_management()),
    db: AsyncSession = Depends(get_db)
):
    """
    Soft delete a user account
    
    Requires user management permissions.
    Super admin deletion requires super admin privileges.
    """
    await user_management_service.soft_delete_user(
        db=db,
        user_id=user_id,
        updated_by_id=current_user.id,
        current_user_role=UserRole(current_user.role)
    )
    
    return {
        "message": "User successfully deleted",
        "user_id": user_id,
        "deleted_by": current_user.id
    }


@router.post("/{user_id}/reset-password", response_model=dict)
async def reset_user_password(
    user_id: int,
    request: UserPasswordResetRequest,
    current_user: AdminUser = Depends(require_user_management()),
    db: AsyncSession = Depends(get_db)
):
    """
    Reset user password and optionally send notification
    
    Requires user management permissions.
    """
    new_password = await user_management_service.reset_user_password(
        db=db,
        user_id=user_id,
        updated_by_id=current_user.id,
        current_user_role=UserRole(current_user.role),
        send_notification=request.send_notification
    )
    
    return {
        "message": "Password reset successfully",
        "user_id": user_id,
        "new_password": new_password if not request.send_notification else None,
        "notification_sent": request.send_notification
    }


@router.post("/bulk-action", response_model=dict)
async def bulk_user_action(
    request: UserBulkActionRequest,
    current_user: AdminUser = Depends(require_user_management()),
    db: AsyncSession = Depends(get_db)
):
    """
    Perform bulk actions on multiple users
    
    Requires user management permissions.
    Supported actions: activate, deactivate, delete
    """
    result = await user_management_service.bulk_update_users(
        db=db,
        user_ids=request.user_ids,
        action=request.action,
        updated_by_id=current_user.id,
        current_user_role=UserRole(current_user.role),
        reason=request.reason
    )
    
    return {
        "message": f"Bulk {request.action} completed",
        **result
    }


# Super Admin only endpoints

@router.post("/promote-to-super-admin/{user_id}", response_model=UserDetailResponse)
async def promote_to_super_admin(
    user_id: int,
    current_user: AdminUser = Depends(require_super_admin()),
    db: AsyncSession = Depends(get_db)
):
    """
    Promote user to super admin role
    
    Requires super admin privileges.
    """
    from app.schemas.auth import UserUpdateRequest
    user_data = UserUpdateRequest(role=UserRole.SUPER_ADMIN)
    
    updated_user = await user_management_service.update_user(
        db=db,
        user_id=user_id,
        user_data=user_data,
        updated_by_id=current_user.id,
        current_user_role=UserRole.SUPER_ADMIN
    )
    
    return await user_management_service.get_user_details(
        db=db,
        user_id=updated_user.id,
        current_user_role=UserRole.SUPER_ADMIN
    )


@router.get("/activity/recent", response_model=List[UserActivityResponse])
async def get_recent_user_activity(
    days: int = Query(7, ge=1, le=30, description="Number of days to look back"),
    current_user: AdminUser = Depends(require_user_management()),
    db: AsyncSession = Depends(get_db)
):
    """
    Get recent user activity
    
    Requires user management permissions.
    """
    from datetime import datetime, timedelta
    from sqlalchemy import and_, or_, text, select, func
    
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    # Get users with recent activity
    activity_query = select(
        AdminUser.id,
        AdminUser.email,
        AdminUser.first_name,
        AdminUser.last_name,
        AdminUser.last_login,
        AdminUser.failed_login_attempts,
        AdminUser.locked_until,
        AdminUser.created_at
    ).where(
        and_(
            AdminUser.deleted_at.is_(None),
            or_(
                AdminUser.last_login >= cutoff_date,
                AdminUser.created_at >= cutoff_date
            )
        )
    ).order_by(AdminUser.last_login.desc().nullslast())
    
    result = await db.execute(activity_query)
    users = result.fetchall()
    
    activity_list = []
    for user in users:
        activity_list.append(UserActivityResponse(
            user_id=user.id,
            email=user.email,
            full_name=f"{user.first_name} {user.last_name}",
            last_login=user.last_login,
            login_count=1 if user.last_login else 0,  # Simplified for now
            failed_attempts=user.failed_login_attempts,
            is_locked=user.locked_until and user.locked_until > datetime.utcnow(),
            created_at=user.created_at
        ))
    
    return activity_list


# Health check endpoint for user management
@router.get("/health", response_model=dict)
async def user_management_health():
    """User management service health check"""
    return {
        "service": "user-management",
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "features": [
            "user_creation",
            "user_modification", 
            "role_management",
            "bulk_operations",
            "password_reset",
            "activity_tracking"
        ]
    }