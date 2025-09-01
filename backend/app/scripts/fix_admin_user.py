#!/usr/bin/env python3
"""
Script to check and reset admin user
"""
import asyncio
import sys
from pathlib import Path

# Add project root to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from sqlalchemy import select, delete
from app.database import AsyncSessionLocal
from app.models.user import AdminUser
from app.core.security import get_password_hash, verify_password
from app.core.permissions import UserRole
from datetime import datetime


async def fix_admin_user():
    """Check admin user and reset if needed"""
    async with AsyncSessionLocal() as session:
        # Delete existing admin user if any
        await session.execute(
            delete(AdminUser).where(AdminUser.email == "admin@voltaic.systems")
        )
        
        # Create fresh admin user
        admin_user = AdminUser(
            email="admin@voltaic.systems",
            hashed_password=get_password_hash("Admin123!"),
            first_name="Admin",
            last_name="User",
            role=UserRole.ADMIN,  # Use proper enum
            is_active=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        session.add(admin_user)
        await session.commit()
        
        print("Admin user created successfully!")
        print("\nLogin credentials:")
        print("URL: http://localhost:8037/admin")
        print("Email: admin@voltaic.systems")
        print("Password: Admin123!")
        
        # Verify the password works
        fresh_result = await session.execute(
            select(AdminUser).where(AdminUser.email == "admin@voltaic.systems")
        )
        fresh_user = fresh_result.scalar_one()
        
        password_valid = verify_password("Admin123!", fresh_user.hashed_password)
        print(f"\nPassword verification: {'✅ PASS' if password_valid else '❌ FAIL'}")
        print(f"User role: {fresh_user.role}")
        print(f"User active: {fresh_user.is_active}")


if __name__ == "__main__":
    asyncio.run(fix_admin_user())