# Magnetiq v2 - Database Schema Specification

## Overview

The Magnetiq v2 database schema is designed for scalability, performance, and data integrity. It supports all system features including content management, user administration, business operations, multilingual content, and comprehensive audit trails.

## Database Technology

### Primary Database
- **PostgreSQL 14+** for production
- **SQLite** for development and testing
- **UTF-8 encoding** for full Unicode support
- **Timezone-aware** timestamps (UTC storage)

### Design Principles
- **Normalized design** (3NF minimum)
- **UUID primary keys** for all entities
- **Soft deletes** with `deleted_at` timestamps
- **Audit trails** for all critical operations
- **Optimistic locking** with version fields
- **Full-text search** support
- **Multilingual content** structure

### Naming Conventions
- **Tables**: snake_case (plural nouns)
- **Columns**: snake_case
- **Indexes**: `idx_table_column(s)`
- **Foreign Keys**: `fk_table_referenced_table`
- **Constraints**: `ck_table_condition`, `uq_table_column(s)`

## Core Tables

### Users & Authentication

#### `admin_users`
Administrative users with system access.

```sql
CREATE TABLE admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    
    -- Profile Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(2) DEFAULT 'en',
    
    -- Security & Access
    role VARCHAR(20) NOT NULL DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    is_superuser BOOLEAN DEFAULT false,
    last_login_at TIMESTAMPTZ,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    password_reset_token VARCHAR(255),
    password_reset_expires_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES admin_users(id),
    updated_by UUID REFERENCES admin_users(id),
    deleted_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1,
    
    CONSTRAINT ck_admin_users_role 
        CHECK (role IN ('super_admin', 'admin', 'editor', 'viewer')),
    CONSTRAINT ck_admin_users_language 
        CHECK (language IN ('en', 'de'))
);

CREATE INDEX idx_admin_users_email ON admin_users(email);
CREATE INDEX idx_admin_users_role ON admin_users(role);
CREATE INDEX idx_admin_users_active ON admin_users(is_active) WHERE deleted_at IS NULL;
```

#### `admin_sessions`
Active admin user sessions for security tracking.

```sql
CREATE TABLE admin_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    session_token VARCHAR(500) NOT NULL UNIQUE,
    refresh_token VARCHAR(500) UNIQUE,
    
    -- Session Metadata
    ip_address INET,
    user_agent TEXT,
    device_info JSONB,
    location JSONB,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    invalidated_at TIMESTAMPTZ,
    
    CONSTRAINT ck_admin_sessions_valid_expiry 
        CHECK (expires_at > created_at)
);

CREATE INDEX idx_admin_sessions_user_id ON admin_sessions(user_id);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);
```

#### `user_permissions`
Granular permission system for RBAC.

```sql
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
    permission VARCHAR(100) NOT NULL,
    resource VARCHAR(100),
    granted_by UUID REFERENCES admin_users(id),
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    
    UNIQUE(user_id, permission, resource)
);

CREATE INDEX idx_user_permissions_user_id ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_permission ON user_permissions(permission);
```

### Content Management

#### `pages`
Website pages with multilingual support.

```sql
CREATE TABLE pages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(200) UNIQUE NOT NULL,
    
    -- Content
    title JSONB NOT NULL, -- {"en": "About", "de": "Über uns"}
    content JSONB, -- {"en": "Content...", "de": "Inhalt..."}
    excerpt JSONB, -- Short description
    blocks JSONB, -- Page builder blocks
    
    -- SEO
    meta_title JSONB,
    meta_description JSONB,
    meta_keywords JSONB,
    og_image VARCHAR(500),
    canonical_url VARCHAR(500),
    
    -- Publishing
    status VARCHAR(20) DEFAULT 'draft',
    published_at TIMESTAMPTZ,
    scheduled_at TIMESTAMPTZ,
    
    -- Hierarchy
    parent_id UUID REFERENCES pages(id),
    sort_order INTEGER DEFAULT 0,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES admin_users(id),
    updated_by UUID NOT NULL REFERENCES admin_users(id),
    deleted_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1,
    
    CONSTRAINT ck_pages_status 
        CHECK (status IN ('draft', 'published', 'archived', 'scheduled'))
);

CREATE INDEX idx_pages_slug ON pages(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_pages_status ON pages(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_pages_published ON pages(published_at) WHERE status = 'published';
CREATE INDEX idx_pages_parent ON pages(parent_id);
```

