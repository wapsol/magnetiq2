"""
Add email validation and secure download features to WhitepaperDownload model

Revision ID: 003
Revises: 002
Create Date: 2025-09-04 12:00:00.000000
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    """Add email validation and secure download columns to whitepaper_downloads table"""
    
    # Add new columns for email validation
    op.add_column('whitepaper_downloads', sa.Column('email_validated', sa.Boolean(), default=False))
    op.add_column('whitepaper_downloads', sa.Column('validation_token', sa.String(64), unique=True))
    op.add_column('whitepaper_downloads', sa.Column('validation_sent_at', sa.DateTime(timezone=True)))
    op.add_column('whitepaper_downloads', sa.Column('email_validated_at', sa.DateTime(timezone=True)))
    
    # Add new columns for secure download links
    op.add_column('whitepaper_downloads', sa.Column('download_token', sa.String(64), unique=True))
    op.add_column('whitepaper_downloads', sa.Column('download_link_expires_at', sa.DateTime(timezone=True)))
    op.add_column('whitepaper_downloads', sa.Column('download_count', sa.Integer(), default=0))
    op.add_column('whitepaper_downloads', sa.Column('download_limit', sa.Integer(), default=3))
    
    # Add new timestamp column and modify existing
    op.add_column('whitepaper_downloads', sa.Column('requested_at', sa.DateTime(timezone=True)))
    
    # Create indexes
    op.create_index('idx_whitepaper_downloads_validation_token', 'whitepaper_downloads', ['validation_token'])
    op.create_index('idx_whitepaper_downloads_download_token', 'whitepaper_downloads', ['download_token'])
    
    # Update existing records to have requested_at = downloaded_at
    op.execute("UPDATE whitepaper_downloads SET requested_at = downloaded_at WHERE requested_at IS NULL")


def downgrade():
    """Remove email validation and secure download columns from whitepaper_downloads table"""
    
    # Drop indexes
    op.drop_index('idx_whitepaper_downloads_download_token', 'whitepaper_downloads')
    op.drop_index('idx_whitepaper_downloads_validation_token', 'whitepaper_downloads')
    
    # Remove columns
    op.drop_column('whitepaper_downloads', 'requested_at')
    op.drop_column('whitepaper_downloads', 'download_limit')
    op.drop_column('whitepaper_downloads', 'download_count')
    op.drop_column('whitepaper_downloads', 'download_link_expires_at')
    op.drop_column('whitepaper_downloads', 'download_token')
    op.drop_column('whitepaper_downloads', 'email_validated_at')
    op.drop_column('whitepaper_downloads', 'validation_sent_at')
    op.drop_column('whitepaper_downloads', 'validation_token')
    op.drop_column('whitepaper_downloads', 'email_validated')