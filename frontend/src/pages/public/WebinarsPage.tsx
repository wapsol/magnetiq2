import { useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'
import { 
  VideoCameraIcon, 
  CalendarDaysIcon, 
  ClockIcon,
  UserGroupIcon,
  PlayIcon,
  BookmarkIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

const WebinarsPage = () => {
  const { language } = useLanguage()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState(null)

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'react', name: 'React & Frontend' },
    { id: 'backend', name: 'Backend Development' },
    { id: 'devops', name: 'DevOps & Cloud' },
    { id: 'ai', name: 'AI & Machine Learning' },
    { id: 'business', name: 'Business Strategy' },
  ]

  const statuses = [
    { id: 'all', name: 'All Webinars' },
    { id: 'upcoming', name: 'Upcoming' },
    { id: 'live', name: 'Live Now' },
    { id: 'recorded', name: 'Recorded' },
  ]

  const webinars = [
    // Active upcoming webinars - Starting October 1, 2025, every 2 weeks on Wednesday at 16:00
    {
      id: 1,
      title: language === 'de' ? 'KI-Bereitschaftsbewertung: Sind Ihre Unternehmensdaten bereit für KI?' : 'AI Readiness Assessment: Is Your Company Data Ready for AI?',
      description: language === 'de' 
        ? 'Dieses grundlegende Webinar hilft Unternehmen zu bewerten, ob sie über die notwendige Infrastruktur, Datenqualität und organisatorische Ausrichtung verfügen, um KI erfolgreich zu implementieren. Die Teilnehmer erhalten ein klares Verständnis der zu behebenden Lücken und eine Roadmap für die KI-Bereitschaft.'
        : 'This foundational webinar helps companies evaluate whether they have the necessary infrastructure, data quality, and organizational alignment to successfully implement AI. Attendees will leave with a clear understanding of gaps to address and a roadmap for becoming AI-ready.',
      presenter: 'Dr. Marcus Rodriguez',
      presenterTitle: 'Chief AI Strategy Officer',
      category: 'ai',
      status: 'upcoming',
      date: '2025-10-01',
      time: '4:00 PM CET',
      duration: '90 minutes',
      attendees: 0,
      maxAttendees: 500,
      image: '/api/placeholder/400/250',
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
      ]
    },
    {
      id: 2,
      title: language === 'de' ? 'Das KI-Pilot-Playbook: Wie Sie Ihr erstes KI-Projekt in 90 Tagen durchführen' : 'The AI Pilot Playbook: How to Run Your First AI Project in 90 Days',
      description: language === 'de'
        ? 'Ein praktischer, schrittweiser Leitfaden zur Auswahl, Abgrenzung und Durchführung eines KI-Pilotprojekts, das der Unternehmensleitung einen klaren ROI demonstrieren kann. Dieses Webinar konzentriert sich darauf, häufige Fallstricke zu vermeiden und Momentum für größere KI-Initiativen aufzubauen.'
        : 'A practical, step-by-step guide to selecting, scoping, and executing a pilot AI project that can demonstrate clear ROI to leadership. This webinar focuses on avoiding common pitfalls and building momentum for larger AI initiatives.',
      presenter: 'Sarah Chen',
      presenterTitle: 'Head of AI Implementation',
      category: 'ai',
      status: 'upcoming',
      date: '2025-10-15',
      time: '4:00 PM CET',
      duration: '90 minutes',
      attendees: 0,
      maxAttendees: 500,
      image: '/api/placeholder/400/250',
      tags: ['AI Pilot', 'Project Management', 'ROI', 'Implementation', '90-Day Plan'],
      level: 'Intermediate',
      keyPoints: language === 'de' ? [
        'Projektauswahlmatrix',
        'Erfolgsorientierte Projektabgrenzung',
        'Wöchentlicher Implementierungszeitplan',
        'Stakeholder-Kommunikationsframework',
        'Build vs. Buy Entscheidungsbaum',
        'Risikominderungsstrategien',
        'Erfolgsmetriken und KPIs',
        'Skalierungs-Playbook'
      ] : [
        'Project Selection Matrix',
        'Scoping for Success',
        'Week-by-Week Implementation Timeline',
        'Stakeholder Communication Framework',
        'Build vs. Buy Decision Tree',
        'Risk Mitigation Strategies',
        'Success Metrics and KPIs',
        'Scaling Playbook'
      ]
    },
    {
      id: 3,
      title: language === 'de' ? 'Automatisierung der Dokumentenverarbeitung: Von Verträgen bis Rechnungen' : 'Automating Document Processing: From Contracts to Invoices',
      description: language === 'de'
        ? 'Erfahren Sie, wie KI dokumentenlastige Workflows in Rechts-, Finanz- und Betriebsabteilungen transformieren kann. Dieses Webinar demonstriert echten ROI durch automatisierte Extraktion, Klassifizierung und Verarbeitung von Geschäftsdokumenten.'
        : 'Explore how AI can transform document-heavy workflows in legal, finance, and operations departments. This webinar demonstrates real ROI through automated extraction, classification, and processing of business documents.',
      presenter: 'Michael Wang',
      presenterTitle: 'Director of Document Intelligence',
      category: 'ai',
      status: 'upcoming',
      date: '2025-10-29',
      time: '4:00 PM CET',
      duration: '75 minutes',
      attendees: 0,
      maxAttendees: 400,
      image: '/api/placeholder/400/250',
      tags: ['Document AI', 'OCR', 'Automation', 'Invoice Processing', 'Contract Analysis'],
      level: 'Intermediate',
      keyPoints: language === 'de' ? [
        'Dokumententyp-Priorisierung',
        'OCR zu Intelligenz-Pipeline',
        'Genauigkeit vs. Automatisierung Trade-offs',
        'Integration in bestehende Systeme',
        'Compliance und Audit-Trails',
        'Multi-Format-Verarbeitung',
        'ROI-Rechner',
        'Anbieter-Bewertungskriterien'
      ] : [
        'Document Type Prioritization',
        'OCR to Intelligence Pipeline',
        'Accuracy vs. Automation Trade-offs',
        'Integration with Existing Systems',
        'Compliance and Audit Trails',
        'Multi-format Handling',
        'ROI Calculator',
        'Vendor Evaluation Criteria'
      ]
    },
    {
      id: 4,
      title: language === 'de' ? 'KI-gestütztes Wissensmanagement: Die kollektive Intelligenz Ihres Unternehmens durchsuchbar machen' : 'AI-Powered Knowledge Management: Making Your Company\'s Collective Intelligence Searchable',
      description: language === 'de'
        ? 'Transformieren Sie, wie Mitarbeiter Informationen in Ihrer Organisation finden und teilen, indem Sie eine intelligente Wissensdatenbank aufbauen, die Silos aufbricht. Dieses Webinar zeigt, wie institutionelles Wissen mit KI erfasst, organisiert und verfügbar gemacht wird.'
        : 'Transform how employees find and share information across your organization by building an intelligent knowledge base that breaks down silos. This webinar shows how to capture, organize, and surface institutional knowledge using AI.',
      presenter: 'Dr. Emily Watson',
      presenterTitle: 'Knowledge Systems Architect',
      category: 'ai',
      status: 'upcoming',
      date: '2025-11-12',
      time: '4:00 PM CET',
      duration: '90 minutes',
      attendees: 0,
      maxAttendees: 450,
      image: '/api/placeholder/400/250',
      tags: ['Knowledge Management', 'Search', 'AI', 'Information Retrieval', 'Collaboration'],
      level: 'Intermediate',
      keyPoints: language === 'de' ? [
        'Wissens-Audit-Prozess',
        'Intelligente Erfassungsstrategien',
        'Semantische Suchimplementierung',
        'Personalisierung und Berechtigungen',
        'Wissensgraph-Konstruktion',
        'Kontinuierliche Lernmechanismen',
        'Change-Management-Ansatz',
        'Erfolgsmetriken und Messung'
      ] : [
        'Knowledge Audit Process',
        'Intelligent Ingestion Strategies',
        'Semantic Search Implementation',
        'Personalization and Permissions',
        'Knowledge Graph Construction',
        'Continuous Learning Mechanisms',
        'Change Management Approach',
        'Success Metrics and Measurement'
      ]
    },
    {
      id: 5,
      title: language === 'de' ? 'Ein KI-Kompetenzzentrum mit begrenzten Ressourcen aufbauen' : 'Creating an AI Center of Excellence with Limited Resources',
      description: language === 'de'
        ? 'Erfahren Sie, wie mittelständische Unternehmen KI-Governance etablieren, Best Practices teilen und KI-Initiativen ohne Enterprise-Level-Budgets skalieren können. Dieses Webinar bietet einen praktischen Rahmen für den Aufbau organisatorischer KI-Fähigkeiten.'
        : 'Learn how mid-size companies can establish AI governance, share best practices, and scale AI initiatives without enterprise-level budgets. This webinar provides a practical framework for building organizational AI capability.',
      presenter: 'Alexandra Foster',
      presenterTitle: 'AI Transformation Consultant',
      category: 'ai',
      status: 'upcoming',
      date: '2025-11-26',
      time: '4:00 PM CET',
      duration: '90 minutes',
      attendees: 0,
      maxAttendees: 350,
      image: '/api/placeholder/400/250',
      tags: ['AI Governance', 'Center of Excellence', 'Strategy', 'Skills Development', 'Best Practices'],
      level: 'Advanced',
      keyPoints: language === 'de' ? [
        'Schlankes Governance-Framework',
        'Kompetenzentwicklungspfad',
        'Technologie-Stack-Standardisierung',
        'Projektportfolio-Management',
        'Wissensaustausch-Infrastruktur',
        'Anbieter-Management-Strategie',
        'Erfolgsgeschichten-Dokumentation',
        'Skalierungsmodell'
      ] : [
        'Lightweight Governance Framework',
        'Skills Development Pathway',
        'Technology Stack Standardization',
        'Project Portfolio Management',
        'Knowledge Sharing Infrastructure',
        'Vendor Management Strategy',
        'Success Story Documentation',
        'Scaling Model'
      ]
    },
    {
      id: 6,
      title: language === 'de' ? 'KI-ROI messen: KPIs und Metriken, die für die Führung wichtig sind' : 'Measuring AI ROI: KPIs and Metrics That Matter to Leadership',
      description: language === 'de'
        ? 'Meistern Sie die Kunst, überzeugende Business Cases für KI-Investitionen zu erstellen und deren Erfolg zu verfolgen. Dieses Webinar bietet Frameworks und Vorlagen zur Kommunikation des KI-Werts in Begriffen, die Führungskräfte und Vorstände verstehen.'
        : 'Master the art of building compelling business cases for AI investments and tracking their success. This webinar provides frameworks and templates for communicating AI value in terms executives and boards understand.',
      presenter: 'Robert Sterling',
      presenterTitle: 'Chief Financial Technology Officer',
      category: 'ai',
      status: 'upcoming',
      date: '2025-12-10',
      time: '4:00 PM CET',
      duration: '90 minutes',
      attendees: 0,
      maxAttendees: 400,
      image: '/api/placeholder/400/250',
      tags: ['AI ROI', 'KPIs', 'Metrics', 'Business Case', 'Executive Reporting'],
      level: 'Advanced',
      keyPoints: language === 'de' ? [
        'Vor-Implementierung Business Case',
        'Direkte vs. Indirekte Werterfassung',
        'Pilot-zu-Produktion Metriken',
        'Time-to-Value-Analyse',
        'Risikoadjustierte Renditen',
        'Wettbewerbs-Benchmarking',
        'Dashboard-Design für Führungskräfte',
        'Investitionsbegründungsvorlagen'
      ] : [
        'Pre-Implementation Business Case',
        'Direct vs. Indirect Value Capture',
        'Pilot to Production Metrics',
        'Time-to-Value Analysis',
        'Risk-Adjusted Returns',
        'Competitive Benchmarking',
        'Dashboard Design for Executives',
        'Investment Justification Templates'
      ]
    },
    // Archived/Recorded webinars (deactivated)
    {
      id: 101,
      title: 'Advanced React Patterns for Scalable Applications',
      description: 'Learn advanced React patterns including render props, compound components, and custom hooks for building maintainable applications.',
      presenter: 'Sarah Chen',
      presenterTitle: 'Senior Frontend Architect',
      category: 'react',
      status: 'recorded',
      date: '2024-01-15',
      time: 'On Demand',
      duration: '90 minutes',
      attendees: 247,
      maxAttendees: null,
      image: '/api/placeholder/400/250',
      tags: ['React', 'Architecture', 'Best Practices'],
      level: 'Intermediate',
    },
    {
      id: 102,
      title: 'Building Microservices with Node.js and Docker',
      description: 'Deep dive into microservices architecture, containerization strategies, and deployment patterns for modern web applications.',
      presenter: 'Marcus Rodriguez',
      presenterTitle: 'DevOps Lead',
      category: 'backend',
      status: 'recorded',
      date: '2024-01-18',
      time: 'On Demand',
      duration: '120 minutes',
      attendees: 156,
      maxAttendees: null,
      image: '/api/placeholder/400/250',
      tags: ['Node.js', 'Docker', 'Microservices'],
      level: 'Advanced',
    },
  ]

  const filteredWebinars = webinars.filter(webinar => {
    const matchesSearch = webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webinar.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webinar.presenter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webinar.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || webinar.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || webinar.status === selectedStatus
    const matchesLevel = !selectedLevel || webinar.level === selectedLevel
    
    return matchesSearch && matchesCategory && matchesStatus && matchesLevel
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <span className="badge badge-error animate-pulse">🔴 Live Now</span>
      case 'upcoming':
        return <span className="badge badge-primary">📅 Upcoming</span>
      case 'recorded':
        return <span className="badge badge-secondary">🎬 Recorded</span>
      default:
        return null
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'text-success-600 bg-success-100'
      case 'Intermediate':
        return 'text-warning-600 bg-warning-100'
      case 'Advanced':
        return 'text-error-600 bg-error-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className={`${backgrounds.pageAlt} min-h-screen`}>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-50 via-primary-100 to-purple-50 text-gray-800 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative container section-sm">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <VideoCameraIcon className="h-12 w-12 text-primary-600" />
              <h1 className="text-4xl lg:text-6xl font-bold text-primary-900">
                Expert Webinars
              </h1>
            </div>
            <p className="text-xl text-primary-700 mb-8 max-w-2xl mx-auto">
              Join our live webinars and recorded sessions featuring industry experts sharing 
              the latest trends, best practices, and innovative solutions.
            </p>
            
            {/* Search and Filters in Hero */}
            <div className="bg-white/60 backdrop-blur-sm border border-primary-200 rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Enhanced Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search webinars by topic, presenter, or keyword..."
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white/50 text-lg"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Filters Row */}
                <div className="flex flex-wrap gap-3 lg:flex-nowrap">
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="h-5 w-5 text-primary-600" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="rounded-lg border border-primary-200 bg-white text-primary-800 backdrop-blur-sm py-2 px-3 focus:ring-2 focus:ring-primary-300"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id} className="text-gray-900">
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="rounded-lg border border-primary-200 bg-white text-primary-800 backdrop-blur-sm py-2 px-3 focus:ring-2 focus:ring-primary-300"
                  >
                    {statuses.map(status => (
                      <option key={status.id} value={status.id} className="text-gray-900">
                        {status.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Level Filter */}
                  <select
                    value={selectedLevel || 'all'}
                    onChange={(e) => setSelectedLevel(e.target.value === 'all' ? null : e.target.value)}
                    className="rounded-lg border border-primary-200 bg-white text-primary-800 backdrop-blur-sm py-2 px-3 focus:ring-2 focus:ring-primary-300"
                  >
                    <option value="all" className="text-gray-900">All Levels</option>
                    <option value="Beginner" className="text-gray-900">Beginner</option>
                    <option value="Intermediate" className="text-gray-900">Intermediate</option>
                    <option value="Advanced" className="text-gray-900">Advanced</option>
                  </select>
                </div>
              </div>
              
              {/* Quick Filter Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="text-primary-700 text-lg font-semibold mr-4">Quick Filters:</span>
                {[{ id: 'live', name: '🔴 Live Now', type: 'status' }, { id: 'upcoming', name: '📅 Upcoming', type: 'status' }, { id: 'recorded', name: '🎬 Recorded', type: 'status' }, { id: 'ai', name: '🤖 AI & ML', type: 'category' }, { id: 'react', name: '⚛️ React', type: 'category' }, { id: 'backend', name: '⚙️ Backend', type: 'category' }, { id: 'business', name: '📊 Business', type: 'category' }].map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      if (tag.type === 'status') {
                        setSelectedStatus(tag.id)
                      } else {
                        setSelectedCategory(tag.id)
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors backdrop-blur-sm ${
                      (tag.type === 'status' && selectedStatus === tag.id) || 
                      (tag.type === 'category' && selectedCategory === tag.id) 
                        ? 'bg-primary-600 text-white shadow-lg' 
                        : 'bg-white border border-primary-200 text-primary-700 hover:bg-primary-50'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                    setSelectedStatus('all')
                    setSelectedLevel(null)
                  }}
                  className="px-4 py-2 rounded-full bg-red-100 border border-red-200 text-red-700 text-sm font-medium hover:bg-red-200 transition-colors backdrop-blur-sm"
                >
                  ✕ Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Webinars Grid */}
      <div className="container section">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWebinars.map((webinar, index) => (
            <div 
              key={webinar.id} 
              className="card hover-lift hover-glow group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Webinar Image */}
              <div className="relative overflow-hidden rounded-t-xl">
                <div className="h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                  <VideoCameraIcon className="h-16 w-16 text-primary-400" />
                </div>
                <div className="absolute top-4 left-4">
                  {getStatusBadge(webinar.status)}
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`badge ${getLevelColor(webinar.level)}`}>
                    {webinar.level}
                  </span>
                </div>
                {webinar.status === 'live' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayIcon className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>

              {/* Webinar Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-2">
                    {webinar.title}
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <BookmarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {webinar.description}
                </p>

                {/* Presenter Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {webinar.presenter.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {webinar.presenter}
                    </div>
                    <div className="text-xs text-gray-500">
                      {webinar.presenterTitle}
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                    {webinar.date} at {webinar.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    {webinar.duration}
                  </div>
                  {webinar.maxAttendees && (
                    <div className="flex items-center text-sm text-gray-500">
                      <UserGroupIcon className="h-4 w-4 mr-2" />
                      {webinar.attendees}/{webinar.maxAttendees} attendees
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {webinar.tags.map(tag => (
                    <span key={tag} className="badge badge-secondary text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Link
                    to={`/webinars/${webinar.id}`}
                    className={`btn-sm ${
                      webinar.status === 'live' 
                        ? 'bg-error-600 text-white hover:bg-error-700' 
                        : webinar.status === 'upcoming'
                        ? 'btn-primary'
                        : 'btn-outline'
                    } group`}
                  >
                    {webinar.status === 'live' ? 'Join Live' :
                     webinar.status === 'upcoming' ? 'Register' : 'Watch Recording'}
                    <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    <ShareIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredWebinars.length === 0 && (
          <div className="text-center py-16">
            <VideoCameraIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No webinars found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to find relevant webinars.
            </p>
            <button 
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedStatus('all')
              }}
              className="btn-outline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-primary-50 border-t border-primary-200">
        <div className="container section text-center">
          <h2 className="text-3xl font-bold mb-4 text-primary-900">
            Want to Host a Webinar?
          </h2>
          <p className="text-primary-700 mb-8 max-w-2xl mx-auto">
            Share your expertise with our community. We provide the platform, 
            you provide the knowledge.
          </p>
          <Link
            to="/book-consultation"
            className="inline-block px-8 py-4 bg-primary-600 text-white font-semibold text-lg rounded-xl hover:bg-primary-700 hover:shadow-xl hover:scale-105 transition-all duration-200 shadow-lg border border-primary-500 hover:border-primary-600"
          >
            Propose a Webinar
          </Link>
        </div>
      </div>
    </div>
  )
}

export default WebinarsPage