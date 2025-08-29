# Magnetiq v2 - Public Frontend Specification

## Overview

The public frontend is a responsive, multilingual website that serves as the primary interface for visitors to interact with voltAIc Systems' content and services. It provides access to webinars, whitepapers, consultation booking, and general company information.

**Important**: The public frontend operates without user authentication. All content and features are accessible without registration or login. Administrative functionality is handled separately through the dedicated admin panel at `/frontend/adminpanel/admin.md`.

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
// PortableText structure for multilingual content
interface PortableTextContent {
  en: PortableTextBlock[];
  de?: PortableTextBlock[];
  meta: {
    lastUpdated: string;
    translator?: string;
    aiGenerated?: boolean;
  };
}

// Base PortableText block types
interface PortableTextBlock {
  _type: string;
  _key: string;
}

// Text block with spans
interface TextBlock extends PortableTextBlock {
  _type: 'block';
  style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote';
  children: Span[];
  markDefs?: MarkDefinition[];
  level?: number;
  listItem?: 'bullet' | 'number';
}

// Text span with formatting
interface Span {
  _type: 'span';
  text: string;
  marks?: string[];
}

// Custom blocks for Magnetiq
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

#### Translation Features
- **Manual translations** for critical content
- **AI-generated translations** with ⚡️ indicator
- **Translation memory** for consistency
- **Context-aware translations** based on page type

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
- **Hover effects** with subtle animations
- **Responsive columns**: 1 (mobile) → 2 (tablet) → 3 (desktop)

#### Social Proof
- Client logos
- Testimonials carousel
- Case study highlights
- Industry certifications

### 5. Page Builder System

#### PortableText Content System
```tsx
// PortableText-based page content
interface PageContent {
  content: PortableTextContent; // Main PortableText blocks
  excerpt?: PortableTextContent; // Optional excerpt
  seo: SEOMetadata;
  structuredData?: any; // Auto-generated from PortableText
}

// PortableText renderer configuration
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

#### PortableText Rendering
- **Custom serializers** for each block type
- **Responsive image handling** with srcset
- **Lazy loading** for media blocks
- **SEO optimization** from PortableText structure
- **Performance optimization** with React.memo and useMemo
- **Accessibility features** built into block components

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
  title: Record<string, string>; // Simple multilingual titles
  description: PortableTextContent; // Rich PortableText descriptions
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

2. **Content Sections (PortableText)**
   - Full description as PortableText blocks
   - Learning objectives as structured lists
   - Target audience with rich formatting
   - Prerequisites with conditional rendering
   - Speaker biography with embedded media

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
  title: Record<string, string>; // Simple multilingual titles
  description: PortableTextContent; // Rich PortableText descriptions
  previewContent?: PortableTextContent; // PortableText preview snippets
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
- **Code splitting** by route and PortableText components
- **Lazy loading** for PortableText media blocks and components
- **Tree shaking** for unused PortableText serializers
- **Bundle analysis** and optimization
- **CDN delivery** for PortableText assets and static content
- **Service worker** for caching PortableText content
- **PortableText caching** with intelligent cache invalidation
- **Preload critical PortableText blocks** for better performance

### SEO Requirements with PortableText
- **Meta tags** extracted from PortableText content
- **Open Graph** tags with PortableText excerpts
- **Structured data** (Schema.org markup) auto-generated from PortableText
- **Sitemap** generation including PortableText-based pages
- **Robots.txt** configuration
- **Canonical URLs** for multilingual PortableText content
- **Rich snippets** from PortableText structured content

### Accessibility Standards
- **WCAG 2.1 AA** compliance
- **Keyboard navigation** support
- **Screen reader** compatibility
- **Color contrast** ratios (4.5:1 minimum)
- **Alternative text** for all images
- **Focus indicators** for interactive elements

## PortableText Implementation

### PortableText Renderer Setup

```tsx
// components/PortableText/PortableTextRenderer.tsx
import { PortableText } from '@portabletext/react';
import { PortableTextBlock } from '@portabletext/types';
import { ImageBlock, VideoBlock, CTABlock, CodeBlock } from './blocks';
import { LinkMark, StrongMark, EmMark } from './marks';

