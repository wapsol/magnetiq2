/**
 * Calendar Integration Utilities
 * 
 * Provides functionality to add webinar events to various calendar platforms
 * including Google Calendar, Outlook, Apple Calendar, and ICS file generation.
 */

export interface WebinarCalendarData {
  id: string;
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  timezone: string;
  location?: string;
  meetingUrl?: string;
  presenter?: string;
  registrationId?: string;
}

export interface CalendarUrlOptions {
  includeLocation?: boolean;
  includeDescription?: boolean;
  includeReminders?: boolean;
}

/**
 * Formats a date to the required format for calendar URLs (YYYYMMDDTHHMMSSZ)
 */
function formatDateForCalendar(date: Date): string {
  // Validate the date object
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn('Invalid date provided to formatDateForCalendar:', date);
    // Return current date as fallback
    const fallbackDate = new Date();
    return fallbackDate.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }
  
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

/**
 * Escapes special characters for calendar URL parameters
 */
function escapeCalendarText(text: string): string {
  return encodeURIComponent(text.replace(/\n/g, '\\n'));
}

/**
 * Generates a detailed event description for calendar entries
 */
function generateEventDescription(webinar: WebinarCalendarData): string {
  let description = webinar.description;

  if (webinar.presenter) {
    description += `\\n\\nPresenter: ${webinar.presenter}`;
  }

  if (webinar.meetingUrl) {
    description += `\\n\\nJoin the webinar: ${webinar.meetingUrl}`;
  }

  if (webinar.registrationId) {
    description += `\\n\\nRegistration ID: ${webinar.registrationId}`;
  }

  description += `\\n\\nPowered by voltAIc Systems - https://voltaic.systems`;

  return description;
}

/**
 * Generates Google Calendar URL for adding webinar event
 */
export function generateGoogleCalendarUrl(
  webinar: WebinarCalendarData,
  options: CalendarUrlOptions = {}
): string {
  const {
    includeLocation = true,
    includeDescription = true,
    includeReminders = true
  } = options;

  const startTime = formatDateForCalendar(webinar.startDate);
  const endTime = formatDateForCalendar(webinar.endDate);
  
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: webinar.title,
    dates: `${startTime}/${endTime}`,
    ctz: webinar.timezone
  });

  if (includeDescription) {
    params.append('details', generateEventDescription(webinar));
  }

  if (includeLocation && (webinar.location || webinar.meetingUrl)) {
    params.append('location', webinar.location || webinar.meetingUrl || 'Online Event');
  }

  if (includeReminders) {
    // Google Calendar will use default reminders, but we can suggest some
    params.append('add', '1'); // Add to calendar immediately
  }

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates Outlook Calendar URL for adding webinar event
 * Supports both Outlook Web and Outlook Desktop
 */
export function generateOutlookCalendarUrl(
  webinar: WebinarCalendarData,
  platform: 'web' | 'desktop' = 'web',
  options: CalendarUrlOptions = {}
): string {
  const {
    includeLocation = true,
    includeDescription = true
  } = options;

  const startTime = webinar.startDate.toISOString();
  const endTime = webinar.endDate.toISOString();

  if (platform === 'desktop') {
    // Outlook desktop application protocol
    const params = new URLSearchParams({
      rru: 'addevent',
      startdt: startTime,
      enddt: endTime,
      subject: webinar.title
    });

    if (includeDescription) {
      params.append('body', generateEventDescription(webinar).replace(/\\n/g, '\n'));
    }

    if (includeLocation && (webinar.location || webinar.meetingUrl)) {
      params.append('location', webinar.location || webinar.meetingUrl || 'Online Event');
    }

    return `outlook:${params.toString()}`;
  } else {
    // Outlook Web
    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      startTime: startTime,
      endTime: endTime,
      subject: webinar.title
    });

    if (includeDescription) {
      params.append('body', generateEventDescription(webinar).replace(/\\n/g, '\n'));
    }

    if (includeLocation && (webinar.location || webinar.meetingUrl)) {
      params.append('location', webinar.location || webinar.meetingUrl || 'Online Event');
    }

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  }
}

/**
 * Generates Office 365 Calendar URL
 */
export function generateOffice365CalendarUrl(
  webinar: WebinarCalendarData,
  options: CalendarUrlOptions = {}
): string {
  const {
    includeLocation = true,
    includeDescription = true
  } = options;

  const params = new URLSearchParams({
    startTime: webinar.startDate.toISOString(),
    endTime: webinar.endDate.toISOString(),
    subject: webinar.title
  });

  if (includeDescription) {
    params.append('body', generateEventDescription(webinar).replace(/\\n/g, '\n'));
  }

  if (includeLocation && (webinar.location || webinar.meetingUrl)) {
    params.append('location', webinar.location || webinar.meetingUrl || 'Online Event');
  }

  return `https://outlook.office.com/calendar/0/deeplink/compose?${params.toString()}`;
}

/**
 * Generates Yahoo Calendar URL
 */
export function generateYahooCalendarUrl(
  webinar: WebinarCalendarData,
  options: CalendarUrlOptions = {}
): string {
  const {
    includeLocation = true,
    includeDescription = true
  } = options;

  const params = new URLSearchParams({
    v: '60',
    view: 'd',
    type: '20',
    title: webinar.title,
    st: formatDateForCalendar(webinar.startDate),
    et: formatDateForCalendar(webinar.endDate)
  });

  if (includeDescription) {
    params.append('desc', generateEventDescription(webinar));
  }

  if (includeLocation && (webinar.location || webinar.meetingUrl)) {
    params.append('in_loc', webinar.location || webinar.meetingUrl || 'Online Event');
  }

  return `https://calendar.yahoo.com/?${params.toString()}`;
}

