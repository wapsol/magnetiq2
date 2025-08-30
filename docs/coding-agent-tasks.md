# Coding Agent Tasks - Engineering Agent Responsibilities

## Overview

This document defines the comprehensive tasks and responsibilities for the new engineering agent in `.claude/agents/engineering/`. Beyond basic frontend, backend, and SQL code generation, this agent should handle system integration, conversion optimization, content automation, and quality assurance to support the Magnetiq v2 platform's goals.

→ **Conversion Strategy**: [Conversion Optimization Framework](./concepts/conversion-optimization.md)
→ **Engagement System**: [Content Automation Strategy](./concepts/engagement.md)
→ **Journey Optimization**: [Specification Recommendations](./concepts/journeys_recommendations.md)
→ **System Architecture**: [Backend API Specification](./spec_v2/backend/api.md)

## Core Responsibilities

### 1. System Integration & Architecture Tasks

#### Cross-Reference Validation
- **Specification Consistency**: Ensure frontend code matches backend API contracts and database schemas
- **Dependency Verification**: Validate that all cross-references in specs are properly implemented
- **Integration Testing**: Verify that components work together as specified in the dependency maps
- **API Contract Enforcement**: Ensure TypeScript interfaces match backend response structures
- **Database Relationship Integrity**: Validate foreign key relationships and data consistency

