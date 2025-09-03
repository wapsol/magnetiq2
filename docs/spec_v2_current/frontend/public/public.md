# Magnetiq v2 - Public Frontend Specification

## Overview

The public frontend is a responsive, multilingual website that serves as the primary interface for visitors to interact with voltAIc Systems' content and services. It provides access to webinars, whitepapers, consultation booking, and general company information without requiring user authentication.

**Administrative functionality is handled separately through the dedicated admin panel at `/frontend/adminpanel/admin.md`**.

## Technical Foundation

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Content Format**: PortableText for structured content
- **Content Rendering**: @portabletext/react for PortableText serialization
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with TypeScript support
- **Package Manager**: npm

### Development Environment
- **Port**: 8038 (development), 8036 (production)
- **Backend API**: Proxied to port 3036 via Vite proxy
- **Hot Reload**: Vite HMR
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Code formatting

### Responsive Design
- **Mobile First**: 320px+ (small phones)
- **Tablet**: 768px+ (tablets)
- **Desktop**: 1024px+ (laptops)
- **Large Desktop**: 1440px+ (desktop monitors)
- **Ultra Wide**: 1920px+ (large monitors)

### Color Scheme
```css
:root {
  /* Light Mode (Default) */
  --primary-50: #eff6ff;
  --primary-500: #3b82f6;
  --primary-900: #1e3a8a;
  
  /* Dark Mode */
  --dark-bg: #1a1a1a;
  --dark-surface: #2d2d2d;
  --dark-text: #ffffff;
  
  /* Semantic Colors */
  --success: #10b981;
  --warning: #f59e0b;
  --error: #ef4444;
  --info: #3b82f6;
}
```

## Core Features

### 1. Header & Navigation

#### Logo Section
- Responsive voltAIc Systems logo with dark/light mode variants
- Link to homepage

#### Primary Navigation
- **Dropdown menus** with smooth animations and keyboard navigation
- **Mobile hamburger menu** with slide-out drawer

**English Menu Structure:**
```
Home (/)
Services (/services) ▼
  ├── AI Consulting (/services/ai-consulting)
  ├── Digital Transformation (/services/digital-transformation)
  ├── Automation (/services/automation)
  └── Development (/services/development)
Solutions (/solutions) ▼
  ├── Industries (/solutions/industries)
  ├── Technology (/solutions/technology)
  └── Case Studies (/solutions/case-studies)
Resources (/resources) ▼
  ├── Webinars (/resources/webinars)
  ├── Whitepapers (/resources/whitepapers)
  ├── Blog (/resources/blog)
  └── Tools (/resources/tools)
About (/about) ▼
  ├── About Overview (/about)
  ├── Our Story (/about/story)
  ├── Team (/about/team)
  ├── Mission (/about/mission)
  ├── Careers (/about/careers)
  ├── Partners (/about/partners)
  └── News (/about/news)
Contact (/contact) ▼
  ├── Contact Overview (/contact)
  ├── Booking (/contact/booking)
  ├── General (/contact/general)
  ├── Support (/contact/support)
  └── Locations (/contact/locations)
```

**German Routes (with /de prefix):**
All English routes have German equivalents with translated URLs and content.

#### Call-to-Action Elements
- **Primary CTA**: "Book Meeting" → `/contact/booking`
- **Secondary CTA**: Language switcher (DE/EN)  
- **Utility**: Theme toggle (Light/Dark)
- **Admin Access**: Login link in mobile menu → `/auth/login`

### 2. Theme System

```tsx
interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  systemPreference: 'light' | 'dark';
}
```

Features:
- System preference detection
- Persistent user choice in localStorage
- Smooth transitions between themes
- Accessible toggle button with proper labels
- Theme-aware image variants

### 3. Multilingual Support

#### Language Implementation
- **Default Language**: English
- **Secondary Language**: German
- **Fallback Strategy**: English content if German missing
- **URL Strategy**: Path-based (`/de/page`, `/en/page`)
- **SEO**: Proper hreflang tags for search engines