/**
 * Generates ICS (iCalendar) file content for universal calendar compatibility
 */
export function generateICSContent(webinar: WebinarCalendarData): string {
  const now = new Date();
  const uid = `webinar-${webinar.id}-${now.getTime()}@voltaic.systems`;
  const dtstamp = formatDateForCalendar(now);
  const dtstart = formatDateForCalendar(webinar.startDate);
  const dtend = formatDateForCalendar(webinar.endDate);

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//voltAIc Systems//Webinar Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${dtstart}`,
    `DTEND:${dtend}`,
    `SUMMARY:${webinar.title}`,
    `DESCRIPTION:${generateEventDescription(webinar).replace(/\\n/g, '\\n')}`
  ];

  if (webinar.location || webinar.meetingUrl) {
    icsContent.push(`LOCATION:${webinar.location || webinar.meetingUrl || 'Online Event'}`);
  }

  if (webinar.meetingUrl) {
    icsContent.push(`URL:${webinar.meetingUrl}`);
  }

  // Add reminders
  icsContent.push(
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:EMAIL',
    'DESCRIPTION:Webinar Reminder - Tomorrow',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT1H',
    'ACTION:DISPLAY',
    'DESCRIPTION:Webinar starts in 1 hour',
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Webinar starts in 15 minutes',
    'END:VALARM'
  );

  icsContent.push(
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'CATEGORIES:BUSINESS,EDUCATION',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return icsContent.join('\\r\\n');
}

/**
 * Creates and downloads an ICS file
 */
export function downloadICSFile(webinar: WebinarCalendarData, filename?: string): void {
  const icsContent = generateICSContent(webinar);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename || `webinar-${webinar.id}-${webinar.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}.ics`;
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(link.href);
}

/**
 * Detects user's timezone for better calendar integration
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return 'UTC';
  }
}

/**
 * Converts webinar time to user's local timezone
 */
export function convertToUserTimezone(date: Date, userTimezone?: string): Date {
  // Validate the input date
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    console.warn('Invalid date provided to convertToUserTimezone:', date);
    return new Date(); // Return current date as fallback
  }
  
  const timezone = userTimezone || getUserTimezone();
  
  try {
    // Create a new date in user's timezone
    const convertedDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
    
    // Validate the converted date
    if (isNaN(convertedDate.getTime())) {
      console.warn('Date conversion resulted in invalid date:', convertedDate);
      return date; // Return original date as fallback
    }
    
    return convertedDate;
  } catch (error) {
    console.warn('Error converting date to timezone:', error);
    return date; // Fallback to original date
  }
}

/**
 * Formats date and time for display in user's locale
 */
export function formatWebinarDateTime(
  startDate: Date,
  endDate: Date,
  timezone?: string,
  locale: string = 'en-US'
): {
  date: string;
  startTime: string;
  endTime: string;
  timezone: string;
  duration: string;
} {
  const userTimezone = timezone || getUserTimezone();
  
  const options: Intl.DateTimeFormatOptions = {
    timeZone: userTimezone,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  };

  const timeOptions: Intl.DateTimeFormatOptions = {
    timeZone: userTimezone,
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  };

  const date = startDate.toLocaleDateString(locale, options);
  const startTime = startDate.toLocaleTimeString(locale, timeOptions);
  const endTime = endDate.toLocaleTimeString(locale, timeOptions);
  
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationMinutes = Math.floor(durationMs / (1000 * 60));
  const duration = durationMinutes >= 60 
    ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
    : `${durationMinutes}m`;

  return {
    date,
    startTime,
    endTime,
    timezone: userTimezone,
    duration
  };
}

/**
 * Comprehensive calendar integration function that returns all calendar options
 */
export function getCalendarIntegrations(
  webinar: WebinarCalendarData,
  options: CalendarUrlOptions = {}
): {
  google: string;
  outlook: string;
  office365: string;
  yahoo: string;
  ics: () => void;
  icsContent: string;
} {
  return {
    google: generateGoogleCalendarUrl(webinar, options),
    outlook: generateOutlookCalendarUrl(webinar, 'web', options),
    office365: generateOffice365CalendarUrl(webinar, options),
    yahoo: generateYahooCalendarUrl(webinar, options),
    ics: () => downloadICSFile(webinar),
    icsContent: generateICSContent(webinar)
  };
}

/**
 * Analytics tracking for calendar integration usage
 */
export function trackCalendarIntegration(
  webinarId: string,
  calendarType: 'google' | 'outlook' | 'office365' | 'yahoo' | 'ics',
  registrationId?: string
): void {
  // Track calendar integration usage for analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'calendar_integration', {
      event_category: 'webinar',
      event_label: calendarType,
      custom_parameter_1: webinarId,
      custom_parameter_2: registrationId || 'anonymous'
    });
  }

  // Also send to internal analytics
  fetch('/api/v1/analytics/calendar-integration', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      webinarId,
      calendarType,
      registrationId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      timezone: getUserTimezone()
    }),
  }).catch((error) => {
    console.warn('Failed to track calendar integration:', error);
  });
}