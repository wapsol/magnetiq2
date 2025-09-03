# Careers Page Specification

## Overview
The careers page serves as voltAIc Systems' recruitment platform, showcasing team members, company culture, open positions, and providing a streamlined application process. The page is designed to attract talent while reflecting the company's values of innovation, transparency, and simplification.

## Page Structure

### 1. URL Structure
- **English**: `/about/careers`
- **German**: `/de/ueber-uns/karriere`

### 2. Component Architecture
```
CareersPage.tsx
├── Hero Section
├── Leadership Team Section  
├── Company Values Section
├── Benefits & Culture Section
├── Open Positions Section
├── CTA Section
└── JobApplicationPopup Component
```

### 3. Content Sections

#### Hero Section
- **Purpose**: Introduce voltAIc as an innovative employer
- **Content**: 
  - Main headline about shaping AI's future
  - Subtitle emphasizing mission and impact
  - Background gradient styling
- **CTA**: Primary application button

#### Leadership Team Section
- **Purpose**: Showcase founders and advisory board
- **Content**:
  - **Founders**:
    - Ashant Chalasani, M.Sc. (Co-Founder)
    - Pascal Köth, Dipl.Ök. (Co-Founder)
  - **Advisory Board**:
    - Dr. Codrina Lauth (Executive Director, Perton HPC AI Supercomputing)
    - Markus Eberius (CIO/CTO, previously at Nasdaq)
  - Each member includes role, inspirational quote, and professional context

#### Company Values Section
- **Core Values**:
  - Innovation & Excellence
  - Transparency & Trust  
  - Sustainability & Responsibility
  - Diversity & Inclusion
- **Presentation**: Icon-based cards with descriptions

#### Benefits & Culture Section
- **Benefits Listed**:
  - Competitive salary and equity options
  - Flexible working hours and remote work
  - Professional development budget
  - Health and wellness programs
  - Innovation time (20% for personal projects)
  - International collaboration opportunities
- **Presentation**: Grid layout with check icons

#### Open Positions Section
- **Sample Positions**:
  - Senior AI Engineer
  - Data Scientist
  - Frontend Developer
  - Product Manager
  - DevOps Engineer
  - Business Development Manager
- **Position Details**: Title, department, location, type, description
- **CTA**: Individual "Apply Now" buttons for each position

#### Call-to-Action Sections
- **Primary CTA**: "Ready to Shape the Future of AI?"
- **Secondary Actions**: General application, interview application
- **Additional Links**: Learn about team

## JobApplicationPopup Component Specification

### 1. Component Purpose
Streamlined job application process that saves applicant time while gathering essential information for recruitment evaluation.

### 2. Key Features

#### Simplified Process Philosophy
- **Principle**: Save applicants from lengthy forms
- **Requirements**: Only LinkedIn profile and CV upload needed
- **Messaging**: Prominent explanation that these "raw materials" are sufficient for initial evaluation

#### User Experience Features
- **ESC Key Support**: Popup closes when ESC key is pressed (unless submitting)
- **Drag & Drop**: CV file upload with visual feedback
- **Validation**: Real-time form validation with error messaging
- **Progress Indicators**: Upload progress bar during submission
- **Responsive Design**: Mobile-optimized interface

#### GDPR Compliance
- **Consent Management**: Three distinct consent checkboxes
- **Legal Messaging**: All consent text includes GDPR references
- **Data Rights Notice**: Clear information about data access, rectification, and deletion rights
- **Contact Information**: privacy@voltaic.systems for data requests

#### Success Flow Enhancements
- **No Auto-Dismiss**: Success popup remains until user action
- **LinkedIn Sharing**: Option to share application on LinkedIn
- **Manual Close**: User must click close button to dismiss
- **Social Sharing Text**: Pre-formatted professional message

### 3. Form Fields

#### Required Fields
- **LinkedIn Profile**: URL validation with LinkedIn pattern matching
- **CV Upload**: PDF, DOC, DOCX files up to 10MB

#### Optional Fields  
- **GitHub Profile**: URL validation with GitHub pattern matching

#### Consent Checkboxes
1. **CV Sharing**: Permission to share with recruitment partners (GDPR compliant)
2. **AI Processing**: Consent for AI-powered resume screening (private cloud, GDPR compliant)  
3. **Communications**: Opt-in for job updates and application status (GDPR compliant)

### 4. Technical Specifications

#### File Upload
- **Supported Types**: PDF, DOC, DOCX
- **Size Limit**: 10MB maximum
- **Validation**: MIME type and file extension checking
- **Upload Method**: FormData with progress tracking

#### API Integration
- **Endpoint**: `/api/v1/careers/applications`
- **Method**: POST multipart/form-data
- **Response Handling**: Success/error state management

#### Validation Rules
- **LinkedIn URL Pattern**: `^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-\.]+\/?$`
- **GitHub URL Pattern**: `^https?:\/\/(www\.)?github\.com\/[\w\-\.]+\/?$`
- **File Type Validation**: MIME type checking against allowed types
- **File Size Validation**: Client-side size checking before upload

#### Keyboard Accessibility
- **ESC Key**: Close popup (disabled during submission)
- **Tab Navigation**: Proper focus management
- **Enter Key**: Form submission when valid