#### Content Structure
```tsx
interface PortableTextContent {
  en: PortableTextBlock[];
  de?: PortableTextBlock[];
  meta: {
    lastUpdated: string;
    translator?: string;
    aiGenerated?: boolean;
  };
}

interface PortableTextBlock {
  _type: string;
  _key: string;
}

interface TextBlock extends PortableTextBlock {
  _type: 'block';
  style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';
  children: Span[];
  markDefs?: MarkDefinition[];
  level?: number;
  listItem?: 'bullet' | 'number';
}

interface CTABlock extends PortableTextBlock {
  _type: 'cta';
  text: string;
  url: string;
  style: 'primary' | 'secondary' | 'outline';
  size: 'small' | 'medium' | 'large';
}

interface ImageBlock extends PortableTextBlock {
  _type: 'image';
  asset: {
    _ref: string;
    _type: 'reference';
  };
  alt: string;
  caption?: string;
  crop?: CropData;
  hotspot?: HotspotData;
}

interface VideoBlock extends PortableTextBlock {
  _type: 'video';
  url: string;
  title?: string;
  thumbnail?: string;
  autoplay?: boolean;
}
```

### 4. Homepage Layout

#### Hero Section
```tsx
interface HeroSection {
  headline: PortableTextContent;
  subheadline: PortableTextContent;
  ctaButtons: CTAButton[];
  backgroundImage?: string;
  videoBackground?: string;
}
```

Features:
- Compelling value proposition
- Multiple CTA buttons with different priorities
- Background video or image support
- Animated text reveals
- Mobile-optimized layout

#### Features Section
- **Grid layout** showcasing key capabilities
- **Icon + title + description** format
- **Responsive columns**: 1 (mobile) → 2 (tablet) → 3 (desktop)

#### Social Proof
- Client logos
- Testimonials carousel
- Case study highlights
- Industry certifications

### 5. Page Builder System

#### PortableText Content System
```tsx
interface PageContent {
  content: PortableTextContent;
  excerpt?: PortableTextContent;
  seo: SEOMetadata;
  structuredData?: any;
}

interface PortableTextComponents {
  types: {
    image: React.ComponentType<ImageBlockProps>;
    video: React.ComponentType<VideoBlockProps>;
    cta: React.ComponentType<CTABlockProps>;
    form: React.ComponentType<FormBlockProps>;
    code: React.ComponentType<CodeBlockProps>;
  };
  marks: {
    link: React.ComponentType<LinkMarkProps>;
    strong: React.ComponentType<StrongMarkProps>;
    em: React.ComponentType<EmMarkProps>;
  };
  block: {
    h1: React.ComponentType<BlockProps>;
    h2: React.ComponentType<BlockProps>;
    h3: React.ComponentType<BlockProps>;
    h4: React.ComponentType<BlockProps>;
    h5: React.ComponentType<BlockProps>;
    h6: React.ComponentType<BlockProps>;
    blockquote: React.ComponentType<BlockProps>;
    normal: React.ComponentType<BlockProps>;
  };
  list: {
    bullet: React.ComponentType<ListProps>;
    number: React.ComponentType<ListProps>;
  };
  listItem: {
    bullet: React.ComponentType<ListItemProps>;
    number: React.ComponentType<ListItemProps>;
  };
}
```

#### PortableText Rendering Features
- **Custom serializers** for each block type
- **Responsive image handling** with srcset
- **Lazy loading** for media blocks
- **SEO optimization** from PortableText structure
- **Performance optimization** with React.memo and useMemo
- **Accessibility features** built into block components
## Consultant Profile System

### 1. Consultant Profiles (`/consultants/{slug}`)

```tsx
interface ConsultantProfile {
  id: string;
  slug: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    title: string;
    bio: PortableTextContent;
    profileImage: string;
    galleryImages?: string[];
  };
  professionalData: {
    linkedinProfile?: LinkedInProfile;
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
    whitepapersPublished: number;
    webinarsConducted: number;
    totalAttendees: number;
    averageRating: number;
    totalConsultations: number;
  };
  availability: {
    isActive: boolean;
    consultationTypes: ConsultationType[];
    timeSlots: AvailabilitySlot[];
    bookingSettings: BookingConfiguration;
  };
}
```

#### Profile Page Layout
- **Hero Section**: Professional headshot, name, title, expertise areas, ratings
- **Professional Overview**: Rich biography with embedded media (PortableText)
- **Statistics Dashboard**: Content and consultation metrics
- **LinkedIn Integration Panel**: Synced professional data
- **Expertise & Certifications**: Visual expertise matrix and certifications
- **Client Testimonials**: Rotating testimonial carousel
- **Content Portfolio**: Authored whitepapers and conducted webinars
- **Booking Integration**: Real-time availability and instant booking widget

