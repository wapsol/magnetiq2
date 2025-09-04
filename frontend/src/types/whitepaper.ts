export interface Whitepaper {
  id: number;
  title: { [key: string]: string };
  description: { [key: string]: string };
  slug: string;
  category: string | null;
  tags: string[] | null;
  industry: string[] | null;
  preview_content: { [key: string]: string } | null;
  meta_title: { [key: string]: string } | null;
  meta_description: { [key: string]: string } | null;
  featured: boolean;
  requires_registration: boolean;
  published_at: string | null;
  download_count: number;
  view_count: number;
  thumbnail_id: number | null;
}

export interface WhitepaperDownloadRequest {
  first_name: string;
  last_name: string;
  email: string;
  company?: string;
  job_title?: string;
  phone?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
}

export interface WhitepaperDownloadResponse {
  message: string;
  validation_required: boolean;
  download_id: number;
}

export interface EmailValidationResponse {
  success: boolean;
  message: string;
  download_url?: string;
  expires_at?: string;
}

export enum WhitepaperCategory {
  CASE_STUDY = 'case-study',
  GUIDE = 'guide',
  REPORT = 'report',
  RESEARCH = 'research',
  BEST_PRACTICES = 'best-practices'
}

export interface WhitepaperFilters {
  category?: string;
  industry?: string;
  featured_only?: boolean;
  limit?: number;
  offset?: number;
}