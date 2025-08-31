# Magnetiq v2 - Content Management Admin Specification

## Overview

The Content Management Admin interface provides comprehensive tools for creating, editing, and managing all content across the voltAIc platform. Built around a PortableText-based content system, it enables sophisticated content creation with integrated media management, SEO optimization, and multilingual support.

→ **Core Architecture**: [Admin Panel System](./admin.md#content-management) 
← **Content Strategy**: [Content Marketing Features](../features/content-marketing.md)
⚡ **Dependencies**: [Backend Content API](../backend/api.md#content-endpoints), [Database Content Schema](../backend/database.md#content-tables)

## Visual Content Workflow Overview
![Content Management Workflow](../../diagrams/spec_v2/features/content_management_workflow.png)
*Complete content creation and publishing workflow with all stakeholder touchpoints*

## Content Management Architecture

### PortableText-Centric Design
The entire content management system is built around PortableText, providing:

- **Structured Content**: Block-based content creation with semantic meaning
- **Platform Agnostic**: Content renders consistently across all channels
- **Developer Friendly**: Structured data that's easy to query and manipulate
- **Editor Friendly**: Visual editing experience with live preview
- **SEO Optimized**: Semantic structure that enhances search performance

→ **Technical Implementation**: [PortableText Schema](../backend/database.md#portabletext-schema)
↔️ **Frontend Rendering**: [Public Content Display](../frontend/public.md#portabletext-rendering)

## Core Interface Components

### 1. Page Builder Interface with PortableText

![Page Builder Architecture](../../diagrams/spec_v2/features/page_builder_system.png)

#### PortableText Editor System
```tsx
interface PageBuilderInterface {
  editorCore: {
    portableTextEditor: PortableTextEditor;
    blockLibrary: BlockTypeLibrary;
    livePreview: ContentPreviewEngine;
    autoSave: AutoSaveManager;
    versionControl: VersionControlSystem;
  };
  
  layoutManagement: {
    dragAndDrop: DragDropInterface;
    blockArrangement: BlockArrangementSystem;
    templateSystem: PageTemplateManager;
    responsivePreview: ResponsivePreviewTool;
  };
  
  contentValidation: {
    structureValidator: ContentStructureValidator;
    seoValidator: SEOValidationEngine;
    accessibilityChecker: A11yValidationTool;
    linkChecker: LinkValidationSystem;
  };
}
```

**Core Editor Features:**
- **Block-Based Editing**: Visual PortableText block creation and management
- **Live Preview**: Real-time content rendering preview
- **Drag & Drop**: Intuitive block reordering and arrangement
- **Auto-Save**: Continuous content preservation every 5 seconds
- **Undo/Redo**: Complete editing history with 50+ action memory
- **Multi-Language Support**: Side-by-side editing for all languages

→ **Block Types**: [Available Content Blocks](#portabletext-block-library)
⚡ **Content Validation**: [SEO and Accessibility Checking](#seo-settings-and-optimization)

#### PortableText Block Library
```tsx
interface PortableTextBlockLibrary {
  textBlocks: {
    paragraph: ParagraphBlock;
    heading: HeadingBlock; // H1-H6 with SEO optimization
    list: ListBlock; // Bullet, numbered, definition lists
    quote: QuoteBlock; // Blockquotes with attribution
    code: CodeBlock; // Syntax-highlighted code snippets
  };
  
  mediaBlocks: {
    image: ImageBlock; // Responsive images with alt text and captions
    video: VideoBlock; // YouTube/Vimeo embeds or direct uploads
    audio: AudioBlock; // Podcast embeds or audio file uploads
    gallery: GalleryBlock; // Image galleries with lightbox
  };
  
  interactiveBlocks: {
    cta: CTABlock; // Call-to-action buttons with tracking
    form: FormBlock; // Embedded contact/lead generation forms
    webinarEmbed: WebinarEmbedBlock; // Webinar registration components
    whitepaperDownload: WhitepaperDownloadBlock; // Whitepaper CTA components
    consultantProfile: ConsultantProfileBlock; // Consultant showcase blocks
  };
  
  layoutBlocks: {
    divider: DividerBlock; // Visual content separators
    spacer: SpacerBlock; // Adjustable whitespace
    columns: ColumnBlock; // Multi-column layouts
    accordion: AccordionBlock; // Collapsible content sections
  };
  
  businessBlocks: {
    testimonial: TestimonialBlock; // Client testimonials with photos
    pricing: PricingBlock; // Service pricing displays
    timeline: TimelineBlock; // Company/project timelines
    faq: FAQBlock; // Frequently asked questions
  };
}
```

→ **Media Integration**: [Media Library Management](#2-media-library-management)
↔️ **Consultant Integration**: [Consultant Content Blocks](./admin.md#consultant-content-integration)

### 2. Media Library Management

![Media Library System](../../diagrams/spec_v2/features/media_library_system.png)

#### Integrated Media Management
```tsx
interface MediaLibraryInterface {
  fileManagement: {
    upload: {
      dragAndDrop: boolean;
      bulkUpload: boolean;
      progressTracking: boolean;
      formatValidation: boolean;
      sizeOptimization: boolean;
    };
    organization: {
      folderStructure: FolderHierarchy;
      taggingSystem: TaggingInterface;
      searchAndFilter: SearchInterface;
      bulkOperations: BulkActionInterface;
    };
  };
  
  consultantIntegration: {
    authorshipTracking: {
      createdBy: ConsultantReference;
      associatedContent: ContentReference[];
      usageAnalytics: MediaUsageMetrics;
      permissions: MediaPermissionLevel;
    };
    consultantAssets: {
      profilePhotos: ProfilePhotoManager;
      brandingAssets: BrandingAssetManager;
      contentAssets: ContentAssetManager;
      portfolioItems: PortfolioItemManager;
    };
  };
  
  portableTextIntegration: {
    assetReferencing: AssetReferenceSystem;
    blockIntegration: MediaBlockIntegration;
    automaticOptimization: ImageOptimizationEngine;
    cdnIntegration: CDNAssetDelivery;
  };
}
```

**Key Features:**
- **Smart Upload**: Automatic format conversion and size optimization
- **Consultant Attribution**: Track asset ownership and usage by consultants
- **PortableText Integration**: Seamless asset insertion into content blocks
- **CDN Optimization**: Automatic asset distribution and optimization
- **Version Control**: Asset versioning with rollback capabilities
- **Usage Tracking**: Comprehensive analytics on asset performance

→ **Asset Storage**: [File Storage Integration](../integrations/file-storage.md)
⚡ **Performance**: [CDN and Optimization](../architecture.md#cdn-configuration)

### 3. Webinar Content Management

→ **Complete Webinar Management**: [Webinar Management Specification](./business/webinar.md) (~500+ lines)
- **Session Creation & Scheduling**: Complete webinar session management with consultant assignment
- **Content Creation Tools**: PortableText editing for descriptions, agendas, and marketing materials  
- **Consultant Assignment**: AI-powered speaker matching and performance tracking
- **Registration Management**: Registration tracking, attendee communication, and analytics
- **Marketing Integration**: Social media campaigns, email automation, and landing page creation

### 4. Whitepaper Content Management

→ **Complete Whitepaper Management**: [Whitepaper Management Specification](./business/whitepapers.md) (~300+ lines)
- **Consultant Authorship**: Multi-author support with contribution tracking and performance attribution
- **Collaborative Content Creation**: PortableText editing with real-time collaboration and version control  
- **Royalty Management**: Automatic royalty calculation and revenue tracking per author
- **Performance Analytics**: Download analytics, lead generation tracking, and consultant attribution
- **Editorial Workflows**: Multi-stage review processes with author-specific approval requirements

### 5. SEO Settings and Optimization Tools

![SEO Optimization Dashboard](../../diagrams/spec_v2/features/seo_optimization_dashboard.png)

#### Comprehensive SEO Management
```tsx
interface SEOOptimizationInterface {
  contentSEO: {
    keywordOptimization: {
      keywordResearch: KeywordResearchInterface;
      densityAnalysis: KeywordDensityAnalyzer;
      semanticAnalysis: SemanticSEOAnalyzer;
      competitorAnalysis: CompetitorSEOAnalysis;
    };
    technicalSEO: {
      metaDataManager: MetaDataManagerInterface;
      structuredData: StructuredDataGenerator;
      schemaMarkup: SchemaMarkupGenerator;
      siteMappingTools: SitemapGenerationTools;
    };
  };
  
  portableTextSEO: {
    blockLevelSEO: {
      headingOptimization: HeadingStructureAnalyzer;
      linkOptimization: InternalLinkingAnalyzer;
      imageOptimization: ImageSEOAnalyzer;
      readabilityAnalysis: ReadabilityScoreCalculator;
    };
    contentAnalysis: {
      contentGaps: ContentGapAnalyzer;
      topicCoverage: TopicCoverageAnalyzer;
      competitivenessScore: CompetitivenessCalculator;
      performancePrediction: SEOPerformancePredictor;
    };
  };
}
```

**Advanced SEO Features:**
- **Real-Time SEO Scoring**: Live SEO analysis as content is created
- **PortableText SEO Optimization**: Block-level SEO recommendations
- **Automated Meta Generation**: AI-powered meta descriptions and titles
- **Technical SEO Monitoring**: Continuous site health monitoring
- **Performance Prediction**: AI-powered SEO impact forecasting

→ **Public SEO Implementation**: [Frontend SEO](../frontend/public.md#seo-optimization)
⚡ **SEO Analytics**: [Performance Tracking](../features/analytics.md#seo-metrics)

### 6. Multilingual Content Management

![Translation Workflow](../../diagrams/spec_v2/features/translation_workflow.png)

#### Advanced Translation Workflows
```tsx
interface MultilingualManagementInterface {
  translationWorkflow: {
    contentTranslation: {
      sourceLanguage: LanguageSelectionInterface;
      targetLanguages: MultiLanguageSelectionInterface;
      translationMethod: TranslationMethodSelector; // Manual, AI, Professional
      translationMemory: TranslationMemoryInterface;
    };
    portableTextTranslation: {
      blockLevelTranslation: BlockTranslationInterface;
      structurePreservation: StructurePreservationEngine;
      assetLocalization: AssetLocalizationInterface;
      qualityAssurance: TranslationQualityChecker;
    };
  };
  
  translationManagement: {
    progressTracking: {
      translationProgress: ProgressTrackingInterface;
      translatorAssignment: TranslatorAssignmentInterface;
      reviewWorkflow: TranslationReviewWorkflow;
      approvalProcess: TranslationApprovalInterface;
    };
    qualityControl: {
      linguisticReview: LinguisticReviewInterface;
      culturalAdaptation: CulturalAdaptationInterface;
      brandConsistency: BrandConsistencyChecker;
      technicalValidation: TechnicalValidationInterface;
    };
  };
}
```

**Translation Features:**
- **Block-Level Translation**: Translate individual PortableText blocks while preserving structure
- **Translation Memory**: Reuse previous translations for consistency and efficiency
- **AI-Assisted Translation**: Smart translation suggestions with human review
- **Cultural Adaptation**: Ensure content is culturally appropriate for target markets
- **Quality Assurance**: Multi-stage review process for translation accuracy

→ **Multilingual Implementation**: [Frontend Multilingual Support](../frontend/multilingual.md)
⚡ **Translation Services**: [External Translation APIs](../integrations/translation-services.md)

## Integration Points

### Backend Content Management APIs
```tsx
interface ContentManagementAPIIntegration {
  contentOperations: {
    create: CreateContentEndpoint;
    read: ReadContentEndpoint;
    update: UpdateContentEndpoint;
    delete: DeleteContentEndpoint;
    publish: PublishContentEndpoint;
    schedule: ScheduleContentEndpoint;
  };
  
  portableTextOperations: {
    validate: ValidatePortableTextEndpoint;
    serialize: SerializePortableTextEndpoint;
    transform: TransformPortableTextEndpoint;
    migrate: MigrateContentEndpoint;
  };
  
  mediaOperations: {
    upload: MediaUploadEndpoint;
    optimize: MediaOptimizationEndpoint;
    deliver: MediaDeliveryEndpoint;
    analytics: MediaAnalyticsEndpoint;
  };
}
```

→ **API Documentation**: [Backend Content API](../backend/api.md#content-management-endpoints)
⚡ **Database Operations**: [Content Database Schema](../backend/database.md#content-tables)

### Database Content Relationships
The content management system integrates with multiple database entities:

- **Content Tables**: Pages, posts, whitepapers, webinar descriptions
- **Media Tables**: Assets, optimizations, usage tracking
- **Consultant Tables**: Author attribution, content associations
- **SEO Tables**: Meta data, structured data, performance metrics
- **Translation Tables**: Multilingual content versions, translation status

→ **Database Schema**: [Complete Database Design](../backend/database.md#content-schema)
↔️ **Data Relationships**: [Entity Relationship Mapping](../backend/database.md#content-relationships)

### Consultant Profile Integration
Deep integration with the consultant management system enables:

- **Content Attribution**: Automatic author assignment and tracking
- **Performance Analytics**: Content performance attribution per consultant
- **Content Marketing**: Consultant-branded content creation
- **Cross-Promotion**: Consultant content appearing in profiles and bios

→ **Consultant System**: [Consultant Management](./admin.md#consultant-management)
↔️ **Content Marketing**: [Consultant Content Strategy](../features/content-marketing.md#consultant-content)

### Media Storage and CDN Integration
Seamless media management with:

- **Cloud Storage**: Scalable file storage with automatic backups
- **CDN Delivery**: Global content delivery network for optimal performance
- **Image Optimization**: Automatic format conversion and compression
- **Asset Versioning**: Complete version control for all media assets

→ **Storage Configuration**: [File Storage Integration](../integrations/file-storage.md)
⚡ **CDN Setup**: [Content Delivery Network](../architecture.md#cdn-integration)

### SEO and Analytics Tracking
Integrated SEO and analytics provide:

- **Performance Monitoring**: Real-time SEO performance tracking
- **Content Analytics**: Detailed content performance metrics
- **Conversion Tracking**: Content-to-lead conversion analytics
- **A/B Testing**: Content variant performance comparison

→ **Analytics Platform**: [Analytics Integration](../features/analytics.md#content-analytics)
⚡ **SEO Tools**: [SEO Service Integration](../integrations/seo-tools.md)

## Content Approval and Publishing Workflows

### Editorial Workflow Engine
```tsx
interface EditorialWorkflowInterface {
  workflowStages: {
    draft: DraftStageInterface;
    review: ReviewStageInterface;
    approval: ApprovalStageInterface;
    scheduled: SchedulingStageInterface;
    published: PublishingStageInterface;
  };
  
  approvalMatrix: {
    contentTypes: ContentTypeApprovalRules;
    userRoles: UserRolePermissions;
    escalationRules: EscalationRuleEngine;
    automationRules: WorkflowAutomationRules;
  };
  
  notificationSystem: {
    approvalRequests: ApprovalNotificationInterface;
    statusUpdates: StatusUpdateNotificationInterface;
    deadlineReminders: DeadlineReminderInterface;
    publishingAlerts: PublishingAlertInterface;
  };
}
```

**Workflow Features:**
- **Multi-Stage Approval**: Configurable approval workflows based on content type
- **Role-Based Permissions**: Different approval levels for different user roles
- **Automated Notifications**: Real-time notifications for workflow status changes
- **Deadline Management**: Automated reminders and escalation for missed deadlines
- **Audit Trail**: Complete history of all workflow actions and decisions

→ **User Permissions**: [Role-Based Access Control](../security.md#content-permissions)
⚡ **Workflow Configuration**: [Admin Workflow Settings](./admin.md#workflow-management)

## Content Performance Analytics

### Content Analytics Dashboard
```tsx
interface ContentAnalyticsInterface {
  performanceMetrics: {
    pageViews: PageViewAnalytics;
    engagement: EngagementMetrics;
    conversions: ConversionAnalytics;
    seoPerformance: SEOPerformanceMetrics;
  };
  
  portableTextAnalytics: {
    blockPerformance: BlockPerformanceAnalytics;
    contentOptimization: ContentOptimizationInsights;
    userInteraction: UserInteractionAnalytics;
    conversionAttribution: ConversionAttributionAnalytics;
  };
  
  consultantContentAnalytics: {
    authorPerformance: AuthorPerformanceMetrics;
    contentAttribution: ContentAttributionAnalytics;
    revenueTracking: RevenueAttributionTracking;
    crossContentAnalysis: CrossContentAnalysisInterface;
  };
}
```

**Analytics Features:**
- **Real-Time Metrics**: Live content performance monitoring
- **Block-Level Analytics**: Performance analysis at the PortableText block level
- **Consultant Attribution**: Performance tracking by content author
- **Conversion Optimization**: Data-driven content optimization recommendations
- **Predictive Analytics**: AI-powered content performance predictions

→ **Analytics Platform**: [Main Analytics System](../features/analytics.md)
↔️ **Performance Optimization**: [Content Optimization Strategies](../features/content-optimization.md)

## Cross-References Summary

**Core Dependencies:**
← **Admin Panel Architecture**: [Main Admin Specification](./admin.md#content-management)
→ **Backend Integration**: [Content Management API](../backend/api.md#content-endpoints)
→ **Database Schema**: [Content Database Tables](../backend/database.md#content-schema)
⚡ **Security**: [Content Security Policies](../security.md#content-security)

**Feature Integrations:**
↔️ **Webinar System**: [Webinar Management](./business/webinar.md#content-creation)
↔️ **Whitepaper System**: [Whitepaper Management](./business/whitepapers.md#content-creation)
↔️ **Consultant Profiles**: [Consultant Content Integration](./admin.md#consultant-content-management)
↔️ **SEO Platform**: [SEO Optimization Features](../features/seo-optimization.md)

**User Experience:**
← **User Personas**: [Content Editor Persona](../users/content-editor.md), [Site Admin Persona](../users/site-admin.md)
→ **Frontend Display**: [Public Content Rendering](../frontend/public.md#content-display)
⚡ **Multilingual Support**: [Frontend Internationalization](../frontend/multilingual.md)

**External Integrations:**
→ **Media Storage**: [File Storage Services](../integrations/file-storage.md)
→ **CDN Services**: [Content Delivery Network](../integrations/cdn-services.md)
→ **Translation Services**: [Translation API Integration](../integrations/translation-services.md)
→ **SEO Tools**: [SEO Service Integration](../integrations/seo-tools.md)

## Visual Documentation
![Content Architecture](../../diagrams/spec_v2/features/content_architecture.png)
*Complete content management architecture showing all system relationships*

🔗 **Related Diagrams**: 
- [PortableText Block System](../../diagrams/spec_v2/features/portabletext_blocks.png)
- [Content Workflow States](../../diagrams/spec_v2/features/content_workflow_states.png)
- [Media Library Integration](../../diagrams/spec_v2/features/media_library_integration.png)
- [SEO Optimization Flow](../../diagrams/spec_v2/features/seo_optimization_flow.png)
- [Translation Management System](../../diagrams/spec_v2/features/translation_management.png)