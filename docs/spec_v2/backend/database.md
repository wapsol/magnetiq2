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
- **Full-text search** using SQLite FTS5 with language-specific indexes
- **Multilingual content** using JSON columns with validation
- **Translation management** for UI strings and content workflows
- **Language-specific views** for optimized queries

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
    -- IMPORTANT: All multilingual JSON fields must include English ('en') as mandatory
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    
    -- Multilingual PortableText content (English required)
    title TEXT NOT NULL CHECK (json_extract(title, '$.en') IS NOT NULL), -- JSON: {"en": "Title", "de": "Titel"}
    content TEXT NOT NULL CHECK (json_extract(content, '$.en') IS NOT NULL), -- PortableText JSON: {"en": [...blocks], "de": [...blocks]}
    excerpt TEXT CHECK (excerpt IS NULL OR json_extract(excerpt, '$.en') IS NOT NULL), -- PortableText JSON: {"en": [...blocks], "de": [...blocks]}
    meta_description TEXT CHECK (meta_description IS NULL OR json_extract(meta_description, '$.en') IS NOT NULL), -- JSON for SEO descriptions
    
    -- Page Configuration
    template TEXT DEFAULT 'default',
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
    is_featured BOOLEAN DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    
    -- SEO & Marketing
    seo_title TEXT CHECK (seo_title IS NULL OR json_extract(seo_title, '$.en') IS NOT NULL), -- JSON for SEO titles
    seo_keywords TEXT CHECK (seo_keywords IS NULL OR json_extract(seo_keywords, '$.en') IS NOT NULL), -- JSON for SEO keywords
    structured_data TEXT, -- PortableText-derived structured data for SEO
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

-- Language-specific full-text search for pages
-- English FTS
CREATE VIRTUAL TABLE pages_fts_en USING fts5(
    title, content, excerpt,
    tokenize='porter'
);

-- German FTS
CREATE VIRTUAL TABLE pages_fts_de USING fts5(
    title, content, excerpt,
    tokenize='porter'
);

-- Indexes for multilingual JSON queries
CREATE INDEX idx_pages_title_en ON pages(json_extract(title, '$.en'));
CREATE INDEX idx_pages_title_de ON pages(json_extract(title, '$.de'));

-- Triggers to keep language-specific FTS tables synchronized (with PortableText extraction)
CREATE TRIGGER pages_fts_en_ai AFTER INSERT ON pages BEGIN
  INSERT INTO pages_fts_en(rowid, title, content, excerpt) 
  VALUES (
    new.id, 
    json_extract(new.title, '$.en'), 
    portable_text_to_plain_text(json_extract(new.content, '$.en')), -- Extract plain text from PortableText
    portable_text_to_plain_text(json_extract(new.excerpt, '$.en'))
  );
END;

CREATE TRIGGER pages_fts_de_ai AFTER INSERT ON pages 
WHEN json_extract(new.title, '$.de') IS NOT NULL BEGIN
  INSERT INTO pages_fts_de(rowid, title, content, excerpt) 
  VALUES (
    new.id, 
    json_extract(new.title, '$.de'), 
    portable_text_to_plain_text(json_extract(new.content, '$.de')), 
    portable_text_to_plain_text(json_extract(new.excerpt, '$.de'))
  );
END;

CREATE TRIGGER pages_fts_en_ad AFTER DELETE ON pages BEGIN
  DELETE FROM pages_fts_en WHERE rowid = old.id;
END;

CREATE TRIGGER pages_fts_de_ad AFTER DELETE ON pages BEGIN
  DELETE FROM pages_fts_de WHERE rowid = old.id;
END;

CREATE TRIGGER pages_fts_en_au AFTER UPDATE ON pages BEGIN
  UPDATE pages_fts_en SET 
    title = json_extract(new.title, '$.en'),
    content = portable_text_to_plain_text(json_extract(new.content, '$.en')),
    excerpt = portable_text_to_plain_text(json_extract(new.excerpt, '$.en'))
  WHERE rowid = new.id;
END;

CREATE TRIGGER pages_fts_de_au AFTER UPDATE ON pages 
WHEN json_extract(new.title, '$.de') IS NOT NULL BEGIN
  UPDATE pages_fts_de SET 
    title = json_extract(new.title, '$.de'),
    content = portable_text_to_plain_text(json_extract(new.content, '$.de')),
    excerpt = portable_text_to_plain_text(json_extract(new.excerpt, '$.de'))
  WHERE rowid = new.id;
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
    
    -- Basic Information (with PortableText validation)
    title TEXT NOT NULL CHECK (json_extract(title, '$.en') IS NOT NULL), -- JSON for multilingual titles
    description TEXT CHECK (description IS NULL OR json_extract(description, '$.en') IS NOT NULL), -- PortableText JSON for multilingual descriptions
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
    presenter_bio TEXT CHECK (presenter_bio IS NULL OR json_extract(presenter_bio, '$.en') IS NOT NULL), -- PortableText JSON for multilingual bio
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
    
    -- Basic Information (with PortableText validation)
    title TEXT NOT NULL CHECK (json_extract(title, '$.en') IS NOT NULL), -- JSON for multilingual titles
    description TEXT CHECK (description IS NULL OR json_extract(description, '$.en') IS NOT NULL), -- PortableText JSON for multilingual descriptions
    slug TEXT UNIQUE NOT NULL,
    
    -- Content
    file_id INTEGER NOT NULL,
    thumbnail_id INTEGER,
    preview_content TEXT CHECK (preview_content IS NULL OR json_extract(preview_content, '$.en') IS NOT NULL), -- PortableText JSON for multilingual preview text
    
    -- Categorization
    category TEXT, -- e.g., 'case-study', 'guide', 'report'
    tags TEXT, -- JSON array of tags
    industry TEXT, -- JSON array of industries
    
    -- Lead Generation
    requires_registration BOOLEAN DEFAULT 1,
    lead_magnet_active BOOLEAN DEFAULT 1,
    
    -- SEO & Marketing
    meta_title TEXT CHECK (meta_title IS NULL OR json_extract(meta_title, '$.en') IS NOT NULL), -- JSON for multilingual meta titles
    meta_description TEXT CHECK (meta_description IS NULL OR json_extract(meta_description, '$.en') IS NOT NULL), -- PortableText JSON for multilingual meta descriptions
    content_summary TEXT, -- Auto-generated plain text summary from PortableText content
    
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

#### `whitepaper_leads`
Comprehensive lead capture and tracking for whitepaper downloads.

