# Magnetiq v2 - Consultation Booking Feature Specification

## Overview

The consultation booking system provides a seamless way for potential clients to schedule meetings with voltAIc Systems consultants. It integrates calendar availability checking, automated confirmations, and CRM synchronization to deliver a professional booking experience.

## System Architecture

### Data Models

```typescript
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
    languages: ('en' | 'de')[];
    linkedinUrl?: string;
    certifications: Certification[];
  };
  
  availability: {
    timezone: string;
    workingHours: WeeklySchedule;
    holidays: DateRange[];
    isOnline: boolean;
    isAcceptingBookings: boolean;
  };
  
  integration: {
    googleCalendarId?: string;
    odooPartnerId?: number;
  };
  
  analytics: {
    totalBookings: number;
    averageRating: number;
    responseTime: number;
    completionRate: number;
  };
}

interface Booking {
  id: string;
  reference: string; // VLT-YYYYMMDD-XXXX format
  
  // Consultation Details
  consultantId: string;
  datetime: Date;
  duration: number; // minutes: 30, 60, 90, 120
  timezone: string;
  meetingType: 'video' | 'phone' | 'in_person';
  
  // Client Information
  client: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    website?: string;
    position?: string;
  };
  
  // Booking Content
  subject?: string;
  message?: string;
  preparationNotes?: string;
  
  // Meeting Details
  meetingUrl?: string;
  meetingPassword?: string;
  meetingId?: string;
  
  // Status & Tracking
  status: 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled';
  bookingSource: 'website' | 'referral' | 'direct' | 'social';
  
  // Integration
  googleCalendarEventId?: string;
  odooEventId?: number;
  
  // Communication
  confirmationSentAt?: Date;
  reminderSentAt?: Date;
  followUpSentAt?: Date;
  
  // Feedback
  clientRating?: number;
  clientFeedback?: string;
  consultantNotes?: string;
  
  // Audit Fields
  createdAt: Date;
  updatedAt: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

interface AvailabilitySlot {
  consultantId: string;
  date: Date;
  startTime: string; // HH:mm format
  endTime: string;
  duration: number;
  isAvailable: boolean;
  conflictReason?: 'booked' | 'holiday' | 'blocked' | 'outside_hours';
}

interface WeeklySchedule {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
}

interface DaySchedule {
  isWorkingDay: boolean;
  timeSlots: TimeSlot[];
  breaks: TimeSlot[];
}

interface TimeSlot {
  startTime: string; // HH:mm
  endTime: string;
}
```

## Public Frontend Features

### Booking Landing Page (`/book-consultation`)

#### Page Structure
```tsx
interface BookingPageLayout {
  hero: {
    title: TranslatedText;
    subtitle: TranslatedText;
    valueProposition: string[];
    socialProof?: {
      clientLogos: string[];
      testimonials: Testimonial[];
      statsDisplay: BookingStats;
    };
  };
  
  consultantSelection: {
    displayMode: 'grid' | 'carousel' | 'list';
    showPhotos: boolean;
    showBios: boolean;
    showRatings: boolean;
    showAvailability: boolean;
    filterOptions: ConsultantFilter[];
  };
  
  bookingProcess: {
    stepIndicator: boolean;
    progressSaving: boolean;
    multiStepForm: boolean;
    inlineValidation: boolean;
  };
  
  trustSignals: {
    securityBadges: boolean;
    privacyPolicy: boolean;
    cancellationPolicy: boolean;
    testimonials: boolean;
  };
}
```

### Consultant Selection Interface

