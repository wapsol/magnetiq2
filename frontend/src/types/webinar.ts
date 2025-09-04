export interface Webinar {
  id: number
  title: {
    en: string
    de: string
  }
  description: {
    en: string
    de: string
  }
  slug: string
  scheduled_at: string
  duration_minutes: number
  timezone: string
  max_participants?: number
  meeting_url?: string
  presenter_name?: string
  presenter_bio?: {
    en: string
    de: string
  }
  presenter_image?: string
  registration_enabled: boolean
  registration_deadline?: string
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface WebinarRegistration {
  id: number
  webinar_id: number
  first_name: string
  last_name: string
  email: string
  company?: string
  job_title?: string
  phone?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  registration_source: string
  registered_at: string
}

export interface WebinarRegistrationRequest {
  first_name: string
  last_name: string
  email: string
  company?: string
  job_title?: string
  phone?: string
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  consent_marketing?: boolean
  consent_data_processing: boolean
  preferences?: {
    topics?: string[]
    industries?: string[]
    formats?: string[]
    frequency?: string
  }
}