### 2. Consultant Discovery (`/consultants`)

```tsx
interface ConsultantSearchFilters {
  expertiseAreas: string[];
  industries: string[];
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
    offers30for30?: boolean;
  };
  languages: string[];
}
```

**Search Interface Components:**
- **Advanced Search Bar** with autocomplete
- **Filter Sidebar** with collapsible sections
- **Map View Toggle** for location-based discovery
- **Sort Options**: Relevance, Rating, Availability, Experience, Price
- **Quick Filters**: Available Today, 30-for-30 Service, Top Rated

### 3. 30-for-30 Service Integration (`/30-for-30`)

```tsx
interface ThirtyForThirtyBooking {
  serviceDetails: {
    price: 30; // Fixed €30 price
    currency: 'EUR';
    duration: 30; // 30 minutes
    deliveryMethod: 'video' | 'phone' | 'in-person';
    included: string[];
    followUpOptions: string[];
  };
  consultantSelection: {
    availableConsultants: ConsultantProfile[];
    selectionCriteria: {
      expertise: string[];
      nextAvailable: Date;
      rating: number;
    };
    autoMatching: boolean;
  };
  paymentProcessing: {
    acceptedMethods: PaymentMethod[];
    processingFee: number;
    refundPolicy: string;
    invoiceGeneration: boolean;
  };
}
```

**Booking Flow:**
1. **Consultant Selection** or Algorithm Matching
2. **Time Slot Selection** with real-time availability
3. **Contact Information Collection** for lead capture
4. **Payment Processing** via Stripe
5. **Booking Confirmation** with calendar invites
6. **Lead Nurturing** email sequence

## Resource Pages

### 1. Webinars Section (`/webinars`)

```tsx
interface WebinarCard {
  id: string;
  title: Record<string, string>;
  description: PortableTextContent;
  speaker: Speaker;
  datetime: Date;
  duration: number;
  timezone: string;
  image: string;
  price?: number;
  capacity?: number;
  registrationCount: number;
  tags: string[];
}
```

#### Features
- **Tiled layout** with webinar cards
- **Filtering options**: This week, This month, All upcoming, Past webinars
- **Search functionality** by title/topic
- **Sorting options**: Date, popularity, topic

#### Webinar Landing Page (`/webinars/{slug}`)
1. **Hero Section**: Title, speaker, date/time, registration CTA
2. **Content Sections**: Full description (PortableText), learning objectives, target audience
3. **Registration Section**: Price, capacity, registration form
4. **Related Content**: Upcoming webinars, speaker sessions
5. **Social Sharing**: LinkedIn, Twitter, copy URL

### 2. Whitepapers Section (`/whitepapers`)

```tsx
interface WhitepaperCard {
  id: string;
  title: Record<string, string>;
  description: PortableTextContent;
  previewContent?: PortableTextContent;
  author: Author;
  publishedDate: Date;
  tags: string[];
  downloadCount: number;
  fileSize: string;
  pageCount: number;
  thumbnail: string;
  fileUrl: string;
}
```

#### Lead Capture Modal
**First Download** (per session):
- Name, Email, Company name, Company website URL (required)
- Phone number, How did you hear about us? (optional)
- Terms acceptance checkbox

**Subsequent Downloads**:
- Pre-filled form with session data
- One-click download option
- Session timeout: 90 days

### 3. Enhanced Consultation Booking (`/book-consultation`)

```tsx
interface BookingServiceOptions {
  thirtyForThirty: {
    price: 30;
    currency: 'EUR';
    duration: 30;
    description: 'Quick consultation for immediate guidance';
    leadCaptureLevel: 'basic';
  };
  standardConsultation: {
    priceRange: [100, 300];
    currency: 'EUR';
    duration: [60, 120];
    description: 'Comprehensive consultation with follow-up';
    leadCaptureLevel: 'detailed';
  };
  projectConsultation: {
    pricing: 'custom';
    duration: 'flexible';
    description: 'Multi-session project consultation';
    leadCaptureLevel: 'enterprise';
  };
}
```