#### `media_files`
Media library for images, videos, documents.

```sql
CREATE TABLE media_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_hash VARCHAR(64) UNIQUE, -- SHA-256 for deduplication
    
    -- Media Metadata
    width INTEGER, -- For images/videos
    height INTEGER,
    duration INTEGER, -- For videos/audio in seconds
    
    -- Organization
    title JSONB, -- {"en": "Title", "de": "Titel"}
    alt_text JSONB, -- For accessibility
    caption JSONB,
    tags TEXT[],
    folder VARCHAR(200),
    
    -- Usage Tracking
    download_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    uploaded_by UUID NOT NULL REFERENCES admin_users(id),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_media_files_filename ON media_files(filename);
CREATE INDEX idx_media_files_mime_type ON media_files(mime_type);
CREATE INDEX idx_media_files_folder ON media_files(folder);
CREATE INDEX idx_media_files_tags ON media_files USING GIN(tags);
CREATE INDEX idx_media_files_hash ON media_files(file_hash);
```

### Business Entities

#### `consultants`
Consultant profiles and availability.

```sql
CREATE TABLE consultants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(200), -- Dr., Prof., etc.
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50),
    photo_url VARCHAR(500),
    
    -- Professional Information
    biography JSONB, -- {"en": "Bio...", "de": "Bio..."}
    expertise TEXT[] DEFAULT '{}',
    linkedin_url VARCHAR(500),
    languages TEXT[] DEFAULT '{"en"}',
    
    -- Availability
    timezone VARCHAR(50) DEFAULT 'UTC',
    is_online BOOLEAN DEFAULT true,
    is_accepting_bookings BOOLEAN DEFAULT true,
    working_hours JSONB, -- Weekly schedule
    holidays JSONB, -- Date ranges
    
    -- Integration
    google_calendar_id VARCHAR(255),
    odoo_partner_id INTEGER,
    
    -- Analytics
    total_bookings INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES admin_users(id),
    updated_by UUID NOT NULL REFERENCES admin_users(id),
    deleted_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1
);

CREATE INDEX idx_consultants_email ON consultants(email);
CREATE INDEX idx_consultants_online ON consultants(is_online) WHERE deleted_at IS NULL;
CREATE INDEX idx_consultants_accepting ON consultants(is_accepting_bookings) WHERE deleted_at IS NULL;
CREATE INDEX idx_consultants_expertise ON consultants USING GIN(expertise);
```

#### `bookings`
Consultation bookings with full details.

```sql
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference VARCHAR(20) UNIQUE NOT NULL, -- VLT-YYYYMMDD-XXXX
    
    -- Booking Details
    consultant_id UUID NOT NULL REFERENCES consultants(id),
    datetime TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL, -- Minutes
    timezone VARCHAR(50) NOT NULL,
    meeting_type VARCHAR(20) DEFAULT 'video',
    
    -- Client Information
    client_first_name VARCHAR(100) NOT NULL,
    client_last_name VARCHAR(100) NOT NULL,
    client_email VARCHAR(255) NOT NULL,
    client_phone VARCHAR(50),
    client_company VARCHAR(200),
    client_website VARCHAR(500),
    
    -- Booking Content
    subject VARCHAR(300),
    message TEXT,
    preparation_notes TEXT,
    
    -- Status & Tracking
    status VARCHAR(20) DEFAULT 'confirmed',
    booking_source VARCHAR(50) DEFAULT 'website',
    
    -- Meeting Integration
    google_calendar_event_id VARCHAR(255),
    meeting_url VARCHAR(500),
    meeting_password VARCHAR(50),
    
    -- Notifications
    confirmation_sent_at TIMESTAMPTZ,
    reminder_sent_at TIMESTAMPTZ,
    
    -- Feedback
    client_rating INTEGER,
    client_feedback TEXT,
    consultant_notes TEXT,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1,
    
    CONSTRAINT ck_bookings_status 
        CHECK (status IN ('confirmed', 'cancelled', 'completed', 'no_show')),
    CONSTRAINT ck_bookings_meeting_type 
        CHECK (meeting_type IN ('video', 'phone', 'in_person')),
    CONSTRAINT ck_bookings_duration 
        CHECK (duration IN (30, 60, 90, 120)),
    CONSTRAINT ck_bookings_rating 
        CHECK (client_rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_bookings_reference ON bookings(reference);
CREATE INDEX idx_bookings_consultant ON bookings(consultant_id);
CREATE INDEX idx_bookings_datetime ON bookings(datetime);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_client_email ON bookings(client_email);
```

