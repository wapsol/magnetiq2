/**
 * Social Sharing Utilities
 * 
 * Provides functionality to share webinar content across various social media platforms
 * including LinkedIn, Twitter, Facebook, and custom sharing options.
 */

export interface WebinarSharingData {
  id: string;
  title: string;
  description: string;
  url: string;
  imageUrl?: string;
  presenter?: string;
  presenterTitle?: string;
  date: Date;
  category: string;
  tags: string[];
  company: string;
}

export interface SharingOptions {
  includeHashtags?: boolean;
  includePresenter?: boolean;
  includeDate?: boolean;
  customMessage?: string;
  trackingParams?: {
    source: string;
    medium: string;
    campaign: string;
  };
}

export interface UserProfile {
  role?: string;
  industry?: string;
  company?: string;
  seniority?: 'entry' | 'mid' | 'senior' | 'executive';
}

/**
 * Escapes text for URL parameters
 */
function escapeForUrl(text: string): string {
  return encodeURIComponent(text);
}

/**
 * Adds UTM tracking parameters to URL
 */
function addTrackingParams(
  url: string,
  params: SharingOptions['trackingParams']
): string {
  if (!params) return url;

  const urlObj = new URL(url);
  urlObj.searchParams.set('utm_source', params.source);
  urlObj.searchParams.set('utm_medium', params.medium);
  urlObj.searchParams.set('utm_campaign', params.campaign);
  
  return urlObj.toString();
}

/**
 * Generates industry-specific hashtags
 */
function getIndustryHashtags(category: string, tags: string[]): string[] {
  const industryMap: Record<string, string[]> = {
    'ai': ['#ArtificialIntelligence', '#MachineLearning', '#AI', '#DeepLearning', '#DataScience'],
    'business': ['#BusinessStrategy', '#Leadership', '#Innovation', '#Growth', '#Entrepreneurship'],
    'technology': ['#Technology', '#DigitalTransformation', '#Innovation', '#TechTrends', '#Future'],
    'data': ['#DataScience', '#BigData', '#Analytics', '#DataDriven', '#BusinessIntelligence'],
    'automation': ['#Automation', '#ProcessOptimization', '#Efficiency', '#DigitalTransformation'],
    'cloud': ['#CloudComputing', '#AWS', '#Azure', '#CloudStrategy', '#Infrastructure'],
    'cybersecurity': ['#Cybersecurity', '#InfoSec', '#DataProtection', '#Security', '#Privacy']
  };

  const baseHashtags = industryMap[category.toLowerCase()] || ['#Professional', '#Learning'];
  
  // Add tag-specific hashtags
  const tagHashtags = tags.slice(0, 3).map(tag => 
    `#${tag.replace(/[^a-zA-Z0-9]/g, '')}`
  );

  return [...baseHashtags.slice(0, 3), ...tagHashtags].slice(0, 5);
}

/**
 * Generates role-specific messaging
 */
function getRoleSpecificMessage(
  webinar: WebinarSharingData,
  userProfile?: UserProfile
): string {
  const roleMessages: Record<string, string> = {
    'cto': 'Essential insights for technical leadership',
    'ceo': 'Strategic perspectives for business leaders',
    'manager': 'Actionable insights for team management',
    'developer': 'Technical deep-dive for practitioners',
    'consultant': 'Expert knowledge for client engagements',
    'analyst': 'Data-driven insights for strategic decisions'
  };

  const industryMessages: Record<string, string> = {
    'technology': 'Cutting-edge insights for tech professionals',
    'finance': 'Strategic perspectives for financial services',
    'healthcare': 'Innovation insights for healthcare leaders',
    'manufacturing': 'Operational excellence for manufacturing',
    'retail': 'Customer-centric strategies for retail success'
  };

  if (userProfile?.role) {
    const roleKey = userProfile.role.toLowerCase();
    if (roleMessages[roleKey]) {
      return roleMessages[roleKey];
    }
  }

  if (userProfile?.industry) {
    const industryKey = userProfile.industry.toLowerCase();
    if (industryMessages[industryKey]) {
      return industryMessages[industryKey];
    }
  }

  return 'Valuable insights for professional growth';
}

