# Magnetiq v2 - Consultant System Specification

## Overview

The Consultant System provides a comprehensive platform for showcasing consultant profiles, enabling discovery and search, facilitating bookings, and integrating consultant-authored content throughout the public frontend. This system serves as the primary interface for visitors to discover and engage with voltAIc Systems' network of expert consultants.

## Consultant Profile System

### 1. Consultant Profile Pages (`/consultants/{slug}`)

#### Profile Overview
Each consultant maintains a comprehensive professional profile showcasing their expertise, credentials, and service offerings.

```tsx
interface ConsultantProfile {
  id: string;
  slug: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    title: string;
    bio: PortableTextContent; // Rich biography content
    profileImage: string;
    galleryImages?: string[]; // Professional photo gallery
  };
  professionalData: {
    linkedinProfile?: LinkedInProfile; // → [LinkedIn Integration](../../integrations/linkedin.md#profile-sync)
    expertiseAreas: ExpertiseArea[];
    certifications: Certification[];
    specializations: string[];
    yearsExperience: number;
    languages: string[];
    location: {
      city: string;
      country: string;
      timezone: string;
    };
  };
  statistics: {
    whitepapersPublished: number; // ← [Content Statistics](../../../backend/api.md#consultant-stats)
    webinarsConducted: number;
    totalAttendees: number;
    averageRating: number;
    totalConsultations: number;
  };
  socialProof: {
    testimonials: Testimonial[]; // → [Testimonial System](./features/testimonials.md)
    clientRating: number;
    endorsements: Endorsement[];
    caseStudies: string[]; // Links to case study content
  };
  contentPortfolio: {
    authoredWhitepapers: string[]; // → [Whitepaper System](./features/whitepapers.md)
    conductedWebinars: string[]; // → [Webinar System](./features/webinars.md)
    blogPosts: string[];
    speakingEngagements: string[];
  };
  availability: {
    isActive: boolean;
    consultationTypes: ConsultationType[]; // → [30-for-30 Service](./features/consultation-booking.md)
    timeSlots: AvailabilitySlot[];
    bookingSettings: BookingConfiguration;
  };
}

interface LinkedInProfile {
  profileUrl: string;
  headline: string;
  summary: string;
  currentPosition: string;
  company: string;
  skills: string[];
  recommendations: number;
  connections: number;
  lastSyncDate: Date;
} // ← Synced via [LinkedIn API](../../integrations/linkedin.md#profile-data)

interface ExpertiseArea {
  name: string;
  category: 'AI' | 'Digital Transformation' | 'Automation' | 'Strategy';
  proficiencyLevel: 'Beginner' | 'Intermediate' | 'Expert' | 'Thought Leader';
  yearsExperience: number;
  certifications?: string[];
}

interface Certification {
  name: string;
  issuer: string;
  dateEarned: Date;
  expiryDate?: Date;
  credentialId?: string;
  verificationUrl?: string;
}

interface Testimonial {
  id: string;
  clientName: string;
  clientTitle: string;
  clientCompany: string;
  rating: number; // 1-5 stars
  content: PortableTextContent;
  dateProvided: Date;
  consultationType: string;
  isVerified: boolean;
} // → Managed via [Admin Panel](../adminpanel/admin.md#testimonial-management)
```

