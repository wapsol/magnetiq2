# Consultants System Specification

## Overview

The Consultants system is a comprehensive platform for managing premium business consultants, featuring LinkedIn-first onboarding, AI-powered profile generation, KYC verification, and performance analytics. This system enables voltAIc to operate as a premium consultant marketplace.

## Architecture

### Core Components

1. **Consultant Management** - Profile creation, status management, and lifecycle
2. **LinkedIn Integration** - OAuth-based signup with automated data import
3. **AI Profile Generation** - GPT-4 powered profile optimization and content creation
4. **KYC System** - Identity verification and compliance management
5. **Performance Analytics** - Comprehensive reporting and insights
6. **Data Enrichment** - Optional Scoopp integration for enhanced LinkedIn data

## Database Schema

### Consultant Model
```python
class Consultant(Base):
    __tablename__ = "consultants"
    
    # Identity
    id = Column(String, primary_key=True)  # UUID
    
    # LinkedIn Integration
    linkedin_url = Column(String(500), unique=True, nullable=False)
    linkedin_id = Column(String(100), unique=True)
    linkedin_data = Column(JSON)  # Raw LinkedIn + Scoopp data
    
    # Personal Information
    email = Column(String(255), unique=True, nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    profile_picture_url = Column(String(500))
    headline = Column(String(200))
    location = Column(String(100))
    phone = Column(String(20))
    
    # Professional Information
    industry = Column(String(100))
    specializations = Column(JSON)  # List of expertise areas
    years_experience = Column(Integer)
    hourly_rate = Column(Numeric(10, 2))
    currency = Column(String(3), default='EUR')
    availability_status = Column(String(20))
    languages_spoken = Column(JSON)
    
    # AI-Generated Content
    ai_summary = Column(Text)
    ai_skills_assessment = Column(JSON)
    ai_market_positioning = Column(Text)
    ai_generated_keywords = Column(JSON)
    
    # Status Management
    status = Column(String(20), default=ConsultantStatus.PENDING)
    kyc_status = Column(String(20), default=KYCStatus.NOT_STARTED)
    is_featured = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    
    # Performance Metrics
    total_projects = Column(Integer, default=0)
    completed_projects = Column(Integer, default=0)
    average_rating = Column(Numeric(3, 2))
    total_earnings = Column(Numeric(12, 2), default=0)
    response_rate = Column(Numeric(5, 2))
    response_time_hours = Column(Numeric(6, 2))
```

### Supporting Models

- **ConsultantKYC** - Identity verification documents and process tracking
- **ConsultantProject** - Project management and tracking
- **ConsultantReview** - Client feedback and ratings
- **ConsultantEarning** - Payment tracking and platform fees
- **ConsultantAvailability** - Calendar and availability management
- **ConsultantPortfolio** - Work samples and case studies

## API Endpoints

### Authentication & Signup
- `POST /api/v1/consultants/auth/linkedin/init` - Initialize LinkedIn OAuth
- `POST /api/v1/consultants/auth/linkedin/callback` - Handle OAuth callback

### Consultant Management
- `GET /api/v1/consultants/search` - Public consultant discovery
- `GET /api/v1/consultants/{id}` - Public consultant profile
- `GET /api/v1/consultants/admin/consultants` - Admin: List all consultants
- `PUT /api/v1/consultants/admin/consultants/{id}` - Admin: Update consultant
- `PATCH /api/v1/consultants/admin/consultants/{id}/status` - Admin: Update status

### KYC Management
- `GET /api/v1/consultants/kyc/consultant/{id}/kyc-status` - Get KYC status
- `POST /api/v1/consultants/kyc/consultant/{id}/kyc-document` - Upload KYC document
- `PUT /api/v1/consultants/kyc/consultant/{id}/kyc-personal-info` - Update personal info
- `POST /api/v1/consultants/kyc/consultant/{id}/kyc-submit` - Submit for review
- `GET /api/v1/consultants/kyc/admin/kyc-pending` - Admin: Pending reviews
- `POST /api/v1/consultants/kyc/admin/consultant/{id}/kyc-review` - Admin: Review KYC

### Analytics & Reporting
- `GET /api/v1/consultants/analytics/platform/overview` - Platform metrics
- `GET /api/v1/consultants/analytics/platform/performance` - Performance metrics
- `GET /api/v1/consultants/analytics/platform/revenue` - Revenue analytics
- `GET /api/v1/consultants/analytics/consultant/{id}/overview` - Individual analytics
- `GET /api/v1/consultants/analytics/consultant/{id}/performance-report` - Detailed report

### Data Enrichment
- `POST /api/v1/consultants/enrichment/consultant/{id}/enrich` - Enrich profile
- `POST /api/v1/consultants/enrichment/batch-enrich` - Batch enrichment
- `POST /api/v1/consultants/enrichment/linkedin/scrape` - Test LinkedIn scraping
- `GET /api/v1/consultants/enrichment/statistics` - Enrichment statistics

## Services

### LinkedInOAuthService
Handles LinkedIn authentication flow and profile data extraction.

**Key Methods:**
- `generate_auth_url()` - Create OAuth authorization URL
- `exchange_code_for_token()` - Exchange auth code for access token
- `get_linkedin_profile()` - Extract profile data from LinkedIn API
- `create_or_update_consultant()` - Create/update consultant from LinkedIn data

### ConsultantService
Core consultant management operations.

**Key Methods:**
- `get_consultant_by_id()` - Retrieve consultant with related data
- `search_consultants()` - Advanced search with filters
- `update_consultant()` - Update consultant information
- `update_consultant_status()` - Status management with audit trail
- `generate_ai_profile()` - Trigger AI profile generation