/**
 * Generates LinkedIn-optimized sharing content
 */
export function generateLinkedInShare(
  webinar: WebinarSharingData,
  options: SharingOptions = {},
  userProfile?: UserProfile
): {
  url: string;
  message: string;
  postContent: string;
} {
  const trackingParams = {
    source: 'linkedin',
    medium: 'social',
    campaign: `webinar-${webinar.id}`,
    ...options.trackingParams
  };

  const shareUrl = addTrackingParams(webinar.url, trackingParams);
  
  let message = options.customMessage || `🎯 ${getRoleSpecificMessage(webinar, userProfile)}`;
  
  message += `\\n\\n📚 Join me for: "${webinar.title}"`;
  
  if (options.includePresenter && webinar.presenter) {
    message += `\\n👨‍🏫 Expert presenter: ${webinar.presenter}`;
    if (webinar.presenterTitle) {
      message += `, ${webinar.presenterTitle}`;
    }
  }

  if (options.includeDate) {
    const dateStr = webinar.date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    message += `\\n📅 ${dateStr}`;
  }

  message += `\\n\\n💡 ${webinar.description && typeof webinar.description === 'string' ? webinar.description.slice(0, 150) + '...' : 'Join us for this insightful webinar'}`;
  message += `\\n\\n🔗 Register now: ${shareUrl}`;

  if (options.includeHashtags) {
    const hashtags = getIndustryHashtags(webinar.category, webinar.tags);
    message += `\\n\\n${hashtags.join(' ')}`;
  }

  message += `\\n\\n#ProfessionalDevelopment #voltAIc #ExpertWebinar`;

  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({
    url: shareUrl,
    mini: 'true',
    title: webinar.title,
    summary: message.slice(0, 700) // LinkedIn has character limits
  }).toString()}`;

  return {
    url: linkedinUrl,
    message: message,
    postContent: message
  };
}

/**
 * Generates Twitter-optimized sharing content
 */
export function generateTwitterShare(
  webinar: WebinarSharingData,
  options: SharingOptions = {},
  userProfile?: UserProfile
): {
  url: string;
  message: string;
  thread?: string[];
} {
  const trackingParams = {
    source: 'twitter',
    medium: 'social',
    campaign: `webinar-${webinar.id}`,
    ...options.trackingParams
  };

  const shareUrl = addTrackingParams(webinar.url, trackingParams);
  
  let message = options.customMessage || '🚀 Exciting learning opportunity!';
  message += ` "${webinar.title}"`;

  if (options.includePresenter && webinar.presenter) {
    message += ` with ${webinar.presenter}`;
  }

  // Add date in compact format
  if (options.includeDate) {
    const dateStr = webinar.date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
    message += ` on ${dateStr}`;
  }

  message += `\\n\\n${shareUrl}`;

  if (options.includeHashtags) {
    const hashtags = getIndustryHashtags(webinar.category, webinar.tags);
    const hashtagString = hashtags.slice(0, 3).join(' ');
    
    // Ensure we stay within 280 character limit
    if (message.length + hashtagString.length + 10 < 280) {
      message += `\\n\\n${hashtagString}`;
    }
  }

  // Generate thread for longer content
  const thread = [
    message,
    `🎯 What you'll learn:\\n${webinar.description && typeof webinar.description === 'string' ? webinar.description.slice(0, 200) + '...' : 'Key insights and actionable strategies'}`,
    `📊 Perfect for: ${getRoleSpecificMessage(webinar, userProfile)}\\n\\nRegister: ${shareUrl}`
  ];

  const twitterUrl = `https://twitter.com/intent/tweet?${new URLSearchParams({
    text: message,
    url: shareUrl,
    hashtags: webinar.tags.slice(0, 2).join(',')
  }).toString()}`;

  return {
    url: twitterUrl,
    message: message,
    thread: thread
  };
}

/**
 * Generates Facebook-optimized sharing content
 */
