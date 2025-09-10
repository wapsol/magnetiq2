# Magnetiq v2 - Data Organization Specification

## Overview

The Magnetiq v2 platform follows a structured data organization approach, ensuring all data-related files are centrally managed within the `./data/` directory. This specification defines the complete data storage hierarchy, security considerations, and integration points across the system.

→ **Implements**: [System Architecture](./architecture.md#data-layer)
← **Referenced by**: [Database Schema](./backend/database.md), [Integration Management](./frontend/adminpanel/integration-management.md)
⚡ **Dependencies**: [Security Framework](./security.md), [Privacy Compliance](./privacy-compliance.md)

## Directory Structure

### Root Data Organization
```
data/
├── uploads/          # User uploaded files and external imports
├── exports/          # Generated exports and reports
├── backups/          # Database backups and system snapshots
├── logs/             # Application and integration logs
├── cache/            # Cached data and temporary processing files
├── temp/             # Temporary files and processing workspace
├── magnetiq.db       # Main SQLite database file
├── magnetiq.db-shm   # SQLite shared memory file
├── magnetiq.db-wal   # SQLite write-ahead log file
└── README.md         # Data organization documentation
```

## Detailed Data Categories

### 1. Uploads Directory (`./data/uploads/`)

#### User Generated Content
```
uploads/
├── consultants/           # Consultant-related files
│   ├── profiles/          # Profile photos and media
│   ├── documents/         # KYC documents, certifications
│   │   ├── kyc/          # KYC verification documents
│   │   ├── tax/          # Tax forms and compliance documents
│   │   └── certificates/ # Professional certifications
│   └── media/            # Consultant marketing materials
├── content/              # Content management uploads
│   ├── whitepapers/      # Whitepaper PDF files
│   ├── webinars/         # Webinar recordings and materials
│   ├── images/           # General image assets
│   └── documents/        # General document uploads
├── integrations/         # Integration configuration files
│   ├── credentials/      # Encrypted API keys and certificates
│   ├── certificates/     # SSL certificates and security files
│   └── configs/          # Integration configuration imports
└── imports/              # Bulk import files (CSV, Excel)
    ├── consultants/      # Consultant data imports
    ├── coupons/          # Coupon bulk imports
    └── content/          # Content bulk imports
```

#### File Management Policies
```typescript
interface FileUploadConfig {
  consultantDocuments: {
    maxSize: 10485760; // 10MB per file
    allowedTypes: ['pdf', 'jpg', 'jpeg', 'png'];
    encryptionRequired: true;
    retentionDays: 2555; // 7 years for compliance
  };
  
  contentMedia: {
    maxSize: 52428800; // 50MB per file
    allowedTypes: ['pdf', 'jpg', 'jpeg', 'png', 'mp4', 'mov'];
    encryptionRequired: false;
    retentionDays: 365; // 1 year
  };
  
  integrationFiles: {
    maxSize: 1048576; // 1MB per file
    allowedTypes: ['json', 'xml', 'pem', 'crt', 'key'];
    encryptionRequired: true;
    retentionDays: 90; // 3 months
  };
}
```

### 2. Exports Directory (`./data/exports/`)

#### Generated Reports and Data Exports
```
exports/
├── analytics/            # Performance and business intelligence reports
│   ├── consultant/       # Consultant performance reports
│   ├── financial/        # Revenue and payment reports
│   ├── booking/          # Booking analytics and trends
│   └── coupon/           # Coupon usage and performance reports
├── compliance/           # Regulatory and compliance exports
│   ├── gdpr/            # GDPR data exports
│   ├── financial/       # Financial compliance reports
│   └── audit/           # Security audit exports
├── integrations/         # Integration usage and configuration exports
│   ├── usage/           # API usage reports
│   ├── configs/         # Configuration backups
│   └── audits/          # Integration audit reports
├── backups/             # Scheduled data exports for external backup
└── manual/              # Manual exports requested by administrators
```

#### Export Configuration
```typescript
interface ExportSettings {
  automaticExports: {
    daily: ['analytics_summary', 'integration_logs'];
    weekly: ['consultant_performance', 'financial_summary'];
    monthly: ['compliance_report', 'full_backup_export'];
  };
  
  retentionPolicies: {
    analytics: 90; // days
    compliance: 2555; // 7 years
    backups: 30; // days
    manual: 7; // days
  };
  
  encryptionRequired: {
    financial: true;
    personal: true;
    analytics: false;
    system: false;
  };
}
```

### 3. Backups Directory (`./data/backups/`)

#### Database and System Backups
```
backups/
├── database/             # SQLite database backups
│   ├── daily/           # Daily incremental backups
│   ├── weekly/          # Weekly full backups
│   └── monthly/         # Monthly archive backups
├── configurations/       # System configuration backups
│   ├── integration/     # Integration configurations
│   ├── admin/           # Admin panel settings
│   └── security/        # Security configurations
├── uploads/             # Backup of critical uploaded files
└── disaster-recovery/   # Complete system snapshots
```

#### Backup Automation
```bash
#!/bin/bash
# Automated backup script - runs daily via cron

BACKUP_DIR="./data/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Database backup
sqlite3 data/magnetiq.db .dump | gzip > "$BACKUP_DIR/database/daily/magnetiq_$DATE.sql.gz"

# Critical files backup
tar -czf "$BACKUP_DIR/uploads/uploads_$DATE.tar.gz" data/uploads/consultants/documents/

# Configuration backup
cp -r backend/app/config.py "$BACKUP_DIR/configurations/config_$DATE.py"

# Cleanup old backups (keep 30 days)
find "$BACKUP_DIR" -type f -mtime +30 -delete
```

### 4. Logs Directory (`./data/logs/`)

#### Application and Integration Logs
```
logs/
├── application/          # Main application logs
│   ├── access.log       # HTTP access logs
│   ├── error.log        # Application error logs
│   ├── debug.log        # Debug information (dev only)
│   └── performance.log  # Performance monitoring
├── integrations/        # External service integration logs
│   ├── stripe/          # Payment processing logs
│   ├── brevo/           # Email service logs
│   ├── linkedin/        # LinkedIn API logs
│   └── webhooks/        # Webhook processing logs
├── security/            # Security and audit logs
│   ├── auth.log         # Authentication attempts
│   ├── admin.log        # Admin panel activities
│   ├── api.log          # API access and usage
│   └── suspicious.log   # Security incident logs
├── jobs/                # Background job logs
│   ├── scraping/        # LinkedIn scraping jobs
│   ├── payments/        # Payment processing jobs
│   └── reports/         # Report generation jobs
└── database/            # Database operation logs
    ├── queries.log      # Database queries (dev only)
    └── migrations.log   # Schema migration logs
```

#### Log Rotation and Management
```typescript
interface LogConfig {
  rotation: {
    maxSize: 104857600; // 100MB per log file
    maxFiles: 10; // Keep 10 rotated files
    compress: true; // Gzip old log files
  };
  
  levels: {
    production: 'INFO';
    staging: 'DEBUG';
    development: 'DEBUG';
  };
  
  destinations: {
    console: boolean;
    file: boolean;
    remote: boolean; // Future: centralized logging
  };
}
```

### 5. Cache Directory (`./data/cache/`)

#### Cached Data and Processing Files
```
cache/
├── api/                  # Cached API responses
│   ├── linkedin/        # LinkedIn API response cache
│   ├── stripe/          # Payment API response cache
│   └── internal/        # Internal API cache
├── media/               # Processed and optimized media
│   ├── thumbnails/      # Generated image thumbnails
│   ├── optimized/       # Optimized images and videos
│   └── converted/       # Format-converted files
├── reports/             # Cached report data
│   ├── analytics/       # Pre-processed analytics data
│   └── dashboard/       # Dashboard widget cache
├── sessions/            # User session data
└── rate-limits/         # Rate limiting data
```

#### Cache Management
```typescript
interface CacheConfig {
  ttl: { // Time to live in seconds
    apiResponses: 3600; // 1 hour
    mediaFiles: 86400; // 24 hours
    reports: 7200; // 2 hours
    sessions: 1800; // 30 minutes
  };
  
  cleanup: {
    interval: 3600; // Clean every hour
    maxSize: 1073741824; // 1GB total cache size
    strategy: 'lru'; // Least recently used
  };
}
```

### 6. Temp Directory (`./data/temp/`)

#### Temporary Processing Files
```
temp/
├── processing/          # File processing workspace
│   ├── uploads/        # Files during upload processing
│   ├── imports/        # Bulk import processing
│   └── exports/        # Report generation workspace
├── downloads/           # Temporary downloads from external services
├── conversions/         # Media conversion workspace
└── scraping/           # LinkedIn scraping temporary data
```

#### Automatic Cleanup
```bash
# Temp file cleanup - runs every hour via cron
find ./data/temp -type f -mmin +60 -delete  # Delete files older than 1 hour
find ./data/temp -type d -empty -delete     # Remove empty directories
```

## Security and Access Control

### File System Permissions
```bash
# Set proper permissions for data directory
chmod 750 ./data                    # Owner: rwx, Group: r-x, Other: none
chmod 700 ./data/uploads             # Owner only access for sensitive uploads
chmod 755 ./data/exports             # Read access for exports
chmod 700 ./data/backups             # Owner only access for backups
chmod 644 ./data/logs                # Read access for logs
chmod 755 ./data/cache               # Cache access for application
chmod 700 ./data/temp                # Owner only for temporary files
```

### Encryption Standards
- **Database**: SQLite database files are encrypted using SQLCipher
- **Sensitive Files**: AES-256 encryption for KYC documents and credentials
- **Backups**: All backups are encrypted before storage
- **Transit**: All file transfers use TLS 1.3 encryption

### Access Monitoring
```typescript
interface DataAccessAudit {
  fileAccess: {
    logAllAccess: boolean;
    alertOnSensitive: boolean;
    trackUserActivity: boolean;
  };
  
  permissions: {
    adminFullAccess: boolean;
    consultantOwnFiles: boolean;
    integrationServiceFiles: boolean;
  };
  
  monitoring: {
    suspiciousActivity: boolean;
    bulkOperations: boolean;
    unauthorizedAccess: boolean;
  };
}
```

## Integration Points

### Backend Configuration
The backend configuration has been updated to reference the data directory structure:

```python
# backend/app/config.py
class Settings(BaseSettings):
    # Database location
    database_url: str = "sqlite+aiosqlite:///./data/magnetiq.db"
    
    # Data storage paths
    data_dir: str = "./data"
    uploads_dir: str = "./data/uploads"
    exports_dir: str = "./data/exports"
    backups_dir: str = "./data/backups"
    logs_dir: str = "./data/logs"
    cache_dir: str = "./data/cache"
    temp_dir: str = "./data/temp"
```

### Database Integration
All database operations now reference the centralized data location:
- **Connection String**: Updated to use `./data/magnetiq.db`
- **Backup Scripts**: Modified to use `./data/backups/` directory
- **Migration Logs**: Stored in `./data/logs/database/`

### Admin Panel Integration
Admin interfaces reference the data organization:
- **File Upload Components**: Use structured upload directories
- **Export Functions**: Generate files in organized export directories
- **Log Viewers**: Access logs from structured log directories
- **Backup Management**: Interface with organized backup directories

## Environment-Specific Configuration

### Development Environment
```bash
# Development data paths (local development)
DATA_DIR=./data
DATABASE_URL=sqlite+aiosqlite:///./data/magnetiq.db
UPLOADS_DIR=./data/uploads
LOGS_LEVEL=DEBUG
CACHE_ENABLED=true
```

### Production Environment
```bash
# Production data paths (Docker container)
DATA_DIR=/app/data
DATABASE_URL=sqlite+aiosqlite:///app/data/magnetiq.db
UPLOADS_DIR=/app/data/uploads
LOGS_LEVEL=INFO
CACHE_ENABLED=true
BACKUP_ENABLED=true
ENCRYPTION_ENABLED=true
```

## Future Enhancements

### Planned Improvements
- **Distributed Storage**: Support for cloud storage backends (S3, GCS)
- **Database Migration**: PostgreSQL migration path while maintaining data organization
- **Advanced Encryption**: Hardware security module (HSM) integration
- **Centralized Logging**: Integration with external log management systems
- **Real-time Backup**: Continuous backup to external systems

### Scalability Considerations
- **Partition Strategy**: Date-based partitioning for large datasets
- **Archival Process**: Automated archival of old data
- **CDN Integration**: Content delivery network for media files
- **Database Sharding**: Horizontal scaling preparation

## Cross-References

### System Integration
→ **Database Schema**: [Database Specification](./backend/database.md)
→ **Backend Configuration**: [Backend API](./backend/api.md)
→ **Security Framework**: [Security Specification](./security.md)

### Admin Panel Integration
→ **Integration Management**: [Integration Management](./frontend/adminpanel/integration-management.md)
→ **File Management**: [Content Management](./frontend/adminpanel/content-management.md)
→ **Backup Operations**: [System Settings](./frontend/adminpanel/system-settings.md)

### Compliance and Security
→ **Privacy Compliance**: [Privacy Policy](./privacy-compliance.md)
→ **Data Retention**: [Security Framework](./security.md#data-retention)
→ **Audit Requirements**: [Compliance Framework](./compliance.md)