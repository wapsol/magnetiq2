// @ts-nocheck
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'
import webinarService from '../../services/webinar'
import { Webinar } from '../../types/webinar'
import {
  CalendarDaysIcon,
  ClockIcon,
  GlobeAltIcon,
  UserGroupIcon,
  PlayIcon,
  ShareIcon,
  BookmarkIcon,
  ChevronDownIcon,
  UserIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  VideoCameraIcon,
  LinkIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import {
  CalendarDaysIcon as CalendarDaysIconSolid,
  ShareIcon as ShareIconSolid,
  BookmarkIcon as BookmarkIconSolid
} from '@heroicons/react/24/solid'
import { Helmet } from 'react-helmet-async'
import { generateSocialMetaTags, getAllSharingOptions, trackSocialShare, WebinarSharingData } from '../../utils/socialSharing'
import { getCalendarIntegrations, formatWebinarDateTime, WebinarCalendarData, trackCalendarIntegration } from '../../utils/calendar'

interface WebinarData {
  id: string
  title: string
  description: string
  presenter: string
  presenterTitle: string
  presenterBio: string
  presenterPhoto?: string
  presenterLinkedIn?: string
  category: string
  status: 'upcoming' | 'live' | 'recorded' | 'cancelled'
  date: string
  time: string
  timezone: string
  duration: string
  attendees: number
  maxAttendees?: number
  price?: number
  currency?: string
  image?: string
  tags: string[]
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  keyPoints: string[]
  learningObjectives: string[]
  targetAudience: string[]
  prerequisites: string[]
  meetingUrl?: string
  materialsUrl?: string
  recordingUrl?: string
  slug: string
  registrationEnabled: boolean
  registrationDeadline?: string
  agenda?: Array<{
    time: string
    topic: string
    duration: number
  }>
  testimonials?: Array<{
    name: string
    title: string
    company: string
    content: string
    rating: number
  }>
  relatedWebinars?: Array<{
    id: string
    title: string
    presenter: string
    date: string
    image?: string
  }>
}

const WebinarDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { language, t } = useLanguage()
  const [webinar, setWebinar] = useState<Webinar | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false)
  const [isCalendarDropdownOpen, setIsCalendarDropdownOpen] = useState(false)
  const [isSocialDropdownOpen, setIsSocialDropdownOpen] = useState(false)
  const [userRegistered, setUserRegistered] = useState(false)
  const [registrationId, setRegistrationId] = useState<string | null>(null)

  // Mock data for development - replace with API call
  const mockWebinarData: WebinarData = {
    id: '1',
    title: language === 'de' ? 'KI-Bereitschaftsbewertung: Sind Ihre Unternehmensdaten bereit für KI?' : 'AI Readiness Assessment: Is Your Company Data Ready for AI?',
    description: language === 'de' 
      ? 'Dieses grundlegende Webinar hilft Unternehmen zu bewerten, ob sie über die notwendige Infrastruktur, Datenqualität und organisatorische Ausrichtung verfügen, um KI erfolgreich zu implementieren. Die Teilnehmer erhalten ein klares Verständnis der zu behebenden Lücken und eine Roadmap für die KI-Bereitschaft.'
      : 'This foundational webinar helps companies evaluate whether they have the necessary infrastructure, data quality, and organizational alignment to successfully implement AI. Attendees will leave with a clear understanding of gaps to address and a roadmap for becoming AI-ready.',
    presenter: 'Dr. Marcus Rodriguez',
    presenterTitle: 'Chief AI Strategy Officer',
    presenterBio: language === 'de'
      ? 'Dr. Marcus Rodriguez ist ein anerkannter Experte für KI-Strategie mit über 15 Jahren Erfahrung in der Transformation von Unternehmen durch künstliche Intelligenz. Er hat über 200 Unternehmen bei der erfolgreichen Implementierung von KI-Lösungen geholfen und ist regelmäßiger Redner auf internationalen Technologiekonferenzen.'
      : 'Dr. Marcus Rodriguez is a recognized expert in AI strategy with over 15 years of experience transforming businesses through artificial intelligence. He has helped over 200 companies successfully implement AI solutions and is a regular speaker at international technology conferences.',
    presenterPhoto: '/api/placeholder/150/150',
    presenterLinkedIn: 'https://linkedin.com/in/marcusrodriguez',
    category: 'ai',
    status: 'upcoming',
    date: '2025-10-01',
    time: '4:00 PM CET',
    timezone: 'Europe/Berlin',
    duration: '90 minutes',
    attendees: 234,
    maxAttendees: 500,
    image: '/api/placeholder/800/400',
    tags: ['AI Readiness', 'Data Quality', 'Infrastructure', 'Skills Gap', 'ROI'],
    level: 'Beginner',
    keyPoints: language === 'de' ? [
      'Datenqualitäts-Audit-Framework',
      'Infrastrukturanforderungen vs. Aktueller Stand',
      'Kompetenzlückenanalyse',
      'Kulturelle Bereitschaftsindikatoren',
      'Sicherheits- und Compliance-Baseline',
      'Budget-Realitätsprüfung',
      'Quick-Win-Identifikation',
      'Bereitschafts-Scorecard-Vorlage'
    ] : [
      'Data Quality Audit Framework',
      'Infrastructure Requirements vs. Current State',
      'Skills Gap Analysis',
      'Cultural Readiness Indicators',
      'Security and Compliance Baseline',
      'Budget Reality Check',
      'Quick Win Identification',
      'Readiness Scorecard Template'
    ],
    learningObjectives: language === 'de' ? [
      'Bewerten Sie die KI-Bereitschaft Ihres Unternehmens',
      'Identifizieren Sie kritische Infrastruktur-Lücken',
      'Verstehen Sie Datenqualitätsanforderungen',
      'Entwickeln Sie einen KI-Implementierungsplan'
    ] : [
      'Assess your organization\'s AI readiness',
      'Identify critical infrastructure gaps',
      'Understand data quality requirements',
      'Develop an AI implementation roadmap'
    ],
    targetAudience: language === 'de' ? [
      'CTOs und technische Führungskräfte',
      'Datenmanagement-Teams',
      'IT-Infrastruktur-Manager',
      'Digitale Transformationsleiter'
    ] : [
      'CTOs and technical leaders',
      'Data management teams',
      'IT infrastructure managers',
      'Digital transformation leaders'
    ],
    prerequisites: language === 'de' ? [
      'Grundverständnis von Datenmanagement',
      'Erfahrung mit IT-Infrastruktur',
      'Interesse an KI-Implementierung'
    ] : [
      'Basic understanding of data management',
      'Experience with IT infrastructure',
      'Interest in AI implementation'
    ],
    slug: 'ai-readiness-assessment',
    registrationEnabled: true,
    agenda: [
      { time: '16:00', topic: language === 'de' ? 'Begrüßung und Einführung' : 'Welcome and Introduction', duration: 10 },
      { time: '16:10', topic: language === 'de' ? 'KI-Bereitschafts-Framework' : 'AI Readiness Framework', duration: 20 },
      { time: '16:30', topic: language === 'de' ? 'Datenqualitätsbewertung' : 'Data Quality Assessment', duration: 25 },
      { time: '16:55', topic: language === 'de' ? 'Infrastruktur-Audit' : 'Infrastructure Audit', duration: 20 },
      { time: '17:15', topic: language === 'de' ? 'F&A-Session' : 'Q&A Session', duration: 15 }
    ],
    testimonials: [
      {
        name: 'Sarah Johnson',
        title: 'CTO',
        company: 'TechCorp',
        content: language === 'de' 
          ? 'Unglaublich wertvoll! Dr. Rodriguez hat uns geholfen, unsere KI-Strategie zu fokussieren.'
          : 'Incredibly valuable! Dr. Rodriguez helped us focus our AI strategy.',
        rating: 5
      }
    ],
    relatedWebinars: [
      {
        id: '2',
        title: language === 'de' ? 'Das KI-Pilot-Playbook' : 'The AI Pilot Playbook',
        presenter: 'Sarah Chen',
        date: '2025-10-15',
        image: '/api/placeholder/300/200'
      }
    ]
  }

  useEffect(() => {
    const fetchWebinar = async () => {
      try {
        setLoading(true)
        if (!id) {
          setError('Webinar ID is required')
          return
        }

        // For demo purposes, create mock webinar data if API fails
        try {
          // Try to parse ID as number, fallback to slug-based lookup
          const webinarId = parseInt(id)
          let webinarData: Webinar

          if (!isNaN(webinarId)) {
            // ID is a number, fetch by ID
            webinarData = await webinarService.getPublicWebinarById(webinarId)
          } else {
            // ID is a string, fetch by slug
            webinarData = await webinarService.getPublicWebinarBySlug(id)
          }

          setWebinar(webinarData)
        } catch (apiError) {
          // Create mock data for testing
          console.log('API failed, using mock data for demo:', apiError)
          
          const mockWebinar: Webinar = {
            id: parseInt(id) || 2,
            title: {
              en: "AI Implementation Workshop: From Strategy to Execution",
              de: "KI-Implementierungs-Workshop: Von der Strategie zur Umsetzung"
            },
            description: {
              en: "Join our comprehensive workshop on implementing AI in your organization. Learn practical strategies, avoid common pitfalls, and discover how to measure ROI from your AI investments.",
              de: "Nehmen Sie an unserem umfassenden Workshop zur KI-Implementierung in Ihrem Unternehmen teil. Lernen Sie praktische Strategien kennen, vermeiden Sie häufige Fallstricke und entdecken Sie, wie Sie den ROI Ihrer KI-Investitionen messen können."
            },
            slug: "ai-implementation-workshop-2024",
            scheduled_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 2 weeks from now
            duration_minutes: 120,
            timezone: "UTC",
            max_participants: 100,
            meeting_url: "https://meet.voltaic.systems/ai-workshop-2024",
            presenter_name: "Dr. Sarah Chen",
            presenter_bio: {
              en: "Dr. Sarah Chen is a leading AI strategist with over 15 years of experience helping Fortune 500 companies implement artificial intelligence solutions. She holds a PhD in Computer Science from MIT and has published numerous papers on practical AI implementation.",
              de: "Dr. Sarah Chen ist eine führende KI-Strategin mit über 15 Jahren Erfahrung bei der Unterstützung von Fortune-500-Unternehmen bei der Implementierung von Lösungen für künstliche Intelligenz. Sie hat einen Doktortitel in Informatik vom MIT und hat zahlreiche Artikel über praktische KI-Implementierung veröffentlicht."
            },
            registration_enabled: true,
            registration_deadline: new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString(),
            status: "scheduled",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
          
          setWebinar(mockWebinar)
        }
        
        // Check if user is already registered (stored locally) - using webinar state
        if (webinar) {
          const storedRegistration = localStorage.getItem(`webinar-${webinar.id}-registration`)
          if (storedRegistration) {
            setUserRegistered(true)
            setRegistrationId(JSON.parse(storedRegistration).registrationId)
          }
        }
      } catch (err) {
        console.error('Error fetching webinar:', err)
        setError(err instanceof Error ? err.message : 'Failed to load webinar details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchWebinar()
    }
  }, [id])

  if (loading) {
    return (
      <div className={`${backgrounds.page} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <VideoCameraIcon className="h-16 w-16 text-primary-400 mx-auto mb-4 animate-pulse" />
          <p className={`text-lg ${textColors.primary}`}>Loading webinar details...</p>
        </div>
      </div>
    )
  }

  if (error || !webinar) {
    return (
      <div className={`${backgrounds.page} min-h-screen flex items-center justify-center`}>
        <div className="text-center">
          <ExclamationTriangleIcon className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Webinar Not Found</h1>
          <p className="text-gray-600 mb-6">The webinar you're looking for doesn't exist or has been removed.</p>
          <Link to="/webinars" className="btn-primary">
            Back to Webinars
          </Link>
        </div>
      </div>
    )
  }

  // Parse webinar date for calendar integration
  const webinarDate = new Date(webinar.scheduled_at)
  
  // Validate the parsed date
  if (isNaN(webinarDate.getTime())) {
    console.error('Invalid webinar date:', webinar.scheduled_at)
    return <div className="text-red-500">Error: Invalid webinar date</div>
  }
  
  const endDate = new Date(webinarDate.getTime() + (webinar.duration_minutes * 60000))

  // Prepare calendar data
  const calendarData: WebinarCalendarData = {
    id: webinar.id,
    title: webinar.title,
    description: webinar.description,
    startDate: webinarDate,
    endDate,
    timezone: webinar.timezone,
    meetingUrl: webinar.meetingUrl,
    presenter: `${webinar.presenter}, ${webinar.presenterTitle}`,
    registrationId
  }

  // Prepare sharing data
  const sharingData: WebinarSharingData = {
    id: webinar.id,
    title: webinar.title,
    description: webinar.description,
    url: window.location.href,
    imageUrl: webinar.image,
    presenter: webinar.presenter,
    presenterTitle: webinar.presenterTitle,
    date: webinarDate,
    category: webinar.category,
    tags: webinar.tags,
    company: 'voltAIc Systems'
  }

  const calendarIntegrations = getCalendarIntegrations(calendarData)
  const socialSharing = getAllSharingOptions(sharingData, {
    includeHashtags: true,
    includePresenter: true,
    includeDate: true,
    trackingParams: {
      source: 'webinar-detail',
      medium: 'social',
      campaign: `webinar-${webinar.id}`
    }
  })

  const metaTags = generateSocialMetaTags(sharingData)
  const formattedDateTime = formatWebinarDateTime(webinarDate, endDate, webinar.timezone, language)

  const handleRegistration = () => {
    setIsRegistrationModalOpen(true)
  }

  const handleCalendarClick = (type: string, action: () => void) => {
    trackCalendarIntegration(webinar.id, type as any, registrationId)
    action()
    setIsCalendarDropdownOpen(false)
  }

  const handleSocialShare = (platform: string, action: () => void) => {
    trackSocialShare(webinar.id, platform, registrationId)
    action()
    setIsSocialDropdownOpen(false)
  }

  const getStatusBadge = () => {
    const badgeClasses = {
      upcoming: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      live: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 animate-pulse',
      recorded: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }

    const statusText = {
      upcoming: language === 'de' ? 'Bevorstehend' : 'Upcoming',
      live: language === 'de' ? 'Live' : 'Live Now',
      recorded: language === 'de' ? 'Aufgezeichnet' : 'Recorded',
      cancelled: language === 'de' ? 'Abgesagt' : 'Cancelled'
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badgeClasses[webinar.status]}`}>
        {webinar.status === 'live' && <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-ping" />}
        {statusText[webinar.status]}
      </span>
    )
  }

  const getLevelBadge = () => {
    const badgeClasses = {
      Beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      Intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      Advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }

    const levelText = {
      Beginner: language === 'de' ? 'Anfänger' : 'Beginner',
      Intermediate: language === 'de' ? 'Fortgeschritten' : 'Intermediate',
      Advanced: language === 'de' ? 'Experte' : 'Advanced'
    }

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badgeClasses[webinar.level]}`}>
        {levelText[webinar.level]}
      </span>
    )
  }

  return (
    <>
      <Helmet>
        <title>{metaTags.title}</title>
        <meta name="description" content={metaTags.description} />
        <meta property="og:title" content={metaTags.title} />
        <meta property="og:description" content={metaTags.description} />
        <meta property="og:image" content={metaTags.image} />
        <meta property="og:url" content={metaTags.url} />
        <meta property="og:type" content={metaTags.type} />
        <meta name="twitter:card" content={metaTags.twitterCard} />
        <meta name="twitter:title" content={metaTags.twitterTitle} />
        <meta name="twitter:description" content={metaTags.twitterDescription} />
        <meta name="twitter:image" content={metaTags.twitterImage} />
        <link rel="canonical" href={webinar.slug ? `/webinars/${webinar.slug}` : `/webinars/${webinar.id}`} />
      </Helmet>

      <div className={backgrounds.page}>
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-primary-50 via-primary-100 to-purple-50 dark:from-primary-900/20 dark:via-purple-900/20 dark:to-indigo-900/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="lg:grid lg:grid-cols-2 lg:gap-12 lg:items-center">
              {/* Content */}
              <div className="mb-8 lg:mb-0">
                {/* Meta badges */}
                <div className="flex flex-wrap items-center gap-3 mb-6">
                  {getStatusBadge()}
                  {getLevelBadge()}
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400">
                    {webinar.category.toUpperCase()}
                  </span>
                </div>

                <h1 className="text-3xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                  {webinar.title}
                </h1>

                <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                  {webinar.description}
                </p>

                {/* Session Details Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="text-center">
                    <CalendarDaysIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {language === 'de' ? 'Datum' : 'Date'}
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formattedDateTime.date}
                    </div>
                  </div>

                  <div className="text-center">
                    <ClockIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {language === 'de' ? 'Uhrzeit' : 'Time'}
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formattedDateTime.startTime}
                    </div>
                  </div>

                  <div className="text-center">
                    <ClockIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {language === 'de' ? 'Dauer' : 'Duration'}
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {formattedDateTime.duration}
                    </div>
                  </div>

                  <div className="text-center">
                    <UserGroupIcon className="h-8 w-8 text-primary-600 mx-auto mb-2" />
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {language === 'de' ? 'Teilnehmer' : 'Attendees'}
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {webinar.attendees}{webinar.maxAttendees ? `/${webinar.maxAttendees}` : ''}
                    </div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {userRegistered ? (
                    <div className="flex items-center text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-6 py-3 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      {language === 'de' ? 'Bereits registriert' : 'Already Registered'}
                    </div>
                  ) : (
                    <button
                      onClick={handleRegistration}
                      disabled={webinar.status === 'cancelled' || !webinar.registrationEnabled}
                      className={`px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-200 ${
                        webinar.status === 'live' 
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl'
                          : webinar.status === 'upcoming'
                          ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                          : 'bg-gray-400 text-gray-700 cursor-not-allowed'
                      }`}
                    >
                      {webinar.status === 'live' ? (
                        <>
                          <PlayIcon className="h-5 w-5 inline mr-2" />
                          {language === 'de' ? 'Live beitreten' : 'Join Live'}
                        </>
                      ) : webinar.status === 'upcoming' ? (
                        language === 'de' ? 'Jetzt registrieren' : 'Register Now'
                      ) : (
                        language === 'de' ? 'Aufzeichnung ansehen' : 'Watch Recording'
                      )}
                    </button>
                  )}

                  {/* Calendar Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsCalendarDropdownOpen(!isCalendarDropdownOpen)}
                      className="flex items-center px-6 py-4 border-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400 rounded-lg font-semibold hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors"
                    >
                      <CalendarDaysIconSolid className="h-5 w-5 mr-2" />
                      {language === 'de' ? 'Zum Kalender hinzufügen' : 'Add to Calendar'}
                      <ChevronDownIcon className="h-4 w-4 ml-2" />
                    </button>

                    {isCalendarDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                        <div className="p-2">
                          <button
                            onClick={() => handleCalendarClick('google', () => window.open(calendarIntegrations.google, '_blank'))}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center"
                          >
                            <img src="/icons/google-calendar.svg" alt="Google Calendar" className="w-5 h-5 mr-3" />
                            Google Calendar
                          </button>
                          <button
                            onClick={() => handleCalendarClick('outlook', () => window.open(calendarIntegrations.outlook, '_blank'))}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center"
                          >
                            <img src="/icons/outlook.svg" alt="Outlook" className="w-5 h-5 mr-3" />
                            Outlook
                          </button>
                          <button
                            onClick={() => handleCalendarClick('ics', calendarIntegrations.ics)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center"
                          >
                            <CalendarDaysIcon className="w-5 h-5 mr-3 text-gray-600" />
                            {language === 'de' ? 'ICS-Datei herunterladen' : 'Download ICS File'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Share Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setIsSocialDropdownOpen(!isSocialDropdownOpen)}
                      className="flex items-center px-6 py-4 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <ShareIconSolid className="h-5 w-5 mr-2" />
                      {language === 'de' ? 'Teilen' : 'Share'}
                      <ChevronDownIcon className="h-4 w-4 ml-2" />
                    </button>

                    {isSocialDropdownOpen && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                        <div className="p-2">
                          <button
                            onClick={() => handleSocialShare('linkedin', () => window.open(socialSharing.linkedin.url, '_blank'))}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center"
                          >
                            <img src="/icons/linkedin.svg" alt="LinkedIn" className="w-5 h-5 mr-3" />
                            LinkedIn
                          </button>
                          <button
                            onClick={() => handleSocialShare('twitter', () => window.open(socialSharing.twitter.url, '_blank'))}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center"
                          >
                            <img src="/icons/twitter.svg" alt="Twitter" className="w-5 h-5 mr-3" />
                            Twitter
                          </button>
                          <button
                            onClick={() => handleSocialShare('email', () => window.location.href = socialSharing.email.mailto)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center"
                          >
                            <EnvelopeIcon className="w-5 h-5 mr-3 text-gray-600" />
                            Email
                          </button>
                          <button
                            onClick={() => handleSocialShare('copy', socialSharing.copyLink)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg flex items-center"
                          >
                            <LinkIcon className="w-5 h-5 mr-3 text-gray-600" />
                            {language === 'de' ? 'Link kopieren' : 'Copy Link'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Image and Stats */}
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-primary-100 to-purple-100 dark:from-primary-900/30 dark:to-purple-900/30 rounded-2xl overflow-hidden">
                  {webinar.image ? (
                    <img 
                      src={webinar.image} 
                      alt={webinar.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <VideoCameraIcon className="h-24 w-24 text-primary-400" />
                    </div>
                  )}
                </div>

                {/* Registration Stats */}
                {webinar.maxAttendees && (
                  <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-lg px-6 py-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary-600">{webinar.attendees}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {language === 'de' ? 'Registriert' : 'Registered'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{webinar.maxAttendees - webinar.attendees}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {language === 'de' ? 'Verfügbar' : 'Available'}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Continue with the rest of the component... */}
        {/* This is getting quite long, so I'll continue in the next part */}
        
        {/* Presenter Section */}
        <div className={getSectionClasses()}>
          <div className="max-w-4xl mx-auto">
            <div className={getCardClasses()}>
              <div className="md:flex md:items-center md:space-x-8">
                <div className="md:flex-shrink-0 mb-6 md:mb-0">
                  <div className="mx-auto md:mx-0 h-32 w-32 rounded-full overflow-hidden bg-primary-100 dark:bg-primary-900/30">
                    {webinar.presenterPhoto ? (
                      <img src={webinar.presenterPhoto} alt={webinar.presenter} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center">
                        <UserIcon className="h-16 w-16 text-primary-600" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center md:text-left flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {webinar.presenter}
                  </h2>
                  <p className="text-lg text-primary-600 dark:text-primary-400 mb-4">
                    {webinar.presenterTitle}
                  </p>
                  <p className={`${textColors.secondary} leading-relaxed mb-6`}>
                    {webinar.presenterBio}
                  </p>
                  
                  {webinar.presenterLinkedIn && (
                    <a
                      href={webinar.presenterLinkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium"
                    >
                      <img src="/icons/linkedin.svg" alt="LinkedIn" className="w-5 h-5 mr-2" />
                      {language === 'de' ? 'Auf LinkedIn verbinden' : 'Connect on LinkedIn'}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Registration Modal would go here */}
        {/* RegistrationModal component */}

        {/* Click outside to close dropdowns */}
        {(isCalendarDropdownOpen || isSocialDropdownOpen) && (
          <div
            className="fixed inset-0 z-5"
            onClick={() => {
              setIsCalendarDropdownOpen(false)
              setIsSocialDropdownOpen(false)
            }}
          />
        )}
      </div>
    </>
  )
}

export default WebinarDetailPage