#### Mobile Optimization
- **Touch Targets**: Minimum 44px for all interactive elements
- **Viewport Scaling**: Responsive modal sizing
- **Touch Gestures**: Drag and drop support on mobile devices

### 5. Internationalization

#### Supported Languages
- **English (en)**: Primary language
- **German (de)**: Secondary language

#### Content Types
- **Static Text**: All UI labels and messages
- **Dynamic Content**: Position titles, descriptions, success messages
- **Legal Text**: GDPR notices and privacy consent language
- **Social Sharing**: LinkedIn sharing messages

#### Language Detection
- Uses `useLanguage` context for current language preference
- Fallback to English if language key missing

### 6. Styling & Theming

#### Design System Integration
- **Colors**: Primary blue theme with consistent accent colors
- **Typography**: System font stack with proper hierarchy
- **Spacing**: 8px grid system
- **Shadows**: Layered shadow system for depth
- **Borders**: Rounded corners following design system

#### Dark Mode Support
- **Background Colors**: Proper dark mode variants
- **Text Colors**: Appropriate contrast ratios
- **Form Elements**: Dark mode styling for inputs and buttons
- **Accent Colors**: Maintained brand consistency

#### Animation & Transitions
- **Modal Entry**: Scale and opacity transition
- **State Changes**: Smooth color and size transitions
- **Progress Indicators**: Animated progress bars
- **Hover Effects**: Subtle interactive feedback

### 7. Error Handling

#### Validation Errors
- **Field-Level**: Individual field error messages
- **Form-Level**: Overall form validation status
- **File Upload**: Specific file-related error handling

#### API Errors
- **Network Issues**: Connection failure handling
- **Server Errors**: HTTP status code error handling
- **Timeout Handling**: Request timeout management

#### User Feedback
- **Loading States**: Visual feedback during API calls
- **Success Confirmation**: Clear success messaging
- **Error Recovery**: Clear instructions for error resolution

### 8. Analytics & Tracking

#### User Interaction Events
- **Popup Open**: Track popup initialization
- **Form Start**: Track when user begins filling form
- **File Upload**: Track successful file selections
- **Submission Attempts**: Track form submission attempts
- **Success Events**: Track successful applications
- **LinkedIn Sharing**: Track social sharing actions

#### Performance Metrics
- **Load Times**: Modal rendering performance
- **File Upload Speed**: Track upload completion times
- **Error Rates**: Monitor validation and API error frequencies

## Security Considerations

### Data Protection
- **GDPR Compliance**: Full compliance with EU data protection regulations
- **Data Minimization**: Only collect necessary information
- **Consent Management**: Clear opt-in mechanisms for all data usage
- **Data Retention**: Defined retention periods for application data

### File Upload Security
- **MIME Type Validation**: Server-side file type verification
- **File Size Limits**: Prevent large file attacks
- **Malware Scanning**: Server-side file scanning
- **Secure Storage**: Protected file storage location

### Privacy Features
- **Contact Information**: Clear privacy contact for data requests
- **Data Rights**: Explicit mention of GDPR rights
- **Processing Transparency**: Clear explanation of data usage
- **Opt-out Mechanisms**: Easy unsubscribe from communications

## Deployment Notes

### Frontend Deployment
- **Route Configuration**: Ensure proper routing for both language versions
- **Asset Optimization**: Image and font loading optimization
- **Bundle Size**: Code splitting for careers page components

### Backend Integration
- **API Endpoint**: Careers application submission endpoint
- **File Storage**: Secure file storage configuration
- **Email Notifications**: Application confirmation emails
- **Database Schema**: Application data storage structure

## Future Enhancements

### Planned Features
- **Video Interviews**: Integration with video interview platforms
- **Application Tracking**: Applicant portal for status updates
- **Automated Screening**: AI-powered initial application screening
- **Referral Program**: Employee referral system integration

### Analytics Improvements
- **Conversion Tracking**: Application completion rates
- **Source Attribution**: Track application sources
- **A/B Testing**: Test different application flow variations
- **User Journey Analysis**: Detailed funnel analysis

## Success Metrics

### Primary KPIs
- **Application Completion Rate**: Percentage of started applications completed
- **Time to Apply**: Average time from page load to submission
- **LinkedIn Sharing Rate**: Percentage of successful applicants sharing
- **Mobile Conversion Rate**: Mobile vs desktop application rates

### Quality Metrics
- **Application Quality Score**: Based on LinkedIn profile completeness and CV quality
- **Response Rate**: Percentage of applications receiving responses
- **Interview Conversion**: Application to interview conversion rate
- **Hire Conversion**: Interview to hire conversion rate

## Maintenance & Updates

### Regular Updates
- **Position Listings**: Monthly review of open positions
- **Team Information**: Quarterly update of team member information
- **Benefits Information**: Annual review of benefits and compensation
- **Legal Compliance**: Ongoing GDPR compliance monitoring

### Technical Maintenance
- **Dependency Updates**: Regular update of npm packages
- **Security Patches**: Timely application of security updates
- **Performance Monitoring**: Ongoing performance optimization
- **Browser Compatibility**: Testing across supported browsers