from enum import Enum
from typing import List


class UserRole(str, Enum):
    ADMIN = "admin"
    EDITOR = "editor" 
    VIEWER = "viewer"


class Permission(str, Enum):
    READ = "read"
    WRITE = "write"
    DELETE = "delete"
    ADMIN = "admin"


# Role-based permission mapping
ROLE_PERMISSIONS = {
    UserRole.ADMIN: [Permission.READ, Permission.WRITE, Permission.DELETE, Permission.ADMIN],
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