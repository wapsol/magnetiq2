# Magnetiq v2 - Admin Panel Frontend Specification

## Overview

The Admin Panel is a comprehensive dashboard for managing all aspects of the Magnetiq CMS, including content management, user administration, webinars, whitepapers, bookings, and system integrations. It provides a secure, intuitive interface for administrators to control the entire system.

## Technical Foundation

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with Headless UI components
- **State Management**: Redux Toolkit with RTK Query
- **Tables**: TanStack Table v8 (React Table)
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for analytics visualization
- **Rich Text**: Tiptap editor with extensions
- **Drag & Drop**: dnd-kit for page builder

### Access Configuration
- **URL**: `http://localhost:8088` (development)
- **Production URL**: `https://admin.voltaic.systems`
- **Authentication**: JWT-based with role-based access control
- **Session Management**: Auto-logout after inactivity

## Authentication System

### Login Interface
```tsx
interface LoginForm {
  email: string; // Primary identifier (not username)
  password: string;
  rememberMe?: boolean;
  captcha?: string; // After 3 failed attempts
}
```

### Security Features
- **Email-based authentication** (no usernames)
- **Account lockout** after 5 failed attempts
- **Password complexity requirements**
- **Two-factor authentication** support (future)
- **Session timeout** after 30 minutes inactivity
- **Password reset** via email link
- **Login audit trail**

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
├── Analytics Overview
├── System Health
└── Quick Actions

Content Management
├── Pages
├── Page Builder
├── Media Library
└── SEO Settings

Business Management
├── Consultants
├── Webinars
├── Whitepapers
└── Bookings

User Management
├── Admin Users
├── User Roles
├── Activity Logs
└── Sessions

Integrations
├── Odoo Settings
├── Google Calendar
├── Email Service
└── API Keys

System Settings
├── General Settings
├── Multilingual
├── Backup & Recovery
└── Logs
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

### Analytics Overview
- **Key Performance Indicators**
  - Total users and sessions
  - Webinar registration rates
  - Whitepaper download metrics
  - Consultation booking statistics
  - Revenue tracking (if applicable)

- **Visual Charts**
  - User growth over time (line chart)
  - Top performing content (bar chart)
  - Geographic distribution (world map)
  - Device/browser analytics (pie charts)

- **Real-time Statistics**
  - Currently online users
  - Recent activities feed
  - System performance metrics
  - API response times

### System Health Dashboard
```tsx
interface SystemHealth {
  database: {
    status: 'healthy' | 'warning' | 'error';
    responseTime: number;
    connections: number;
  };
  api: {
    status: 'healthy' | 'warning' | 'error';
    uptime: number;
    lastError?: string;
  };
  integrations: {
    odoo: IntegrationStatus;
    googleCalendar: IntegrationStatus;
    emailService: IntegrationStatus;
  };
}
```

## Content Management

### Page Builder Interface

#### Drag & Drop System
- **Component Library**: Pre-built blocks (hero, text, images, forms)
- **Visual Editor**: WYSIWYG editing with live preview
- **Layout System**: Grid-based responsive design
- **Component Properties**: Sidebar panel for customization
- **Undo/Redo**: History management for changes

#### Page Management
```tsx
interface Page {
  id: string;
  title: TranslatedText;
  slug: string;
  status: 'draft' | 'published' | 'archived';
  author: AdminUser;
  blocks: PageBlock[];
  seo: SEOSettings;
  publishedAt?: Date;
  scheduledAt?: Date;
}
```

#### Content Blocks
- **Hero Block**: Background image/video + CTA
- **Text Block**: Rich text with formatting
- **Image Block**: Single/gallery with captions
- **Video Block**: Embedded or uploaded videos
- **CTA Block**: Call-to-action buttons
- **Form Block**: Contact/subscription forms
- **Testimonial Block**: Customer testimonials
- **Feature Block**: Product/service highlights

### Media Library
- **File Upload**: Drag & drop with progress indicators
- **Image Optimization**: Automatic resizing and compression
- **File Organization**: Folders and tagging system
- **Search & Filter**: By type, size, date, tags
- **CDN Integration**: Automatic asset distribution
- **Alt Text Management**: Accessibility compliance

## Business Management

### 1. Consultants Management (`/admin/consultants`)

