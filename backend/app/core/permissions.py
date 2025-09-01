from enum import Enum
from typing import List


class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    EDITOR = "editor" 
    VIEWER = "viewer"


class Permission(str, Enum):
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"
    USER_MANAGEMENT = "user_management"
    SYSTEM_SETTINGS = "system_settings"
    AUDIT_LOGS = "audit_logs"


# Role-based permission mapping
ROLE_PERMISSIONS = {
    UserRole.SUPER_ADMIN: [
        Permission.READ, Permission.WRITE, Permission.DELETE, 
        Permission.ADMIN, Permission.SUPER_ADMIN, Permission.USER_MANAGEMENT,
        Permission.SYSTEM_SETTINGS, Permission.AUDIT_LOGS
    ],
    UserRole.ADMIN: [
        Permission.READ, Permission.WRITE, Permission.DELETE, Permission.ADMIN
    ],
    UserRole.EDITOR: [Permission.READ, Permission.WRITE],
    UserRole.VIEWER: [Permission.READ],
}


def has_permission(user_role: UserRole, required_permission: Permission) -> bool:
    """Check if user role has required permission"""
    user_permissions = ROLE_PERMISSIONS.get(user_role, [])
    return required_permission in user_permissions


def get_permissions(user_role: UserRole) -> List[Permission]:
    """Get all permissions for a user role"""
    return ROLE_PERMISSIONS.get(user_role, [])


def can_manage_users(user_role: UserRole) -> bool:
    """Check if user role can manage other users"""
    return has_permission(user_role, Permission.USER_MANAGEMENT)


def can_manage_role(current_role: UserRole, target_role: UserRole) -> bool:
    """Check if current role can manage target role"""
    # Super admin can manage everyone
    if current_role == UserRole.SUPER_ADMIN:
        return True
    
    # Admin can manage editors and viewers, but not other admins or super admins
    if current_role == UserRole.ADMIN:
        return target_role in [UserRole.EDITOR, UserRole.VIEWER]
    
    # Editors and viewers cannot manage other users
    return False


def is_higher_role(role1: UserRole, role2: UserRole) -> bool:
    """Check if role1 is higher than role2 in hierarchy"""
    role_hierarchy = {
        UserRole.SUPER_ADMIN: 4,
        UserRole.ADMIN: 3,
        UserRole.EDITOR: 2,
        UserRole.VIEWER: 1
    }
    return role_hierarchy.get(role1, 0) > role_hierarchy.get(role2, 0)