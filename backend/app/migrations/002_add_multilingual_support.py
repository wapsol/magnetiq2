"""Add multilingual support tables

Revision ID: 002_multilingual
Revises: 001
Create Date: 2024-08-31 15:40:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import sqlite

# revision identifiers
revision = '002_multilingual'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Create translations table
    op.create_table('translations',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('namespace', sa.String(100), nullable=False),
        sa.Column('key', sa.String(200), nullable=False),
        sa.Column('source_language', sa.String(2), nullable=False),
        sa.Column('target_language', sa.String(2), nullable=False),
        sa.Column('source_text', sa.Text(), nullable=False),
        sa.Column('translated_text', sa.Text()),
        sa.Column('context', sa.Text()),
        sa.Column('status', sa.String(20), nullable=False),
        sa.Column('translation_method', sa.String(20)),
        sa.Column('confidence_score', sa.Numeric(3, 2)),
        sa.Column('translator_id', sa.String()),
        sa.Column('reviewer_id', sa.String()),
        sa.Column('translated_at', sa.DateTime()),
        sa.Column('reviewed_at', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for translations
    op.create_index('ix_translations_namespace', 'translations', ['namespace'])
    op.create_index('ix_translations_key', 'translations', ['key'])
    op.create_index('ix_translations_target_language', 'translations', ['target_language'])
    op.create_index('ix_translations_status', 'translations', ['status'])
    op.create_index('ix_translations_namespace_key', 'translations', ['namespace', 'key'])
    
    # Create multilingual_content table
    op.create_table('multilingual_content',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('content_type', sa.String(50), nullable=False),
        sa.Column('content_id', sa.String(), nullable=False),
        sa.Column('field_name', sa.String(100), nullable=False),
        sa.Column('language', sa.String(2), nullable=False),
        sa.Column('text_content', sa.Text()),
        sa.Column('html_content', sa.Text()),
        sa.Column('json_content', sqlite.JSON()),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('version', sa.Integer()),
        sa.Column('created_by', sa.String()),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for multilingual_content
    op.create_index('ix_multilingual_content_language', 'multilingual_content', ['language'])
    op.create_index('ix_multilingual_content_type_id', 'multilingual_content', ['content_type', 'content_id'])
    
    # Create translation_memory table
    op.create_table('translation_memory',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('source_text', sa.Text(), nullable=False),
        sa.Column('translated_text', sa.Text(), nullable=False),
        sa.Column('source_language', sa.String(2), nullable=False),
        sa.Column('target_language', sa.String(2), nullable=False),
        sa.Column('domain', sa.String(50)),
        sa.Column('context', sa.Text()),
        sa.Column('quality_score', sa.Numeric(3, 2)),
        sa.Column('usage_count', sa.Integer()),
        sa.Column('last_used', sa.DateTime()),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for translation_memory
    op.create_index('ix_translation_memory_source_text', 'translation_memory', ['source_text'])
    op.create_index('ix_translation_memory_languages', 'translation_memory', ['source_language', 'target_language'])
    
    # Create language_preferences table
    op.create_table('language_preferences',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String()),
        sa.Column('session_id', sa.String()),
        sa.Column('preferred_language', sa.String(2), nullable=False),
        sa.Column('fallback_language', sa.String(2)),
        sa.Column('auto_detect', sa.Boolean()),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes for language_preferences
    op.create_index('ix_language_preferences_session_id', 'language_preferences', ['session_id'])


def downgrade():
    # Drop tables in reverse order
    op.drop_table('language_preferences')
    op.drop_table('translation_memory')
    op.drop_table('multilingual_content')
    op.drop_table('translations')