→ **Cross-References**: [Lead Management API](api.md#lead-management-api), [Odoo CRM Integration](../integrations/odoo-crm.md)
← **Supports**: [Lead Scoring](../features/lead-scoring.md), [CRM Integration](../features/crm-integration.md)

```sql
CREATE TABLE whitepaper_leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    whitepaper_id INTEGER NOT NULL,
    
    -- Basic Contact Information
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    company TEXT,
    website TEXT,
    phone TEXT,
    
    -- Professional Information
    job_title TEXT,
    department TEXT,
    industry TEXT,
    company_size TEXT CHECK (company_size IN ('startup', 'small', 'medium', 'large', 'enterprise')),
    
    -- Context Information
    download_source TEXT NOT NULL, -- 'direct', 'social', 'email', 'referral'
    referrer_url TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    utm_term TEXT,
    utm_content TEXT,
    
    -- Technical Data
    ip_address TEXT,
    user_agent TEXT,
    location_country TEXT,
    location_region TEXT,
    location_city TEXT,
    
    -- Consent Management
    marketing_consent BOOLEAN DEFAULT 0,
    privacy_consent BOOLEAN DEFAULT 1,
    terms_accepted BOOLEAN DEFAULT 1,
    consent_timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Download Session
    download_token TEXT UNIQUE, -- 48-hour validity token
    download_url TEXT, -- Pre-signed download URL
    download_expires_at DATETIME,
    
    -- CRM Integration
    exported_to_odoo BOOLEAN DEFAULT 0,
    odoo_lead_id INTEGER,
    exported_at DATETIME,
    export_status TEXT DEFAULT 'pending' CHECK (export_status IN ('pending', 'success', 'failed')),
    export_error TEXT,
    
    -- Lead Scoring
    lead_score INTEGER DEFAULT 0,
    qualification_status TEXT DEFAULT 'unqualified' CHECK (qualification_status IN ('unqualified', 'marketing-qualified', 'sales-qualified')),
    
    -- Audit
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    downloaded_at DATETIME, -- When they actually downloaded
    
    FOREIGN KEY (whitepaper_id) REFERENCES whitepapers(id) ON DELETE CASCADE
);

-- Indexes for whitepaper_leads
CREATE INDEX idx_whitepaper_leads_whitepaper ON whitepaper_leads(whitepaper_id);
CREATE INDEX idx_whitepaper_leads_email ON whitepaper_leads(email);
CREATE INDEX idx_whitepaper_leads_score ON whitepaper_leads(lead_score);
CREATE INDEX idx_whitepaper_leads_qualification ON whitepaper_leads(qualification_status);
CREATE INDEX idx_whitepaper_leads_export_status ON whitepaper_leads(export_status);
CREATE INDEX idx_whitepaper_leads_download_token ON whitepaper_leads(download_token);
CREATE INDEX idx_whitepaper_leads_created ON whitepaper_leads(created_at);
CREATE INDEX idx_whitepaper_leads_downloaded ON whitepaper_leads(downloaded_at);
```

#### `download_sessions`
Manage user download sessions for frictionless repeat downloads.

→ **Cross-References**: [Session Management](../features/session-management.md), [User Experience](../frontend/public/features/whitepapers.md#session-management)
← **Enables**: [Frictionless Downloads](../features/frictionless-downloads.md), [User Tracking](../features/user-tracking.md)

```sql
CREATE TABLE download_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Session Identification
    session_token TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL, -- Primary session identifier
    
    -- Cached User Data
    name TEXT,
    company TEXT,
    phone TEXT,
    job_title TEXT,
    industry TEXT,
    
    -- Session Management
    downloaded_whitepapers TEXT DEFAULT '[]', -- JSON array of whitepaper IDs
    session_data TEXT DEFAULT '{}', -- JSON object with additional session data
    
    -- Lifecycle
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL, -- 90 days from creation
    last_accessed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT 1
);

-- Indexes for download_sessions
CREATE INDEX idx_download_sessions_email ON download_sessions(email);
CREATE INDEX idx_download_sessions_token ON download_sessions(session_token);
CREATE INDEX idx_download_sessions_active ON download_sessions(is_active);
CREATE INDEX idx_download_sessions_expires ON download_sessions(expires_at);
```

#### `email_submissions`
Track and process email submissions from authors.

→ **Cross-References**: [Email Processing API](api.md#email-submission-processing), [Author Workflow](../features/author-workflow.md)
← **Supports**: [Automated Publishing](../features/automated-publishing.md), [LLM Processing](../features/llm-processing.md)

```sql
CREATE TABLE email_submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Email Details
    from_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    received_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Content Extraction
    extracted_title TEXT,
    extracted_body TEXT,
    attachments TEXT DEFAULT '[]', -- JSON array of attachment metadata
    
    -- LLM Processing
    llm_processing_status TEXT DEFAULT 'pending' CHECK (llm_processing_status IN ('pending', 'processing', 'completed', 'failed')),
    processed_title TEXT,
    processed_description TEXT,
    processed_abstract TEXT,
    suggested_category TEXT,
    suggested_tags TEXT, -- JSON array
    quality_score REAL,
    
    -- Publication Workflow
    auto_approved BOOLEAN DEFAULT 0,
    published_whitepaper_id INTEGER,
    
    -- Author Notification
    confirmation_sent BOOLEAN DEFAULT 0,
    confirmation_sent_at DATETIME,
    publication_notification_sent BOOLEAN DEFAULT 0,
    
    -- Processing
    processed_at DATETIME,
    processing_error TEXT,
    
    FOREIGN KEY (published_whitepaper_id) REFERENCES whitepapers(id)
);

-- Indexes for email_submissions
CREATE INDEX idx_email_submissions_from_email ON email_submissions(from_email);
CREATE INDEX idx_email_submissions_status ON email_submissions(llm_processing_status);
CREATE INDEX idx_email_submissions_received ON email_submissions(received_at);
CREATE INDEX idx_email_submissions_auto_approved ON email_submissions(auto_approved);
```

#### `whitepaper_analytics`
Detailed analytics and performance metrics for whitepapers.

→ **Cross-References**: [Analytics API](api.md#analytics-endpoints), [Performance Tracking](../features/performance-tracking.md)
← **Supports**: [Content Optimization](../features/content-optimization.md), [Marketing Analytics](../features/marketing-analytics.md)

```sql
CREATE TABLE whitepaper_analytics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    whitepaper_id INTEGER NOT NULL,
    
    -- Date Dimension
    date DATE NOT NULL,
    
    -- Traffic Metrics
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    bounce_rate REAL DEFAULT 0.0,
    avg_time_on_page INTEGER DEFAULT 0, -- seconds
    
    -- Conversion Metrics
    form_starts INTEGER DEFAULT 0,
    form_completions INTEGER DEFAULT 0,
    downloads INTEGER DEFAULT 0,
    leads_generated INTEGER DEFAULT 0,
    conversion_rate REAL DEFAULT 0.0,
    
    -- Source Attribution
    organic_traffic INTEGER DEFAULT 0,
    direct_traffic INTEGER DEFAULT 0,
    referral_traffic INTEGER DEFAULT 0,
    social_traffic INTEGER DEFAULT 0,
    email_traffic INTEGER DEFAULT 0,
    
    -- Geographic Distribution
    top_countries TEXT DEFAULT '{}', -- JSON object with country->count
    top_regions TEXT DEFAULT '{}', -- JSON object with region->count
    
    -- Industry Distribution
    top_industries TEXT DEFAULT '{}', -- JSON object with industry->count
    
    -- Lead Quality
    avg_lead_score REAL DEFAULT 0.0,
    qualified_leads INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (whitepaper_id) REFERENCES whitepapers(id) ON DELETE CASCADE,
    UNIQUE(whitepaper_id, date)
);

-- Indexes for whitepaper_analytics
CREATE INDEX idx_whitepaper_analytics_whitepaper ON whitepaper_analytics(whitepaper_id);
CREATE INDEX idx_whitepaper_analytics_date ON whitepaper_analytics(date);
CREATE INDEX idx_whitepaper_analytics_whitepaper_date ON whitepaper_analytics(whitepaper_id, date);
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
    meeting_type TEXT NOT NULL, -- consultation, demo, support
    preferred_date DATETIME NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    timezone TEXT DEFAULT 'UTC',
    
    -- Requirements (PortableText Multilingual support)
    subject TEXT, -- JSON: {"en": "Subject", "de": "Betreff"}
    message TEXT, -- PortableText JSON: {"en": [...blocks], "de": [...blocks]}
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

### Translation Management

#### `translations`
Manage UI translations and content translation workflows.

```sql
CREATE TABLE translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    namespace TEXT NOT NULL, -- e.g., 'ui', 'content', 'email'
    key TEXT NOT NULL, -- translation key identifier
    source_language TEXT DEFAULT 'en' CHECK (source_language IN ('en', 'de')),
    target_language TEXT NOT NULL CHECK (target_language IN ('en', 'de')),
    source_text TEXT NOT NULL,
    translated_text TEXT,
    context TEXT, -- contextual information for translators
    
    -- Translation Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'translated', 'reviewed', 'approved', 'rejected')),
    translation_method TEXT DEFAULT 'manual' CHECK (translation_method IN ('manual', 'ai', 'imported')),
    confidence_score REAL DEFAULT 0.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
    
    -- Workflow
    translator_id INTEGER,
    reviewer_id INTEGER,
    translated_at DATETIME,
    reviewed_at DATETIME,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (translator_id) REFERENCES admin_users(id),
    FOREIGN KEY (reviewer_id) REFERENCES admin_users(id),
    UNIQUE(namespace, key, source_language, target_language)
);

-- Indexes for translations
CREATE INDEX idx_translations_namespace_key ON translations(namespace, key);
CREATE INDEX idx_translations_language ON translations(target_language);
CREATE INDEX idx_translations_status ON translations(status);
CREATE INDEX idx_translations_method ON translations(translation_method);
```

#### `translation_memory`
Store and reuse previous translations for consistency.

```sql
CREATE TABLE translation_memory (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_text_hash TEXT NOT NULL, -- SHA-256 hash of source text
    source_language TEXT NOT NULL CHECK (source_language IN ('en', 'de')),
    target_language TEXT NOT NULL CHECK (target_language IN ('en', 'de')),
    source_text TEXT NOT NULL,
    translated_text TEXT NOT NULL,
    
    -- Quality Metrics
    usage_count INTEGER DEFAULT 1,
    quality_score REAL DEFAULT 0.8 CHECK (quality_score >= 0.0 AND quality_score <= 1.0),
    
    -- Context
    domain TEXT, -- e.g., 'technical', 'marketing', 'legal'
    project_context TEXT, -- specific project or feature context
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(source_text_hash, source_language, target_language)
);

-- Indexes for translation_memory
CREATE INDEX idx_translation_memory_hash ON translation_memory(source_text_hash);
CREATE INDEX idx_translation_memory_languages ON translation_memory(source_language, target_language);
CREATE INDEX idx_translation_memory_quality ON translation_memory(quality_score);
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

### Communication Services

#### `social_accounts`
Social media account management for connected platforms.

```sql
CREATE TABLE social_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Platform Information
    platform TEXT NOT NULL CHECK (platform IN ('linkedin', 'twitter', 'facebook', 'instagram')),
    account_name TEXT NOT NULL,
    account_handle TEXT,
    account_id TEXT NOT NULL, -- Platform-specific account ID
    
    -- Authentication
    access_token TEXT NOT NULL,
    refresh_token TEXT,
    token_expires_at DATETIME,
    
    -- Account Metadata
    profile_image_url TEXT,
    follower_count INTEGER DEFAULT 0,
    following_count INTEGER DEFAULT 0,
    is_business_account BOOLEAN DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT 1,
    last_sync_at DATETIME,
    
    -- Assigned User
    created_by INTEGER NOT NULL,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
);

-- Indexes for social_accounts
CREATE INDEX idx_social_accounts_platform ON social_accounts(platform);
CREATE INDEX idx_social_accounts_created_by ON social_accounts(created_by);
CREATE UNIQUE INDEX idx_social_accounts_platform_account ON social_accounts(platform, account_id) WHERE deleted_at IS NULL;
```

#### `social_content`
Platform-specific social media content management.

```sql
CREATE TABLE social_content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Platform Targeting
    social_account_id INTEGER NOT NULL,
    platform TEXT NOT NULL, -- linkedin, twitter (redundant but useful for queries)
    
    -- Content Data (PortableText Multilingual)
    title TEXT CHECK (title IS NULL OR json_extract(title, '$.en') IS NOT NULL), -- JSON: {"en": "Title", "de": "Titel"}
    content TEXT NOT NULL CHECK (json_extract(content, '$.en') IS NOT NULL), -- PortableText JSON: {"en": [...blocks], "de": [...blocks]}
    content_type TEXT NOT NULL DEFAULT 'post' CHECK (content_type IN ('post', 'thread', 'story', 'article')),
    
    -- Platform-Specific Configuration
    platform_config TEXT NOT NULL, -- JSON: platform-specific settings
    -- LinkedIn: {"visibility": "public|connections", "articleFormat": true}
    -- Twitter: {"threadLength": 5, "allowReplies": true, "sensitiveContent": false}
    
    -- Media Attachments
    media_urls TEXT, -- JSON array of media file URLs
    media_types TEXT, -- JSON array of media types (image, video, document)
    
    -- Scheduling
    scheduled_for DATETIME,
    published_at DATETIME,
    
    -- Status Management
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'published', 'failed')),
    publish_error TEXT,
    
    -- Platform Response
    platform_post_id TEXT, -- ID from social platform
    platform_url TEXT, -- Direct URL to published post
    
    -- Analytics Hooks
    initial_engagement TEXT, -- JSON snapshot of engagement at publish time
    
    -- Management
    created_by INTEGER NOT NULL,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    FOREIGN KEY (social_account_id) REFERENCES social_accounts(id),
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
);

-- Indexes for social_content
CREATE INDEX idx_social_content_account ON social_content(social_account_id);
CREATE INDEX idx_social_content_platform ON social_content(platform);
CREATE INDEX idx_social_content_status ON social_content(status);
CREATE INDEX idx_social_content_scheduled ON social_content(scheduled_for);
CREATE INDEX idx_social_content_created_by ON social_content(created_by);
```

#### `social_engagement`
Platform-specific engagement metrics and analytics.

```sql
CREATE TABLE social_engagement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Content Reference
    social_content_id INTEGER NOT NULL,
    platform TEXT NOT NULL,
    platform_post_id TEXT NOT NULL,
    
    -- Engagement Metrics (Platform-Specific)
    engagement_data TEXT NOT NULL, -- JSON with platform-specific metrics
    -- LinkedIn: {"likes": 45, "comments": 12, "shares": 8, "clicks": 156, "impressions": 2340}
    -- Twitter: {"likes": 89, "retweets": 23, "replies": 15, "quotes": 4, "bookmarks": 67, "impressions": 5670}
    
    -- Audience Insights
    audience_data TEXT, -- JSON with demographic data (when available)
    
    -- Performance Scoring
    engagement_rate REAL DEFAULT 0.0,
    viral_score INTEGER DEFAULT 0, -- Algorithm-calculated virality score
    
    -- Data Collection
    data_collected_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for social_engagement
CREATE INDEX idx_social_engagement_content ON social_engagement(social_content_id);
CREATE INDEX idx_social_engagement_platform ON social_engagement(platform);
CREATE INDEX idx_social_engagement_platform_post ON social_engagement(platform_post_id);
CREATE INDEX idx_social_engagement_rate ON social_engagement(engagement_rate);
CREATE INDEX idx_social_engagement_collected ON social_engagement(data_collected_at);
```

#### `email_campaigns`
Email marketing campaign management.

```sql
CREATE TABLE email_campaigns (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Campaign Information (PortableText Multilingual)
    name TEXT NOT NULL,
    subject TEXT NOT NULL CHECK (json_extract(subject, '$.en') IS NOT NULL), -- JSON: {"en": "Subject", "de": "Betreff"}
    preheader TEXT CHECK (preheader IS NULL OR json_extract(preheader, '$.en') IS NOT NULL), -- JSON: {"en": "Preview", "de": "Vorschau"}
    
    -- Content (PortableText Multilingual)
    html_content TEXT CHECK (html_content IS NULL OR json_extract(html_content, '$.en') IS NOT NULL), -- PortableText JSON: serialized to HTML per language
    text_content TEXT CHECK (text_content IS NULL OR json_extract(text_content, '$.en') IS NOT NULL), -- PortableText JSON: serialized to plain text per language
    portable_content TEXT CHECK (portable_content IS NULL OR json_extract(portable_content, '$.en') IS NOT NULL), -- PortableText JSON: {"en": [...blocks], "de": [...blocks]}
    template_id INTEGER,
    
    -- Recipients
    recipient_type TEXT NOT NULL DEFAULT 'list' CHECK (recipient_type IN ('list', 'segment', 'individual')),
    recipient_config TEXT, -- JSON: recipient selection criteria
    
    -- Scheduling
    send_at DATETIME,
    
    -- Status
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'scheduled', 'sending', 'sent', 'failed')),
    
    -- Analytics
    total_recipients INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    emails_delivered INTEGER DEFAULT 0,
    emails_bounced INTEGER DEFAULT 0,
    opens_total INTEGER DEFAULT 0,
    clicks_total INTEGER DEFAULT 0,
    unsubscribes INTEGER DEFAULT 0,
    
    -- Management
    created_by INTEGER NOT NULL,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    sent_at DATETIME,
    deleted_at DATETIME,
    
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
);

-- Indexes for email_campaigns
CREATE INDEX idx_email_campaigns_status ON email_campaigns(status);
CREATE INDEX idx_email_campaigns_send_at ON email_campaigns(send_at);
CREATE INDEX idx_email_campaigns_created_by ON email_campaigns(created_by);
```

#### `email_templates`
Reusable email templates for campaigns.

```sql
CREATE TABLE email_templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Template Information (PortableText Multilingual)
    name TEXT NOT NULL,
    description TEXT CHECK (description IS NULL OR json_extract(description, '$.en') IS NOT NULL), -- PortableText JSON: multilingual description
    category TEXT, -- newsletter, promotional, transactional, welcome
    
    -- Content (PortableText Multilingual templates)
    subject_template TEXT CHECK (subject_template IS NULL OR json_extract(subject_template, '$.en') IS NOT NULL), -- JSON: multilingual subject
    html_template TEXT NOT NULL CHECK (json_extract(html_template, '$.en') IS NOT NULL), -- PortableText JSON: serialized to HTML per language
    text_template TEXT CHECK (text_template IS NULL OR json_extract(text_template, '$.en') IS NOT NULL), -- PortableText JSON: serialized to plain text per language
    portable_template TEXT CHECK (portable_template IS NULL OR json_extract(portable_template, '$.en') IS NOT NULL), -- PortableText JSON: {"en": [...blocks], "de": [...blocks]}
    
    -- Template Variables
    variables TEXT, -- JSON array of available template variables
    
    -- Usage Tracking
    usage_count INTEGER DEFAULT 0,
    last_used_at DATETIME,
    
    -- Management
    created_by INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT 1,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
);

-- Indexes for email_templates
CREATE INDEX idx_email_templates_category ON email_templates(category);
CREATE INDEX idx_email_templates_active ON email_templates(is_active);
CREATE INDEX idx_email_templates_created_by ON email_templates(created_by);
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

admin_users (1) → (N) translations (translator/reviewer)
translations (N) → translation_memory (via text matching)
```

## Language-Specific Views

### Content Views for Each Language
```sql
-- English content view for pages (with PortableText serialization)
CREATE VIEW pages_en AS
SELECT 
    id,
    slug,
    json_extract(title, '$.en') as title,
    json_extract(content, '$.en') as content, -- PortableText JSON
    json_extract(excerpt, '$.en') as excerpt, -- PortableText JSON
    json_extract(meta_description, '$.en') as meta_description,
    json_extract(seo_title, '$.en') as seo_title,
    json_extract(seo_keywords, '$.en') as seo_keywords,
    template,
    status,
    is_featured,
    sort_order,
    canonical_url,
    published_at,
    author_id,
    created_at,
    updated_at
FROM pages
WHERE deleted_at IS NULL;

-- German content view for pages (with PortableText fallback)
CREATE VIEW pages_de AS
SELECT 
    id,
    slug,
    COALESCE(json_extract(title, '$.de'), json_extract(title, '$.en')) as title,
    COALESCE(json_extract(content, '$.de'), json_extract(content, '$.en')) as content, -- PortableText JSON with fallback
    COALESCE(json_extract(excerpt, '$.de'), json_extract(excerpt, '$.en')) as excerpt, -- PortableText JSON with fallback
    COALESCE(json_extract(meta_description, '$.de'), json_extract(meta_description, '$.en')) as meta_description,
    COALESCE(json_extract(seo_title, '$.de'), json_extract(seo_title, '$.en')) as seo_title,
    COALESCE(json_extract(seo_keywords, '$.de'), json_extract(seo_keywords, '$.en')) as seo_keywords,
    template,
    status,
    is_featured,
    sort_order,
    canonical_url,
    published_at,
    author_id,
    created_at,
    updated_at
FROM pages
WHERE deleted_at IS NULL;

-- Similar views for webinars (with PortableText)
CREATE VIEW webinars_en AS
SELECT 
    id,
    slug,
    json_extract(title, '$.en') as title,
    json_extract(description, '$.en') as description, -- PortableText JSON
    json_extract(presenter_bio, '$.en') as presenter_bio, -- PortableText JSON
    scheduled_at,
    duration_minutes,
    timezone,
    max_participants,
    meeting_url,
    recording_url,
    status,
    presenter_name
FROM webinars
WHERE deleted_at IS NULL;

CREATE VIEW webinars_de AS
SELECT 
    id,
    slug,
    COALESCE(json_extract(title, '$.de'), json_extract(title, '$.en')) as title,
    COALESCE(json_extract(description, '$.de'), json_extract(description, '$.en')) as description, -- PortableText JSON with fallback
    COALESCE(json_extract(presenter_bio, '$.de'), json_extract(presenter_bio, '$.en')) as presenter_bio, -- PortableText JSON with fallback
    scheduled_at,
    duration_minutes,
    timezone,
    max_participants,
    meeting_url,
    recording_url,
    status,
    presenter_name
FROM webinars
WHERE deleted_at IS NULL;

-- Similar views for whitepapers (with PortableText)
CREATE VIEW whitepapers_en AS
SELECT 
    id,
    slug,
    json_extract(title, '$.en') as title,
    json_extract(description, '$.en') as description, -- PortableText JSON
    json_extract(preview_content, '$.en') as preview_content, -- PortableText JSON
    json_extract(meta_title, '$.en') as meta_title,
    json_extract(meta_description, '$.en') as meta_description,
    file_id,
    category,
    status,
    featured,
    download_count,
    view_count
FROM whitepapers
WHERE deleted_at IS NULL;

CREATE VIEW whitepapers_de AS
SELECT 
    id,
    slug,
    COALESCE(json_extract(title, '$.de'), json_extract(title, '$.en')) as title,
    COALESCE(json_extract(description, '$.de'), json_extract(description, '$.en')) as description, -- PortableText JSON with fallback
    COALESCE(json_extract(preview_content, '$.de'), json_extract(preview_content, '$.en')) as preview_content, -- PortableText JSON with fallback
    COALESCE(json_extract(meta_title, '$.de'), json_extract(meta_title, '$.en')) as meta_title,
    COALESCE(json_extract(meta_description, '$.de'), json_extract(meta_description, '$.en')) as meta_description,
    file_id,
    category,
    status,
    featured,
    download_count,
    view_count
FROM whitepapers
WHERE deleted_at IS NULL;
```

## Performance Optimization

### Indexing Strategy
- **Primary Keys**: Auto-increment integers for optimal performance
- **Foreign Keys**: Indexed for join performance
- **Search Fields**: Email, slug, status fields indexed
- **Temporal Data**: Created/updated timestamps indexed for sorting
- **Full-Text Search**: Language-specific FTS5 virtual tables for content search
- **JSON Fields**: Indexed extraction of frequently accessed language keys
- **Translation Keys**: Composite indexes on namespace and key for fast lookups

### Query Optimization
```sql
-- Example optimized queries

-- Get published pages with pagination
SELECT id, slug, title, excerpt, published_at 
FROM pages 
WHERE status = 'published' AND deleted_at IS NULL 
ORDER BY published_at DESC 
LIMIT 20 OFFSET 0;

-- Search pages content in English
SELECT p.id, json_extract(p.title, '$.en') as title, p.slug
FROM pages p
JOIN pages_fts_en fts ON p.id = fts.rowid
WHERE fts.title MATCH 'search term' OR fts.content MATCH 'search term'
AND p.status = 'published'
ORDER BY rank;

-- Search pages content in German with fallback
SELECT p.id, 
       COALESCE(json_extract(p.title, '$.de'), json_extract(p.title, '$.en')) as title, 
       p.slug
FROM pages p
LEFT JOIN pages_fts_de fts_de ON p.id = fts_de.rowid
LEFT JOIN pages_fts_en fts_en ON p.id = fts_en.rowid
WHERE (fts_de.title MATCH 'suchbegriff' OR fts_de.content MATCH 'suchbegriff'
       OR fts_en.title MATCH 'suchbegriff' OR fts_en.content MATCH 'suchbegriff')
AND p.status = 'published'
ORDER BY rank;

-- Get translation for a specific key
SELECT translated_text
FROM translations
WHERE namespace = 'ui' 
AND key = 'welcome_message'
AND target_language = 'de'
AND status = 'approved';

-- Get webinar registrations with multilingual title
SELECT 
    COALESCE(json_extract(w.title, '$.de'), json_extract(w.title, '$.en')) as title,
    wr.first_name, wr.last_name, wr.email, wr.registered_at
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
cp data/magnetiq.db data/backups/magnetiq_backup_$(date +%Y%m%d_%H%M%S).db

# Backup with SQLite dump
sqlite3 data/magnetiq.db .dump > data/backups/magnetiq_backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
sqlite3 data/magnetiq.db .dump | gzip > data/backups/magnetiq_backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Recovery Procedures
```bash
# Restore from file backup
cp data/backups/magnetiq_backup_20240101_120000.db data/magnetiq.db

# Restore from SQL dump
sqlite3 data/magnetiq_restored.db < data/backups/magnetiq_backup_20240101_120000.sql

# Verify database integrity
sqlite3 data/magnetiq.db "PRAGMA integrity_check;"
```

## PortableText Implementation

### PortableText Helper Functions

Since SQLite doesn't have native PortableText support, we implement helper functions for common operations:

```python
# Helper functions for PortableText processing in application layer
def portable_text_to_plain_text(portable_text_json: str) -> str:
    """Extract plain text from PortableText JSON for FTS indexing"""
    if not portable_text_json:
        return ''
    
    try:
        blocks = json.loads(portable_text_json)
        text_parts = []
        
        for block in blocks:
            if block.get('_type') == 'block':
                # Extract text from spans within the block
                children = block.get('children', [])
                for child in children:
                    if child.get('_type') == 'span':
                        text_parts.append(child.get('text', ''))
            elif block.get('_type') == 'heading':
                # Handle heading blocks
                text_parts.append(block.get('text', ''))
        
        return ' '.join(text_parts)
    except (json.JSONDecodeError, TypeError):
        return ''

def validate_portable_text_structure(portable_text_json: str) -> bool:
    """Validate that JSON follows PortableText specification"""
    try:
        blocks = json.loads(portable_text_json)
        if not isinstance(blocks, list):
            return False
        
        for block in blocks:
            # Each block must have _type
            if '_type' not in block:
                return False
            
            # Block type validation
            block_type = block['_type']
            if block_type == 'block':
                # Block must have children array
                if 'children' not in block or not isinstance(block['children'], list):
                    return False
                
                # Validate spans within block
                for child in block['children']:
                    if '_type' not in child or child['_type'] != 'span':
                        return False
                    if 'text' not in child:
                        return False
        
        return True
    except (json.JSONDecodeError, TypeError, KeyError):
        return False

def serialize_portable_text_to_html(portable_text_json: str) -> str:
    """Serialize PortableText to HTML for frontend rendering"""
    # Implementation would use a PortableText serializer library
    # This is a simplified example
    pass

def serialize_portable_text_to_markdown(portable_text_json: str) -> str:
    """Serialize PortableText to Markdown for exports"""
    # Implementation would use a PortableText serializer library
    pass
```

### PortableText Schema Definition

#### Core Block Types

```typescript
// Standard PortableText block types used in Magnetiq
interface PortableTextBlock {
  _type: string;
  _key: string;
}

// Text block with formatting
interface TextBlock extends PortableTextBlock {
  _type: 'block';
  style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';
  children: Span[];
  markDefs?: MarkDefinition[];
  level?: number; // for list items
  listItem?: 'bullet' | 'number';
}

// Inline text span
interface Span {
  _type: 'span';
  text: string;
  marks?: string[]; // References to mark definitions
}

// Mark definitions for links, formatting, etc.
interface MarkDefinition {
  _type: string;
  _key: string;
}

// Link mark
interface LinkMark extends MarkDefinition {
  _type: 'link';
  href: string;
  title?: string;
  target?: '_blank' | '_self';
}
```

#### Custom Block Types for Magnetiq

```typescript
// Call-to-action block
interface CTABlock extends PortableTextBlock {
  _type: 'cta';
  text: string;
  url: string;
  style: 'primary' | 'secondary' | 'outline';
  size: 'small' | 'medium' | 'large';
}

// Video embed block
interface VideoBlock extends PortableTextBlock {
  _type: 'video';
  url: string;
  title?: string;
  thumbnail?: string;
  autoplay?: boolean;
  controls?: boolean;
}

// Image block with enhanced metadata
interface ImageBlock extends PortableTextBlock {
  _type: 'image';
  asset: {
    _ref: string; // Reference to media_files table
    _type: 'reference';
  };
  alt: string;
  caption?: string;
  crop?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

// Form embed block
interface FormBlock extends PortableTextBlock {
  _type: 'form';
  formType: 'contact' | 'newsletter' | 'booking' | 'whitepaper';
  formId?: string;
  title?: string;
  description?: string;
}

// SEO/Metadata block (admin use)
interface SEOBlock extends PortableTextBlock {
  _type: 'seo';
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
}

// Code block for technical content
interface CodeBlock extends PortableTextBlock {
  _type: 'code';
  language: string;
  code: string;
  filename?: string;
  highlightLines?: number[];
}
```

### PortableText Validation Triggers

```sql
-- Trigger to validate PortableText JSON structure
CREATE TRIGGER validate_portable_text_pages
BEFORE INSERT ON pages
BEGIN
  SELECT CASE
    WHEN json_valid(NEW.content) = 0 THEN
      RAISE(ABORT, 'Invalid JSON in PortableText content field')
    WHEN NOT is_valid_portable_text(NEW.content) THEN
      RAISE(ABORT, 'Invalid PortableText structure in content field')
  END;
END;

-- Note: is_valid_portable_text() would be implemented as a custom SQLite function
-- or validated at the application layer before database insertion
```

## Multilingual Validation Triggers

### JSON Structure Validation
```sql
-- Trigger to validate multilingual JSON structure on insert/update
CREATE TRIGGER validate_multilingual_json_pages
BEFORE INSERT ON pages
BEGIN
  SELECT CASE
    WHEN json_valid(NEW.title) = 0 THEN
      RAISE(ABORT, 'Invalid JSON in title field')
    WHEN json_valid(NEW.content) = 0 THEN
      RAISE(ABORT, 'Invalid JSON in content field')
    WHEN NEW.excerpt IS NOT NULL AND json_valid(NEW.excerpt) = 0 THEN
      RAISE(ABORT, 'Invalid JSON in excerpt field')
  END;
END;

-- Trigger to ensure English content is always present
CREATE TRIGGER ensure_english_content_pages
BEFORE INSERT ON pages
BEGIN
  SELECT CASE
    WHEN json_extract(NEW.title, '$.en') IS NULL THEN
      RAISE(ABORT, 'English title is required')
    WHEN json_extract(NEW.content, '$.en') IS NULL THEN
      RAISE(ABORT, 'English content is required')
  END;
END;

-- Similar triggers for webinars
CREATE TRIGGER validate_multilingual_json_webinars
BEFORE INSERT ON webinars
BEGIN
  SELECT CASE
    WHEN json_valid(NEW.title) = 0 THEN
      RAISE(ABORT, 'Invalid JSON in webinar title')
    WHEN NEW.description IS NOT NULL AND json_valid(NEW.description) = 0 THEN
      RAISE(ABORT, 'Invalid JSON in webinar description')
    WHEN json_extract(NEW.title, '$.en') IS NULL THEN
      RAISE(ABORT, 'English webinar title is required')
  END;
END;

-- Translation completeness tracking
CREATE TRIGGER update_translation_status
AFTER UPDATE OF translated_text ON translations
WHEN NEW.translated_text IS NOT NULL AND OLD.translated_text IS NULL
BEGIN
  UPDATE translations
  SET status = 'translated',
      translated_at = CURRENT_TIMESTAMP
  WHERE id = NEW.id;
END;
```

### Multilingual Content Helpers
```sql
-- Function to check if content is fully translated
-- SQLite doesn't support stored functions, but this can be used as a pattern
-- for application-level implementation

-- View to identify missing PortableText translations
CREATE VIEW missing_translations AS
SELECT 
    'pages' as table_name,
    id,
    slug,
    CASE 
        WHEN json_extract(title, '$.de') IS NULL THEN 'title'
        WHEN json_extract(content, '$.de') IS NULL THEN 'content (PortableText)'
        WHEN json_extract(excerpt, '$.de') IS NOT NULL AND json_extract(excerpt, '$.de') IS NULL THEN 'excerpt (PortableText)'
    END as missing_field
FROM pages
WHERE status = 'published'
  AND (json_extract(title, '$.de') IS NULL 
       OR json_extract(content, '$.de') IS NULL)

UNION ALL

SELECT 
    'webinars' as table_name,
    id,
    slug,
    CASE 
        WHEN json_extract(title, '$.de') IS NULL THEN 'title'
        WHEN json_extract(description, '$.de') IS NULL THEN 'description'
    END as missing_field
FROM webinars
WHERE status IN ('scheduled', 'live')
  AND (json_extract(title, '$.de') IS NULL 
       OR json_extract(description, '$.de') IS NULL);

-- View for translation coverage statistics
CREATE VIEW translation_coverage AS
SELECT 
    'overall' as scope,
    COUNT(*) as total_content,
    SUM(CASE WHEN json_extract(title, '$.de') IS NOT NULL THEN 1 ELSE 0 END) as translated_titles,
    SUM(CASE WHEN json_extract(content, '$.de') IS NOT NULL THEN 1 ELSE 0 END) as translated_content,
    ROUND(100.0 * SUM(CASE WHEN json_extract(title, '$.de') IS NOT NULL 
                       AND json_extract(content, '$.de') IS NOT NULL THEN 1 ELSE 0 END) / COUNT(*), 2) as coverage_percentage
FROM pages
WHERE status = 'published' AND deleted_at IS NULL;
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
    db_path = "data/magnetiq.db"
    
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
        "admin@voltAIc.systems",
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
    conn = sqlite3.connect("data/magnetiq.db")
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

## Consultants & Expert Network

### Core Consultant Tables

#### `consultants`
Core consultant profiles with comprehensive professional information and payment details.
→ **Related to**: [Consultant Personas](../users/knowhow-bearer.md) and [B2B Buyer Personas](../users/)
← **Used by**: [Booking System](../frontend/public/features/booking.md), [Admin Panel](../frontend/adminpanel/admin.md)

```sql
CREATE TABLE consultants (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Personal Information (with multilingual support)
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    display_name TEXT, -- Public-facing name if different
    bio TEXT CHECK (bio IS NULL OR json_extract(bio, '$.en') IS NOT NULL), -- PortableText JSON: {"en": [...blocks], "de": [...blocks]}
    profile_image_id INTEGER,
    
    -- Professional Information
    job_title TEXT CHECK (job_title IS NULL OR json_extract(job_title, '$.en') IS NOT NULL), -- JSON: {"en": "Title", "de": "Titel"}
    company TEXT,
    industry TEXT, -- JSON array of industries
    expertise_areas TEXT NOT NULL, -- JSON array of expertise areas
    years_experience INTEGER,
    
    -- Location & Languages
    country TEXT, -- ISO country code
    timezone TEXT DEFAULT 'UTC',
    languages_spoken TEXT, -- JSON array: ["en", "de", "fr"]
    
    -- Contact Information
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    
    -- Professional Links
    linkedin_url TEXT,
    twitter_url TEXT,
    website_url TEXT,
    github_url TEXT,
    
    -- Platform Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'suspended', 'inactive')),
    onboarded_at DATETIME,
    last_active_at DATETIME,
    
    -- Pricing & Availability
    hourly_rate_usd DECIMAL(10,2), -- Base hourly rate in USD
    minimum_booking_hours INTEGER DEFAULT 1,
    max_weekly_hours INTEGER,
    availability_calendar_url TEXT, -- Integration with external calendars
    
    -- Rating & Performance
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    total_sessions INTEGER DEFAULT 0,
    total_revenue_usd DECIMAL(10,2) DEFAULT 0.0,
    
    -- Platform Configuration
    profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'private', 'platform_only')),
    auto_accept_bookings BOOLEAN DEFAULT 0,
    lead_generation_enabled BOOLEAN DEFAULT 1,
    
    -- KYC & Verification
    identity_verified BOOLEAN DEFAULT 0,
    tax_id TEXT, -- Encrypted tax identification
    kyc_status TEXT DEFAULT 'not_started' CHECK (kyc_status IN ('not_started', 'pending', 'approved', 'rejected')),
    kyc_verified_at DATETIME,
    
    -- Platform Management
    created_by INTEGER, -- Admin who approved/added
    notes TEXT, -- Internal admin notes
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    FOREIGN KEY (profile_image_id) REFERENCES media_files(id),
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
);

-- Indexes for consultants
CREATE INDEX idx_consultants_email ON consultants(email);
CREATE INDEX idx_consultants_status ON consultants(status);
CREATE INDEX idx_consultants_industry ON consultants(industry);
CREATE INDEX idx_consultants_rating ON consultants(average_rating);
CREATE INDEX idx_consultants_created ON consultants(created_at);
CREATE INDEX idx_consultants_visibility ON consultants(profile_visibility);

-- Full-text search for consultant expertise and bio
CREATE VIRTUAL TABLE consultants_fts_en USING fts5(
    first_name, last_name, display_name, bio, expertise_areas,
    tokenize='porter'
);

CREATE VIRTUAL TABLE consultants_fts_de USING fts5(
    first_name, last_name, display_name, bio, expertise_areas,
    tokenize='porter'
);

-- FTS synchronization triggers for consultants
CREATE TRIGGER consultants_fts_en_ai AFTER INSERT ON consultants BEGIN
  INSERT INTO consultants_fts_en(rowid, first_name, last_name, display_name, bio, expertise_areas) 
  VALUES (
    new.id, 
    new.first_name,
    new.last_name,
    new.display_name,
    portable_text_to_plain_text(json_extract(new.bio, '$.en')),
    json_extract(new.expertise_areas, '$')
  );
END;

CREATE TRIGGER consultants_fts_de_ai AFTER INSERT ON consultants 
WHEN json_extract(new.bio, '$.de') IS NOT NULL BEGIN
  INSERT INTO consultants_fts_de(rowid, first_name, last_name, display_name, bio, expertise_areas) 
  VALUES (
    new.id, 
    new.first_name,
    new.last_name,
    new.display_name,
    portable_text_to_plain_text(json_extract(new.bio, '$.de')),
    json_extract(new.expertise_areas, '$')
  );
END;

CREATE TRIGGER consultants_fts_en_ad AFTER DELETE ON consultants BEGIN
  DELETE FROM consultants_fts_en WHERE rowid = old.id;
END;

CREATE TRIGGER consultants_fts_de_ad AFTER DELETE ON consultants BEGIN
  DELETE FROM consultants_fts_de WHERE rowid = old.id;
END;

CREATE TRIGGER consultants_fts_en_au AFTER UPDATE ON consultants BEGIN
  UPDATE consultants_fts_en SET 
    first_name = new.first_name,
    last_name = new.last_name,
    display_name = new.display_name,
    bio = portable_text_to_plain_text(json_extract(new.bio, '$.en')),
    expertise_areas = json_extract(new.expertise_areas, '$')
  WHERE rowid = new.id;
END;

CREATE TRIGGER consultants_fts_de_au AFTER UPDATE ON consultants 
WHEN json_extract(new.bio, '$.de') IS NOT NULL BEGIN
  UPDATE consultants_fts_de SET 
    first_name = new.first_name,
    last_name = new.last_name,
    display_name = new.display_name,
    bio = portable_text_to_plain_text(json_extract(new.bio, '$.de')),
    expertise_areas = json_extract(new.expertise_areas, '$')
  WHERE rowid = new.id;
END;
```

#### `consultant_whitepapers`
Many-to-many relationship between consultants and whitepapers they've authored or contributed to.
→ **Links**: [Whitepapers Table](#whitepapers) ↔ [Consultants Table](#consultants)
← **Enables**: [Expert Content Attribution](../features/content-attribution.md), [Consultant Portfolio](../features/consultant-portfolio.md)

```sql
CREATE TABLE consultant_whitepapers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consultant_id INTEGER NOT NULL,
    whitepaper_id INTEGER NOT NULL,
    
    -- Contribution Details
    role TEXT NOT NULL DEFAULT 'author' CHECK (role IN ('author', 'co-author', 'reviewer', 'contributor')),
    contribution_description TEXT CHECK (contribution_description IS NULL OR json_extract(contribution_description, '$.en') IS NOT NULL), -- PortableText JSON
    order_index INTEGER DEFAULT 0, -- For multiple authors ordering
    
    -- Attribution Settings
    display_on_profile BOOLEAN DEFAULT 1,
    featured_on_profile BOOLEAN DEFAULT 0,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE,
    FOREIGN KEY (whitepaper_id) REFERENCES whitepapers(id) ON DELETE CASCADE,
    UNIQUE(consultant_id, whitepaper_id, role)
);

-- Indexes for consultant_whitepapers
CREATE INDEX idx_consultant_whitepapers_consultant ON consultant_whitepapers(consultant_id);
CREATE INDEX idx_consultant_whitepapers_whitepaper ON consultant_whitepapers(whitepaper_id);
CREATE INDEX idx_consultant_whitepapers_role ON consultant_whitepapers(role);
CREATE INDEX idx_consultant_whitepapers_featured ON consultant_whitepapers(featured_on_profile);
```

#### `consultant_webinars`
Many-to-many relationship between consultants and webinars they present or participate in.
→ **Links**: [Webinars Table](#webinars) ↔ [Consultants Table](#consultants)
← **Supports**: [Expert Speaking Engagements](../features/speaking-engagements.md), [Webinar Attribution](../features/webinar-attribution.md)

```sql
CREATE TABLE consultant_webinars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consultant_id INTEGER NOT NULL,
    webinar_id INTEGER NOT NULL,
    
    -- Participation Details
    role TEXT NOT NULL DEFAULT 'presenter' CHECK (role IN ('presenter', 'co-presenter', 'moderator', 'panelist', 'guest')),
    presentation_title TEXT CHECK (presentation_title IS NULL OR json_extract(presentation_title, '$.en') IS NOT NULL), -- JSON multilingual
    presentation_order INTEGER DEFAULT 0,
    
    -- Compensation
    fee_usd DECIMAL(10,2), -- Speaking fee in USD
    fee_paid BOOLEAN DEFAULT 0,
    payment_notes TEXT,
    
    -- Attribution Settings
    display_on_profile BOOLEAN DEFAULT 1,
    featured_on_profile BOOLEAN DEFAULT 0,
    
    -- Performance Tracking
    audience_feedback_score DECIMAL(3,2), -- Average feedback score for this presenter
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE,
    FOREIGN KEY (webinar_id) REFERENCES webinars(id) ON DELETE CASCADE,
    UNIQUE(consultant_id, webinar_id, role)
);

-- Indexes for consultant_webinars
CREATE INDEX idx_consultant_webinars_consultant ON consultant_webinars(consultant_id);
CREATE INDEX idx_consultant_webinars_webinar ON consultant_webinars(webinar_id);
CREATE INDEX idx_consultant_webinars_role ON consultant_webinars(role);
CREATE INDEX idx_consultant_webinars_featured ON consultant_webinars(featured_on_profile);
CREATE INDEX idx_consultant_webinars_fee_paid ON consultant_webinars(fee_paid);
```

#### `consultant_bookings`
Enhanced booking system specifically for consultant sessions with payment tracking.
→ **Extends**: [Base Bookings Table](#bookings)
← **Integrates**: [Payment System](../integrations/payment-processing.md), [Calendar Integration](../integrations/calendar.md)

```sql
CREATE TABLE consultant_bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consultant_id INTEGER NOT NULL,
    
    -- Client Information
    client_first_name TEXT NOT NULL,
    client_last_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    client_company TEXT,
    client_job_title TEXT,
    client_phone TEXT,
    client_linkedin_url TEXT,
    
    -- Session Details
    session_type TEXT NOT NULL DEFAULT 'consultation' CHECK (session_type IN ('consultation', 'advisory', 'workshop', 'interview', 'review')),
    session_title TEXT CHECK (session_title IS NULL OR json_extract(session_title, '$.en') IS NOT NULL), -- JSON multilingual
    session_description TEXT CHECK (session_description IS NULL OR json_extract(session_description, '$.en') IS NOT NULL), -- PortableText JSON
    
    -- Scheduling
    scheduled_start DATETIME NOT NULL,
    scheduled_end DATETIME NOT NULL,
    actual_start DATETIME,
    actual_end DATETIME,
    timezone TEXT DEFAULT 'UTC',
    meeting_platform TEXT DEFAULT 'zoom' CHECK (meeting_platform IN ('zoom', 'teams', 'meet', 'phone', 'in_person')),
    meeting_url TEXT,
    meeting_id TEXT,
    meeting_password TEXT,
    
    -- Pricing & Payment
    hourly_rate_usd DECIMAL(10,2) NOT NULL,
    total_hours DECIMAL(4,2) NOT NULL,
    subtotal_usd DECIMAL(10,2) NOT NULL, -- hours * rate
    
    -- Coupon Integration
    coupon_id INTEGER, -- Applied coupon (if any)
    original_total_usd DECIMAL(10,2), -- Price before coupon discount
    coupon_discount_usd DECIMAL(10,2) DEFAULT 0.0, -- Amount discounted by coupon
    coupon_code_used TEXT, -- Store the actual code used (for reporting)
    
    platform_fee_usd DECIMAL(10,2) NOT NULL, -- 15% platform fee (calculated after discount)
    consultant_payout_usd DECIMAL(10,2) NOT NULL, -- 85% to consultant (calculated after discount)
    total_amount_usd DECIMAL(10,2) NOT NULL, -- Final amount charged to client (after discount)
    currency_used TEXT DEFAULT 'USD',
    
    -- Payment Processing
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded', 'disputed')),
    payment_intent_id TEXT, -- Stripe/payment processor ID
    payment_method TEXT, -- card, bank_transfer, etc.
    payment_completed_at DATETIME,
    refund_amount_usd DECIMAL(10,2) DEFAULT 0.0,
    refund_reason TEXT,
    
    -- Session Status
    booking_status TEXT NOT NULL DEFAULT 'pending' CHECK (booking_status IN ('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show_client', 'no_show_consultant')),
    confirmation_sent_at DATETIME,
    reminder_sent_at DATETIME,
    
    -- Session Outcomes
    session_summary TEXT CHECK (session_summary IS NULL OR json_extract(session_summary, '$.en') IS NOT NULL), -- PortableText JSON
    action_items TEXT, -- JSON array of action items
    follow_up_required BOOLEAN DEFAULT 0,
    follow_up_completed_at DATETIME,
    
    -- Ratings & Feedback
    client_rating INTEGER CHECK (client_rating IS NULL OR (client_rating >= 1 AND client_rating <= 5)),
    client_feedback TEXT CHECK (client_feedback IS NULL OR json_extract(client_feedback, '$.en') IS NOT NULL), -- PortableText JSON
    consultant_rating INTEGER CHECK (consultant_rating IS NULL OR (consultant_rating >= 1 AND consultant_rating <= 5)),
    consultant_feedback TEXT CHECK (consultant_feedback IS NULL OR json_extract(consultant_feedback, '$.en') IS NOT NULL), -- PortableText JSON
    
    -- Business Intelligence
    lead_source TEXT, -- website, referral, campaign, linkedin
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    client_company_size TEXT, -- startup, sme, enterprise
    project_budget_range TEXT,
    urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'urgent')),
    
    -- Internal Management
    internal_notes TEXT, -- Admin notes not visible to client/consultant
    assigned_success_manager INTEGER, -- Admin user managing this booking
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    cancelled_at DATETIME,
    deleted_at DATETIME,
    
    FOREIGN KEY (consultant_id) REFERENCES consultants(id),
    FOREIGN KEY (assigned_success_manager) REFERENCES admin_users(id),
    FOREIGN KEY (coupon_id) REFERENCES coupons(id)
);

-- Indexes for consultant_bookings
CREATE INDEX idx_consultant_bookings_consultant ON consultant_bookings(consultant_id);
CREATE INDEX idx_consultant_bookings_client_email ON consultant_bookings(client_email);
CREATE INDEX idx_consultant_bookings_status ON consultant_bookings(booking_status);
CREATE INDEX idx_consultant_bookings_payment_status ON consultant_bookings(payment_status);
CREATE INDEX idx_consultant_bookings_scheduled_start ON consultant_bookings(scheduled_start);
CREATE INDEX idx_consultant_bookings_lead_source ON consultant_bookings(lead_source);
CREATE INDEX idx_consultant_bookings_created ON consultant_bookings(created_at);
CREATE INDEX idx_consultant_bookings_coupon ON consultant_bookings(coupon_id);
CREATE INDEX idx_consultant_bookings_coupon_code ON consultant_bookings(coupon_code_used);
```

#### `consultant_offerings`
Standardized service offerings like "30-for-30" with predefined pricing and descriptions.
→ **Supports**: [Service Packages](../features/service-packages.md), [Pricing Strategy](../features/pricing-strategy.md)
← **Referenced by**: [Booking Flow](../frontend/public/features/booking.md), [Consultant Profiles](../features/consultant-profiles.md)

```sql
CREATE TABLE consultant_offerings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consultant_id INTEGER NOT NULL,
    
    -- Offering Details (multilingual)
    name TEXT NOT NULL CHECK (json_extract(name, '$.en') IS NOT NULL), -- JSON: {"en": "30-for-30 Strategy Session", "de": "30-für-30 Strategie-Sitzung"}
    short_description TEXT CHECK (short_description IS NULL OR json_extract(short_description, '$.en') IS NOT NULL), -- JSON multilingual
    description TEXT NOT NULL CHECK (json_extract(description, '$.en') IS NOT NULL), -- PortableText JSON: {"en": [...blocks], "de": [...blocks]}
    
    -- Service Configuration
    offering_type TEXT NOT NULL DEFAULT 'session' CHECK (offering_type IN ('session', 'package', 'retainer', 'workshop', 'course')),
    duration_minutes INTEGER NOT NULL,
    max_participants INTEGER DEFAULT 1,
    
    -- Pricing
    price_usd DECIMAL(10,2) NOT NULL,
    original_price_usd DECIMAL(10,2), -- If discounted
    currency TEXT DEFAULT 'USD',
    pricing_model TEXT DEFAULT 'fixed' CHECK (pricing_model IN ('fixed', 'hourly', 'per_participant')),
    
    -- Availability
    is_active BOOLEAN DEFAULT 1,
    available_slots_per_week INTEGER DEFAULT 5,
    advance_booking_days INTEGER DEFAULT 1, -- Minimum days in advance
    max_advance_booking_days INTEGER DEFAULT 60, -- Maximum days in advance
    
    -- Booking Rules
    requires_approval BOOLEAN DEFAULT 0,
    auto_confirm BOOLEAN DEFAULT 1,
    cancellation_hours INTEGER DEFAULT 24, -- Hours before session for free cancellation
    reschedule_hours INTEGER DEFAULT 12, -- Hours before session for free reschedule
    
    -- Content & Materials
    includes_materials BOOLEAN DEFAULT 0,
    materials_description TEXT CHECK (materials_description IS NULL OR json_extract(materials_description, '$.en') IS NOT NULL), -- PortableText JSON
    preparation_required BOOLEAN DEFAULT 0,
    preparation_instructions TEXT CHECK (preparation_instructions IS NULL OR json_extract(preparation_instructions, '$.en') IS NOT NULL), -- PortableText JSON
    
    -- Performance Metrics
    total_bookings INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0.0,
    total_revenue_usd DECIMAL(10,2) DEFAULT 0.0,
    
    -- SEO & Marketing
    slug TEXT UNIQUE, -- URL-friendly identifier
    featured BOOLEAN DEFAULT 0,
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE
);

-- Indexes for consultant_offerings
CREATE INDEX idx_consultant_offerings_consultant ON consultant_offerings(consultant_id);
CREATE INDEX idx_consultant_offerings_type ON consultant_offerings(offering_type);
CREATE INDEX idx_consultant_offerings_active ON consultant_offerings(is_active);
CREATE INDEX idx_consultant_offerings_featured ON consultant_offerings(featured);
CREATE INDEX idx_consultant_offerings_slug ON consultant_offerings(slug);
CREATE INDEX idx_consultant_offerings_price ON consultant_offerings(price_usd);
```

#### `consultant_payment_accounts`
Bank account and KYC information for consultant payments.
→ **Integrates**: [Payment Processing](../integrations/payment-processing.md), [KYC Compliance](../privacy-compliance.md#kyc)
⚡ **Security**: Encrypted sensitive financial data, [Security Policies](../security.md#financial-data)

```sql
CREATE TABLE consultant_payment_accounts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consultant_id INTEGER NOT NULL,
    
    -- Account Type
    account_type TEXT NOT NULL DEFAULT 'bank' CHECK (account_type IN ('bank', 'paypal', 'wise', 'crypto')),
    account_name TEXT NOT NULL, -- Account holder name
    is_primary BOOLEAN DEFAULT 0, -- Primary payment account
    
    -- Bank Account Details (encrypted)
    bank_name TEXT,
    account_number_encrypted TEXT, -- Encrypted account number
    routing_number_encrypted TEXT, -- Encrypted routing/sort code
    iban_encrypted TEXT, -- Encrypted IBAN for international accounts
    swift_code TEXT,
    
    -- Alternative Payment Methods
    paypal_email_encrypted TEXT, -- Encrypted PayPal email
    wise_account_id_encrypted TEXT, -- Encrypted Wise account ID
    crypto_wallet_address_encrypted TEXT, -- Encrypted crypto wallet
    crypto_currency TEXT, -- BTC, ETH, USDC, etc.
    
    -- Account Location
    account_country TEXT NOT NULL, -- ISO country code
    account_currency TEXT NOT NULL DEFAULT 'USD',
    
    -- KYC & Verification
    verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'in_progress', 'verified', 'rejected')),
    verification_documents TEXT, -- JSON array of uploaded document IDs
    verification_notes TEXT, -- Internal verification notes
    verified_at DATETIME,
    verified_by INTEGER, -- Admin user who verified
    
    -- Compliance
    tax_form_submitted BOOLEAN DEFAULT 0,
    tax_form_type TEXT, -- W9, W8-BEN, etc.
    tax_form_file_id INTEGER, -- Reference to media_files
    sanctions_check_status TEXT DEFAULT 'pending' CHECK (sanctions_check_status IN ('pending', 'clear', 'flagged')),
    sanctions_checked_at DATETIME,
    
    -- Account Status
    is_active BOOLEAN DEFAULT 1,
    is_verified BOOLEAN DEFAULT 0,
    last_payment_date DATETIME,
    total_payments_usd DECIMAL(12,2) DEFAULT 0.0,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE,
    FOREIGN KEY (tax_form_file_id) REFERENCES media_files(id),
    FOREIGN KEY (verified_by) REFERENCES admin_users(id),
    UNIQUE(consultant_id, account_type, is_primary) DEFERRABLE INITIALLY DEFERRED
);

-- Indexes for consultant_payment_accounts
CREATE INDEX idx_consultant_payment_accounts_consultant ON consultant_payment_accounts(consultant_id);
CREATE INDEX idx_consultant_payment_accounts_type ON consultant_payment_accounts(account_type);
CREATE INDEX idx_consultant_payment_accounts_verification ON consultant_payment_accounts(verification_status);
CREATE INDEX idx_consultant_payment_accounts_active ON consultant_payment_accounts(is_active);
CREATE INDEX idx_consultant_payment_accounts_primary ON consultant_payment_accounts(is_primary);
```

#### `consultant_payouts`
Platform fee distribution tracking (15% platform, 85% consultant).
→ **Connects**: [Financial Reconciliation](../features/financial-reconciliation.md), [Revenue Analytics](../features/revenue-analytics.md)
← **Depends**: [Payment Transactions](#payment_transactions), [Consultant Bookings](#consultant_bookings)

```sql
CREATE TABLE consultant_payouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consultant_id INTEGER NOT NULL,
    payment_account_id INTEGER NOT NULL,
    
    -- Payout Period
    payout_period_start DATE NOT NULL,
    payout_period_end DATE NOT NULL,
    
    -- Financial Breakdown
    total_earnings_usd DECIMAL(12,2) NOT NULL, -- Total consultant earnings for period
    platform_fees_usd DECIMAL(12,2) NOT NULL, -- Total platform fees (15%)
    gross_revenue_usd DECIMAL(12,2) NOT NULL, -- Total revenue before fees (earnings + fees)
    
    -- Deductions
    processing_fees_usd DECIMAL(10,2) DEFAULT 0.0, -- Payment processing costs
    tax_withholding_usd DECIMAL(10,2) DEFAULT 0.0, -- Tax withholdings if applicable
    adjustments_usd DECIMAL(10,2) DEFAULT 0.0, -- Refunds, chargebacks, bonuses
    net_payout_usd DECIMAL(12,2) NOT NULL, -- Final amount paid to consultant
    
    -- Currency & Exchange
    payout_currency TEXT DEFAULT 'USD',
    exchange_rate DECIMAL(10,6) DEFAULT 1.0, -- If paying in non-USD currency
    local_payout_amount DECIMAL(12,2), -- Amount in consultant's local currency
    
    -- Payment Processing
    payout_status TEXT NOT NULL DEFAULT 'pending' CHECK (payout_status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    payout_method TEXT NOT NULL, -- bank_transfer, paypal, wise, crypto
    transaction_reference TEXT, -- External payment system reference
    
    -- Timing
    payout_scheduled_date DATE,
    payout_processed_date DATE,
    payout_completed_date DATE,
    
    -- Session Details
    total_sessions INTEGER NOT NULL, -- Number of sessions in this payout
    session_ids TEXT, -- JSON array of consultant_booking IDs included
    
    -- Documentation
    invoice_number TEXT UNIQUE, -- Generated invoice number
    invoice_file_id INTEGER, -- PDF invoice reference
    receipt_file_id INTEGER, -- Payment receipt reference
    
    -- Tax Reporting
    tax_year INTEGER,
    tax_quarter INTEGER,
    tax_document_sent BOOLEAN DEFAULT 0,
    tax_document_file_id INTEGER,
    
    -- Internal Management
    processed_by INTEGER, -- Admin user who processed payout
    notes TEXT, -- Internal processing notes
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (consultant_id) REFERENCES consultants(id),
    FOREIGN KEY (payment_account_id) REFERENCES consultant_payment_accounts(id),
    FOREIGN KEY (invoice_file_id) REFERENCES media_files(id),
    FOREIGN KEY (receipt_file_id) REFERENCES media_files(id),
    FOREIGN KEY (tax_document_file_id) REFERENCES media_files(id),
    FOREIGN KEY (processed_by) REFERENCES admin_users(id)
);

-- Indexes for consultant_payouts
CREATE INDEX idx_consultant_payouts_consultant ON consultant_payouts(consultant_id);
CREATE INDEX idx_consultant_payouts_account ON consultant_payouts(payment_account_id);
CREATE INDEX idx_consultant_payouts_status ON consultant_payouts(payout_status);
CREATE INDEX idx_consultant_payouts_period ON consultant_payouts(payout_period_start, payout_period_end);
CREATE INDEX idx_consultant_payouts_scheduled ON consultant_payouts(payout_scheduled_date);
CREATE INDEX idx_consultant_payouts_tax_year ON consultant_payouts(tax_year, tax_quarter);
CREATE INDEX idx_consultant_payouts_invoice ON consultant_payouts(invoice_number);
```

### LinkedIn Integration & Data Scraping

#### `consultant_linkedin_profiles`
Scraped LinkedIn data via Scoopp integration for enhanced consultant profiles.
→ **Integration**: [LinkedIn API](../integrations/linkedin.md), [Scoopp Service](../integrations/scoopp.md)
← **Enhances**: [Consultant Profiles](../features/consultant-profiles.md), [Expert Discovery](../features/expert-discovery.md)

```sql
CREATE TABLE consultant_linkedin_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    consultant_id INTEGER NOT NULL,
    
    -- LinkedIn Profile Data
    linkedin_url TEXT NOT NULL,
    linkedin_public_id TEXT, -- LinkedIn public profile identifier
    full_name TEXT,
    headline TEXT CHECK (headline IS NULL OR json_extract(headline, '$.en') IS NOT NULL), -- JSON multilingual
    summary TEXT CHECK (summary IS NULL OR json_extract(summary, '$.en') IS NOT NULL), -- PortableText JSON from LinkedIn about section
    
    -- Professional Information
    current_position TEXT CHECK (current_position IS NULL OR json_extract(current_position, '$.en') IS NOT NULL), -- JSON multilingual
    current_company TEXT,
    location TEXT,
    industry TEXT,
    
    -- Experience & Education (JSON Arrays)
    experience_history TEXT, -- JSON array of experience objects
    education_history TEXT, -- JSON array of education objects
    skills TEXT, -- JSON array of skills with endorsement counts
    certifications TEXT, -- JSON array of certifications
    
    -- Network & Engagement
    connections_count INTEGER,
    followers_count INTEGER,
    recent_activity TEXT, -- JSON array of recent posts/activities
    
    -- Profile Analytics
    profile_views INTEGER, -- LinkedIn profile views (if available)
    profile_quality_score DECIMAL(3,2), -- Our calculated profile completeness score
    
    -- Media & Content
    profile_image_url TEXT,
    banner_image_url TEXT,
    featured_content TEXT, -- JSON array of featured posts/media
    
    -- Scraping Metadata
    scraped_via TEXT DEFAULT 'scoopp', -- scoopp, manual, api
    scraping_job_id INTEGER, -- Reference to scraping_jobs table
    data_freshness_score DECIMAL(3,2) DEFAULT 1.0, -- How fresh is this data (1.0 = just scraped)
    last_scraped_at DATETIME,
    scraping_errors TEXT, -- JSON array of any scraping issues
    
    -- Data Quality & Validation
    data_accuracy_verified BOOLEAN DEFAULT 0,
    verified_by INTEGER, -- Admin who verified accuracy
    verification_notes TEXT,
    
    -- Privacy & Compliance
    data_usage_consent BOOLEAN DEFAULT 0, -- Consultant consented to LinkedIn data usage
    data_retention_expires_at DATETIME, -- When to delete scraped data
    
    -- Status
    is_active BOOLEAN DEFAULT 1,
    sync_enabled BOOLEAN DEFAULT 1, -- Whether to keep syncing this profile
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deleted_at DATETIME,
    
    FOREIGN KEY (consultant_id) REFERENCES consultants(id) ON DELETE CASCADE,
    FOREIGN KEY (scraping_job_id) REFERENCES scraping_jobs(id),
    FOREIGN KEY (verified_by) REFERENCES admin_users(id),
    UNIQUE(consultant_id) -- One LinkedIn profile per consultant
);

-- Indexes for consultant_linkedin_profiles
CREATE INDEX idx_consultant_linkedin_profiles_consultant ON consultant_linkedin_profiles(consultant_id);
CREATE INDEX idx_consultant_linkedin_profiles_url ON consultant_linkedin_profiles(linkedin_url);
CREATE INDEX idx_consultant_linkedin_profiles_scraped ON consultant_linkedin_profiles(last_scraped_at);
CREATE INDEX idx_consultant_linkedin_profiles_quality ON consultant_linkedin_profiles(profile_quality_score);
CREATE INDEX idx_consultant_linkedin_profiles_active ON consultant_linkedin_profiles(is_active);

-- Full-text search for LinkedIn profile data
CREATE VIRTUAL TABLE linkedin_profiles_fts_en USING fts5(
    full_name, headline, summary, current_position, skills,
    tokenize='porter'
);

-- FTS triggers for LinkedIn profiles
CREATE TRIGGER linkedin_profiles_fts_en_ai AFTER INSERT ON consultant_linkedin_profiles BEGIN
  INSERT INTO linkedin_profiles_fts_en(rowid, full_name, headline, summary, current_position, skills) 
  VALUES (
    new.id,
    new.full_name,
    json_extract(new.headline, '$.en'),
    portable_text_to_plain_text(json_extract(new.summary, '$.en')),
    json_extract(new.current_position, '$.en'),
    json_extract(new.skills, '$')
  );
END;

CREATE TRIGGER linkedin_profiles_fts_en_au AFTER UPDATE ON consultant_linkedin_profiles BEGIN
  UPDATE linkedin_profiles_fts_en SET 
    full_name = new.full_name,
    headline = json_extract(new.headline, '$.en'),
    summary = portable_text_to_plain_text(json_extract(new.summary, '$.en')),
    current_position = json_extract(new.current_position, '$.en'),
    skills = json_extract(new.skills, '$')
  WHERE rowid = new.id;
END;

CREATE TRIGGER linkedin_profiles_fts_en_ad AFTER DELETE ON consultant_linkedin_profiles BEGIN
  DELETE FROM linkedin_profiles_fts_en WHERE rowid = old.id;
END;
```

#### `scraping_jobs`
Track Scoopp crawling tasks and results for data collection management.
→ **Manages**: [Data Collection Workflows](../features/data-collection.md), [Scraping Compliance](../privacy-compliance.md#scraping)
← **Powers**: [LinkedIn Profiles](#consultant_linkedin_profiles), [Profile Enhancement](../features/profile-enhancement.md)

```sql
CREATE TABLE scraping_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Job Configuration
    job_type TEXT NOT NULL CHECK (job_type IN ('linkedin_profile', 'linkedin_company', 'linkedin_post', 'twitter_profile', 'website_scrape')),
    target_url TEXT NOT NULL,
    source_platform TEXT NOT NULL CHECK (source_platform IN ('linkedin', 'twitter', 'website', 'github')),
    
    -- Job Parameters
    scraping_parameters TEXT, -- JSON: scraping configuration
    -- Example: {"depth": 1, "include_posts": true, "max_connections": 500, "include_experience": true}
    
    -- Scheduling
    priority INTEGER DEFAULT 5 CHECK (priority >= 1 AND priority <= 10), -- 1 = highest, 10 = lowest
    scheduled_at DATETIME,
    started_at DATETIME,
    completed_at DATETIME,
    
    -- Status Tracking
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled', 'rate_limited')),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Results
    items_scraped INTEGER DEFAULT 0,
    items_failed INTEGER DEFAULT 0,
    data_collected_mb DECIMAL(8,2) DEFAULT 0.0, -- Size of collected data
    
    -- Error Handling
    error_message TEXT,
    error_details TEXT, -- JSON: detailed error information
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    next_retry_at DATETIME,
    
    -- Rate Limiting & Compliance
    rate_limit_hit BOOLEAN DEFAULT 0,
    rate_limit_reset_at DATETIME,
    robots_txt_compliant BOOLEAN DEFAULT 1,
    user_agent TEXT DEFAULT 'voltAIc-scraper/1.0',
    
    -- Data Storage
    output_format TEXT DEFAULT 'json' CHECK (output_format IN ('json', 'csv', 'xml')),
    output_file_id INTEGER, -- Reference to stored scraping results
    checksum TEXT, -- SHA-256 of scraped data for integrity
    
    -- Association
    consultant_id INTEGER, -- If scraping for specific consultant
    admin_user_id INTEGER, -- User who initiated the job
    
    -- Resource Usage
    execution_time_seconds INTEGER,
    memory_used_mb INTEGER,
    network_requests INTEGER,
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (consultant_id) REFERENCES consultants(id),
    FOREIGN KEY (admin_user_id) REFERENCES admin_users(id),
    FOREIGN KEY (output_file_id) REFERENCES media_files(id)
);

-- Indexes for scraping_jobs
CREATE INDEX idx_scraping_jobs_type ON scraping_jobs(job_type);
CREATE INDEX idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX idx_scraping_jobs_platform ON scraping_jobs(source_platform);
CREATE INDEX idx_scraping_jobs_consultant ON scraping_jobs(consultant_id);
CREATE INDEX idx_scraping_jobs_priority ON scraping_jobs(priority, scheduled_at);
CREATE INDEX idx_scraping_jobs_url ON scraping_jobs(target_url);
CREATE INDEX idx_scraping_jobs_scheduled ON scraping_jobs(scheduled_at);
CREATE INDEX idx_scraping_jobs_rate_limit ON scraping_jobs(rate_limit_hit, rate_limit_reset_at);
```

### Coupon & Discount Management

#### `coupons`
Coupon system for free consultations and discounted bookings.
→ **Supports**: [Promotional Campaigns](../features/promotional-campaigns.md), [Marketing Strategy](../features/marketing-strategy.md)
← **Used by**: [Book-a-Meeting](../frontend/public/features/booking.md), [30-for-30 Services](../features/consultant-offerings.md)

```sql
CREATE TABLE coupons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Coupon Identification
    code TEXT UNIQUE NOT NULL, -- Public coupon code (e.g., "FREECALL2024")
    internal_name TEXT NOT NULL, -- Admin reference name
    description TEXT CHECK (description IS NULL OR json_extract(description, '$.en') IS NOT NULL), -- PortableText JSON multilingual
    
    -- Discount Configuration
    discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed_amount', 'free_session')),
    discount_value DECIMAL(10,2), -- Percentage (0-100) or fixed amount in USD
    max_discount_amount DECIMAL(10,2), -- Cap for percentage discounts
    minimum_order_value DECIMAL(10,2) DEFAULT 0.0, -- Minimum booking value to apply coupon
    
    -- Usage Restrictions
    max_uses_total INTEGER, -- NULL = unlimited
    max_uses_per_user INTEGER DEFAULT 1, -- Limit per email/user
    current_usage_count INTEGER DEFAULT 0,
    
    -- Validity Period
    valid_from DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    valid_until DATETIME, -- NULL = no expiration
    is_active BOOLEAN DEFAULT 1,
    
    -- Applicable Services
    applicable_to TEXT DEFAULT 'all' CHECK (applicable_to IN ('all', 'book_a_meeting', '30_for_30', 'specific_consultants', 'first_time_users')),
    consultant_restrictions TEXT, -- JSON array of consultant IDs if applicable_to = 'specific_consultants'
    service_type_restrictions TEXT, -- JSON array of session types
    
    -- Campaign Attribution
    campaign_source TEXT, -- Marketing campaign identifier
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Analytics & Tracking
    generated_revenue_usd DECIMAL(12,2) DEFAULT 0.0, -- Total revenue from this coupon
    conversion_rate DECIMAL(5,4) DEFAULT 0.0000, -- Usage rate vs. distribution
    
    -- Administrative
    created_by INTEGER NOT NULL, -- Admin user who created the coupon
    notes TEXT, -- Internal admin notes
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    deactivated_at DATETIME,
    
    FOREIGN KEY (created_by) REFERENCES admin_users(id)
);

-- Indexes for coupons
CREATE INDEX idx_coupons_code ON coupons(code);
CREATE INDEX idx_coupons_active ON coupons(is_active);
CREATE INDEX idx_coupons_validity ON coupons(valid_from, valid_until);
CREATE INDEX idx_coupons_applicable_to ON coupons(applicable_to);
CREATE INDEX idx_coupons_campaign ON coupons(campaign_source);
CREATE INDEX idx_coupons_created_by ON coupons(created_by);
```

#### `coupon_usage`
Tracking individual coupon redemptions and usage analytics.
→ **Tracks**: [Coupon Performance](../features/coupon-analytics.md), [User Behavior](../features/user-analytics.md)
← **Links**: [Consultant Bookings](#consultant_bookings), [Coupons](#coupons)

```sql
CREATE TABLE coupon_usage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Coupon & User Information
    coupon_id INTEGER NOT NULL,
    consultant_booking_id INTEGER, -- NULL for failed attempts
    
    -- User Identification
    user_email TEXT NOT NULL, -- Client email for tracking
    user_ip_address TEXT, -- For fraud detection
    user_session_id TEXT, -- Browser session tracking
    
    -- Usage Details
    attempted_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status TEXT NOT NULL CHECK (status IN ('pending', 'applied', 'failed', 'expired', 'invalid', 'limit_exceeded')),
    
    -- Financial Impact
    original_amount_usd DECIMAL(10,2), -- Price before coupon
    discount_applied_usd DECIMAL(10,2), -- Amount discounted
    final_amount_usd DECIMAL(10,2), -- Price after coupon (can be 0 for free sessions)
    
    -- Validation Results
    validation_errors TEXT, -- JSON array of validation failure reasons
    is_first_time_user BOOLEAN DEFAULT 0,
    user_previous_bookings_count INTEGER DEFAULT 0,
    
    -- Attribution
    referrer_url TEXT,
    utm_source TEXT,
    utm_medium TEXT,
    utm_campaign TEXT,
    
    -- Fraud Detection
    risk_score DECIMAL(3,2) DEFAULT 0.0, -- 0.0 to 1.0, calculated risk score
    fraud_flags TEXT, -- JSON array of fraud indicators
    is_flagged_suspicious BOOLEAN DEFAULT 0,
    
    -- Success Metrics
    booking_completed BOOLEAN DEFAULT 0, -- Whether the booking was completed
    session_attended BOOLEAN DEFAULT 0, -- Whether client attended the session
    
    FOREIGN KEY (coupon_id) REFERENCES coupons(id),
    FOREIGN KEY (consultant_booking_id) REFERENCES consultant_bookings(id)
);

-- Indexes for coupon_usage
CREATE INDEX idx_coupon_usage_coupon ON coupon_usage(coupon_id);
CREATE INDEX idx_coupon_usage_booking ON coupon_usage(consultant_booking_id);
CREATE INDEX idx_coupon_usage_email ON coupon_usage(user_email);
CREATE INDEX idx_coupon_usage_status ON coupon_usage(status);
CREATE INDEX idx_coupon_usage_attempted ON coupon_usage(attempted_at);
CREATE INDEX idx_coupon_usage_fraud_flags ON coupon_usage(is_flagged_suspicious);
CREATE INDEX idx_coupon_usage_success ON coupon_usage(booking_completed, session_attended);
```

### Payment Processing & Financial Management

#### `payment_transactions`
Comprehensive payment processing records with Odoo ERP integration.
→ **Integrates**: [Odoo ERP](../integrations/odoo.md), [Payment Gateways](../integrations/payment-gateways.md)
← **Tracks**: [Consultant Bookings](#consultant_bookings), [Revenue Analytics](../features/revenue-analytics.md)

```sql
CREATE TABLE payment_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Transaction Identification
    transaction_reference TEXT UNIQUE NOT NULL, -- Our internal reference
    external_transaction_id TEXT, -- Payment processor transaction ID
    odoo_transaction_id TEXT, -- Corresponding Odoo transaction ID
    
    -- Transaction Type
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('booking_payment', 'refund', 'payout', 'platform_fee', 'adjustment')),
    payment_method TEXT NOT NULL CHECK (payment_method IN ('credit_card', 'debit_card', 'bank_transfer', 'paypal', 'stripe', 'wise', 'crypto')),
    
    -- Related Records
    consultant_booking_id INTEGER, -- If related to a booking
    consultant_payout_id INTEGER, -- If related to a payout
    consultant_id INTEGER, -- Consultant involved in transaction
    
    -- Financial Details
    gross_amount_usd DECIMAL(12,2) NOT NULL, -- Total transaction amount
    platform_fee_usd DECIMAL(10,2) DEFAULT 0.0, -- Platform fee (15%)
    processing_fee_usd DECIMAL(8,2) DEFAULT 0.0, -- Payment processor fee
    tax_amount_usd DECIMAL(10,2) DEFAULT 0.0, -- Tax amount if applicable
    net_amount_usd DECIMAL(12,2) NOT NULL, -- Net amount after all fees
    
    -- Currency & Exchange
    transaction_currency TEXT NOT NULL DEFAULT 'USD',
    original_amount DECIMAL(12,2), -- Amount in original currency if different
    original_currency TEXT, -- Original currency if different from USD
    exchange_rate DECIMAL(10,6) DEFAULT 1.0,
    
    -- Transaction Status
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'disputed')),
    gateway_status TEXT, -- Raw status from payment gateway
    failure_reason TEXT,
    
    -- Customer Information
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    billing_address TEXT, -- JSON object with billing address
    
    -- Gateway Information
    payment_gateway TEXT NOT NULL CHECK (payment_gateway IN ('stripe', 'paypal', 'wise', 'bank_transfer', 'crypto')),
    gateway_fee_usd DECIMAL(8,2) DEFAULT 0.0,
    gateway_response TEXT, -- JSON response from gateway
    
    -- Risk & Fraud Detection
    risk_score INTEGER CHECK (risk_score IS NULL OR (risk_score >= 0 AND risk_score <= 100)),
    fraud_flags TEXT, -- JSON array of fraud detection flags
    requires_manual_review BOOLEAN DEFAULT 0,
    reviewed_by INTEGER,
    review_notes TEXT,
    
    -- Timing
    initiated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at DATETIME,
    completed_at DATETIME,
    
    -- Dispute & Chargeback Management
    dispute_status TEXT CHECK (dispute_status IS NULL OR dispute_status IN ('none', 'inquiry', 'chargeback', 'pre_arbitration', 'arbitration')),
    dispute_amount_usd DECIMAL(10,2) DEFAULT 0.0,
    dispute_reason TEXT,
    dispute_evidence_file_id INTEGER, -- Supporting documentation
    
    -- Reconciliation
    reconciled BOOLEAN DEFAULT 0,
    reconciled_at DATETIME,
    reconciled_by INTEGER,
    accounting_period TEXT, -- YYYY-MM format
    
    -- ERP Integration
    odoo_synced BOOLEAN DEFAULT 0,
    odoo_sync_error TEXT,
    odoo_last_sync_at DATETIME,
    
    -- Metadata
    user_agent TEXT,
    ip_address TEXT,
    source_platform TEXT, -- web, mobile, api
    
    -- Timestamps
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (consultant_booking_id) REFERENCES consultant_bookings(id),
    FOREIGN KEY (consultant_payout_id) REFERENCES consultant_payouts(id),
    FOREIGN KEY (consultant_id) REFERENCES consultants(id),
    FOREIGN KEY (reviewed_by) REFERENCES admin_users(id),
    FOREIGN KEY (dispute_evidence_file_id) REFERENCES media_files(id),
    FOREIGN KEY (reconciled_by) REFERENCES admin_users(id)
);

-- Indexes for payment_transactions
CREATE INDEX idx_payment_transactions_reference ON payment_transactions(transaction_reference);
CREATE INDEX idx_payment_transactions_external_id ON payment_transactions(external_transaction_id);
CREATE INDEX idx_payment_transactions_type ON payment_transactions(transaction_type);
CREATE INDEX idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX idx_payment_transactions_consultant ON payment_transactions(consultant_id);
CREATE INDEX idx_payment_transactions_booking ON payment_transactions(consultant_booking_id);
CREATE INDEX idx_payment_transactions_payout ON payment_transactions(consultant_payout_id);
CREATE INDEX idx_payment_transactions_gateway ON payment_transactions(payment_gateway);
CREATE INDEX idx_payment_transactions_completed ON payment_transactions(completed_at);
CREATE INDEX idx_payment_transactions_accounting ON payment_transactions(accounting_period);
CREATE INDEX idx_payment_transactions_reconciled ON payment_transactions(reconciled);
CREATE INDEX idx_payment_transactions_odoo_sync ON payment_transactions(odoo_synced);
CREATE INDEX idx_payment_transactions_dispute ON payment_transactions(dispute_status);
CREATE INDEX idx_payment_transactions_risk ON payment_transactions(risk_score);
```

## Enhanced Consultant Relationship Mappings

### Entity Relationship Extensions
```
-- New Consultant System Relationships
consultants (1) → (N) consultant_whitepapers → (1) whitepapers
consultants (1) → (N) consultant_webinars → (1) webinars  
consultants (1) → (N) consultant_bookings
consultants (1) → (N) consultant_offerings
consultants (1) → (N) consultant_payment_accounts
consultants (1) → (N) consultant_payouts
consultants (1) → (1) consultant_linkedin_profiles
consultants (1) → (N) scraping_jobs

consultant_bookings (1) → (N) payment_transactions
consultant_payouts (1) → (N) payment_transactions
scraping_jobs (1) → (1) consultant_linkedin_profiles
-- Coupon System Relationships
coupons (1) → (N) consultant_bookings
coupons (1) → (N) coupon_usage
consultant_bookings (1) → (1) coupon_usage
admin_users (1) → (N) coupons (created_by)

-- Integration with existing system
admin_users (1) → (N) consultants (created_by)
admin_users (1) → (N) consultant_payouts (processed_by)
admin_users (1) → (N) payment_transactions (reviewed_by)
media_files (1) → (N) consultants (profile_image_id)
media_files (1) → (N) consultant_payment_accounts (tax_form_file_id)
```

### Language-Specific Views for Consultant Content

```sql
-- Consultant profiles with multilingual support
CREATE VIEW consultants_en AS
SELECT 
    id,
    first_name,
    last_name,
    display_name,
    json_extract(bio, '$.en') as bio,
    json_extract(job_title, '$.en') as job_title,
    expertise_areas,
    company,
    country,
    languages_spoken,
    hourly_rate_usd,
    average_rating,
    total_sessions,
    status,
    profile_visibility
FROM consultants
WHERE deleted_at IS NULL;

CREATE VIEW consultants_de AS
SELECT 
    id,
    first_name,
    last_name,
    display_name,
    COALESCE(json_extract(bio, '$.de'), json_extract(bio, '$.en')) as bio,
    COALESCE(json_extract(job_title, '$.de'), json_extract(job_title, '$.en')) as job_title,
    expertise_areas,
    company,
    country,
    languages_spoken,
    hourly_rate_usd,
    average_rating,
    total_sessions,
    status,
    profile_visibility
FROM consultants
WHERE deleted_at IS NULL;

-- Consultant offerings with multilingual content
CREATE VIEW consultant_offerings_en AS
SELECT 
    id,
    consultant_id,
    json_extract(name, '$.en') as name,
    json_extract(short_description, '$.en') as short_description,
    json_extract(description, '$.en') as description,
    offering_type,
    duration_minutes,
    price_usd,
    is_active,
    featured
FROM consultant_offerings
WHERE deleted_at IS NULL;

CREATE VIEW consultant_offerings_de AS
SELECT 
    id,
    consultant_id,
    COALESCE(json_extract(name, '$.de'), json_extract(name, '$.en')) as name,
    COALESCE(json_extract(short_description, '$.de'), json_extract(short_description, '$.en')) as short_description,
    COALESCE(json_extract(description, '$.de'), json_extract(description, '$.en')) as description,
    offering_type,
    duration_minutes,
    price_usd,
    is_active,
    featured
FROM consultant_offerings
WHERE deleted_at IS NULL;
```

### Consultant Analytics Views

```sql
-- Consultant performance analytics
CREATE VIEW consultant_analytics AS
SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.display_name,
    c.status,
    
    -- Booking Statistics
    COUNT(cb.id) as total_bookings,
    COUNT(CASE WHEN cb.booking_status = 'completed' THEN 1 END) as completed_bookings,
    COUNT(CASE WHEN cb.booking_status = 'cancelled' THEN 1 END) as cancelled_bookings,
    COUNT(CASE WHEN cb.booking_status = 'no_show_client' THEN 1 END) as client_no_shows,
    
    -- Financial Performance
    COALESCE(SUM(CASE WHEN cb.booking_status = 'completed' THEN cb.consultant_payout_usd END), 0) as total_earnings_usd,
    COALESCE(SUM(CASE WHEN cb.booking_status = 'completed' THEN cb.platform_fee_usd END), 0) as platform_fees_generated_usd,
    COALESCE(AVG(CASE WHEN cb.booking_status = 'completed' THEN cb.hourly_rate_usd END), 0) as average_hourly_rate,
    
    -- Ratings & Feedback
    COALESCE(AVG(cb.client_rating), 0) as average_client_rating,
    COUNT(CASE WHEN cb.client_rating IS NOT NULL THEN 1 END) as total_ratings,
    COUNT(CASE WHEN cb.client_rating >= 4 THEN 1 END) as positive_ratings,
    
    -- Activity Metrics
    MAX(cb.scheduled_start) as last_session_date,
    MIN(cb.scheduled_start) as first_session_date,
    
    -- Response Time (future implementation)
    -- AVG(response_time_hours) as avg_response_time_hours
    
FROM consultants c
LEFT JOIN consultant_bookings cb ON c.id = cb.consultant_id
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.first_name, c.last_name, c.display_name, c.status;

-- Revenue analytics by consultant
CREATE VIEW consultant_revenue_monthly AS
SELECT 
    c.id as consultant_id,
    c.display_name,
    strftime('%Y-%m', cb.completed_at) as month,
    COUNT(cb.id) as sessions_completed,
    SUM(cb.consultant_payout_usd) as earnings_usd,
    SUM(cb.platform_fee_usd) as platform_fees_usd,
    SUM(cb.total_amount_usd) as gross_revenue_usd,
    AVG(cb.client_rating) as avg_rating
FROM consultants c
JOIN consultant_bookings cb ON c.id = cb.consultant_id
WHERE cb.booking_status = 'completed'
  AND cb.completed_at IS NOT NULL
  AND c.deleted_at IS NULL
GROUP BY c.id, c.display_name, strftime('%Y-%m', cb.completed_at)
ORDER BY month DESC, earnings_usd DESC;

-- Top performing consultants view
CREATE VIEW top_consultants AS
SELECT 
    c.id,
    c.display_name,
    c.expertise_areas,
    c.average_rating,
    c.total_sessions,
    COUNT(cb.id) as recent_bookings, -- Last 90 days
    SUM(cb.consultant_payout_usd) as recent_earnings_usd,
    AVG(cb.client_rating) as recent_avg_rating
FROM consultants c
LEFT JOIN consultant_bookings cb ON c.id = cb.consultant_id 
    AND cb.created_at >= datetime('now', '-90 days')
    AND cb.booking_status = 'completed'
WHERE c.status = 'approved' 
  AND c.profile_visibility = 'public'
  AND c.deleted_at IS NULL
GROUP BY c.id, c.display_name, c.expertise_areas, c.average_rating, c.total_sessions
HAVING c.total_sessions > 0
ORDER BY recent_earnings_usd DESC, c.average_rating DESC, c.total_sessions DESC;

-- Coupon analytics view
CREATE VIEW coupon_analytics AS
SELECT 
    c.id,
    c.code,
    c.internal_name,
    c.discount_type,
    c.discount_value,
    c.current_usage_count,
    c.max_uses_total,
    
    -- Usage Statistics
    COUNT(cu.id) as total_attempts,
    COUNT(CASE WHEN cu.status = 'applied' THEN 1 END) as successful_uses,
    COUNT(CASE WHEN cu.status = 'failed' THEN 1 END) as failed_attempts,
    
    -- Conversion Metrics
    ROUND(
        CAST(COUNT(CASE WHEN cu.status = 'applied' THEN 1 END) AS FLOAT) / 
        NULLIF(COUNT(cu.id), 0) * 100, 2
    ) as success_rate_percent,
    
    -- Financial Impact
    SUM(cu.discount_applied_usd) as total_discounts_given,
    SUM(cu.final_amount_usd) as revenue_generated,
    COUNT(CASE WHEN cu.booking_completed = 1 THEN 1 END) as completed_bookings,
    COUNT(CASE WHEN cu.session_attended = 1 THEN 1 END) as attended_sessions,
    
    -- Time Analysis
    c.created_at,
    c.valid_from,
    c.valid_until,
    c.is_active
    
FROM coupons c
LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
WHERE c.deleted_at IS NULL
GROUP BY c.id, c.code, c.internal_name, c.discount_type, c.discount_value, c.current_usage_count, c.max_uses_total, c.created_at, c.valid_from, c.valid_until, c.is_active
ORDER BY total_discounts_given DESC, successful_uses DESC;

-- Active coupons performance view
CREATE VIEW active_coupons_performance AS
SELECT 
    c.code,
    c.internal_name,
    c.discount_type,
    c.discount_value,
    c.current_usage_count,
    c.max_uses_total,
    
    -- Recent activity (last 30 days)
    COUNT(CASE WHEN cu.attempted_at >= datetime('now', '-30 days') THEN 1 END) as recent_attempts,
    COUNT(CASE WHEN cu.attempted_at >= datetime('now', '-30 days') AND cu.status = 'applied' THEN 1 END) as recent_successful_uses,
    
    -- Success metrics
    ROUND(
        AVG(CASE WHEN cu.session_attended = 1 THEN 1.0 ELSE 0.0 END) * 100, 1
    ) as attendance_rate_percent,
    
    -- Expiration info
    CASE 
        WHEN c.valid_until IS NULL THEN 'No expiration'
        WHEN c.valid_until > datetime('now') THEN 'Active'
        ELSE 'Expired'
    END as status,
    
    c.valid_until
    
FROM coupons c
LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
WHERE c.is_active = 1 AND c.deleted_at IS NULL
GROUP BY c.id, c.code, c.internal_name, c.discount_type, c.discount_value, c.current_usage_count, c.max_uses_total, c.valid_until
ORDER BY recent_attempts DESC, recent_successful_uses DESC;
```

## Conclusion

The Magnetiq v2 database schema provides a robust foundation using SQLite for all environments with comprehensive multilingual support and advanced consultant management capabilities. Key features include:

### Multilingual Capabilities
- **JSON-based content storage** for English and German with mandatory English content
- **Language-specific full-text search** indexes for optimized search performance
- **Translation management system** for UI strings and content workflows
- **Translation memory** for consistency and reuse
- **Language-specific views** for simplified querying
- **Validation constraints** ensuring data integrity
- **Coverage tracking** for monitoring translation completeness

### Consultant Management System
- **Comprehensive consultant profiles** with professional information, expertise tracking, and performance metrics
- **Advanced booking system** with payment processing, session management, and client relationship tracking
- **Flexible service offerings** including "30-for-30" packages with customizable pricing and descriptions
- **Secure payment processing** with platform fee distribution (15% platform, 85% consultant)
- **LinkedIn integration** via Scoopp for enhanced profile data and expert discovery
- **KYC compliance** with encrypted financial data and verification workflows
- **Multi-currency support** with exchange rate tracking and international payment capabilities

### Financial & Business Intelligence
- **Complete payment transaction tracking** with Odoo ERP integration
- **Revenue analytics** and consultant performance metrics
- **Automated payout processing** with tax documentation and compliance
- **Fraud detection** and risk management capabilities
- **Dispute and chargeback management** with evidence tracking

### Data Integration & Automation
- **Scraping job management** for automated data collection from LinkedIn and other platforms
- **Cross-platform content attribution** linking consultants to whitepapers and webinars
- **Comprehensive audit trails** with soft deletes and change tracking
- **Performance optimization** through strategic indexing and materialized views

### Core Features
- **Simple yet powerful schema** supporting all CMS and business automation features
- **Performance optimization** through strategic indexing and views
- **Data integrity** with foreign key constraints and validation triggers
- **Audit trails** and soft deletes for data recovery
- **Clear migration path** to PostgreSQL-based v3 for advanced integration needs
- **Cross-referenced specifications** with comprehensive linking to related system components

The enhanced schema successfully balances simplicity with functionality while providing enterprise-grade multilingual capabilities and sophisticated consultant management features suitable for international B2B consulting platform deployment.

→ **Cross-References**: [Consultant Features](../features/consultant-management.md), [Payment Processing](../integrations/payment-processing.md), [LinkedIn Integration](../integrations/linkedin.md)
← **Supports**: [Expert Network](../features/expert-network.md), [Revenue Management](../features/revenue-management.md), [Platform Economics](../features/platform-economics.md)
⚡ **Dependencies**: [Security Framework](../security.md), [Privacy Compliance](../privacy-compliance.md), [API Endpoints](api.md#consultant-endpoints)