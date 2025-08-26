# Magnetiq v2 - Public Frontend Specification

## Overview

The public frontend is a responsive, multilingual website that serves as the primary interface for visitors to interact with voltAIc Systems' content and services. It provides access to webinars, whitepapers, consultation booking, and general company information.

## Technical Foundation

### Technology Stack
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Redux Toolkit with RTK Query
- **Routing**: React Router v6
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with TypeScript support
- **Package Manager**: npm

### Development Environment
- **Port**: 3000 (development)
- **Hot Reload**: Vite HMR
- **TypeScript**: Strict mode enabled
- **ESLint**: Airbnb configuration with custom rules
- **Prettier**: Code formatting

## Design System

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

### Typography
- **Headings**: Inter font family
- **Body**: System font stack with fallbacks
- **Code**: JetBrains Mono
- **Scale**: 1.25 modular scale

### Components Library
- Header with navigation
- Footer with multi-column layout
- Card components for content display
- Modal/Dialog system
- Form components with validation
- Button variants and states
- Loading states and skeletons

## Core Features

### 1. Header & Navigation

#### Logo Section
```tsx
interface LogoProps {
  variant: 'light' | 'dark';
  size: 'sm' | 'md' | 'lg';
}
```
- Responsive voltAIc Systems logo
- Dark/light mode variants
- Link to homepage

#### Primary Navigation
- **Dropdown menus** with smooth animations
- **Hover effects** with proper accessibility
- **Mobile hamburger menu** with slide-out drawer
- **Keyboard navigation** support

Menu Structure:
```
Home
Services ▼
  ├── AI Consulting
  ├── Digital Transformation  
  └── Automation Solutions
Solutions ▼
  ├── Industry Solutions
  └── Custom Development
Resources ▼
  ├── Webinars
  ├── Whitepapers
  └── Case Studies
About ▼
  ├── Our Team
  ├── Company Story
  └── Careers
Contact
```

#### Call-to-Action
- **Primary CTA**: "Book Consultation"
- **Secondary CTA**: Language switcher (DE/EN)
- **Utility**: Theme toggle (Light/Dark)

### 2. Theme System

