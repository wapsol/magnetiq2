# Magnetiq v2 - Admin Panel Frontend Specification

## Overview

The Admin Panel is a comprehensive dashboard for managing all aspects of the Magnetiq CMS. It provides a secure, intuitive interface for administrators to control the entire system through a modular architecture with dedicated management interfaces.

→ **Architecture Foundation**: [System Architecture](../../architecture.md#admin-panel-architecture)
← **Used by**: [Site Admin](../../users/site-admin.md), [Content Editor](../../users/content-editor.md)
⚡ **Dependencies**: [Backend API](../../backend/api.md), [Authentication System](../../security.md#admin-authentication)

This specification serves as the architectural overview and entry point to specialized admin panel features:
- [Consultant Management](./consultant-management.md) - Consultant profiles, LinkedIn scraping, payments, and performance analytics
- [Payment Management](./business/payment.md) - Financial transactions, payouts, KYC processing, and billing
- [Content Management](./content-management.md) - PortableText editing, multilingual content, and media library
- [Analytics Dashboard](./analytics-dashboard.md) - Performance metrics, reporting, and business intelligence

## Technical Foundation

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Content Format**: PortableText for all structured content
- **Content Editor**: Custom PortableText editor with block-based interface
- **Styling**: Tailwind CSS with Headless UI components
- **State Management**: Redux Toolkit with RTK Query
- **Tables**: TanStack Table v8 (React Table)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for analytics visualization
- **Rich Text**: PortableText editor with custom blocks
- **Drag & Drop**: dnd-kit for PortableText block arrangement

### Access Configuration
- **URL**: `http://localhost:8036/admin` (development)
- **Production URL**: `https://admin.voltAIc.systems`
- **Authentication**: JWT-based with role-based access control
- **Session Management**: Auto-logout after inactivity

## Authentication System

The Admin Panel uses a dedicated authentication system separate from public users. For complete authentication specifications, see: `/frontend/adminpanel/authentication.md`

### Login Interface
```tsx
interface AdminLogin {
  email: string; // Primary identifier (no usernames)
  password: string;
  rememberMe?: boolean;
}
```

### Security Features
- **Email-based admin authentication** (no usernames)
- **Enhanced account lockout** after 3 failed attempts (stricter than public)
- **Strong password complexity requirements** (12+ characters)
- **Multi-factor authentication** for super admins
- **Shortened session timeout** after 30 minutes inactivity
- **Secure password reset** via super admin approval
- **Comprehensive login audit trail**
- **Permission-based access control**

### User Role Hierarchy
```tsx
enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin', 
  EDITOR = 'editor',
  VIEWER = 'viewer'
}

interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}
```

## Layout Architecture

### Main Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│                        Top Bar                               │
│  Logo    |    Breadcrumb    |    User Menu    |    Notifications │
├─────────────────────────────────────────────────────────────┤
│        │                                                     │
│  Side  │                Main Content Area                    │
│  Nav   │                                                     │
│        │                                                     │
│        │                                                     │
├─────────────────────────────────────────────────────────────┤
│                     Status Bar                               │
│  System Health  |  Version: 2.0.0  |  Last Updated: timestamp │
└─────────────────────────────────────────────────────────────┘
```

### Collapsible Sidebar Navigation
- **Collapsed state**: Icons only with tooltips
- **Expanded state**: Icons + labels
- **Hover behavior**: Auto-expand on hover (collapsed mode)
- **User preference**: Remember state in localStorage
- **Responsive**: Auto-collapse on mobile screens

### Top Bar Features

#### Left Section
- **Logo**: voltAIc Systems branding
- **Breadcrumb navigation**: Current page hierarchy
- **Page title**: Dynamic based on current route

#### Right Section
- **Notifications**: Bell icon with unread count
- **User profile**: Avatar + name dropdown
- **Settings**: Quick access to user preferences
- **Logout**: Secure session termination

#### System Information (Bottom Right)
- **Date**: Current date and time
- **Version**: Software version number (v2.0.0)
- **System status**: Health indicator
- **Environment**: Development/Staging/Production badge

## Navigation Menu Structure

### Primary Menu Items
```
Dashboard
├── Analytics Overview → [Analytics Dashboard](./analytics-dashboard.md#overview)
├── System Health → [Analytics Dashboard](./analytics-dashboard.md#system-health)
└── Quick Actions

Content Management → [Content Management](./content-management.md)
├── Pages → [Content Management](./content-management.md#page-management)
├── Page Builder → [Content Management](./content-management.md#page-builder)
├── Media Library → [Content Management](./content-management.md#media-library)
└── SEO Settings → [Content Management](./content-management.md#seo-management)

Business Management
├── Consultants Management → [Consultant Management](./consultant-management.md)
│   ├── Consultant Profiles → [Consultant Management](./consultant-management.md#profile-management)
│   ├── Scraping Jobs → [Consultant Management](./consultant-management.md#linkedin-scraping)
│   ├── Payments & Payouts → [Payment Management](./business/payment.md#consultant-payouts)
│   └── Performance Analytics → [Analytics Dashboard](./analytics-dashboard.md#consultant-analytics)
├── Webinars → [Content Management](./content-management.md#webinar-management)
├── Whitepapers → [Content Management](./content-management.md#whitepaper-management)
└── Bookings → [Consultant Management](./consultant-management.md#booking-integration)

Communication Services → [Content Management](./content-management.md#communication-services)
├── Email Campaigns → [Content Management](./content-management.md#email-campaigns)
├── LinkedIn Management → [Consultant Management](./consultant-management.md#linkedin-integration)
├── Twitter Management → [Content Management](./content-management.md#social-media)
└── Analytics & Engagement → [Analytics Dashboard](./analytics-dashboard.md#engagement-metrics)

Financial Management → [Payment Management](./business/payment.md)
├── Transactions → [Payment Management](./business/payment.md#transaction-management)
├── Consultant Payouts → [Payment Management](./business/payment.md#payout-management)
├── KYC Processing → [Payment Management](./business/payment.md#kyc-management)
└── Financial Reports → [Analytics Dashboard](./analytics-dashboard.md#financial-analytics)

User Management
├── Admin Users → [Authentication](./authentication.md#admin-users)
├── User Roles → [Authentication](./authentication.md#role-management)
├── Activity Logs → [Analytics Dashboard](./analytics-dashboard.md#audit-logs)
└── Sessions → [Authentication](./authentication.md#session-management)

Integrations → [Integrations Overview](../../integrations/integrations.md)
├── Payment Services → [Payment Management](./business/payment.md#integration-management)
├── Social Media APIs → [Consultant Management](./consultant-management.md#social-integrations)
└── External Services → [Integrations Overview](../../integrations/integrations.md#external-services)

System Settings
├── Contact Information → [System Settings](./system-settings.md#contact-information-management)
├── General Configuration → [System Settings](./system-settings.md#general-configuration)
├── Site Configuration → [System Settings](./system-settings.md#site-configuration)
├── Email Configuration → [System Settings](./system-settings.md#email-configuration)
├── Security Settings → [System Settings](./system-settings.md#security-settings)
├── Backup & Recovery → [System Settings](./system-settings.md#backup-recovery)
├── System Maintenance → [System Settings](./system-settings.md#system-maintenance)
├── Multilingual → [Content Management](./content-management.md#multilingual-settings)
└── Logs → [Analytics Dashboard](./analytics-dashboard.md#system-logs)
```

### Navigation Implementation
```tsx
interface MenuItem {
  id: string;
  label: TranslatedText;
  icon: IconComponent;
  path?: string;
  children?: MenuItem[];
  badge?: number; // Notification count
  permission?: Permission;
}
```

## Core Dashboard Features

The main dashboard provides a high-level overview of system performance and quick access to key administrative functions. Detailed analytics and metrics are available through the dedicated analytics interface.

→ **Comprehensive Analytics**: [Analytics Dashboard](./analytics-dashboard.md) - Complete performance metrics, reporting, and business intelligence
→ **System Monitoring**: [Analytics Dashboard](./analytics-dashboard.md#system-health) - Real-time system health and performance monitoring
→ **Financial Overview**: [Payment Management](./business/payment.md#dashboard-overview) - Revenue, payouts, and financial metrics

### Quick Access Dashboard
- **System Status**: Overall health indicators and alerts
- **Recent Activity**: Latest admin actions and system events  
- **Key Metrics Summary**: High-level KPIs from specialized dashboards
- **Quick Actions**: Direct access to common administrative tasks
- **Notification Center**: System alerts, pending approvals, and important updates

### Dashboard Widget Architecture
```tsx
interface DashboardWidget {
  id: string;
  type: 'metric' | 'chart' | 'list' | 'status' | 'action';
  title: string;
  size: 'small' | 'medium' | 'large';
  refreshInterval?: number;
  dataSource: string;
  permissions: string[];
  configurable: boolean;
}
```

## Feature-Specific Management Interfaces

The admin panel provides specialized management interfaces for different aspects of the system. Each interface is designed for specific administrative workflows and user types.

### Content & Media Management
→ **Complete Content Management**: [Content Management Specification](./content-management.md)
- **PortableText Editor System**: Advanced block-based content editing with multilingual support
- **Page Builder Interface**: Visual page construction with drag-and-drop functionality  
- **Media Library**: Asset management with PortableText integration
- **SEO Management**: Optimization tools and structured data
- **Multilingual Content**: Translation workflows and language management

### Business Operations Management  
→ **Consultant Operations**: [Consultant Management Specification](./consultant-management.md)
- **Consultant Profiles**: Complete profile management with AI-enhanced features
- **LinkedIn Integration**: Automated scraping and profile enhancement
- **Booking System**: Appointment scheduling and consultant matching
- **Performance Analytics**: Individual and comparative performance metrics

→ **Financial Operations**: [Payment Management Specification](./business/payment.md)  
- **Payment Processing**: Transaction management and automated workflows
- **KYC Management**: Compliance processing and document verification
- **Payout Systems**: Automated consultant compensation and scheduling
- **Financial Reporting**: Revenue tracking and financial analytics

### Data & Analytics Management
→ **Analytics & Reporting**: [Analytics Dashboard Specification](./analytics-dashboard.md)
- **Performance Metrics**: Comprehensive KPI tracking and visualization
- **Business Intelligence**: Advanced reporting and trend analysis  
- **System Health Monitoring**: Real-time performance and error tracking
- **User Behavior Analytics**: Engagement tracking and conversion analysis

## User Management

The admin panel provides comprehensive user management capabilities for different user types and access levels.

### Admin User Management
→ **Complete User Management**: [User Management Specification](./user-management.md)
- **Admin Users**: Create, edit, and manage administrative accounts
- **Role Assignment**: Configure roles and permissions for different admin levels
- **Access Control**: Manage feature access and data visibility permissions
- **Session Management**: Monitor active sessions and enforce security policies

### Basic Admin User Interface
```tsx
interface AdminUser {
  id: string;
  email: string; // Primary identifier
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    timezone: string;
    language: 'en' | 'de';
  };
  security: {
    role: UserRole;
    permissions: Permission[];
    isActive: boolean;
    lastLogin?: Date;
    loginAttempts: number;
    lockedUntil?: Date;
    passwordResetRequired?: boolean;
  };
  audit: {
    createdAt: Date;
    createdBy: string;
    lastModifiedAt: Date;
    lastModifiedBy: string;
  };
}
```

### User Management Features
- **User Creation**: Email invitation system
- **Role Assignment**: With permission inheritance  
- **Password Management**: Reset, force change, complexity rules
- **Activity Monitoring**: Login history, actions audit
- **Bulk Operations**: Mass role changes, account actions
- **Security Reports**: Failed logins, suspicious activities

## Integration Management

The admin panel provides unified management of external service integrations and system connections.

→ **Integration Details**: [Integrations Management Specification](./integrations-management.md)
- **Service Connections**: Manage API credentials and connection status
- **Integration Monitoring**: Real-time integration health and error tracking  
- **Configuration Management**: Service-specific settings and field mapping
- **Sync Operations**: Manual and automated data synchronization

## Security Features

The admin panel implements comprehensive security measures to protect sensitive data and ensure secure administrative access.

→ **Complete Security Details**: [Security Specification](../../security.md#admin-panel-security)

### Session Management
- **Automatic Timeout**: 30-minute inactivity logout
- **Concurrent Sessions**: Limit active sessions per user
- **Session Monitoring**: Track active user sessions and location
- **Force Logout**: Admin-initiated session termination for security incidents

### Audit Trail System
```tsx
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}
```

### Security Monitoring Features
- **Failed Login Tracking**: Automated suspicious activity detection
- **Permission Changes**: Role and access modification logging
- **Data Modifications**: Complete CRUD operations audit trail
- **System Access**: Administrative function usage tracking
- **Export Activities**: Data export and download monitoring

## Performance & User Experience

### Responsive Design Architecture
- **Desktop First**: Optimized for complex administrative workflows
- **Tablet Support**: Touch-friendly controls for mobile administration  
- **Mobile Access**: Emergency administrative access capabilities
- **Adaptive Layouts**: Dynamic screen size optimization

### Accessibility Implementation
- **WCAG 2.1 AA**: Full compliance with accessibility standards
- **Keyboard Navigation**: Complete keyboard-only operation support
- **Screen Reader**: Comprehensive ARIA labels and descriptions
- **High Contrast**: Optional high contrast mode for visual accessibility
- **Font Scaling**: User-adjustable text sizes and spacing

### Performance Optimization
- **Lazy Loading**: On-demand component and data loading
- **Virtual Scrolling**: Efficient large dataset rendering
- **Intelligent Caching**: Strategic data caching for performance
- **Smart Pagination**: Optimized data presentation and navigation
- **Debounced Operations**: Optimized search and filter performance

## Testing Strategy

The admin panel follows comprehensive testing practices to ensure reliability and security.

→ **Complete Testing Details**: [Testing Strategy](../../testing_strategy.md#admin-panel-testing)

### Component Testing
- **Unit Tests**: Individual component functionality validation
- **Integration Tests**: Component interaction and data flow testing
- **Visual Tests**: Screenshot comparison and UI regression testing
- **Accessibility Tests**: A11y compliance and usability validation

### User Workflow Testing
- **Authentication Flow**: Login/logout and session management processes
- **CRUD Operations**: Data management workflow validation
- **Permission Testing**: Role-based access control verification
- **Error Scenarios**: Comprehensive error handling validation

## Deployment & Configuration

### Build Configuration
```tsx
interface AdminBuildConfig {
  outDir: 'dist-admin';
  port: 8036;
  sessionTimeout: 1800000; // 30 minutes
  features: {
    consultantManagement: boolean;
    paymentProcessing: boolean;
    contentManagement: boolean;
    analytics: boolean;
}
```

### Environment Configuration
```env
# Admin Panel Configuration
VITE_ADMIN_API_URL=http://localhost:8000
VITE_ADMIN_PORT=8036
VITE_SESSION_TIMEOUT=1800000
VITE_AUTO_LOGOUT_WARNING=300000

# Feature Flags
VITE_ENABLE_CONSULTANT_MANAGEMENT=true
VITE_ENABLE_PAYMENT_PROCESSING=true
VITE_ENABLE_CONTENT_MANAGEMENT=true
VITE_ENABLE_ADVANCED_ANALYTICS=true
VITE_ENABLE_AUDIT_LOGS=true
```

## Cross-References Summary

### Specialized Admin Panel Specifications
← **Feature-Specific Specifications**:
- [Consultant Management](./consultant-management.md) - Complete consultant operations management
- [Payment Management](./business/payment.md) - Financial processing and KYC workflows
- [Content Management](./content-management.md) - PortableText editing and multilingual content
- [Analytics Dashboard](./analytics-dashboard.md) - Performance metrics and business intelligence
- [User Management](./user-management.md) - Admin user and role management
- [Integrations Management](./integrations-management.md) - External service integration management

### System Architecture Dependencies
→ **Core System Dependencies**:
- [System Architecture](../../architecture.md#admin-panel-architecture) - Overall system design and technology stack
- [Backend API](../../backend/api.md) - Admin panel API endpoints and data contracts
- [Database Schema](../../backend/database.md) - Admin data models and relationships
- [Security Specification](../../security.md#admin-panel-security) - Authentication and authorization systems
- [Privacy Compliance](../../privacy-compliance.md#admin-data-handling) - Data protection and regulatory compliance

### User Experience Dependencies  
↔️ **User-Centered Design**:
- [Site Admin Persona](../../users/site-admin.md) - Primary admin user requirements and workflows
- [Content Editor Persona](../../users/content-editor.md) - Content management user needs and capabilities
- [Design System](../design-system.md) - UI components and styling standards
- [Testing Strategy](../../testing_strategy.md#admin-panel-testing) - Quality assurance and validation processes

### Integration Dependencies
⚡ **External Service Integration**:
- [LinkedIn Integration](../../integrations/linkedin.md) - Social media management and consultant scraping
- [SMTP Integration](../../integrations/smtp-brevo.md) - Email campaign management
- [Payment Integration](../../integrations/stripe-payments.md) - Financial transaction processing
- [File Storage Integration](../../integrations/file-storage.md) - Media and document management

## Future Enhancements

### Planned Feature Development
- **Advanced Analytics**: Enhanced business intelligence and predictive analytics capabilities
- **Mobile Administration**: Native mobile app for emergency administrative access
- **Collaborative Editing**: Real-time multi-user content editing and approval workflows
- **AI Integration**: Enhanced content generation and administrative task automation
- **Advanced Permissions**: Granular access control with custom permission sets
- **Workflow Engine**: Automated business process management and approval chains

### Technical Roadmap
- **Performance Optimization**: Enhanced loading performance and data handling efficiency
- **Enhanced Security**: Advanced threat detection and automated security response
- **Scalability Improvements**: Architecture enhancements for larger data volumes
- **Integration Expansion**: Additional third-party service integrations
- **API Enhancement**: GraphQL integration and advanced API management capabilities
      city: string;
      timezone: string;
    };
  };
  
  // Professional Information
  professionalInfo: {
    biography: PortableTextContent; // Rich biography with PortableText
    shortBio: string; // 150 character summary for listings
    expertise: string[];
    specializations: PortableTextContent; // Detailed specialization descriptions
    linkedin?: string;
    twitter?: string;
    website?: string;
    certifications: Certification[];
    languages: ('en' | 'de')[];
    yearsExperience: number;
    industryFocus: string[];
    consultingAreas: ConsultingArea[];
  };
  
  // LinkedIn Integration Data
  linkedinData: {
    profileUrl?: string;
    scrapingJobId?: string;
    lastScraped?: Date;
    profileData?: LinkedInProfileData;
    verificationStatus: 'pending' | 'verified' | 'failed' | 'manual';
    scraperNotes?: string;
  };
  
  // Availability & Booking
  availability: {
    timezone: string;
    workingHours: WeeklySchedule;
    holidays: DateRange[];
    isOnline: boolean;
    bookingSettings: {
      hourlyRate?: number;
      currency: string;
      minimumBookingDuration: number;
      maxAdvanceBookingDays: number;
      cancellationPolicy: string;
    };
  };
  
  // Payment & KYC Information
  paymentInfo: {
    kycStatus: 'not_started' | 'pending' | 'approved' | 'rejected';
    paymentMethodId?: string;
    taxId?: string;
    businessType: 'individual' | 'company';
    invoiceSettings: {
      companyName?: string;
      address: Address;
      vatNumber?: string;
    };
    kycDocuments: KYCDocument[];
  };
  
  // Content Associations
  contentAssociations: {
    authoredWhitepapers: string[]; // Whitepaper IDs
    webinarSessions: string[]; // Webinar session IDs
    blogPosts: string[]; // Blog post IDs
    caseStudies: string[]; // Case study IDs
  };
  
  // Performance Analytics
  analytics: {
    totalBookings: number;
    completedBookings: number;
    averageRating: number;
    totalRatings: number;
    responseTime: number; // Average response time in minutes
    totalEarnings: number;
    currentMonthEarnings: number;
    conversionRate: number; // Inquiry to booking conversion
    repeatClientRate: number;
    cancellationRate: number;
  };
  
  // System Metadata
  metadata: {
    createdAt: Date;
    createdBy: string;
    lastModified: Date;
    lastModifiedBy: string;
    status: 'draft' | 'active' | 'inactive' | 'suspended';
    verificationLevel: 'unverified' | 'email_verified' | 'profile_verified' | 'fully_verified';
    aiGeneratedContent: boolean; // Flag for AI-generated profiles
    manualReviewRequired: boolean;
    internalNotes: PortableTextContent;
  };
}

// Supporting interfaces
interface ConsultingArea {
  name: string;
  level: 'beginner' | 'intermediate' | 'expert';
  yearsExperience: number;
  description?: string;
}

interface KYCDocument {
  id: string;
  type: 'passport' | 'id_card' | 'business_license' | 'tax_document' | 'bank_statement';
  fileName: string;
  uploadDate: Date;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  notes?: string;
}

interface LinkedInProfileData {
  headline: string;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  connections: number;
  profileImageUrl?: string;
  lastScrapedData: any; // Raw scraper response
}
```

#### Consultant Profile Management Interface

**List View Features**:
- **Advanced Table Component**: Sortable, filterable consultant directory
- **Status Indicators**: Visual status badges (online/offline, KYC status, verification level)
- **Quick Actions**: Edit profile, view details, toggle status, initiate scraping
- **Bulk Operations**: Mass status updates, export selected, bulk email
- **Smart Filtering**: By status, expertise, availability, earnings, verification level
- **Search**: Full-text search across name, expertise, bio, and skills

**Card View Features**:
- **Profile Cards**: Photo, name, title, rating, and key metrics
- **Hover Actions**: Quick preview, edit, message, view analytics
- **Status Overlays**: Online status, booking availability, new inquiry indicators
- **Performance Metrics**: Revenue, booking count, rating display

**Profile Detail View**:
- **Tabbed Interface**: Personal Info, Professional Info, LinkedIn Data, Payment Info, Analytics
- **Live LinkedIn Preview**: Side-by-side comparison with scraped data
- **Content Association Manager**: Link/unlink whitepapers, webinars, blog posts
- **Analytics Dashboard**: Performance charts, booking history, revenue trends
- **Communication Log**: Message history, booking inquiries, admin notes

### 1.2 LinkedIn Scraping Tab (`/admin/consultants/scraping`)

→ **API Integration**: [Scoopp Integration API](../integrations/scoopp-linkedin.md)
⚡ **Dependencies**: [Job Queue System](../backend/api.md#job-queue), [Webhook Processing](../integrations/webhooks.md)

#### Scoopp-Powered LinkedIn Scraping Wizard

**Scraping Job Creation Interface**:
```tsx
interface ScrapingJobConfig {
  jobId: string;
  jobName: string;
  targetProfiles: {
    linkedinUrls: string[];
    searchCriteria?: {
      keywords: string[];
      location?: string;
      industry?: string[];
      experienceLevel?: 'entry' | 'mid' | 'senior' | 'executive';
      connectionLevel?: '1st' | '2nd' | '3rd';
    };
  };
  scrapingOptions: {
    includeExperience: boolean;
    includeEducation: boolean;
    includeSkills: boolean;
    includeConnections: boolean;
    includeRecommendations: boolean;
    fullProfileData: boolean;
  };
  processingOptions: {
    autoCreateProfiles: boolean;
    requireManualReview: boolean;
    aiEnhancement: boolean;
    duplicateDetection: boolean;
    qualityThreshold: number; // 1-10 scale
  };
  scheduling: {
    executeNow: boolean;
    scheduledFor?: Date;
    repeatInterval?: 'none' | 'weekly' | 'monthly';
  };
}
```

**Scraping Job Monitoring Dashboard**:
- **Active Jobs List**: Real-time status of running scraping jobs
- **Job Status Indicators**: Queued, running, completed, failed, paused
- **Progress Tracking**: Profiles scraped vs. total, success rate, errors
- **Real-time Log Viewer**: Live updates from Scoopp scraping process
- **Job Controls**: Pause, resume, cancel, restart failed jobs
- **Results Preview**: Quick preview of scraped data quality

**Scraping Results Management**:
```tsx
interface ScrapingResult {
  jobId: string;
  profileUrl: string;
  status: 'success' | 'failed' | 'partial' | 'requires_review';
  scrapedAt: Date;
  dataQuality: {
    score: number; // 1-10 quality score
    completeness: number; // Percentage of fields populated
    confidence: number; // AI confidence in data accuracy
    issues: string[]; // Detected data quality issues
  };
  extractedData: LinkedInProfileData;
  processingNotes: string[];
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  assignedReviewer?: string;
  consultantProfileId?: string; // If auto-created or linked
}
```

**Manual Review Workflow Interface**:
- **Review Queue**: Scraped profiles requiring manual review
- **Side-by-Side Comparison**: Original LinkedIn vs. extracted data
- **Data Correction Tools**: Edit extracted fields, add missing information
- **Approval Actions**: Approve, reject, request revision, escalate
- **Bulk Review Tools**: Batch approval for high-quality results
- **Reviewer Assignment**: Assign specific profiles to team members

### 1.3 AI-Powered Profile Generation

→ **Integration**: [OpenAI API](../integrations/openai-api.md)
⚡ **Dependencies**: [Content Validation](../security.md#content-validation)

#### AI Profile Enhancement Features

**AI Profile Generator Interface**:
```tsx
interface AIProfileGenerator {
  inputData: {
    rawText?: string; // Unstructured resume/bio text
    linkedinData?: LinkedInProfileData;
    existingProfile?: Partial<ConsultantProfile>;
    additionalContext?: string;
  };
  generationOptions: {
    outputLanguage: 'en' | 'de' | 'both';
    biographyLength: 'short' | 'medium' | 'long';
    toneOfVoice: 'professional' | 'friendly' | 'authoritative' | 'approachable';
    focusAreas: string[]; // Emphasize specific expertise
    includePersonality: boolean;
    generateSpecializations: boolean;
  };
  qualityControls: {
    factChecking: boolean;
    grammarCheck: boolean;
    consistencyValidation: boolean;
    brandAlignment: boolean;
  };
}
```

**AI Generation Workflow**:
1. **Data Input**: Upload resume, paste bio text, or use scraped LinkedIn data
2. **Content Analysis**: AI analyzes and structures unstructured information
3. **Profile Generation**: Creates structured consultant profile with PortableText content
4. **Quality Review**: Automated checks for accuracy, consistency, and completeness
5. **Human Review**: Manual review and editing before profile activation
6. **A/B Testing**: Optional testing of different bio versions for performance

**Generated Content Quality Indicators**:
- **Accuracy Score**: AI confidence in factual accuracy
- **Completeness Meter**: Percentage of profile fields populated
- **Uniqueness Check**: Originality compared to existing profiles
- **Brand Alignment**: Consistency with company voice and values
- **SEO Optimization**: Keyword density and search optimization score

### 1.4 Payments & KYC Tab (`/admin/consultants/payments`)

→ **Payment Integration**: [Stripe API](../integrations/stripe-payments.md), [Banking APIs](../integrations/banking.md)
← **Compliance**: [Privacy Policy](../privacy-compliance.md#financial-data), [KYC Regulations](../security.md#kyc-compliance)

#### KYC (Know Your Customer) Management

**KYC Workflow Interface**:
```tsx
interface KYCWorkflow {
  consultantId: string;
  kycLevel: 'basic' | 'enhanced' | 'premium';
  currentStage: {
    stage: 'identity' | 'address' | 'business' | 'financial' | 'review' | 'approved';
    status: 'pending' | 'in_progress' | 'completed' | 'rejected';
    completedAt?: Date;
    rejectionReason?: string;
    nextAction: string;
  };
  requiredDocuments: KYCRequirement[];
  submittedDocuments: KYCDocument[];
  verificationResults: {
    identityVerification: VerificationResult;
    addressVerification: VerificationResult;
    businessVerification?: VerificationResult;
    financialVerification?: VerificationResult;
  };
  complianceFlags: {
    sanctionsList: boolean;
    pepCheck: boolean; // Politically Exposed Person
    adverseMedia: boolean;
    riskLevel: 'low' | 'medium' | 'high';
  };
}

interface KYCRequirement {
  documentType: string;
  required: boolean;
  description: string;
  acceptedFormats: string[];
  maxFileSize: number;
  exampleUrl?: string;
}

interface VerificationResult {
  status: 'pending' | 'verified' | 'failed' | 'manual_review';
  verifiedAt?: Date;
  verificationMethod: 'automated' | 'manual' | 'third_party';
  confidence: number;
  details: any;
  reviewNotes?: string;
}
```

**KYC Management Features**:
- **Document Collection Wizard**: Step-by-step KYC document upload
- **Verification Status Dashboard**: Real-time KYC progress tracking
- **Document Review Interface**: Side-by-side document verification
- **Risk Assessment Tools**: Automated risk scoring and manual overrides
- **Compliance Reporting**: KYC status reports and audit trails
- **Integration Monitors**: Third-party KYC service status and results

#### Payment Setup & Management

**Payment Method Configuration**:
```tsx
interface PaymentSetup {
  consultantId: string;
  paymentMethods: PaymentMethod[];
  defaultMethodId: string;
  payoutSchedule: {
    frequency: 'weekly' | 'bi_weekly' | 'monthly';
    dayOfWeek?: number; // For weekly
    dayOfMonth?: number; // For monthly
    minimumAmount: number;
  };
  taxInformation: {
    taxId: string;
    taxForm?: string; // W-9, W-8BEN, etc.
    taxClassification: string;
    backupWithholding: boolean;
    exemptPayee: boolean;
  };
  invoiceSettings: {
    automaticInvoicing: boolean;
    invoiceTemplate: string;
    includeDetails: boolean;
    brandingEnabled: boolean;
  };
}

interface PaymentMethod {
  id: string;
  type: 'bank_account' | 'paypal' | 'wise' | 'crypto';
  details: {
    accountName: string;
    routingNumber?: string;
    accountNumber?: string;
    iban?: string;
    swiftCode?: string;
    paypalEmail?: string;
    cryptoAddress?: string;
    cryptoCurrency?: string;
  };
  status: 'pending' | 'verified' | 'failed';
  isDefault: boolean;
  verifiedAt?: Date;
}
```

**Payment Management Dashboard**:
- **Payout Calendar**: Visual calendar of scheduled payouts
- **Payment Method Manager**: Add, edit, verify payment methods
- **Transaction History**: Complete payment and payout history
- **Tax Document Generator**: Automatic 1099/tax form generation
- **Dispute Management**: Handle payment disputes and chargebacks
- **Payment Analytics**: Revenue trends, payout patterns, method performance

#### Payout Scheduling & Management

**Payout Management Interface**:
```tsx
interface PayoutManagement {
  scheduledPayouts: ScheduledPayout[];
  processedPayouts: ProcessedPayout[];
  failedPayouts: FailedPayout[];
  payoutRules: {
    minimumAmount: number;
    holdingPeriod: number; // Days to hold before payout
    disputeReserve: number; // Percentage held for disputes
    processingFee: number;
  };
  bulkOperations: {
    generatePayouts: () => void;
    processPayouts: () => void;
    cancelPayouts: (ids: string[]) => void;
    exportPayouts: (dateRange: DateRange) => void;
  };
}

interface ScheduledPayout {
  id: string;
  consultantId: string;
  amount: number;
  currency: string;
  scheduledDate: Date;
  paymentMethodId: string;
  includedBookings: string[];
  fees: {
    platformFee: number;
    processingFee: number;
    netAmount: number;
  };
  status: 'scheduled' | 'processing' | 'completed' | 'failed';
  notes?: string;
}
```

**Payout Features**:
- **Automated Payout Generation**: Rule-based payout calculation
- **Batch Processing**: Process multiple payouts simultaneously
- **Payout Validation**: Verify amounts, methods, and consultant status
- **Hold Management**: Manage payment holds and reserves
- **Reconciliation Tools**: Match payouts with bookings and fees
- **Export & Reporting**: Detailed payout reports for accounting

### 1.5 Performance Analytics Tab (`/admin/consultants/analytics`)

→ **Analytics Integration**: [Analytics Dashboard](../features/analytics.md#consultant-metrics)
⚡ **Data Sources**: [Booking System](../backend/database.md#booking-tables), [Payment Data](../integrations/stripe-payments.md#analytics)

#### Consultant Performance Dashboard

**Key Performance Indicators**:
```tsx
interface ConsultantAnalytics {
  performanceMetrics: {
    totalRevenue: MoneyAmount;
    revenueGrowth: PercentageChange;
    bookingsCount: number;
    bookingsGrowth: PercentageChange;
    averageBookingValue: MoneyAmount;
    conversionRate: number;
    clientSatisfaction: {
      averageRating: number;
      totalReviews: number;
      npsScore: number;
    };
  };
  
  financialMetrics: {
    monthlyRecurringRevenue: MoneyAmount;
    averageDealSize: MoneyAmount;
    lifetimeValue: MoneyAmount;
    payoutHistory: PayoutSummary[];
    outstandingEarnings: MoneyAmount;
    feeBreakdown: {
      platformFees: MoneyAmount;
      processingFees: MoneyAmount;
      netEarnings: MoneyAmount;
    };
  };
  
  engagementMetrics: {
    responseTime: {
      average: number; // minutes
      median: number;
      percentile90: number;
    };
    availabilityRate: number; // Percentage of time available
    utilizationRate: number; // Booked time vs. available time
    repeatClientRate: number;
    cancellationRate: number;
  };
  
  contentMetrics: {
    whitepaperViews: number;
    webinarAttendance: number;
    blogPostEngagement: number;
    linkedinConnections: number;
    profileViews: number;
    inquiryToBookingConversion: number;
  };
}
```

**Analytics Dashboard Components**:
- **Revenue Chart**: Monthly/quarterly revenue trends with projections
- **Booking Analytics**: Booking patterns, peak times, seasonal trends
- **Client Satisfaction Matrix**: Rating distribution, review analysis, NPS trends
- **Performance Comparison**: Consultant rankings and peer comparisons
- **Geographic Analysis**: Client distribution, regional performance
- **Content Performance**: Associated content engagement and conversion impact

**Advanced Analytics Features**:
- **Predictive Analytics**: Revenue forecasting, booking predictions
- **Cohort Analysis**: Client retention and lifetime value analysis
- **Attribution Modeling**: Track which content/activities drive bookings
- **A/B Testing Results**: Profile optimization experiment results
- **Benchmarking**: Industry and internal performance comparisons
- **Custom Reports**: Configurable analytics dashboards per consultant

### 1.6 Enhanced Admin Interfaces for Consultant Integration

#### Consultant-Whitepaper Association Management

→ **Content Integration**: [Whitepaper Management](../features/whitepaper-system.md)
⚡ **Cross-linking**: [Content Marketing](../features/content-marketing.md)

**Whitepaper Authorship Interface**:
```tsx
interface WhitepaperConsultantLink {
  whitepaperInfo: {
    id: string;
    title: Record<string, string>;
    status: 'draft' | 'published' | 'archived';
    publishedDate?: Date;
    downloadCount: number;
    averageRating: number;
  };
  consultantRole: {
    type: 'primary_author' | 'co_author' | 'contributor' | 'reviewer';
    contribution: string; // Description of contribution
    creditLine: string; // How to credit the consultant
    royaltyPercentage?: number; // If applicable
  };
  performanceMetrics: {
    attributedDownloads: number;
    generatedInquiries: number;
    bookingConversions: number;
    revenueAttribution: MoneyAmount;
  };
}
```

**Association Management Features**:
- **Drag-and-Drop Assignment**: Visual consultant-whitepaper linking
- **Contribution Tracking**: Track individual consultant contributions
- **Performance Attribution**: Measure whitepaper impact on consultant bookings
- **Royalty Management**: Calculate and track content-based earnings
- **Content Calendar Integration**: Align consultant expertise with content planning

#### Consultant-Webinar Integration

→ **Webinar System**: [Webinar Management](#2-webinars-management-adminwebinars)

**Enhanced Webinar Session Interface**:
```tsx
interface EnhancedWebinarSession extends WebinarSession {
  consultantAssignment: {
    primarySpeaker: ConsultantReference;
    coSpeakers: ConsultantReference[];
    moderator?: ConsultantReference;
    technicalSupport?: ConsultantReference;
  };
  consultantCompensation: {
    type: 'fixed_fee' | 'revenue_share' | 'per_attendee' | 'hybrid';
    baseAmount?: MoneyAmount;
    revenueSharePercentage?: number;
    perAttendeeRate?: MoneyAmount;
    bonusThresholds?: CompensationTier[];
  };
  consultantRequirements: {
    preparationTime: number; // Hours needed for prep
    equipmentNeeds: string[];
    supportRequirements: string[];
    marketingParticipation: boolean;
  };
}

interface ConsultantReference {
  consultantId: string;
  name: string;
  role: string;
  confirmed: boolean;
  confirmationDate?: Date;
  requirements?: string[];
}
```

#### Enhanced Booking System with Consultant Selection

→ **Booking Integration**: [Booking System](../features/booking-system.md)

**Advanced Booking Interface**:
```tsx
interface EnhancedBookingSystem {
  consultantSelection: {
    availableConsultants: ConsultantAvailability[];
    matchingAlgorithm: {
      expertiseMatch: number;
      availabilityMatch: number;
      priceMatch: number;
      clientPreferenceMatch: number;
      overallScore: number;
    };
    filterOptions: {
      expertise: string[];
      priceRange: [number, number];
      availability: DateRange;
      rating: number;
      languages: string[];
      timezone: string[];
    };
  };
  
  bookingWorkflow: {
    consultantRecommendation: boolean;
    multipleConsultantOption: boolean;
    instantBooking: boolean;
    approvalRequired: boolean;
    paymentTiming: 'upfront' | 'after' | 'split';
  };
  
  dynamicPricing: {
    baseRate: MoneyAmount;
    demandMultiplier: number;
    consultantPremium: number;
    discountApplied: MoneyAmount;
    finalPrice: MoneyAmount;
  };
}

interface ConsultantAvailability {
  consultantId: string;
  availableSlots: TimeSlot[];
  rate: MoneyAmount;
  minimumDuration: number;
  maximumDuration: number;
  bufferTime: number;
  specialRequirements?: string[];
  cancellationPolicy: CancellationPolicy;
}
```

#### Payment Processing Integration Throughout Interfaces

→ **Payment Processing**: [Payment Integration](../integrations/stripe-payments.md)

**Integrated Payment Features**:
- **Real-time Payment Processing**: Instant payment confirmation for bookings
- **Multi-currency Support**: Handle payments in consultant's preferred currency
- **Automatic Fee Calculation**: Platform fees, payment processing fees, consultant earnings
- **Escrow Management**: Hold payments until service completion
- **Refund Processing**: Automated refund workflows for cancellations
- **Invoice Generation**: Automatic invoice creation and delivery
- **Tax Compliance**: Automatic tax calculation and reporting
- **Payment Analytics**: Revenue tracking, payment method performance

### 1.7 Interface Components for Consultant Management

#### Advanced Table Components for Consultant Listings

```tsx
interface ConsultantTableComponent {
  columns: {
    consultant: {
      photo: boolean;
      name: boolean;
      title: boolean;
      rating: boolean;
      status: boolean;
    };
    performance: {
      totalBookings: boolean;
      revenue: boolean;
      conversionRate: boolean;
      responseTime: boolean;
    };
    availability: {
      currentStatus: boolean;
      nextAvailable: boolean;
      timezone: boolean;
    };
    administrative: {
      kycStatus: boolean;
      paymentSetup: boolean;
      lastActivity: boolean;
      createdDate: boolean;
    };
  };
  features: {
    multiSort: boolean;
    columnFilters: boolean;
    globalSearch: boolean;
    rowSelection: boolean;
    bulkActions: boolean;
    exportOptions: boolean;
    columnVisibility: boolean;
    responsiveDesign: boolean;
  };
  actions: {
    quickEdit: boolean;
    viewProfile: boolean;
    viewAnalytics: boolean;
    messageConsultant: boolean;
    toggleStatus: boolean;
    initiateKYC: boolean;
    scheduleInterview: boolean;
  };
}
```

#### Form Components for Consultant Profile Editing

```tsx
interface ConsultantFormComponents {
  personalInfoForm: {
    basicDetails: FormSection;
    contactInformation: FormSection;
    locationSettings: FormSection;
    profilePhoto: FileUploadComponent;
  };
  professionalInfoForm: {
    biographyEditor: PortableTextEditor;
    expertiseSelector: MultiSelectComponent;
    certificationUploader: FileUploadComponent;
    experienceEditor: DynamicFormComponent;
  };
  availabilityForm: {
    scheduleBuilder: ScheduleEditorComponent;
    timezoneSelector: TimezoneComponent;
    holidayManager: DateRangeComponent;
    bookingSettings: BookingRulesComponent;
  };
  paymentForm: {
    kycWizard: StepperComponent;
    paymentMethodManager: PaymentMethodComponent;
    taxInformationForm: TaxFormComponent;
    payoutSettings: PayoutConfigComponent;
  };
}
```

#### Analytics Dashboards with Charts and Metrics

```tsx
interface ConsultantAnalyticsDashboard {
  performanceCharts: {
    revenueChart: {
      type: 'line' | 'bar' | 'area';
      timeRange: 'week' | 'month' | 'quarter' | 'year';
      comparison: boolean;
      forecast: boolean;
    };
    bookingChart: {
      type: 'line' | 'bar' | 'heatmap';
      granularity: 'day' | 'week' | 'month';
      showCancellations: boolean;
    };
    satisfactionChart: {
      type: 'gauge' | 'bar' | 'trend';
      includeNPS: boolean;
      reviewBreakdown: boolean;
    };
  };
  
  metricCards: {
    revenueCard: MetricCardComponent;
    bookingCard: MetricCardComponent;
    ratingCard: MetricCardComponent;
    responseTimeCard: MetricCardComponent;
    conversionCard: MetricCardComponent;
    utilizationCard: MetricCardComponent;
  };
  
  comparisonTools: {
    peerComparison: boolean;
    industryBenchmarks: boolean;
    historicalComparison: boolean;
    goalTracking: boolean;
  };
}
```

#### LinkedIn Profile Preview and Validation Components

```tsx
interface LinkedInIntegrationComponents {
  profilePreview: {
    linkedinProfile: LinkedInProfileRenderer;
    extractedData: DataExtractionRenderer;
    comparisonView: SideBySideComparator;
    validationIndicators: ValidationStatusComponent;
  };
  
  scrapingInterface: {
    jobCreator: ScrapingJobWizard;
    jobMonitor: JobStatusTracker;
    resultReviewer: ScrapingResultReviewer;
    qualityAssessment: DataQualityAnalyzer;
  };
  
  dataValidation: {
    experienceValidator: ExperienceVerifier;
    skillsValidator: SkillsVerifier;
    educationValidator: EducationVerifier;
    connectionsValidator: ConnectionsVerifier;
  };
}
```

### 1.8 Cross-Reference Integration Summary

**API Integration Cross-References**:
→ [Consultant Profile API](../backend/api.md#consultant-profile-endpoints)
→ [LinkedIn Scraping API](../backend/api.md#scraping-endpoints)
→ [Payment Processing API](../backend/api.md#payment-endpoints)
→ [KYC Management API](../backend/api.md#kyc-endpoints)
→ [Analytics API](../backend/api.md#analytics-endpoints)

**Database Schema Cross-References**:
→ [Consultant Tables](../backend/database.md#consultant-tables)
→ [Payment Tables](../backend/database.md#payment-tables)
→ [Scraping Job Tables](../backend/database.md#scraping-tables)
→ [KYC Document Tables](../backend/database.md#kyc-tables)
→ [Analytics Tables](../backend/database.md#analytics-tables)

**Integration Dependencies**:
→ [Scoopp LinkedIn Integration](../integrations/scoopp-linkedin.md)
→ [Stripe Payment Processing](../integrations/stripe-payments.md)
→ [OpenAI API](../integrations/openai-api.md)
→ [File Storage Service](../integrations/file-storage.md)
→ [Email Service](../integrations/smtp-brevo.md)

**Security and Compliance Cross-References**:
← [KYC Compliance Requirements](../security.md#kyc-compliance)
← [Financial Data Protection](../privacy-compliance.md#financial-data)
← [Payment Security](../security.md#payment-security)
← [Data Retention Policies](../privacy-compliance.md#data-retention)

**Feature Integration Cross-References**:
↔️ [Booking System Integration](../features/booking-system.md#consultant-selection)
↔️ [Webinar Management Integration](../features/webinar-system.md#consultant-assignment)
↔️ [Whitepaper System Integration](../features/whitepaper-system.md#author-management)
↔️ [Content Marketing Integration](../features/content-marketing.md#consultant-content)

**User Experience Cross-References**:
← [User Personas](../users/) - All consultant management interfaces designed for [Site Admin](../users/site-admin.md) and [Content Editor](../users/content-editor.md) personas
→ [Design System](../frontend/design-system.md) - All components follow established design patterns
⚡ [Responsive Design](../frontend/public.md#responsive-design) - Mobile-friendly admin interfaces

### 2. Webinars Management (`/admin/webinars`) - Enhanced with Consultant Integration

#### Tab Structure
- **Sessions**: Individual webinar instances
- **Topics**: Reusable webinar templates/topics  
- **Speakers**: Speaker profiles and management
- **Registrations**: Attendee management
- **Analytics**: Performance metrics
- **Settings**: Program configuration

#### Enhanced Session Management with Consultant Integration
```tsx
interface WebinarSession {
  id: string;
  title: Record<string, string>; // Multilingual titles
  description: PortableTextContent; // Rich PortableText descriptions
  
  // Enhanced consultant integration
  consultantAssignment: {
    primarySpeaker: {
      consultantId: string;
      role: 'speaker' | 'presenter' | 'facilitator';
      confirmed: boolean;
      confirmationDate?: Date;
      preparationNotes?: PortableTextContent;
    };
    coSpeakers: ConsultantAssignment[];
    moderator?: ConsultantAssignment;
    panelists: ConsultantAssignment[];
  };
  
  // Consultant compensation tracking
  consultantCompensation: {
    paymentStructure: {
      type: 'fixed_fee' | 'revenue_share' | 'per_attendee' | 'performance_based';
      amounts: Record<string, MoneyAmount>; // Per consultant
      bonuses: CompensationBonus[];
      paymentSchedule: 'upfront' | 'after_event' | 'split';
    };
    performanceMetrics: {
      attendanceThreshold: number;
      satisfactionThreshold: number;
      engagementThreshold: number;
    };
  };
  
  datetime: Date;
  duration: number;
  timezone: string;
  capacity?: number;
  price?: number;
  status: 'draft' | 'published' | 'live' | 'completed' | 'cancelled';
  registrations: EnhancedRegistration[];
  recordingUrl?: string;
  materials: Material[];
  content: {
    agenda: PortableTextContent;
    objectives: PortableTextContent;
    prerequisites?: PortableTextContent;
    targetAudience: PortableTextContent;
    consultantBios: Record<string, PortableTextContent>; // Bio per consultant
  };
  
  // Enhanced analytics
  consultantPerformance: {
    speakerRatings: Record<string, number>;
    audienceEngagement: Record<string, EngagementMetrics>;
    followUpBookings: Record<string, number>;
    contentEffectiveness: Record<string, number>;
  };
}

interface ConsultantAssignment {
  consultantId: string;
  name: string;
  role: string;
  confirmed: boolean;
  confirmationDate?: Date;
  specialRequirements?: string[];
  preparationTime?: number;
  compensation?: MoneyAmount;
}

interface EnhancedRegistration extends Registration {
  consultantPreference?: string; // Preferred consultant ID
  followUpInterest: boolean;
  bookingIntention: 'none' | 'interested' | 'likely' | 'committed';
  specialRequests?: string;
}
```

#### Consultant Assignment Interface for Webinars

→ **Integration**: [Consultant Management](#1-consultants-management-adminconsultants)
⚡ **Dependencies**: [Consultant Availability API](../backend/api.md#consultant-availability)

**Consultant Selection for Webinars**:
- **Smart Matching**: AI-powered consultant recommendation based on webinar topic
- **Availability Integration**: Real-time consultant availability checking
- **Expertise Alignment**: Match consultant skills with webinar topics
- **Performance History**: Show past webinar performance metrics
- **Compensation Calculator**: Dynamic pricing based on consultant tier and webinar scope
- **Multi-consultant Management**: Handle webinars with multiple speakers/panelists

**Webinar-Consultant Workflow**:
1. **Topic Planning**: Define webinar topic and required expertise
2. **Consultant Matching**: AI suggests best-fit consultants
3. **Availability Check**: Verify consultant availability for proposed dates
4. **Assignment & Confirmation**: Send invitations and track confirmations
5. **Preparation Management**: Track preparation progress and requirements
6. **Performance Tracking**: Monitor engagement and satisfaction metrics
7. **Follow-up Coordination**: Manage post-webinar consultant bookings

**Enhanced Webinar Analytics with Consultant Metrics**:
- **Consultant Performance Tracking**: Individual speaker effectiveness
- **Booking Attribution**: Track webinar-to-booking conversion by consultant
- **Audience Engagement by Speaker**: Analyze engagement during different speakers
- **Revenue Attribution**: Calculate revenue generated per consultant
- **Long-term Impact**: Track client relationships formed through webinars

#### Registration Management
- **Attendee List**: With contact information
- **Registration Status**: Confirmed, pending, cancelled
- **Communication Tools**: Email templates, reminders
- **Check-in System**: For live events
- **Certificate Generation**: Post-webinar certificates
- **Export Functions**: Attendee lists, reports

#### Webinar Analytics
- **Registration Metrics**: Sign-up rates, conversion funnels
- **Attendance Tracking**: Show-up rates, engagement
- **Geographic Distribution**: Attendee locations
- **Revenue Analysis**: For paid webinars
- **Feedback Compilation**: Post-event surveys

### 3. Whitepaper Management - Enhanced with Consultant Authorship

→ **Content Integration**: [Whitepaper System](../features/whitepaper-system.md)
← **Consultant Integration**: [Consultant Management](#1-consultants-management-adminconsultants)

#### Enhanced Whitepaper Interface with Consultant Features

```tsx
interface EnhancedWhitepaper {
  id: string;
  title: Record<string, string>;
  description: PortableTextContent;
  content: PortableTextContent;
  
  // Consultant authorship management
  authorship: {
    primaryAuthor: {
      consultantId: string;
      contributionLevel: 'primary' | 'lead' | 'senior';
      royaltyPercentage: number;
      creditLine: string;
      authorBio: PortableTextContent;
    };
    coAuthors: WhitepaperAuthor[];
    contributors: WhitepaperContributor[];
    reviewers: WhitepaperReviewer[];
  };
  
  // Content collaboration tracking
  collaborationTracking: {
    contributionLog: ContributionEntry[];
    reviewCycles: ReviewCycle[];
    approvalWorkflow: ApprovalStage[];
    versionHistory: ContentVersion[];
  };
  
  // Performance attribution
  consultantAttribution: {
    downloadsByAuthor: Record<string, number>;
    inquiriesGenerated: Record<string, number>;
    bookingConversions: Record<string, BookingConversion[]>;
    revenueAttribution: Record<string, MoneyAmount>;
  };
  
  // Marketing integration with consultants
  marketingIntegration: {
    authorPromotionPlan: PromotionPlan[];
    socialMediaStrategy: SocialMediaPlan;
    consultantNetworking: NetworkingPlan;
    speakingOpportunities: SpeakingOpportunity[];
  };
}

interface WhitepaperAuthor {
  consultantId: string;
  contributionType: 'research' | 'writing' | 'editing' | 'methodology';
  sections: string[]; // Which sections they authored
  timeInvested: number; // Hours
  royaltyPercentage: number;
  acknowledgment: string;
}

interface ContributionEntry {
  contributorId: string;
  contributionType: 'content' | 'review' | 'research' | 'editing';
  timestamp: Date;
  description: string;
  sectionsAffected: string[];
  timeSpent: number;
}
```

#### Consultant-Whitepaper Association Dashboard

**Author Management Features**:
- **Consultant Author Search**: Find and assign consultants as whitepaper authors
- **Contribution Tracking**: Monitor individual consultant contributions
- **Royalty Calculator**: Automatic royalty distribution calculation
- **Performance Attribution**: Track downloads and conversions per author
- **Collaboration Workflow**: Manage multi-author whitepaper creation
- **Content Quality Control**: Author-based content review and approval

**Whitepaper Performance by Consultant**:
- **Author Performance Dashboard**: Downloads, engagement, and conversion metrics
- **Content Impact Analysis**: Which authors drive the most valuable leads
- **Cross-Content Performance**: Compare performance across different whitepapers
- **Revenue Attribution Modeling**: Calculate consultant ROI from content creation

### 4. Users Management (`/admin/users`)

#### Admin User Management
```tsx
interface AdminUser {
  id: string;
  email: string; // Primary identifier
  profile: {
    firstName: string;
    lastName: string;
    avatar?: string;
    timezone: string;
    language: 'en' | 'de';
  };
  security: {
    role: UserRole;
    permissions: Permission[];
    isActive: boolean;
    lastLogin?: Date;
    loginAttempts: number;
    lockedUntil?: Date;
    passwordResetRequired?: boolean;
  };
  audit: {
    createdAt: Date;
    createdBy: string;
    lastModifiedAt: Date;
    lastModifiedBy: string;
  };
}
```

#### User Management Features
- **User Creation**: Email invitation system
- **Role Assignment**: With permission inheritance
- **Password Management**: Reset, force change, complexity rules
- **Activity Monitoring**: Login history, actions audit
- **Bulk Operations**: Mass role changes, account actions
- **Security Reports**: Failed logins, suspicious activities

#### Password Reset Process
1. **Admin initiates reset** for user
2. **System generates secure token** (24-hour expiry)
3. **Email sent to user** with reset link
4. **User completes reset** with new password
5. **Confirmation sent** to admin and user
6. **Audit log updated** with reset activity

### 4. Communication Services Management (`/admin/communication`)

#### Email Campaign Management with PortableText
```tsx
interface EmailCampaignInterface {
  campaignDetails: {
    name: string;
    subject: Record<string, string>; // Multilingual subjects
    preheader: Record<string, string>; // Multilingual preheaders
    templateId?: number;
  };
  content: {
    portableContent: PortableTextContent; // Main PortableText content
    htmlContent: Record<string, string>; // Serialized HTML per language
    textContent: Record<string, string>; // Serialized plain text per language
    variables: Record<string, any>;
  };
  recipients: {
    type: 'list' | 'segment' | 'individual';
    config: RecipientConfig;
    totalCount: number;
  };
  scheduling: {
    sendAt?: Date;
    timezone: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
  };
  analytics: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
    unsubscribed: number;
    bounced: number;
  };
}
```

#### Social Media Account Management
```tsx
interface SocialAccountInterface {
  platform: 'linkedin' | 'twitter';
  accountInfo: {
    name: string;
    handle: string;
    profileImage: string;
    followerCount: number;
    isBusinessAccount: boolean;
  };
  authentication: {
    isConnected: boolean;
    tokenExpiry: Date;
    lastSync: Date;
    permissions: string[];
  };
  publishing: {
    activeContent: number;
    scheduledPosts: number;
    totalPosts: number;
    lastPost: Date;
  };
}
```

#### Social Media Content Creation with PortableText
```tsx
interface SocialContentInterface {
  platform: 'linkedin' | 'twitter';
  content: {
    title?: Record<string, string>; // Multilingual titles
    portableContent: PortableTextContent; // Rich PortableText content
    formattedText: Record<string, string>; // Platform-formatted text per language
    contentType: 'post' | 'thread' | 'article';
    platformConfig: PlatformSpecificConfig;
  };
  media: {
    attachments: MediaFile[];
    uploadStatus: 'pending' | 'uploading' | 'ready' | 'failed';
  };
  scheduling: {
    publishNow: boolean;
    scheduledFor?: Date;
    timezone: string;
  };
  engagement: {
    likes: number;
    comments: number;
    shares: number;
    impressions: number;
    engagementRate: number;
  };
}
```

#### Cross-Platform Analytics Dashboard
- **Unified Metrics**: Engagement across all platforms
- **Content Performance**: Top-performing posts by platform
- **Audience Growth**: Follower trends and demographics
- **Campaign ROI**: Lead generation from social content
- **Platform Comparison**: Performance metrics side-by-side

### 5. Integrations Management (`/admin/integrations`)

#### Odoo Integration Tab
```tsx
interface OdooSettings {
  connection: {
    url: string;
    database: string;
    username: string;
    apiKey: string;
    isActive: boolean;
  };
  synchronization: {
    syncTopics: boolean;
    syncEvents: boolean;
    syncLeads: boolean;
    lastSync?: Date;
    autoSync: boolean;
    syncInterval: number; // minutes
  };
  fieldMapping: {
    leadFields: FieldMapping[];
    eventFields: FieldMapping[];
    productFields: FieldMapping[];
  };
}
```

#### Integration Features
- **Connection Testing**: Validate API credentials
- **Sync Status**: Real-time synchronization monitoring  
- **Error Handling**: Failed sync notifications
- **Manual Sync**: Force synchronization triggers
- **Mapping Configuration**: Field correspondence setup
- **Audit Trail**: All integration activities logged

## Advanced Features

### 1. Multilingual Content Management

#### Translation Interface
```tsx
interface TranslationManager {
  sourceLanguage: 'en' | 'de';
  targetLanguage: 'en' | 'de';
  content: {
    original: string;
    translated: string;
    status: 'pending' | 'translated' | 'reviewed';
    method: 'manual' | 'ai';
    translator?: string;
    reviewedBy?: string;
  };
}
```

#### PortableText Translation Features
- **Block-level translation** with PortableText structure preservation
- **Side-by-side PortableText editors** for manual translations
- **AI translation** with PortableText block awareness
- **Translation memory** for PortableText content consistency
- **Progress tracking** per PortableText block and language
- **Quality assurance** tools for PortableText translations
- **Bulk translation** operations for multiple PortableText blocks
- **Structure validation** to ensure translated blocks maintain proper format

### 2. Analytics & Reporting

#### Report Builder with PortableText Analytics
- **Custom Dashboards**: Drag-and-drop widget creation including PortableText metrics
- **Content Performance Reports**: PortableText block effectiveness analysis
- **Translation Reports**: Multilingual content coverage and quality metrics
- **SEO Reports**: PortableText-based SEO performance and recommendations
- **Scheduled Reports**: Automated email delivery with PortableText insights
- **Export Options**: PDF, Excel, CSV formats including PortableText data
- **Data Filtering**: Date ranges, categories, users, content types, block types
- **Comparative Analysis**: Period-over-period comparisons including content changes

#### Key Performance Indicators with PortableText Analytics
```tsx
interface KPIMetrics {
  traffic: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    sessionDuration: number;
  };
  conversions: {
    webinarSignups: number;
    whitepaperDownloads: number;
    consultationBookings: number;
    leadGeneration: number;
  };
  engagement: {
    emailOpenRates: number;
    socialShares: number;
    contentRating: number;
    userRetention: number;
  };
  content: {
    portableTextPerformance: {
      blockEngagement: Record<string, number>; // Engagement by block type
      averageReadingTime: number;
      contentCompletionRate: number;
      translationCoverage: number;
      seoScore: number;
    };
    contentHealth: {
      untranslatedBlocks: number;
      brokenAssetReferences: number;
      validationErrors: number;
      outdatedContent: number;
    };
  };
}
```

### 3. System Administration

#### Backup Management
- **Automated Backups**: Daily database and file backups
- **Manual Backup**: On-demand backup creation
- **Restore Interface**: Point-in-time recovery options
- **Backup Verification**: Integrity checking
- **Offsite Storage**: Cloud backup synchronization

#### Log Management
```tsx
interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  category: string;
  message: string;
  userId?: string;
  metadata: Record<string, any>;
  stackTrace?: string;
}
```

#### Log Features
- **Real-time Log Viewer**: Live log streaming
- **Log Filtering**: By level, category, date, user
- **Search Functionality**: Full-text log search
- **Export Options**: Download log files
- **Alerting System**: Critical error notifications

## User Experience Features

### Responsive Design
- **Desktop First**: Optimized for admin workflows
- **Tablet Support**: Touch-friendly controls
- **Mobile Access**: Emergency administrative access
- **Adaptive Layouts**: Screen size optimization

### Accessibility
- **WCAG 2.1 AA**: Full compliance standards
- **Keyboard Navigation**: All functions accessible
- **Screen Reader**: Proper ARIA labels
- **High Contrast**: Optional high contrast mode
- **Font Scaling**: User-adjustable text sizes

### Performance Optimization
- **Lazy Loading**: On-demand component loading
- **Virtual Scrolling**: Large dataset handling
- **Caching Strategy**: Intelligent data caching
- **Pagination**: Efficient data presentation
- **Debounced Search**: Optimized search performance

## Data Management

### Table Components
```tsx
interface TableConfig<T> {
  columns: ColumnDefinition<T>[];
  data: T[];
  sorting: SortingState;
  filtering: FilteringState;
  pagination: PaginationState;
  selection: SelectionState;
  actions: TableAction<T>[];
}
```

### Standard Table Features
- **Sorting**: Multi-column sorting support
- **Filtering**: Column-based filtering options
- **Search**: Global and column-specific search
- **Pagination**: Configurable page sizes
- **Selection**: Single/multiple row selection
- **Export**: Selected or all data export
- **Column Visibility**: User-customizable columns

### Form Management with PortableText
```tsx
interface FormConfig {
  validation: ZodSchema;
  fields: FormField[];
  portableTextFields: PortableTextFieldConfig[]; // PortableText-specific field configs
  layout: 'vertical' | 'horizontal' | 'grid';
  submitBehavior: 'save' | 'saveAndNew' | 'saveAndEdit';
  autosave: boolean;
  dirtyWarning: boolean;
}

// PortableText field configuration
interface PortableTextFieldConfig {
  name: string;
  label: Record<string, string>; // Multilingual labels
  placeholder?: Record<string, string>; // Multilingual placeholders
  required: boolean;
  multilingual: boolean;
  maxBlocks?: number;
  allowedBlockTypes: string[];
  validation?: PortableTextValidationConfig;
}
```

### Form Features with PortableText
- **Real-time Validation**: Immediate feedback including PortableText structure validation
- **Auto-save**: Prevent data loss with PortableText content preservation
- **Dirty State Warning**: Unsaved changes alert for PortableText fields
- **Field Dependencies**: Conditional field visibility including PortableText fields
- **PortableText Editing**: Block-based content editor with live preview
- **File Upload**: Drag-and-drop with PortableText asset integration
- **Content Preview**: Live preview of PortableText rendering
- **Translation Support**: Multilingual PortableText field editing
- **Block Validation**: Real-time PortableText block structure validation

## Error Handling & Notifications

### Error Management
```tsx
interface ErrorBoundary {
  fallbackComponent: ComponentType;
  onError: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange: boolean;
}
```

### Notification System
```tsx
interface NotificationManager {
  success: (message: string, options?: NotificationOptions) => void;
  warning: (message: string, options?: NotificationOptions) => void;
  error: (message: string, options?: NotificationOptions) => void;
  info: (message: string, options?: NotificationOptions) => void;
}
```

### Notification Types
- **Success**: Action completed successfully
- **Warning**: Important information or potential issues
- **Error**: Failed operations with details
- **Info**: General system information
- **Loading**: Long-running operation status

## Security Features

### Session Management
- **Automatic Timeout**: 30-minute inactivity logout
- **Concurrent Sessions**: Limit active sessions
- **Session Monitoring**: Track active user sessions
- **Force Logout**: Admin-initiated session termination

### Audit Trail
```tsx
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  oldValue?: any;
  newValue?: any;
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  sessionId: string;
}
```

### Security Monitoring
- **Failed Login Tracking**: Suspicious activity detection
- **Permission Changes**: Role and access modifications
- **Data Modifications**: All CRUD operations logged
- **System Access**: Administrative function usage
- **Export Activities**: Data export tracking

## Testing Strategy

### Component Testing
- **Unit Tests**: Individual component testing
- **Integration Tests**: Component interaction testing
- **Visual Tests**: Screenshot comparison testing
- **Accessibility Tests**: A11y compliance validation

### User Workflow Testing
- **Authentication Flow**: Login/logout processes
- **CRUD Operations**: Data management workflows
- **Permission Testing**: Role-based access validation
- **Error Scenarios**: Error handling verification

## Deployment Considerations

### Build Configuration
```json
{
  "build": {
    "outDir": "dist-admin",
    "rollupOptions": {
      "output": {
        "manualChunks": {
          "vendor": ["react", "react-dom"],
          "ui": ["@headlessui/react", "recharts"],
          "portabletext": ["@portabletext/react", "@portabletext/types"],
          "editor": ["./src/components/PortableTextEditor"],
          "admin": ["./src/admin"]
        }
      }
    }
  },
  "dependencies": {
    "@portabletext/react": "^3.0.0",
    "@portabletext/types": "^2.0.0",
    "@portabletext/editor": "^1.0.0"
  }
}
```

### Environment Configuration
```env
# Admin Panel Configuration
VITE_ADMIN_API_URL=http://localhost:8000
VITE_ADMIN_PORT=8036
VITE_SESSION_TIMEOUT=1800000
VITE_AUTO_LOGOUT_WARNING=300000

# PortableText Configuration
VITE_PORTABLETEXT_MAX_BLOCKS=100
VITE_PORTABLETEXT_AUTO_SAVE_INTERVAL=5000
VITE_PORTABLETEXT_VALIDATION_STRICT=true
VITE_ENABLE_AI_TRANSLATION=true

# Feature Flags
VITE_ENABLE_ADVANCED_ANALYTICS=true
VITE_ENABLE_BULK_OPERATIONS=true
VITE_ENABLE_AUDIT_LOGS=true
VITE_ENABLE_PORTABLETEXT_EDITOR=true
VITE_ENABLE_MULTILINGUAL_EDITING=true
```

### Performance Monitoring
- **Bundle Size Analysis**: Webpack Bundle Analyzer
- **Runtime Performance**: React DevTools Profiler  
- **API Response Times**: Network monitoring
- **Error Tracking**: Automated error reporting
- **User Experience Metrics**: Core Web Vitals tracking

## Future Enhancements

### Planned Features
- **Advanced PortableText Blocks**: Custom business-specific block types
- **PortableText Templates**: Pre-built content templates and layouts
- **Advanced Permissions**: Fine-grained access control including block-level permissions
- **Workflow Engine**: Approval workflows for PortableText content
- **API Management**: Admin API for third-party integrations
- **Advanced Analytics**: Machine learning insights for content performance
- **Mobile App**: Native mobile administration with PortableText editing
- **Collaborative Editing**: Real-time PortableText content collaboration
- **Version Control**: Git-like versioning for PortableText content
- **AI Content Assistant**: AI-powered content suggestions and optimization

### Technical Roadmap
- **PortableText Performance**: Optimized rendering and editing performance
- **Enhanced PortableText Features**: Advanced block types and serialization options
- **Better Content UX**: Improved PortableText editing experience
- **Content Migration Tools**: Tools for migrating legacy content to PortableText
- **Integration Expansion**: PortableText integration with additional services
- **Scalability**: Architecture improvements for large-scale PortableText content management
- **Enhanced Security**: Content-level security and validation improvements
- **AI Integration**: Enhanced AI features for PortableText content creation and optimization