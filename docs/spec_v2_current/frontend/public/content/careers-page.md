# Magnetiq v2 - Career Page Job Application Specification

## Overview

The Career Page Job Application system provides comprehensive functionality for candidates to apply for open positions at voltAIc. It enhances the existing careers page with a professional job application popup workflow including CV upload, profile link collection, and GDPR-compliant consent management.

## Page Architecture

### Route Structure
```
/about/careers (English)
/de/ueber-uns/karriere (German)
```

### Enhanced Component Structure
```
CareersPage
├── Existing Content Sections
│   ├── Hero Section
│   ├── Leadership Team (Founders & Advisory Board)
│   ├── Core Values
│   ├── Benefits Section
│   └── Open Positions Section
├── Enhanced Job Application System
│   ├── JobApplicationPopup Component
│   │   ├── Position Selection Display
│   │   ├── CV Upload Section
│   │   ├── Profile Links Section
│   │   │   ├── LinkedIn Profile (Mandatory)
│   │   │   └── GitHub Profile (Optional)
│   │   ├── Consent Management Section
│   │   │   ├── CV Sharing Consent
│   │   │   ├── AI Processing Consent
│   │   │   └── Communication Consent
│   │   └── Submission & Confirmation
│   └── Integration Points
│       ├── "Apply Now" Button Enhancement
│       └── "Get in Touch" Button Enhancement
└── File Upload Infrastructure
    ├── Drag & Drop Interface
    ├── File Validation
    └── Progress Indicators
```

## Job Application Popup Component

### Purpose
Provide a streamlined, professional application process that captures essential candidate information while maintaining GDPR compliance and preparing for AI-assisted recruitment workflows.

### Component Specifications

#### Position Context Display
```typescript
interface PositionContext {
  title: string;           // Position title in current language
  department: string;      // Department name
  location: string;        // Work location
  type: string;           // Employment type (Full-time, etc.)
}
```

#### File Upload Section
**Supported Formats**: PDF, DOC, DOCX
**Maximum Size**: 10MB per file
**Validation Rules**:
- File type validation with MIME type checking
- File size validation
- Virus scanning preparation (future enhancement)
- Filename sanitization for security

**Upload Interface**:
- Drag and drop area with visual feedback
- File selection button as alternative
- Upload progress indicator
- File preview with download/replace options
- Clear error messaging for validation failures

#### Profile Links Section
**LinkedIn Profile (Mandatory)**:
- URL validation for linkedin.com domains
- Professional profile verification
- Clear indication of mandatory status
- Example format display: `https://linkedin.com/in/username`

**GitHub Profile (Optional)**:
- URL validation for github.com domains
- Repository access verification
- Portfolio showcase capability
- Example format display: `https://github.com/username`

#### Consent Management Section
**CV Sharing Consent**:
```
German: "Ich erlaube voltAIc, meinen Lebenslauf mit vertrauenswürdigen 
Recruiting-Partnern zu teilen, um passende Karrieremöglichkeiten zu finden."

English: "I allow voltAIc to share my CV with trusted recruitment partners 
to identify suitable career opportunities."
```

**AI Processing Consent**:
```
German: "Ich stimme der Verarbeitung meiner Bewerbungsunterlagen durch 
KI-Systeme in der privaten Cloud zu, um den Bewerbungsprozess zu optimieren."

English: "I consent to the processing of my application materials by AI systems 
in the private cloud to optimize the recruitment process."
```

**Communication Consent**:
```
German: "Ich möchte über neue Stellenausschreibungen und den Status meiner 
Bewerbung informiert werden."

English: "I would like to be informed about new job openings and the status 
of my application."
```

## Backend API Specification

### Database Models

#### JobApplication Model
```python
class JobApplication(Base):
    __tablename__ = "job_applications"
    
    id: str = Column(String, primary_key=True)  # UUID
    position_title: str = Column(String, nullable=False)
    position_department: str = Column(String, nullable=False)
    
    # Candidate Information
    linkedin_profile: str = Column(String, nullable=False)
    github_profile: Optional[str] = Column(String, nullable=True)
    
    # File Storage
    cv_filename: str = Column(String, nullable=False)
    cv_file_path: str = Column(String, nullable=False)
    cv_file_size: int = Column(Integer, nullable=False)
    cv_mime_type: str = Column(String, nullable=False)
    
    # Consent Tracking
    consent_cv_sharing: bool = Column(Boolean, default=False)
    consent_ai_processing: bool = Column(Boolean, default=False)
    consent_communications: bool = Column(Boolean, default=False)
    
    # Metadata
    application_language: str = Column(String, default='en')
    user_agent: Optional[str] = Column(String)
    ip_address: Optional[str] = Column(String)
    
    # Timestamps
    created_at: datetime = Column(DateTime, default=datetime.utcnow)
    updated_at: datetime = Column(DateTime, onupdate=datetime.utcnow)
    
    # Application Status
    status: str = Column(String, default='submitted')  # submitted, reviewed, interviewed, etc.
```

