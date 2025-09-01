"""
Audit Service for logging administrative actions
"""

from typing import Optional, Dict, Any, Union
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import Request
import json
from datetime import datetime

from app.models.audit_log import AuditLog
from app.models.user import AdminUser


class AuditService:
    """Service for creating and managing audit logs"""
    
    @staticmethod
    async def log_user_action(
        db: AsyncSession,
        action: str,
        resource_type: str,
        resource_id: Optional[int],
        performed_by: int,
        performed_by_email: str,
        old_values: Optional[Dict[str, Any]] = None,
        new_values: Optional[Dict[str, Any]] = None,
        reason: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        endpoint: Optional[str] = None,
        request: Optional[Request] = None
    ) -> AuditLog:
        """
        Log a user management action
        
        Args:
            db: Database session
            action: Action performed (CREATE, UPDATE, DELETE, ACTIVATE, etc.)
            resource_type: Type of resource (USER, ROLE, etc.)
            resource_id: ID of the affected resource
            performed_by: ID of user performing the action
            performed_by_email: Email of user performing the action
            old_values: Previous state of the resource
            new_values: New state of the resource
            reason: Optional reason for the action
            ip_address: Client IP address
            user_agent: Client user agent
            endpoint: API endpoint used
            request: FastAPI request object (will extract IP/user-agent if provided)
        """
        
        # Extract request information if request object provided
        if request:
            ip_address = ip_address or request.client.host if request.client else None
            user_agent = user_agent or request.headers.get("user-agent")
            endpoint = endpoint or f"{request.method} {request.url.path}"
        
        # Sanitize sensitive data from values
        sanitized_old = AuditService._sanitize_values(old_values) if old_values else None
        sanitized_new = AuditService._sanitize_values(new_values) if new_values else None
        
        audit_log = AuditLog(
            action=action.upper(),
            resource_type=resource_type.upper(),
            resource_id=resource_id,
            performed_by=performed_by,
            performed_by_email=performed_by_email,
            old_values=sanitized_old,
            new_values=sanitized_new,
            reason=reason,
            ip_address=ip_address,
            user_agent=user_agent,
            endpoint=endpoint,
            timestamp=datetime.utcnow()
        )
        
        db.add(audit_log)
        await db.commit()
        await db.refresh(audit_log)
        
        return audit_log
    
    @staticmethod
    def _sanitize_values(values: Dict[str, Any]) -> Dict[str, Any]:
        """
        Remove sensitive information from audit log values
        """
        if not isinstance(values, dict):
            return values
            
        sanitized = {}
        sensitive_fields = {
            'password', 'password_hash', 'hashed_password',
            'token', 'access_token', 'refresh_token',
            'secret', 'api_key', 'private_key'
        }
        
        for key, value in values.items():
            if key.lower() in sensitive_fields:
                sanitized[key] = "***REDACTED***"
            elif isinstance(value, dict):
                sanitized[key] = AuditService._sanitize_values(value)
            else:
                sanitized[key] = value
                
        return sanitized
    
    @staticmethod
    async def log_user_creation(
        db: AsyncSession,
        new_user: AdminUser,
        created_by: AdminUser,
        request: Optional[Request] = None
    ):
        """Log user creation"""
        await AuditService.log_user_action(
            db=db,
            action="CREATE",
            resource_type="USER",
            resource_id=new_user.id,
            performed_by=created_by.id,
            performed_by_email=created_by.email,
            new_values={
                "email": new_user.email,
                "first_name": new_user.first_name,
                "last_name": new_user.last_name,
                "role": new_user.role,
                "department": new_user.department,
                "job_title": new_user.job_title,
                "is_active": new_user.is_active
            },
            request=request
        )
    
    @staticmethod
    async def log_user_update(
        db: AsyncSession,
        old_user_data: Dict[str, Any],
        updated_user: AdminUser,
        updated_by: AdminUser,
        request: Optional[Request] = None
    ):
        """Log user update"""
        new_values = {
            "email": updated_user.email,
            "first_name": updated_user.first_name,
            "last_name": updated_user.last_name,
            "role": updated_user.role,
            "department": updated_user.department,
            "job_title": updated_user.job_title,
            "is_active": updated_user.is_active
        }
        
        await AuditService.log_user_action(
            db=db,
            action="UPDATE",
            resource_type="USER",
            resource_id=updated_user.id,
            performed_by=updated_by.id,
            performed_by_email=updated_by.email,
            old_values=old_user_data,
            new_values=new_values,
            request=request
        )
    
    @staticmethod
    async def log_user_deletion(
        db: AsyncSession,
        deleted_user: AdminUser,
        deleted_by: AdminUser,
        reason: Optional[str] = None,
        request: Optional[Request] = None
    ):
        """Log user deletion"""
        await AuditService.log_user_action(
            db=db,
            action="DELETE",
            resource_type="USER",
            resource_id=deleted_user.id,
            performed_by=deleted_by.id,
            performed_by_email=deleted_by.email,
            old_values={
                "email": deleted_user.email,
                "first_name": deleted_user.first_name,
                "last_name": deleted_user.last_name,
                "role": deleted_user.role
            },
            reason=reason,
            request=request
        )
    
    @staticmethod
    async def log_password_reset(
        db: AsyncSession,
        target_user: AdminUser,
        reset_by: AdminUser,
        send_notification: bool = False,
        request: Optional[Request] = None
    ):
        """Log password reset"""
        await AuditService.log_user_action(
            db=db,
            action="PASSWORD_RESET",
            resource_type="USER",
            resource_id=target_user.id,
            performed_by=reset_by.id,
            performed_by_email=reset_by.email,
            new_values={
                "email": target_user.email,
                "notification_sent": send_notification
            },
            reason="Administrative password reset",
            request=request
        )
    
    @staticmethod
    async def log_role_change(
        db: AsyncSession,
        target_user: AdminUser,
        old_role: str,
        new_role: str,
        changed_by: AdminUser,
        request: Optional[Request] = None
    ):
        """Log role change"""
        await AuditService.log_user_action(
            db=db,
            action="ROLE_CHANGE",
            resource_type="USER",
            resource_id=target_user.id,
            performed_by=changed_by.id,
            performed_by_email=changed_by.email,
            old_values={"role": old_role},
            new_values={"role": new_role},
            reason=f"Role changed from {old_role} to {new_role}",
            request=request
        )


# Create global audit service instance
audit_service = AuditService()