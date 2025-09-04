# Magnetiq v2 - Webinars Feature Specification

## Overview

The webinar system is a comprehensive platform for managing online educational events with integrated consultant expertise, from creation and promotion to registration, delivery, and follow-up. It seamlessly integrates consultants as subject matter experts with the broader Magnetiq ecosystem to provide enhanced lead generation, customer engagement, and business intelligence through expert-led sessions.

→ **Consultant Integration**: [Consultant Management System](../../users/knowhow-bearer.md) provides expert presenters and thought leadership
← **Supports Business Goals**: [Lead Generation](../../../business/lead-generation.md), [Expert Positioning](../../../business/thought-leadership.md)
🔗 **Cross-References**: [Consultant Booking System](../booking.md), [Payment Processing](../../../integrations/payment.md), [CRM Integration](../../../integrations/crm.md)

## System Architecture

### Data Model Hierarchy
```
Webinar Topic (Template)
├── Multiple Sessions (Instances)
│   ├── Consultant/Speaker Assignment
│   │   ├── Single Consultant Sessions
│   │   ├── Panel Discussions (Multiple Consultants)
│   │   └── Guest Expert Integration
│   ├── Multiple Registrations
│   │   ├── Consultant-Specific Registration Paths
│   │   └── Cross-Selling Consultant Services
│   ├── Materials & Resources
│   │   ├── Consultant Bio & Credentials
│   │   ├── Related Consultant Whitepapers
│   │   └── Expert Testimonials
│   └── Analytics Data
│       ├── Consultant Performance Metrics
│       ├── Attendee Engagement by Expert
│       └── Revenue Attribution
└── Integration Points
    ├── Calendar Events
    ├── Consultant Management System
    │   ├── LinkedIn Profile Integration
    │   ├── Availability Checking
    │   └── Performance Tracking
    ├── Payment Processing
    │   ├── Revenue Sharing with Consultants
    │   └── Consultant Payment Management
    ├── Booking System Integration
    │   ├── Post-Webinar Consultation Booking
    │   └── Follow-up Session Scheduling
    └── Communication Services
        ├── Email Campaigns
        ├── LinkedIn Promotion
        ├── Consultant-Specific Messaging
        └── Social Media Analytics
```

### Core Entities

#### Webinar Topics
Reusable templates that define the content and structure of webinars.

```typescript
interface WebinarTopic {
  id: string;
  title: TranslatedText;
  description: TranslatedText;
  learningObjectives: TranslatedText[];
  prerequisites: TranslatedText;
  targetAudience: TranslatedText;
  category: string;
  tags: string[];
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  defaultDuration: number; // minutes
  defaultPrice: number;
  defaultCapacity?: number;
  thumbnailUrl?: string;
  promotionalImageUrl?: string;
  odooProductId?: number;
  status: 'draft' | 'active' | 'archived';
  createdBy: string;
  updatedBy: string;
}
```

#### Webinar Sessions
Specific instances of webinar topics scheduled at particular times.

```typescript
interface WebinarSession {
  id: string;
  slug: string; // URL-friendly identifier
  topicId: string;
  speakerId: string;
  
  // Session Details
  title?: TranslatedText; // Override topic title if needed
  description?: TranslatedText; // Override topic description
  datetime: Date;
  duration: number; // minutes
  timezone: string;
  
  // Multiple Consultant Support
  speakers: {
    primary: string; // Primary consultant/speaker ID
    panelists?: string[]; // Additional consultants for panel sessions
    moderatorId?: string; // Moderator for panel discussions
  };
  
  // Session Type & Format
  sessionType: 'single-speaker' | 'panel-discussion' | 'workshop' | 'q-and-a';
  consultantFocus: {
    primaryExpertise: string;
    secondaryTopics: string[];
    targetAudience: string[];
  };
  
  // Pricing & Capacity with Consultant Revenue
  price: number;
  currency: string;
  capacity?: number;
  registrationCount: number;
  attendanceCount: number;
  
  // Revenue Management
  revenueSharing: {
    consultantRevenue: number;
    platformRevenue: number;
    revenueSharePercentage: number;
  };
  
  // Platform Integration
  meetingUrl?: string;
  meetingPassword?: string;
  recordingUrl?: string;
  
  // Content & Materials
  materialsUrl?: string;
  slidesUrl?: string;
  certificateTemplate?: string;
  
  // Publishing & Registration
  status: 'draft' | 'published' | 'live' | 'completed' | 'cancelled';
  registrationOpensAt?: Date;
  registrationClosesAt?: Date;
  
  // Enhanced Analytics with Consultant Focus
  viewCount: number;
  completionRate?: number;
  averageRating?: number;
  
  // Consultant-Specific Analytics
  consultantMetrics: {
    expertiseRelevanceScore: number;
    audienceEngagementRate: number;
    followUpBookings: number;
    leadQualityScore: number;
  };
  
  // Post-Webinar Opportunities
  followUpOpportunities: {
    consultationRequests: number;
    whitepaperDownloads: number;
    socialConnections: number;
    businessInquiries: number;
  };
  
  // Integration
  odooEventId?: number;
  googleCalendarEventId?: string;
  
  // Audit
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string;
}
```

#### Speakers & Consultants
Profiles of webinar presenters with enhanced consultant integration and credentials.