#### Consultant Card Component
```tsx
interface ConsultantCardProps {
  consultant: Consultant;
  showAvailability?: boolean;
  showRating?: boolean;
  layout: 'compact' | 'detailed';
}

interface ConsultantCardElements {
  photo: {
    src: string;
    alt: string;
    fallback: string;
    shape: 'circle' | 'square';
  };
  
  basicInfo: {
    name: string;
    title: string;
    expertise: string[];
    languages: string[];
  };
  
  professionalDetails: {
    biography: string; // Truncated for card
    experience: string;
    certifications: string[];
    linkedinUrl?: string;
  };
  
  availability: {
    nextAvailableSlot?: Date;
    availabilityIndicator: 'online' | 'busy' | 'offline';
    responseTime: string; // "Usually responds in 2 hours"
  };
  
  socialProof: {
    rating: number;
    reviewCount: number;
    completedBookings: number;
    recentTestimonial?: string;
  };
  
  actions: {
    primaryCTA: 'Book Now' | 'View Profile';
    secondaryCTA?: 'View Calendar' | 'Learn More';
  };
}
```

#### Filtering & Search
```typescript
interface ConsultantFilters {
  expertise: string[]; // 'AI Strategy', 'Digital Transformation', etc.
  languages: ('en' | 'de')[];
  availability: {
    timeframe: 'today' | 'this-week' | 'next-week' | 'flexible';
    preferredTime: 'morning' | 'afternoon' | 'evening' | 'any';
  };
  meetingType: ('video' | 'phone' | 'in_person')[];
  rating: {
    minimum: number;
  };
  experience: {
    years: 'junior' | 'mid' | 'senior' | 'expert';
  };
}
```

### Multi-Step Booking Process

#### Step 1: Consultant Selection
```typescript
interface ConsultantSelectionStep {
  selectedConsultant?: Consultant;
  alternativeOptions: Consultant[];
  
  selectionCriteria: {
    expertiseMatch: string[];
    availabilityPreference: string;
    languagePreference: 'en' | 'de';
    meetingTypePreference: string;
  };
  
  navigation: {
    canProceed: boolean;
    showComparison: boolean;
    allowMultipleSelection: boolean;
  };
}
```

#### Step 2: Date & Time Selection
```typescript
interface DateTimeSelectionStep {
  consultantId: string;
  
  calendar: {
    displayMode: 'month' | 'week' | 'agenda';
    timezone: string;
    availableSlots: AvailabilitySlot[];
    selectedSlot?: AvailabilitySlot;
  };
  
  preferences: {
    duration: 30 | 60 | 90 | 120; // minutes
    meetingType: 'video' | 'phone' | 'in_person';
    timezone: string;
  };
  
  constraints: {
    earliestDate: Date;
    latestDate: Date;
    excludedDates: Date[];
    workingHoursOnly: boolean;
  };
}
```

#### Step 3: Contact Information
```typescript
interface ContactInformationStep {
  clientInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    company?: string;
    website?: string;
    position?: string;
  };
  
  meetingDetails: {
    subject?: string;
    message?: string;
    preparationMaterials?: string[];
    specialRequirements?: string;
  };
  
  preferences: {
    communicationLanguage: 'en' | 'de';
    reminderPreferences: {
      email: boolean;
      sms: boolean;
      timing: number[]; // days before: [7, 1]
    };
  };
  
  consent: {
    termsAccepted: boolean;
    privacyConsent: boolean;
    marketingConsent?: boolean;
    recordingConsent?: boolean;
  };
}
```

#### Step 4: Confirmation & Summary
```typescript
interface BookingConfirmationStep {
  bookingSummary: {
    consultant: ConsultantSummary;
    datetime: Date;
    duration: number;
    timezone: string;
    meetingType: string;
    client: ClientSummary;
    subject: string;
    reference: string;
  };
  
  nextSteps: {
    confirmationEmail: boolean;
    calendarInvite: boolean;
    preparationMaterials?: string[];
    meetingInstructions: string;
  };
  
  modifications: {
    allowRescheduling: boolean;
    allowCancellation: boolean;
    editDeadline: number; // hours before meeting
  };
  
  integration: {
    addToGoogleCalendar: boolean;
    addToOutlookCalendar: boolean;
    downloadICS: boolean;
  };
}
```

### Calendar Integration