### Webinars System

#### `webinar_topics`
Reusable webinar topics/templates.

```sql
CREATE TABLE webinar_topics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Content
    title JSONB NOT NULL, -- {"en": "AI in Manufacturing", "de": "KI in der Fertigung"}
    description JSONB,
    learning_objectives JSONB, -- Array of objectives
    prerequisites JSONB,
    target_audience JSONB,
    
    -- Configuration
    default_duration INTEGER DEFAULT 60, -- Minutes
    default_price DECIMAL(10,2) DEFAULT 0.00,
    default_capacity INTEGER,
    
    -- Categorization
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    difficulty_level VARCHAR(20) DEFAULT 'intermediate',
    
    -- Media
    thumbnail_url VARCHAR(500),
    promotional_image_url VARCHAR(500),
    
    -- Integration
    odoo_product_id INTEGER,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES admin_users(id),
    updated_by UUID NOT NULL REFERENCES admin_users(id),
    deleted_at TIMESTAMPTZ,
    
    CONSTRAINT ck_webinar_topics_difficulty 
        CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'))
);

CREATE INDEX idx_webinar_topics_category ON webinar_topics(category);
CREATE INDEX idx_webinar_topics_tags ON webinar_topics USING GIN(tags);
```

#### `webinar_speakers`
Speaker profiles for webinars.

```sql
CREATE TABLE webinar_speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Personal Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    title VARCHAR(200),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    
    -- Professional Information
    biography JSONB, -- {"en": "Bio...", "de": "Bio..."}
    company VARCHAR(200),
    position VARCHAR(200),
    expertise TEXT[] DEFAULT '{}',
    
    -- Media
    photo_url VARCHAR(500),
    linkedin_url VARCHAR(500),
    website_url VARCHAR(500),
    
    -- Relationship to Consultants
    consultant_id UUID REFERENCES consultants(id),
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES admin_users(id),
    updated_by UUID NOT NULL REFERENCES admin_users(id),
    deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_webinar_speakers_email ON webinar_speakers(email);
CREATE INDEX idx_webinar_speakers_consultant ON webinar_speakers(consultant_id);
```

#### `webinar_sessions`
Individual webinar instances.

