import { ApiResponse } from '../types/api'

export interface Position {
  title: string
  department: string
  location: string
  type: string
}

export interface JobApplicationData {
  position_title: string
  position_department: string
  position_location?: string
  position_type?: string
  linkedin_profile: string
  github_profile?: string
  consent_cv_sharing: boolean
  consent_ai_processing: boolean
  consent_communications: boolean
  application_language?: string
  referrer_url?: string
}

export interface JobApplicationSubmissionResponse {
  application_id: string
  reference_number: string
  submitted_at: string
  confirmation_message: string
  next_steps: string
}

export interface ApplicationConfig {
  file_upload: {
    max_size_mb: number
    allowed_extensions: string[]
    allowed_mime_types: string[]
  }
  profile_validation: {
    linkedin_pattern: string
    github_pattern: string
  }
  positions: Array<{
    title: string
    department: string
  }>
  messages: {
    en: Record<string, string>
    de: Record<string, string>
  }
}

class JobApplicationService {
  private baseUrl = '/api/v1/careers'

  async getApplicationConfig(): Promise<ApplicationConfig> {
    try {
      const response = await fetch(`${this.baseUrl}/applications/config`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<{ config: ApplicationConfig }> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch application config')
      }
      
      return result.data.config
    } catch (error) {
      console.error('Error fetching application config:', error)
      throw error
    }
  }

  async submitApplication(
    applicationData: JobApplicationData,
    cvFile: File
  ): Promise<JobApplicationSubmissionResponse> {
    try {
      // Prepare form data
      const formData = new FormData()
      
      // Add application data
      Object.entries(applicationData).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          formData.append(key, typeof value === 'boolean' ? value.toString() : value)
        }
      })
      
      // Add CV file
      formData.append('cv_file', cvFile)
      
      // Submit application
      const response = await fetch(`${this.baseUrl}/applications`, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`
        try {
          const errorResult = await response.json()
          errorMessage = errorResult.detail || errorResult.message || errorMessage
        } catch {
          // Use default error message if can't parse JSON
        }
        throw new Error(errorMessage)
      }
      
      const result: ApiResponse<JobApplicationSubmissionResponse> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Application submission failed')
      }
      
      return result.data
    } catch (error) {
      console.error('Error submitting application:', error)
      throw error
    }
  }

  async getApplicationStatus(applicationId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/applications/${applicationId}`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const result: ApiResponse<any> = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch application status')
      }
      
      return result.data.application
    } catch (error) {
      console.error('Error fetching application status:', error)
      throw error
    }
  }

  // Validation helpers
  validateLinkedInProfile(url: string): boolean {
    const pattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[\w\-\.]+\/?$/
    return pattern.test(url)
  }

  validateGitHubProfile(url: string): boolean {
    const pattern = /^https?:\/\/(www\.)?github\.com\/[\w\-\.]+\/?$/
    return pattern.test(url)
  }

  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type)
  }

  validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024
    return file.size <= maxSizeBytes
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  getFileExtension(filename: string): string {
    return '.' + filename.split('.').pop()?.toLowerCase() || ''
  }

  // Error handling helpers
  parseApiError(error: any): string {
    if (error instanceof Error) {
      return error.message
    }
    
    if (typeof error === 'string') {
      return error
    }
    
    if (error?.detail) {
      return error.detail
    }
    
    if (error?.message) {
      return error.message
    }
    
    return 'An unexpected error occurred'
  }
}

// Export singleton instance
export const jobApplicationService = new JobApplicationService()
export default jobApplicationService