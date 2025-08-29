# Magnetiq v2 - Admin Panel Frontend Specification

## Overview

The Admin Panel is a comprehensive dashboard for managing all aspects of the Magnetiq CMS. It provides a secure, intuitive interface for administrators to control the entire system through a modular architecture with dedicated management interfaces.

→ **Architecture Foundation**: [System Architecture](../../architecture.md#admin-panel-architecture)
← **Used by**: [Site Admin](../../users/site-admin.md), [Content Editor](../../users/content-editor.md)
⚡ **Dependencies**: [Backend API](../../backend/api.md), [Authentication System](../../security.md#admin-authentication)

This specification serves as the architectural overview and entry point to specialized admin panel features:
- [Consultant Management](./consultant-management.md) - Consultant profiles, LinkedIn scraping, payments, and performance analytics
- [Booking Management](./business/booking-management.md) - Meeting scheduling, calendar integration, availability management, and booking workflows
- [Webinar Management](./business/webinar-management.md) - Session creation, consultant assignment, registration management, and webinar analytics
- [Payment Management](./business/payment-management.md) - Financial transactions, payouts, KYC processing, and billing
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
- **URL**: `http://localhost:8088` (development)
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
│   ├── Payments & Payouts → [Payment Management](./business/payment-management.md#consultant-payouts)
│   └── Performance Analytics → [Analytics Dashboard](./analytics-dashboard.md#consultant-analytics)
├── Webinars → [Webinar Management](./business/webinar-management.md)
├── Whitepapers → [Whitepaper Management](./business/whitepapers-manager.md)
├── Coupons & Discounts → [Coupon Management](./business/coupon-management.md)
│   ├── Coupon Creation → [Coupon Management](./business/coupon-management.md#coupon-creation--editing)
│   ├── Usage Analytics → [Coupon Management](./business/coupon-management.md#analytics-dashboard)
│   ├── Fraud Prevention → [Coupon Management](./business/coupon-management.md#security--fraud-prevention)
│   └── Campaign Management → [Coupon Management](./business/coupon-management.md#bulk-operations--campaign-management)
└── Bookings → [Booking Management](./business/booking-management.md)

Communication Services → [Content Management](./content-management.md#communication-services)
├── Email Campaigns → [Content Management](./content-management.md#email-campaigns)
├── LinkedIn Management → [Consultant Management](./consultant-management.md#linkedin-integration)
├── Twitter Management → [Content Management](./content-management.md#social-media)
└── Analytics & Engagement → [Analytics Dashboard](./analytics-dashboard.md#engagement-metrics)

Financial Management → [Payment Management](./business/payment-management.md)
├── Transactions → [Payment Management](./business/payment-management.md#transaction-management)
├── Consultant Payouts → [Payment Management](./business/payment-management.md#payout-management)
├── KYC Processing → [Payment Management](./business/payment-management.md#kyc-management)
└── Financial Reports → [Analytics Dashboard](./analytics-dashboard.md#financial-analytics)

User Management
├── Admin Users → [Authentication](./authentication.md#admin-users)
├── User Roles → [Authentication](./authentication.md#role-management)
├── Activity Logs → [Analytics Dashboard](./analytics-dashboard.md#audit-logs)
└── Sessions → [Authentication](./authentication.md#session-management)

Integrations → [Integrations Overview](../../integrations/integrations.md)
├── Payment Services → [Payment Management](./business/payment-management.md#integration-management)
├── Social Media APIs → [Consultant Management](./consultant-management.md#social-integrations)
└── External Services → [Integrations Overview](../../integrations/integrations.md#external-services)

System Settings
├── General Settings → [System Settings](./system-settings.md#general-configuration)
├── Multilingual → [Content Management](./content-management.md#multilingual-settings)
├── Backup & Recovery → [System Settings](./system-settings.md#backup-management)
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
→ **Financial Overview**: [Payment Management](./business/payment-management.md#dashboard-overview) - Revenue, payouts, and financial metrics

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
- **Performance Analytics**: Individual and comparative performance metrics

→ **Booking Operations**: [Booking Management Specification](./business/booking-management.md)
- **Meeting Scheduling**: Advanced calendar integration and appointment booking
- **Availability Management**: Consultant schedule coordination and optimization
- **Service Configuration**: Dynamic service catalog and pricing management
- **Booking Analytics**: Performance tracking and revenue optimization

→ **Financial Operations**: [Payment Management Specification](./business/payment-management.md)  
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
→ **Complete User Management**: [Authentication Specification](./authentication.md)
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

→ **Integration Details**: [Integrations Overview](../../integrations/integrations.md)
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
  port: 8088;
  sessionTimeout: 1800000; // 30 minutes
  features: {
    consultantManagement: boolean;
    paymentProcessing: boolean;
    contentManagement: boolean;
    analytics: boolean;
  };
}
```

### Environment Configuration
```env
# Admin Panel Configuration
VITE_ADMIN_API_URL=http://localhost:8000
VITE_ADMIN_PORT=8088
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
- [Booking Management](./business/booking-management.md) - Meeting scheduling, calendar integration, and booking workflows
- [Webinar Management](./business/webinar-management.md) - Session creation, consultant assignment, and webinar analytics
- [Payment Management](./business/payment-management.md) - Financial processing and KYC workflows
- [Content Management](./content-management.md) - PortableText editing and multilingual content
- [Analytics Dashboard](./analytics-dashboard.md) - Performance metrics and business intelligence
- [Authentication](./authentication.md) - Admin user and role management
- [Integrations Overview](../../integrations/integrations.md) - External service integration management

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