#### Availability Checking
```typescript
interface AvailabilityChecker {
  async checkAvailability(
    consultantId: string,
    date: Date,
    duration: number,
    timezone: string
  ): Promise<AvailabilityResult>;
  
  async getWeeklyAvailability(
    consultantId: string,
    startDate: Date,
    weeks: number
  ): Promise<WeeklyAvailabilityMap>;
  
  async findNextAvailableSlot(
    consultantId: string,
    preferredDuration: number,
    earliestDate: Date,
    timePreference?: 'morning' | 'afternoon' | 'evening'
  ): Promise<AvailabilitySlot | null>;
  
  async getSuggestedTimes(
    consultantId: string,
    requestedDate: Date,
    duration: number
  ): Promise<AvailabilitySlot[]>;
}

interface AvailabilityResult {
  isAvailable: boolean;
  conflicts: CalendarEvent[];
  suggestedAlternatives: AvailabilitySlot[];
  reason?: string;
}
```

#### Calendar Widget
```tsx
interface CalendarWidgetProps {
  consultantId: string;
  selectedDate?: Date;
  selectedTime?: string;
  duration: number;
  timezone: string;
  onSlotSelect: (slot: AvailabilitySlot) => void;
  
  display: {
    view: 'month' | 'week' | 'day';
    showWeekends: boolean;
    highlightToday: boolean;
    showTimezones: boolean;
  };
  
  constraints: {
    minDate: Date;
    maxDate: Date;
    excludeDates: Date[];
    workingHoursOnly: boolean;
  };
  
  localization: {
    language: 'en' | 'de';
    timeFormat: '12h' | '24h';
    weekStartsOn: 0 | 1; // Sunday or Monday
  };
}
```

### Booking Confirmation System

#### Confirmation Page
```tsx
interface ConfirmationPageContent {
  successMessage: {
    headline: TranslatedText;
    subheadline: TranslatedText;
    thankYouNote: TranslatedText;
  };
  
  bookingDetails: {
    reference: string;
    consultant: ConsultantInfo;
    datetime: FormattedDateTime;
    duration: string;
    meetingType: string;
    location: string;
  };
  
  nextSteps: {
    immediateActions: ActionItem[];
    preparationSteps: ActionItem[];
    contactInformation: ContactInfo;
  };
  
  calendarIntegration: {
    googleCalendarButton: boolean;
    outlookCalendarButton: boolean;
    icsDownloadButton: boolean;
    automaticInvite: boolean;
  };
  
  supportOptions: {
    rescheduleLink: string;
    cancelLink: string;
    supportContact: ContactInfo;
    faqLink: string;
  };
}
```

#### Calendar Invite Generation
```typescript
interface CalendarInviteGenerator {
  generateICSFile(booking: Booking): Promise<string>;
  
  generateGoogleCalendarUrl(booking: Booking): string;
  
  generateOutlookUrl(booking: Booking): string;
  
  createEmailInvite(booking: Booking): Promise<EmailInvite>;
}

interface EmailInvite {
  subject: string;
  htmlContent: string;
  textContent: string;
  icsAttachment: Buffer;
  recipients: {
    to: string[];
    cc?: string[];
  };
}
```

## Admin Panel Features

### Booking Management Dashboard

#### Overview Analytics
```typescript
interface BookingDashboard {
  summary: {
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    noShowRate: number;
    averageRating: number;
  };
  
  trends: {
    bookingTrends: TimeSeriesData[];
    conversionRates: ConversionData[];
    consultantPerformance: ConsultantStats[];
  };
  
  recentActivity: {
    newBookings: BookingActivity[];
    upcomingMeetings: BookingActivity[];
    overdueFollowUps: BookingActivity[];
  };
  
  insights: {
    popularTimeSlots: TimeSlotStats[];
    industryBreakdown: IndustryStats[];
    sourceAnalysis: SourceStats[];
    satisfactionMetrics: SatisfactionData;
  };
}
```

### Booking List Management

