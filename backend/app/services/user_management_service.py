"""
User Management Service

Handles CRUD operations for admin users, role management, and user administration.
"""

from typing import List, Optional, Tuple, Dict, Any
from datetime import datetime, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func, text
from sqlalchemy.orm import selectinload

from app.models.user import AdminUser
from app.schemas.auth import (
    UserCreateRequest, UserUpdateRequest, UserResponse, UserDetailResponse,
    UserListResponse, UserSearchQuery, UserStatsResponse, UserActivityResponse
)
from app.core.permissions import UserRole, can_manage_role, get_permissions
from app.core.security import get_password_hash
from app.services.email_service import email_service
from app.services.audit_service import audit_service
from fastapi import HTTPException, status, Request


class UserManagementService:
    """Service for managing admin users"""
    
    def __init__(self):
        self.password_service = None
        
    async def create_user(
        self,
        db: AsyncSession,
        user_data: UserCreateRequest,
        created_by_id: int,
        current_user_role: UserRole
    ) -> AdminUser:
        """Create a new admin user"""
        
        # Check if current user can manage the target role
        if not can_manage_role(current_user_role, user_data.role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient permissions to create user with role {user_data.role}"
            )
        
        # Check if email already exists
        existing_user = await self.get_user_by_email(db, user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User with this email already exists"
            )
        
        # Generate password if not provided
        password = user_data.password
        if not password:
            import secrets
            password = secrets.token_urlsafe(12)  # Generate temporary password
        
        # Create new user
        new_user = AdminUser(
            email=user_data.email,
            hashed_password=get_password_hash(password),
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            role=user_data.role,
            timezone=user_data.timezone or "UTC",
            language=user_data.language or "en",
            phone_number=user_data.phone_number,
            department=user_data.department,
            job_title=user_data.job_title,
            notes=user_data.notes,
            created_by=created_by_id,
            is_active=True
        )
        
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        
        # Send invitation email if requested
        if user_data.send_invitation:
            await self._send_user_invitation(new_user, password)
        
        return new_user
    
    async def get_user_by_id(
        self,
        db: AsyncSession,
        user_id: int,
        include_details: bool = False
    ) -> Optional[AdminUser]:
        """Get user by ID"""
        query = select(AdminUser).where(
            AdminUser.id == user_id,
            AdminUser.deleted_at.is_(None)
        )
        
        result = await db.execute(query)
        return result.scalar_one_or_none()
    
    async def get_user_by_email(
        self,
        db: AsyncSession,
        email: str
    ) -> Optional[AdminUser]:
        """Get user by email"""
        query = select(AdminUser).where(
            AdminUser.email == email,
            AdminUser.deleted_at.is_(None)
        )
        
        result = await db.execute(query)
        return result.scalar_one_or_none()
    
    async def update_user(
        self,
        db: AsyncSession,
        user_id: int,
        user_data: UserUpdateRequest,
        updated_by_id: int,
        current_user_role: UserRole
    ) -> AdminUser:
        """Update an existing user"""
        
        # Get the user to update
        user = await self.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check permissions for role changes
        if user_data.role and user_data.role != user.role:
            current_user_role_enum = UserRole(current_user_role)
            target_role = UserRole(user.role)
            new_role = UserRole(user_data.role)
            
            if not can_manage_role(current_user_role_enum, target_role):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Insufficient permissions to modify this user"
                )
            
            if not can_manage_role(current_user_role_enum, new_role):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient permissions to assign role {new_role}"
                )
        
        # Check email uniqueness if email is being changed
        if user_data.email and user_data.email != user.email:
            existing_user = await self.get_user_by_email(db, user_data.email)
            if existing_user and existing_user.id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already in use by another user"
                )
        
        # Update user fields
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(user, field, value)
        
        user.updated_by = updated_by_id
        
        await db.commit()
        await db.refresh(user)
        
        return user
    
    async def deactivate_user(
        self,
        db: AsyncSession,
        user_id: int,
        updated_by_id: int,
        current_user_role: UserRole
    ) -> AdminUser:
        """Deactivate a user"""
        
        user = await self.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check permissions
        target_role = UserRole(user.role)
        if not can_manage_role(current_user_role, target_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to deactivate this user"
            )
        
        user.is_active = False
        user.updated_by = updated_by_id
        
        await db.commit()
        await db.refresh(user)
        
        return user
    
    async def soft_delete_user(
        self,
        db: AsyncSession,
        user_id: int,
        updated_by_id: int,
        current_user_role: UserRole
    ) -> AdminUser:
        """Soft delete a user (sets deleted_at timestamp)"""
        
        user = await self.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check permissions
        target_role = UserRole(user.role)
        if not can_manage_role(current_user_role, target_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to delete this user"
            )
        
        # Super admin deletion requires special permission
        if user.role == UserRole.SUPER_ADMIN and current_user_role != UserRole.SUPER_ADMIN:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only super admin can delete super admin users"
            )
        
        user.deleted_at = datetime.utcnow()
        user.is_active = False
        user.updated_by = updated_by_id
        
        await db.commit()
        await db.refresh(user)
        
        return user
    
    async def reset_user_password(
        self,
        db: AsyncSession,
        user_id: int,
        updated_by_id: int,
        current_user_role: UserRole,
        send_notification: bool = True
    ) -> str:
        """Reset user password and optionally send notification"""
        
        user = await self.get_user_by_id(db, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Check permissions
        target_role = UserRole(user.role)
        if not can_manage_role(current_user_role, target_role):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Insufficient permissions to reset password for this user"
            )
        
        # Generate new password
        import secrets
        new_password = secrets.token_urlsafe(12)
        
        # Update user
        user.hashed_password = get_password_hash(new_password)
        user.last_password_change = datetime.utcnow()
        user.failed_login_attempts = 0
        user.locked_until = None
        user.updated_by = updated_by_id
        
        await db.commit()
        
        # Send notification email
        if send_notification:
            await self._send_password_reset_notification(user, new_password)
        
        return new_password
    
    async def list_users(
        self,
        db: AsyncSession,
        query: UserSearchQuery,
        current_user_role: UserRole
    ) -> UserListResponse:
        """List users with search and pagination"""
        
        # Build base query
        base_query = select(AdminUser).where(AdminUser.deleted_at.is_(None))
        count_query = select(func.count(AdminUser.id)).where(AdminUser.deleted_at.is_(None))
        
        # Apply filters
        if query.q:
            search_filter = or_(
                AdminUser.first_name.ilike(f"%{query.q}%"),
                AdminUser.last_name.ilike(f"%{query.q}%"),
                AdminUser.email.ilike(f"%{query.q}%")
            )
            base_query = base_query.where(search_filter)
            count_query = count_query.where(search_filter)
        
        if query.role:
            base_query = base_query.where(AdminUser.role == query.role)
            count_query = count_query.where(AdminUser.role == query.role)
        
        if query.is_active is not None:
            base_query = base_query.where(AdminUser.is_active == query.is_active)
            count_query = count_query.where(AdminUser.is_active == query.is_active)
        
        if query.department:
            base_query = base_query.where(AdminUser.department.ilike(f"%{query.department}%"))
            count_query = count_query.where(AdminUser.department.ilike(f"%{query.department}%"))
        
        # Apply sorting
        sort_column = getattr(AdminUser, query.sort_by)
        if query.sort_desc:
            sort_column = sort_column.desc()
        base_query = base_query.order_by(sort_column)
        
        # Apply pagination
        offset = (query.page - 1) * query.size
        base_query = base_query.offset(offset).limit(query.size)
        
        # Execute queries
        users_result = await db.execute(base_query)
        users = users_result.scalars().all()
        
        count_result = await db.execute(count_query)
        total = count_result.scalar()
        
        # Convert to response objects
        user_responses = []
        for user in users:
            user_responses.append(UserResponse(
                id=user.id,
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                full_name=user.full_name,
                role=user.role,
                is_active=user.is_active,
                last_login=user.last_login,
                created_at=user.created_at,
                timezone=user.timezone,
                language=user.language,
                phone_number=user.phone_number,
                department=user.department,
                job_title=user.job_title
            ))
        
        return UserListResponse(
            users=user_responses,
            total=total,
            page=query.page,
            size=query.size,
            total_pages=(total + query.size - 1) // query.size
        )
    
    async def get_user_details(
        self,
        db: AsyncSession,
        user_id: int,
        current_user_role: UserRole
    ) -> UserDetailResponse:
        """Get detailed user information"""
        
        user = await self.get_user_by_id(db, user_id, include_details=True)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        # Get permissions for user
        permissions = [p.value for p in get_permissions(UserRole(user.role))]
        
        return UserDetailResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            full_name=user.full_name,
            role=user.role,
            is_active=user.is_active,
            last_login=user.last_login,
            created_at=user.created_at,
            timezone=user.timezone,
            language=user.language,
            phone_number=user.phone_number,
            department=user.department,
            job_title=user.job_title,
            failed_login_attempts=user.failed_login_attempts,
            locked_until=user.locked_until,
            last_password_change=user.last_password_change,
            updated_at=user.updated_at,
            last_login_ip=user.last_login_ip,
            created_by=user.created_by,
            updated_by=user.updated_by,
            notes=user.notes,
            is_locked=user.is_locked,
            can_manage_users=user.can_manage_users,
            permissions=permissions
        )
    
    async def get_user_stats(self, db: AsyncSession) -> UserStatsResponse:
        """Get user statistics"""
        
        # Get basic counts
        total_query = select(func.count(AdminUser.id)).where(AdminUser.deleted_at.is_(None))
        active_query = select(func.count(AdminUser.id)).where(
            and_(AdminUser.deleted_at.is_(None), AdminUser.is_active == True)
        )
        inactive_query = select(func.count(AdminUser.id)).where(
            and_(AdminUser.deleted_at.is_(None), AdminUser.is_active == False)
        )
        locked_query = select(func.count(AdminUser.id)).where(
            and_(
                AdminUser.deleted_at.is_(None),
                AdminUser.locked_until > datetime.utcnow()
            )
        )
        
        # Get recent logins (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_logins_query = select(func.count(AdminUser.id)).where(
            and_(
                AdminUser.deleted_at.is_(None),
                AdminUser.last_login >= seven_days_ago
            )
        )
        
        # Get never logged in users
        never_logged_query = select(func.count(AdminUser.id)).where(
            and_(
                AdminUser.deleted_at.is_(None),
                AdminUser.last_login.is_(None)
            )
        )
        
        # Get users by role
        role_stats_query = select(
            AdminUser.role,
            func.count(AdminUser.id).label('count')
        ).where(AdminUser.deleted_at.is_(None)).group_by(AdminUser.role)
        
        # Execute all queries
        total = (await db.execute(total_query)).scalar()
        active = (await db.execute(active_query)).scalar()
        inactive = (await db.execute(inactive_query)).scalar()
        locked = (await db.execute(locked_query)).scalar()
        recent_logins = (await db.execute(recent_logins_query)).scalar()
        never_logged_in = (await db.execute(never_logged_query)).scalar()
        
        role_stats_result = await db.execute(role_stats_query)
        users_by_role = {row.role: row.count for row in role_stats_result}
        
        return UserStatsResponse(
            total_users=total,
            active_users=active,
            inactive_users=inactive,
            locked_users=locked,
            users_by_role=users_by_role,
            recent_logins=recent_logins,
            never_logged_in=never_logged_in
        )
    
    async def bulk_update_users(
        self,
        db: AsyncSession,
        user_ids: List[int],
        action: str,
        updated_by_id: int,
        current_user_role: UserRole,
        reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """Perform bulk actions on multiple users"""
        
        # Get all users to be updated
        users_query = select(AdminUser).where(
            and_(
                AdminUser.id.in_(user_ids),
                AdminUser.deleted_at.is_(None)
            )
        )
        
        users_result = await db.execute(users_query)
        users = users_result.scalars().all()
        
        if not users:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="No users found with provided IDs"
            )
        
        # Check permissions for each user
        for user in users:
            target_role = UserRole(user.role)
            if not can_manage_role(current_user_role, target_role):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Insufficient permissions to {action} user {user.email}"
                )
        
        # Perform bulk action
        success_count = 0
        failed_users = []
        
        for user in users:
            try:
                if action == "activate":
                    user.is_active = True
                elif action == "deactivate":
                    user.is_active = False
                elif action == "delete":
                    user.deleted_at = datetime.utcnow()
                    user.is_active = False
                
                user.updated_by = updated_by_id
                success_count += 1
                
            except Exception as e:
                failed_users.append({
                    "user_id": user.id,
                    "email": user.email,
                    "error": str(e)
                })
        
        await db.commit()
        
        return {
            "success_count": success_count,
            "total_count": len(users),
            "failed_users": failed_users,
            "reason": reason
        }
    
    async def _send_user_invitation(self, user: AdminUser, password: str):
        """Send user invitation email"""
        try:
            subject = "Welcome to voltAIc Systems Admin Panel"
            body = f"""
            Welcome to the voltAIc Systems Admin Panel!
            
            Your account has been created with the following details:
            Email: {user.email}
            Temporary Password: {password}
            Role: {user.role}
            
            Please login at: http://localhost:8038/admin/login
            
            For security, please change your password after first login.
            
            Best regards,
            voltAIc Systems Team
            """
            
            # Note: This would use the actual email service
            print(f"Sending invitation email to {user.email}")
            
        except Exception as e:
            print(f"Failed to send invitation email to {user.email}: {e}")
    
    async def _send_password_reset_notification(self, user: AdminUser, new_password: str):
        """Send password reset notification email"""
        try:
            subject = "Password Reset - voltAIc Systems Admin Panel"
            body = f"""
            Your password has been reset by an administrator.
            
            New temporary password: {new_password}
            
            Please login and change your password immediately.
            
            Login at: http://localhost:8038/admin/login
            
            Best regards,
            voltAIc Systems Team
            """
            
            # Note: This would use the actual email service
            print(f"Sending password reset notification to {user.email}")
            
        except Exception as e:
            print(f"Failed to send password reset notification to {user.email}: {e}")


# Global service instance
user_management_service = UserManagementService()