#### Dark/Light Mode Toggle
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
interface TranslatedContent {
  en: ContentType;
  de: ContentType;
  meta: {
    lastUpdated: string;
    translator?: string;
    aiGenerated?: boolean;
  };
}
```

#### Translation Features
- **Manual translations** for critical content
- **AI-generated translations** with ⚡️ indicator
- **Translation memory** for consistency
- **Context-aware translations** based on page type

### 4. Homepage Layout

#### Hero Section
```tsx
interface HeroSection {
  headline: TranslatedText;
  subheadline: TranslatedText;
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
- **Hover effects** with subtle animations
- **Responsive columns**: 1 (mobile) → 2 (tablet) → 3 (desktop)

#### Social Proof
- Client logos
- Testimonials carousel
- Case study highlights
- Industry certifications

### 5. Page Builder System

#### Content Blocks
```tsx
type ContentBlock = 
  | HeroBlock
  | TextBlock  
  | ImageBlock
  | VideoBlock
  | CTABlock
  | TestimonialBlock
  | FeaturesBlock
  | ContactFormBlock;

interface PageContent {
  blocks: ContentBlock[];
  seo: SEOMetadata;
  multilingual: MultilingualContent;
}
```

#### Dynamic Pages
- **Drag-and-drop** page builder (admin only)
- **Reusable components** with props
- **Content versioning** and preview
- **SEO optimization** per page
- **Performance optimization** with lazy loading

## Resource Pages

### 1. Webinars Section (`/webinars`)

#### Overview Page Features
- **Tiled layout** with webinar cards
- **Filtering options**:
  - This week
  - This month  
  - All upcoming
  - Past webinars (archive)
- **Search functionality** by title/topic
- **Sorting options**: Date, popularity, topic

#### Webinar Card Component
```tsx
interface WebinarCard {
  id: string;
  title: TranslatedText;
  description: TranslatedText;
  speaker: Speaker;
  datetime: Date;
  duration: number; // minutes
  timezone: string;
  image: string;
  price?: number;
  capacity?: number;
  registrationCount: number;
  tags: string[];
}
```

Card Features:
- Speaker photo and bio link
- Date/time with timezone handling
- Registration status indicator
- Price display (free/paid)
- Social sharing buttons (LinkedIn focus)
- "Add to Calendar" quick action

#### Webinar Landing Page (`/webinars/{slug}`)

**Page Structure**:
1. **Hero Section**
   - Webinar title and subtitle
   - Speaker photo and credentials
   - Date, time, and duration
   - Registration CTA button

2. **Content Sections**
   - Full description with rich text
   - Learning objectives
   - Target audience
   - Prerequisites (if any)
   - Speaker biography

3. **Registration Section**
   - Price display (with currency)
   - Capacity and current registrations
   - Registration form (modal)
   - Terms and conditions link

4. **Related Content**
   - 4 random upcoming webinars
   - Speaker's other sessions
   - Related resources

5. **Social Sharing**
   - LinkedIn sharing with pre-filled text
   - Twitter sharing option
   - Copy URL functionality

### 2. Whitepapers Section (`/whitepapers`)

#### Features
- **Grid layout** with download cards
- **Filtering by**:
  - Topic/category
  - Publication date
  - Author
- **Search functionality**
- **Download tracking** and analytics

#### Whitepaper Card
```tsx
interface WhitepaperCard {
  id: string;
  title: TranslatedText;
  description: TranslatedText;
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
- Name (required)
- Email (required, validated)
- Company name (required)
- Company website URL (required)
- Phone number (optional)
- How did you hear about us? (optional)
- Terms acceptance checkbox

**Subsequent Downloads**:
- Pre-filled form with session data
- One-click download option
- Session timeout: 90 days

### 3. Consultation Booking (`/book-consultation`)

#### Booking Flow
1. **Consultant Selection**
   - Available consultants with photos
   - Expertise areas and bio
   - Availability indicator
   - Rating/testimonials

2. **Date & Time Selection**
   - Calendar widget with availability
   - Timezone handling
   - Duration selection (30/60/90 minutes)
   - Meeting type (phone/video/in-person)

3. **Contact Information**
   - Personal details form
   - Company information
   - Meeting preferences
   - Special requirements

4. **Confirmation**
   - Booking summary
   - Calendar invites (Google/Outlook)
   - Confirmation email
   - Booking reference number

## Footer Design

### Multi-Column Layout
```
┌──────────────────────────────────────────────────────────┐
│ Column 1: Company     Column 2: Services   Column 3: Resources │
│ - About Us           - AI Consulting      - Knowledge Program   │
│ - Our Team           - Digital Transform  - Whitepapers        │
│ - Careers            - Automation         - Case Studies       │
│ - Contact            - Custom Dev         - Blog               │
│                                                                │
│ Column 4: Legal      Column 5: Social     Column 6: Newsletter │
│ - Privacy Policy     - LinkedIn          - Subscribe           │
│ - Terms of Service   - Twitter           - Updates             │
│ - Cookie Policy      - YouTube           - No spam promise     │
│ - Impressum          - GitHub            - [Email Input]       │
└──────────────────────────────────────────────────────────┘
```

### Special Footer Sections

#### Knowledge Program Section
- **Latest 4 webinars** with mini cards
- **Section title**: "Knowledge Program" (EN) / "Wissensprogramm" (DE)
- **Link to full webinars page**
- **Auto-updates** with upcoming sessions

#### AI Engineering Section  
- **Latest 4 whitepapers** with mini cards
- **Section title**: "AI Engineering" (EN) / "KI Entwicklung" (DE)
- **Link to full whitepapers page**
- **Download counts** and new badges

### Footer Bottom
- Copyright notice
- Legal links (Impressum required for German compliance)
- Language switcher
- Theme toggle
- Back to top button

## Performance Requirements

### Loading Performance
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1

### Optimization Strategies
- **Code splitting** by route
- **Lazy loading** for images and components
- **Tree shaking** for unused code
- **Bundle analysis** and optimization
- **CDN delivery** for static assets
- **Service worker** for caching

### SEO Requirements
- **Meta tags** for all pages
- **Open Graph** tags for social sharing
- **Structured data** (Schema.org markup)
- **Sitemap** generation
- **Robots.txt** configuration
- **Canonical URLs** for multilingual content

### Accessibility Standards
- **WCAG 2.1 AA** compliance
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Color contrast** ratios (4.5:1 minimum)
- **Alternative text** for all images
- **Focus indicators** for interactive elements

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
  };
  user: {
    preferences: UserPreferences;
    downloadSession: DownloadSession;
  };
}
```

### API Integration
- **RTK Query** for API calls
- **Automatic caching** with configurable TTL
- **Error handling** with user feedback
- **Loading states** for better UX
- **Retry logic** for failed requests

## Browser Support

### Target Browsers
- **Chrome**: Last 2 versions
- **Firefox**: Last 2 versions  
- **Safari**: Last 2 versions
- **Edge**: Last 2 versions
- **Mobile Safari**: iOS 14+
- **Chrome Mobile**: Android 8+

### Progressive Enhancement
- **Core functionality** works without JavaScript
- **Enhanced experience** with JavaScript enabled
- **Graceful degradation** for older browsers
- **Polyfills** for missing features

## Development Workflow

### Component Development
```tsx
// Component structure example
interface ComponentProps {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export const Component: FC<ComponentProps> = ({
  variant = 'primary',
  size = 'md',
  children
}) => {
  return (
    <div className={clsx(
      'component-base',
      `component--${variant}`,
      `component--${size}`
    )}>
      {children}
    </div>
  );
};
```

### Testing Strategy
- **Unit tests** for utilities and hooks
- **Component tests** with React Testing Library
- **Integration tests** for user workflows
- **E2E tests** for critical user journeys
- **Visual regression tests** for UI consistency

### Build Process
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit"
  }
}
```

## Deployment Configuration

### Environment Variables
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_API_VERSION=v1

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_CHAT_WIDGET=false

# External Services
VITE_GOOGLE_ANALYTICS_ID=GA-XXXXX-X
VITE_GOOGLE_TAG_MANAGER_ID=GTM-XXXXX
```

