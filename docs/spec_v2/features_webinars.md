# Magnetiq v2 - Webinars Feature Specification

## Overview

The webinar system is a comprehensive platform for managing online educational events, from creation and promotion to registration, delivery, and follow-up. It integrates with the broader Magnetiq ecosystem to provide seamless lead generation, customer engagement, and business intelligence.

## System Architecture

### Data Model Hierarchy
```
Webinar Topic (Template)
├── Multiple Sessions (Instances)
│   ├── Speaker Assignment
│   ├── Multiple Registrations
│   ├── Materials & Resources
│   └── Analytics Data
└── Integration Points
    ├── Calendar Events
    ├── Communication Services
    │   ├── Email Campaigns
    │   ├── LinkedIn Promotion
    │   └── Social Media Analytics
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
  
  // Pricing & Capacity
  price: number;
  currency: string;
  capacity?: number;
  registrationCount: number;
  attendanceCount: number;
  
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
  
  // Analytics
  viewCount: number;
  completionRate?: number;
  averageRating?: number;
  
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

#### Speakers
Profiles of webinar presenters with their expertise and credentials.

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
  consultantId?: string; // Link to consultant if internal
  isInternal: boolean;
  isActive: boolean;
  totalWebinars: number;
  averageRating: number;
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

#### Layout & Design
- **Hero Section**: Compelling headline about the webinar program
- **Filter Bar**: Easy-to-use filtering options
- **Webinar Grid**: Responsive card layout showcasing upcoming sessions
- **Pagination**: Handle large numbers of webinars efficiently
- **Search**: Full-text search across titles and descriptions

#### Filtering Options
```typescript
interface WebinarFilters {
  timeframe: 'this-week' | 'this-month' | 'all-upcoming' | 'past';
  category?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  price?: 'free' | 'paid' | 'all';
  speaker?: string;
  language: 'en' | 'de' | 'all';
  search?: string;
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

**Card Elements:**
- **Thumbnail Image**: Eye-catching visual representation
- **Title & Description**: Clear, compelling copy in selected language
- **Speaker Info**: Photo, name, title, and brief bio
- **Date & Time**: Prominently displayed with timezone handling
- **Duration**: Clear indication of session length
- **Price**: Free/paid indicator with amount if applicable
- **Capacity**: "X of Y spots remaining" if limited
- **Tags**: Difficulty level, category, key topics
- **CTA Button**: "Learn More" or "Register Now"
- **Social Share**: LinkedIn, Twitter sharing buttons

#### Advanced Features
- **Calendar Quick Add**: "Add to Calendar" button with .ics download
- **Timezone Detection**: Automatic detection of user timezone
- **Personalization**: Show recommended webinars based on previous attendance
- **Waitlist**: Join waitlist for fully booked sessions

### Webinar Landing Page (`/webinars/{slug}`)

#### Page Structure

**1. Hero Section**
```html
<section class="hero">
  <div class="hero-content">
    <h1>{webinar.title}</h1>
    <p class="subtitle">{webinar.description}</p>
    <div class="session-details">
      <span class="date-time">{formatted_datetime}</span>
      <span class="duration">{duration} minutes</span>
      <span class="timezone">{timezone}</span>
    </div>
    <div class="cta-section">
      <button class="primary-cta">Register Now</button>
      <button class="secondary-cta">Add to Calendar</button>
    </div>
  </div>
  <div class="hero-image">
    <img src="{webinar.promotionalImage}" alt="{webinar.title}" />
  </div>
</section>
```

**2. Speaker Section**
- **Speaker Photo**: Professional headshot
- **Bio & Credentials**: Detailed background information
- **Social Links**: LinkedIn, company website
- **Other Sessions**: Link to speaker's other webinars
- **Contact Option**: Link to book consultation if internal speaker

**3. Content Details**
- **Learning Objectives**: Bulleted list of what attendees will learn
- **Target Audience**: Who should attend this webinar
- **Prerequisites**: Required knowledge or experience
- **Agenda**: Detailed session breakdown with timestamps
- **Materials**: Information about downloadable resources

**4. Registration Section**
```typescript
interface RegistrationSectionProps {
  session: WebinarSession;
  isFullyBooked: boolean;
  userHasRegistered: boolean;
  remainingSpots?: number;
}
```

**Elements:**
- **Availability Status**: "X spots remaining" or "Fully booked"
- **Price Display**: Clear pricing with currency
- **Registration Form**: Modal or embedded form
- **Payment Integration**: Stripe/PayPal for paid webinars
- **Waitlist Option**: If session is full
- **Terms & Conditions**: Link and checkbox

**5. Related Content**
- **Upcoming Webinars**: 4 randomly selected future sessions
- **Related Topics**: Webinars in the same category
- **Speaker's Sessions**: Other webinars by the same speaker
- **Recommended**: Based on user's previous activity

**6. Social Proof & Reviews**
- **Past Attendee Count**: "Join X professionals who attended"
- **Testimonials**: Reviews from previous sessions
- **Company Logos**: Organizations whose employees attended
- **Ratings**: Average rating from past sessions

### Registration Modal

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
  
