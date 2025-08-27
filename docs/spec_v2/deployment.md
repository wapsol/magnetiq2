# Magnetiq v2 - Deployment Specification

## Architecture Overview
![Deployment Architecture](../diagrams/assets/specs/deployment_architecture.png)

Magnetiq v2 deployment focuses on simplicity and rapid deployment using SQLite database and minimal infrastructure requirements. This specification covers Docker-based deployment for both development and production environments.

### Simple Stack Architecture
- **Frontend**: React SPA served via Nginx (Port 8036)
- **Backend**: FastAPI application (Port 3036)
- **Database**: SQLite file-based database with WAL mode
- **Web Server**: Nginx for static files and reverse proxy
- **No External Dependencies**: No Redis, Celery, or message queuing systems

## Environment Requirements

### Development Environment
- **Docker & Docker Compose** for containerized development
- **Node.js 18+** for frontend development tooling
- **Python 3.11+** for backend development
- **4GB RAM minimum** for comfortable development
- **10GB free disk space** for containers and data

### Production Environment
- **Linux server** (Ubuntu 20.04+ recommended)
- **Docker & Docker Compose** for container orchestration
- **2GB RAM minimum** for production workload
- **20GB free disk space** for application data and backups
- **SSL certificate** (Let's Encrypt recommended)
- **Domain name** configured with proper DNS records

## Docker Configuration

### Container Architecture
![Container Architecture](../diagrams/assets/specs/container_architecture.png)

The application runs as three primary Docker containers:
- **Frontend Container**: React application with static file serving
- **Backend Container**: FastAPI application with Python runtime
- **Nginx Container**: Reverse proxy and SSL termination

All containers communicate through a dedicated Docker bridge network with persistent volume mounts for data storage.

### Development Environment
![Development Deployment](../diagrams/assets/specs/development_deployment.png)

The development environment provides:
- **Hot reload capabilities** for both frontend and backend
- **Volume mounting** for real-time code changes
- **Development database** with debugging enabled
- **Simplified networking** without SSL complexity
- **Direct port access** for debugging and testing

### Production Environment  
![Production Deployment](../diagrams/assets/specs/production_deployment.png)

The production environment includes:
- **SSL termination** at the Nginx layer
- **Health checks** for container monitoring
- **Persistent data volumes** for database and media storage
- **Automated restarts** for container reliability
- **Security headers** and hardened configurations
- **Backup systems** for data protection

## Nginx Configuration

### Request Routing
Nginx handles all incoming requests and routes them appropriately:
- **Static assets** served directly from filesystem
- **API requests** proxied to FastAPI backend
- **SPA routes** handled with fallback to index.html
- **SSL certificates** managed automatically
- **Compression** enabled for text-based content

### Security Configuration
Production Nginx includes comprehensive security measures:
- **HTTPS redirection** for all HTTP requests
- **Security headers** (HSTS, X-Frame-Options, CSP)
- **SSL protocols** limited to TLS 1.2 and 1.3
- **Strong cipher suites** for encryption
- **Rate limiting** for API endpoints

## Environment Configuration

### Development Environment Variables
Development configuration emphasizes ease of use and debugging:
- **Debug mode enabled** for detailed error messages
- **Local database** with development seed data
- **Permissive CORS** for frontend development
- **Development SMTP** using services like Mailtrap
- **Social media sandbox** credentials for testing

### Production Environment Variables
Production configuration prioritizes security and performance:
- **Debug mode disabled** for security
- **Production database** with optimized settings
- **Restricted CORS** to allowed domains only
- **Production SMTP** for transactional emails
- **Live social media** credentials with proper rate limiting
- **Enhanced security** with encryption keys and secrets management

## Deployment Process

### Deployment Workflow
![Deployment Process Flow](../diagrams/assets/specs/deployment_process_flow.png)

```mermaid
flowchart LR
    A[Code Changes] --> B[Local Testing]
    B --> C[Docker Build]
    C --> D{Tests Pass?}
    D -->|Yes| E[Backup Database]
    D -->|No| F[Fix Issues]
    F --> A
    E --> G[Deploy Production]
    G --> H[Health Checks]
    H --> I{System Healthy?}
    I -->|Yes| J[Deployment Success]
    I -->|No| K[Rollback]
    K --> L[Investigation]
    L --> A
```

### Development Deployment Process
1. **Repository clone** with development branch
2. **Docker Compose startup** using development configuration
3. **Database initialization** with development schema
4. **Admin user creation** for testing access
5. **Service verification** through health check endpoints

### Production Deployment Process
1. **Server preparation** with required system packages
2. **Application setup** with production configuration
3. **Docker image building** for frontend and backend
4. **SSL certificate acquisition** through Let's Encrypt
5. **Environment configuration** with production secrets
6. **Application deployment** with health monitoring
7. **Database initialization** with production schema
8. **Admin account creation** with secure credentials

## Database Management

### Database Management & Backup Flow
![Database Management Flow](../diagrams/assets/specs/database_management_flow.png)

### SQLite Operations
SQLite serves as the primary database with the following characteristics:
- **WAL mode enabled** for better concurrent access
- **VACUUM operations** run weekly for optimization
- **Integrity checks** performed regularly
- **Size monitoring** with automated alerts
- **Backup automation** with retention policies

### Migration Management
Database schema changes are handled through:
- **Alembic migrations** for schema versioning
- **Backup creation** before migration execution
- **Rollback procedures** for migration failures
- **Testing protocols** for migration validation

## SSL Certificate Management

### SSL Certificate Flow
![SSL Certificate Flow](../diagrams/assets/specs/ssl_certificate_flow.png)

```mermaid
flowchart LR
    A[Certbot Client] --> B[ACME Challenge]
    B --> C[Let's Encrypt CA]
    C --> D[SSL Certificate]
    D --> E[Nginx Configuration]
    F[Cron Scheduler] --> G[Auto Renewal]
    G --> A
    G --> H[Nginx Reload]
```

### Certificate Lifecycle
- **Initial certificate acquisition** through domain validation
- **Automated renewal** via cron jobs every 12 hours
- **Certificate validation** before deployment
- **Nginx reloading** without service interruption
- **Monitoring alerts** for certificate expiry

## Monitoring & Health Checks

### Application Health Monitoring
- **Health check endpoints** for service status verification
- **Database connectivity** monitoring and alerting
- **Disk space monitoring** with threshold alerts
- **Log aggregation** and rotation management
- **Performance metrics** collection and analysis

### Operational Procedures
- **Log management** with automated rotation
- **System resource monitoring** for capacity planning
- **Backup verification** and restoration testing
- **Security updates** and patch management
- **Performance optimization** based on metrics

## Backup & Recovery

### Backup Strategy
- **Daily database backups** with timestamp naming
- **Media file backups** compressed for storage efficiency
- **Configuration backups** including environment files
- **Retention policies** maintaining 7-day backup history
- **Backup verification** through automated testing

### Recovery Procedures
- **Service shutdown** during restoration process
- **Database restoration** from specified backup point
- **Media file restoration** preserving directory structure
- **Configuration restoration** with environment validation
- **Service restart** with health verification

## Performance Optimization

### System-Level Optimizations
- **File descriptor limits** increased for high concurrency
- **Network connection limits** optimized for load
- **Docker resource limits** configured for stability
- **Kernel parameters** tuned for web workloads

### Application-Level Optimizations
- **SQLite WAL mode** for improved concurrent read performance
- **Nginx caching** with appropriate cache headers
- **Gzip compression** for text-based content delivery
- **Static asset optimization** with long-term caching
- **Database query optimization** with proper indexing

## Troubleshooting

### Common Issues & Resolutions
- **Database lock errors**: Resolved through connection pool optimization
- **High memory usage**: Addressed via SQLite cache tuning
- **SSL certificate problems**: Fixed through automated renewal verification
- **Container restart loops**: Diagnosed via health check analysis
- **Network connectivity issues**: Resolved through Docker network inspection

## Migration to v3 Architecture

### Future Architecture Considerations
When upgrading to Magnetiq v3 with Enterprise Service Bus capabilities:
- **Database transition**: SQLite to PostgreSQL with Redis caching
- **Message queuing**: Integration of Celery with Redis broker
- **Service architecture**: Monolithic to microservices approach
- **Integration patterns**: HTTP clients to ESB-based communication
- **Deployment complexity**: Single container to multi-service orchestration

### Data Migration Strategy
- **Export procedures** for v2 data extraction
- **Schema mapping** between v2 and v3 data models
- **Incremental migration** for zero-downtime transitions
- **Validation procedures** for data integrity verification

## Support & Maintenance

### Regular Maintenance Schedule
- **Weekly tasks**: Database optimization and log review
- **Daily tasks**: Backup verification and system monitoring
- **Monthly tasks**: Security updates and dependency upgrades
- **Quarterly tasks**: Performance review and capacity planning

### Monitoring Checklist
- Application health endpoints responding correctly
- Database file size within acceptable limits
- System disk space availability above thresholds
- SSL certificate validity with adequate renewal lead time
- Backup completion status and restoration capability
- Log file rotation functioning properly
- Security patches applied and system updated

This deployment specification provides a comprehensive foundation for reliable Magnetiq v2 operations while maintaining simplicity and enabling future architectural evolution.