#### Enhanced Lead Capture
```tsx
interface EnhancedLeadCapture {
  personalInformation: {
    firstName: string; // Required
    lastName: string; // Required
    email: string; // Required, validated
    phone: string; // Required for consultations
    linkedinProfile?: string;
    preferredLanguage: 'en' | 'de';
  };
  companyInformation: {
    companyName: string; // Required
    website: string; // Required, validated
    industry: string;
    companySize: CompanySize;
    jobTitle: string;
    department: string;
  };
  consultationContext: {
    projectDescription: string;
    primaryGoals: string[];
    timeframe: string;
    budget: BudgetRange;
    urgencyLevel: 'low' | 'medium' | 'high' | 'urgent';
  };
  communicationPreferences: {
    newsletterSubscription: boolean;
    marketingEmails: boolean;
    followUpConsent: boolean;
    preferredContactMethod: 'email' | 'phone' | 'linkedin';
  };
}
```

## Footer Design

### Multi-Column Layout
```
Column 1: Company     Column 2: Services   Column 3: Resources
- About Us           - AI Consulting      - Knowledge Program
- Our Team           - Digital Transform  - Whitepapers
- Careers            - Automation         - Case Studies
- Contact            - Custom Dev         - Blog

Column 4: Legal      Column 5: Social     Column 6: Newsletter
- Privacy Policy     - LinkedIn          - Subscribe
- Terms of Service   - Twitter           - Updates
- Cookie Policy      - YouTube           - No spam promise
- Impressum          - GitHub            - [Email Input]
```

### Special Footer Sections
- **Knowledge Program Section**: Latest 4 webinars with mini cards
- **AI Engineering Section**: Latest 4 whitepapers with mini cards

## PortableText Implementation

### Custom PortableText Renderer
```tsx
import { PortableText } from '@portabletext/react';
import { PortableTextBlock } from '@portabletext/types';

const portableTextComponents = {
  types: {
    image: ImageBlock,
    video: VideoBlock,
    cta: CTABlock,
    code: CodeBlock,
    form: FormBlock,
  },
  marks: {
    link: LinkMark,
    strong: StrongMark,
    em: EmMark,
    underline: ({ children }: any) => <u className="underline">{children}</u>,
    code: ({ children }: any) => (
      <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
  },
  block: {
    h1: ({ children }: any) => (
      <h1 className="text-4xl font-bold mb-6 text-gray-900 dark:text-white">
        {children}
      </h1>
    ),
    normal: ({ children }: any) => (
      <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        {children}
      </p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary-500 pl-6 py-2 mb-6 italic">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc pl-6 mb-4">{children}</ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal pl-6 mb-4">{children}</ol>
    ),
  },
};

export const PortableTextRenderer: React.FC<{
  content: PortableTextBlock[];
  language?: 'en' | 'de';
  className?: string;
}> = ({ content, language = 'en', className = '' }) => {
  if (!content || !Array.isArray(content)) {
    return null;
  }

  return (
    <div className={`portable-text ${className}`}>
      <PortableText 
        value={content} 
        components={portableTextComponents}
      />
    </div>
  );
};
```

### Multilingual PortableText Hook
```tsx
export const usePortableText = (content: PortableTextContent) => {
  const { currentLanguage } = useLanguage();
  
  const resolvedContent = useMemo(() => {
    return content[currentLanguage as keyof PortableTextContent] || content.en;
  }, [content, currentLanguage]);
  
  return {
    content: resolvedContent,
    hasTranslation: !!content[currentLanguage as keyof PortableTextContent],
    availableLanguages: Object.keys(content).filter(key => key !== 'meta'),
    meta: content.meta
  };
};
```

## State Management

### Redux Store Structure
```tsx
interface RootState {
  app: {
    theme: 'light' | 'dark';
    language: 'en' | 'de';
    loading: boolean;
    error: string | null;
  };
  content: {
    pages: Record<string, PageContent>;
    webinars: WebinarState;
    whitepapers: WhitepaperState;
    portableTextCache: Record<string, PortableTextBlock[]>;
  };
  user: {
    preferences: UserPreferences;
    downloadSession: DownloadSession;
  };
}
```