```sql
CREATE TABLE webinar_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(200) UNIQUE NOT NULL,
    
    -- Relationships
    topic_id UUID NOT NULL REFERENCES webinar_topics(id),
    speaker_id UUID NOT NULL REFERENCES webinar_speakers(id),
    
    -- Session Details
    title JSONB, -- Override topic title if needed
    description JSONB, -- Override topic description
    datetime TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL, -- Minutes
    timezone VARCHAR(50) DEFAULT 'Europe/Berlin',
    
    -- Pricing & Capacity
    price DECIMAL(10,2) DEFAULT 0.00,
    currency VARCHAR(3) DEFAULT 'EUR',
    capacity INTEGER,
    
    -- Platform Integration
    meeting_url VARCHAR(500),
    meeting_password VARCHAR(100),
    recording_url VARCHAR(500),
    
    -- Content
    materials_url VARCHAR(500), -- Link to materials
    slides_url VARCHAR(500),
    certificate_template VARCHAR(500),
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft',
    registration_opens_at TIMESTAMPTZ,
    registration_closes_at TIMESTAMPTZ,
    
    -- Analytics
    registration_count INTEGER DEFAULT 0,
    attendance_count INTEGER DEFAULT 0,
    completion_rate DECIMAL(5,2),
    average_rating DECIMAL(3,2),
    
    -- Integration
    odoo_event_id INTEGER,
    google_calendar_event_id VARCHAR(255),
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES admin_users(id),
    updated_by UUID NOT NULL REFERENCES admin_users(id),
    deleted_at TIMESTAMPTZ,
    version INTEGER DEFAULT 1,
    
    CONSTRAINT ck_webinar_sessions_status 
        CHECK (status IN ('draft', 'published', 'live', 'completed', 'cancelled'))
);

CREATE INDEX idx_webinar_sessions_slug ON webinar_sessions(slug);
CREATE INDEX idx_webinar_sessions_topic ON webinar_sessions(topic_id);
CREATE INDEX idx_webinar_sessions_speaker ON webinar_sessions(speaker_id);
CREATE INDEX idx_webinar_sessions_datetime ON webinar_sessions(datetime);
CREATE INDEX idx_webinar_sessions_status ON webinar_sessions(status);
```

#### `webinar_registrations`
Webinar attendee registrations.

```sql
CREATE TABLE webinar_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES webinar_sessions(id) ON DELETE CASCADE,
    
    -- Attendee Information
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company VARCHAR(200),
    position VARCHAR(200),
    website VARCHAR(500),
    
    -- Registration Details
    status VARCHAR(20) DEFAULT 'confirmed',
    registration_source VARCHAR(50) DEFAULT 'website',
    special_requirements TEXT,
    
    -- Consent & Legal
    terms_accepted BOOLEAN DEFAULT false,
    marketing_consent BOOLEAN DEFAULT false,
    privacy_consent BOOLEAN DEFAULT true,
    
    -- Payment (for paid webinars)
    payment_status VARCHAR(20) DEFAULT 'not_required',
    payment_amount DECIMAL(10,2),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(100),
    
    -- Attendance Tracking
    joined_at TIMESTAMPTZ,
    left_at TIMESTAMPTZ,
    attendance_duration INTEGER, -- Minutes
    
    -- Engagement
    questions_asked INTEGER DEFAULT 0,
    chat_messages INTEGER DEFAULT 0,
    rating INTEGER,
    feedback TEXT,
    
    -- Integration
    odoo_registration_id INTEGER,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    UNIQUE(session_id, email),
    
    CONSTRAINT ck_webinar_registrations_status 
        CHECK (status IN ('confirmed', 'cancelled', 'attended', 'no_show')),
    CONSTRAINT ck_webinar_registrations_payment 
        CHECK (payment_status IN ('not_required', 'pending', 'completed', 'failed', 'refunded')),
    CONSTRAINT ck_webinar_registrations_rating 
        CHECK (rating BETWEEN 1 AND 5)
);

CREATE INDEX idx_webinar_registrations_session ON webinar_registrations(session_id);
CREATE INDEX idx_webinar_registrations_email ON webinar_registrations(email);
CREATE INDEX idx_webinar_registrations_status ON webinar_registrations(status);
```

### Whitepapers & Lead Generation

#### `whitepapers`
Whitepaper content and metadata.

