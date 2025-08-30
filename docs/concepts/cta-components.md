# Magnetiq v2 - CTA Components & Design Patterns

## Overview

This specification defines standardized Call-to-Action (CTA) components and design patterns across the Magnetiq platform. It ensures consistent, high-converting CTA implementation while maintaining design system integrity and optimal user experience across all devices and user contexts.

→ **Implements**: [Conversion Optimization Strategy](./conversion-optimization.md)
← **Supports**: [User Journey Optimization](./user-journey-maps.md), [Friction Reduction](./friction-reduction-strategies.md)
⚡ **Dependencies**: [Design System](../spec_v2/frontend/design-system.md), [Component Library](../spec_v2/frontend/public/public.md#components)

## Quick Links
→ **Conversion Strategy**: [Master Optimization Plan](./conversion-optimization.md)
→ **Journey Maps**: [User Flow Integration](./user-journey-maps.md)
→ **Analytics**: [CTA Performance Tracking](../spec_v2/backend/analytics.md#cta-metrics)
→ **A/B Testing**: [CTA Testing Framework](../spec_v2/backend/testing.md#cta-testing)
→ **Frontend Implementation**: [React Components](../spec_v2/frontend/public/public.md#cta-components)

## CTA Hierarchy & Classification

### Primary CTAs (Revenue-Driving Actions)

#### Book Consultation CTA
```tsx
interface BookConsultationCTA {
  variants: {
    hero: {
      text: "Book Expert Consultation";
      style: "primary-large";
      placement: "hero-center";
      urgency: "medium";
    };
    consultant_profile: {
      text: "Book with [Consultant Name]";
      style: "primary-medium";
      placement: "profile-action";
      urgency: "high";
    };
    content_page: {
      text: "Discuss This Topic";
      style: "primary-medium";
      placement: "content-end";
      urgency: "low";
    };
  };
  personalization: {
    firstTime: "Explore 30-Min Consultations";
    returning: "Book Your Next Session";
    highIntent: "Schedule Now";
  };
}
```

#### Join as Consultant CTA
```tsx
interface ConsultantSignupCTA {
  variants: {
    hero: {
      text: "Share Your Expertise";
      style: "secondary-large";
      placement: "hero-secondary";
      targeting: "consultant-traffic";
    };
    linkedin_targeted: {
      text: "Monetize Your LinkedIn Network";
      style: "primary-large";
      placement: "hero-center";
      urgency: "medium";
    };
    consultant_page: {
      text: "Join Our Expert Network";
      style: "primary-medium";
      placement: "page-header";
      urgency: "low";
    };
  };
  linkedinIntegration: {
    preText: "Already on LinkedIn?";
    mainText: "Import & Launch in 2 Minutes";
    postText: "No complex setup required";
  };
}
```

### Secondary CTAs (Supporting Conversions)

#### Content Download CTAs
```tsx
interface ContentDownloadCTA {
  whitepaper: {
    text: "Download Insights";
    style: "secondary-medium";
    formIntegration: "progressive-profiling";
    followUp: "consultant-recommendation";
  };
  webinar: {
    text: "Reserve Your Spot";
    style: "accent-medium";
    urgency: "high";
    socialProof: "attendee-count";
  };
  caseStudy: {
    text: "Read Success Story";
    style: "text-link";
    placement: "inline-content";
    tracking: "content-engagement";
  };
}
```

#### Engagement CTAs
```tsx
interface EngagementCTA {
  getUpdates: {
    text: "Get Expert Insights";
    style: "outline-medium";
    placement: "content-sidebar";
    frequency: "weekly-announcements";
  };
  followConsultant: {
    text: "Follow [Consultant]";
    style: "text-small";
    socialIntegration: "linkedin-connect";
    placement: "consultant-card";
  };
}
```

### Micro-CTAs (Low-Commitment Actions)

#### Discovery CTAs
```tsx
interface MicroCTA {
  viewProfile: {
    text: "View Expertise";
    style: "ghost-small";
    placement: "consultant-card";
    action: "profile-modal";
  };
  readMore: {
    text: "Continue Reading";
    style: "text-link";
    placement: "content-preview";
    tracking: "content-depth";
  };
  watchDemo: {
    text: "See How It Works";
    style: "ghost-medium";
    placement: "feature-explanation";
    media: "video-modal";
  };
}
```

## Design System Integration

### Visual Design Specifications

#### Button Styles & States
```tsx
interface CTAButtonStyles {
  primary: {
    default: {
      backgroundColor: "var(--primary-600)";
      color: "var(--white)";
      borderRadius: "var(--radius-md)";
      fontSize: "var(--text-base)";
      fontWeight: "var(--font-semibold)";
      padding: "12px 24px";
      minHeight: "44px"; // Touch target
    };
    hover: {
      backgroundColor: "var(--primary-700)";
      transform: "translateY(-1px)";
      boxShadow: "var(--shadow-md)";
    };
    active: {
      backgroundColor: "var(--primary-800)";
      transform: "translateY(0)";
    };
    disabled: {
      backgroundColor: "var(--gray-300)";
      color: "var(--gray-500)";
      cursor: "not-allowed";
    };
  };
  
  secondary: {
    default: {
      backgroundColor: "transparent";
      color: "var(--primary-600)";
      border: "2px solid var(--primary-600)";
      borderRadius: "var(--radius-md)";
      padding: "10px 22px"; // Account for border
    };
    hover: {
      backgroundColor: "var(--primary-50)";
      borderColor: "var(--primary-700)";
    };
  };
  
  accent: {
    default: {
      backgroundColor: "var(--accent-500)";
      color: "var(--white)";
      borderRadius: "var(--radius-md)";
      fontSize: "var(--text-sm)";
      fontWeight: "var(--font-medium)";
    };
  };
}
```

#### Size Variations
```tsx
interface CTASizes {
  small: {
    padding: "8px 16px";
    fontSize: "var(--text-sm)";
    minHeight: "32px";
  };
  medium: {
    padding: "12px 24px";
    fontSize: "var(--text-base)";
    minHeight: "44px";
  };
  large: {
    padding: "16px 32px";
    fontSize: "var(--text-lg)";
    minHeight: "52px";
  };
  extraLarge: {
    padding: "20px 40px";
    fontSize: "var(--text-xl)";
    minHeight: "60px";
  };
}
```

### Responsive Design Patterns

#### Mobile-First CTA Design
```tsx
interface ResponsiveCTABehavior {
  mobile: {
    stickyBottom: {
      position: "fixed";
      bottom: "16px";
      left: "16px";
      right: "16px";
      zIndex: "1000";
      backdropFilter: "blur(8px)";
      backgroundColor: "rgba(255, 255, 255, 0.95)";
      padding: "16px";
      borderRadius: "var(--radius-lg)";
      boxShadow: "var(--shadow-xl)";
    };
    thumbZone: {
      placement: "bottom-third-screen";
      minTouchTarget: "44px";
      spacing: "16px-minimum";
    };
    stackedLayout: {
      primary: "full-width";
      secondary: "below-primary";
      spacing: "12px";
    };
  };
  
  tablet: {
    adaptiveLayout: {
      portrait: "mobile-patterns";
      landscape: "desktop-patterns";
    };
    flexibleSizing: {
      minWidth: "120px";
      maxWidth: "280px";
      adaptive: true;
    };
  };
  
  desktop: {
    inlineFlow: {
      horizontal: "side-by-side";
      spacing: "16px";
      alignment: "center";
    };
    hoverStates: {
      enhanced: true;
      animations: "smooth-transitions";
      feedbackDelays: "immediate";
    };
  };
}
```

## Context-Aware CTA Patterns

### Page-Specific Implementations

#### Homepage CTAs
```tsx
interface HomepageCTALayout {
  hero: {
    primary: "Book Expert Consultation";
    secondary: "Explore Consultants";
    placement: "center-aligned";
    emphasis: "primary-large-secondary-medium";
  };
  
  valueProposition: {
    consultants: "Join Expert Network";
    clients: "Find Your Expert";
    placement: "section-specific";
    context: "benefit-focused";
  };
  
  socialProof: {
    text: "Trusted by 500+ Business Leaders";
    cta: "See Success Stories";
    placement: "below-testimonials";
    style: "text-link";
  };
}
```

#### Consultant Profile CTAs
```tsx
interface ConsultantProfileCTA {
  primaryAction: {
    text: "Book with [Consultant Name]";
    placement: "profile-header";
    style: "primary-large";
    availability: "real-time-status";
  };
  
  secondaryActions: {
    viewCalendar: "Check Availability";
    readContent: "View Publications";
    connectLinkedIn: "Connect on LinkedIn";
    placement: "action-row";
    style: "secondary-small";
  };
  
  socialProof: {
    rating: "★★★★★ 4.9 (47 reviews)";
    bookings: "152 consultations completed";
    placement: "below-primary-cta";
  };
}
```

#### Content Page CTAs
```tsx
interface ContentPageCTA {
  whitepaper: {
    download: {
      text: "Download Full Report";
      placement: "content-header";
      style: "primary-medium";
      formModal: "progressive-profiling";
    };
    related: {
      text: "Discuss with Expert";
      placement: "content-end";
      style: "secondary-medium";
      consultantMatch: "topic-expertise";
    };
  };
  
  webinar: {
    register: {
      text: "Reserve Your Spot";
      placement: "hero-center";
      style: "accent-large";
      urgency: "[X] spots remaining";
    };
    related: {
      text: "1-on-1 Follow-up Available";
      placement: "registration-confirmation";
      style: "text-link";
    };
  };
}
```

## Personalization & Dynamic Content

### Behavioral Targeting

#### New vs. Returning Visitors
```tsx
interface VisitorPersonalization {
  firstTime: {
    emphasis: "education-and-trust";
    ctaText: "Explore How It Works";
    placement: "prominent-but-not-aggressive";
    supportingContent: "value-proposition-heavy";
  };
  
  returning: {
    emphasis: "direct-action";
    ctaText: "Book Your Next Session";
    placement: "immediate-access";
    supportingContent: "personalized-recommendations";
  };
  
  highEngagement: {
    emphasis: "premium-access";
    ctaText: "Get Priority Booking";
    placement: "exclusive-positioning";
    supportingContent: "advanced-features";
  };
}
```

#### Traffic Source Optimization
```tsx
interface TrafficSourceCTA {
  linkedinTraffic: {
    consultant: {
      text: "Import LinkedIn & Start Earning";
      style: "linkedin-branded";
      placement: "hero-primary";
    };
    client: {
      text: "Find Experts from Your Network";
      style: "networking-focused";
      placement: "social-proof-section";
    };
  };
  
  seoTraffic: {
    educational: {
      text: "Learn More About [Topic]";
      style: "discovery-oriented";
      placement: "content-integrated";
    };
    commercial: {
      text: "Get Expert Help Now";
      style: "solution-focused";
      placement: "problem-solution-match";
    };
  };
  
  directTraffic: {
    brandAware: {
      text: "Book Consultation";
      style: "direct-action";
      placement: "immediate-access";
    };
  };
}
```

### AI-Powered Personalization

#### Dynamic CTA Generation
```tsx
interface DynamicCTALogic {
  consultantMatching: {
    algorithm: "expertise-behavior-match";
    display: "Book with [Best Match Name]";
    fallback: "Find Your Expert";
    confidence: "minimum-70-percent";
  };
  
  contentRecommendation: {
    behavior: "previous-downloads";
    display: "Download Related: [Topic]";
    crossSell: "Discuss with [Topic Expert]";
    timing: "post-engagement";
  };
  
  urgencyModulation: {
    highIntent: "spots-remaining";
    mediumIntent: "popular-choice";
    lowIntent: "educational-approach";
    signals: ["time-on-page", "scroll-depth", "return-visits"];
  };
}
```

## Animation & Interaction Design

### Micro-Interactions

#### Hover & Focus States
```tsx
interface CTAInteractions {
  hover: {
    scaleTransform: "scale(1.02)";
    shadowElevation: "0 4px 12px rgba(0,0,0,0.15)";
    colorTransition: "background-color 0.2s ease";
    cursor: "pointer";
  };
  
  focus: {
    outline: "2px solid var(--primary-400)";
    outlineOffset: "2px";
    accessibility: "high-contrast-mode-support";
  };
  
  active: {
    scaleTransform: "scale(0.98)";
    duration: "0.1s";
    feedback: "immediate";
  };
  
  loading: {
    spinner: "inline-loading-indicator";
    text: "Processing...";
    disabled: true;
    duration: "user-feedback-critical";
  };
}
```

#### Entry Animations
```tsx
interface CTAAnimations {
  pageLoad: {
    hero: {
      animation: "fade-up";
      delay: "300ms";
      duration: "600ms";
      easing: "ease-out";
    };
    secondary: {
      animation: "fade-in";
      delay: "500ms";
      duration: "400ms";
    };
  };
  
  scrollTrigger: {
    stickyMobile: {
      trigger: "scroll-past-hero";
      animation: "slide-up";
      duration: "300ms";
    };
    contentCTA: {
      trigger: "element-in-viewport";
      animation: "fade-scale";
      threshold: "50%";
    };
  };
  
  exitIntent: {
    modal: {
      trigger: "mouse-leave-top";
      animation: "modal-slide-down";
      content: "last-chance-offer";
    };
  };
}
```

## Accessibility & Inclusive Design

### WCAG 2.1 AA Compliance

#### Color & Contrast
```tsx
interface CTAAccessibility {
  colorContrast: {
    primary: "4.5:1-minimum";
    secondary: "4.5:1-minimum";
    disabled: "3:1-minimum";
    testing: "automated-contrast-checking";
  };
  
  colorBlindness: {
    support: "deuteranopia-protanopia-tritanopia";
    indicators: "not-color-only";
    alternatives: "text-icons-patterns";
  };
  
  highContrast: {
    mode: "system-preference-detection";
    fallback: "manual-toggle";
    styles: "enhanced-visibility";
  };
}
```

#### Keyboard Navigation
```tsx
interface KeyboardAccessibility {
  tabOrder: {
    sequence: "logical-reading-order";
    skipLinks: "main-content-navigation";
    trapFocus: "modal-contexts";
  };
  
  activation: {
    enter: "primary-activation";
    space: "alternative-activation";
    escape: "modal-dismiss";
  };
  
  visualFeedback: {
    focusVisible: "clear-focus-indicators";
    activeStates: "pressed-indication";
    disabled: "unavailable-styling";
  };
}
```

#### Screen Reader Support
```tsx
interface ScreenReaderOptimization {
  ariaLabels: {
    descriptive: "Book consultation with [Expert Name]";
    context: "Opens booking modal";
    state: "button expanded/collapsed";
  };
  
  liveRegions: {
    loading: "aria-live=polite";
    errors: "aria-live=assertive";
    success: "aria-live=polite";
  };
  
  semanticHTML: {
    buttons: "button-element";
    links: "anchor-element";
    forms: "form-controls";
  };
}
```

## Performance Optimization

### Loading & Rendering

#### Critical CTA Performance
```tsx
interface CTAPerformance {
  criticalPath: {
    aboveFold: "inline-css";
    priority: "preload-fonts";
    render: "blocking-eliminated";
  };
  
  lazyLoading: {
    belowFold: "intersection-observer";
    images: "progressive-enhancement";
    animations: "reduced-motion-respect";
  };
  
  caching: {
    staticAssets: "long-term-cache";
    dynamic: "stale-while-revalidate";
    cdn: "global-distribution";
  };
}
```

### Bundle Optimization
```tsx
interface CTABundleStrategy {
  codesplitting: {
    criticalCTA: "main-bundle";
    modals: "dynamic-import";
    animations: "conditional-loading";
  };
  
  treeshaking: {
    unusedStyles: "eliminated";
    deadCode: "removed";
    dependencies: "optimized";
  };
}
```

## Testing & Optimization Framework

### A/B Testing Structure

#### Test Categories
```tsx
interface CTATestingFramework {
  visual: {
    colorVariations: ["primary", "accent", "green", "orange"];
    sizeVariations: ["medium", "large", "extra-large"];
    styleVariations: ["filled", "outlined", "ghost"];
  };
  
  content: {
    textVariations: ["action-focused", "benefit-focused", "urgency-focused"];
    lengthVariations: ["short", "medium", "descriptive"];
    personalization: ["generic", "personalized", "dynamic"];
  };
  
  placement: {
    positionTests: ["header", "sidebar", "inline", "sticky"];
    timingTests: ["immediate", "delayed", "scroll-triggered"];
    contextTests: ["beginning", "middle", "end"];
  };
}
```

#### Success Metrics
```tsx
interface CTAMetrics {
  primary: {
    clickThroughRate: "percentage-clicks-views";
    conversionRate: "percentage-conversions-clicks";
    revenuePerVisitor: "total-revenue-visitors";
  };
  
  secondary: {
    engagementTime: "time-before-click";
    abandonment: "exit-without-interaction";
    multipleClicks: "repeat-interactions";
  };
  
  qualitative: {
    userFeedback: "post-interaction-surveys";
    heatmapAnalysis: "click-interaction-patterns";
    usabilityTesting: "task-completion-rates";
  };
}
```

## Implementation Guidelines

### Development Standards

#### Component Architecture
```tsx
interface CTAComponent {
  props: {
    variant: 'primary' | 'secondary' | 'accent' | 'ghost';
    size: 'small' | 'medium' | 'large' | 'extra-large';
    onClick: () => void;
    loading?: boolean;
    disabled?: boolean;
    icon?: ReactNode;
    children: ReactNode;
    analytics?: AnalyticsProps;
  };
  
  accessibility: {
    ariaLabel?: string;
    ariaDescribedBy?: string;
    role?: string;
  };
  
  responsive: {
    mobile?: Partial<CTAProps>;
    tablet?: Partial<CTAProps>;
    desktop?: Partial<CTAProps>;
  };
}
```

#### Analytics Integration
```tsx
interface CTAAnalytics {
  tracking: {
    event: "cta_click";
    category: "conversion";
    label: string;
    value?: number;
  };
  
  context: {
    page: string;
    placement: string;
    variant: string;
    userSegment: string;
  };
  
  attribution: {
    source: string;
    medium: string;
    campaign: string;
    content: string;
  };
}
```

### Quality Assurance

#### Testing Checklist
- **Visual Regression**: Automated screenshot comparison
- **Cross-Browser**: IE11+, Chrome, Firefox, Safari, Edge
- **Device Testing**: iOS Safari, Android Chrome, responsive breakpoints
- **Accessibility**: Screen reader testing, keyboard navigation
- **Performance**: Load time impact, bundle size analysis
- **Analytics**: Event tracking verification, conversion attribution

## Cross-References Summary

### Core Dependencies
← **Design Foundation**: [Design System](../spec_v2/frontend/design-system.md)
→ **Implementation**: [Frontend Components](../spec_v2/frontend/public/public.md#cta-components)
⚡ **Analytics**: [Conversion Tracking](../spec_v2/backend/analytics.md#cta-metrics)

### Optimization Integration
↔️ **Conversion Strategy**: [Master Optimization Plan](./conversion-optimization.md)
↔️ **User Journeys**: [Journey Mapping](./user-journey-maps.md)
↔️ **Friction Reduction**: [Optimization Tactics](./friction-reduction-strategies.md)

### Feature Applications
← **Booking System**: [Book-a-Meeting CTAs](../spec_v2/frontend/public/features/book-a-meeting.md)
← **Consultant Signup**: [Signup CTAs](../spec_v2/frontend/public/features/consultant-signup.md)
← **Content Marketing**: [Download CTAs](../spec_v2/frontend/public/features/whitepapers.md)
← **Engagement Platform**: [Registration CTAs](../spec_v2/frontend/public/features/webinars.md)

This CTA component specification provides a comprehensive foundation for implementing high-converting, accessible, and consistent call-to-action elements across the entire Magnetiq platform while supporting continuous optimization and testing.