  // Special Requirements
  specialRequirements?: string;
  
  // Legal Consent
  termsAccepted: boolean;
  marketingConsent: boolean;
  privacyConsent: boolean;
  
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

#### Thank You Page Features
- **Confirmation Message**: "You're registered for [Webinar Title]"
- **Session Details**: Date, time, duration, timezone
- **Calendar Downloads**: Google Calendar, Outlook, .ics file
- **Next Steps**: What to expect, preparation materials
- **Social Sharing**: "I just registered for..." with pre-filled text
- **Meeting Access**: Instructions on how to join (closer to event date)
- **Additional Resources**: Related content recommendations

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

### Session Management

#### Session Creation Workflow
1. **Select Topic**: Choose from existing topics or create new
2. **Assign Speaker**: Select internal or external speaker
3. **Schedule Session**: Date, time, duration with timezone
4. **Configure Details**: Price, capacity, registration windows
5. **Setup Platform**: Meeting URL, passwords, recording settings
6. **Review & Publish**: Preview page before going live
7. **Promotion**: Generate marketing materials and links

#### Session Configuration
```typescript
interface SessionCreationForm {
  // Basic Information
  topicId: string;
  speakerId: string;
  title?: TranslatedText; // Override topic title
  description?: TranslatedText; // Override topic description
  
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

#### Scheduled Tasks
```python
# Daily at 9:00 AM - Send reminders for sessions 7 days out
@celery_app.task
def send_7_day_reminders():
    sessions = get_sessions_starting_in_days(7)
    for session in sessions:
        for registration in session.confirmed_registrations:
            send_reminder_email.delay(
                registration.id, 
                days_before=7,
                template='7_day_reminder'
            )

# Daily at 10:00 AM - Send reminders for sessions 2 days out
@celery_app.task
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

# Every 2 hours - Process waitlist for sessions with cancellations
@celery_app.task
def process_waitlists():
    sessions_with_availability = get_sessions_with_new_availability()
    for session in sessions_with_availability:
        process_session_waitlist.delay(session.id)
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

## Quality Assurance & Testing

### Registration Flow Testing
```typescript
interface RegistrationFlowTests {
  // Basic Registration
  testValidRegistration: () => void;
  testInvalidEmailFormat: () => void;
  testMissingRequiredFields: () => void;
  testDuplicateRegistration: () => void;
  
  // Capacity Management
  testFullCapacityHandling: () => void;
  testWaitlistFunctionality: () => void;
  testCapacityUpdates: () => void;
  
  // Payment Integration
  testFreeRegistration: () => void;
  testPaidRegistration: () => void;
  testPaymentFailure: () => void;
  testRefundProcess: () => void;
  
  // Email Automation
  testConfirmationEmail: () => void;
  testReminderEmails: () => void;
  testCalendarInvites: () => void;
  
  // Multilingual Support
  testGermanRegistration: () => void;
  testEnglishRegistration: () => void;
  testLanguageSwitching: () => void;
  
  // Integration Testing
  testOdooSynchronization: () => void;
  testCalendarIntegration: () => void;
  testAnalyticsTracking: () => void;
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

## Success Metrics & KPIs

### Business Metrics
- **Registration Conversion Rate**: Views to registrations
- **Attendance Rate**: Registrations to actual attendance
- **Engagement Score**: Questions, chat, poll participation
- **Lead Generation Rate**: Attendees converted to leads
- **Revenue per Session**: For paid webinars
- **Speaker Satisfaction**: Feedback from presenters
- **Attendee Satisfaction**: Post-session ratings and feedback
- **Repeat Attendance**: Users attending multiple sessions

### Technical Metrics
- **System Uptime**: 99.9% availability during sessions
- **Page Load Speed**: <2 seconds for registration pages
- **Email Delivery Rate**: >98% successful delivery
- **Integration Reliability**: <1% failed sync operations
- **Data Accuracy**: 100% accurate attendance tracking

### Growth Metrics
- **Session Frequency**: Number of sessions per month
- **Audience Growth**: Month-over-month registration growth
- **Topic Expansion**: New categories and expertise areas
- **Geographic Reach**: Countries and time zones covered
- **Partnership Opportunities**: External speakers and collaborations

This comprehensive webinar specification provides a complete framework for implementing a world-class webinar system that integrates seamlessly with the broader Magnetiq ecosystem while delivering exceptional value to both administrators and attendees.
