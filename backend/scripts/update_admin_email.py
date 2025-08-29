#!/usr/bin/env python3
"""
Update admin email to use a valid domain
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
from app.config import settings


async def update_admin_email():
    """Update admin email"""
    print("Updating admin email...")
    
    old_email = "admin@magnetiq.local"
    new_email = "admin@voltaic.systems"
    
    # Create database connection
    engine = create_async_engine(settings.database_url)
    SessionLocal = sessionmaker(engine, class_=AsyncSession, autocommit=False, autoflush=False)
    
    async with SessionLocal() as session:
        try:
            # Find admin user
            result = await session.execute(
                select(AdminUser).where(AdminUser.email == old_email)
            )
            admin_user = result.scalar_one_or_none()
            
            if not admin_user:
                print(f"Admin user not found: {old_email}")
                return
            
            # Update email
            admin_user.email = new_email
            
            await session.commit()
            
            print(f"Admin email updated to: {new_email}")
            
        except Exception as e:
            await session.rollback()
            print(f"Error updating email: {e}")
        finally:
            await engine.dispose()


if __name__ == "__main__":
    asyncio.run(update_admin_email())