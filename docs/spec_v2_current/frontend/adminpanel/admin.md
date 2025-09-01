# Magnetiq v2 - Admin Panel Frontend Specification

## Overview

The Admin Panel is a comprehensive dashboard for managing all aspects of the Magnetiq CMS. It provides a secure, intuitive interface for administrators to control the entire system through a modular architecture with dedicated management interfaces.

→ **Architecture Foundation**: [System Architecture](../../architecture.md#admin-panel-architecture)
← **Used by**: [Site Admin](../../users/site-admin.md), [Content Editor](../../users/content-editor.md)
⚡ **Dependencies**: [Backend API](../../backend/api.md), [Authentication System](../../security.md#admin-authentication)

This specification serves as the architectural overview and entry point to specialized admin panel features:
- [Consultant Management](./consultant-management.md) - Consultant profiles, LinkedIn scraping, payments, and performance analytics
- [Book-a-Meeting Management](./business/book-a-meeting.md) - Meeting scheduling, calendar integration, availability management, and booking workflows
- [Webinar Management](./business/webinar.md) - Session creation, consultant assignment, registration management, and webinar analytics
- [Payment Management](./business/payment.md) - Financial transactions, payouts, KYC processing, and billing
- [Coupon Management](./business/coupon.md) - Promotional campaigns, discount management, and usage analytics
- [Integration Management](./integration-management.md) - External service integrations, configurations, monitoring, and troubleshooting
- [Content Management](./content-management.md) - PortableText editing, multilingual content, and media library
- [Analytics Dashboard](./analytics-dashboard.md) - Performance metrics, reporting, and business intelligence
- [System Settings](./system-settings.md) - Contact management, general configuration, security, backup, and system maintenance

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
│                        Header Bar                           │
│       Search Bar        |  🔔  ⚙️  👤  |                   │
├──────────────┬──────────────────────────────────────────────┤
│              │                                              │
│   Sidebar    │                Main Content Area             │
│   Navigation │                                              │
│              │                                              │
│  • Dashboard │                                              │
│  • Content   │                                              │
│  • Business  │                                              │
│  • Users     │                                              │
│              │                                              │
├──────────────┼──────────────────────────────────────────────┤
│  User Info   │                Footer/Status                 │
│  + Sign out  │     System Health  |  Version: 2.0.0        │
└──────────────┴──────────────────────────────────────────────┘
```

### Collapsible Sidebar Navigation
- **Collapsed state**: Icons only with tooltips
- **Expanded state**: Icons + labels
- **Hover behavior**: Auto-expand on hover (collapsed mode)
- **User preference**: Remember state in localStorage
- **Responsive**: Auto-collapse on mobile screens

### Top Bar Features

#### Left Section
- **Search Bar**: Global search functionality for content, webinars, users, and system data
- **Dynamic placeholder**: Context-aware search suggestions based on current section
- **Search scope**: Intelligent filtering based on current admin section

#### Right Section
- **Notifications**: Bell icon with unread count and dropdown panel
  - Real-time notification feed with unread indicators
  - Categorized notifications (system alerts, user actions, business events)
  - "View all notifications" link for comprehensive notification management
- **Settings**: Gear icon dropdown with system configuration options
  - **System Configuration**: Core system settings and parameters
  - **User Preferences**: Personal admin interface customization
  - **Notification Settings**: Alert preferences and communication settings
- **User Profile**: Avatar + name dropdown with user management
  - **Your Profile**: Personal account management and preferences
  - **Sign out**: Secure session termination with logout confirmation

## Navigation Menu Structure

### Simplified Left Sidebar Navigation

The left sidebar navigation has been streamlined to focus on the four core administrative areas:

```
Dashboard
├── Analytics Overview → [Analytics Dashboard](./analytics-dashboard.md#overview)
├── System Health → [Analytics Dashboard](./analytics-dashboard.md#system-health)
├── Quick Actions
└── Performance Metrics

Content → [Content Management](./content-management.md)
├── Pages → [Content Management](./content-management.md#page-management)
├── Page Builder → [Content Management](./content-management.md#page-builder)
├── Media Library → [Content Management](./content-management.md#media-library)
├── SEO Settings → [Content Management](./content-management.md#seo-management)
├── Email Campaigns → [Content Management](./content-management.md#email-campaigns)
├── Social Media → [Content Management](./content-management.md#social-media)
└── Multilingual → [Content Management](./content-management.md#multilingual-settings)

Business → Business Operations Management
├── Webinars → [Webinar Management](./business/webinar.md)
├── Bookings → [Book-a-Meeting Management](./business/book-a-meeting.md)
├── Consultants → [Consultant Management](./consultant-management.md)
│   ├── Consultant Profiles → [Consultant Management](./consultant-management.md#profile-management)
│   ├── LinkedIn Scraping → [Consultant Management](./consultant-management.md#linkedin-scraping)
│   ├── Payments & Payouts → [Payment Management](./business/payment.md#consultant-payouts)
│   └── Performance Analytics → [Analytics Dashboard](./analytics-dashboard.md#consultant-analytics)
├── Whitepapers → [Whitepaper Management](./business/whitepapers.md)
├── Coupons & Discounts → [Coupon Management](./business/coupon.md)
│   ├── Coupon Creation → [Coupon Management](./business/coupon.md#coupon-creation--editing)
│   ├── Usage Analytics → [Coupon Management](./business/coupon.md#analytics-dashboard)
│   ├── Fraud Prevention → [Coupon Management](./business/coupon.md#security--fraud-prevention)
│   └── Campaign Management → [Coupon Management](./business/coupon.md#bulk-operations--campaign-management)
├── Financial Management → [Payment Management](./business/payment.md)
│   ├── Transactions → [Payment Management](./business/payment.md#transaction-management)
│   ├── Consultant Payouts → [Payment Management](./business/payment.md#payout-management)
│   ├── KYC Processing → [Payment Management](./business/payment.md#kyc-management)
│   └── Financial Reports → [Analytics Dashboard](./analytics-dashboard.md#financial-analytics)
└── Integrations → [Integration Management](./integration-management.md)
    ├── Integration Dashboard → [Integration Management](./integration-management.md#integration-dashboard)
    ├── Service Configuration → [Integration Management](./integration-management.md#configuration-management)
    ├── Connection Testing → [Integration Management](./integration-management.md#connection-testing--diagnostics)
    ├── Credential Management → [Integration Management](./integration-management.md#credential-management)
    ├── Usage Analytics → [Integration Management](./integration-management.md#usage-analytics--monitoring)
    ├── Error Logs → [Integration Management](./integration-management.md#error-logging--troubleshooting)
    └── Health Monitoring → [Integration Management](./integration-management.md#integration-health-monitoring)

Users → User Management
├── Admin Users → [Authentication](./authentication.md#admin-users)
├── User Roles → [Authentication](./authentication.md#role-management)
├── Activity Logs → [Analytics Dashboard](./analytics-dashboard.md#audit-logs)
└── Sessions → [Authentication](./authentication.md#session-management)
```

### Header-Based Settings Access

Settings functionality has been moved from the left sidebar to a gear icon dropdown in the top right header, providing quick access to system configuration without cluttering the main navigation:

**Settings Dropdown (Gear Icon) →** Accessed via top right header
├── **System Configuration** → [System Settings](./system-settings.md#general-configuration)
│   ├── General Configuration → [System Settings](./system-settings.md#general-configuration)
│   ├── Site Configuration → [System Settings](./system-settings.md#site-configuration)
│   ├── Email Configuration → [System Settings](./system-settings.md#email-configuration)
│   ├── Security Settings → [System Settings](./system-settings.md#security-settings)
│   ├── Backup & Recovery → [System Settings](./system-settings.md#backup-recovery)
│   └── System Maintenance → [System Settings](./system-settings.md#system-maintenance)
├── **User Preferences** → Personal admin interface settings
│   ├── Interface Customization
│   ├── Theme Preferences
│   ├── Language Settings
│   └── Dashboard Layout
└── **Notification Settings** → Communication and alert preferences
    ├── Email Notifications
    ├── System Alerts
    ├── Performance Warnings
    └── Activity Notifications

### Removed Navigation Elements

**Analytics** has been **removed from the left sidebar navigation** as it's now integrated into the Dashboard and accessible through individual feature areas. This streamlines the navigation while maintaining full analytics functionality through:
- Dashboard overview analytics
- Feature-specific analytics within each section
- Comprehensive reporting accessible via Settings > System Configuration > Reports

### Navigation Implementation
```tsx
interface MenuItem {
  id: string;
  name: string; // Display name
  href: string; // Route path
  icon: IconComponent;
  description: string; // Subtitle description
  children?: SubMenuItem[]; // Sub-navigation items
  badge?: number; // Notification count
  permission?: Permission;
}

interface SubMenuItem {
  name: string;
  href: string;
  permission?: Permission;
}

// Current navigation structure
const navigation: MenuItem[] = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: HomeIcon,
    description: 'Overview and analytics'
  },
  {
    name: 'Content',
    href: '/admin/content',
    icon: DocumentTextIcon,
    description: 'Manage pages and content',
    children: [
      { name: 'Pages', href: '/admin/content/pages' }
    ]
  },
  {
    name: 'Business',
    href: '/admin/business',
    icon: VideoCameraIcon,
    description: 'Webinars and bookings',
    children: [
      { name: 'Webinars', href: '/admin/business/webinars' },
      { name: 'Bookings', href: '/admin/business/bookings' }
    ]
  },
  {
    name: 'Users',
    href: '/admin/users',
    icon: UsersIcon,
    description: 'User management'
  }
];

// Settings dropdown structure (accessed via gear icon)
interface SettingsMenuItem {
  name: string;
  href: string;
  icon: IconComponent;
  permission?: Permission;
}

const settingsMenu: SettingsMenuItem[] = [
  {
    name: 'System Configuration',
    href: '/admin/settings/system',
    icon: Cog6ToothIcon
  },
  {
    name: 'User Preferences', 
    href: '/admin/settings/preferences',
    icon: UserCircleIcon
  },
  {
    name: 'Notification Settings',
    href: '/admin/settings/notifications', 
    icon: BellIcon
  }
];
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
- **Performance Analytics**: Individual and comparative performance metrics

→ **Book-a-Meeting Operations**: [Book-a-Meeting Management Specification](./business/book-a-meeting.md)
- **Meeting Scheduling**: Advanced calendar integration and appointment booking
- **Availability Management**: Consultant schedule coordination and optimization
- **Service Configuration**: Dynamic service catalog and pricing management
- **Booking Analytics**: Performance tracking and revenue optimization

→ **Financial Operations**: [Payment Management Specification](./business/payment.md)  
- **Payment Processing**: Transaction management and automated workflows
- **KYC Management**: Compliance processing and document verification
- **Payout Systems**: Automated consultant compensation and scheduling
- **Financial Reporting**: Revenue tracking and financial analytics

→ **Integration Operations**: [Integration Management Specification](./integration-management.md)
- **Service Configuration**: Centralized external service setup and credential management
- **Connection Monitoring**: Real-time integration health and performance tracking
- **Error Management**: Comprehensive logging, alerting, and troubleshooting tools
- **Usage Analytics**: API consumption, rate limiting, and cost optimization

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
  port: 8036;
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
- [Book-a-Meeting Management](./business/book-a-meeting.md) - Meeting scheduling, calendar integration, and booking workflows
- [Webinar Management](./business/webinar.md) - Session creation, consultant assignment, and webinar analytics
- [Payment Management](./business/payment.md) - Financial processing and KYC workflows
- [Coupon Management](./business/coupon.md) - Promotional campaigns, discount management, and usage analytics
- [Integration Management](./integration-management.md) - External service integrations, configurations, and monitoring
- [Content Management](./content-management.md) - PortableText editing and multilingual content
- [Analytics Dashboard](./analytics-dashboard.md) - Performance metrics and business intelligence
- [System Settings](./system-settings.md) - Contact management, system configuration, and maintenance
- [Authentication](./authentication.md) - Admin user and role management

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