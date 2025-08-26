# Magnetiq v2 - Database Schema Specification

## Overview

The Magnetiq v2 database schema is designed for simplicity, maintainability, and data integrity using SQLite as the primary database for all environments. It supports all core system features including content management, user administration, business operations, and multilingual content.

## Database Technology

### Primary Database
- **SQLite 3.35+** for all environments (development, testing, production)
- **UTF-8 encoding** for full Unicode support  
- **Write-Ahead Logging (WAL)** mode for improved concurrent read performance
- **Foreign key constraints** enabled for data integrity

### Design Principles
- **Normalized design** (3NF minimum) with selective denormalization for performance
- **Integer primary keys** with auto-increment for all entities
- **Soft deletes** with `deleted_at` timestamps
- **Basic audit trails** for critical operations
- **Simple indexing** strategy for common query patterns
- **Full-text search** using SQLite FTS5
- **Multilingual content** using JSON columns

### SQLite Configuration
```sql
-- Enable essential SQLite features
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 10000;
PRAGMA temp_store = MEMORY;
```

### Naming Conventions
- **Tables**: snake_case (plural nouns)
- **Columns**: snake_case  
- **Indexes**: `idx_table_column(s)`
- **Constraints**: `ck_table_condition`, `uq_table_column(s)`

## Core Tables

### Users & Authentication

#### `admin_users`
Administrative users with system access.

```sql
CREATE TABLE admin_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    
    -- Profile Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    avatar_url TEXT,
    timezone TEXT DEFAULT 'UTC',
    language TEXT DEFAULT 'en',
    
    -- Role & Permissions
    role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
    
    -- Status & Activity
    is_active BOOLEAN NOT NULL DEFAULT 1,
    last_login DATETIME,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until DATETIME,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME
);

-- Indexes for admin_users
CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_active ON admin_users(is_active);
CREATE INDEX idx_admin_users_created ON admin_users(created_at);
```

#### `user_sessions`
Simple session tracking for admin users.

```sql
CREATE TABLE user_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    session_token TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    user_agent TEXT,
    ip_address TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES admin_users(id) ON DELETE CASCADE
);

-- Indexes for user_sessions
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
```

### Content Management

#### `pages`
Website pages with multilingual content support.

```sql
CREATE TABLE pages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    
    -- Multilingual content stored as JSON
    title TEXT NOT NULL, -- JSON: {"en": "Title", "de": "Titel"}
    content TEXT NOT NULL, -- JSON: {"en": "Content", "de": "Inhalt"}
    excerpt TEXT, -- JSON: {"en": "Excerpt", "de": "Auszug"}
    meta_description TEXT, -- JSON for SEO descriptions
    
    -- Page Configuration
    template TEXT DEFAULT 'default',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    is_featured BOOLEAN DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    
    -- SEO & Marketing
    seo_title TEXT, -- JSON for SEO titles
    seo_keywords TEXT, -- JSON for SEO keywords
    canonical_url TEXT,
    
    -- Publishing
    published_at DATETIME,
    author_id INTEGER,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    FOREIGN KEY (author_id) REFERENCES admin_users(id)
);

-- Indexes for pages
CREATE UNIQUE INDEX idx_pages_slug ON pages(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_pages_status ON pages(status);
CREATE INDEX idx_pages_published ON pages(published_at);
CREATE INDEX idx_pages_author ON pages(author_id);
CREATE INDEX idx_pages_featured ON pages(is_featured);

-- Full-text search for pages
CREATE VIRTUAL TABLE pages_fts USING fts5(title, content, excerpt, content='pages', content_rowid='id');

-- Triggers to keep FTS table synchronized
CREATE TRIGGER pages_ai AFTER INSERT ON pages BEGIN
  INSERT INTO pages_fts(rowid, title, content, excerpt) VALUES (new.id, new.title, new.content, new.excerpt);
END;

CREATE TRIGGER pages_ad AFTER DELETE ON pages BEGIN
  INSERT INTO pages_fts(pages_fts, rowid, title, content, excerpt) VALUES('delete', old.id, old.title, old.content, old.excerpt);
END;

CREATE TRIGGER pages_au AFTER UPDATE ON pages BEGIN
  INSERT INTO pages_fts(pages_fts, rowid, title, content, excerpt) VALUES('delete', old.id, old.title, old.content, old.excerpt);
  INSERT INTO pages_fts(rowid, title, content, excerpt) VALUES (new.id, new.title, new.content, new.excerpt);
END;
```

