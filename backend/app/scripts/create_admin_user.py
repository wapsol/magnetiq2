#!/usr/bin/env python3
"""
Script to create a default admin user for development/testing
"""
import asyncio
import sys
from pathlib import Path

# Add project root to path
sys.path.append(str(Path(__file__).parent.parent.parent))

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.user import AdminUser
from app.core.security import get_password_hash
from datetime import datetime


async def create_admin_user():
    """Create a default admin user if it doesn't exist"""
    async with AsyncSessionLocal() as session:
        # Check if admin user already exists
        result = await session.execute(
            select(AdminUser).where(AdminUser.email == "admin@voltaic.systems")
        )
        existing_user = result.scalar_one_or_none()
        
        if existing_user:
            print("Admin user already exists!")
            print("\nLogin credentials:")
            print("URL: http://localhost:3000/admin")
            print("Email: admin@voltaic.systems")
            print("Password: Admin123!")
            return
        
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
        
        print("Admin user created successfully!")
        print("\nLogin credentials:")
        print("URL: http://localhost:3000/admin")
        print("Email: admin@voltaic.systems")
        print("Password: Admin123!")
        print("\nIMPORTANT: Please change the password after first login!")


if __name__ == "__main__":
    asyncio.run(create_admin_user())