# Magnetiq v2 - System Architecture Specification

## Executive Summary

Magnetiq v2 is a comprehensive Content Management System (CMS) with integrated business automation features including webinars, whitepapers, consultation booking, and CRM integration. This specification defines the complete system architecture for a scalable, maintainable, and secure implementation.

## Technology Stack

### Backend
- **Language**: Python 3.11+
- **Framework**: FastAPI 0.104+ with async/await support (Port 3036)
- **ORM**: SQLAlchemy 2.0 with async support and Alembic migrations
- **Database**: PostgreSQL 14+ (production), SQLite (development/testing)
- **Cache**: Redis 7.0+ for session management, caching, and message queuing
- **Task Queue**: Celery with Redis broker for background tasks
- **API Documentation**: OpenAPI 3.0 with auto-generated Swagger UI
- **Validation**: Pydantic v2 for request/response validation
- **Authentication**: JWT with RS256 algorithm and refresh tokens

### Frontend
- **Framework**: React 18 with TypeScript 5.0+
- **State Management**: Redux Toolkit with RTK Query for API state
- **UI Framework**: Tailwind CSS 3.0+ with Headless UI components
- **Build Tool**: Vite 5.0+ for fast development and builds
- **Testing**: Vitest + React Testing Library + Playwright (E2E)
- **Form Handling**: React Hook Form with Zod validation
- **Routing**: React Router v6 with nested routing
- **Internationalization**: React i18next for multilingual support
- **Port Configuration**: Single port (8036) with routing for public/admin. For enhanced security and isolation, frontend applications can alternatively be deployed on separate ports with independent scaling and access control.

### Infrastructure
- **Containerization**: Docker with multi-stage builds and Docker Compose
- **Web Server**: Nginx with HTTP/2, compression, and caching
- **Process Manager**: Gunicorn with Uvicorn async workers
- **Orchestration**: Docker Compose (development), Kubernetes (production-ready)
- **Monitoring**: Prometheus + Grafana with custom metrics
- **Logging**: Structured JSON logging with centralized aggregation
- **File Storage**: Local filesystem with S3-compatible backup and CDN
- **Security**: Let's Encrypt SSL, security headers, rate limiting

## System Architecture

### Microservices Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Load Balancer                      │
│                SSL Termination & Rate Limiting               │
└────────────┬──────────────────────────────┬─────────────────┘
             │                              │
             ▼                              ▼
┌─────────────────────────┐    ┌──────────────────────────┐
│   Public Frontend       │    │    Admin Panel           │
│   (React SPA)          │    │   (React Admin)          │
│   Served via routing    │    │   Served via routing     │
└───────────┬─────────────┘    └───────────┬──────────────┘
            │                               │
            └───────────┬───────────────────┘
                        │
          ┌─────────────▼─────────────┐
          │    Frontend Server        │
          │    (Single Port: 8036)    │
          │  Public + Admin Routes    │
          └─────────────┬─────────────┘
                        │
                        ▼
            ┌───────────────────────────┐
            │     FastAPI Backend       │
            │   (Unified API Gateway)   │
            │      Port: 3036          │
            └───────────┬───────────────┘
                        │
       ┌────────────────┼────────────────┐
       ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ Auth Service │ │Content Mgmt  │ │ Business     │
│ (JWT + RBAC) │ │ (Pages/Media)│ │ (Bookings)   │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       └────────────────┼────────────────┘
                        ▼
            ┌───────────────────────────┐
            │      PostgreSQL 14+       │
            │   (Primary Database)      │
            │   With Read Replicas      │
            └───────────────────────────┘
                        │
            ┌───────────┴───────────┐
            ▼                       ▼
    ┌──────────────┐       ┌──────────────┐
    │   Redis 7+   │       │ Celery Beat  │
    │Cache/Session │       │ & Workers    │
    │   & Queue    │       │              │
    └──────────────┘       └──────────────┘