#### Booking List Interface
```tsx
interface BookingListView {
  filters: {
    dateRange: DateRangeFilter;
    consultant: ConsultantFilter;
    status: StatusFilter;
    source: SourceFilter;
    meetingType: MeetingTypeFilter;
  };
  
  columns: [
    'reference',
    'client',
    'consultant',
    'datetime',
    'duration',
    'status',
    'source',
    'actions'
  ];
  
  sorting: {
    field: string;
    direction: 'asc' | 'desc';
  };
  
  bulkActions: [
    'export',
    'reschedule',
    'cancel',
    'send_reminder',
    'mark_completed'
  ];
  
  pagination: {
    pageSize: 25 | 50 | 100;
    totalCount: number;
    currentPage: number;
  };
}
```

#### Individual Booking Management
```tsx
interface BookingDetailsView {
  booking: Booking;
  
  clientInfo: {
    contactDetails: ContactDetails;
    companyInfo: CompanyInfo;
    bookingHistory: BookingHistory[];
    communicationLog: CommunicationEntry[];
  };
  
  meetingDetails: {
    agenda: string;
    preparationNotes: string;
    meetingUrl: string;
    recordingSettings: RecordingConfig;
  };
  
  actions: {
    reschedule: RescheduleAction;
    cancel: CancelAction;
    sendReminder: ReminderAction;
    addNotes: NotesAction;
    markCompleted: CompletionAction;
  };
  
  integration: {
    calendarSync: CalendarSyncStatus;
    crmSync: CrmSyncStatus;
    emailHistory: EmailHistory[];
  };
  
  analytics: {
    source: string;
    conversionPath: ConversionData[];
    engagementScore: number;
  };
}
```

### Consultant Schedule Management

#### Schedule Editor
```tsx
interface ScheduleEditor {
  consultantId: string;
  
  workingHours: {
    weeklySchedule: WeeklyScheduleEditor;
    exceptions: ScheduleException[];
    timeZone: TimezoneSelector;
  };
  
  availability: {
    bufferTime: BufferTimeSettings;
    maximumAdvanceBooking: number; // days
    minimumAdvanceBooking: number; // hours
    dailyBookingLimit: number;
  };
  
  holidays: {
    scheduledHolidays: Holiday[];
    recurringHolidays: RecurringHoliday[];
    blackoutDates: DateRange[];
  };
  
  meetingPreferences: {
    defaultDuration: number;
    allowedDurations: number[];
    preferredMeetingTypes: string[];
    defaultMeetingLocation: string;
  };
}
```

### Communication Management

#### Email Template System
```typescript
interface EmailTemplateManager {
  templates: {
    bookingConfirmation: {
      subject: TranslatedText;
      htmlTemplate: string;
      textTemplate: string;
      variables: TemplateVariable[];
    };
    
    bookingReminder: {
      subject: TranslatedText;
      htmlTemplate: string;
      timing: number[]; // days before: [7, 1]
    };
    
    bookingCancellation: {
      subject: TranslatedText;
      htmlTemplate: string;
      refundPolicy: string;
    };
    
    followUpRequest: {
      subject: TranslatedText;
      htmlTemplate: string;
      timing: number; // days after meeting
    };
  };
  
  customization: {
    branding: BrandingSettings;
    personalization: PersonalizationRules;
    localization: LocalizationSettings;
  };
}
```

## Automation Features

### Booking Workflow Automation

#### Automated Confirmations
```typescript
interface BookingAutomation {
  confirmationWorkflow: {
    immediateConfirmation: {
      email: boolean;
      sms?: boolean;
      template: 'booking_confirmation';
      calendarInvite: boolean;
    };
    
    consultantNotification: {
      email: boolean;
      slackNotification?: boolean;
      template: 'new_booking_consultant';
      includeClientDetails: boolean;
    };
    
    crmSynchronization: {
      createOdooEvent: boolean;
      updateLeadRecord: boolean;
      setFollowUpReminder: boolean;
    };
  };
  
  reminderWorkflow: {
    clientReminders: [
      {
        timing: 24 * 60; // 24 hours before
        template: '24h_reminder';
        includePreparation: boolean;
      },
      {
        timing: 2 * 60; // 2 hours before
        template: '2h_reminder';
        includeMeetingLink: boolean;
      }
    ];
    
    consultantReminders: [
      {
        timing: 4 * 60; // 4 hours before
        template: 'consultant_prep_reminder';
        includeClientBackground: boolean;
      }
    ];
  };
  
  followUpWorkflow: {
    postMeetingFollowUp: {
      timing: 24 * 60; // 24 hours after
      template: 'post_meeting_followup';
      includeFeedbackRequest: boolean;
      includeNextSteps: boolean;
    };
    
    noShowFollowUp: {
      timing: 60; // 1 hour after missed meeting
      template: 'no_show_followup';
      offerRescheduling: boolean;
    };
  };
}
```