### API Endpoints

#### POST /api/v1/careers/applications
**Purpose**: Submit job application with CV upload

**Request Format**:
```typescript
interface JobApplicationRequest {
  position_title: string;
  position_department: string;
  linkedin_profile: string;
  github_profile?: string;
  consent_cv_sharing: boolean;
  consent_ai_processing: boolean;
  consent_communications: boolean;
  cv_file: File;  // Multipart form data
}
```

**Response Format**:
```typescript
interface JobApplicationResponse {
  success: boolean;
  data: {
    application_id: string;
    confirmation_message: {
      en: string;
      de: string;
    };
    next_steps: {
      en: string;
      de: string;
    };
  };
  language: string;
}
```

#### GET /api/v1/careers/applications/config
**Purpose**: Get application configuration and validation rules

**Response Format**:
```typescript
interface ApplicationConfig {
  file_upload: {
    max_size_mb: number;
    allowed_extensions: string[];
    allowed_mime_types: string[];
  };
  profile_validation: {
    linkedin_pattern: string;
    github_pattern: string;
  };
  messages: {
    en: {
      upload_instructions: string;
      consent_explanations: Record<string, string>;
      success_message: string;
    };
    de: {
      upload_instructions: string;
      consent_explanations: Record<string, string>;
      success_message: string;
    };
  };
}
```

## File Storage Architecture

### Local Storage Structure
```
backend/
├── uploads/
│   └── cvs/
│       └── {application_id}/
│           ├── cv_original.{ext}
│           └── metadata.json
```

### Security Measures
- **Directory Permissions**: Restricted to application user only
- **File Validation**: MIME type and extension verification
- **Filename Sanitization**: Remove special characters and scripts
- **Size Limitations**: Enforce maximum file size limits
- **Future S3 Migration**: API structure ready for cloud storage

### File Processing Pipeline
1. **Upload Validation**: File type, size, and format checks
2. **Virus Scanning**: Integration point for future security enhancement
3. **Storage**: Secure local storage with unique application ID
4. **Backup**: Scheduled backup preparation for production
5. **Migration**: API endpoints ready for S3 integration

## Frontend Implementation Details

### State Management
```typescript
interface JobApplicationState {
  isOpen: boolean;
  position: PositionContext | null;
  formData: {
    linkedin_profile: string;
    github_profile: string;
    consents: {
      cv_sharing: boolean;
      ai_processing: boolean;
      communications: boolean;
    };
  };
  uploadState: {
    file: File | null;
    progress: number;
    status: 'idle' | 'uploading' | 'success' | 'error';
    error: string | null;
  };
  validationErrors: Record<string, string>;
}
```

### Form Validation Rules
```typescript
const validationRules = {
  linkedin_profile: {
    required: true,
    pattern: /^https:\/\/(www\.)?linkedin\.com\/in\/[\w-]+\/?$/,
    message: {
      en: 'Please enter a valid LinkedIn profile URL',
      de: 'Bitte geben Sie eine gültige LinkedIn-Profil-URL ein'
    }
  },
  github_profile: {
    required: false,
    pattern: /^https:\/\/github\.com\/[\w-]+\/?$/,
    message: {
      en: 'Please enter a valid GitHub profile URL',
      de: 'Bitte geben Sie eine gültige GitHub-Profil-URL ein'
    }
  },
  cv_file: {
    required: true,
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    message: {
      en: 'Please upload a valid CV file (PDF, DOC, or DOCX, max 10MB)',
      de: 'Bitte laden Sie eine gültige Lebenslauf-Datei hoch (PDF, DOC oder DOCX, max. 10MB)'
    }
  }
};
```

## Integration with Existing Career Page

### Button Enhancement
**Current Implementation**:
```jsx
<a href="/contact/booking" className="bg-primary-600 text-white px-6 py-3 rounded-lg">
  {language === 'en' ? 'Apply Now' : 'Jetzt bewerben'}
</a>
```