#### `media_files`
File management for images, documents, and other media.

```sql
CREATE TABLE media_files (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type TEXT NOT NULL,
    file_hash TEXT NOT NULL, -- SHA-256 hash for deduplication
    
    -- Metadata
    title TEXT, -- JSON for multilingual titles
    alt_text TEXT, -- JSON for multilingual alt text
    description TEXT, -- JSON for multilingual descriptions
    
    -- Image-specific metadata (JSON)
    image_metadata TEXT, -- {"width": 1920, "height": 1080, "format": "JPEG"}
    
    -- Organization
    folder TEXT DEFAULT '/',
    tags TEXT, -- JSON array of tags
    
    -- Upload Information
    uploaded_by INTEGER,
    upload_ip TEXT,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    FOREIGN KEY (uploaded_by) REFERENCES admin_users(id)
);

-- Indexes for media_files
CREATE INDEX idx_media_files_filename ON media_files(filename);
CREATE INDEX idx_media_files_hash ON media_files(file_hash);
CREATE INDEX idx_media_files_mime_type ON media_files(mime_type);
CREATE INDEX idx_media_files_folder ON media_files(folder);
CREATE INDEX idx_media_files_uploaded_by ON media_files(uploaded_by);
```

### Business Operations

#### `webinars`
Webinar management and scheduling.

```sql
CREATE TABLE webinars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Basic Information
    title TEXT NOT NULL, -- JSON for multilingual titles
    description TEXT, -- JSON for multilingual descriptions
    slug TEXT UNIQUE NOT NULL,
    
    -- Scheduling
    scheduled_at DATETIME NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    timezone TEXT DEFAULT 'UTC',
    max_participants INTEGER,
    
    -- URLs & Configuration
    meeting_url TEXT,
    recording_url TEXT,
    presentation_file_id INTEGER,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'live', 'completed', 'cancelled')),
    registration_enabled BOOLEAN DEFAULT 1,
    registration_deadline DATETIME,
    
    -- Presenter Information
    presenter_name TEXT,
    presenter_bio TEXT, -- JSON for multilingual bio
    presenter_avatar_id INTEGER,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    FOREIGN KEY (presentation_file_id) REFERENCES media_files(id),
    FOREIGN KEY (presenter_avatar_id) REFERENCES media_files(id)
);

-- Indexes for webinars
CREATE INDEX idx_webinars_slug ON webinars(slug);
CREATE INDEX idx_webinars_scheduled_at ON webinars(scheduled_at);
CREATE INDEX idx_webinars_status ON webinars(status);
```

#### `webinar_registrations`
Webinar participant registrations and lead capture.

```sql
CREATE TABLE webinar_registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    webinar_id INTEGER NOT NULL,
    
    -- Contact Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    job_title TEXT,
    phone TEXT,
    
    -- Registration Details
    registration_source TEXT, -- website, api, import
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Attendance Tracking
    attended BOOLEAN DEFAULT 0,
    attendance_duration INTEGER, -- minutes attended
    
    -- Communication Preferences
    send_reminder BOOLEAN DEFAULT 1,
    send_recording BOOLEAN DEFAULT 1,
    
    -- Timestamps
    registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    confirmed_at DATETIME,
    
    FOREIGN KEY (webinar_id) REFERENCES webinars(id) ON DELETE CASCADE
);

-- Indexes for webinar_registrations
CREATE INDEX idx_webinar_registrations_webinar ON webinar_registrations(webinar_id);
CREATE INDEX idx_webinar_registrations_email ON webinar_registrations(email);
CREATE INDEX idx_webinar_registrations_registered ON webinar_registrations(registered_at);
```