### Calendar Synchronization

#### Real-time Calendar Updates
```typescript
interface CalendarSyncManager {
  syncBookingToCalendar(
    booking: Booking,
    action: 'create' | 'update' | 'cancel'
  ): Promise<SyncResult>;
  
  handleCalendarWebhook(
    consultantId: string,
    event: CalendarEvent,
    action: 'created' | 'updated' | 'deleted'
  ): Promise<void>;
  
  resolveCalendarConflicts(
    consultantId: string,
    proposedSlot: AvailabilitySlot
  ): Promise<ConflictResolution>;
  
  syncAvailabilityChanges(
    consultantId: string,
    changes: ScheduleChange[]
  ): Promise<SyncResult>;
}
```

### Intelligent Scheduling

#### AI-Powered Scheduling Suggestions
```typescript
interface SchedulingIntelligence {
  suggestOptimalTimes(
    consultantId: string,
    clientPreferences: ClientPreferences,
    constraints: SchedulingConstraints
  ): Promise<TimeSlotSuggestion[]>;
  
  predictBookingLikelihood(
    slot: AvailabilitySlot,
    clientProfile: ClientProfile
  ): Promise<number>; // 0-1 probability
  
  optimizeScheduleDistribution(
    consultantId: string,
    timeframe: DateRange
  ): Promise<ScheduleOptimization>;
  
  analyzeBookingPatterns(
    consultantId: string,
    period: 'month' | 'quarter' | 'year'
  ): Promise<BookingPatternAnalysis>;
}
```

## Integration Features

### Google Calendar Integration

#### Bi-directional Synchronization
```typescript
interface GoogleCalendarIntegration {
  createBookingEvent(
    booking: Booking,
    consultantCalendarId: string
  ): Promise<string>; // Returns event ID
  
  updateBookingEvent(
    eventId: string,
    booking: Booking
  ): Promise<boolean>;
  
  cancelBookingEvent(
    eventId: string,
    cancellationReason: string
  ): Promise<boolean>;
  
  getAvailability(
    consultantCalendarId: string,
    timeRange: DateRange
  ): Promise<AvailabilitySlot[]>;
  
  handleWebhookEvent(
    calendarEvent: GoogleCalendarEvent
  ): Promise<void>;
}
```

### CRM Integration (Odoo)

#### Lead and Opportunity Management
```typescript
interface CrmIntegration {
  createLeadFromBooking(
    booking: Booking
  ): Promise<number>; // Returns Odoo lead ID
  
  updateOpportunityStage(
    bookingId: string,
    stage: 'scheduled' | 'completed' | 'follow_up_required'
  ): Promise<boolean>;
  
  createFollowUpActivity(
    bookingId: string,
    activityType: 'call' | 'email' | 'meeting',
    dueDate: Date
  ): Promise<number>; // Returns activity ID
  
  syncBookingNotes(
    bookingId: string,
    notes: string
  ): Promise<boolean>;
}
```

## Analytics & Reporting

### Booking Analytics

#### Performance Metrics
```typescript
interface BookingAnalytics {
  conversionMetrics: {
    landingPageToBooking: number;
    consultantViewToBooking: number;
    calendarViewToBooking: number;
    formStartToCompletion: number;
  };
  
  bookingPatterns: {
    popularTimeSlots: TimeSlotStats[];
    seasonalTrends: SeasonalData[];
    dayOfWeekDistribution: DayStats[];
    durationPreferences: DurationStats[];
  };
  
  clientAnalytics: {
    industryBreakdown: IndustryStats[];
    companySizeDistribution: SizeStats[];
    geographicDistribution: LocationStats[];
    repeatClientRate: number;
  };
  
  consultantPerformance: {
    bookingVolume: ConsultantBookingStats[];
    clientSatisfaction: ConsultantRatingStats[];
    responseTime: ConsultantResponseStats[];
    completionRate: ConsultantCompletionStats[];
  };
}
```