**Enhanced Implementation**:
```jsx
<button 
  onClick={() => openJobApplicationPopup(position)}
  className="bg-primary-600 text-white px-6 py-3 rounded-lg"
>
  {language === 'en' ? 'Apply Now' : 'Jetzt bewerben'}
</button>
```

### Position Context Passing
Each "Apply Now" button passes complete position information to the popup for context display and application tracking.

## Multilingual Support

### Content Localization
All popup content, validation messages, and user feedback are provided in both German and English, following the existing language context pattern.

### Consent Text Localization
Consent checkboxes and explanatory text are carefully translated to maintain legal compliance in both languages while ensuring clear user understanding.

## GDPR Compliance

### Consent Tracking
- **Explicit Consent**: Clear checkboxes for each data processing purpose
- **Granular Control**: Separate consent for CV sharing, AI processing, and communications
- **Audit Trail**: Database logging of consent decisions with timestamps
- **Right to Withdrawal**: API structure supports future consent management portal

### Data Processing Transparency
- Clear explanation of how data will be used
- Specific mention of AI processing in private cloud environment
- Transparent information about recruitment partner sharing
- Communication preferences with opt-out capabilities

## Performance Considerations

### File Upload Optimization
- **Chunked Upload**: Large file support with progress tracking
- **Client-side Validation**: Immediate feedback without server round-trip
- **Compression**: Optional PDF optimization for faster uploads
- **Caching**: Configuration data caching for improved performance

### Component Optimization
- **Lazy Loading**: Popup component loaded on first use
- **Form State**: Efficient state management with minimal re-renders
- **Validation**: Debounced validation for real-time feedback
- **Memory Management**: Proper cleanup of file objects

## Accessibility

### WCAG Compliance
- **Keyboard Navigation**: Full keyboard support for all interactions
- **Screen Reader Support**: Proper ARIA labels and descriptions
- **Color Contrast**: Minimum 4.5:1 ratio for all text
- **Focus Management**: Proper focus handling in modal popup

### File Upload Accessibility
- **Alternative Input**: Button fallback for drag-and-drop
- **Progress Announcements**: Screen reader feedback during upload
- **Error Messages**: Clear, programmatically associated error descriptions
- **Success Confirmation**: Accessible confirmation messaging

## Testing Strategy

### Unit Testing
- File validation logic
- Form validation rules
- API request/response handling
- Consent management functions

### Integration Testing
- Complete application submission workflow
- File upload and storage process
- Multi-language content display
- Error handling scenarios

### End-to-End Testing
- Full user journey from career page to application submission
- Cross-browser compatibility
- Mobile responsiveness
- File upload edge cases

## Security Considerations

### File Upload Security
- **File Type Validation**: Server-side MIME type verification
- **Size Limitations**: Prevent DoS attacks through large files
- **Filename Sanitization**: Remove potentially malicious characters
- **Storage Isolation**: Separate directory structure per application

### Data Protection
- **Encrypted Storage**: Preparation for encryption at rest
- **Secure Transmission**: HTTPS enforcement for all API calls
- **Access Logging**: Security audit trail for file access
- **Regular Cleanup**: Scheduled removal of withdrawn applications

## Monitoring and Analytics

### Application Tracking
- **Conversion Rates**: Track application submission success rates
- **Error Analysis**: Monitor validation and upload failures
- **User Behavior**: Analyze drop-off points in application process
- **Performance Metrics**: Upload speed and success rates

### Recruitment Analytics
- **Source Tracking**: Monitor which positions generate most applications
- **Profile Analysis**: GitHub/LinkedIn profile completion rates
- **Consent Analysis**: Track consent selection patterns
- **Time-to-Apply**: Measure application completion times

## Future Enhancements

### AI Integration
- **Resume Parsing**: Automatic extraction of candidate information
- **Skill Matching**: AI-powered position-candidate matching
- **Interview Scheduling**: Automated calendar integration
- **Candidate Ranking**: ML-based candidate scoring

### Advanced Features
- **Video Introductions**: Optional video upload capability
- **Portfolio Integration**: Direct GitHub repository showcasing
- **Reference Checking**: Automated reference contact system
- **Status Portal**: Candidate application tracking portal

This specification establishes a comprehensive job application system that enhances the existing career page while maintaining GDPR compliance, providing excellent user experience, and preparing for future AI-powered recruitment workflows.