#### Features
- **CRUD Operations**: Create, read, update, delete consultants
- **Profile Management**: Photos, bios, expertise areas
- **Availability Settings**: Working hours, time zones, holidays
- **Performance Analytics**: Booking rates, client feedback
- **Online/Offline Status**: Manual toggle for availability

#### Consultant Profile Structure
```tsx
interface Consultant {
  id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    title: string;
    email: string;
    phone?: string;
    photo: string;
  };
  professionalInfo: {
    biography: TranslatedText;
    expertise: string[];
    linkedin?: string;
    certifications: Certification[];
    languages: ('en' | 'de')[];
  };
  availability: {
    timezone: string;
    workingHours: WeeklySchedule;
    holidays: DateRange[];
    isOnline: boolean;
  };
  analytics: {
    totalBookings: number;
    averageRating: number;
    responseTime: number;
  };
}
```

#### Consultant List Interface
- **Table View**: Sortable columns with filtering
- **Card View**: Visual grid with profile photos
- **Quick Actions**: Edit, view profile, toggle status
- **Bulk Operations**: Mass status updates
- **Export Options**: CSV, PDF reports

### 2. Webinars Management (`/admin/webinars`)

#### Tab Structure
- **Sessions**: Individual webinar instances
- **Topics**: Reusable webinar templates/topics  
- **Speakers**: Speaker profiles and management
- **Registrations**: Attendee management
- **Analytics**: Performance metrics
- **Settings**: Program configuration

#### Session Management
```tsx
interface WebinarSession {
  id: string;
  topic: WebinarTopic;
  speaker: Speaker;
  datetime: Date;
  duration: number;
  timezone: string;
  capacity?: number;
  price?: number;
  status: 'draft' | 'published' | 'live' | 'completed' | 'cancelled';
  registrations: Registration[];
  recordingUrl?: string;
  materials: Material[];
}
```

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

### 3. Users Management (`/admin/users`)

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

### 4. Integrations Management (`/admin/integrations`)

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

#### Translation Features
- **Side-by-side editor** for manual translations
- **AI translation** with human review workflow
- **Translation memory** for consistency
- **Progress tracking** per language/content type
- **Quality assurance** tools and validation
- **Bulk translation** operations

### 2. Analytics & Reporting

#### Report Builder
- **Custom Dashboards**: Drag-and-drop widget creation
- **Scheduled Reports**: Automated email delivery
- **Export Options**: PDF, Excel, CSV formats
- **Data Filtering**: Date ranges, categories, users
- **Comparative Analysis**: Period-over-period comparisons

#### Key Performance Indicators
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

### Form Management
```tsx
interface FormConfig {
  validation: ZodSchema;
  fields: FormField[];
  layout: 'vertical' | 'horizontal' | 'grid';
  submitBehavior: 'save' | 'saveAndNew' | 'saveAndEdit';
  autosave: boolean;
  dirtyWarning: boolean;
}
```

### Form Features
- **Real-time Validation**: Immediate feedback
- **Auto-save**: Prevent data loss
- **Dirty State Warning**: Unsaved changes alert
- **Field Dependencies**: Conditional field visibility
- **Rich Text Editing**: WYSIWYG content editor
- **File Upload**: Drag-and-drop with progress

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
          "admin": ["./src/admin"]
        }
      }
    }
  }
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
VITE_ENABLE_ADVANCED_ANALYTICS=true
VITE_ENABLE_BULK_OPERATIONS=true
VITE_ENABLE_AUDIT_LOGS=true
```

### Performance Monitoring
- **Bundle Size Analysis**: Webpack Bundle Analyzer
- **Runtime Performance**: React DevTools Profiler  
- **API Response Times**: Network monitoring
- **Error Tracking**: Automated error reporting
- **User Experience Metrics**: Core Web Vitals tracking

## Future Enhancements

### Planned Features
- **Advanced Permissions**: Fine-grained access control
- **Workflow Engine**: Approval workflows for content
- **API Management**: Admin API for third-party integrations
- **Advanced Analytics**: Machine learning insights
- **Mobile App**: Native mobile administration
- **Collaborative Editing**: Real-time content collaboration

### Technical Roadmap
- **Performance Optimization**: Code splitting improvements
- **Enhanced Security**: Additional security measures
- **Better UX**: User experience enhancements
- **Integration Expansion**: Additional third-party services
- **Scalability**: Architecture improvements for growth