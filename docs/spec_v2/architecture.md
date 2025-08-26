# Magnetiq v2 - System Architecture Specification

## Executive Summary

Magnetiq v2 is a comprehensive Content Management System (CMS) with integrated business automation features including webinars, whitepapers, consultation booking, and CRM integration. This specification defines the complete system architecture for a scalable, maintainable, and secure implementation.

## Technology Stack

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI (async, high-performance)
- **ORM**: SQLAlchemy 2.0 with Alembic for migrations
- **Database**: PostgreSQL 14+ (production), SQLite (development)
- **Cache**: Redis 7.0+ for session management and caching
- **Task Queue**: Celery with Redis broker for async operations
- **API Documentation**: OpenAPI/Swagger (auto-generated)

### Frontend
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit with RTK Query
- **UI Framework**: Tailwind CSS with Headless UI components
- **Build Tool**: Vite
- **Testing**: Jest + React Testing Library
- **Form Handling**: React Hook Form with Zod validation

### Infrastructure
- **Container**: Docker with Docker Compose
- **Web Server**: Nginx (reverse proxy, static files)
- **Process Manager**: Gunicorn with Uvicorn workers
- **Monitoring**: Prometheus + Grafana
- **Logging**: Structured logging with JSON format
- **File Storage**: Local filesystem with S3-compatible backup

## System Architecture

### Microservices Design

```
┌─────────────────────────────────────────────────────────────┐
│                         Load Balancer                        │
│                            (Nginx)                           │
└────────────┬──────────────────────────────┬─────────────────┘
             │                              │
             ▼                              ▼
┌─────────────────────────┐    ┌──────────────────────────┐
│   Public Frontend       │    │    Admin Frontend        │
│   (React + TypeScript)  │    │  (React + TypeScript)    │
│   Port: 3000           │    │   Port: 8088             │
└───────────┬─────────────┘    └───────────┬──────────────┘
            │                               │
            └───────────┬───────────────────┘
                        │
                        ▼
            ┌───────────────────────────┐
            │      API Gateway         │
            │    (FastAPI Router)       │
            │      Port: 8000          │
            └───────────┬───────────────┘
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   Auth       │ │   Content    │ │  Business    │
│   Service    │ │   Service    │ │  Service     │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        ▼
            ┌───────────────────────────┐
            │      PostgreSQL          │
            │    (Primary Database)     │
            └───────────────────────────┘
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
    ┌──────────────┐       ┌──────────────┐
    │    Redis     │       │   Celery     │
    │   (Cache)    │       │  (Workers)   │
    └──────────────┘       └──────────────┘
```

## Service Architecture

### 1. Authentication Service
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Session management with Redis
- Password reset with email verification
- Two-factor authentication support (future)
- API key management for external integrations

### 2. Content Service
- Page builder with drag-and-drop components
- Multi-language content management
- Media library with image optimization
- Version control for content changes
- SEO metadata management
- Content scheduling and publishing workflow

### 3. Business Service
- Webinar management and registration
- Whitepaper distribution with lead capture
- Consultation booking with calendar integration
- Email automation and notifications
- Analytics and reporting
- CRM integration (Odoo)

## API Design Principles

### RESTful Standards
- Resource-based URLs: `/api/v1/resources/{id}`
- HTTP methods: GET, POST, PUT, PATCH, DELETE
- Status codes: 2xx (success), 4xx (client error), 5xx (server error)
- Consistent error response format

### API Versioning
- URL path versioning: `/api/v1/`, `/api/v2/`
- Backward compatibility for at least 2 versions
- Deprecation notices in headers

### Response Format
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "metadata": {
    "timestamp": "2024-01-01T12:00:00Z",
    "version": "1.0.0",
    "request_id": "uuid"
  }
}
```

### Error Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [{
      "field": "email",
      "message": "Invalid email format"
    }]
  },
  "metadata": {
    "timestamp": "2024-01-01T12:00:00Z",
    "request_id": "uuid"
  }
}
```

## Database Architecture

### Design Principles
- Normalized design (3NF minimum)
- Soft deletes for audit trail
- UUID primary keys for distributed systems
- Timestamp fields: created_at, updated_at
- Optimistic locking with version fields
- Full-text search indexes for content

### Connection Pooling
- Min connections: 5
- Max connections: 20
- Connection timeout: 30 seconds
- Idle timeout: 300 seconds

### Backup Strategy
- Automated daily backups
- Point-in-time recovery capability
- Encrypted backup storage
- 30-day retention policy

## Security Architecture

### Authentication & Authorization
- JWT tokens with 15-minute expiry
- Refresh tokens with 7-day expiry
- Role hierarchy: Super Admin > Admin > Editor > Viewer
- Resource-level permissions
- API rate limiting per user/IP

