# Consultant Persona

Professional expert who monetizes their knowledge and expertise through the Magnetiq platform by offering 30-for-30 consultation services, creating thought leadership content, and building their professional brand.

→ **Business Model Integration**: [30-for-30 Consultation Service](../frontend/public/features/book-a-meeting.md#pricing-model)
← **Supported by**: [Payment Processing](../integrations/payment-processing.md#consultant-onboarding), [Content Creation](../frontend/public/features/whitepapers.md#consultant-authorship)
⚡ **Core Dependencies**: [Booking System](../frontend/public/features/book-a-meeting.md), [LinkedIn Integration](../integrations/linkedin.md), [Revenue Tracking](../backend/analytics.md#consultant-metrics)

## Visual Overview
![Consultant Journey](../../diagrams/spec_v2/personas/consultant_journey.png)
*Complete consultant journey from discovery and onboarding through service delivery and revenue generation*

🔗 **Cross-referenced in**: [Booking System](../frontend/public/features/book-a-meeting.md), [Webinar Platform](../frontend/public/features/webinars.md), [Content Creation](../frontend/public/features/whitepapers.md), [Admin Management](../frontend/adminpanel/admin.md)

## Overview

The Consultant persona represents experienced professionals who leverage the Magnetiq platform to monetize their expertise through structured consultation services and thought leadership content. These experts provide high-value, time-efficient consultations through the signature 30-for-30 service model while building their professional brand and expanding their client network.

→ **Service Framework**: [Consultation Booking System](../frontend/public/features/book-a-meeting.md#consultant-management)
← **Revenue Model**: [Payment Processing Integration](../integrations/payment-processing.md#revenue-distribution)
🔗 **Professional Networking**: [LinkedIn Profile Sync](../integrations/linkedin.md#consultant-integration)
↔️ **Content Strategy**: [Whitepaper Authorship](../frontend/public/features/whitepapers.md#consultant-authorship), [Webinar Leadership](../frontend/public/features/webinars.md#consultant-integration)

## Demographics & Background

### Professional Profile
- **Role/Title**: Senior consultants, industry experts, thought leaders, C-level executives → See [Permission Matrix](../security.md#consultant-permissions)
- **Industry Experience**: 10+ years in specialized domains (AI/ML, Digital Transformation, Strategy) ← Referenced in [Expertise Matching](../backend/api.md#consultant-matching)
- **Educational Background**: Advanced degrees, professional certifications, industry recognition ⚡ Verified through [KYC Process](../integrations/payment-processing.md#kyc-compliance)
- **Geographic Distribution**: Global consultants with focus on European and North American markets → Affects [Multi-Currency Support](../integrations/payment-processing.md#multi-currency-support)
- **Language Proficiency**: Native or business-level English/German ↔ Related to [Multilingual Content](../frontend/multilingual.md#consultant-localization)

### Business Characteristics
- **Consultation Rate**: €25.50 per 30-minute session (after 15% platform fee) → [Revenue Model](../integrations/payment-processing.md#revenue-distribution)
- **Availability**: Flexible scheduling with 2-4 consultation slots per week ⚡ Managed via [Booking System](../frontend/public/features/book-a-meeting.md#availability-management)
- **Specialization Depth**: Deep expertise in 2-3 core areas with broad business acumen
- **Client Network**: Existing professional network of 500+ LinkedIn connections 🔗 Leveraged through [LinkedIn Integration](../integrations/linkedin.md#network-expansion)
- **Content Creation**: Active in thought leadership through articles, whitepapers, and speaking engagements

### Technical Proficiency
- **Platform Usage**: High comfort with web-based consultation platforms and scheduling tools
- **Digital Communication**: Experienced with video calls, screen sharing, and digital collaboration
- **Content Management**: Capable of creating and managing digital content (documents, presentations)
- **Social Media**: Active LinkedIn presence with regular professional content sharing
- **Payment Systems**: Understanding of digital payment processing and international banking

## Goals & Motivations

### Primary Goals
- **Revenue Generation**: Monetize expertise through structured, time-efficient consultations
  - 🔗 Supported by: [Payment Processing System](../integrations/payment-processing.md), [Booking Management](../frontend/public/features/book-a-meeting.md)
- **Professional Brand Building**: Establish thought leadership and industry recognition
  - ↔️ Related workflows: [Content Creation](../frontend/public/features/whitepapers.md#author-branding), [Webinar Speaking](../frontend/public/features/webinars.md#speaker-profiles)
- **Network Expansion**: Connect with new clients and expand professional network
  - 🔗 Enabled by: [LinkedIn Integration](../integrations/linkedin.md#professional-networking), [Client Referral System](../backend/api.md#referral-tracking)

### Secondary Goals
- **Knowledge Sharing**: Contribute to industry knowledge through structured content creation
  - → Supported by: [Whitepaper Platform](../frontend/public/features/whitepapers.md#collaborative-authorship), [Webinar System](../frontend/public/features/webinars.md#expert-content)
- **Market Research**: Stay current with industry trends through client interactions
- **Passive Income**: Generate ongoing revenue through evergreen content and recorded sessions
- **Global Reach**: Expand consulting practice beyond local market boundaries

### Success Metrics
- **Monthly Revenue Target**: €500-2000 per month through consultations and content
  - 📋 Tracked in: [Consultant Analytics](../backend/analytics.md#consultant-performance)
- **Client Satisfaction**: 4.5+ star average rating from consultation sessions
- **Content Performance**: High engagement rates on authored whitepapers and webinar sessions
- **Network Growth**: 20-50 new professional connections per month via platform

## Pain Points & Challenges

### Current Business Challenges
- **Client Acquisition**: Difficulty finding qualified prospects willing to pay premium rates
  - → Addressed by: [Lead Generation System](../frontend/public/features/whitepapers.md#lead-generation), [SEO-Optimized Profiles](../frontend/public.md#consultant-seo)
- **Time Management**: Balancing consultation work with business development activities
  - ⚡ Mitigated by: [Automated Scheduling](../frontend/public/features/book-a-meeting.md#automated-booking), [Efficient 30-minute Sessions](../frontend/public/features/book-a-meeting.md#time-optimization)
- **Payment Processing**: Complex international payment handling and tax compliance
  - → Resolved by: [Stripe Connect Integration](../integrations/payment-processing.md#stripe-connect), [Multi-Currency Support](../integrations/payment-processing.md#multi-currency-support)

### Professional Frustrations
- **Inconsistent Revenue**: Unpredictable income from traditional consulting models
  - 🔗 Stabilized by: [Recurring Client System](../backend/api.md#client-retention), [Content Monetization](../frontend/public/features/whitepapers.md#revenue-attribution)
- **Administrative Burden**: Time consumed by scheduling, invoicing, and payment follow-up
  - ↔️ Automated via: [End-to-End Booking System](../frontend/public/features/book-a-meeting.md#automation), [Payment Automation](../integrations/payment-processing.md#automated-processing)
- **Market Visibility**: Difficulty standing out in crowded consulting marketplace
  - → Enhanced by: [Content Marketing](../frontend/public/features/whitepapers.md#consultant-promotion), [Social Media Integration](../integrations/linkedin.md#content-amplification)

### Technical Barriers
- **Platform Learning Curve**: Adapting to new consultation and content management systems
  - 🔗 Addressed by: [Consultant Onboarding](../frontend/adminpanel/admin.md#consultant-onboarding), [Support Resources](../frontend/public.md#help-documentation)
- **KYC Compliance**: Understanding and completing identity verification requirements
  - ⚡ Streamlined via: [KYC Automation](../integrations/payment-processing.md#kyc-compliance), [Document Upload System](../integrations/payment-processing.md#document-verification)

## User Journey & Interactions

### Discovery & Recruitment Process
**Entry Points**: How consultants discover and join the platform
- **LinkedIn Outreach**: Direct recruitment of high-profile consultants
  - → Managed by: [Recruitment Campaigns](../integrations/linkedin.md#consultant-recruitment)
  - ⚡ Authenticated via: [Social Login System](../security.md#social-authentication)
- **Referral Program**: Existing consultants recommend qualified peers
  - 📋 Tracked in: [Referral Analytics](../backend/analytics.md#referral-tracking)
- **Organic Discovery**: SEO-driven discovery through content marketing
  - ↔️ Supported by: [SEO Optimization](../frontend/public/sitemap.md#consultant-pages)

### Onboarding Workflow with LinkedIn Scraping and Profile Setup

![Consultant Onboarding Flow](../../diagrams/spec_v2/personas/consultant_onboarding_flow.png)

**Phase 1: Initial Registration & LinkedIn Integration**
1. **Account Creation**: Email-based registration with consultant role assignment
   - → Account Management: [User Registration](../security.md#user-registration)
   - 🔗 Role Assignment: [RBAC Implementation](../security.md#role-based-access)

2. **LinkedIn Profile Synchronization**: Automated data import and verification
   - → Integration: [LinkedIn API Integration](../integrations/linkedin.md#profile-sync)
   - ⚡ Data Processing: [Profile Data Extraction](../integrations/linkedin.md#data-scraping)
   ```typescript
   interface LinkedInProfileSync {
     personalInfo: {
       firstName: string;
       lastName: string;
       headline: string;
       location: string;
       profilePhoto: string;
     };
     experience: {
       currentPosition: string;
       company: string;
       industry: string;
       experienceYears: number;
     };
     credentials: {
       education: Education[];
       certifications: Certification[];
       skills: string[];
       endorsements: number;
     };
     networkMetrics: {
       connections: number;
       followers: number;
       activity: ActivityMetrics;
     };
   }
   ```

3. **AI-Assisted Profile Enhancement**: Automated profile optimization
   - 🔗 AI Processing: [Content Generation](../backend/api.md#ai-content-generation)
   - → Profile Building: [Consultant Profiles](../frontend/public.md#consultant-profiles)

**Phase 2: Payment Setup with KYC Compliance and Bank Account Verification**

![KYC Compliance Flow](../../diagrams/spec_v2/personas/consultant_kyc_flow.png)

1. **Identity Verification**: Comprehensive KYC compliance process
   - → KYC System: [Identity Verification](../integrations/payment-processing.md#kyc-compliance)
   - 🔗 Document Upload: [Secure Document Storage](../security.md#document-encryption)
   ```typescript
   interface KYCProcess {
     personalVerification: {
       identityDocument: 'passport' | 'national_id' | 'drivers_license';
       addressProof: 'bank_statement' | 'utility_bill' | 'tax_document';
       taxInformation: 'tax_id' | 'vat_number' | 'ssn';
     };
     businessVerification: {
       businessRegistration?: string;
       professionalLicense?: string;
       insuranceCertificate?: string;
     };
     verificationStatus: {
       documentsSubmitted: boolean;
       reviewInProgress: boolean;
       approved: boolean;
       rejectionReasons?: string[];
     };
   }
   ```

2. **Stripe Connect Account Creation**: Payment processing setup
   - → Payment Integration: [Stripe Connect Setup](../integrations/payment-processing.md#consultant-account-creation)
   - ⚡ Account Configuration: [Express Account Onboarding](../integrations/payment-processing.md#account-onboarding)

3. **Bank Account Verification**: Secure payout configuration
   - 🔗 Bank Integration: [Bank Account Setup](../integrations/payment-processing.md#bank-account-setup)
   - ← Security Compliance: [Financial Data Protection](../security.md#financial-data-security)

### Content Creation and Publishing Workflows

**Content Strategy Development**:
- **Expertise Mapping**: Identifying optimal content topics based on consultant specialization
  - → Content Planning: [Editorial Calendar](../frontend/adminpanel/admin.md#content-calendar)
  - ↔️ SEO Integration: [Keyword Strategy](../frontend/public/sitemap.md#seo-optimization)

- **Multi-Format Content Creation**: Whitepapers, webinars, case studies
  - 🔗 Whitepaper Creation: [Collaborative Authorship](../frontend/public/features/whitepapers.md#multi-author-support)
  - → Webinar Production: [Session Management](../frontend/public/features/webinars.md#session-creation)

**Content Publishing Pipeline**:
```typescript
interface ContentPublishingWorkflow {
  contentTypes: {
    whitepapers: {
      authorRole: 'primary' | 'co-author' | 'contributor';
      revenueShare: number; // percentage
      crossSellIntegration: boolean;
    };
    webinars: {
      sessionType: 'single-expert' | 'panel-discussion' | 'workshop';
      audienceTargeting: AudienceSegment[];
      followUpOpportunities: ConsultationType[];
    };
    caseStudies: {
      clientConsent: boolean;
      anonymization: AnonymizationLevel;
      successMetrics: PerformanceMetric[];
    };
  };
  publishingSteps: {
    contentReview: ReviewProcess;
    seoOptimization: SEOConfiguration;
    socialMediaPromotion: SocialPromotionPlan;
    crossPlatformDistribution: DistributionChannel[];
  };
}
```

### Consultation Booking Management and Client Interaction

**Availability Management System**:
- **Calendar Integration**: Seamless scheduling with personal and business calendars
  - → Calendar Sync: [Calendar Integration](../integrations/calendar.md#consultant-calendars)
  - 🔗 Availability Engine: [Real-time Availability](../backend/api.md#availability-api)

- **Booking Configuration**: Flexible scheduling parameters and constraints
  ```typescript
  interface ConsultantAvailability {
    workingHours: {
      timezone: string;
      weeklySchedule: WeeklyAvailability;
      exceptions: ScheduleException[];
    };
    sessionPreferences: {
      minimumBookingLead: number; // hours
      maximumAdvanceBooking: number; // days
      bufferBetweenSessions: number; // minutes
      consultationTypes: ConsultationType[];
    };
    pricingConfiguration: {
      baseRate: number;
      currency: string;
      discountOffers: DiscountOffer[];
      packageDeals: ConsultationPackage[];
    };
  }
  ```

**Client Interaction Workflow**:

![Client Consultation Flow](../../diagrams/spec_v2/personas/consultant_client_interaction.png)

1. **Pre-Consultation Preparation**: Client briefing and session planning
   - → Client Communication: [Pre-session Briefing](../integrations/smtp-brevo.md#consultation-preparation)
   - 🔗 Session Planning: [Consultation Preparation](../backend/api.md#session-preparation)

2. **Consultation Delivery**: 30-minute structured consultation sessions
   - ⚡ Video Platform: [Meeting Integration](../integrations/meeting-platforms.md#consultation-sessions)
   - → Session Management: [Live Session Monitoring](../backend/api.md#session-monitoring)

3. **Post-Consultation Follow-up**: Session summary and additional resource sharing
   - 📋 Follow-up Automation: [Post-session Workflows](../integrations/smtp-brevo.md#follow-up-sequences)
   - ↔️ Upselling Integration: [Additional Services](../frontend/public/features/book-a-meeting.md#service-upselling)

### Performance Analytics and Earnings Tracking

**Consultant Performance Dashboard**:
- **Revenue Analytics**: Comprehensive financial performance tracking
  - → Financial Dashboard: [Earnings Analytics](../backend/analytics.md#consultant-earnings)
  - 🔗 Payment Tracking: [Transaction History](../integrations/payment-processing.md#payment-analytics)

- **Client Satisfaction Metrics**: Feedback collection and reputation management
  - ⚡ Rating System: [Consultant Reviews](../backend/api.md#consultant-ratings)
  - → Reputation Management: [Profile Quality Score](../backend/analytics.md#reputation-metrics)

- **Content Performance**: Tracking engagement and lead generation from authored content
  - 📋 Content Analytics: [Authorship Attribution](../frontend/public/features/whitepapers.md#consultant-analytics)
  - ↔️ Cross-selling Metrics: [Content-to-Consultation Conversion](../backend/analytics.md#conversion-tracking)

## Access Control & Permissions

### Consultant Dashboard Access Levels
→ **Security Model**: [RBAC Implementation](../security.md#consultant-role-definitions)
⚡ **Permission Management**: [Dynamic Permission System](../security.md#dynamic-permissions)

**Core Permissions**:
- **Profile Management**: Full control over consultant profile, availability, and pricing
  - → Implementation: [Profile API Endpoints](../backend/api.md#consultant-profile-management)
  - 🔗 UI Components: [Consultant Dashboard](../frontend/adminpanel/admin.md#consultant-self-management)

- **Content Creation**: Author whitepapers, create webinars, manage case studies
  - ↔️ Collaborative Features: [Multi-author Content](../frontend/public/features/whitepapers.md#collaboration-workflow)
  - → Content Management: [Editorial Tools](../frontend/adminpanel/admin.md#content-creation-tools)

- **Consultation Management**: Manage bookings, client interactions, and session delivery
  - 📋 Booking Interface: [Consultant Booking Tools](../frontend/public/features/book-a-meeting.md#consultant-interface)
  - ⚡ Session Controls: [Live Session Management](../backend/api.md#session-control-api)

### Content Management Permissions
**Content Authorship Rights**:
```typescript
interface ContentPermissions {
  whitepaperManagement: {
    createDrafts: boolean;
    inviteCoAuthors: boolean;
    publishContent: boolean;
    editPublished: boolean;
    manageRevenue: boolean;
  };
  webinarManagement: {
    createSessions: boolean;
    manageRegistrations: boolean;
    accessRecordings: boolean;
    viewAnalytics: boolean;
  };
  caseStudyManagement: {
    createCaseStudies: boolean;
    anonymizeClientData: boolean;
    shareSuccessStories: boolean;
  };
}
```

### Client Interaction Capabilities
**Communication Permissions**:
- **Direct Client Communication**: Email and message access for consultation clients
  - 🔗 Communication System: [Client Messaging](../backend/api.md#consultant-messaging)
  - → Privacy Controls: [Data Access Permissions](../privacy-compliance.md#consultant-data-access)

- **Client Data Access**: Limited access to client information relevant to consultations
  - ⚡ Data Minimization: [Client Privacy Protection](../privacy-compliance.md#data-minimization)
  - ← Audit Trail: [Data Access Logging](../security.md#data-access-audit)

### Financial Data Access and Payout Management
**Revenue Management Rights**:
- **Earnings Dashboard**: Full access to personal revenue analytics and payment history
  - → Financial Interface: [Consultant Finance Dashboard](../backend/analytics.md#consultant-financial-dashboard)
  - 📋 Payment History: [Transaction Records](../integrations/payment-processing.md#consultant-payment-history)

- **Payout Configuration**: Manage bank accounts, payout schedules, and tax information
  - 🔗 Payment Settings: [Payout Management](../integrations/payment-processing.md#payout-configuration)
  - ⚡ Security Requirements: [Financial Data Security](../security.md#financial-data-protection)

### Performance Analytics Visibility
**Analytics Access Scope**:
```typescript
interface AnalyticsPermissions {
  personalMetrics: {
    consultationMetrics: ConsultationPerformance;
    contentPerformance: ContentAnalytics;
    revenueAnalytics: RevenueMetrics;
    clientSatisfaction: SatisfactionMetrics;
  };
  platformBenchmarks: {
    industryComparisons: BenchmarkData;
    performanceRankings: RankingData;
    marketTrends: TrendAnalysis;
  };
  restrictedData: {
    otherConsultantData: false;
    platformRevenue: false;
    adminAnalytics: false;
  };
}
```

## Technology Usage Patterns

### Platform Interaction Preferences
**Device Usage Patterns**:
- **Primary Device**: Professional laptop/desktop for content creation and session delivery
  - → Responsive Design: [Desktop Optimization](../frontend/public.md#desktop-experience)
  - 🔗 Performance Requirements: [System Compatibility](../architecture.md#browser-requirements)

- **Mobile Usage**: Smartphone for quick scheduling updates and client communication
  - ⚡ Mobile Interface: [Mobile Consultant Tools](../frontend/public.md#mobile-consultant-interface)
  - → Notification System: [Mobile Push Notifications](../integrations/notifications.md#consultant-alerts)

### Integration with External Tools
**Professional Tool Stack Integration**:
- **LinkedIn Sync**: Automatic profile synchronization and network expansion
  - 🔗 LinkedIn Integration: [Profile Synchronization](../integrations/linkedin.md#bi-directional-sync)
  - → Network Growth: [Connection Management](../integrations/linkedin.md#network-analytics)

- **Calendar Integration**: Seamless scheduling with existing calendar systems
  - ↔️ Calendar Sync: [Multi-platform Calendar Support](../integrations/calendar.md#consultant-calendar-sync)
  - ⚡ Real-time Updates: [Availability Synchronization](../backend/api.md#calendar-webhook-handling)

- **Email Integration**: Professional email management for client communications
  - → Email Platform: [SMTP Integration](../integrations/smtp-brevo.md#consultant-email-templates)
  - 📋 Email Templates: [Automated Communications](../integrations/smtp-brevo.md#consultation-workflows)

### Payment and Financial Management Requirements
**Financial Technology Preferences**:
- **Multi-Currency Support**: International client base requiring diverse payment methods
  - 🔗 Currency Management: [Multi-Currency Processing](../integrations/payment-processing.md#multi-currency-support)
  - → Exchange Rate Handling: [Dynamic Currency Conversion](../integrations/payment-processing.md#currency-conversion)

- **Automated Tax Reporting**: Simplified tax compliance for international consultants
  - ⚡ Tax Integration: [Automated Tax Reporting](../integrations/payment-processing.md#tax-compliance)
  - ← Regulatory Compliance: [International Tax Requirements](../privacy-compliance.md#tax-compliance)

## Pain Points and Solutions

### Lead Generation and Client Acquisition Challenges
**Challenge: Difficulty finding qualified prospects**
- **Platform Solution**: SEO-optimized consultant profiles with content marketing integration
  - → Lead Generation: [Content-Driven Lead Generation](../frontend/public/features/whitepapers.md#consultant-lead-attribution)
  - 🔗 SEO Strategy: [Consultant Profile Optimization](../frontend/public.md#consultant-seo)

- **Cross-Selling Integration**: Automatic promotion of consultation services through content
  - ↔️ Upselling System: [Content-to-Consultation Conversion](../backend/analytics.md#cross-sell-tracking)
  - ⚡ Recommendation Engine: [AI-Powered Client Matching](../backend/api.md#client-consultant-matching)

### Payment Processing and Payout Concerns
**Challenge: Complex international payment handling**
- **Automated Solution**: Stripe Connect integration with automated currency conversion
  - → Payment Automation: [End-to-End Payment Processing](../integrations/payment-processing.md#automated-processing)
  - 🔗 Compliance Management: [KYC Automation](../integrations/payment-processing.md#kyc-automation)

- **Transparent Revenue Sharing**: Clear 85/15 split with automated calculations
  - 📋 Revenue Transparency: [Real-time Earnings Dashboard](../backend/analytics.md#consultant-earnings-dashboard)
  - ⚡ Instant Payouts: [Automated Payout Processing](../integrations/payment-processing.md#payout-automation)

### Professional Credibility and Social Proof Needs
**Challenge: Standing out in crowded consulting marketplace**
- **Integrated Social Proof**: LinkedIn verification, client testimonials, and performance metrics
  - → Credibility System: [Consultant Verification](../security.md#consultant-verification)
  - 🔗 Social Proof Integration: [LinkedIn Credential Sync](../integrations/linkedin.md#credential-verification)

- **Content Authority Building**: Thought leadership through whitepapers and webinars
  - ↔️ Content Strategy: [Authority Building Content](../frontend/public/features/whitepapers.md#thought-leadership)
  - → Speaking Opportunities: [Webinar Expert Program](../frontend/public/features/webinars.md#expert-speaker-program)

### Content Creation and Marketing Support Requirements
**Challenge: Time-consuming content creation and promotion**
- **AI-Assisted Content Creation**: Automated content suggestions and optimization
  - ⚡ AI Tools: [Content Generation Assistance](../backend/api.md#ai-content-assistance)
  - → Template Library: [Content Templates](../frontend/adminpanel/admin.md#content-templates)

- **Automated Marketing Integration**: Social media promotion and email marketing
  - 🔗 Marketing Automation: [Content Promotion Pipeline](../integrations/social-media.md#consultant-promotion)
  - 📋 Email Campaigns: [Consultant Newsletter Integration](../integrations/smtp-brevo.md#consultant-newsletters)

## Cross-References Summary

← **Referenced by**: 
- [Booking System](../frontend/public/features/book-a-meeting.md#consultant-profiles)
- [Whitepaper Platform](../frontend/public/features/whitepapers.md#consultant-authorship)
- [Webinar System](../frontend/public/features/webinars.md#consultant-speakers)
- [Admin Management](../frontend/adminpanel/admin.md#consultant-administration)
- [Payment Processing](../integrations/payment-processing.md#consultant-onboarding)

→ **References**: 
- [Security Framework](../security.md#consultant-permissions)
- [Database Schema](../backend/database.md#consultant-tables)
- [API Endpoints](../backend/api.md#consultant-endpoints)
- [LinkedIn Integration](../integrations/linkedin.md#consultant-integration)
- [Analytics System](../backend/analytics.md#consultant-metrics)

↔️ **Related Personas**: 
- [B2B Buyer Financial](b2b-buyer-financial.md#consultant-interaction)
- [B2B Buyer Owner](b2b-buyer-owner.md#expert-consultation)
- [B2B Buyer Technical](b2b-buyer-technical.md#technical-consultation)
- [Site Admin](site-admin.md#consultant-management)
- [Content Editor](content-editor.md#consultant-collaboration)

## Visual Documentation

![Consultant System Integration](../../diagrams/spec_v2/personas/consultant_system_integration.png)
*Complete system integration showing all consultant touchpoints and data flows*

### Key Process Flows
- [Consultant Onboarding Journey](../../diagrams/spec_v2/personas/consultant_onboarding_flow.png)
- [Payment Setup and KYC Process](../../diagrams/spec_v2/personas/consultant_kyc_flow.png)
- [Client Consultation Workflow](../../diagrams/spec_v2/personas/consultant_client_interaction.png)
- [Content Creation Pipeline](../../diagrams/spec_v2/personas/consultant_content_creation.png)
- [Revenue Distribution Flow](../../diagrams/spec_v2/personas/consultant_revenue_flow.png)

### System Architecture Diagrams
- [Consultant Permissions Matrix](../../diagrams/spec_v2/security/consultant_permissions.png)
- [Integration Architecture](../../diagrams/spec_v2/integrations/consultant_integrations.png)
- [Data Flow Architecture](../../diagrams/spec_v2/architecture/consultant_data_flow.png)

🔗 **Complete Diagram Index**: [All Consultant Diagrams](../../diagrams/spec_v2/personas/consultant/)