interface PortableTextRendererProps {
  content: PortableTextBlock[];
  language?: 'en' | 'de';
  className?: string;
}

// Custom components for PortableText blocks
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
    strike: ({ children }: any) => <s className="line-through">{children}</s>,
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
    h2: ({ children }: any) => (
      <h2 className="text-3xl font-semibold mb-5 text-gray-900 dark:text-white">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        {children}
      </h3>
    ),
    h4: ({ children }: any) => (
      <h4 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white">
        {children}
      </h4>
    ),
    normal: ({ children }: any) => (
      <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
        {children}
      </p>
    ),
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-primary-500 pl-6 py-2 mb-6 italic text-gray-600 dark:text-gray-400">
        {children}
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }: any) => (
      <ul className="list-disc pl-6 mb-4 text-gray-700 dark:text-gray-300">
        {children}
      </ul>
    ),
    number: ({ children }: any) => (
      <ol className="list-decimal pl-6 mb-4 text-gray-700 dark:text-gray-300">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }: any) => <li className="mb-1">{children}</li>,
    number: ({ children }: any) => <li className="mb-1">{children}</li>,
  },
};

export const PortableTextRenderer: React.FC<PortableTextRendererProps> = ({
  content,
  language = 'en',
  className = ''
}) => {
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

### Custom Block Components

```tsx
// components/PortableText/blocks/ImageBlock.tsx
import { useState } from 'react';
import { ImageBlockProps } from '../types';

export const ImageBlock: React.FC<ImageBlockProps> = ({ value }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  
  const { asset, alt, caption, crop, hotspot } = value;
  const imageUrl = `/api/v1/media/${asset._ref}`;
  
  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };
  
  if (hasError) {
    return (
      <div className="bg-gray-200 p-8 text-center rounded-lg mb-6">
        <span className="text-gray-500">Image failed to load</span>
      </div>
    );
  }
  
  return (
    <figure className="mb-6">
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg" />
        )}
        <img
          src={imageUrl}
          alt={alt || 'Image'}
          className="w-full h-auto rounded-lg shadow-md"
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      </div>
      {caption && (
        <figcaption className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center italic">
          {caption}
        </figcaption>
      )}
    </figure>
  );
};

// components/PortableText/blocks/CTABlock.tsx
import { CTABlockProps } from '../types';

export const CTABlock: React.FC<CTABlockProps> = ({ value }) => {
  const { text, url, style = 'primary', size = 'medium' } = value;
  
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const styleClasses = {
    primary: 'bg-primary-600 hover:bg-primary-700 text-white focus:ring-primary-500',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500',
    outline: 'border-2 border-primary-600 text-primary-600 hover:bg-primary-50 focus:ring-primary-500'
  };
  
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    medium: 'px-6 py-3 text-base',
    large: 'px-8 py-4 text-lg'
  };
  
  const className = `${baseClasses} ${styleClasses[style]} ${sizeClasses[size]}`;
  
  return (
    <div className="my-8 text-center">
      <a href={url} className={className}>
        {text}
      </a>
    </div>
  );
};

// components/PortableText/blocks/VideoBlock.tsx
import { VideoBlockProps } from '../types';

export const VideoBlock: React.FC<VideoBlockProps> = ({ value }) => {
  const { url, title, thumbnail, autoplay = false } = value;
  
  // Handle different video sources (YouTube, Vimeo, direct)
  const isYouTube = url.includes('youtube.com') || url.includes('youtu.be');
  const isVimeo = url.includes('vimeo.com');
  
  if (isYouTube || isVimeo) {
    // Embed video players
    const embedUrl = isYouTube 
      ? url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')
      : url.replace('vimeo.com/', 'player.vimeo.com/video/');
    
    return (
      <div className="relative aspect-video mb-6 rounded-lg overflow-hidden shadow-md">
        <iframe
          src={`${embedUrl}${autoplay ? '?autoplay=1' : ''}`}
          title={title || 'Video'}
          className="absolute inset-0 w-full h-full"
          frameBorder="0"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }
  
  // Direct video file
  return (
    <div className="mb-6">
      <video
        controls
        autoPlay={autoplay}
        className="w-full rounded-lg shadow-md"
        poster={thumbnail}
      >
        <source src={url} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {title && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
          {title}
        </p>
      )}
    </div>
  );
};
```

### Multilingual PortableText Hook

```tsx
// hooks/usePortableText.ts
import { useMemo } from 'react';
import { useLanguage } from './useLanguage';
import { PortableTextContent } from '../types/content';

export const usePortableText = (content: PortableTextContent) => {
  const { currentLanguage } = useLanguage();
  
  const resolvedContent = useMemo(() => {
    // Return content for current language with fallback to English
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

### Content API Integration

```tsx
// api/contentApi.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const contentApi = createApi({
  reducerPath: 'contentApi',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api/v1/content/'
  }),
  tagTypes: ['Page', 'Webinar', 'Whitepaper'],
  endpoints: (builder) => ({
    // Get PortableText content
    getPage: builder.query<PageResponse, { id: string; language?: string }>({
      query: ({ id, language = 'en' }) => `pages/${id}`,
      providesTags: ['Page']
    }),
    
    // Get serialized HTML content
    getPageHTML: builder.query<PageHTMLResponse, { id: string; language?: string }>({
      query: ({ id, language = 'en' }) => `pages/${id}/html?language=${language}`,
      providesTags: ['Page']
    }),
    
    // Get serialized Markdown content  
    getPageMarkdown: builder.query<PageMarkdownResponse, { id: string; language?: string }>({
      query: ({ id, language = 'en' }) => `pages/${id}/markdown?language=${language}`,
      providesTags: ['Page']
    }),
    
    // Get webinars with PortableText content
    getWebinars: builder.query<WebinarsResponse, { language?: string }>({
      query: ({ language = 'en' }) => `webinars?language=${language}`,
      providesTags: ['Webinar']
    }),
    
    // Get whitepapers with PortableText content
    getWhitepapers: builder.query<WhitepapersResponse, { language?: string }>({
      query: ({ language = 'en' }) => `whitepapers?language=${language}`,
      providesTags: ['Whitepaper']
    })
  })
});