### AIProfileGenerationService
AI-powered profile content generation using GPT-4.

**Key Methods:**
- `generate_consultant_profile()` - Complete profile generation
- `_generate_professional_summary()` - Create compelling summaries
- `_generate_skills_assessment()` - AI skills analysis
- `_generate_market_positioning()` - Strategic positioning
- `_generate_keywords()` - SEO optimization keywords

### KYCService
Identity verification and compliance management.

**Key Methods:**
- `get_kyc_status()` - Retrieve KYC requirements and status
- `upload_kyc_document()` - Handle document uploads
- `update_kyc_personal_info()` - Update personal information
- `submit_kyc_for_review()` - Submit complete KYC for approval
- `review_kyc_submission()` - Admin review and decision

### AnalyticsService
Comprehensive performance and business analytics.

**Key Methods:**
- `get_consultant_analytics()` - Platform or individual analytics
- `get_consultant_performance_report()` - Detailed performance reports
- `_get_overview_metrics()` - High-level platform metrics
- `_get_performance_metrics()` - Success rates and response metrics
- `_get_revenue_analytics()` - Financial performance analysis

### ScooppIntegrationService
LinkedIn data enrichment via Scoopp API.

**Key Methods:**
- `scrape_linkedin_profile()` - Extract detailed LinkedIn data
- `enrich_consultant_profile()` - Enhance existing profiles
- `batch_enrich_consultants()` - Bulk profile enhancement
- `_calculate_profile_metrics()` - Derive insights from LinkedIn data

## Status Management

### Consultant Status Flow
1. **PENDING** - Initial signup, awaiting KYC
2. **KYC_REVIEW** - KYC submitted, under admin review
3. **ACTIVE** - Approved and active on platform
4. **SUSPENDED** - Temporarily suspended
5. **ARCHIVED** - Permanently inactive

### KYC Status Flow
1. **NOT_STARTED** - KYC not initiated
2. **IN_PROGRESS** - Documents being uploaded
3. **PENDING_REVIEW** - Complete, awaiting admin review
4. **APPROVED** - KYC approved, consultant can be activated
5. **REJECTED** - KYC rejected, requires resubmission

## AI Profile Generation

The system uses GPT-4 to generate optimized consultant profiles:

### Content Types Generated
- **Professional Summary** (150-200 words) - Compelling value proposition
- **Skills Assessment** - Structured competency analysis
- **Market Positioning** - Strategic differentiation statement
- **SEO Keywords** - Discovery optimization terms

### Generation Process
1. Extract context from LinkedIn data and manual inputs
2. Generate content using role-specific prompts
3. Apply voltAIc branding and premium positioning
4. Validate and store generated content
5. Enable A/B testing with multiple variations

## Security & Compliance

### Data Protection
- GDPR compliant data handling
- Secure document storage for KYC
- Encrypted sensitive information
- Audit trails for all admin actions

### Authentication
- LinkedIn OAuth integration
- Secure token management
- Role-based access controls
- Session management

### File Handling
- Secure KYC document uploads
- File type validation
- Size limitations (10MB max)
- Virus scanning (recommended)

## Performance Considerations

### Database Optimization
- Proper indexing on search fields
- JSON field optimization for LinkedIn data
- Connection pooling
- Query optimization

### API Performance
- Background task processing for AI generation
- Rate limiting for external APIs
- Caching for frequently accessed data
- Async operations for I/O intensive tasks

### Scalability
- Horizontal scaling support
- Microservice-ready architecture
- CDN integration for file storage
- Load balancing considerations

## Integration Points

### External Services
- **LinkedIn API** - Profile data and OAuth
- **OpenAI GPT-4** - AI content generation
- **Scoopp** - Enhanced LinkedIn scraping
- **Email Service** - Notifications and communications
- **File Storage** - Document management

### Internal Systems
- **User Management** - Admin authentication
- **Translation System** - Multilingual support
- **Email Service** - Automated communications
- **Analytics Platform** - Performance tracking

## Configuration

### Required Environment Variables
```bash
# LinkedIn OAuth
LINKEDIN_CLIENT_ID="your-linkedin-app-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-app-secret"
LINKEDIN_REDIRECT_URI="http://localhost:8037/auth/linkedin/callback"

# OpenAI API
OPENAI_API_KEY="sk-your-openai-api-key"

# Consultant Settings
KYC_UPLOAD_DIR="./data/kyc_documents"

# Optional: Scoopp Integration
SCOOPP_API_KEY="your-scoopp-api-key"
SCOOPP_BASE_URL="https://api.scoopp.ai"
```

## Testing Strategy

### Unit Tests
- Service method testing
- Data validation testing
- Business logic verification

### Integration Tests
- API endpoint testing
- Database interaction testing
- External service mocking

### End-to-End Tests
- Complete signup flow
- KYC process testing
- Admin workflow testing

## Monitoring & Logging

### Key Metrics
- Consultant signup conversion rates
- KYC approval rates and timing
- AI generation success rates
- Platform performance metrics

### Logging
- API request/response logging
- Error tracking and alerting
- Performance monitoring
- Security event logging

## Future Enhancements

### Planned Features
- Advanced project matching algorithms
- Automated invoicing and payments
- Video profile capabilities
- Advanced analytics dashboards
- Mobile app support

### Integrations
- CRM system integration
- Advanced payment processing
- Video conferencing platforms
- Document signing services
- Advanced LinkedIn automation