### Build Output
- **Static files** optimized for CDN
- **Asset fingerprinting** for cache busting
- **Gzip compression** for text assets
- **Source maps** for debugging (development only)

## Analytics & Tracking

### User Analytics
- **Page views** and session duration
- **User flow** through booking process
- **Download tracking** for whitepapers
- **Webinar registration** conversion rates
- **Search queries** and result clicks

### Performance Monitoring
- **Core Web Vitals** tracking
- **Error reporting** with stack traces
- **API response times** from frontend
- **Bundle size** monitoring
- **Third-party script** impact analysis

## Future Enhancements

### Phase 2 Features
- **Progressive Web App** capabilities
- **Offline content** caching
- **Push notifications** for webinars
- **Advanced search** with filters
- **User accounts** and preferences
- **Content recommendations** based on behavior

### Technical Improvements
- **Micro-frontends** architecture
- **GraphQL** integration
- **Server-side rendering** (Next.js migration)
- **Real-time features** with WebSockets
- **Advanced caching** strategies

## Success Metrics

### User Experience
- **Bounce rate** < 40%
- **Session duration** > 3 minutes
- **Page load speed** score > 90
- **Mobile usability** score > 95
- **Accessibility** score > 95

### Business Impact
- **Lead generation** through downloads
- **Webinar registrations** conversion rate
- **Consultation bookings** completion rate
- **Content engagement** metrics
- **Multi-language adoption** rate