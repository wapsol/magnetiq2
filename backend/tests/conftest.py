"""
Pytest configuration and fixtures for testing
"""

import asyncio
import pytest
import pytest_asyncio
from typing import AsyncGenerator, Generator
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.database import get_db, Base
from app.models.user import AdminUser
from app.core.security import get_password_hash
from app.core.permissions import UserRole


# Test database URL - in-memory SQLite for fast tests
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    """Create test database engine"""
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={
            "check_same_thread": False,
        },
        poolclass=StaticPool,
    )
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    yield engine
    
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def test_session(test_engine) -> AsyncGenerator[AsyncSession, None]:
    """Create test database session"""
    async_session = async_sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )
    
    async with async_session() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client(test_session: AsyncSession) -> AsyncGenerator[AsyncClient, None]:
    """Create test client with dependency override"""
    
    def override_get_db():
        yield test_session
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://testserver") as client:
        yield client
    
    app.dependency_overrides.clear()


# User fixtures
@pytest_asyncio.fixture
async def super_admin_user(test_session: AsyncSession) -> AdminUser:
    """Create a super admin user for testing"""
    user = AdminUser(
        email="superadmin@test.com",
        hashed_password=get_password_hash("testpass123"),
        first_name="Super",
        last_name="Admin",
        role=UserRole.SUPER_ADMIN,
        is_active=True
    )
    test_session.add(user)
    await test_session.commit()
    await test_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def admin_user(test_session: AsyncSession) -> AdminUser:
    """Create an admin user for testing"""
    user = AdminUser(
        email="admin@test.com",
        hashed_password=get_password_hash("testpass123"),
        first_name="Test",
        last_name="Admin",
        role=UserRole.ADMIN,
        is_active=True
    )
    test_session.add(user)
    await test_session.commit()
    await test_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def editor_user(test_session: AsyncSession) -> AdminUser:
    """Create an editor user for testing"""
    user = AdminUser(
        email="editor@test.com",
        hashed_password=get_password_hash("testpass123"),
        first_name="Test",
        last_name="Editor",
        role=UserRole.EDITOR,
        is_active=True
    )
    test_session.add(user)
    await test_session.commit()
    await test_session.refresh(user)
    return user


@pytest_asyncio.fixture
async def viewer_user(test_session: AsyncSession) -> AdminUser:
    """Create a viewer user for testing"""
    user = AdminUser(
        email="viewer@test.com",
        hashed_password=get_password_hash("testpass123"),
        first_name="Test",
        last_name="Viewer",
        role=UserRole.VIEWER,
        is_active=True
    )
    test_session.add(user)
    await test_session.commit()
    await test_session.refresh(user)
    return user


# Authentication fixtures
async def get_auth_token(client: AsyncClient, email: str, password: str) -> str:
    """Helper function to get JWT token for authentication"""
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password}
    )
    assert response.status_code == 200
    return response.json()["data"]["access_token"]


@pytest_asyncio.fixture
async def super_admin_token(client: AsyncClient, super_admin_user: AdminUser) -> str:
    """Get JWT token for super admin user"""
    return await get_auth_token(client, super_admin_user.email, "testpass123")


@pytest_asyncio.fixture
async def admin_token(client: AsyncClient, admin_user: AdminUser) -> str:
    """Get JWT token for admin user"""
    return await get_auth_token(client, admin_user.email, "testpass123")


@pytest_asyncio.fixture
async def editor_token(client: AsyncClient, editor_user: AdminUser) -> str:
    """Get JWT token for editor user"""
    return await get_auth_token(client, editor_user.email, "testpass123")


@pytest_asyncio.fixture
async def viewer_token(client: AsyncClient, viewer_user: AdminUser) -> str:
    """Get JWT token for viewer user"""
    return await get_auth_token(client, viewer_user.email, "testpass123")


@pytest_asyncio.fixture
async def auth_headers_super_admin(super_admin_token: str) -> dict:
    """Get authorization headers for super admin"""
    return {"Authorization": f"Bearer {super_admin_token}"}


@pytest_asyncio.fixture
async def auth_headers_admin(admin_token: str) -> dict:
    """Get authorization headers for admin"""
    return {"Authorization": f"Bearer {admin_token}"}


@pytest_asyncio.fixture
async def auth_headers_editor(editor_token: str) -> dict:
    """Get authorization headers for editor"""
    return {"Authorization": f"Bearer {editor_token}"}


@pytest_asyncio.fixture
async def auth_headers_viewer(viewer_token: str) -> dict:
    """Get authorization headers for viewer"""
    return {"Authorization": f"Bearer {viewer_token}"}


# Data factories
class UserFactory:
    """Factory for creating test users"""
    
    @staticmethod
    def create_user_data(**kwargs) -> dict:
        """Create user data for API requests"""
        default_data = {
            "email": "test@example.com",
            "first_name": "Test",
            "last_name": "User", 
            "role": "viewer",
            "send_invitation": False
        }
        default_data.update(kwargs)
        return default_data


@pytest.fixture
def user_factory() -> UserFactory:
    """User factory fixture"""
    return UserFactory()


# Test markers
pytestmark = pytest.mark.asyncio