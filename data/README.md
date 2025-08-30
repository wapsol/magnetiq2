# Magnetiq v2 - Data Storage Organization

This directory contains all data-related files for the Magnetiq v2 application, ensuring proper organization and separation of concerns.

## Directory Structure

```
data/
├── uploads/          # User uploaded files (consultant documents, media, etc.)
├── exports/          # Generated export files (reports, analytics, backups)
├── backups/          # Database backups and system snapshots
├── logs/             # Application and integration logs
├── cache/            # Cached data and temporary processing files
└── temp/             # Temporary files and processing workspace
```

## Data Categories

### `/uploads/` - User Uploaded Content
- **Consultant Documents**: KYC documents, certifications, tax forms
- **Profile Media**: Consultant photos, company logos, media assets
- **Content Assets**: Whitepaper files, webinar recordings, marketing materials
- **Import Files**: CSV uploads for bulk operations

### `/exports/` - Generated Data Files
- **Analytics Reports**: Performance reports, financial summaries
- **Export Files**: CSV/Excel exports from admin panels
- **Backup Exports**: Data exports for external backup systems
- **Integration Exports**: Data prepared for external system imports

### `/backups/` - System Backups
- **Database Backups**: SQLite database snapshots
- **Configuration Backups**: System settings and integration configurations
- **File System Backups**: Complete application state snapshots

### `/logs/` - Application Logs
- **Application Logs**: Main application activity and errors
- **Integration Logs**: External service interaction logs
- **Security Logs**: Authentication attempts, suspicious activities
- **Performance Logs**: System performance and optimization data

### `/cache/` - Cached Data
- **API Response Cache**: Cached responses from external services
- **Processed Data**: Pre-processed analytics and report data
- **Session Data**: Temporary user session information
- **Media Processing**: Optimized images and media files

### `/temp/` - Temporary Files
- **Processing Workspace**: Temporary files during data processing
- **Upload Staging**: Files during upload and validation process
- **Export Generation**: Temporary files during report generation
- **Integration Processing**: Temporary data during external service sync

## Security Considerations

- All sensitive data files are encrypted at rest
- Access to data directories is restricted by file system permissions
- Temporary files are automatically cleaned up after processing
- Backup files are encrypted and rotated according to retention policies

## File Organization Guidelines

1. **Use descriptive naming conventions** with timestamps
2. **Organize by date and type** for easy retrieval
3. **Implement automatic cleanup** for temporary and cache files
4. **Maintain proper file permissions** and access controls
5. **Regular backup and archival** of important data

## Integration Points

This data organization structure is referenced throughout the system specifications:
- [Database Configuration](../docs/spec_v2/backend/database.md)
- [File Storage Integration](../docs/spec_v2/integrations/integrations.md)
- [Admin Panel File Management](../docs/spec_v2/frontend/adminpanel/admin.md)
- [Security and Compliance](../docs/spec_v2/security.md)