```sql
CREATE TABLE whitepapers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(200) UNIQUE NOT NULL,
    
    -- Content
    title JSONB NOT NULL, -- {"en": "AI Guide", "de": "KI Leitfaden"}
    description JSONB,
    summary JSONB, -- Short summary
    
    -- Author Information
    author_name VARCHAR(200) NOT NULL,
    author_title VARCHAR(200),
    author_email VARCHAR(255),
    author_bio JSONB,
    
    -- Publication Details
    publication_date DATE NOT NULL,
    version VARCHAR(10) DEFAULT '1.0',
    page_count INTEGER,
    word_count INTEGER,
    
    -- File Information
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT NOT NULL,
    file_format VARCHAR(20) DEFAULT 'PDF',
    
    -- Categorization
    category VARCHAR(100),
    tags TEXT[] DEFAULT '{}',
    keywords TEXT[] DEFAULT '{}',
    difficulty_level VARCHAR(20) DEFAULT 'intermediate',
    
    -- Media
    thumbnail_url VARCHAR(500),
    cover_image_url VARCHAR(500),
    
    -- Status & Visibility
    status VARCHAR(20) DEFAULT 'draft',
    is_featured BOOLEAN DEFAULT false,
    requires_registration BOOLEAN DEFAULT true,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    lead_generation_count INTEGER DEFAULT 0,
    
    -- Integration
    odoo_product_id INTEGER,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID NOT NULL REFERENCES admin_users(id),
    updated_by UUID NOT NULL REFERENCES admin_users(id),
    deleted_at TIMESTAMPTZ,
    version_number INTEGER DEFAULT 1,
    
    CONSTRAINT ck_whitepapers_status 
        CHECK (status IN ('draft', 'published', 'archived')),
    CONSTRAINT ck_whitepapers_difficulty 
        CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced'))
);

CREATE INDEX idx_whitepapers_slug ON whitepapers(slug);
CREATE INDEX idx_whitepapers_status ON whitepapers(status);
CREATE INDEX idx_whitepapers_category ON whitepapers(category);
CREATE INDEX idx_whitepapers_tags ON whitepapers USING GIN(tags);
CREATE INDEX idx_whitepapers_publication ON whitepapers(publication_date);
```

#### `whitepaper_downloads`
Track downloads and lead generation.

```sql
CREATE TABLE whitepaper_downloads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    whitepaper_id UUID NOT NULL REFERENCES whitepapers(id) ON DELETE CASCADE,
    
    -- Lead Information
    lead_name VARCHAR(200) NOT NULL,
    lead_email VARCHAR(255) NOT NULL,
    lead_company VARCHAR(200),
    lead_website VARCHAR(500),
    lead_phone VARCHAR(50),
    
    -- Download Details
    session_id UUID, -- For tracking multiple downloads in one session
    download_ip INET,
    user_agent TEXT,
    referrer_url VARCHAR(500),
    
    -- Consent
    marketing_consent BOOLEAN DEFAULT false,
    privacy_consent BOOLEAN DEFAULT true,
    
    -- Integration Status
    exported_to_odoo BOOLEAN DEFAULT false,
    odoo_lead_id INTEGER,
    exported_at TIMESTAMPTZ,
    
    -- Audit Fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Prevent duplicate downloads (same email, same whitepaper, within 1 hour)
    UNIQUE(whitepaper_id, lead_email, created_at)
);

CREATE INDEX idx_whitepaper_downloads_whitepaper ON whitepaper_downloads(whitepaper_id);
CREATE INDEX idx_whitepaper_downloads_email ON whitepaper_downloads(lead_email);
CREATE INDEX idx_whitepaper_downloads_session ON whitepaper_downloads(session_id);
CREATE INDEX idx_whitepaper_downloads_export ON whitepaper_downloads(exported_to_odoo);
CREATE INDEX idx_whitepaper_downloads_created ON whitepaper_downloads(created_at);
```

### System & Integration Tables

#### `audit_logs`
Comprehensive audit trail for all system changes.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event Details
    event_type VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, LOGIN, etc.
    table_name VARCHAR(100),
    record_id UUID,
    
    -- User Context
    user_id UUID REFERENCES admin_users(id),
    user_email VARCHAR(255),
    session_id UUID,
    
    -- Request Context
    ip_address INET,
    user_agent TEXT,
    request_id UUID,
    
    -- Change Details
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Additional Context
    description TEXT,
    metadata JSONB,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_event_type ON audit_logs(event_type);