export function generateFacebookShare(
  webinar: WebinarSharingData,
  options: SharingOptions = {},
  userProfile?: UserProfile
): {
  url: string;
  message: string;
} {
  const trackingParams = {
    source: 'facebook',
    medium: 'social',
    campaign: `webinar-${webinar.id}`,
    ...options.trackingParams
  };

  const shareUrl = addTrackingParams(webinar.url, trackingParams);
  
  let message = options.customMessage || `📚 Professional Development Opportunity`;
  message += `\\n\\n"${webinar.title}"`;
  
  if (options.includePresenter && webinar.presenter) {
    message += `\\n\\n🎤 Presented by ${webinar.presenter}`;
    if (webinar.presenterTitle) {
      message += `, ${webinar.presenterTitle}`;
    }
  }

  if (options.includeDate) {
    const dateStr = webinar.date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
    message += `\\n\\n📅 ${dateStr}`;
  }

  message += `\\n\\n${webinar.description}`;
  message += `\\n\\n💼 ${getRoleSpecificMessage(webinar, userProfile)}`;
  message += `\\n\\n👥 Join professionals from leading companies in this expert-led session.`;
  message += `\\n\\n🔗 Register now: ${shareUrl}`;

  if (options.includeHashtags) {
    const hashtags = getIndustryHashtags(webinar.category, webinar.tags);
    message += `\\n\\n${hashtags.slice(0, 3).join(' ')}`;
  }

  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?${new URLSearchParams({
    u: shareUrl,
    quote: message
  }).toString()}`;

  return {
    url: facebookUrl,
    message: message
  };
}

/**
 * Generates email sharing content
 */
export function generateEmailShare(
  webinar: WebinarSharingData,
  options: SharingOptions = {},
  userProfile?: UserProfile
): {
  subject: string;
  body: string;
  mailto: string;
} {
  const trackingParams = {
    source: 'email',
    medium: 'email',
    campaign: `webinar-${webinar.id}`,
    ...options.trackingParams
  };

  const shareUrl = addTrackingParams(webinar.url, trackingParams);
  
  const subject = `Expert Webinar Invitation: ${webinar.title}`;
  
  let body = `Hi there,\\n\\n`;
  body += `I wanted to share this valuable learning opportunity with you:\\n\\n`;
  body += `📚 "${webinar.title}"\\n\\n`;
  
  if (webinar.presenter) {
    body += `🎤 Presented by: ${webinar.presenter}`;
    if (webinar.presenterTitle) {
      body += `, ${webinar.presenterTitle}`;
    }
    body += `\\n\\n`;
  }

  if (options.includeDate) {
    const dateStr = webinar.date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    body += `📅 When: ${dateStr}\\n\\n`;
  }

  body += `📋 Overview:\\n${webinar.description}\\n\\n`;
  body += `💡 This session offers ${getRoleSpecificMessage(webinar, userProfile).toLowerCase()}.\\n\\n`;
  body += `🔗 Register here: ${shareUrl}\\n\\n`;
  body += `Hope to see you there!\\n\\n`;
  body += `Best regards`;

  const mailto = `mailto:?${new URLSearchParams({
    subject: subject,
    body: body
  }).toString()}`;

  return {
    subject,
    body,
    mailto
  };
}

/**
 * Generates WhatsApp sharing content
 */
export function generateWhatsAppShare(
  webinar: WebinarSharingData,
  options: SharingOptions = {}
): {
  url: string;
  message: string;
} {
  const trackingParams = {
    source: 'whatsapp',
    medium: 'messaging',
    campaign: `webinar-${webinar.id}`,
    ...options.trackingParams
  };

  const shareUrl = addTrackingParams(webinar.url, trackingParams);
  
  let message = `🎯 *${webinar.title}*\\n\\n`;
  
  if (webinar.presenter) {
    message += `👨‍🏫 Presenter: *${webinar.presenter}*\\n`;
  }

  if (options.includeDate) {
    const dateStr = webinar.date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
    message += `📅 Date: ${dateStr}\\n`;
  }

  message += `\\n📚 ${webinar.description && typeof webinar.description === 'string' ? webinar.description.slice(0, 100) + '...' : 'Join this insightful webinar'}\\n\\n`;
  message += `Register: ${shareUrl}`;

  const whatsappUrl = `https://wa.me/?${new URLSearchParams({
    text: message
  }).toString()}`;

  return {
    url: whatsappUrl,
    message
  };
}

/**
 * Copies share link to clipboard
 */
export async function copyShareLink(
  url: string,
  trackingParams?: SharingOptions['trackingParams']
): Promise<boolean> {
  try {
    const shareUrl = trackingParams ? addTrackingParams(url, trackingParams) : url;
    
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(shareUrl);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

/**
 * Generates custom share message based on context
 */
export function generateCustomMessage(
  webinar: WebinarSharingData,
  context: {
    platform: 'linkedin' | 'twitter' | 'facebook' | 'email' | 'whatsapp';
    userProfile?: UserProfile;
    relationship?: 'colleague' | 'friend' | 'professional' | 'team';
    purpose?: 'invitation' | 'recommendation' | 'announcement';
  }
): string {
  const { platform, userProfile, relationship = 'professional', purpose = 'invitation' } = context;

  const relationshipTone: Record<string, string> = {
    colleague: 'thought you might be interested in',
    friend: 'found this great opportunity and thought of you',
    professional: 'would like to share this valuable learning opportunity',
    team: 'wanted to share this with the team'
  };

  const purposeIntro: Record<string, string> = {
    invitation: 'I\'d like to invite you to',
    recommendation: 'I highly recommend',
    announcement: 'Excited to announce'
  };

  let intro = `${purposeIntro[purpose]} ${relationshipTone[relationship]}`;
  
  if (platform === 'twitter') {
    intro = '🚀 Don\'t miss:';
  } else if (platform === 'linkedin') {
    intro = '🎯 Professional development opportunity:';
  }

  return intro;
}

/**
 * Get all sharing options for a webinar
 */
export function getAllSharingOptions(
  webinar: WebinarSharingData,
  options: SharingOptions = {},
  userProfile?: UserProfile
): {
  linkedin: ReturnType<typeof generateLinkedInShare>;
  twitter: ReturnType<typeof generateTwitterShare>;
  facebook: ReturnType<typeof generateFacebookShare>;
  email: ReturnType<typeof generateEmailShare>;
  whatsapp: ReturnType<typeof generateWhatsAppShare>;
  copyLink: () => Promise<boolean>;
} {
  return {
    linkedin: generateLinkedInShare(webinar, options, userProfile),
    twitter: generateTwitterShare(webinar, options, userProfile),
    facebook: generateFacebookShare(webinar, options, userProfile),
    email: generateEmailShare(webinar, options, userProfile),
    whatsapp: generateWhatsAppShare(webinar, options),
    copyLink: () => copyShareLink(webinar.url, options.trackingParams)
  };
}

/**
 * Analytics tracking for social sharing
 */
export function trackSocialShare(
  webinarId: string,
  platform: string,
  registrationId?: string,
  userProfile?: UserProfile
): void {
  // Track social sharing for analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'social_share', {
      event_category: 'webinar',
      event_label: platform,
      custom_parameter_1: webinarId,
      custom_parameter_2: registrationId || 'anonymous',
      custom_parameter_3: userProfile?.role || 'unknown'
    });
  }

  // Send to internal analytics
  fetch('/api/v1/analytics/social-share', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      webinarId,
      platform,
      registrationId,
      userProfile,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      referrer: document.referrer
    }),
  }).catch((error) => {
    console.warn('Failed to track social share:', error);
  });
}

/**
 * Generate social media meta tags for webinar pages
 */
export function generateSocialMetaTags(webinar: WebinarSharingData): {
  title: string;
  description: string;
  image: string;
  url: string;
  type: string;
  siteName: string;
  twitterCard: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
} {
  const title = `${webinar.title} | Expert Webinar by voltAIc Systems`;
  const description = `${webinar.description && typeof webinar.description === 'string' ? webinar.description.slice(0, 160) + '...' : 'Discover valuable insights and best practices'} Join ${webinar.presenter || 'expert presenters'} in this exclusive webinar.`;

  return {
    title,
    description,
    image: webinar.imageUrl || `${webinar.url}/og-image.jpg`,
    url: webinar.url,
    type: 'website',
    siteName: 'voltAIc Systems',
    twitterCard: 'summary_large_image',
    twitterTitle: title,
    twitterDescription: description,
    twitterImage: webinar.imageUrl || `${webinar.url}/twitter-card.jpg`
  };
}