#### `whitepapers`
Whitepaper and document management.

```sql
CREATE TABLE whitepapers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Basic Information
    title TEXT NOT NULL, -- JSON for multilingual titles
    description TEXT, -- JSON for multilingual descriptions
    slug TEXT UNIQUE NOT NULL,
    
    -- Content
    file_id INTEGER NOT NULL,
    thumbnail_id INTEGER,
    preview_content TEXT, -- JSON for multilingual preview text
    
    -- Categorization
    category TEXT, -- e.g., 'case-study', 'guide', 'report'
    tags TEXT, -- JSON array of tags
    industry TEXT, -- JSON array of industries
    
    -- Lead Generation
    requires_registration BOOLEAN DEFAULT 1,
    lead_magnet_active BOOLEAN DEFAULT 1,
    
    -- SEO & Marketing
    meta_title TEXT, -- JSON for multilingual meta titles
    meta_description TEXT, -- JSON for multilingual meta descriptions
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    featured BOOLEAN DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    
    -- Publishing
    published_at DATETIME,
    author_id INTEGER,
    
    -- Analytics
    download_count INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    FOREIGN KEY (file_id) REFERENCES media_files(id),
    FOREIGN KEY (thumbnail_id) REFERENCES media_files(id),
    FOREIGN KEY (author_id) REFERENCES admin_users(id)
);

-- Indexes for whitepapers
CREATE INDEX idx_whitepapers_slug ON whitepapers(slug);
CREATE INDEX idx_whitepapers_category ON whitepapers(category);
CREATE INDEX idx_whitepapers_status ON whitepapers(status);
CREATE INDEX idx_whitepapers_published ON whitepapers(published_at);
```

#### `whitepaper_downloads`
Track whitepaper downloads and lead capture.

```sql
CREATE TABLE whitepaper_downloads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    whitepaper_id INTEGER NOT NULL,
    
    -- Contact Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    job_title TEXT,
    phone TEXT,
    
    -- Download Details
    download_ip TEXT,
    user_agent TEXT,
    download_source TEXT, -- website, api, email
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Timestamps
    downloaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (whitepaper_id) REFERENCES whitepapers(id) ON DELETE CASCADE
);

-- Indexes for whitepaper_downloads
CREATE INDEX idx_whitepaper_downloads_whitepaper ON whitepaper_downloads(whitepaper_id);
CREATE INDEX idx_whitepaper_downloads_email ON whitepaper_downloads(email);
CREATE INDEX idx_whitepaper_downloads_downloaded ON whitepaper_downloads(downloaded_at);
```

#### `bookings`
Consultation booking system.

```sql
CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Contact Information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    job_title TEXT,
    phone TEXT,
    
    -- Booking Details
    booking_type TEXT NOT NULL, -- consultation, demo, support
    preferred_date DATETIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    timezone TEXT DEFAULT 'UTC',
    
    -- Requirements
    subject TEXT,
    message TEXT,
    budget_range TEXT,
    urgency TEXT, -- low, medium, high, urgent
    
    -- Status Management
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled', 'no_show')),
    confirmed_at DATETIME,
    completed_at DATETIME,
    
    -- Meeting Information
    meeting_url TEXT,
    meeting_notes TEXT,
    follow_up_required BOOLEAN DEFAULT 0,
    
    -- Lead Scoring
    lead_score INTEGER DEFAULT 0,
    lead_source TEXT, -- website, referral, campaign
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Assigned Staff
    assigned_to INTEGER,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    FOREIGN KEY (assigned_to) REFERENCES admin_users(id)
);

-- Indexes for bookings
CREATE INDEX idx_bookings_email ON bookings(email);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_preferred_date ON bookings(preferred_date);
CREATE INDEX idx_bookings_assigned_to ON bookings(assigned_to);
CREATE INDEX idx_bookings_created ON bookings(created_at);
```

### Analytics & Tracking

