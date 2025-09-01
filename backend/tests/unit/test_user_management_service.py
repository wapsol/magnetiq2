"""
Unit tests for UserManagementService

Tests the core business logic of user management operations without 
involving the database or HTTP layer.
"""

import pytest
from unittest.mock import Mock, AsyncMock, patch
from datetime import datetime, timedelta

from app.services.user_management_service import user_management_service
from app.models.user import AdminUser
from app.schemas.auth import UserCreateRequest, UserUpdateRequest, UserSearchQuery
from app.core.permissions import UserRole
from fastapi import HTTPException


class TestUserManagementService:
    """Test user management service operations"""

    def test_can_manage_role_permissions(self):
        """Test role management permission logic"""
        from app.core.permissions import can_manage_role
        
        # Super admin can manage all roles
        assert can_manage_role(UserRole.SUPER_ADMIN, UserRole.SUPER_ADMIN)
        assert can_manage_role(UserRole.SUPER_ADMIN, UserRole.ADMIN)
        assert can_manage_role(UserRole.SUPER_ADMIN, UserRole.EDITOR)
        assert can_manage_role(UserRole.SUPER_ADMIN, UserRole.VIEWER)
        
        # Admin can manage editor and viewer only
        assert not can_manage_role(UserRole.ADMIN, UserRole.SUPER_ADMIN)
        assert not can_manage_role(UserRole.ADMIN, UserRole.ADMIN)
        assert can_manage_role(UserRole.ADMIN, UserRole.EDITOR)
        assert can_manage_role(UserRole.ADMIN, UserRole.VIEWER)
        
        # Editor cannot manage any users
        assert not can_manage_role(UserRole.EDITOR, UserRole.SUPER_ADMIN)
        assert not can_manage_role(UserRole.EDITOR, UserRole.ADMIN)
        assert not can_manage_role(UserRole.EDITOR, UserRole.EDITOR)
        assert not can_manage_role(UserRole.EDITOR, UserRole.VIEWER)

    @pytest.mark.asyncio
    async def test_create_user_validation(self):
        """Test user creation validation logic"""
        mock_db = AsyncMock()
        
        # Test role permission validation
        user_data = UserCreateRequest(
            email="test@example.com",
            first_name="Test",
            last_name="User",
            role=UserRole.SUPER_ADMIN
        )
        
        # Admin trying to create super admin should fail
        with pytest.raises(HTTPException) as exc_info:
            await user_management_service.create_user(
                db=mock_db,
                user_data=user_data,
                created_by_id=1,
                current_user_role=UserRole.ADMIN
            )
        assert exc_info.value.status_code == 403

    @pytest.mark.asyncio
    async def test_create_user_email_conflict(self):
        """Test email uniqueness validation"""
        mock_db = AsyncMock()
        
        # Mock existing user with same email
        existing_user = AdminUser(
            id=1,
            email="test@example.com",
            first_name="Existing",
            last_name="User"
        )
        
        with patch.object(user_management_service, 'get_user_by_email', return_value=existing_user):
            user_data = UserCreateRequest(
                email="test@example.com",
                first_name="Test",
                last_name="User",
                role=UserRole.VIEWER
            )
            
            with pytest.raises(HTTPException) as exc_info:
                await user_management_service.create_user(
                    db=mock_db,
                    user_data=user_data,
                    created_by_id=1,
                    current_user_role=UserRole.ADMIN
                )
            assert exc_info.value.status_code == 409

    def test_search_query_validation(self):
        """Test user search query validation"""
        # Valid search query
        query = UserSearchQuery(
            q="test",
            role=UserRole.ADMIN,
            is_active=True,
            page=1,
            size=20,
            sort_by="created_at",
            sort_desc=True
        )
        
        assert query.q == "test"
        assert query.role == UserRole.ADMIN
        assert query.is_active is True
        assert query.page == 1
        assert query.size == 20
        
        # Test pagination limits
        query = UserSearchQuery(page=0, size=200)
        assert query.page == 1  # Should be corrected to minimum
        assert query.size == 100  # Should be capped at maximum

    def test_user_role_hierarchy(self):
        """Test role hierarchy validation"""
        from app.core.permissions import is_higher_role
        
        # Test role hierarchy
        assert is_higher_role(UserRole.SUPER_ADMIN, UserRole.ADMIN)
        assert is_higher_role(UserRole.ADMIN, UserRole.EDITOR)
        assert is_higher_role(UserRole.EDITOR, UserRole.VIEWER)
        
        # Test same role
        assert not is_higher_role(UserRole.ADMIN, UserRole.ADMIN)
        
        # Test reverse hierarchy
        assert not is_higher_role(UserRole.VIEWER, UserRole.ADMIN)

    @pytest.mark.asyncio 
    async def test_password_generation(self):
        """Test password generation for new users"""
        from app.core.security import generate_password, verify_password, get_password_hash
        
        # Test password generation
        password = generate_password()
        assert len(password) >= 12
        assert any(c.isupper() for c in password)
        assert any(c.islower() for c in password)
        assert any(c.isdigit() for c in password)
        
        # Test password hashing and verification
        hashed = get_password_hash(password)
        assert verify_password(password, hashed)
        assert not verify_password("wrongpassword", hashed)

    def test_audit_data_sanitization(self):
        """Test sensitive data sanitization in audit logs"""
        from app.services.audit_service import AuditService
        
        # Test data with sensitive fields
        test_data = {
            "email": "user@example.com",
            "password": "secretpassword123",
            "hashed_password": "$2b$12$hash...",
            "api_key": "secret_api_key",
            "first_name": "John"
        }
        
        sanitized = AuditService._sanitize_values(test_data)
        
        assert sanitized["email"] == "user@example.com"
        assert sanitized["password"] == "***REDACTED***"
        assert sanitized["hashed_password"] == "***REDACTED***" 
        assert sanitized["api_key"] == "***REDACTED***"
        assert sanitized["first_name"] == "John"

    def test_user_model_properties(self):
        """Test AdminUser model computed properties"""
        user = AdminUser(
            email="test@example.com",
            first_name="John",
            last_name="Doe",
            role=UserRole.ADMIN,
            is_active=True,
            failed_login_attempts=0,
            locked_until=None
        )
        
        assert user.full_name == "John Doe"
        assert user.is_locked is False
        assert user.can_login is True
        
        # Test locked user
        user.locked_until = datetime.utcnow() + timedelta(hours=1)
        assert user.is_locked is True
        assert user.can_login is False

    @pytest.mark.asyncio
    async def test_bulk_operations_validation(self):
        """Test bulk operations validation"""
        mock_db = AsyncMock()
        
        # Test empty user list
        with pytest.raises(HTTPException) as exc_info:
            await user_management_service.bulk_update_users(
                db=mock_db,
                user_ids=[],
                action="activate",
                updated_by_id=1,
                current_user_role=UserRole.ADMIN
            )
        assert exc_info.value.status_code == 400
        
        # Test invalid action
        with pytest.raises(HTTPException) as exc_info:
            await user_management_service.bulk_update_users(
                db=mock_db,
                user_ids=[1, 2, 3],
                action="invalid_action",
                updated_by_id=1,
                current_user_role=UserRole.ADMIN
            )
        assert exc_info.value.status_code == 400

    def test_permission_system(self):
        """Test the permission system comprehensively"""
        from app.core.permissions import has_permission, Permission
        
        # Test super admin permissions
        assert has_permission(UserRole.SUPER_ADMIN, Permission.USER_MANAGEMENT)
        assert has_permission(UserRole.SUPER_ADMIN, Permission.SYSTEM_SETTINGS)
        assert has_permission(UserRole.SUPER_ADMIN, Permission.AUDIT_LOGS)
        assert has_permission(UserRole.SUPER_ADMIN, Permission.DELETE)
        
        # Test admin permissions
        assert has_permission(UserRole.ADMIN, Permission.USER_MANAGEMENT)
        assert has_permission(UserRole.ADMIN, Permission.WRITE)
        assert has_permission(UserRole.ADMIN, Permission.READ)
        assert not has_permission(UserRole.ADMIN, Permission.SYSTEM_SETTINGS)
        
        # Test editor permissions  
        assert not has_permission(UserRole.EDITOR, Permission.USER_MANAGEMENT)
        assert has_permission(UserRole.EDITOR, Permission.WRITE)
        assert has_permission(UserRole.EDITOR, Permission.READ)
        
        # Test viewer permissions
        assert not has_permission(UserRole.VIEWER, Permission.USER_MANAGEMENT)
        assert not has_permission(UserRole.VIEWER, Permission.WRITE)
        assert has_permission(UserRole.VIEWER, Permission.READ)