#!/usr/bin/env python3
"""
Script to create an admin user for Magnetiq v2
"""
import asyncio
import sys
import os
from getpass import getpass
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

# Add the app directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.models.user import AdminUser
from app.core.security import get_password_hash
from app.core.permissions import UserRole
from app.config import settings


async def create_admin_user():
    """Create an admin user"""
    print("Magnetiq v2 - Create Admin User")
    print("=" * 40)
    
    # Get user input
    email = input("Email: ").strip()
    if not email:
        print("Email is required")
        return
    
    first_name = input("First Name: ").strip()
    if not first_name:
        print("First name is required")
        return
    
    last_name = input("Last Name: ").strip()
    if not last_name:
        print("Last name is required")
        return
    
    password = getpass("Password: ")
    if not password:
        print("Password is required")
        return
    
    confirm_password = getpass("Confirm Password: ")
    if password != confirm_password:
        print("Passwords do not match")
        return
    
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
                print(f"User with email {email} already exists")
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
            
            print(f"\nAdmin user created successfully!")
            print(f"ID: {new_user.id}")
            print(f"Email: {new_user.email}")
            print(f"Name: {new_user.full_name}")
            print(f"Role: {new_user.role}")
            
        except Exception as e:
            await session.rollback()
            print(f"Error creating user: {e}")
        finally:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(create_admin_user())