#### `analytics_events`
Simple analytics tracking for basic metrics.

```sql
CREATE TABLE analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Event Information
    event_type TEXT NOT NULL, -- page_view, download, registration, booking
    event_category TEXT, -- webinar, whitepaper, page
    event_action TEXT, -- view, download, register, book
    event_label TEXT,
    
    -- Context
    page_path TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address TEXT,
    
    -- Session Tracking
    session_id TEXT,
    user_id INTEGER, -- if logged in admin user
    
    -- UTM Parameters
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    
    -- Additional Data
    metadata TEXT, -- JSON for additional event data
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES admin_users(id)
);

-- Indexes for analytics_events
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_category ON analytics_events(event_category);
CREATE INDEX idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX idx_analytics_events_session ON analytics_events(session_id);
```

### System Configuration

#### `system_settings`
Application configuration and settings.

```sql
CREATE TABLE system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    type TEXT DEFAULT 'string', -- string, integer, boolean, json
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default system settings
INSERT INTO system_settings (key, value, description, type) VALUES
('site_title', '{"en": "Magnetiq CMS", "de": "Magnetiq CMS"}', 'Site title in multiple languages', 'json'),
('site_description', '{"en": "Content Management System", "de": "Content Management System"}', 'Site description', 'json'),
('default_language', 'en', 'Default system language', 'string'),
('supported_languages', '["en", "de"]', 'Supported languages', 'json'),
('email_from_name', 'Magnetiq System', 'Default email sender name', 'string'),
('email_from_address', 'noreply@magnetiq.local', 'Default email sender address', 'string'),
('maintenance_mode', 'false', 'Enable maintenance mode', 'boolean'),
('registration_enabled', 'true', 'Allow new user registrations', 'boolean');

-- Index for system_settings
CREATE INDEX idx_system_settings_key ON system_settings(key);
```

## Database Relationships

### Entity Relationship Overview
```
admin_users (1) → (N) user_sessions
admin_users (1) → (N) pages (author)
admin_users (1) → (N) media_files (uploader)
admin_users (1) → (N) bookings (assigned_to)

media_files (1) → (N) whitepapers (file)
media_files (1) → (N) webinars (presentation/avatar)

webinars (1) → (N) webinar_registrations
whitepapers (1) → (N) whitepaper_downloads
```

## Performance Optimization

### Indexing Strategy
- **Primary Keys**: Auto-increment integers for optimal performance
- **Foreign Keys**: Indexed for join performance
- **Search Fields**: Email, slug, status fields indexed
- **Temporal Data**: Created/updated timestamps indexed for sorting
- **Full-Text Search**: FTS5 virtual tables for content search

### Query Optimization
```sql
-- Example optimized queries

-- Get published pages with pagination
SELECT id, slug, title, excerpt, published_at 
FROM pages 
WHERE status = 'published' AND deleted_at IS NULL 
ORDER BY published_at DESC 
LIMIT 20 OFFSET 0;

-- Search pages content
SELECT pages.id, pages.title, pages.slug
FROM pages
JOIN pages_fts ON pages.id = pages_fts.rowid
WHERE pages_fts MATCH 'search term'
AND pages.status = 'published'
ORDER BY rank;

-- Get webinar registrations with contact info
SELECT w.title, wr.first_name, wr.last_name, wr.email, wr.registered_at
FROM webinar_registrations wr
JOIN webinars w ON wr.webinar_id = w.id
WHERE w.scheduled_at > datetime('now')
ORDER BY w.scheduled_at;
```

### Maintenance Operations
```sql
-- Regular maintenance tasks

-- Optimize database file size
VACUUM;

-- Update table statistics
ANALYZE;

-- Clean up old sessions
DELETE FROM user_sessions WHERE expires_at < datetime('now', '-1 day');

-- Clean up soft-deleted records (after 30 days)
DELETE FROM pages WHERE deleted_at < datetime('now', '-30 days');
DELETE FROM admin_users WHERE deleted_at < datetime('now', '-30 days');
```

## Backup & Recovery

