"""
API Integration tests for Admin User Management endpoints

Tests the complete API functionality including authentication, authorization,
request validation, and response formatting.
"""

import pytest
from httpx import AsyncClient

from app.models.user import AdminUser
from app.core.permissions import UserRole


class TestAdminUsersAPI:
    """Test admin users API endpoints"""

    @pytest.mark.api
    @pytest.mark.admin
    async def test_list_users_unauthorized(self, client: AsyncClient):
        """Test that listing users requires authentication"""
        response = await client.get("/admin/users")
        assert response.status_code == 401
        assert response.json()["detail"] == "Not authenticated"

    @pytest.mark.api
    @pytest.mark.admin 
    async def test_list_users_forbidden_for_viewer(self, client: AsyncClient, auth_headers_viewer: dict):
        """Test that viewers cannot access user management"""
        response = await client.get("/admin/users", headers=auth_headers_viewer)
        assert response.status_code == 403
        assert response.json()["detail"] == "Insufficient permissions"

    @pytest.mark.api
    @pytest.mark.admin
    async def test_list_users_success(self, client: AsyncClient, auth_headers_admin: dict):
        """Test successful user listing with admin permissions"""
        response = await client.get("/admin/users", headers=auth_headers_admin)
        assert response.status_code == 200
        
        data = response.json()
        assert "users" in data
        assert "total" in data
        assert "page" in data
        assert "size" in data
        assert "total_pages" in data
        assert isinstance(data["users"], list)

    @pytest.mark.api
    @pytest.mark.admin
    async def test_list_users_pagination(self, client: AsyncClient, auth_headers_admin: dict):
        """Test user listing pagination"""
        response = await client.get(
            "/admin/users?page=1&size=10&sort_by=created_at&sort_desc=true",
            headers=auth_headers_admin
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["page"] == 1
        assert data["size"] == 10

    @pytest.mark.api
    @pytest.mark.admin
    async def test_list_users_search(self, client: AsyncClient, auth_headers_admin: dict):
        """Test user listing with search query"""
        response = await client.get(
            "/admin/users?q=test&role=admin&is_active=true",
            headers=auth_headers_admin
        )
        assert response.status_code == 200

    @pytest.mark.api
    @pytest.mark.admin
    async def test_create_user_success(self, client: AsyncClient, auth_headers_admin: dict, user_factory):
        """Test successful user creation"""
        user_data = user_factory.create_user_data(
            email="newuser@example.com",
            first_name="New",
            last_name="User",
            role="editor"
        )
        
        response = await client.post(
            "/admin/users",
            json=user_data,
            headers=auth_headers_admin
        )
        assert response.status_code == 201
        
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["first_name"] == "New"
        assert data["last_name"] == "User"
        assert data["role"] == "editor"
        assert data["is_active"] is True

    @pytest.mark.api
    @pytest.mark.admin
    async def test_create_user_duplicate_email(self, client: AsyncClient, auth_headers_admin: dict, user_factory, admin_user: AdminUser):
        """Test user creation with duplicate email"""
        user_data = user_factory.create_user_data(
            email=admin_user.email,  # Use existing email
            first_name="Duplicate",
            last_name="User"
        )
        
        response = await client.post(
            "/admin/users",
            json=user_data,
            headers=auth_headers_admin
        )
        assert response.status_code == 409

    @pytest.mark.api
    @pytest.mark.admin
    async def test_create_user_invalid_role_permission(self, client: AsyncClient, auth_headers_admin: dict, user_factory):
        """Test that admin cannot create super admin"""
        user_data = user_factory.create_user_data(
            email="superadmin@example.com",
            role="super_admin"  # Admin trying to create super admin
        )
        
        response = await client.post(
            "/admin/users",
            json=user_data,
            headers=auth_headers_admin
        )
        assert response.status_code == 403

    @pytest.mark.api
    @pytest.mark.admin
    async def test_create_user_validation_errors(self, client: AsyncClient, auth_headers_admin: dict):
        """Test user creation validation errors"""
        # Missing required fields
        response = await client.post(
            "/admin/users",
            json={},
            headers=auth_headers_admin
        )
        assert response.status_code == 422
        
        # Invalid email format
        response = await client.post(
            "/admin/users",
            json={
                "email": "invalid-email",
                "first_name": "Test",
                "last_name": "User"
            },
            headers=auth_headers_admin
        )
        assert response.status_code == 422

    @pytest.mark.api
    @pytest.mark.admin
    async def test_get_user_success(self, client: AsyncClient, auth_headers_admin: dict, editor_user: AdminUser):
        """Test getting user details"""
        response = await client.get(
            f"/admin/users/{editor_user.id}",
            headers=auth_headers_admin
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["id"] == editor_user.id
        assert data["email"] == editor_user.email
        assert data["role"] == editor_user.role

    @pytest.mark.api
    @pytest.mark.admin
    async def test_get_user_not_found(self, client: AsyncClient, auth_headers_admin: dict):
        """Test getting non-existent user"""
        response = await client.get(
            "/admin/users/99999",
            headers=auth_headers_admin
        )
        assert response.status_code == 404

    @pytest.mark.api
    @pytest.mark.admin
    async def test_update_user_success(self, client: AsyncClient, auth_headers_admin: dict, editor_user: AdminUser):
        """Test successful user update"""
        update_data = {
            "first_name": "Updated",
            "last_name": "Name",
            "department": "Engineering"
        }
        
        response = await client.put(
            f"/admin/users/{editor_user.id}",
            json=update_data,
            headers=auth_headers_admin
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["first_name"] == "Updated"
        assert data["last_name"] == "Name"
        assert data["department"] == "Engineering"

    @pytest.mark.api
    @pytest.mark.admin
    async def test_deactivate_user_success(self, client: AsyncClient, auth_headers_admin: dict, editor_user: AdminUser):
        """Test user deactivation"""
        response = await client.post(
            f"/admin/users/{editor_user.id}/deactivate",
            headers=auth_headers_admin
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["is_active"] is False

    @pytest.mark.api
    @pytest.mark.admin
    async def test_activate_user_success(self, client: AsyncClient, auth_headers_admin: dict, editor_user: AdminUser):
        """Test user activation"""
        # First deactivate
        await client.post(f"/admin/users/{editor_user.id}/deactivate", headers=auth_headers_admin)
        
        # Then activate
        response = await client.post(
            f"/admin/users/{editor_user.id}/activate",
            headers=auth_headers_admin
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["is_active"] is True

    @pytest.mark.api
    @pytest.mark.admin
    async def test_delete_user_success(self, client: AsyncClient, auth_headers_admin: dict, editor_user: AdminUser):
        """Test user soft deletion"""
        response = await client.delete(
            f"/admin/users/{editor_user.id}",
            headers=auth_headers_admin
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["message"] == "User successfully deleted"
        assert data["user_id"] == editor_user.id

    @pytest.mark.api
    @pytest.mark.admin
    async def test_reset_password_success(self, client: AsyncClient, auth_headers_admin: dict, editor_user: AdminUser):
        """Test password reset"""
        response = await client.post(
            f"/admin/users/{editor_user.id}/reset-password",
            json={"send_notification": False},
            headers=auth_headers_admin
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["message"] == "Password reset successfully"
        assert data["user_id"] == editor_user.id
        assert "new_password" in data

    @pytest.mark.api
    @pytest.mark.admin
    async def test_bulk_action_success(self, client: AsyncClient, auth_headers_admin: dict, test_session):
        """Test bulk user actions"""
        # Create multiple test users
        user_ids = []
        for i in range(3):
            user_data = {
                "email": f"bulk{i}@example.com",
                "first_name": f"Bulk{i}",
                "last_name": "User",
                "role": "viewer"
            }
            response = await client.post("/admin/users", json=user_data, headers=auth_headers_admin)
            user_ids.append(response.json()["id"])
        
        # Test bulk deactivation
        response = await client.post(
            "/admin/users/bulk-action",
            json={
                "user_ids": user_ids,
                "action": "deactivate",
                "reason": "Bulk test deactivation"
            },
            headers=auth_headers_admin
        )
        assert response.status_code == 200
        
        data = response.json()
        assert "Bulk deactivate completed" in data["message"]

    @pytest.mark.api
    @pytest.mark.admin
    async def test_user_stats(self, client: AsyncClient, auth_headers_admin: dict):
        """Test user statistics endpoint"""
        response = await client.get("/admin/users/stats", headers=auth_headers_admin)
        assert response.status_code == 200
        
        data = response.json()
        assert "total_users" in data
        assert "active_users" in data
        assert "users_by_role" in data
        assert "recent_logins" in data

    @pytest.mark.api
    @pytest.mark.admin
    async def test_recent_activity(self, client: AsyncClient, auth_headers_admin: dict):
        """Test recent user activity endpoint"""
        response = await client.get(
            "/admin/users/activity/recent?days=7",
            headers=auth_headers_admin
        )
        assert response.status_code == 200
        
        data = response.json()
        assert isinstance(data, list)


class TestSuperAdminOnlyEndpoints:
    """Test endpoints that require super admin privileges"""

    @pytest.mark.api
    @pytest.mark.admin
    async def test_promote_to_super_admin_forbidden_for_admin(self, client: AsyncClient, auth_headers_admin: dict, editor_user: AdminUser):
        """Test that regular admin cannot promote to super admin"""
        response = await client.post(
            f"/admin/users/promote-to-super-admin/{editor_user.id}",
            headers=auth_headers_admin
        )
        assert response.status_code == 403

    @pytest.mark.api
    @pytest.mark.admin
    async def test_promote_to_super_admin_success(self, client: AsyncClient, auth_headers_super_admin: dict, editor_user: AdminUser):
        """Test successful promotion to super admin"""
        response = await client.post(
            f"/admin/users/promote-to-super-admin/{editor_user.id}",
            headers=auth_headers_super_admin
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["role"] == "super_admin"


class TestHealthEndpoint:
    """Test user management health check"""

    async def test_health_check(self, client: AsyncClient):
        """Test user management health endpoint"""
        response = await client.get("/admin/users/health")
        assert response.status_code == 200
        
        data = response.json()
        assert data["service"] == "user-management"
        assert data["status"] == "healthy"
        assert "features" in data