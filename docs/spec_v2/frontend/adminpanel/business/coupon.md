# Magnetiq v2 - Coupon Management Admin Interface

## Overview

The Coupon Management interface provides administrators with comprehensive tools to create, manage, and analyze promotional coupons for book-a-meeting and 30-for-30 consultation services. This interface enables marketing campaigns, customer acquisition, and revenue optimization through strategic discount management.

→ **Backend Integration**: [Coupon APIs](../../backend/api.md#coupon-management)
← **Database Schema**: [Coupon Tables](../../backend/database.md#coupon--discount-management)
⚡ **Dependencies**: [Payment Processing](./payment.md), [Analytics Dashboard](./analytics-dashboard.md)

This specification covers:
- **Coupon Creation & Management**: Creating and configuring promotional codes with advanced targeting
- **Usage Analytics**: Comprehensive performance tracking and conversion analysis
- **Fraud Prevention**: Security measures and suspicious activity detection
- **Campaign Management**: Organizing coupons into marketing campaigns with attribution tracking
- **Bulk Operations**: Efficient management of multiple coupons and mass operations

## Technical Foundation

### Technology Integration
- **Framework**: React 18 with TypeScript
- **State Management**: Redux Toolkit with RTK Query for coupon data
- **Forms**: React Hook Form with Zod validation for coupon creation
- **Tables**: TanStack Table v8 for coupon listings and analytics
- **Charts**: Recharts for usage analytics and performance visualization
- **Date Handling**: date-fns for validity periods and usage tracking
- **Notifications**: Toast notifications for coupon operations feedback

### API Integration Endpoints
```typescript
// Primary coupon management endpoints
const couponApiEndpoints = {
  // CRUD Operations
  listCoupons: 'GET /api/v1/admin/coupons',
  createCoupon: 'POST /api/v1/admin/coupons',
  getCoupon: 'GET /api/v1/admin/coupons/{id}',
  updateCoupon: 'PUT /api/v1/admin/coupons/{id}',
  deleteCoupon: 'DELETE /api/v1/admin/coupons/{id}',
  
  // State Management
  activateCoupon: 'POST /api/v1/admin/coupons/{id}/activate',
  deactivateCoupon: 'POST /api/v1/admin/coupons/{id}/deactivate',
  
  // Analytics & Reporting
  getCouponAnalytics: 'GET /api/v1/admin/coupons/{id}/analytics',
  getSystemAnalytics: 'GET /api/v1/admin/coupons/analytics/summary',
  getCouponUsage: 'GET /api/v1/admin/coupons/{id}/usage',
  
  // Fraud & Security
  getFraudReports: 'GET /api/v1/admin/coupons/fraud-detection',
  flagSuspiciousUser: 'POST /api/v1/admin/coupons/fraud/flag-user',
  
  // Bulk Operations
  bulkCreateCoupons: 'POST /api/v1/admin/coupons/bulk'
};
```

## Main Coupon Management Interface

### Page Layout Structure
```
┌─────────────────────────────────────────────────────────────┐
│                      Page Header                            │
│  Coupons  |  📊 Dashboard  |  📈 Analytics  |  🔒 Security  │
├─────────────────────────────────────────────────────────────┤
│  🔍 Search & Filters                     [+ Create Coupon]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│               Coupons Data Table                            │
│  Code    | Type | Value | Status | Usage | Revenue | Actions│
│  ────────|------|-------|--------|-------|---------|────────│
│  FREE2024| Free | 100%  | Active |  45/∞ | $1,350  | [📝][📊]│
│  SAVE30  | %    | 30%   | Active |  23/50| $2,100  | [📝][📊]│
│  NEW15   | $    | $15   | Expired|  12/25| $180    | [📝][📊]│
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Navigation Tabs
1. **📊 Dashboard**: Overview metrics and quick actions
2. **📈 Analytics**: Detailed performance analysis and reporting
3. **🔒 Security**: Fraud prevention and risk management
4. **📋 Bulk Operations**: Mass coupon management tools

### Coupons Data Table

#### Table Columns
```typescript
interface CouponTableColumn {
  id: 'code' | 'discount_type' | 'discount_value' | 'status' | 'usage' | 'revenue' | 'conversion' | 'created' | 'expires' | 'actions';
  label: string;
  sortable: boolean;
  filterable: boolean;
  width?: string;
}

const couponColumns: CouponTableColumn[] = [
  { id: 'code', label: 'Code', sortable: true, filterable: true, width: '120px' },
  { id: 'discount_type', label: 'Type', sortable: true, filterable: true, width: '80px' },
  { id: 'discount_value', label: 'Value', sortable: true, filterable: false, width: '80px' },
  { id: 'status', label: 'Status', sortable: true, filterable: true, width: '100px' },
  { id: 'usage', label: 'Usage', sortable: true, filterable: false, width: '100px' },
  { id: 'revenue', label: 'Revenue', sortable: true, filterable: false, width: '100px' },
  { id: 'conversion', label: 'Conversion', sortable: true, filterable: false, width: '100px' },
  { id: 'created', label: 'Created', sortable: true, filterable: false, width: '100px' },
  { id: 'expires', label: 'Expires', sortable: true, filterable: true, width: '100px' },
  { id: 'actions', label: 'Actions', sortable: false, filterable: false, width: '120px' }
];
```

#### Status Indicators
- **🟢 Active**: Coupon is currently valid and accepting redemptions
- **🔴 Inactive**: Coupon is disabled by admin
- **⏰ Scheduled**: Coupon will become active in the future
- **💀 Expired**: Coupon has passed its expiration date
- **🚫 Limit Reached**: Maximum usage count has been reached
- **⚠️ Flagged**: Coupon has suspicious activity patterns

#### Advanced Filtering System
```typescript
interface CouponFilters {
  status: 'all' | 'active' | 'inactive' | 'expired' | 'scheduled';
  discountType: 'all' | 'percentage' | 'fixed_amount' | 'free_session';
  applicableTo: 'all' | 'book_a_meeting' | '30_for_30' | 'specific_consultants';
  campaign: string | null; // Campaign source filter
  dateRange: {
    from: Date | null;
    to: Date | null;
    field: 'created' | 'expires' | 'lastUsed';
  };
  usageRange: {
    min: number | null;
    max: number | null;
  };
  revenueRange: {
    min: number | null;
    max: number | null;
  };
  search: string; // Code, internal name, or description search
}
```

## Coupon Creation & Editing

### Create/Edit Coupon Modal

#### Form Structure
```typescript
interface CreateCouponForm {
  // Basic Information
  code: string; // Auto-generated or custom
  internal_name: string;
  description: {
    en: string;
    de?: string;
  };
  
  // Discount Configuration
  discount_type: 'percentage' | 'fixed_amount' | 'free_session';
  discount_value: number;
  max_discount_amount?: number; // Cap for percentage discounts
  minimum_order_value: number;
  
  // Usage Limits
  max_uses_total?: number; // null = unlimited
  max_uses_per_user: number;
  
  // Validity Period
  valid_from: Date;
  valid_until?: Date; // null = no expiration
  
  // Service Targeting
  applicable_to: 'all' | 'book_a_meeting' | '30_for_30' | 'specific_consultants' | 'first_time_users';
  consultant_restrictions?: number[]; // Multi-select consultant dropdown
  service_type_restrictions?: string[]; // Session type checkboxes
  
  // Campaign Attribution
  campaign_source?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  
  // Administrative
  notes?: string;
  is_active: boolean;
}
```

#### Form Validation Rules
```typescript
const couponValidationSchema = z.object({
  code: z.string()
    .min(3, "Code must be at least 3 characters")
    .max(20, "Code must not exceed 20 characters")
    .regex(/^[A-Z0-9_-]+$/, "Code must contain only uppercase letters, numbers, underscores, and hyphens")
    .refine(async (code) => {
      // Check uniqueness via API
      const exists = await checkCouponCodeExists(code);
      return !exists;
    }, "Coupon code already exists"),
    
  internal_name: z.string()
    .min(3, "Internal name must be at least 3 characters")
    .max(100, "Internal name too long"),
    
  discount_type: z.enum(['percentage', 'fixed_amount', 'free_session']),
  
  discount_value: z.number()
    .positive("Discount value must be positive")
    .refine((value, ctx) => {
      if (ctx.parent.discount_type === 'percentage') {
        return value <= 100;
      }
      return true;
    }, "Percentage discount cannot exceed 100%"),
    
  max_uses_total: z.number()
    .positive("Usage limit must be positive")
    .optional(),
    
  max_uses_per_user: z.number()
    .min(1, "Must allow at least 1 use per user")
    .max(10, "Cannot exceed 10 uses per user"),
    
  valid_from: z.date()
    .min(new Date(), "Start date cannot be in the past"),
    
  valid_until: z.date()
    .optional()
    .refine((date, ctx) => {
      if (date && ctx.parent.valid_from) {
        return date > ctx.parent.valid_from;
      }
      return true;
    }, "Expiration date must be after start date"),
    
  minimum_order_value: z.number()
    .min(0, "Minimum order value cannot be negative")
});
```

#### Smart Code Generation
```typescript
interface CodeGenerationOptions {
  prefix?: string; // e.g., "SAVE", "FREE", "NEW"
  includeYear?: boolean; // Add current year
  includeMonth?: boolean; // Add current month
  randomSuffix?: boolean; // Add random characters
  length?: number; // Total desired length
}

// Examples of generated codes:
// SAVE2024, FREE30DEC, NEW15B7X, WELCOME2024
```

### Discount Type Configuration

#### Percentage Discount
- **Value Input**: 1-100% with slider and numeric input
- **Max Discount Cap**: Optional maximum dollar amount
- **Visual Preview**: Shows example calculations

#### Fixed Amount Discount
- **Currency Input**: USD amount with proper formatting
- **Minimum Order**: Prevents discount from exceeding order value
- **Multi-currency Support**: Future extension capability

#### Free Session
- **Zero Payment**: Automatically sets final amount to $0
- **Service Restrictions**: Which services are eligible for free sessions
- **Usage Tracking**: Special handling for revenue attribution

## Analytics Dashboard

### Coupon Performance Overview

#### Key Performance Metrics
```typescript
interface CouponPerformanceMetrics {
  overview: {
    total_active_coupons: number;
    total_redemptions_today: number;
    total_revenue_generated: number;
    average_conversion_rate: number;
    trending_direction: 'up' | 'down' | 'stable';
  };
  
  top_performers: Array<{
    code: string;
    redemptions: number;
    revenue_generated: number;
    conversion_rate: number;
  }>;
  
  recent_activity: Array<{
    timestamp: string;
    coupon_code: string;
    user_email: string;
    amount_discounted: number;
    booking_status: 'pending' | 'completed';
  }>;
}
```

#### Performance Charts
1. **Redemption Timeline**: Daily/weekly/monthly usage patterns
2. **Revenue Impact**: Revenue generated vs. discounts given
3. **Conversion Funnel**: From coupon view to completed booking
4. **Geographic Distribution**: Usage by location (if available)
5. **Service Type Breakdown**: Book-a-meeting vs. 30-for-30 usage

### Individual Coupon Analytics

#### Detailed Metrics Panel
```typescript
interface DetailedCouponAnalytics {
  coupon_info: {
    code: string;
    internal_name: string;
    created_by: string;
    created_at: string;
    current_status: 'active' | 'inactive' | 'expired';
  };
  
  usage_statistics: {
    total_attempts: number;
    successful_redemptions: number;
    failed_attempts: number;
    success_rate: number;
    unique_users: number;
    repeat_users: number;
  };
  
  financial_impact: {
    total_discounts_given: number;
    revenue_generated: number;
    average_discount_per_use: number;
    roi_estimate: number; // Revenue generated vs. marketing cost
  };
  
  conversion_analysis: {
    bookings_completed: number;
    sessions_attended: number;
    attendance_rate: number;
    customer_retention_rate: number;
  };
  
  fraud_indicators: {
    suspicious_usage_count: number;
    flagged_users: string[];
    average_risk_score: number;
    blocked_attempts: number;
  };
}
```

#### Usage Timeline Visualization
- **Interactive Chart**: Zoomable timeline showing redemption patterns
- **Event Markers**: Marketing campaign launches, social media posts
- **Comparative Analysis**: Side-by-side comparison with other coupons
- **Seasonal Trends**: Identify patterns by day of week, month, etc.

## Security & Fraud Prevention

### Fraud Detection Dashboard

#### Risk Assessment Interface
```typescript
interface FraudDetectionMetrics {
  overall_risk_level: 'low' | 'medium' | 'high';
  flagged_activities_count: number;
  blocked_attempts_today: number;
  
  risk_factors: Array<{
    type: 'multiple_rapid_attempts' | 'suspicious_email_patterns' | 'ip_address_abuse' | 'unusual_usage_patterns';
    severity: 'low' | 'medium' | 'high';
    affected_coupons: string[];
    recommended_action: string;
  }>;
  
  user_watchlist: Array<{
    user_email: string;
    risk_score: number;
    flagged_attempts: number;
    last_activity: string;
    recommended_action: 'monitor' | 'restrict' | 'block';
  }>;
}
```

#### Automated Fraud Detection Rules
1. **Rate Limiting**: Maximum attempts per IP/user/hour
2. **Pattern Recognition**: Unusual redemption patterns
3. **Email Analysis**: Suspicious email address patterns
4. **Geographic Anomalies**: Unusual location-based usage
5. **Temporal Analysis**: Suspicious timing patterns

#### Manual Review Interface
- **Flagged Usage Queue**: Review suspicious coupon attempts
- **User Investigation Tools**: View complete user history
- **Whitelist Management**: Trusted users exempt from restrictions
- **IP Blocking**: Block problematic IP addresses
- **Bulk Actions**: Mass approval/rejection of flagged attempts

### Security Configuration

#### Rate Limiting Settings
```typescript
interface SecuritySettings {
  rate_limiting: {
    attempts_per_minute: number;
    attempts_per_hour: number;
    attempts_per_day: number;
    lockout_duration_minutes: number;
  };
  
  fraud_thresholds: {
    risk_score_block_threshold: number; // 0.0-1.0
    auto_flag_threshold: number;
    manual_review_threshold: number;
  };
  
  email_restrictions: {
    block_disposable_emails: boolean;
    require_email_verification: boolean;
    blocked_domains: string[];
  };
  
  ip_restrictions: {
    max_attempts_per_ip: number;
    geo_blocking_enabled: boolean;
    blocked_countries: string[];
    vpn_detection_enabled: boolean;
  };
}
```

## Bulk Operations & Campaign Management

### Bulk Coupon Creation

#### CSV Import Interface
```typescript
interface BulkCouponImport {
  template_download: () => void; // Download CSV template
  file_upload: {
    accepted_formats: ['.csv', '.xlsx'];
    max_file_size: string; // "10MB"
    validation_preview: boolean; // Show preview before import
  };
  
  csv_columns: {
    required: ['code', 'discount_type', 'discount_value', 'valid_from'];
    optional: ['internal_name', 'description_en', 'max_uses_total', 'valid_until', 'applicable_to', 'campaign_source'];
  };
  
  import_options: {
    skip_duplicates: boolean;
    update_existing: boolean;
    activate_immediately: boolean;
    send_notifications: boolean;
  };
}
```

#### Bulk Actions Menu
- **Activate/Deactivate**: Mass status changes
- **Extend Expiry**: Bulk expiration date updates  
- **Export Data**: CSV/Excel export with usage analytics
- **Delete Multiple**: Bulk soft-delete with confirmation
- **Clone Campaign**: Duplicate successful coupon campaigns
- **Apply Templates**: Use predefined coupon templates

### Campaign Organization

#### Campaign Management Interface
```typescript
interface CouponCampaign {
  id: string;
  name: string;
  description: string;
  start_date: Date;
  end_date: Date;
  
  associated_coupons: Array<{
    coupon_id: number;
    code: string;
    role: 'primary' | 'secondary' | 'fallback';
  }>;
  
  performance_metrics: {
    total_redemptions: number;
    revenue_generated: number;
    conversion_rate: number;
    roi: number;
  };
  
  attribution: {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    marketing_channel: 'email' | 'social' | 'paid_ads' | 'organic';
  };
}
```

#### Campaign Analytics
- **Cross-coupon Analysis**: Performance comparison within campaigns
- **Channel Attribution**: Which marketing channels drive most usage
- **A/B Testing**: Compare different coupon strategies
- **Lifecycle Analysis**: Customer journey from coupon to retention

## User Experience Enhancements

### Real-time Features

#### Live Updates
```typescript
interface RealtimeUpdates {
  websocket_connection: {
    endpoint: 'wss://admin.voltaic.systems/ws/coupons';
    events: ['coupon_used', 'fraud_detected', 'limit_reached', 'expired'];
  };
  
  notifications: {
    toast_alerts: boolean;
    email_notifications: boolean;
    slack_integration: boolean;
    webhook_callbacks: string[];
  };
}
```

#### Interactive Elements
- **Live Usage Counter**: Real-time redemption counts
- **Status Badges**: Dynamic status indicators with tooltips
- **Progress Bars**: Visual usage vs. limits
- **Trend Indicators**: Up/down arrows showing performance trends

### Advanced Search & Navigation

#### Smart Search Features
```typescript
interface SmartSearch {
  global_search: {
    search_fields: ['code', 'internal_name', 'description', 'campaign_source'];
    fuzzy_matching: boolean;
    recent_searches: string[];
    saved_searches: Array<{ name: string; query: string }>;
  };
  
  advanced_filters: {
    date_presets: ['today', 'yesterday', 'last_7_days', 'last_30_days', 'last_quarter'];
    numerical_ranges: ['usage_count', 'revenue_generated', 'conversion_rate'];
    status_combinations: boolean; // Multiple status selection
  };
  
  sorting_options: {
    default_sort: 'created_at_desc';
    custom_sorts: Array<{ field: string; direction: 'asc' | 'desc' }>;
    save_sort_preferences: boolean;
  };
}
```

### Accessibility & Responsive Design

#### Accessibility Features
- **WCAG 2.1 AA Compliance**: Full accessibility support
- **Keyboard Navigation**: Complete keyboard-only operation
- **Screen Reader Support**: Comprehensive ARIA labels
- **High Contrast Mode**: Enhanced visibility options
- **Focus Management**: Logical tab order and focus indicators

#### Mobile Responsiveness
```typescript
interface ResponsiveDesign {
  breakpoints: {
    mobile: '320px-768px'; // Stacked layout, simplified table
    tablet: '768px-1024px'; // Condensed table, collapsible filters  
    desktop: '1024px+'; // Full feature set
  };
  
  mobile_adaptations: {
    table_layout: 'cards' | 'accordion'; // Mobile-friendly layouts
    swipe_actions: boolean; // Swipe to reveal actions
    bottom_sheet_modals: boolean; // Mobile-native modal style
    infinite_scroll: boolean; // Performance optimization
  };
}
```

## Integration Points

### Cross-System Integration

#### Payment System Integration
→ **Payment Processing**: [Payment Management](./payment.md#coupon-integration)
- **Free Session Handling**: Process $0.00 transactions properly
- **Discount Application**: Modify payment amounts before processing
- **Revenue Attribution**: Track coupon-driven vs. organic revenue
- **Refund Handling**: Manage refunds for discounted transactions

#### Analytics System Integration  
→ **Business Intelligence**: [Analytics Dashboard](./analytics-dashboard.md#coupon-analytics)
- **Revenue Impact Analysis**: Coupon contribution to overall revenue
- **Customer Acquisition Cost**: Track marketing efficiency
- **Lifetime Value**: Assess long-term value of coupon users
- **Conversion Funnel**: Integration with booking conversion metrics

#### Content Management Integration
→ **Content System**: [Content Management](./content-management.md#promotional-content)
- **Landing Page Integration**: Dynamic coupon display
- **Email Template Integration**: Automated coupon distribution
- **Social Media Integration**: Coupon sharing capabilities
- **Multilingual Support**: Translated coupon descriptions

### External Service Integration

#### Marketing Automation
```typescript
interface MarketingIntegration {
  email_platforms: {
    brevo: {
      campaign_triggers: string[];
      coupon_personalization: boolean;
      usage_tracking: boolean;
    };
    mailchimp: {
      audience_segmentation: boolean;
      automated_sequences: boolean;
    };
  };
  
  social_media: {
    facebook_ads: {
      dynamic_coupons: boolean;
      pixel_tracking: boolean;
    };
    linkedin_campaigns: {
      b2b_targeting: boolean;
      industry_specific_coupons: boolean;
    };
  };
  
  analytics_platforms: {
    google_analytics: {
      event_tracking: ['coupon_view', 'coupon_apply', 'coupon_success'];
      conversion_attribution: boolean;
    };
    mixpanel: {
      funnel_analysis: boolean;
      cohort_analysis: boolean;
    };
  };
}
```

## Future Enhancements

### Planned Features
- **AI-Powered Optimization**: Machine learning for optimal discount amounts
- **Dynamic Pricing**: Real-time price adjustments based on demand
- **Personalized Coupons**: Individual-specific discount generation
- **Advanced Fraud Detection**: ML-based suspicious activity detection
- **Multi-currency Support**: International coupon campaigns
- **Seasonal Templates**: Pre-configured holiday and seasonal campaigns

### API Extensions
- **GraphQL Support**: More flexible data querying
- **Webhook Integration**: Real-time coupon events for external systems
- **Mobile SDK**: Native mobile app coupon integration
- **Partner API**: Third-party coupon distribution channels

## Cross-References Summary

### Core Admin Panel Integration
← **Administrative Foundation**:
- [Admin Panel Overview](./admin.md) - Main administrative interface architecture
- [Authentication System](./authentication.md) - Role-based access control for coupon management
- [Analytics Dashboard](./analytics-dashboard.md) - Business intelligence integration for coupon performance

### Business Operations Integration  
↔️ **Business Process Integration**:
- [Payment Management](./payment.md) - Financial transaction processing with coupon discounts
- [Consultant Management](./consultant-management.md) - Consultant-specific coupon targeting and revenue impact
- [Content Management](./content-management.md) - Promotional content and coupon distribution channels

### Technical Dependencies
→ **System Architecture Dependencies**:
- [Backend API Specification](../../backend/api.md#coupon-management) - Coupon management API endpoints
- [Database Schema](../../backend/database.md#coupon--discount-management) - Coupon data model and relationships  
- [Security Specification](../../security.md) - Fraud prevention and access control measures
- [Privacy Compliance](../../privacy-compliance.md) - Data protection for coupon usage tracking

### User Experience Integration
⚡ **Frontend Integration Points**:
- [Public Booking Interface](../public/features/booking.md) - Coupon application during booking process
- [Design System](../design-system.md) - UI components and styling consistency
- [Testing Strategy](../../testing_strategy.md) - Quality assurance for coupon functionality