export const {
  useGetPageQuery,
  useGetPageHTMLQuery,
  useGetPageMarkdownQuery,
  useGetWebinarsQuery,
  useGetWhitepapersQuery
} = contentApi;
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
    portableTextCache: Record<string, PortableTextBlock[]>; // Cached PortableText content
  };
  user: {
    preferences: UserPreferences;
    downloadSession: DownloadSession;
  };
}
```

### API Integration
- **RTK Query** for API calls with PortableText support
- **Automatic caching** with configurable TTL for PortableText content
- **Content serialization** endpoints (HTML/Markdown/Plain Text)
- **Error handling** with user feedback
- **Loading states** for better UX
- **Retry logic** for failed requests
- **PortableText validation** on client-side

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
- **Unit tests** for utilities, hooks, and PortableText serializers
- **Component tests** with React Testing Library for PortableText blocks
- **Integration tests** for user workflows with PortableText content
- **E2E tests** for critical user journeys involving PortableText rendering
- **Visual regression tests** for UI consistency across PortableText components
- **PortableText validation tests** for content structure integrity

### Build Process
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:portable-text": "jest --testPathPattern=portabletext",
    "lint": "eslint src --ext .ts,.tsx",
    "typecheck": "tsc --noEmit",
    "validate-content": "node scripts/validatePortableText.js"
  },
  "dependencies": {
    "@portabletext/react": "^3.0.0",
    "@portabletext/types": "^2.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
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