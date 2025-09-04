import { apiClient } from './api';
import { 
  Whitepaper, 
  WhitepaperDownloadRequest, 
  WhitepaperDownloadResponse,
  EmailValidationResponse,
  WhitepaperFilters 
} from '../types/whitepaper';

class WhitepaperService {
  private baseUrl = '/api/v1/public/whitepapers';

  /**
   * Get list of published whitepapers
   */
  async listWhitepapers(filters: WhitepaperFilters = {}): Promise<Whitepaper[]> {
    const params = new URLSearchParams();
    
    if (filters.featured_only) {
      params.append('featured_only', 'true');
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.industry) {
      params.append('industry', filters.industry);
    }
    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }
    if (filters.offset) {
      params.append('offset', filters.offset.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;
    
    const response = await apiClient.get<Whitepaper[]>(url);
    return response.data;
  }

  /**
   * Get a specific whitepaper by slug
   */
  async getWhitepaperBySlug(slug: string): Promise<Whitepaper> {
    const response = await apiClient.get<Whitepaper>(`${this.baseUrl}/${slug}`);
    return response.data;
  }

  /**
   * Request whitepaper download (triggers email validation)
   */
  async requestDownload(
    whitepaperId: number, 
    downloadRequest: WhitepaperDownloadRequest
  ): Promise<WhitepaperDownloadResponse> {
    const response = await apiClient.post<WhitepaperDownloadResponse>(
      `${this.baseUrl}/${whitepaperId}/download`,
      downloadRequest
    );
    return response.data;
  }

  /**
   * Validate email for whitepaper download
   */
  async validateEmail(token: string): Promise<EmailValidationResponse> {
    const response = await apiClient.get<EmailValidationResponse>(
      `${this.baseUrl}/validate-email/${token}`
    );
    return response.data;
  }

  /**
   * Get secure download link (after email validation)
   */
  getDownloadUrl(token: string): string {
    return `${window.location.origin}${this.baseUrl}/download/${token}`;
  }

  /**
   * Generate category display name
   */
  getCategoryDisplayName(category: string, language: string = 'en'): string {
    const categoryNames: { [key: string]: { [lang: string]: string } } = {
      'case-study': {
        en: 'Case Study',
        de: 'Fallstudie'
      },
      'guide': {
        en: 'Guide',
        de: 'Leitfaden'
      },
      'report': {
        en: 'Report',
        de: 'Bericht'
      },
      'research': {
        en: 'Research',
        de: 'Forschung'
      },
      'best-practices': {
        en: 'Best Practices',
        de: 'Best Practices'
      }
    };

    return categoryNames[category]?.[language] || category;
  }

  /**
   * Extract UTM parameters from URL
   */
  getUtmParameters(): {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  } {
    const urlParams = new URLSearchParams(window.location.search);
    return {
      utm_source: urlParams.get('utm_source') || undefined,
      utm_medium: urlParams.get('utm_medium') || undefined,
      utm_campaign: urlParams.get('utm_campaign') || undefined
    };
  }

  /**
   * Format publication date
   */
  formatPublishedDate(dateString: string, language: string = 'en'): string {
    const date = new Date(dateString);
    return date.toLocaleDateString(language, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Generate SEO-friendly whitepaper URL
   */
  getWhitepaperUrl(slug: string): string {
    return `${window.location.origin}/resources/whitepapers/${slug}`;
  }

  /**
   * Share whitepaper on social media
   */
  shareWhitepaper(whitepaper: Whitepaper, platform: string, language: string = 'en') {
    const title = whitepaper.title[language] || whitepaper.title.en;
    const description = whitepaper.description[language] || whitepaper.description.en;
    const url = this.getWhitepaperUrl(whitepaper.slug);
    
    const shareUrls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + url)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(title + '\n' + url)}`
    };

    const shareUrl = shareUrls[platform];
    if (shareUrl) {
      if (platform === 'email') {
        window.location.href = shareUrl;
      } else {
        window.open(shareUrl, '_blank', 'width=600,height=400');
      }
    }
  }

  /**
   * Track whitepaper interaction (view, download request, etc.)
   */
  async trackInteraction(whitepaperId: number, action: string, metadata?: any): Promise<void> {
    try {
      await apiClient.post('/api/v1/public/analytics/whitepaper-interaction', {
        whitepaper_id: whitepaperId,
        action,
        metadata,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        user_agent: navigator.userAgent,
        ...this.getUtmParameters()
      });
    } catch (error) {
      // Analytics failures shouldn't break the user experience
      console.warn('Failed to track whitepaper interaction:', error);
    }
  }
}

export const whitepaperService = new WhitepaperService();