### Data Protection
- AES-256 encryption for sensitive data
- TLS 1.3 for all communications
- CORS configuration with whitelisted origins
- Input validation and sanitization
- SQL injection prevention with parameterized queries
- XSS protection with content security policy

### Compliance
- GDPR compliance for EU users
- Data retention policies
- Right to be forgotten implementation
- Audit logging for all data changes
- Privacy policy and cookie consent

## Performance Requirements

### Response Times
- API endpoints: < 200ms (p95)
- Page load: < 2 seconds
- Database queries: < 100ms
- Cache hit ratio: > 80%

### Scalability
- Horizontal scaling for API servers
- Database read replicas for scaling reads
- CDN for static assets
- Load balancing with health checks
- Auto-scaling based on CPU/memory metrics

### Availability
- 99.9% uptime SLA
- Zero-downtime deployments
- Graceful shutdown handling
- Circuit breaker pattern for external services
- Retry logic with exponential backoff

## Development Standards

### Code Organization
```
magnetiq2/
├── backend/
│   ├── app/
│   │   ├── api/          # API endpoints
│   │   ├── core/         # Core functionality
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── utils/        # Utilities
│   ├── migrations/       # Database migrations
│   ├── tests/           # Test suite
│   └── scripts/         # Utility scripts
├── frontend/
│   ├── public/          # Public assets
│   ├── admin/           # Admin panel
│   └── src/
│       ├── components/  # React components
│       ├── features/    # Feature modules
│       ├── hooks/       # Custom hooks
│       ├── services/    # API services
│       ├── store/       # Redux store
│       └── utils/       # Utilities
├── specs/              # Specifications
├── docs/               # Documentation
└── docker/             # Docker configurations
```

### Naming Conventions
- Python files: snake_case.py
- TypeScript files: PascalCase.tsx, camelCase.ts
- Database tables: snake_case
- API endpoints: kebab-case
- Environment variables: UPPER_SNAKE_CASE

### Git Workflow
- Main branch: `main` (production)
- Development branch: `develop`
- Feature branches: `feature/description`
- Bugfix branches: `bugfix/description`
- Release branches: `release/v1.0.0`
- Commit format: `type(scope): description`

## Monitoring & Logging

### Application Metrics
- Request rate and latency
- Error rate and types
- Database query performance
- Cache hit/miss ratio
- Background job processing time

### Infrastructure Metrics
- CPU and memory usage
- Disk I/O and space
- Network traffic
- Container health
- Database connections

### Logging Strategy
- Structured JSON logging
- Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Centralized log aggregation
- Log retention: 30 days
- Sensitive data masking

## Deployment Architecture

### Environment Strategy
- Development: Local Docker Compose
- Staging: Replica of production
- Production: High-availability setup

### CI/CD Pipeline
1. Code push to repository
2. Automated tests execution
3. Code quality checks
4. Security vulnerability scanning
5. Docker image building
6. Deployment to staging
7. Smoke tests
8. Production deployment (manual approval)
9. Post-deployment verification

### Configuration Management
- Environment variables for configuration
- Secrets management with vault
- Configuration validation on startup
- Feature flags for gradual rollout

## Integration Architecture

### External Services
- **Odoo ERP**: REST API integration
- **Google Calendar**: OAuth 2.0 integration
- **SMTP Service**: Email delivery
- **Payment Gateway**: Stripe/PayPal integration
- **Analytics**: Google Analytics, custom metrics
- **CDN**: CloudFlare for static assets

### Webhook System
- Event-driven architecture
- Retry mechanism with exponential backoff
- Dead letter queue for failed deliveries
- Webhook signature verification
- Event log for audit trail

## Disaster Recovery

### Backup Strategy
- Database: Daily automated backups
- Files: Incremental backup every 6 hours
- Configuration: Version controlled
- Backup testing: Monthly restoration test

### Recovery Procedures
- RTO (Recovery Time Objective): 4 hours
- RPO (Recovery Point Objective): 1 hour
- Documented recovery procedures
- Regular disaster recovery drills

## Future Considerations

### Phase 2 Features
- GraphQL API layer
- WebSocket support for real-time features
- Mobile applications (React Native)
- AI-powered content generation
- Advanced analytics dashboard
- Multi-tenancy support

### Scalability Path
- Kubernetes orchestration
- Microservices separation
- Event sourcing pattern
- CQRS implementation
- Global CDN deployment
- Multi-region database replication

## Success Metrics

### Technical KPIs
- Page load time < 2 seconds
- API response time < 200ms
- System uptime > 99.9%
- Test coverage > 80%
- Security vulnerability score < 3

### Business KPIs
- User engagement metrics
- Content creation velocity
- Lead generation rate
- System adoption rate
- Support ticket volume

## Conclusion

This architecture provides a solid foundation for Magnetiq v2, addressing the limitations of v1 while providing scalability, security, and maintainability. The modular design allows for incremental development and future enhancements without major architectural changes.