#### Performance Optimization
- **Sub-2-Second Loading**: Implement performance requirements from [friction reduction strategies](./concepts/friction-reduction-strategies.md#page-performance-friction)
- **Mobile-First Implementation**: Ensure thumb-friendly interactions and responsive design
- **Database Query Optimization**: Generate efficient queries based on analytics requirements
- **Bundle Size Optimization**: Implement code splitting and lazy loading for optimal performance
- **Caching Strategy**: Implement intelligent caching for frequently accessed data

#### Architecture Pattern Enforcement
- **Component Modularity**: Create reusable components following established design patterns
- **State Management**: Implement consistent Redux Toolkit patterns across the application
- **Error Boundary Implementation**: Systematic error handling and recovery mechanisms
- **Security Pattern Implementation**: Enforce authentication, authorization, and data protection

### 2. Conversion Optimization Implementation

#### CTA Component Generation
- **Standardized CTA Library**: Create reusable components following [CTA standards](./concepts/cta-components.md)
- **A/B Testing Infrastructure**: Build testing framework for systematic conversion optimization
- **Analytics Integration**: Implement conversion tracking and funnel analysis
- **Personalization Engine**: Generate dynamic CTAs based on user behavior and traffic source
- **Mobile CTA Optimization**: Ensure thumb-friendly CTA placement and sizing

#### User Experience Automation
- **Progressive Disclosure**: Generate multi-step forms and processes that reduce cognitive load
- **Trust Signal Integration**: Automatically add social proof elements at decision points
- **Personalization Engine**: Build dynamic content systems based on user behavior
- **Form Optimization**: Implement smart defaults, validation, and progressive profiling
- **Mobile UX Patterns**: Ensure consistent mobile-first user experience

#### Conversion Funnel Implementation
- **Booking Flow Optimization**: Implement streamlined booking process from [book-a-meeting specifications](./spec_v2/frontend/public/features/book-a-meeting.md)
- **Consultant Signup Flow**: Build LinkedIn-first registration following [consultant signup specs](./spec_v2/frontend/public/features/consultant-signup.md)
- **Lead Generation Forms**: Optimize whitepaper downloads and webinar registrations
- **Exit-Intent Recovery**: Implement abandoned conversion recovery systems

### 3. Content & Engagement Automation

#### Weekly Insight System Implementation
- **Voice Note Processing**: Build the AI pipeline to transform consultant insights into content
- **Email Template Generation**: Create dynamic templates for the [engagement strategy](./concepts/engagement.md#minimum-viable-start---the-weekly-insight-system)
- **Content Multiplication**: Automate the process of creating multiple content pieces from single inputs
- **Brevo Integration**: Implement email sending and campaign management
- **Content Scheduling**: Automated distribution of weekly insights and announcements

#### Consultant Content Pipeline
- **LinkedIn Activity Monitoring**: Automated scraping and curation of consultant thought leadership
- **Profile Enhancement**: AI-powered consultant profile generation and optimization
- **Content Quality Scoring**: Automated assessment of generated content quality
- **Authenticity Preservation**: Maintain consultant voice while enhancing content presentation

#### Admin Panel Enhancements
- **CTA Management Tools**: Allow admins to modify CTAs without developer intervention
- **Content Workflow Tools**: Streamline consultant content collection and processing
- **Analytics Dashboards**: Real-time conversion and engagement metrics
- **Campaign Management**: Tools for managing weekly insights and engagement campaigns

### 4. Business Logic Implementation

#### Consultant Network Management
- **LinkedIn Integration**: Seamless consultant onboarding and profile enhancement
- **Payment & KYC Workflows**: Admin-managed financial processes
- **Booking System Optimization**: Smart matching and scheduling algorithms
- **Performance Analytics**: Comprehensive consultant performance tracking
- **Payout Automation**: Automated consultant compensation calculations

#### Revenue Optimization
- **Dynamic Pricing**: Implement consultant-specific pricing models
- **Conversion Funnel Logic**: Build the systematic conversion paths from [journey maps](./concepts/user-journey-maps.md)
- **Lead Scoring**: Automate lead qualification and nurturing sequences
- **Upselling Logic**: Implement intelligent upgrade and cross-sell suggestions
- **ROI Tracking**: Comprehensive revenue attribution and performance measurement

#### Booking & Scheduling Logic
- **Smart Consultant Matching**: AI-powered consultant recommendation engine
- **Calendar Integration**: Seamless integration with consultant availability systems
- **Time Zone Management**: Intelligent scheduling across global time zones
- **Conflict Resolution**: Automated handling of scheduling conflicts and changes
- **Booking Confirmation Automation**: Streamlined confirmation and reminder systems

### 5. Quality Assurance & Testing

#### Automated Testing Generation
- **Component Testing**: Unit and integration tests for all generated components
- **User Journey Testing**: End-to-end tests for complete conversion paths
- **Performance Testing**: Automated testing of load times and responsiveness
- **API Testing**: Comprehensive backend endpoint testing and validation
- **Security Testing**: Automated security vulnerability scanning and prevention

#### Code Quality Standards
- **TypeScript Enforcement**: Ensure type safety across frontend/backend boundaries
- **Security Implementation**: Follow [security specifications](./spec_v2/security.md) for authentication and data handling
- **Accessibility Compliance**: WCAG 2.1 AA compliance for all generated interfaces
- **Code Review Automation**: Automated code quality checks and standards enforcement
- **Documentation Standards**: Ensure all generated code includes comprehensive documentation

#### Cross-Browser & Device Testing
- **Responsive Design Validation**: Test across all device sizes and orientations
- **Browser Compatibility**: Ensure compatibility across modern browsers
- **Progressive Enhancement**: Graceful degradation for older browsers
- **Touch Interface Testing**: Validate touch interactions on mobile devices

### 6. DevOps & Deployment Tasks

#### Environment Management
- **Feature Flag Implementation**: Support A/B testing and gradual rollouts
- **Error Monitoring**: Implement comprehensive error tracking and alerting
- **Performance Monitoring**: Real-time performance metrics and optimization suggestions
- **Environment Configuration**: Manage development, staging, and production environments
- **Deployment Automation**: Streamlined deployment processes and rollback capabilities

#### Monitoring & Analytics
- **Real-time Dashboard Creation**: Build monitoring dashboards for system health
- **User Behavior Tracking**: Implement comprehensive analytics for conversion optimization
- **Performance Metrics**: Automated performance monitoring and alerting
- **Error Tracking**: Comprehensive error logging and resolution workflows

#### Documentation Automation
- **API Documentation**: Auto-generate API docs from backend code
- **Component Documentation**: Create living documentation for reusable components
- **Implementation Guides**: Generate setup and deployment instructions
- **Architecture Documentation**: Maintain up-to-date system architecture documentation

### 7. Advanced Integration Tasks

#### AI & Machine Learning Integration
- **Content Generation Pipeline**: Implement AI-powered content creation systems
- **Personalization Algorithms**: Build user behavior-based personalization
- **Predictive Analytics**: Implement conversion probability and lead scoring models
- **Natural Language Processing**: Process and enhance consultant voice notes and content

#### Third-Party Service Integration
- **LinkedIn API Integration**: Automated profile scraping and social media management
- **Payment Gateway Integration**: Comprehensive payment processing and financial workflows
- **Email Service Integration**: Brevo SMTP and API integration for all communications
- **Analytics Platform Integration**: Google Analytics, heatmap tools, and conversion tracking

#### Data Processing & Management
- **ETL Pipeline Creation**: Automated data extraction, transformation, and loading
- **Data Validation**: Ensure data integrity across all system integrations
- **Backup & Recovery**: Automated backup systems and disaster recovery procedures
- **GDPR Compliance**: Implement data protection and privacy compliance measures

## Implementation Priorities

### Phase 1: Foundation (Weeks 1-2)
- Core component library and CTA standardization
- Basic conversion tracking and analytics integration
- Mobile-first responsive design implementation
- Performance optimization for sub-2-second loads

### Phase 2: Conversion Optimization (Weeks 3-6)
- Complete booking flow optimization
- Consultant signup process streamlining
- Weekly insight system automation
- Trust signal and social proof integration

### Phase 3: Advanced Features (Weeks 7-12)
- AI-powered personalization engine
- Advanced analytics and reporting systems
- Comprehensive testing automation
- Third-party service integrations

### Phase 4: Scaling & Optimization (Ongoing)
- Performance monitoring and optimization
- Advanced A/B testing capabilities
- Machine learning model implementation
- Continuous integration and deployment optimization

## Success Metrics

### Technical Performance
- **Page Load Speed**: Sub-2-second loading across all pages
- **Mobile Performance**: Optimal performance on 3G networks
- **Code Coverage**: 90%+ test coverage on all generated code
- **Security Compliance**: Zero high-severity security vulnerabilities

### Conversion Optimization
- **Booking Conversion**: Target 3-5% conversion rate on qualified traffic
- **Consultant Signup**: Target 8-12% conversion rate on consultant traffic
- **Lead Generation**: 20-35% conversion on content download forms
- **Mobile Conversion**: Parity between mobile and desktop conversion rates

### Content & Engagement
- **Weekly Insight System**: Automated processing of consultant content
- **Email Performance**: 40%+ open rates on engagement emails
- **Content Quality**: Automated quality scoring above 80%
- **Consultant Participation**: 90%+ consultant participation in content creation

### System Integration
- **API Reliability**: 99.9% uptime for all critical API endpoints
- **Data Consistency**: Zero data integrity issues across system integrations
- **Deployment Success**: 100% successful deployments with automated rollback capability
- **Error Resolution**: Sub-15-minute resolution time for critical system errors

This comprehensive task list ensures the engineering agent can handle the full spectrum of development needs while maintaining focus on business objectives, user experience optimization, and system reliability.