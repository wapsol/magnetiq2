# Magnetiq v2 - System Settings Admin Specification

## Overview

The System Settings Admin interface provides comprehensive configuration management for the voltAIc platform, accessible via the gear icon dropdown in the admin panel header. This includes contact information management, general system settings, backup and recovery, security configuration, and other system-wide settings that appear across the public website and admin interface.

→ **Core Admin Architecture**: [Main Admin Panel](./admin.md#header-based-settings-access)
← **Used by**: [Site Admin](../../users/site-admin.md), [Content Editor](../../users/content-editor.md)
⚡ **Dependencies**: [Backend Settings API](../../backend/api.md#settings-endpoints), [Database Settings Schema](../../backend/database.md#settings-tables)

### Access Method
- **Location**: Header gear icon dropdown → System Configuration
- **Route**: `/admin/settings/system` (accessed via header dropdown, not sidebar navigation)
- **Permission Level**: Admin and Super Admin roles only
- **Navigation Pattern**: Header-based access for quick system configuration without disrupting main workflow

## Visual System Settings Overview
![System Settings Architecture](../../../diagrams/spec_v2/features/system_settings_architecture.png)
*Complete system configuration and contact management workflow*

## Tab Navigation Structure

### Main System Settings Interface (`/admin/settings/system`)

**Access Path**: Header Gear Icon → System Configuration

```
├── Contact Information (/admin/settings/system/contact)
├── General Configuration (/admin/settings/system/general)  
├── Site Configuration (/admin/settings/system/site)
├── Email Configuration (/admin/settings/system/email)
├── Security Settings (/admin/settings/system/security)
├── Backup & Recovery (/admin/settings/system/backup)
└── System Maintenance (/admin/settings/system/maintenance)
```

### Navigation Integration
- **Header Access**: Gear icon dropdown → System Configuration
- **Breadcrumb Path**: Admin > Settings > System Configuration > [Specific Tab]
- **Quick Access**: Available from any admin panel section without navigation disruption
- **Context Preservation**: Returns to previous admin section after settings configuration

## 1. Contact Information Management Tab (`/admin/settings/system/contact`)

### Contact Details Configuration

This is the primary interface for managing all contact information that appears throughout the voltAIc website and communications.

→ **API Integration**: [Settings Contact API](../../backend/api.md#contact-settings-endpoints)
← **Used by**: [Public Contact Pages](../public/contact-overview.md), [Email Templates](../../integrations/smtp-brevo.md)

#### Contact Information Interface
```tsx
interface ContactInformationSettings {
  supportContacts: {
    generalSupport: {
      email: string; // support@voltaicsystems.com
      displayName: string; // "Support Team"
      description: string; // "General platform support and technical assistance"
      autoResponse: boolean;
      businessHours: BusinessHours;
      responseTimeExpectation: string; // "Within 24 hours"
    };
    
    technicalSupport: {
      email: string; // tech@voltaicsystems.com
      displayName: string; // "Technical Support"
      description: string; // "Technical issues and integration support"
      autoResponse: boolean;
      escalationRules: EscalationRule[];
      priority: 'high' | 'medium' | 'low';
    };
    
    consultingInquiries: {
      email: string; // consulting@voltaicsystems.com
      displayName: string; // "Consulting Team"
      description: string; // "New consulting projects and partnerships"
      routingRules: ConsultantRoutingRule[];
      qualificationCriteria: LeadQualificationCriteria;
    };
    
    partnershipInquiries: {
      email: string; // partnerships@voltaicsystems.com
      displayName: string; // "Partnership Team"
      description: string; // "Strategic partnerships and collaborations"
      approvalWorkflow: PartnershipApprovalWorkflow;
    };
  };
  
  businessContacts: {
    salesInquiries: {
      email: string; // sales@voltaicsystems.com
      displayName: string; // "Sales Team"
      leadScoring: LeadScoringConfig;
      crmIntegration: CRMIntegrationConfig;
      followUpRules: FollowUpRule[];
    };
    
    mediaInquiries: {
      email: string; // media@voltaicsystems.com
      displayName: string; // "Media Relations"
      pressKitAccess: boolean;
      approvalRequired: boolean;
    };
    
    legalInquiries: {
      email: string; // legal@voltaicsystems.com
      displayName: string; // "Legal Team"
      confidentialityRules: ConfidentialityRule[];
      documentRequirements: string[];
    };
  };
  
  physicalLocations: {
    headquarters: {
      name: string; // "voltAIc Systems Headquarters"
      address: PhysicalAddress;
      phoneNumbers: PhoneNumber[];
      businessHours: BusinessHours;
      timezone: string;
      mapCoordinates: Coordinates;
      publiclyVisible: boolean;
    };
    
    regionalOffices: RegionalOffice[];
    virtualOffices: VirtualOffice[];
  };
  
  emergencyContacts: {
    systemOutages: {
      email: string; // emergency@voltaicsystems.com
      phone: string;
      escalationChain: EscalationChain;
      notificationChannels: NotificationChannel[];
    };
    
    securityIncidents: {
      email: string; // security@voltaicsystems.com
      phone: string;
      encryptionRequired: boolean;
      reportingProtocol: SecurityReportingProtocol;
    };
  };
}
```

#### Contact Management Features
- **Dynamic Contact Routing**: Smart routing based on inquiry type and content
- **Auto-Response Configuration**: Customizable automated responses per contact type
- **Business Hours Management**: Configurable hours with timezone support
- **Escalation Rules**: Automated escalation for high-priority contacts
- **Integration with CRM**: Seamless lead capture and management
- **Multi-language Support**: Localized contact information for German/English
- **Performance Analytics**: Contact form conversion and response time tracking

### Contact Display Templates

#### Public Website Integration
```tsx
interface ContactDisplaySettings {
  websiteFooter: {
    displaySupportEmail: boolean;
    displayPhone: boolean;
    displayAddress: boolean;
    contactFormLink: boolean;
  };
  
  contactPages: {
    supportPageLayout: ContactPageLayout;
    consultingPageLayout: ContactPageLayout;
    generalInquiryLayout: ContactPageLayout;
    emergencyContactInfo: EmergencyContactDisplay;
  };
  
  emailSignatures: {
    defaultSignature: EmailSignatureTemplate;
    departmentSignatures: Record<string, EmailSignatureTemplate>;
    legalDisclaimer: string;
    socialMediaLinks: SocialMediaLink[];
  };
  
  chatbotIntegration: {
    supportEmailHandoff: boolean;
    consultingFormRedirect: boolean;
    emergencyEscalation: boolean;
  };
}
```

#### Dynamic Contact Information Usage
- **Form Pre-population**: Auto-populate contact forms with appropriate emails
- **Email Template Variables**: Dynamic email address insertion in templates
- **Support Documentation**: Automatic contact info updates in help articles
- **Emergency Notifications**: System-wide emergency contact distribution
- **Regional Customization**: Location-based contact information display

## 2. General Configuration Tab (`/admin/settings/general`)

### System-Wide Configuration Management

→ **API Integration**: [General Settings API](../../backend/api.md#general-settings-endpoints)
← **Affects**: All system components and public interfaces

#### General Configuration Interface
```tsx
interface GeneralConfigurationSettings {
  platformSettings: {
    siteName: string; // "voltAIc Systems"
    siteTagline: string; // "AI-Powered Digital Transformation"
    defaultLanguage: 'en' | 'de';
    supportedLanguages: Language[];
    timezone: string; // "Europe/Berlin"
    dateFormat: DateFormat;
    numberFormat: NumberFormat;
    currencySettings: CurrencySettings;
  };
  
  brandingSettings: {
    logoConfiguration: LogoConfiguration;
    colorScheme: ColorSchemeSettings;
    fontSettings: FontSettings;
    brandGuidelines: BrandGuidelineSettings;
  };
  
  contentSettings: {
    defaultContentFormat: 'legacy' | 'blocks' | 'portable_text';
    autoSaveInterval: number; // milliseconds
    versionRetention: number; // number of versions to keep
    mediaUploadLimits: MediaUploadLimitSettings;
    contentApprovalWorkflow: boolean;
  };
  
  userExperienceSettings: {
    sessionTimeout: number; // minutes
    maxConcurrentSessions: number;
    passwordPolicy: PasswordPolicySettings;
    twoFactorAuthentication: TwoFactorSettings;
    accessibilityFeatures: AccessibilitySettings;
  };
}
```

## 3. Site Configuration Tab (`/admin/settings/site`)

### Public Website Configuration

#### SEO and Meta Configuration
```tsx
interface SiteConfigurationSettings {
  seoSettings: {
    globalSEODefaults: {
      metaTitle: string;
      metaDescription: string;
      metaKeywords: string[];
      ogImage: string;
      twitterCard: TwitterCardSettings;
      structuredDataDefaults: StructuredDataSettings;
    };
    
    robotsSettings: {
      robotsTxtContent: string;
      sitemapGeneration: boolean;
      crawlDelay: number;
      disallowedPaths: string[];
    };
    
    analyticsIntegration: {
      googleAnalyticsId?: string;
      googleTagManagerId?: string;
      facebookPixelId?: string;
      linkedInInsightTag?: string;
      customTrackingScripts: TrackingScript[];
    };
  };
  
  performanceSettings: {
    cachingStrategy: CachingStrategySettings;
    cdnConfiguration: CDNSettings;
    imageOptimization: ImageOptimizationSettings;
    compressionSettings: CompressionSettings;
  };
  
  securityHeaders: {
    contentSecurityPolicy: CSPSettings;
    httpHeaders: SecurityHeaderSettings;
    corsSettings: CORSSettings;
    rateLimitingRules: RateLimitingRule[];
  };
}
```

## 4. Email Configuration Tab (`/admin/settings/email`)

### SMTP and Email Service Configuration

→ **Integration**: [SMTP Brevo Integration](../../integrations/smtp-brevo.md)
← **Used by**: All email communications system-wide

#### Email Configuration Interface
```tsx
interface EmailConfigurationSettings {
  smtpSettings: {
    provider: 'brevo' | 'sendgrid' | 'mailgun' | 'custom';
    serverSettings: SMTPServerSettings;
    authenticationSettings: SMTPAuthSettings;
    connectionSecurity: 'tls' | 'ssl' | 'none';
    rateLimiting: EmailRateLimitSettings;
  };
  
  emailTemplateSettings: {
    defaultFromAddress: string; // info@voltaicsystems.com
    defaultFromName: string; // "voltAIc Systems"
    replyToAddress: string; // noreply@voltaicsystems.com
    
    templateCategories: {
      transactional: TransactionalEmailSettings;
      marketing: MarketingEmailSettings;
      notifications: NotificationEmailSettings;
      support: SupportEmailSettings;
    };
    
    brandingElements: {
      emailHeader: EmailHeaderTemplate;
      emailFooter: EmailFooterTemplate;
      logoSettings: EmailLogoSettings;
      colorScheme: EmailColorScheme;
    };
  };
  
  deliverySettings: {
    bounceHandling: BounceHandlingSettings;
    unsubscribeManagement: UnsubscribeSettings;
    complaintHandling: ComplaintHandlingSettings;
    deliveryOptimization: DeliveryOptimizationSettings;
  };
  
  analyticsAndTracking: {
    openTracking: boolean;
    clickTracking: boolean;
    deliveryTracking: boolean;
    customEventTracking: CustomEventTrackingSettings;
    reportingDashboard: EmailReportingSettings;
  };
}
```

## 5. Security Settings Tab (`/admin/settings/security`)

### Comprehensive Security Configuration

→ **Security Documentation**: [Security Specification](../../security.md)
← **Protects**: All system components and user data

#### Security Settings Interface
```tsx
interface SecuritySettings {
  authenticationSecurity: {
    passwordPolicy: PasswordPolicySettings;
    accountLockoutPolicy: AccountLockoutSettings;
    sessionManagement: SessionSecuritySettings;
    twoFactorAuthentication: TwoFactorAuthSettings;
    singleSignOn: SSOIntegrationSettings;
  };
  
  dataProtection: {
    encryptionSettings: EncryptionSettings;
    dataRetentionPolicies: DataRetentionPolicy[];
    privacyControls: PrivacyControlSettings;
    gdprCompliance: GDPRComplianceSettings;
    dataBackupEncryption: BackupEncryptionSettings;
  };
  
  systemSecurity: {
    firewallRules: FirewallRule[];
    rateLimitingRules: RateLimitingRule[];
    intrusionDetection: IntrusionDetectionSettings;
    securityLogging: SecurityLoggingSettings;
    vulnerabilityScanning: VulnerabilitySettings;
  };
  
  accessControl: {
    roleBasedPermissions: RolePermissionSettings;
    apiAccessControl: APIAccessSettings;
    adminAccessRestrictions: AdminAccessSettings;
    auditTrailSettings: AuditTrailSettings;
  };
}
```

## 6. Backup & Recovery Tab (`/admin/settings/backup`)

### Data Backup and System Recovery

#### Backup Configuration Interface
```tsx
interface BackupRecoverySettings {
  backupScheduling: {
    databaseBackups: {
      frequency: BackupFrequency;
      retentionPeriod: number; // days
      compressionLevel: CompressionLevel;
      encryptionEnabled: boolean;
      offSiteStorage: OffSiteStorageSettings;
    };
    
    fileBackups: {
      includedDirectories: string[];
      excludedPatterns: string[];
      incrementalBackups: boolean;
      backupSchedule: BackupSchedule;
      storageLocation: BackupStorageSettings;
    };
    
    configurationBackups: {
      systemSettings: boolean;
      integrationConfigs: boolean;
      userPermissions: boolean;
      customizations: boolean;
      scheduledExports: ScheduledExportSettings;
    };
  };
  
  recoverySettings: {
    disasterRecoveryPlan: DisasterRecoveryPlan;
    recoveryPointObjective: number; // minutes
    recoveryTimeObjective: number; // minutes
    failoverSettings: FailoverSettings;
    testingSchedule: RecoveryTestingSchedule;
  };
  
  monitoringAndAlerts: {
    backupHealthMonitoring: boolean;
    failureNotifications: NotificationSettings;
    storageSpaceAlerts: StorageAlertSettings;
    recoveryTestAlerts: TestAlertSettings;
  };
}
```

## 7. System Maintenance Tab (`/admin/settings/maintenance`)

### System Health and Maintenance

#### Maintenance Configuration Interface
```tsx
interface SystemMaintenanceSettings {
  maintenanceScheduling: {
    plannedMaintenance: {
      scheduledWindows: MaintenanceWindow[];
      notificationSettings: MaintenanceNotificationSettings;
      maintenancePageSettings: MaintenancePageSettings;
      rollbackProcedures: RollbackProcedure[];
    };
    
    automaticMaintenance: {
      logRotation: LogRotationSettings;
      cacheCleanup: CacheCleanupSettings;
      databaseOptimization: DatabaseOptimizationSettings;
      temporaryFileCleanup: TempFileCleanupSettings;
    };
  };
  
  systemMonitoring: {
    performanceMetrics: PerformanceMonitoringSettings;
    healthChecks: HealthCheckSettings;
    alertingRules: SystemAlertRule[];
    reportingSchedule: SystemReportingSchedule;
  };
  
  updateManagement: {
    systemUpdates: SystemUpdateSettings;
    securityPatches: SecurityPatchSettings;
    dependencyUpdates: DependencyUpdateSettings;
    testingProcedures: UpdateTestingSettings;
  };
}
```

## Integration Points

### Backend Settings API Integration
```tsx
interface SettingsAPIIntegration {
  settingsOperations: {
    get: GetSettingsEndpoint;
    update: UpdateSettingsEndpoint;
    reset: ResetSettingsEndpoint;
    export: ExportSettingsEndpoint;
    import: ImportSettingsEndpoint;
  };
  
  contactOperations: {
    validateEmails: ValidateEmailEndpoint;
    testMailDelivery: TestMailDeliveryEndpoint;
    updateContactForms: UpdateContactFormsEndpoint;
    syncWithCRM: SyncContactsCRMEndpoint;
  };
  
  configurationOperations: {
    validateConfigurations: ValidateConfigEndpoint;
    applySettings: ApplySettingsEndpoint;
    rollbackChanges: RollbackSettingsEndpoint;
    scheduledUpdates: ScheduledUpdateEndpoint;
  };
}
```

### Database Integration
The system settings integrate with multiple database entities:

- **Settings Tables**: Core system configuration, contact information, security settings
- **Contact Tables**: Email routing rules, escalation chains, response templates
- **Backup Tables**: Backup schedules, recovery points, maintenance logs
- **Security Tables**: Authentication policies, access logs, security events

### External Service Integration
Deep integration with external services enables:

- **Email Service Integration**: SMTP configuration and template management
- **CRM Integration**: Contact synchronization and lead routing
- **Backup Services**: Cloud backup and disaster recovery
- **Monitoring Services**: System health monitoring and alerting

## Usage Throughout the System

### Contact Information Usage
The contact information managed in Settings appears throughout the platform:

**Public Website Locations**:
- Footer contact information
- Contact form default recipients
- Support page contact details
- Emergency contact information
- Email template signatures

**Admin System Locations**:
- Error notification recipients
- System alert destinations
- Support ticket routing
- Escalation contact chains

**Email Communications**:
- Automated response addresses
- Support inquiry routing
- Partnership inquiry handling
- Emergency notification distribution

## Cross-References Summary

**Core Dependencies:**
← **Admin Panel Architecture**: [Main Admin Specification](./admin.md#system-settings)
→ **Backend Integration**: [Settings Management API](../../backend/api.md#settings-endpoints)
→ **Database Schema**: [Settings Database Tables](../../backend/database.md#settings-schema)
⚡ **Security**: [System Security Policies](../../security.md#settings-security)

**Feature Integrations:**
↔️ **Contact Management**: [Public Contact Pages](../public/contact-overview.md)
↔️ **Email Services**: [SMTP Integration](../../integrations/smtp-brevo.md)
↔️ **CRM Integration**: [Odoo CRM](../../integrations/odoo-crm.md#contact-sync)
↔️ **Analytics Dashboard**: [System Monitoring](./analytics-dashboard.md#system-health)

**User Experience:**
← **User Personas**: [Site Admin Persona](../../users/site-admin.md)
→ **Public Integration**: [Contact Form Integration](../public/contact-overview.md#contact-forms)
⚡ **Security**: [Data Protection](../../privacy-compliance.md#contact-data-protection)

**External Integrations:**
→ **Email Services**: [SMTP Configuration](../../integrations/smtp-brevo.md#configuration)
→ **Backup Services**: [Cloud Backup Integration](../../integrations/backup-services.md)
→ **Monitoring Services**: [System Monitoring](../../integrations/monitoring.md)
→ **CRM Services**: [Contact Synchronization](../../integrations/odoo-crm.md)

## Visual Documentation
![System Settings Architecture](../../../diagrams/spec_v2/features/system_settings_architecture.png)
*Complete system settings architecture showing all configuration categories and integrations*

🔗 **Related Diagrams**: 
- [Contact Management Flow](../../../diagrams/spec_v2/features/contact_management_flow.png)
- [Settings Database Schema](../../../diagrams/spec_v2/database/settings_schema.png)
- [Email Configuration Flow](../../../diagrams/spec_v2/integrations/email_config_flow.png)
- [Security Settings Integration](../../../diagrams/spec_v2/security/security_settings.png)
- [Backup and Recovery Process](../../../diagrams/spec_v2/maintenance/backup_recovery.png)