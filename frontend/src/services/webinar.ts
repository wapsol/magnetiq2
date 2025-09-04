import { Webinar, WebinarRegistration, WebinarRegistrationRequest } from '../types/webinar'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8037'

class WebinarService {
  private async fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}/api/v1${endpoint}`
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Network error' }))
      throw new Error(error.detail || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Public endpoints - no authentication required
  async getPublicWebinars(upcomingOnly = true, limit = 10): Promise<Webinar[]> {
    return this.fetchApi(`/business/webinars/public/upcoming`)
  }

  async getPublicWebinarById(id: number): Promise<Webinar> {
    // For now, we'll use the slug endpoint as there's no direct public ID endpoint
    return this.fetchApi(`/business/webinars/slug/webinar-${id}`)
  }

  async getPublicWebinarBySlug(slug: string): Promise<Webinar> {
    return this.fetchApi(`/business/webinars/slug/${slug}`)
  }

  async registerForWebinar(webinarId: number, registrationData: WebinarRegistrationRequest): Promise<WebinarRegistration> {
    return this.fetchApi(`/business/webinars/${webinarId}/register`, {
      method: 'POST',
      body: JSON.stringify(registrationData)
    })
  }

  // Analytics tracking endpoints
  async trackCalendarIntegration(data: {
    webinar_id: string
    calendar_type: string
    registration_id?: string
    timestamp: Date
    user_agent: string
    timezone: string
  }): Promise<void> {
    await this.fetchApi('/public/analytics/calendar-integration', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async trackSocialSharing(data: {
    webinar_id: string
    platform: string
    registration_id?: string
    timestamp: Date
    user_agent: string
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
  }): Promise<void> {
    await this.fetchApi('/public/analytics/social-sharing', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

export const webinarService = new WebinarService()
export default webinarService