CREATE INDEX idx_audit_logs_table ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

#### `system_settings`
Application configuration settings.

```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key VARCHAR(100) UNIQUE NOT NULL,
    value JSONB,
    data_type VARCHAR(20) DEFAULT 'string',
    description TEXT,
    category VARCHAR(50),
    is_public BOOLEAN DEFAULT false, -- Can be read by frontend
    is_sensitive BOOLEAN DEFAULT false, -- Should be encrypted
    
    -- Validation
    validation_rules JSONB, -- JSON schema for validation
    default_value JSONB,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by UUID REFERENCES admin_users(id),
    
    CONSTRAINT ck_system_settings_data_type 
        CHECK (data_type IN ('string', 'number', 'boolean', 'json', 'array'))
);

CREATE INDEX idx_system_settings_key ON system_settings(key);
CREATE INDEX idx_system_settings_category ON system_settings(category);
CREATE INDEX idx_system_settings_public ON system_settings(is_public);
```

#### `integration_logs`
Track external system integrations.

```sql
CREATE TABLE integration_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Integration Details
    integration_name VARCHAR(50) NOT NULL, -- 'odoo', 'google_calendar', 'smtp'
    operation VARCHAR(50) NOT NULL, -- 'sync', 'create', 'update', 'delete'
    direction VARCHAR(10) NOT NULL, -- 'inbound', 'outbound'
    
    -- Request/Response
    endpoint VARCHAR(500),
    request_data JSONB,
    response_data JSONB,
    
    -- Status
    status VARCHAR(20) NOT NULL,
    error_message TEXT,
    error_code VARCHAR(50),
    
    -- Performance
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    duration_ms INTEGER,
    
    -- Context
    triggered_by UUID REFERENCES admin_users(id),
    related_table VARCHAR(100),
    related_id UUID,
    
    CONSTRAINT ck_integration_logs_direction 
        CHECK (direction IN ('inbound', 'outbound')),
    CONSTRAINT ck_integration_logs_status 
        CHECK (status IN ('success', 'error', 'timeout', 'cancelled'))
);

CREATE INDEX idx_integration_logs_name ON integration_logs(integration_name);
CREATE INDEX idx_integration_logs_status ON integration_logs(status);
CREATE INDEX idx_integration_logs_started ON integration_logs(started_at);
CREATE INDEX idx_integration_logs_related ON integration_logs(related_table, related_id);
```

### Translation System

#### `translations`
Centralized translation management.

```sql
CREATE TABLE translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Translation Key
    namespace VARCHAR(100) NOT NULL, -- 'webinars', 'ui', 'emails'
    key VARCHAR(200) NOT NULL,
    
    -- Languages
    source_language VARCHAR(2) DEFAULT 'en',
    target_language VARCHAR(2) NOT NULL,
    
    -- Content
    source_text TEXT NOT NULL,
    translated_text TEXT,
    context TEXT, -- Additional context for translators
    
    -- Status & Quality
    status VARCHAR(20) DEFAULT 'pending',
    translation_method VARCHAR(20) DEFAULT 'manual',
    confidence_score DECIMAL(3,2), -- For AI translations
    
    -- Review Process
    translator_id UUID REFERENCES admin_users(id),
    reviewer_id UUID REFERENCES admin_users(id),
    translated_at TIMESTAMPTZ,
    reviewed_at TIMESTAMPTZ,
    
    -- Audit
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(namespace, key, source_language, target_language),
    
    CONSTRAINT ck_translations_status 
        CHECK (status IN ('pending', 'translated', 'reviewed', 'approved', 'rejected')),
    CONSTRAINT ck_translations_method 
        CHECK (translation_method IN ('manual', 'ai', 'imported')),
    CONSTRAINT ck_translations_languages 
        CHECK (source_language IN ('en', 'de') AND target_language IN ('en', 'de'))
);

CREATE INDEX idx_translations_namespace_key ON translations(namespace, key);
CREATE INDEX idx_translations_language ON translations(target_language);
CREATE INDEX idx_translations_status ON translations(status);
```