```

## Service Architecture

### 1. Authentication & Authorization Service
- **JWT Authentication**: RS256 tokens with 15-minute access and 7-day refresh tokens
- **Role-Based Access Control**: Hierarchical permissions (Super Admin > Admin > Editor > Viewer)
- **Session Management**: Redis-backed session store with device tracking
- **Security Features**: Password reset, account lockout, audit logging
- **API Security**: Rate limiting, CORS, input validation, SQL injection prevention
- **Future Enhancements**: 2FA, OAuth2 integration, API key management

### 2. Content Management Service
- **Page Builder**: Component-based page construction with drag-and-drop interface
- **Multilingual Support**: JSONB-based content storage for EN/DE localization
- **Media Library**: File management with automatic optimization and CDN integration
- **Version Control**: Content versioning with rollback capabilities
- **SEO Optimization**: Meta tags, structured data, sitemap generation
- **Publishing Workflow**: Draft/scheduled/published states with approval processes

### 3. Business Operations Service
- **Webinar Management**: Topic creation, session scheduling, registration handling
- **Lead Generation**: Whitepaper distribution with comprehensive lead capture
- **Booking System**: Consultant scheduling with Google Calendar integration
- **Email Automation**: Transactional emails, reminders, follow-ups via Brevo
- **CRM Integration**: Real-time sync with Odoo for lead and customer management
- **Analytics**: Comprehensive metrics on engagement, conversions, and performance

## API Design Principles

### RESTful Standards
- **Resource-based URLs**: `/api/v1/resources/{id}` with UUID identifiers
- **HTTP Methods**: GET (read), POST (create), PUT (replace), PATCH (update), DELETE (soft delete)
- **Status Codes**: Comprehensive use of HTTP status codes with consistent error responses
- **Content Negotiation**: JSON primary, with support for file downloads
- **Hypermedia**: HATEOAS principles for discoverable API endpoints

### API Versioning & Evolution
- **URL Path Versioning**: `/api/v1/`, `/api/v2/` for major changes
- **Backward Compatibility**: Minimum 2-version support with deprecation warnings
- **Feature Flags**: Gradual rollout of new features without version bumps
- **Documentation**: Auto-generated OpenAPI 3.0 specs with examples

### Performance & Reliability
- **Pagination**: Cursor-based pagination for large datasets
- **Caching**: Redis-backed response caching with intelligent invalidation
- **Rate Limiting**: Per-user and per-endpoint limits with burst handling
- **Circuit Breakers**: Fault tolerance for external service dependencies

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
- **Normalization**: 3NF minimum with denormalization for performance-critical queries
- **Data Integrity**: UUID primary keys, foreign key constraints, check constraints
- **Audit Trail**: Soft deletes with comprehensive audit logging triggers
- **Temporal Data**: created_at, updated_at with timezone awareness (UTC storage)
- **Concurrency**: Optimistic locking with version fields for conflict resolution
- **Search**: Full-text search with GIN indexes and multilingual support
- **Multilingual**: JSONB fields for language-specific content storage

### Performance Optimization
- **Connection Pooling**: Async SQLAlchemy with configurable pool sizes
  - Development: 5-10 connections
  - Production: 10-25 connections with overflow
- **Indexing Strategy**: Composite indexes for common query patterns
- **Query Optimization**: Eager loading, query analysis, and N+1 prevention
- **Partitioning**: Time-based partitioning for audit logs and analytics

### High Availability & Backup
- **Replication**: Primary-replica setup with read query distribution
- **Automated Backups**: Daily full backups with incremental point-in-time recovery
- **Disaster Recovery**: Multi-region backup storage with 4-hour RTO
- **Monitoring**: Query performance tracking and slow query alerting

## Security Architecture

### Authentication & Authorization
- **JWT Implementation**: RS256 algorithm with public/private key pairs
- **Token Lifecycle**: 15-minute access tokens, 7-day refresh tokens with blacklisting
- **Role-Based Access Control**: Hierarchical permissions with resource-level granularity
- **Session Security**: Device fingerprinting, concurrent session limits, logout all devices
- **Rate Limiting**: Tiered limits based on endpoint sensitivity and user role

### Data Protection & Encryption
- **Encryption at Rest**: AES-256 for sensitive fields (passwords, PII)
- **Encryption in Transit**: TLS 1.3 with perfect forward secrecy
- **Key Management**: Secure key rotation and storage practices
- **Password Security**: bcrypt hashing with configurable rounds
- **Data Sanitization**: Input validation, output encoding, SQL injection prevention

### Application Security
- **Security Headers**: CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **CORS Policy**: Strict origin whitelisting with preflight handling
- **Vulnerability Management**: Regular dependency updates, security scanning
- **Content Validation**: File type verification, size limits, malware scanning

### Compliance & Privacy
- **GDPR Compliance**: Data minimization, consent management, right to erasure
- **Audit Logging**: Comprehensive activity tracking with tamper protection
- **Data Retention**: Automated cleanup based on configurable policies
- **Privacy Controls**: Cookie consent, data portability, access requests

## Performance Requirements

### Response Time Targets
- **API Endpoints**: < 200ms (p95), < 100ms (p50)
- **Page Load Time**: < 2 seconds (First Contentful Paint)
- **Database Queries**: < 100ms (p95), with query optimization alerts
- **Cache Performance**: > 90% hit ratio for frequently accessed data
- **File Uploads**: Progressive upload with real-time progress feedback

### Scalability Architecture
- **Horizontal Scaling**: Stateless application design with load balancing
- **Database Scaling**: Read replicas for query distribution, connection pooling
- **Caching Strategy**: Multi-layer caching (Redis, CDN, browser)
- **Auto-scaling**: Container orchestration with CPU/memory-based scaling
- **Content Delivery**: CDN integration for static assets and media files

### Reliability & Availability
- **Uptime SLA**: 99.9% availability with planned maintenance windows
- **Zero-Downtime Deployments**: Rolling updates with health checks
- **Graceful Degradation**: Circuit breakers, fallback responses, partial failures
- **Error Handling**: Exponential backoff, dead letter queues, retry policies
- **Monitoring**: Comprehensive observability with alerting and escalation

### Capacity Planning
- **Concurrent Users**: Support for 1000+ concurrent users
- **Data Growth**: Scalable architecture for 10TB+ data storage
- **Traffic Spikes**: Burst capacity for 10x normal load
- **Resource Monitoring**: Proactive scaling based on usage patterns

## Development Standards

### Project Structure
```
magnetiq2/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI application entry
│   │   ├── config.py         # Environment configuration
│   │   ├── database.py       # Database setup
│   │   ├── api/
│   │   │   └── v1/           # API version 1
│   │   │       ├── auth/     # Authentication endpoints
│   │   │       ├── content/  # Content management
│   │   │       ├── business/ # Business operations
│   │   │       ├── admin/    # Admin panel APIs
│   │   │       └── public/   # Public APIs
│   │   ├── core/
│   │   │   ├── auth.py       # Authentication logic
│   │   │   ├── permissions.py # RBAC implementation
│   │   │   ├── security.py   # Security utilities
│   │   │   └── exceptions.py # Custom exceptions
│   │   ├── models/           # SQLAlchemy ORM models
│   │   ├── schemas/          # Pydantic models
│   │   ├── services/         # Business logic services
│   │   ├── tasks/            # Celery background tasks
│   │   └── utils/            # Shared utilities
│   ├── migrations/           # Alembic database migrations
│   ├── tests/               # Comprehensive test suite
│   └── scripts/             # Management scripts
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── features/        # Feature-based modules
│   │   │   ├── auth/        # Authentication feature
│   │   │   ├── content/     # Content management
│   │   │   ├── webinars/    # Webinar functionality
│   │   │   └── booking/     # Booking system
│   │   ├── hooks/           # Custom React hooks
│   │   ├── services/        # API service layer
│   │   ├── store/           # Redux store configuration
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── i18n/            # Internationalization
│   ├── admin/               # Admin panel (separate build)
│   └── tests/               # Frontend test suites
├── docs/
│   ├── spec_v2/             # System specifications
│   ├── api/                 # API documentation
│   ├── development/         # Development guides
│   └── deployment/          # Deployment guides
├── docker/                  # Docker configurations
│   ├── Dockerfile.backend   # Backend container
│   ├── Dockerfile.frontend  # Frontend container
│   └── docker-compose.*.yml # Environment compositions
└── scripts/                 # Project management scripts
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