### Content API Integration
```tsx
export const contentApi = createApi({
  reducerPath: 'contentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/content/'
  }),
  tagTypes: ['Page', 'Webinar', 'Whitepaper'],
  endpoints: (builder) => ({
    getPage: builder.query<PageResponse, { id: string; language?: string }>({
      query: ({ id, language = 'en' }) => `pages/${id}`,
      providesTags: ['Page']
    }),
    getWebinars: builder.query<WebinarsResponse, { language?: string }>({
      query: ({ language = 'en' }) => `webinars?language=${language}`,
      providesTags: ['Webinar']
    }),
    getWhitepapers: builder.query<WhitepapersResponse, { language?: string }>({
      query: ({ language = 'en' }) => `whitepapers?language=${language}`,
      providesTags: ['Whitepaper']
    })
  })
});
```

## Performance & SEO

### Performance Requirements
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1

### Optimization Strategies
- **Code splitting** by route and PortableText components
- **Lazy loading** for PortableText media blocks
- **Tree shaking** for unused PortableText serializers
- **CDN delivery** for static content
- **Service worker** for caching

### SEO with PortableText
- **Meta tags** extracted from PortableText content
- **Open Graph** tags with PortableText excerpts
- **Structured data** auto-generated from PortableText
- **Sitemap** generation including PortableText-based pages
- **Canonical URLs** for multilingual content
- **Rich snippets** from PortableText structured content

### Accessibility Standards
- **WCAG 2.1 AA** compliance
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Color contrast** ratios (4.5:1 minimum)
- **Alternative text** for all images
- **Focus indicators** for interactive elements

## Browser Support
- **Chrome**: Last 2 versions
- **Firefox**: Last 2 versions  
- **Safari**: Last 2 versions
- **Edge**: Last 2 versions
- **Mobile Safari**: iOS 14+
- **Chrome Mobile**: Android 8+

## Integration Points

### Backend Integration
```tsx
interface BackendIntegrationPoints {
  consultantAPI: {
    profileManagement: '/api/v1/consultants';
    availabilityChecking: '/api/v1/availability';
    bookingManagement: '/api/v1/bookings';
    statisticsTracking: '/api/v1/consultant-stats';
  };
  paymentProcessing: {
    stripeIntegration: '/api/v1/payments/stripe';
    invoiceGeneration: '/api/v1/invoices';
    refundProcessing: '/api/v1/refunds';
  };
  contentManagement: {
    whitepaperLinking: '/api/v1/content/whitepapers';
    webinarIntegration: '/api/v1/content/webinars';
    recommendationEngine: '/api/v1/recommendations';
  };
}
```

### External Services
- **LinkedIn API**: Profile sync and content sharing
- **Email Marketing**: Brevo integration for campaigns
- **Analytics**: Google Analytics and custom tracking
- **Communication**: Telegram bot and social platforms

## Success Metrics

### User Experience
- **Bounce rate** < 40%
- **Session duration** > 3 minutes
- **Page load speed** score > 90
- **Mobile usability** score > 95
- **Accessibility** score > 95

### Business Impact
- **Profile view to consultation conversion** > 8%
- **30-for-30 booking completion rate** > 15%
- **Consultant profile engagement time** > 2 minutes
- **Content download from profiles** > 25%
- **Lead generation** through consultant interactions

## Cross-References & Dependencies

### Frontend Integration Points
← **Referenced by**: [Admin Panel](../adminpanel/admin.md#consultant-management), [Backend API](../../backend/api.md#consultant-endpoints), [Database Schema](../../backend/database.md#consultant-tables)
→ **Integrates with**: [Payment Processing](../../integrations/payment.md#consultation-payments), [Email Marketing](../../integrations/smtp-brevo.md#consultant-campaigns), [CRM System](../../integrations/crm.md#consultant-leads)
↔️ **Related Systems**: [LinkedIn Integration](../../integrations/linkedin.md#profile-sync), [Calendar Services](../../integrations/calendar.md), [Analytics Tracking](../../integrations/analytics.md#consultant-metrics)

### Core Dependencies
- [Authentication System](../../security.md#authentication) for consultant profile access
- [Database Models](../../backend/database.md#consultant-schema) for profile data storage
- [File Storage](../../integrations/storage.md) for consultant photos and documents
- [Email Service](../../integrations/smtp-brevo.md) for booking confirmations and follow-ups
- [Stripe Payment Gateway](../../integrations/payment.md#stripe-integration) for 30-for-30 payments
- [Calendar API](../../backend/api.md#calendar-management) for availability management