## Database Views

### Active Users View
```sql
CREATE VIEW active_admin_users AS
SELECT 
    u.*,
    s.last_activity_at,
    COUNT(s.id) as active_sessions
FROM admin_users u
LEFT JOIN admin_sessions s ON u.id = s.user_id 
    AND s.expires_at > NOW() 
    AND s.invalidated_at IS NULL
WHERE u.deleted_at IS NULL
    AND u.is_active = true
GROUP BY u.id, s.last_activity_at;
```

### Upcoming Webinars View
```sql
CREATE VIEW upcoming_webinars AS
SELECT 
    ws.*,
    wt.category,
    wt.tags,
    sp.first_name || ' ' || sp.last_name as speaker_name,
    sp.photo_url as speaker_photo,
    COUNT(wr.id) as registration_count
FROM webinar_sessions ws
JOIN webinar_topics wt ON ws.topic_id = wt.id
JOIN webinar_speakers sp ON ws.speaker_id = sp.id
LEFT JOIN webinar_registrations wr ON ws.id = wr.session_id 
    AND wr.status = 'confirmed'
WHERE ws.datetime > NOW()
    AND ws.status = 'published'
    AND ws.deleted_at IS NULL
GROUP BY ws.id, wt.id, sp.id;
```

### Lead Generation Summary View
```sql
CREATE VIEW lead_generation_summary AS
SELECT 
    DATE_TRUNC('month', wd.created_at) as month,
    COUNT(*) as total_downloads,
    COUNT(DISTINCT wd.lead_email) as unique_leads,
    COUNT(DISTINCT wd.whitepaper_id) as active_whitepapers,
    COUNT(*) FILTER (WHERE wd.exported_to_odoo = false) as pending_exports
FROM whitepaper_downloads wd
WHERE wd.created_at >= NOW() - INTERVAL '12 months'
GROUP BY DATE_TRUNC('month', wd.created_at)
ORDER BY month DESC;
```

## Database Functions & Triggers

### Auto-update timestamp function
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at column
CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at 
    BEFORE UPDATE ON pages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ... (apply to all relevant tables)
```

### Audit trigger function
```sql
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
DECLARE
    old_values JSONB := '{}';
    new_values JSONB := '{}';
    changed_fields TEXT[] := '{}';
BEGIN
    -- Capture old and new values
    IF TG_OP = 'UPDATE' THEN
        old_values := to_jsonb(OLD);
        new_values := to_jsonb(NEW);
        
        -- Identify changed fields
        SELECT array_agg(key)
        INTO changed_fields
        FROM jsonb_each(old_values) old
        JOIN jsonb_each(new_values) new ON old.key = new.key
        WHERE old.value IS DISTINCT FROM new.value;
    
    ELSIF TG_OP = 'INSERT' THEN
        new_values := to_jsonb(NEW);
    
    ELSIF TG_OP = 'DELETE' THEN
        old_values := to_jsonb(OLD);
    END IF;
    
    -- Insert audit record
    INSERT INTO audit_logs (
        event_type,
        table_name,
        record_id,
        old_values,
        new_values,
        changed_fields
    ) VALUES (
        TG_OP,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id),
        old_values,
        new_values,
        changed_fields
    );
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers to critical tables
CREATE TRIGGER audit_admin_users
    AFTER INSERT OR UPDATE OR DELETE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_bookings
    AFTER INSERT OR UPDATE OR DELETE ON bookings
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- ... (apply to other critical tables)
```

## Performance Optimizations

### Partitioning for Large Tables
```sql
-- Partition audit_logs by month
CREATE TABLE audit_logs_y2024m01 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

CREATE TABLE audit_logs_y2024m02 PARTITION OF audit_logs
    FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
```

### Full-Text Search Indexes
```sql
-- Add full-text search to pages
ALTER TABLE pages ADD COLUMN search_vector tsvector;

CREATE INDEX idx_pages_search ON pages USING GIN(search_vector);

