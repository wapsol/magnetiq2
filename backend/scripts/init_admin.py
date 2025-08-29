#!/usr/bin/env python3
"""
Script to create a default admin user for Magnetiq v2
"""
import asyncio
import sys
import os
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

# Add the app directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.models.user import AdminUser
from app.core.security import get_password_hash
from app.core.permissions import UserRole
from app.config import settings


async def create_default_admin():
    """Create default admin user"""
    print("Creating default admin user...")
    
    # Default credentials
    email = "admin@magnetiq.local"
    password = "admin123"
    first_name = "System"
    last_name = "Administrator"
    
    # Create database connection
    engine = create_async_engine(settings.database_url)
    SessionLocal = sessionmaker(engine, class_=AsyncSession, autocommit=False, autoflush=False)
    
    async with SessionLocal() as session:
        try:
            # Check if user already exists
            result = await session.execute(
                select(AdminUser).where(AdminUser.email == email)
            )
            existing_user = result.scalar_one_or_none()
            
            if existing_user:
                print(f"Admin user already exists: {email}")
                return
            
            # Create new admin user
            hashed_password = get_password_hash(password)
            new_user = AdminUser(
                email=email,
                hashed_password=hashed_password,
                first_name=first_name,
                last_name=last_name,
                role=UserRole.ADMIN,
                is_active=True
            )
            
            session.add(new_user)
            await session.commit()
            await session.refresh(new_user)
            
            print(f"\nDefault admin user created successfully!")
            print(f"Email: {email}")
            print(f"Password: {password}")
            print(f"Name: {new_user.full_name}")
            print(f"Role: {new_user.role}")
            print("\n⚠️  Remember to change the password after first login!")
            
        except Exception as e:
            await session.rollback()
            print(f"Error creating user: {e}")
        finally:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_default_admin())