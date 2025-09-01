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
from datetime import datetime


async def check_and_reset_admin():
    """Check admin user and reset if needed"""
    async with AsyncSessionLocal() as session:
        # Check if admin user exists
        result = await session.execute(
            select(AdminUser).where(AdminUser.email == "admin@voltaic.systems")
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print(f"Admin user found:")
            print(f"ID: {existing_user.id}")
            print(f"Email: {existing_user.email}")
            print(f"Role: {existing_user.role}")
            print(f"Is Active: {existing_user.is_active}")
            print(f"Email Verified: {existing_user.email_verified}")
            print(f"Created: {existing_user.created_at}")
            
            # Test password verification
            password_valid = verify_password("Admin123!", existing_user.hashed_password)
            print(f"Password verification test: {'PASS' if password_valid else 'FAIL'}")
            
            if not password_valid:
                print("\nResetting password...")
                existing_user.hashed_password = get_password_hash("Admin123!")
                existing_user.updated_at = datetime.utcnow()
                await session.commit()
                print("Password reset complete!")
            
            return
        
        print("Admin user not found. Creating new one...")
        
        # Create new admin user
        admin_user = AdminUser(
            email="admin@voltaic.systems",
            hashed_password=get_password_hash("Admin123!"),
            first_name="Admin",
            last_name="User",
            role="super_admin",
            is_active=True,
            email_verified=True,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        session.add(admin_user)
        await session.commit()
        
        print("New admin user created!")


if __name__ == "__main__":
    asyncio.run(check_and_reset_admin())