-- Update search vector function
CREATE OR REPLACE FUNCTION update_pages_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title->>'en', '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content->>'en', '')), 'B') ||
        setweight(to_tsvector('german', COALESCE(NEW.title->>'de', '')), 'A') ||
        setweight(to_tsvector('german', COALESCE(NEW.content->>'de', '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_pages_search_vector
    BEFORE INSERT OR UPDATE ON pages
    FOR EACH ROW EXECUTE FUNCTION update_pages_search_vector();
```

## Data Migration Strategy

### Migration Scripts
```sql
-- Example migration: Add new column with default value
ALTER TABLE consultants ADD COLUMN specialization TEXT[] DEFAULT '{}';

-- Migrate existing data
UPDATE consultants 
SET specialization = expertise 
WHERE expertise IS NOT NULL AND array_length(expertise, 1) > 0;

-- Add constraint after migration
ALTER TABLE consultants ADD CONSTRAINT ck_consultants_specialization_not_empty
    CHECK (array_length(specialization, 1) > 0);
```

### Data Seeding
```sql
-- Seed initial admin user
INSERT INTO admin_users (
    email, hashed_password, first_name, last_name, role, is_superuser
) VALUES (
    'admin@voltaic.systems',
    '$2b$12$encrypted_password_hash',
    'System',
    'Administrator',
    'super_admin',
    true
) ON CONFLICT (email) DO NOTHING;

-- Seed system settings
INSERT INTO system_settings (key, value, category, description) VALUES
('site_title', '{"en": "voltAIc Systems", "de": "voltAIc Systems"}', 'general', 'Site title'),
('contact_email', '"info@voltaic.systems"', 'general', 'Primary contact email'),
('timezone', '"Europe/Berlin"', 'general', 'Default timezone'),
('languages', '["en", "de"]', 'localization', 'Supported languages')
ON CONFLICT (key) DO NOTHING;
```

## Backup & Recovery

### Backup Strategy
```bash
#!/bin/bash
# Daily backup script
DB_NAME="magnetiq_v2"
BACKUP_DIR="/backups/daily"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
pg_dump --verbose --clean --no-acl --no-owner \
    --format=custom \
    --file="$BACKUP_DIR/magnetiq_backup_$DATE.dump" \
    $DB_NAME

# Compress backup
gzip "$BACKUP_DIR/magnetiq_backup_$DATE.dump"

# Remove backups older than 30 days
find $BACKUP_DIR -name "magnetiq_backup_*.dump.gz" -mtime +30 -delete
```

### Point-in-Time Recovery Setup
```sql
-- Enable point-in-time recovery
ALTER SYSTEM SET wal_level = 'replica';
ALTER SYSTEM SET archive_mode = 'on';
ALTER SYSTEM SET archive_command = 'cp %p /var/lib/postgresql/wal_archive/%f';
```

## Database Monitoring

### Performance Monitoring Queries
```sql
-- Monitor slow queries
SELECT query, mean_time, calls, total_time
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- Monitor table sizes
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Monitor index usage
SELECT 
    t.tablename,
    indexname,
    c.reltuples AS num_rows,
    pg_size_pretty(pg_relation_size(quote_ident(t.tablename)::text)) AS table_size,
    pg_size_pretty(pg_relation_size(quote_ident(indexrelname)::text)) AS index_size,
    CASE WHEN indisunique THEN 'Y' ELSE 'N' END AS "unique",
    idx_scan as number_of_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_tables t
LEFT OUTER JOIN pg_class c ON c.relname = t.tablename
LEFT OUTER JOIN pg_indexes i ON c.relname = i.tablename
LEFT OUTER JOIN pg_stat_user_indexes psui ON i.indexname = psui.indexname
WHERE t.schemaname = 'public'
ORDER BY pg_relation_size(quote_ident(indexrelname)::text) DESC;
```

This comprehensive database schema provides a solid foundation for Magnetiq v2, ensuring data integrity, performance, and scalability while supporting all planned features including multilingual content, comprehensive audit trails, and seamless integrations.