#### Revenue Attribution
```typescript
interface RevenueAnalytics {
  bookingValue: {
    averageClientValue: number;
    conversionToSale: number;
    timeToConversion: number;
    lifetimeValue: number;
  };
  
  sourceAttribution: {
    organicSearch: SourceValue;
    directTraffic: SourceValue;
    referrals: SourceValue;
    socialMedia: SourceValue;
    emailCampaigns: SourceValue;
  };
  
  consultantROI: {
    timeInvestment: number;
    opportunitiesGenerated: number;
    revenueGenerated: number;
    clientRetention: number;
  };
}
```

## Quality Assurance & Testing

### Booking Flow Testing
```typescript
interface BookingFlowTests {
  // Complete Booking Flow
  testSuccessfulBooking: () => void;
  testMultipleConsultantSelection: () => void;
  testTimezoneHandling: () => void;
  testFormValidation: () => void;
  
  // Calendar Integration
  testAvailabilityChecking: () => void;
  testCalendarConflictDetection: () => void;
  testTimezoneConversion: () => void;
  testRecurringAvailability: () => void;
  
  // Email Automation
  testConfirmationEmails: () => void;
  testReminderScheduling: () => void;
  testCalendarInviteGeneration: () => void;
  
  // Edge Cases
  testDoubleBookingPrevention: () => void;
  testCancellationHandling: () => void;
  testReschedulingFlow: () => void;
  testNoShowHandling: () => void;
  
  // Integration Testing
  testGoogleCalendarSync: () => void;
  testOdooIntegration: () => void;
  testEmailDelivery: () => void;
}
```

### Load Testing
```python
class BookingLoadTests:
    def test_concurrent_bookings(self):
        """Test 100 concurrent booking attempts."""
        pass
    
    def test_availability_checking_load(self):
        """Test calendar availability under heavy load."""
        pass
    
    def test_email_automation_load(self):
        """Test email sending capacity."""
        pass
```

## Success Metrics & KPIs

### Business Impact Metrics
- **Booking Conversion Rate**: Website visitors to completed bookings
- **Consultant Utilization**: Percentage of available slots booked
- **Client Satisfaction**: Average rating and feedback scores
- **No-Show Rate**: Percentage of bookings that result in no-shows
- **Lead Quality**: Booking-to-opportunity conversion rate
- **Time to Book**: Average time from first visit to completed booking
- **Revenue Attribution**: Revenue generated from booked consultations
- **Client Retention**: Repeat booking rate

### Technical Performance Metrics
- **Page Load Speed**: <2 seconds for booking pages
- **Availability Check Speed**: <500ms for calendar queries
- **Email Delivery Rate**: >99% successful delivery
- **Calendar Sync Accuracy**: >99.5% successful synchronization
- **Form Completion Rate**: >80% completion once started
- **Mobile Booking Rate**: Percentage of bookings from mobile devices
- **Integration Reliability**: >99% successful CRM synchronization

### User Experience Metrics
- **Booking Flow Abandonment**: Where users drop off in the process
- **Time to Complete Booking**: Average time to complete booking flow
- **Mobile Usability**: Mobile-specific conversion and satisfaction rates
- **Calendar Widget Usage**: Interaction patterns with calendar interface
- **Consultant Selection Patterns**: How users choose consultants
- **Preferred Time Slots**: Most popular booking times and days
- **Support Ticket Volume**: Booking-related support requests

This comprehensive booking specification provides a complete framework for implementing a professional consultation booking system that integrates seamlessly with the broader Magnetiq ecosystem while delivering exceptional user experience and business value.