→ **Consultant Profiles**: [Knowhow Bearer Persona](../../users/knowhow-bearer.md#consultant-profiles)
🔗 **LinkedIn Integration**: [LinkedIn Service](../../../integrations/linkedin.md#profile-sync)
↔️ **Performance Analytics**: [Consultant Analytics](../../backend/analytics.md#consultant-metrics)

```typescript
interface WebinarSpeaker {
  id: string;
  firstName: string;
  lastName: string;
  title?: string;
  email: string;
  phone?: string;
  biography: TranslatedText;
  company?: string;
  position?: string;
  expertise: string[];
  photoUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  
  // Enhanced Consultant Integration
  consultantId?: string; // Link to consultant profile
  isInternal: boolean;
  consultantType: 'internal' | 'external' | 'partner';
  
  // LinkedIn Data Integration
  linkedinData?: {
    profileId: string;
    headline: string;
    connections: number;
    recommendations: number;
    lastSynced: Date;
  };
  
  // Credentials & Expertise
  credentials: {
    certifications: string[];
    education: string[];
    publications: string[];
    speakingExperience: number; // years
  };
  
  // Performance Metrics
  performance: {
    totalWebinars: number;
    averageRating: number;
    attendeeCount: number;
    engagementRate: number;
    conversionRate: number; // attendees to consultations
    repeatBookings: number;
  };
  
  // Revenue & Business
  businessSettings?: {
    hourlyRate?: number;
    availableForConsultations: boolean;
    revenueSharePercentage: number;
    preferredPaymentTerms: string;
  };
  
  // Content & Branding
  branding?: {
    logoUrl?: string;
    brandColors: string[];
    customTemplates: string[];
  };
  
  // Status & Availability
  isActive: boolean;
  availabilityStatus: 'available' | 'busy' | 'unavailable';
  nextAvailableDate?: Date;
  
  // Quality Metrics
  qualityMetrics: {
    contentQualityScore: number;
    technicalSetupScore: number;
    engagementScore: number;
    professionalismScore: number;
  };
}
```

#### Registrations
Individual attendee registrations for webinar sessions.

```typescript
interface WebinarRegistration {
  id: string;
  sessionId: string;
  
  // Attendee Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  website?: string;
  
  // Registration Details
  status: 'confirmed' | 'cancelled' | 'attended' | 'no_show';
  registrationSource: string; // 'website', 'social', 'email', etc.
  specialRequirements?: string;
  
  // Consent & Legal
  termsAccepted: boolean;
  marketingConsent: boolean;
  privacyConsent: boolean;
  
  // Payment (for paid webinars)
  paymentStatus: 'not_required' | 'pending' | 'completed' | 'failed' | 'refunded';
  paymentAmount?: number;
  paymentMethod?: string;
  paymentReference?: string;
  
  // Attendance Tracking
  joinedAt?: Date;
  leftAt?: Date;
  attendanceDuration?: number; // minutes
  
  // Engagement Metrics
  questionsAsked: number;
  chatMessages: number;
  rating?: number;
  feedback?: string;
  
  // Integration
  odooRegistrationId?: number;
  
  // Audit
  registeredAt: Date;
  updatedAt: Date;
}
```

## Public Frontend Features

### Webinar Overview Page (`/webinars`)

→ **Consultant Discovery**: Enhanced filtering and search by consultant expertise
🔗 **Related Features**: [Consultant Directory](../consultants.md), [Expert Search](../search.md#consultant-search)
← **Feeds into**: [Lead Generation](../../backend/crm.md#webinar-leads)

#### Layout & Design
- **Hero Section**: Compelling headline about the webinar program
- **Filter Bar**: Easy-to-use filtering options
- **Webinar Grid**: Responsive card layout showcasing upcoming sessions
- **Pagination**: Handle large numbers of webinars efficiently
- **Search**: Full-text search across titles and descriptions

#### Enhanced Filtering Options with Consultant Integration
```typescript
interface WebinarFilters {
  timeframe: 'this-week' | 'this-month' | 'all-upcoming' | 'past';
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  price?: 'free' | 'paid' | 'all';
  
  // Enhanced Consultant Filtering
  speaker?: string;
  consultantType?: 'internal' | 'external' | 'partner' | 'all';
  expertise?: string[]; // Multiple expertise areas
  consultantRating?: number; // Minimum rating
  hasFollowUpConsultation?: boolean;
  
  // Advanced Consultant Filters
  industry?: string[]; // Consultant industry experience
  experienceLevel?: 'junior' | 'senior' | 'expert'; // Consultant experience
  certifications?: string[]; // Required certifications
  availableForConsultation?: boolean;
  
  language: 'en' | 'de' | 'all';
  search?: string;
  
  // Session Format Filters
  sessionType?: 'single-speaker' | 'panel-discussion' | 'workshop' | 'q-and-a' | 'all';
  panelSize?: 'single' | 'small-panel' | 'large-panel';
}
```

#### Webinar Card Component
```typescript
interface WebinarCardProps {
  session: WebinarSession;
  speaker: WebinarSpeaker;
  topic: WebinarTopic;
  showPrice?: boolean;
  showCapacity?: boolean;
  enableSocialShare?: boolean;
}
```

**Enhanced Card Elements with Consultant Integration:**
- **Thumbnail Image**: Eye-catching visual with consultant branding
- **Title & Description**: Clear, compelling copy in selected language
- **Enhanced Speaker Info**: 
  - Consultant photo with professional badge
  - Name, title, and credentials
  - LinkedIn connection count and verification badge
  - Brief expertise summary
  - Consultant rating and review count
- **Date & Time**: Prominently displayed with timezone handling
- **Duration**: Clear indication of session length
- **Price**: Free/paid indicator with consultant revenue sharing info
- **Capacity**: "X of Y spots remaining" if limited
- **Enhanced Tags**: 
  - Difficulty level and category
  - Consultant expertise badges
  - Session type (single/panel)
  - Industry focus tags
- **Multiple CTAs**: 
  - "Register Now" primary button
  - "View Consultant Profile" secondary link
  - "Book Consultation" if consultant available
- **Social Proof**: 
  - Previous attendee count
  - Consultant testimonials preview
  - Company logos of past attendees
- **Social Share**: Enhanced LinkedIn, Twitter sharing with consultant tags

#### Advanced Features
- **Calendar Quick Add**: "Add to Calendar" button with .ics download
- **Timezone Detection**: Automatic detection of user timezone
- **Personalization**: Show recommended webinars based on previous attendance
- **Waitlist**: Join waitlist for fully booked sessions

### Webinar Detail/Landing Page (`/webinars/{id}` or `/webinars/{slug}`)

→ **Enhanced Implementation**: Complete webinar detail page with calendar integration and social sharing
🔗 **Calendar Integration**: Google Calendar, Outlook, Apple Calendar, ICS download
📱 **Social Sharing**: LinkedIn, Twitter, Facebook with custom messaging
🎯 **Registration Flow**: Multi-step modal with validation and confirmation

#### Page Structure & Components

**1. Enhanced Hero Section**
```html
<section class="hero">
  <div class="hero-content">
    <div class="webinar-meta">
      <span class="category-badge">{webinar.category}</span>
      <span class="status-indicator">{webinar.status}</span>
      <span class="level-badge">{webinar.level}</span>
    </div>
    <h1 class="webinar-title">{webinar.title}</h1>
    <p class="webinar-subtitle">{webinar.description}</p>
    <div class="session-details-grid">
      <div class="detail-item">
        <CalendarIcon className="detail-icon" />
        <span class="detail-label">Date & Time</span>
        <span class="detail-value">{formatted_datetime}</span>
      </div>
      <div class="detail-item">
        <ClockIcon className="detail-icon" />
        <span class="detail-label">Duration</span>
        <span class="detail-value">{duration} minutes</span>
      </div>
      <div class="detail-item">
        <GlobeIcon className="detail-icon" />
        <span class="detail-label">Timezone</span>
        <span class="detail-value">{timezone}</span>
      </div>
      <div class="detail-item">
        <UsersIcon className="detail-icon" />
        <span class="detail-label">Attendees</span>
        <span class="detail-value">{attendees}/{maxAttendees}</span>
      </div>
    </div>
    <div class="cta-section">
      <button class="btn-primary btn-lg" onclick="openRegistrationModal()">
        {webinar.status === 'live' ? 'Join Live Now' : 'Register Now'}
      </button>
      <div class="secondary-actions">
        <CalendarDropdown webinar={webinar} />
        <SocialShareDropdown webinar={webinar} />
        <button class="btn-outline">Share with Team</button>
      </div>
    </div>
  </div>
  <div class="hero-visual">
    <img src="{webinar.promotionalImage}" alt="{webinar.title}" class="webinar-featured-image" />
    <div class="registration-stats">
      <div class="stat-item">
        <span class="stat-number">{registrationCount}</span>
        <span class="stat-label">Registered</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{availableSpots}</span>
        <span class="stat-label">Spots Left</span>
      </div>
    </div>
  </div>
</section>
```

**2. Enhanced Consultant/Speaker Section**
→ **Consultant Profile Integration**: [Consultant Management](../../users/knowhow-bearer.md#profile-management)
🔗 **LinkedIn Sync**: [LinkedIn Integration](../../../integrations/linkedin.md#profile-data)
↔️ **Booking System**: [Consultant Booking](../booking.md#consultant-booking)

- **Professional Presentation**:
  - High-resolution consultant photo with verification badge
  - Professional title and current position
  - LinkedIn connection count and industry recognition
  - Years of expertise and speaking experience
  
- **Comprehensive Credentials**:
  - Educational background and certifications
  - Notable publications and thought leadership content
  - Industry awards and recognition
  - Previous speaking engagements and conferences
  
- **Expertise & Specializations**:
  - Primary and secondary areas of expertise
  - Industry sectors served
  - Consulting specializations
  - Technology and methodology expertise
  
- **Performance Metrics & Social Proof**:
  - Average session rating and attendee feedback
  - Total webinars conducted and attendees reached
  - Engagement metrics and interaction rates
  - Client testimonials and success stories
  
- **Interactive Elements**:
  - "View Full Consultant Profile" comprehensive link
  - "Connect on LinkedIn" direct integration button
  - "Book 1:1 Consultation" scheduling interface
  - "Download Consultant Whitepapers" content library
  - "Follow Consultant" for future session notifications
  
- **Related Content & Cross-Selling**:
  - Other upcoming sessions by this consultant
  - Related whitepapers and thought leadership content
  - Previous session recordings and highlights
  - Consultant's published articles and insights
  
- **Panel Discussion Enhancement** (for multi-consultant sessions):
  - All panelist profiles with individual expertise
  - Moderator introduction and facilitation experience
  - Panel dynamic and interaction format
  - Individual consultant booking options post-session

**3. Content Details**
- **Learning Objectives**: Bulleted list of what attendees will learn
- **Target Audience**: Who should attend this webinar
- **Prerequisites**: Required knowledge or experience
- **Agenda**: Detailed session breakdown with timestamps
- **Materials**: Information about downloadable resources

**4. Enhanced Registration Section with Consultant Integration**
```typescript
interface RegistrationSectionProps {
  session: WebinarSession;
  consultants: WebinarSpeaker[];
  isFullyBooked: boolean;
  userHasRegistered: boolean;
  remainingSpots?: number;
  
  // Consultant-specific features
  consultantAvailability: {
    consultantId: string;
    availableForFollowUp: boolean;
    nextAvailableSlot?: Date;
    consultationRate?: number;
  }[];
  
  // Cross-selling opportunities
  relatedServices: {
    consultations: boolean;
    workshops: boolean;
    whitepapers: boolean;
  };
}
```

**Enhanced Registration Elements:**
- **Availability Status**: "X spots remaining" with consultant-specific messaging
- **Consultant Context**: 
  - "Learn directly from [Consultant Name], expert in [expertise]"
  - "Ask questions to our [industry] specialist"
  - Preview of consultant's approach and methodology
- **Price Display**: 
  - Clear pricing with currency and value proposition
  - "Investment in learning from industry expert" messaging
  - Early bird pricing with consultant endorsement
- **Enhanced Registration Form**: 
  - Consultant-specific interest fields
  - Industry and role matching for personalized follow-up
  - Specific question submission for consultant preparation
- **Payment Integration**: 
  - Stripe/PayPal with consultant revenue sharing
  - Corporate billing options for enterprise attendees
- **Cross-Selling Integration**:
  - "Add 1:1 consultation with [Consultant]" upsell option
  - "Download [Consultant's] whitepapers" lead magnet
  - "Join [Consultant's] LinkedIn network" connection opportunity
- **Waitlist Enhancement**: 
  - Priority access for consultant's future sessions
  - Alternative session recommendations with same consultant
- **Legal & Consent**:
  - Terms & Conditions with consultant interaction guidelines
  - Permission for consultant follow-up communications
  - Data sharing consent for personalized recommendations

**5. Enhanced Related Content with Consultant Focus**
→ **Consultant Content Strategy**: [Content Management](../../backend/cms.md#consultant-content)
🔗 **Recommendation Engine**: [AI Recommendations](../../backend/ai.md#content-recommendations)

- **Consultant's Complete Portfolio**:
  - All upcoming sessions by this consultant
  - Previous session recordings and highlights
  - Published whitepapers and thought leadership
  - Client case studies and success stories
  
- **Expert Network Recommendations**:
  - Sessions by consultants with complementary expertise
  - Panel discussions featuring this consultant
  - Cross-functional expert collaborations
  
- **Personalized Suggestions**:
  - Based on user's industry and role
  - Matched to user's previous consultant interactions
  - Progression paths for skill development
  - Advanced sessions for returning attendees
  
- **Industry-Specific Content**:
  - Webinars targeting user's business sector
  - Consultant expertise in user's technology stack
  - Solutions for user's company size and challenges
  
- **Consultant Ecosystem**:
  - "Clients who worked with [Consultant] also attended..."
  - Popular sessions in consultant's expertise area
  - Trending topics in consultant's industry focus

**6. Enhanced Calendar Integration Section**
```typescript
interface CalendarIntegrationProps {
  webinar: WebinarSession;
  userTimezone: string;
  registrationId?: string;
}
```

**Calendar Integration Features:**
- **Multi-Platform Support**:
  - Google Calendar deep linking with pre-filled event details
  - Outlook Calendar integration (Web, Desktop, Mobile)
  - Apple Calendar support for iOS/macOS users
  - Universal ICS file download for any calendar application
  
- **Smart Event Details**:
  - Automatic timezone conversion based on user location
  - Meeting link inclusion (if available or placeholder)
  - Reminder settings (24h, 1h, 15min before)
  - Webinar description and preparation materials
  - Presenter information and credentials
  
- **Advanced Features**:
  - Series event creation for multi-part webinars
  - Automatic update notifications for schedule changes
  - Integration with user's existing calendar preferences
  - Bulk calendar export for multiple webinars

**7. Social Sharing Integration**
```typescript
interface SocialSharingProps {
  webinar: WebinarSession;
  customMessage?: string;
  includeRegistrationLink: boolean;
  trackingUtmParams: UtmParameters;
}
```

**Social Sharing Features:**
- **LinkedIn Integration**:
  - Professional networking focus with industry hashtags
  - Consultant/speaker tagging and mention
  - Company page sharing for corporate attendees
  - Thought leadership positioning in posts
  
- **Twitter Sharing**:
  - Thread creation for detailed webinar information
  - Hashtag optimization for discoverability
  - Speaker handle mentions and retweets
  - Live-tweeting encouragement during sessions
  
- **Facebook Sharing**:
  - Event creation and invitation capabilities
  - Visual content optimization for engagement
  - Community group sharing permissions
  - Business page cross-promotion
  
- **Advanced Sharing Features**:
  - Custom messaging templates by industry/role
  - Social proof integration ("Join 500+ professionals")
  - Referral tracking and attribution
  - Team sharing with bulk invitation capabilities

**8. Enhanced Social Proof & Consultant Credibility**
← **Testimonial Management**: [Review System](../../backend/reviews.md#consultant-reviews)
🔗 **Company Directory**: [Client Showcase](../clients.md#case-studies)

- **Consultant Authority & Recognition**:
  - "Featured expert at [prestigious conferences/events]"
  - "Trusted advisor to [number] Fortune 500 companies"
  - "Published author with [number] industry publications"
  - "LinkedIn thought leader with [connection count] followers"
  
- **Session-Specific Social Proof**:
  - "Join [number] professionals who attended [consultant's] sessions"
  - Recent attendee testimonials with consultant-specific praise
  - Success stories from consultant's previous webinar attendees
  - Follow-up success metrics from past participants
  
- **Client & Company Validation**:
  - Logos of companies whose employees attended consultant sessions
  - Industry leaders who have worked with this consultant
  - Enterprise clients who regularly book this consultant
  - Startups that grew with consultant's guidance
  
- **Performance & Quality Metrics**:
  - Consultant's overall rating across all sessions
  - Session completion rates and engagement scores
  - Repeat attendance rates for consultant's sessions
  - Net Promoter Score specifically for this consultant
  
- **Real-Time Social Indicators**:
  - "[Number] people are currently viewing this session"
  - "[Number] consultations booked with this expert this month"
  - "Top-rated consultant in [expertise area] category"
  - Live updates on registration momentum

### Enhanced Registration Modal with Multi-Step Flow

→ **Advanced Registration Experience**: Multi-step modal with smart validation and confirmation
🎯 **Conversion Optimization**: Progress indicators, social proof, and urgency elements
📧 **Email Integration**: Immediate confirmation with calendar attachments
🔒 **Security & Privacy**: GDPR compliance and data protection

#### Multi-Step Registration Flow
```typescript
interface RegistrationFlowState {
  currentStep: 'personal' | 'professional' | 'preferences' | 'confirmation';
  formData: RegistrationFormData;
  validationErrors: ValidationErrors;
  isSubmitting: boolean;
  registrationComplete: boolean;
}
```

**Step 1: Personal Information**
- Name, email, phone (with international formatting)
- Automatic duplicate registration check
- Social login options (LinkedIn, Google)
- Email validation and domain verification

**Step 2: Professional Details**
- Company information with auto-complete
- Job title and seniority level
- Industry and use case selection
- Team size and decision-making authority

**Step 3: Webinar Preferences**
- Specific areas of interest within the topic
- Questions for the presenter (optional)
- Consultation interest and follow-up preferences
- Calendar and reminder preferences

**Step 4: Confirmation & Next Steps**
- Registration summary and confirmation
- Automatic calendar event creation
- Social sharing encouragement
- Related content recommendations

### Original Registration Modal

#### Form Structure
```typescript
interface RegistrationFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  
  // Professional Information
  company: string;
  position?: string;
  website?: string;
  
  // Consultant-Specific Information
  industryVertical?: string;
  currentChallenges?: string[];
  expertiseInterest?: string[];
  consultationInterest: boolean;
  
  // Pre-Session Preparation
  specificQuestions?: string;
  learningObjectives?: string;
  followUpPreferences?: 'email' | 'consultation' | 'resources' | 'none';
  
  // Cross-Selling Opportunities
  interestedServices: {
    oneOnOneConsultation: boolean;
    workshopSeries: boolean;
    whitepaperDownloads: boolean;
    ongoingMentorship: boolean;
  };
  
  // Special Requirements
  specialRequirements?: string;
  accessibilityNeeds?: string;
  
  // Enhanced Legal Consent
  termsAccepted: boolean;
  marketingConsent: boolean;
  privacyConsent: boolean;
  consultantFollowUpConsent: boolean;
  dataProcessingConsent: boolean;
  
  // Session Information (hidden)
  sessionId: string;
  language: 'en' | 'de';
}
```

#### Validation Rules
```typescript
const registrationSchema = z.object({
  firstName: z.string().min(2).max(50),
  lastName: z.string().min(2).max(50),
  email: z.string().email(),
  phone: z.string().optional(),
  company: z.string().min(2).max(200),
  position: z.string().max(200).optional(),
  website: z.string().url().optional(),
  specialRequirements: z.string().max(500).optional(),
  termsAccepted: z.boolean().refine(val => val === true),
  marketingConsent: z.boolean(),
  privacyConsent: z.boolean().refine(val => val === true)
});
```

#### Registration Flow
1. **User fills form** with required information
2. **Real-time validation** provides immediate feedback
3. **Duplicate check** prevents multiple registrations with same email
4. **Capacity check** ensures session isn't full
5. **Payment processing** for paid webinars (if applicable)
6. **Email confirmation** sent immediately
7. **Calendar integration** creates calendar event
8. **Thank you page** with next steps

#### Enhanced Thank You Page with Consultant Integration
→ **Consultant Preparation**: [Session Preparation](../../backend/session-management.md#preparation)
🔗 **Follow-up Automation**: [Email Workflows](../../../integrations/email.md#consultant-workflows)

**Enhanced Confirmation Features:**
- **Personalized Confirmation**: 
  - "You're registered to learn from [Consultant Name], expert in [expertise]"
  - Consultant's personal welcome message and session preview
  - Customized agenda based on consultant's teaching style
  
- **Consultant Connection Opportunities**:
  - "Connect with [Consultant] on LinkedIn" direct link
  - "Follow [Consultant] for ongoing insights" subscription option
  - "Join [Consultant's] professional network" community invitation
  
- **Pre-Session Preparation**:
  - Consultant-recommended preparation materials
  - Industry-specific case studies from consultant's experience
  - Pre-reading materials authored by the consultant
  - "What to expect from [Consultant's] teaching approach"
  
- **Cross-Selling Integration**:
  - "Book a 1:1 consultation with [Consultant]" scheduling link
  - "Download [Consultant's] exclusive whitepaper" lead magnet
  - "Join [Consultant's] upcoming workshop series" registration
  - "Get priority access to [Consultant's] future sessions"
  
- **Enhanced Social Sharing**:
  - "I'm learning from [Consultant Name], industry expert in [field]"
  - Pre-filled LinkedIn posts with consultant tags and expertise hashtags
  - Twitter threads highlighting consultant's background
  - Company page sharing for corporate attendees
  
- **Consultant-Specific Resources**:
  - Curated reading list from consultant's recommendations
  - Access to consultant's previous session recordings
  - Industry reports and insights from consultant's research
  - Tools and templates shared by the consultant

### Session Management System

#### Session Retention
```typescript
interface RegistrationSession {
  id: string;
  userId?: string; // If logged in
  email: string; // For guest users
  registrationData: Partial<RegistrationFormData>;
  expiresAt: Date; // 4 hours from creation
  completedAt?: Date;
  sessionWebinars: string[]; // IDs of webinars in this session
}
```

**Session Features:**
- **Auto-fill**: Pre-fill forms with previous registration data
- **Multi-registration**: Register for multiple webinars in one session
- **Session expiry**: 4-hour timeout with warning at 30 minutes remaining
- **Resume registration**: Return to incomplete registrations
- **Data persistence**: Survive browser refresh/navigation

## Admin Panel Features

### Dashboard & Analytics

#### Webinar Program Overview
```typescript
interface WebinarDashboard {
  summary: {
    totalSessions: number;
    upcomingSessions: number;
    totalRegistrations: number;
    averageAttendance: number;
    revenueGenerated: number;
  };
  
  recentActivity: {
    newRegistrations: Registration[];
    completedSessions: Session[];
    pendingTasks: Task[];
  };
  
  performanceMetrics: {
    conversionRates: {
      viewToRegistration: number;
      registrationToAttendance: number;
    };
    popularTopics: TopicPerformance[];
    speakerPerformance: SpeakerPerformance[];
  };
}
```

### Enhanced Session Management with Consultant Integration

→ **Consultant Assignment**: [Consultant Management](../../users/knowhow-bearer.md#assignment-workflow)
🔗 **Revenue Tracking**: [Payment Processing](../../../integrations/payment.md#revenue-sharing)
↔️ **Performance Analytics**: [Consultant Analytics](../../backend/analytics.md#consultant-performance)

#### Enhanced Session Creation Workflow with Consultant Integration
1. **Select Topic & Match Consultant**: 
   - Choose from existing topics or create new
   - AI-powered consultant matching based on expertise
   - View consultant availability and preferred session types
   
2. **Consultant Assignment & Configuration**:
   - Select primary consultant and optional panelists
   - Configure consultant-specific session settings
   - Set up revenue sharing percentages
   - Define consultant's role and responsibilities
   
3. **Schedule Session with Consultant Availability**:
   - Integration with consultant's calendar systems
   - Automatic timezone coordination
   - Buffer time for consultant preparation and follow-up
   - Conflict resolution with existing consultant commitments
   
4. **Enhanced Session Configuration**:
   - Consultant-specific pricing and value propositions
   - Capacity management with consultant preferences
   - Registration windows optimized for consultant promotion
   - Cross-selling opportunities configuration
   
5. **Platform Setup & Consultant Onboarding**:
   - Meeting platform configuration with consultant preferences
   - Consultant technical setup and testing
   - Recording permissions and content rights
   - Backup facilitator assignment for technical issues
   
6. **Content Preparation & Consultant Support**:
   - Consultant content review and approval
   - Marketing materials creation with consultant input
   - Social media content preparation
   - Consultant promotional toolkit provision
   
7. **Review & Publish with Consultant Approval**:
   - Consultant final review of session details
   - Marketing content approval and customization
   - Cross-platform promotion coordination
   - Launch sequence with consultant engagement
   
8. **Enhanced Promotion & Consultant Amplification**:
   - Consultant's network promotion and social sharing
   - LinkedIn articles and thought leadership content
   - Industry publication outreach
   - Partner and client network invitation

#### Session Configuration
```typescript
interface SessionCreationForm {
  // Basic Information
  topicId: string;
  
  // Enhanced Consultant Assignment
  primaryConsultantId: string;
  additionalConsultantIds?: string[]; // For panel discussions
  moderatorId?: string; // For panel sessions
  consultantConfiguration: {
    sessionType: 'single-expert' | 'panel-discussion' | 'workshop' | 'mentorship';
    consultantRole: 'presenter' | 'facilitator' | 'advisor';
    interactionLevel: 'lecture' | 'interactive' | 'hands-on';
  };
  
  title?: TranslatedText; // Override topic title with consultant context
  description?: TranslatedText; // Override with consultant-specific description
  
  // Scheduling
  datetime: Date;
  duration: number;
  timezone: string;
  
  // Registration Settings
  registrationOpensAt?: Date;
  registrationClosesAt?: Date;
  capacity?: number;
  requiresApproval: boolean;
  allowWaitlist: boolean;
  
  // Pricing
  price: number;
  currency: string;
  earlyBirdPrice?: number;
  earlyBirdEndDate?: Date;
  
  // Platform Settings
  platform: 'zoom' | 'teams' | 'webex' | 'custom';
  meetingUrl?: string;
  meetingPassword?: string;
  
  // Content
  materialsUrl?: string;
  recordingEnabled: boolean;
  certificateTemplate?: string;
  
  // Marketing
  promotionalImageUrl?: string;
  socialMediaCopy?: TranslatedText;
  
  // Integration
  createOdooEvent: boolean;
  createCalendarEvent: boolean;
  
  // Publishing
  status: 'draft' | 'published';
  scheduledPublishAt?: Date;
}
```

### Topics Management

#### Topic Library Interface
- **Grid/List View**: Switch between visual and detailed views
- **Search & Filter**: Find topics by category, difficulty, tags
- **Bulk Operations**: Archive, categorize, duplicate multiple topics
- **Usage Analytics**: See which topics generate most registrations
- **Template Creation**: Turn successful sessions into reusable templates

#### Topic Editor
```typescript
interface TopicEditorProps {
  topic?: WebinarTopic; // For editing existing
  languages: ('en' | 'de')[];
  categories: string[];
  defaultSpeakers: WebinarSpeaker[];
}
```

**Editor Features:**
- **Rich Text Editor**: WYSIWYG editing for descriptions
- **Multilingual Support**: Side-by-side editing for EN/DE
- **AI Assistance**: Generate descriptions, learning objectives
- **Preview Mode**: See how topic appears on public pages
- **Version History**: Track changes and revert if needed
- **SEO Optimization**: Meta tags, URL slugs, keywords

### Speaker Management

#### Speaker Directory
- **Speaker Profiles**: Comprehensive bio, photo, contact info
- **Performance Analytics**: Session count, ratings, attendance rates
- **Availability Calendar**: Integration with speaker calendars
- **Communication Hub**: Message speakers, share resources
- **External Speaker Onboarding**: Streamlined setup for guests

#### Speaker Profile Management
```typescript
interface SpeakerProfileForm {
  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    title?: string;
    email: string;
    phone?: string;
    photoUrl?: string;
  };
  
  // Professional Information
  professionalInfo: {
    biography: TranslatedText;
    company?: string;
    position?: string;
    expertise: string[];
    linkedinUrl?: string;
    websiteUrl?: string;
  };
  
  // Webinar Settings
  webinarSettings: {
    preferredDuration: number;
    availableTimezones: string[];
    technicalRequirements?: string;
    specialInstructions?: string;
  };
  
  // Integration
  integration: {
    consultantId?: string; // If internal speaker
    calendarIntegration?: boolean;
    emailNotifications: boolean;
  };
}
```

### Registration Management

#### Registration Dashboard
```typescript
interface RegistrationDashboard {
  sessionId: string;
  summary: {
    totalRegistrations: number;
    confirmedCount: number;
    cancelledCount: number;
    attendedCount: number;
    noShowCount: number;
    waitlistCount: number;
  };
  
  demographics: {
    companySizes: Record<string, number>;
    industries: Record<string, number>;
    jobTitles: Record<string, number>;
    countries: Record<string, number>;
  };
  
  recentActivity: RegistrationActivity[];
}
```

#### Registration List Features
- **Advanced Filtering**: Status, registration date, company, etc.
- **Bulk Actions**: Email, export, status changes
- **Quick Actions**: View details, send reminder, cancel registration
- **Export Options**: CSV, Excel, PDF attendee lists
- **Communication Tools**: Send targeted emails to subgroups

#### Individual Registration Management
```typescript
interface RegistrationDetailsView {
  registration: WebinarRegistration;
  attendanceData?: {
    joinedAt: Date;
    leftAt: Date;
    engagementScore: number;
    questionsAsked: string[];
    chatParticipation: number;
  };
  
  paymentData?: {
    amount: number;
    method: string;
    transactionId: string;
    status: string;
    invoiceUrl?: string;
  };
  
  communicationHistory: {
    emailsSent: EmailLog[];
    responseData?: SurveyResponse;
  };
  
  actions: {
    sendConfirmation: () => void;
    sendReminder: () => void;
    cancelRegistration: () => void;
    refundPayment?: () => void;
    resendMeetingDetails: () => void;
  };
}
```

### Settings & Configuration

#### Webinar Program Manager (WPM)
```typescript
interface WebinarProgramSettings {
  programManager: {
    consultantId: string; // Selected from Consultants
    notificationPreferences: {
      newRegistrations: boolean;
      sessionsReminders: boolean;
      performanceReports: boolean;
    };
  };
  
  defaultSettings: {
    registrationWindow: number; // days before session
    reminderSchedule: number[]; // days before: [7, 2, 1]
    defaultTimezone: string;
    defaultCapacity: number;
    allowWaitlist: boolean;
  };
  
  emailTemplates: {
    confirmationTemplate: string;
    reminderTemplate: string;
    followUpTemplate: string;
    cancellationTemplate: string;
  };
  
  integrationSettings: {
    odooEventCreation: boolean;
    calendarIntegration: boolean;
    autoSyncRegistrations: boolean;
  };
}
```

## Automation Features

### Communication Services Integration

#### Social Media Promotion
```typescript
interface WebinarSocialPromotion {
  webinarTopic: {
    title: TranslatedText;
    description: TranslatedText;
    hashtags: string[];
    speakers: SpeakerInfo[];
  };
  
  linkedinPromotion: {
    companyPagePost: {
      content: string;
      media: ImageFile[];
      publishAt: Date;
      targetAudience: LinkedInAudience;
    };
    speakerPosts: {
      content: string;
      callToAction: string;
      publishAt: Date;
    }[];
  };
  
  twitterPromotion: {
    announcementTweet: {
      content: string;
      media: ImageFile[];
      publishAt: Date;
    };
    threadSeries: {
      tweets: string[];
      schedule: Date[];
    };
    speakerTags: string[];
  };
}
```

#### Automated Social Media Campaigns
- **Pre-webinar**: Announcement posts 2 weeks before
- **Reminder Posts**: 1 week, 3 days, and 24 hours before
- **Live Promotion**: Real-time engagement during webinar
- **Follow-up Content**: Key takeaways and recording announcements

### Email Automation Workflows

#### Registration Confirmation
```typescript
interface ConfirmationEmailData {
  attendee: {
    name: string;
    email: string;
    company?: string;
  };
  
  session: {
    title: string;
    datetime: Date;
    duration: number;
    timezone: string;
    meetingUrl?: string;
  };
  
  additional: {
    registrationReference: string;
    preparationMaterials?: string;
    contactInformation: string;
    socialSharingLinks: string[];
  };
}
```

**Email Content Structure:**
1. **Welcome & Confirmation**: Enthusiastic confirmation message
2. **Session Details**: Date, time, duration, timezone in readable format
3. **Calendar Integration**: Automatic calendar invite attachment
4. **Preparation**: Any pre-session materials or requirements
5. **Technical Requirements**: System requirements, test links
6. **Contact Information**: Support contact for technical issues
7. **Social Sharing**: Encourage sharing with pre-written posts
8. **Company Signature**: Professional branded footer

#### Reminder System
```typescript
interface ReminderSchedule {
  sessionId: string;
  reminders: {
    daysBefore: number;
    templateType: 'initial' | 'final' | 'last_chance';
    includePreparation: boolean;
    includeTechnicalCheck: boolean;
  }[];
}
```

**7-Day Reminder:**
- Session reminder with full details
- Preparation materials and agenda
- Add-to-calendar functionality
- Technical requirements checklist

**2-Day Reminder:**
- Final reminder with urgency
- Direct meeting link (if available)
- Last-minute preparation tips
- Technical support contact info

**2-Hour Reminder:**
- "Starting soon" notification
- One-click join link
- Emergency contact information
- Brief agenda reminder

#### Speaker Communication
```typescript
interface SpeakerNotification {
  sessionId: string;
  speakerId: string;
  
  sessionSummary: {
    title: string;
    datetime: Date;
    duration: number;
    registrationCount: number;
    attendeeList?: AttendeeInfo[];
  };
  
  preparationInfo: {
    meetingUrl: string;
    adminControls: string;
    technicalSupport: string;
    backupPlans: string[];
  };
  
  attendeeInsights: {
    companies: string[];
    jobTitles: string[];
    experienceLevels: string[];
    specificQuestions?: string[];
  };
}
```

**3-Day Speaker Alert:**
- Session confirmation and details
- Attendee count and demographics
- Technical setup instructions
- Contact information for support

**WPM Summary Email:**
- All speaker information plus:
- Detailed attendee list with company info
- Registration analytics and trends
- Links to admin panel for management
- Revenue information (if applicable)

### Background Processing

#### Async Task Queue
```typescript
interface WebinarTasks {
  sendConfirmationEmail: {
    registrationId: string;
    language: 'en' | 'de';
    priority: 'high' | 'normal';
  };
  
  sendReminderEmails: {
    sessionId: string;
    daysBefore: number;
    batchSize: number;
  };
  
  updateOdooRegistrations: {
    sessionId: string;
    registrationIds: string[];
  };
  
  generateCertificates: {
    sessionId: string;
    attendeeIds: string[];
    templateId: string;
  };
  
  syncCalendarEvents: {
    sessionId: string;
    action: 'create' | 'update' | 'cancel';
  };
}
```

#### Scheduled Operations (Manual or Cron-triggered)
```python
# Daily at 9:00 AM - Send reminders for sessions 7 days out (triggered by cron)
def send_7_day_reminders():
    sessions = get_sessions_starting_in_days(7)
    for session in sessions:
        for registration in session.confirmed_registrations:
            send_reminder_email.delay(
                registration.id, 
                days_before=7,
                template='7_day_reminder'
            )

# Daily at 10:00 AM - Send reminders for sessions 2 days out (triggered by cron)
def send_2_day_reminders():
    sessions = get_sessions_starting_in_days(2)
    for session in sessions:
        # Send to attendees
        for registration in session.confirmed_registrations:
            send_reminder_email.delay(
                registration.id,
                days_before=2,
                template='2_day_reminder'
            )
        
        # Send speaker preparation email
        send_speaker_preparation_email.delay(
            session.id,
            session.speaker_id
        )
        
        # Send WPM summary
        send_wpm_summary_email.delay(
            session.id,
            get_webinar_program_manager_id()
        )

# Every 2 hours - Process waitlist for sessions with cancellations (triggered by cron)
def process_waitlists():
    sessions_with_availability = get_sessions_with_new_availability()
    for session in sessions_with_availability:
        process_session_waitlist.delay(session.id)
```

## Enhanced SEO and Meta Tag Management

### Dynamic Meta Tags for Webinar Pages
```typescript
interface WebinarSEOData {
  title: string;
  description: string;
  keywords: string[];
  ogImage: string;
  ogTitle: string;
  ogDescription: string;
  twitterCard: 'summary' | 'summary_large_image';
  structuredData: WebinarStructuredData;
}
```

**SEO Features:**
- **Dynamic Title Generation**: 
  - Format: "[Webinar Title] - Free Expert Session | voltAIc Systems"
  - Language-specific optimization for German/English
  - Speaker credibility integration in titles
  
- **Rich Meta Descriptions**:
  - Compelling 150-character descriptions with CTAs
  - Date, time, and presenter information inclusion
  - Value proposition and key takeaway highlights
  
- **Open Graph Optimization**:
  - Custom promotional images for each webinar
  - Speaker photos and credential highlights
  - Registration count and social proof elements
  
- **Structured Data Markup**:
  - Schema.org Event markup for rich snippets
  - Performer (speaker) information and credentials
  - Location (online), date, time, and pricing info
  - Organization and brand information

### URL Structure and Routing
```typescript
interface WebinarRouting {
  canonical: {
    en: '/webinars/{id}' | '/webinars/{slug}';
    de: '/de/webinare/{id}' | '/de/webinare/{slug}';
  };
  alternateUrls: {
    registration: '/webinars/{id}/register';
    calendar: '/webinars/{id}/calendar';
    share: '/webinars/{id}/share';
  };
}
```

## Integration Features

### Odoo CRM Integration

#### Lead Generation from Registrations
```python
async def create_lead_from_registration(registration: WebinarRegistration):
    """Create Odoo lead from webinar registration."""
    lead_data = {
        'name': f'Webinar Lead - {registration.first_name} {registration.last_name}',
        'contact_name': f'{registration.first_name} {registration.last_name}',
        'email_from': registration.email,
        'phone': registration.phone,
        'partner_name': registration.company,
        'website': registration.website,
        'description': f'Lead from webinar registration: {registration.session.title}',
        'source_id': await get_source_id('Webinar'),
        'medium_id': await get_medium_id('Education'),
        'campaign_id': await get_campaign_id(registration.session.topic.category),
        'tag_ids': [(6, 0, [
            await get_tag_id('Webinar Lead'),
            await get_tag_id(registration.session.topic.category)
        ])],
        'user_id': await get_wpm_odoo_user_id(),
        'expected_revenue': registration.session.price if registration.session.price > 0 else 0
    }
    
    return await odoo_service.create_lead(lead_data)
```

#### Event Synchronization
```python
async def sync_session_to_odoo_event(session: WebinarSession):
    """Create or update Odoo event for webinar session."""
    event_data = {
        'name': session.title['en'],
        'date_begin': session.datetime.isoformat(),
        'date_end': (session.datetime + timedelta(minutes=session.duration)).isoformat(),
        'seats_max': session.capacity,
        'website_published': session.status == 'published',
        'description': session.description['en'],
        'address': session.meeting_url or 'Online Event',
        'event_type_id': await get_event_type_id('Webinar'),
        'organizer_id': await get_speaker_partner_id(session.speaker_id),
        'tag_ids': [(6, 0, [
            await get_tag_id('Webinar'),
            await get_tag_id(session.topic.category)
        ])],
        'ticket_ids': [{
            'name': 'Standard Registration',
            'product_id': session.topic.odoo_product_id,
            'price': session.price,
            'seats_max': session.capacity
        }] if session.price > 0 else []
    }
    
    if session.odoo_event_id:
        return await odoo_service.update_event(session.odoo_event_id, event_data)
    else:
        event_id = await odoo_service.create_event(event_data)
        await update_session_odoo_id(session.id, event_id)
        return event_id
```

### Calendar Integration

#### Attendee Calendar Events
```python
async def create_attendee_calendar_event(registration: WebinarRegistration):
    """Create calendar event for webinar attendee."""
    event_data = {
        'summary': f'Webinar: {registration.session.title["en"]}',
        'description': f'''
            Join the webinar: {registration.session.title["en"]}
            
            Speaker: {registration.session.speaker.first_name} {registration.session.speaker.last_name}
            Duration: {registration.session.duration} minutes
            
            Meeting Details:
            {registration.session.meeting_url or "Meeting link will be shared closer to the event"}
            
            Preparation:
            {registration.session.materials_url or "No preparation materials"}
            
            Registration Reference: {registration.id}
        ''',
        'start': {
            'dateTime': registration.session.datetime.isoformat(),
            'timeZone': registration.session.timezone
        },
        'end': {
            'dateTime': (registration.session.datetime + timedelta(minutes=registration.session.duration)).isoformat(),
            'timeZone': registration.session.timezone
        },
        'reminders': {
            'useDefault': False,
            'overrides': [
                {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                {'method': 'popup', 'minutes': 30}         # 30 minutes before
            ]
        }
    }
    
    # Generate .ics file for email attachment
    ics_content = generate_ics_file(event_data)
    
    return ics_content
```

## Analytics & Reporting

### Key Performance Indicators

#### Session Performance Metrics
```typescript
interface SessionAnalytics {
  sessionId: string;
  
  // Registration Metrics
  registrationMetrics: {
    totalViews: number;
    uniqueVisitors: number;
    registrationRate: number; // registrations / unique visitors
    dropoffPoints: {
      landingPage: number;
      registrationForm: number;
      paymentPage?: number;
    };
  };
  
  // Attendance Metrics
  attendanceMetrics: {
    registeredCount: number;
    attendedCount: number;
    attendanceRate: number;
    averageAttendanceDuration: number;
    peakAttendance: number;
    attendanceByTimeZone: Record<string, number>;
  };
  
  // Engagement Metrics
  engagementMetrics: {
    questionsAsked: number;
    chatMessages: number;
    pollResponses: number;
    averageEngagementScore: number;
    feedbackSubmissions: number;
    averageRating: number;
  };
  
  // Revenue Metrics (if applicable)
  revenueMetrics?: {
    totalRevenue: number;
    averageTicketPrice: number;
    refundRate: number;
    conversionValue: number;
  };
  
  // Lead Generation
  leadMetrics: {
    leadsGenerated: number;
    qualifiedLeads: number;
    leadSources: Record<string, number>;
    followUpActions: number;
  };
}
```

#### Program-Level Analytics
```typescript
interface ProgramAnalytics {
  timeframe: {
    startDate: Date;
    endDate: Date;
  };
  
  overallMetrics: {
    totalSessions: number;
    totalRegistrations: number;
    totalAttendees: number;
    totalRevenue: number;
    averageSessionRating: number;
  };
  
  trends: {
    registrationTrend: TimeSeriesData[];
    attendanceTrend: TimeSeriesData[];
    engagementTrend: TimeSeriesData[];
  };
  
  topPerformers: {
    mostPopularTopics: TopicPerformance[];
    topSpeakers: SpeakerPerformance[];
    bestEngagementSessions: SessionSummary[];
  };
  
  audienceInsights: {
    demographics: {
      countries: Record<string, number>;
      industries: Record<string, number>;
      companySizes: Record<string, number>;
      jobTitles: Record<string, number>;
    };
    
    behaviorPatterns: {
      repeatAttendees: number;
      multiSessionRegistrations: number;
      averageSessionsPerUser: number;
    };
  };
}
```

### Reporting Dashboard

#### Real-time Session Monitoring
```typescript
interface LiveSessionDashboard {
  sessionId: string;
  status: 'preparing' | 'live' | 'ended';
  
  currentStats: {
    registeredCount: number;
    currentAttendees: number;
    peakAttendees: number;
    averageEngagement: number;
    questionsInQueue: number;
  };
  
  attendeeFlow: {
    joinedInLast5Min: number;
    leftInLast5Min: number;
    attendanceTimeline: TimeSeriesData[];
  };
  
  engagement: {
    chatActivity: number;
    pollResponses: number;
    questionsAsked: number;
    handRaised: number;
  };
  
  technicalMetrics: {
    connectionQuality: 'excellent' | 'good' | 'poor';
    audioIssues: number;
    videoIssues: number;
    dropouts: number;
  };
}
```

## Enhanced Performance Optimization

### Page Loading Performance
```typescript
interface PerformanceMetrics {
  targetMetrics: {
    firstContentfulPaint: '< 1.5s';
    largestContentfulPaint: '< 2.5s';
    cumulativeLayoutShift: '< 0.1';
    firstInputDelay: '< 100ms';
  };
  optimizations: {
    imageOptimization: 'WebP with fallbacks';
    codesplitting: 'Route-based and component-based';
    caching: 'Browser and CDN caching strategies';
    prefetching: 'Critical resource preloading';
  };
}
```

**Performance Features:**
- **Image Optimization**:
  - WebP format with PNG/JPG fallbacks
  - Responsive image sizes for different devices
  - Lazy loading for below-the-fold content
  - Placeholder blur effects during loading
  
- **Code Optimization**:
  - Route-based code splitting for webinar pages
  - Component-level splitting for registration modal
  - Tree shaking for unused calendar/sharing utilities
  - Bundle analysis and optimization
  
- **Caching Strategy**:
  - Browser caching for static assets (images, CSS, JS)
  - API response caching for webinar data
  - CDN caching for global content delivery
  - Service worker implementation for offline support

### Mobile Optimization
```typescript
interface MobileOptimization {
  responsive: {
    breakpoints: ['mobile', 'tablet', 'desktop', 'large-desktop'];
    touchOptimization: 'Increased tap targets and gesture support';
    networkOptimization: 'Reduced data usage and faster loading';
  };
  features: {
    swipeGestures: 'Navigation and interaction enhancements';
    nativeIntegration: 'Calendar and sharing app integration';
    offlineSupport: 'Basic page viewing without connection';
  };
}
```

## Quality Assurance & Testing

### Comprehensive Testing Framework

#### Registration Flow Testing
```typescript
interface RegistrationFlowTests {
  // Multi-Step Registration
  testMultiStepFlow: () => void;
  testStepValidation: () => void;
  testProgressSaving: () => void;
  testStepNavigation: () => void;
  
  // Basic Registration
  testValidRegistration: () => void;
  testInvalidEmailFormat: () => void;
  testMissingRequiredFields: () => void;
  testDuplicateRegistration: () => void;
  
  // Capacity Management
  testFullCapacityHandling: () => void;
  testWaitlistFunctionality: () => void;
  testCapacityUpdates: () => void;
  
  // Calendar Integration Testing
  testGoogleCalendarIntegration: () => void;
  testOutlookCalendarIntegration: () => void;
  testICSFileGeneration: () => void;
  testTimezoneConversion: () => void;
  
  // Social Sharing Testing
  testLinkedInSharing: () => void;
  testTwitterSharing: () => void;
  testFacebookSharing: () => void;
  testCustomMessageGeneration: () => void;
  
  // Email Automation
  testConfirmationEmailWithCalendar: () => void;
  testReminderEmails: () => void;
  testCalendarAttachments: () => void;
  
  // SEO and Meta Tags
  testDynamicMetaTags: () => void;
  testOpenGraphData: () => void;
  testStructuredData: () => void;
  
  // Performance Testing
  testPageLoadSpeed: () => void;
  testImageOptimization: () => void;
  testMobileResponsiveness: () => void;
  
  // Multilingual Support
  testGermanRegistration: () => void;
  testEnglishRegistration: () => void;
  testLanguageSwitching: () => void;
  testLocalizedURLs: () => void;
  
  // Integration Testing
  testOdooSynchronization: () => void;
  testAnalyticsTracking: () => void;
  testEmailServiceIntegration: () => void;
  testCalendarServiceAPIs: () => void;
}
```

### Load Testing Scenarios
```python
# Load testing for high-demand webinars
class WebinarLoadTests:
    def test_concurrent_registrations(self):
        """Test 1000 concurrent registrations for popular webinar."""
        pass
    
    def test_capacity_limits(self):
        """Test behavior when session reaches capacity."""
        pass
    
    def test_email_sending_performance(self):
        """Test bulk email sending for 10,000 registrants."""
        pass
    
    def test_database_performance(self):
        """Test database queries under high load."""
        pass
```

## Footer Integration Feature

### Next 5 Webinars Footer Section

→ **Global Visibility**: [Footer Component](../../frontend/components.md#footer-component)
🔗 **Registration Flow**: [Registration System](../booking.md#webinar-registration)
← **Supports**: [Lead Generation](../../business/lead-generation.md#footer-conversion)

#### Overview
The footer of every page displays the next 5 upcoming webinars to maximize visibility and conversion opportunities. This feature provides a consistent touchpoint for webinar promotion across the entire site.

#### Layout & Design
```typescript
interface FooterWebinarSection {
  title: TranslatedText;
  subtitle: TranslatedText;
  webinars: UpcomingWebinar[];
  viewAllLink: string;
  layout: 'grid' | 'carousel';
}

interface UpcomingWebinar {
  id: string;
  title: TranslatedText;
  date: string;
  time: string;
  registrationLink: string;
}
```

**Visual Structure:**
- **Section Header**: "Upcoming Webinars" with subtitle encouraging registration
- **5-Column Grid**: Responsive layout showing next 5 webinars
- **Webinar Cards**: Compact design with title, date, time, and registration link
- **Call-to-Action**: "View All Webinars" button linking to full webinar page
- **Responsive Behavior**: Adapts to mobile with horizontal scroll or stacked layout

#### Webinar Card Components
```typescript
interface FooterWebinarCard {
  webinar: {
    id: string;
    title: string;
    date: string; // Format: '2025-10-01'
    time: string; // Format: '16:00 CET'
  };
  formatDate: (dateString: string) => string;
  language: 'en' | 'de';
}
```

**Card Features:**
- **Truncated Title**: 2-line max with ellipsis for longer titles
- **Date Display**: Localized date formatting (DD.MM.YYYY for DE, MMM DD, YYYY for EN)
- **Time Display**: Consistent timezone display (16:00 CET)
- **Visual Design**: Light violet theme matching site branding
- **Hover Effects**: Subtle elevation and color changes
- **Registration Link**: Direct link to webinar detail page for registration

#### Data Management
```typescript
interface FooterWebinarData {
  upcomingWebinars: {
    id: number;
    title: TranslatedText;
    date: string;
    time: string;
  }[];
  
  getNext5Webinars: () => UpcomingWebinar[];
  formatDateForLocale: (date: string, locale: 'en' | 'de') => string;
  generateRegistrationUrl: (webinarId: string) => string;
}
```

**Data Features:**
- **Live Data**: Always shows the 5 most recent upcoming webinars
- **Auto-Update**: Updates as webinars are added, removed, or dates change
- **Fallback Handling**: Graceful degradation when fewer than 5 webinars available
- **Cache Optimization**: Efficient data fetching to avoid page load impact

#### Multilingual Support
```typescript
interface FooterWebinarTranslations {
  en: {
    sectionTitle: 'Upcoming Webinars';
    sectionSubtitle: 'Register for our free AI webinars';
    viewAllButton: 'View All Webinars';
    dateFormat: 'MMM DD, YYYY';
  };
  de: {
    sectionTitle: 'Kommende Webinare';
    sectionSubtitle: 'Melden Sie sich für unsere kostenlosen KI-Webinare an';
    viewAllButton: 'Alle Webinare anzeigen';
    dateFormat: 'DD.MM.YYYY';
  };
}
```

#### Integration Points
- **Footer Component**: Integrated into main Footer.tsx component
- **Language Context**: Uses useLanguage hook for internationalization
- **Webinar Data**: Sources data from WebinarsPage.tsx webinar array
- **Routing**: Links to individual webinar pages using Next.js routing
- **Styling**: Consistent with site's violet branding and responsive design

#### Analytics Tracking
```typescript
interface FooterWebinarAnalytics {
  events: {
    footerWebinarView: 'Footer webinar section viewed';
    footerWebinarClick: 'Footer webinar card clicked';
    footerViewAllClick: 'Footer "View All" button clicked';
  };
  
  tracking: {
    webinarId: string;
    webinarTitle: string;
    footerPosition: number; // 1-5
    pageContext: string; // Which page footer was viewed from
  };
}
```

#### Performance Considerations
- **Lazy Loading**: Footer webinar data loads after initial page content
- **Caching**: Client-side caching of webinar data to reduce API calls
- **Optimization**: Minimal data fetching - only essential webinar information
- **Responsive Images**: Optimized loading for mobile vs desktop

#### Test Coverage Requirements
- **Data Display**: Verify correct upcoming webinar data display
- **Responsive Design**: Test across mobile, tablet, desktop viewports
- **Language Switching**: Validate proper translation and date formatting
- **Link Functionality**: Ensure all registration links work correctly
- **Empty State**: Handle gracefully when no upcoming webinars available
- **Loading States**: Proper loading indicators while fetching data
- **Analytics**: Verify click tracking and event recording

## Success Metrics & KPIs

### Enhanced Business Metrics with Consultant Focus
**Core Conversion Metrics:**
- **Registration Conversion Rate**: Views to registrations (with consultant influence tracking)
- **Attendance Rate**: Registrations to actual attendance (consultant-specific rates)
- **Engagement Score**: Questions, chat, poll participation (consultant interaction quality)
- **Lead Generation Rate**: Attendees converted to qualified leads (consultant attribution)

**Consultant-Specific Business Metrics:**
- **Consultant ROI**: Revenue generated per consultant hour invested
- **Consultant Lead Quality Score**: Average qualification score of consultant-generated leads
- **Consultation Conversion Rate**: Webinar attendees to consultation bookings
- **Consultant Revenue Share Efficiency**: Platform vs. consultant revenue optimization
- **Expert Authority Impact**: Registration lift due to consultant credentials
- **Cross-Selling Success Rate**: Upsells to consultant services and content

**Quality & Satisfaction Metrics:**
- **Consultant Performance Rating**: Multi-dimensional consultant evaluation
- **Attendee Satisfaction**: Post-session ratings with consultant-specific feedback
- **Consultant Satisfaction**: Consultant experience and platform feedback
- **Client Success Attribution**: Long-term client success traced to consultant sessions

**Growth & Retention Metrics:**
- **Repeat Attendance**: Users attending multiple consultant sessions
- **Consultant Network Growth**: LinkedIn connections and professional network expansion
- **Content Engagement**: Downloads and engagement with consultant materials
- **Consultant Loyalty**: Consultant retention and exclusive session agreements

### Technical Metrics
- **System Uptime**: 99.9% availability during sessions
- **Page Load Speed**: <2 seconds for registration pages
- **Email Delivery Rate**: >98% successful delivery
- **Integration Reliability**: <1% failed sync operations
- **Data Accuracy**: 100% accurate attendance tracking

### Enhanced Growth Metrics with Consultant Ecosystem Expansion
**Program Scaling Metrics:**
- **Session Frequency**: Number of consultant-led sessions per month
- **Consultant Network Growth**: New expert acquisitions and partnership expansion
- **Audience Growth**: Month-over-month registration growth (consultant-attributed)
- **Topic Expansion**: New expertise areas and consultant specializations
- **Geographic Reach**: Countries and time zones with consultant coverage

**Consultant Ecosystem Growth:**
- **Expert Network Expansion**: Internal consultant development and external partnerships
- **Consultant Specialization Depth**: Expertise areas and industry vertical coverage
- **Consultant Quality Evolution**: Average consultant rating and capability improvements
- **Revenue Stream Diversification**: Multiple consultant service offerings integration
- **Market Penetration**: Industry sectors and company sizes reached through consultants

**Strategic Partnership & Network Effects:**
- **Consultant Cross-Referrals**: Consultant-to-consultant business generation
- **Client Network Leverage**: Consultant client networks driving webinar attendance
- **Industry Thought Leadership**: Consultant-driven industry influence and recognition
- **Content Multiplier Effect**: Consultant-generated content driving ongoing lead generation
- **Ecosystem Value Creation**: Total value created through consultant network effects

This comprehensive webinar specification provides a complete framework for implementing a world-class webinar system that integrates seamlessly with the broader Magnetiq ecosystem while delivering exceptional value to both administrators and attendees.