#### Profile Page Layout
**Hero Section:**
- Professional headshot with photo gallery trigger
- Name, title, and current position
- Key expertise areas and certifications
- Average rating and consultation count
- Primary CTA: "Book 30-for-30 Consultation" → [Booking Flow](./features/consultation-booking.md#30-for-30-flow)

**Professional Overview (PortableText):**
- Rich biography with embedded media
- Career highlights and achievements
- Professional philosophy and approach
- Video introduction (optional)

**Statistics Dashboard:**
```tsx
interface StatsDisplay {
  whitepapersPublished: {
    count: number;
    links: string[]; // → Direct links to [Authored Content](./features/whitepapers.md#author-filter)
  };
  webinarsConducted: {
    count: number;
    upcomingSessions: WebinarPreview[];
    pastSessions: WebinarPreview[];
  };
  consultationMetrics: {
    totalConsultations: number;
    averageRating: number;
    satisfactionRate: number;
  };
  engagementData: {
    totalAttendees: number;
    contentDownloads: number;
    followerCount: number;
  };
}
```

**LinkedIn Integration Panel:**
- Synced professional data display
- Current position and company
- Key skills and endorsements
- Professional network size
- Link to full LinkedIn profile → [LinkedIn Integration](../../integrations/linkedin.md#profile-display)

**Expertise & Certifications:**
- Visual expertise matrix
- Industry certifications with verification
- Skill proficiency indicators
- Specialization tags

**Client Testimonials:**
- Rotating testimonial carousel
- Star ratings with detailed feedback
- Client verification badges
- Filter by consultation type

**Content Portfolio:**
- Authored whitepapers with direct download
- Conducted webinars with registration links
- Blog posts and thought leadership content
- Speaking engagement history

**Booking Integration:**
- Real-time availability display
- 30-for-30 service highlighting (€30 consultation)
- Instant booking widget
- Service comparison table

### 2. Consultant Discovery & Search (`/consultants`)

#### Search & Filter Interface
```tsx
interface ConsultantSearchFilters {
  expertiseAreas: string[]; // Multi-select expertise filtering
  industries: string[]; // Industry specialization
  location: {
    city?: string;
    country?: string;
    timezone?: string;
    remoteOnly?: boolean;
  };
  availability: {
    nextAvailable?: 'today' | 'this-week' | 'this-month';
    consultationType?: ConsultationType[];
    timePreference?: 'morning' | 'afternoon' | 'evening';
  };
  experience: {
    minYears?: number;
    certificationRequired?: boolean;
  };
  ratings: {
    minRating?: number;
    minReviews?: number;
  };
  pricing: {
    maxHourlyRate?: number;
    offers30for30?: boolean; // Filter for 30-for-30 service
  };
  languages: string[];
}

interface ConsultantSearchResult {
  consultant: ConsultantProfile;
  matchScore: number; // Algorithm-generated relevance score
  nextAvailableSlot?: Date;
  specialtyMatch: string[]; // Matched expertise areas
  distanceKm?: number; // For location-based searches
} // → Search handled by [Backend Search API](../../backend/api.md#consultant-search)
```

**Search Interface Components:**
- **Advanced Search Bar** with autocomplete for expertise areas
- **Filter Sidebar** with collapsible sections
- **Map View Toggle** for location-based discovery
- **Sort Options**: Relevance, Rating, Availability, Experience, Price
- **Quick Filters**: Available Today, 30-for-30 Service, Top Rated

**Search Results Display:**
- **Card Layout** with consultant previews
- **List View** for detailed comparison
- **Availability Indicators** with next available slot
- **Match Scoring** with expertise alignment
- **Quick Actions**: View Profile, Book Consultation, Save Favorite

#### Featured Consultant Showcases
```tsx
interface FeaturedConsultantSection {
  sectionType: 'trending' | 'top-rated' | 'new-experts' | 'specialist-spotlight';
  consultants: ConsultantProfile[];
  criteria: string; // What makes them featured
  rotationSchedule: 'daily' | 'weekly' | 'monthly';
} // → Managed via [Admin Panel](../adminpanel/admin.md#consultant-promotion)
```

**Showcase Sections:**
- **Trending Consultants**: Most booked this month
- **Top Rated Experts**: Highest client satisfaction
- **New Talent**: Recently joined consultants
- **Specialist Spotlight**: Domain expertise focus

#### Consultant Matching Algorithm
```tsx
interface MatchingCriteria {
  userRequirements: {
    projectType: string;
    industryContext: string;
    timeframe: string;
    budgetRange: string;
    preferredLanguage: string;
  };
  consultantCapabilities: {
    expertiseAlignment: number; // 0-1 relevance score
    availabilityMatch: number;
    experienceLevel: number;
    clientSatisfaction: number;
    pricingFit: number;
  };
  algorithmWeights: {
    expertise: 0.3;
    availability: 0.25;
    rating: 0.2;
    experience: 0.15;
    pricing: 0.1;
  };
} // → Algorithm implemented in [Backend Matching Service](../../backend/api.md#consultant-matching)
```

### 3. 30-for-30 Service Integration

#### Dedicated Service Landing (`/30-for-30`)
**Service Overview:**
- Value proposition for €30 consultation
- Service benefits and guarantees
- Success stories and testimonials
- Consultant availability overview

**Booking Interface:**
```tsx
interface ThirtyForThirtyBooking {
  serviceDetails: {
    price: 30; // Fixed €30 price
    currency: 'EUR';
    duration: 30; // 30 minutes
    deliveryMethod: 'video' | 'phone' | 'in-person';
    included: string[]; // What's included in consultation
    followUpOptions: string[];
  };
  consultantSelection: {
    availableConsultants: ConsultantProfile[];
    selectionCriteria: {
      expertise: string[];
      nextAvailable: Date;
      rating: number;
    };
    autoMatching: boolean; // Algorithm-based selection
  };
  timeSlotBooking: {
    availableSlots: TimeSlot[];
    timezonHandling: boolean;
    bufferTime: number; // Minutes between bookings
    cancellationPolicy: string;
  };
  paymentProcessing: {
    acceptedMethods: PaymentMethod[];
    processingFee: number;
    refundPolicy: string;
    invoiceGeneration: boolean;
  };
} // → Integrates with [Payment Processing](../../integrations/payment.md#stripe-integration)
```

#### Real-time Availability System
```tsx
interface AvailabilityChecker {
  consultantSchedule: {
    workingHours: WorkingHours;
    blockedTimes: TimeBlock[];
    bookedSlots: BookedSlot[];
    bufferTimes: BufferTime[];
  };
  realTimeUpdates: {
    websocketConnection: boolean;
    autoRefresh: number; // Seconds
    conflictResolution: ConflictHandler;
  };
  slotGeneration: {
    slotDuration: 30; // Minutes
    advanceBooking: {
      minHours: 2;
      maxDays: 60;
    };
    holidayCalendar: HolidayConfig[];
  };
} // → Backend integration: [Calendar Service](../../backend/api.md#availability-management)
```

#### Payment Flow Integration
**Booking Steps:**
1. **Consultant Selection** or Algorithm Matching
2. **Time Slot Selection** with real-time availability
3. **Contact Information Collection** for lead capture → [CRM Integration](../../integrations/crm.md#lead-capture)
4. **Payment Processing** via Stripe → [Payment Gateway](../../integrations/payment.md#stripe-checkout)
5. **Booking Confirmation** with calendar invites
6. **Lead Nurturing** email sequence → [Email Automation](../../integrations/smtp-brevo.md#booking-confirmation)

```tsx
interface PaymentFlowData {
  bookingDetails: {
    consultantId: string;
    timeSlot: TimeSlot;
    serviceType: '30-for-30';
    price: number;
  };
  customerInformation: {
    personalDetails: ContactForm;
    companyInformation: CompanyForm;
    consultationGoals: string[];
    communicationPreferences: PreferenceSettings;
  };
  paymentData: {
    stripeSessionId: string;
    paymentIntentId: string;
    invoiceNumber: string;
    taxInformation: TaxData;
  };
  confirmationData: {
    bookingReference: string;
    calendarInvites: CalendarInvite[];
    confirmationEmail: EmailTemplate;
    reminderSchedule: ReminderConfig[];
  };
} // → Payment handled by [Stripe Integration](../../integrations/payment.md#consultation-payments)
```

#### Terms of Service & Booking Confirmation
**Legal Integration:**
- Terms acceptance with version tracking
- Cancellation policy acknowledgment
- Data processing consent → [Privacy Compliance](../../privacy-compliance.md#consultation-data)
- Service level agreement display

**Confirmation System:**
- Instant booking confirmation page
- Email confirmation with details
- Calendar invite generation (Google/Outlook)
- SMS reminder option
- Booking management portal access

### 4. Content Integration with Consultant Profiles

#### Whitepaper-Consultant Integration
```tsx
interface ConsultantContentIntegration {
  authoredContent: {
    whitepapers: {
      consultantId: string;
      authorProfile: ConsultantProfile;
      downloadTrigger: 'profile-view' | 'direct-download';
      leadCapture: boolean;
    }; // → Links to [Whitepaper System](./features/whitepapers.md#author-integration)
  };
  webinarIntegration: {
    conductedSessions: WebinarSession[];
    upcomingSchedule: WebinarPreview[];
    registrationFlow: 'direct' | 'profile-based';
    attendeeFollowUp: boolean;
  }; // → Connects to [Webinar System](./features/webinars.md#consultant-integration)
  contentRecommendations: {
    algorithmType: 'collaborative' | 'content-based' | 'hybrid';
    recommendationSources: RecommendationSource[];
    personalizationLevel: 'basic' | 'advanced';
  }; // → Powered by [Recommendation Engine](../../backend/api.md#content-recommendations)
}
```

#### Direct Content Access
**From Consultant Profiles:**
- **One-click whitepaper downloads** with optional lead capture
- **Direct webinar registration** with pre-filled consultant preference
- **Content series subscriptions** for consultant-specific content
- **Exclusive content access** for consultation clients

**Content Attribution:**
- **Author bylines** linking back to consultant profiles
- **Consultant expertise tagging** on all content
- **Cross-promotion opportunities** between content and consultants
- **Content performance metrics** for consultants → [Analytics Dashboard](../adminpanel/admin.md#consultant-analytics)

#### Related Content Recommendations
```tsx
interface ContentRecommendationEngine {
  userBehavior: {
    viewedProfiles: string[];
    downloadedContent: string[];
    webinarAttendance: string[];
    searchHistory: SearchQuery[];
  };
  consultantConnections: {
    similarExpertise: ConsultantMatch[];
    collaborativeContent: string[];
    topicOverlap: TopicMatch[];
  };
  recommendationTypes: {
    'similar-experts': ConsultantProfile[];
    'related-whitepapers': Whitepaper[];
    'upcoming-webinars': Webinar[];
    'consultant-authored': Content[];
  };
} // → Algorithm in [Backend Recommendation Service](../../backend/api.md#recommendation-algorithm)
```

## Cross-References

### Frontend Integration
- **Main Public Frontend**: [Public Frontend Specification](./public.md)
- **Admin Management**: [Consultant Management Admin](../adminpanel/consultant-management.md)
- **Consultant Signup**: [Consultant Self-Signup Flow](./features/consultant-signup.md)
- **Booking System**: [Book-a-Meeting Feature](./features/book-a-meeting.md)

### Backend Integration
- **API Endpoints**: [Consultant API](../../backend/api.md#consultant-endpoints)
- **Database Schema**: [Consultant Tables](../../backend/database.md#consultant-tables)
- **Search Service**: [Backend Search API](../../backend/api.md#consultant-search)
- **Matching Algorithm**: [Backend Matching Service](../../backend/api.md#consultant-matching)

### Content Integration
- **Whitepapers**: [Whitepaper System](./features/whitepapers.md)
- **Webinars**: [Webinar System](./features/webinars.md)
- **Content Marketing**: [Content Marketing Strategy](../../features/content-marketing.md)

### Third-Party Integrations
- **LinkedIn**: [LinkedIn Integration](../../integrations/linkedin.md)
- **Payment Processing**: [Stripe Integration](../../integrations/payment.md)
- **CRM**: [CRM Integration](../../integrations/crm.md)
- **Email**: [Email Automation](../../integrations/smtp-brevo.md)

### Compliance & Security
- **Privacy**: [Privacy Compliance](../../privacy-compliance.md)
- **Data Protection**: [Security Framework](../../security.md)
- **Terms of Service**: [Legal Documents](../../legal/)