from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.orm import declarative_base
from sqlalchemy import text
from app.config import settings
import logging

logger = logging.getLogger(__name__)

# Create async engine
engine = create_async_engine(
    settings.database_url,
    echo=settings.debug,  # SQL logging in development
    connect_args={
        "check_same_thread": False,
        "timeout": 30,
    }
)

# Create session factory
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    autocommit=False,
    autoflush=False,
    expire_on_commit=False
)

# Base class for models
Base = declarative_base()


async def get_db() -> AsyncSession:
    """Dependency to get database session"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


async def init_db():
    """Initialize database with proper SQLite configuration"""
    try:
        async with engine.begin() as conn:
            # Enable WAL mode for better concurrent performance
            await conn.execute(text("PRAGMA journal_mode=WAL;"))
            # Enable foreign key constraints
            await conn.execute(text("PRAGMA foreign_keys=ON;"))
            # Set synchronous mode for better performance
            await conn.execute(text("PRAGMA synchronous=NORMAL;"))
            # Set cache size
            await conn.execute(text("PRAGMA cache_size=10000;"))
            # Set temp store to memory
            await conn.execute(text("PRAGMA temp_store=MEMORY;"))
            
            logger.info("Database configuration applied")
            
        # Create all tables
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
            logger.info("Database tables created")
            
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise


async def close_db():
    """Close database connection"""
    await engine.dispose()
    logger.info("Database connection closed")