## Future Roadmap & Evolution

### Phase 2 Enhancements (Q3-Q4 2024)
- **GraphQL Gateway**: Unified data layer with efficient querying
- **Real-time Features**: WebSocket integration for live notifications and chat
- **AI Integration**: Content generation, smart recommendations, automated translations
- **Advanced Analytics**: Custom dashboards, predictive insights, ROI tracking
- **Mobile Applications**: Progressive Web App enhancement, native mobile apps
- **Enhanced Security**: Zero-trust architecture, advanced threat detection

### Phase 3 Scalability (2025)
- **Microservices Architecture**: Service decomposition with event-driven communication
- **Kubernetes Orchestration**: Container orchestration for high availability
- **Global Distribution**: Multi-region deployment with edge computing
- **Event Sourcing**: Immutable event logs for complete audit trails
- **CQRS Implementation**: Command-query separation for optimal performance
- **Multi-tenancy**: SaaS transformation with tenant isolation

### Technology Evolution
- **Edge Computing**: CDN with edge functions for improved performance
- **Serverless Integration**: Function-as-a-Service for specific workloads
- **Machine Learning**: Predictive analytics, automated optimization
- **Blockchain Integration**: Immutable audit trails, digital certificates
- **Voice Interfaces**: Voice-activated booking and content management

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