### Backup Strategy
```bash
# Simple file-based backup
cp magnetiq.db magnetiq_backup_$(date +%Y%m%d_%H%M%S).db

# Backup with SQLite dump
sqlite3 magnetiq.db .dump > magnetiq_backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
sqlite3 magnetiq.db .dump | gzip > magnetiq_backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Recovery Procedures
```bash
# Restore from file backup
cp magnetiq_backup_20240101_120000.db magnetiq.db

# Restore from SQL dump
sqlite3 magnetiq_restored.db < magnetiq_backup_20240101_120000.sql

# Verify database integrity
sqlite3 magnetiq.db "PRAGMA integrity_check;"
```

## Migration Scripts

### Database Initialization
```python
# initialize_db.py
import sqlite3
import os
from datetime import datetime

def initialize_database():
    """Initialize the SQLite database with schema and default data"""
    db_path = "magnetiq.db"
    
    if os.path.exists(db_path):
        print(f"Database {db_path} already exists")
        return
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Enable foreign keys and WAL mode
    cursor.execute("PRAGMA foreign_keys = ON")
    cursor.execute("PRAGMA journal_mode = WAL")
    
    # Read and execute schema SQL
    with open("schema.sql", "r") as f:
        schema_sql = f.read()
    
    cursor.executescript(schema_sql)
    
    # Create default admin user (password: admin123)
    cursor.execute("""
        INSERT INTO admin_users (email, hashed_password, first_name, last_name, role, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        "admin@voltaic.systems",
        "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBP7QQQ7NTGdzi",  # hashed "admin123"
        "System",
        "Administrator", 
        "admin",
        True
    ))
    
    conn.commit()
    conn.close()
    
    print(f"Database {db_path} initialized successfully")

if __name__ == "__main__":
    initialize_database()
```

## Development vs Production

### Development Configuration
- **Database File**: `magnetiq_dev.db` in project root
- **Logging**: SQL query logging enabled
- **Sample Data**: Test data for development
- **Backup**: Manual file copies

### Production Configuration  
- **Database File**: `/data/magnetiq_prod.db` with proper permissions
- **Logging**: Error logging only
- **Monitoring**: Database file size monitoring
- **Backup**: Automated daily backups with rotation

## Migration to v3

For teams planning to upgrade to Magnetiq v3:

### Data Export Utilities
```python
# export_to_postgresql.py
import sqlite3
import json
from datetime import datetime

def export_data_for_v3():
    """Export SQLite data in format compatible with PostgreSQL v3"""
    conn = sqlite3.connect("magnetiq.db")
    conn.row_factory = sqlite3.Row
    
    # Export users
    users = conn.execute("SELECT * FROM admin_users WHERE deleted_at IS NULL").fetchall()
    with open("users_export.json", "w") as f:
        json.dump([dict(row) for row in users], f, default=str, indent=2)
    
    # Export content
    pages = conn.execute("SELECT * FROM pages WHERE deleted_at IS NULL").fetchall()
    with open("pages_export.json", "w") as f:
        json.dump([dict(row) for row in pages], f, default=str, indent=2)
    
    # Export business data
    webinars = conn.execute("SELECT * FROM webinars WHERE deleted_at IS NULL").fetchall()
    with open("webinars_export.json", "w") as f:
        json.dump([dict(row) for row in webinars], f, default=str, indent=2)
    
    conn.close()
    print("Data exported for v3 migration")
```

### Schema Compatibility
- **ID Fields**: Integer IDs compatible with PostgreSQL sequences
- **JSON Fields**: SQLite JSON directly compatible with PostgreSQL JSONB
- **Timestamps**: ISO format timestamps for easy conversion
- **Foreign Keys**: Relationship structure maintained

## Conclusion

The Magnetiq v2 database schema provides a robust foundation using SQLite for all environments. The design balances simplicity with functionality, supporting all core CMS and business automation features while maintaining excellent performance characteristics and providing a clear migration path to PostgreSQL-based v3 when advanced integration capabilities are needed.