import { Link } from 'react-router-dom'
import { 
  BoltIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  SunIcon,
  MoonIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'

const FooterNew = () => {
  const currentYear = new Date().getFullYear()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''

  // Next 5 upcoming webinars data
  const upcomingWebinars = [
    {
      id: 1,
      title: language === 'de' ? 'KI-Bereitschaftsbewertung' : 'AI Readiness Assessment',
      date: '2025-10-01',
      time: '16:00 CET'
    },
    {
      id: 2,
      title: language === 'de' ? 'Das KI-Pilot-Playbook' : 'The AI Pilot Playbook',
      date: '2025-10-15',
      time: '16:00 CET'
    },
    {
      id: 3,
      title: language === 'de' ? 'Automatisierung der Dokumentenverarbeitung' : 'Automating Document Processing',
      date: '2025-10-29',
      time: '16:00 CET'
    },
    {
      id: 4,
      title: language === 'de' ? 'KI-gestütztes Wissensmanagement' : 'AI-Powered Knowledge Management',
      date: '2025-11-12',
      time: '16:00 CET'
    },
    {
      id: 5,
      title: language === 'de' ? 'Ein KI-Kompetenzzentrum aufbauen' : 'Creating an AI Center of Excellence',
      date: '2025-11-26',
      time: '16:00 CET'
    }
  ]

  // Scroll to top when link is clicked
  const handleLinkClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  
  const footerSections = {
    services: {
      title: t('nav.services'),
      links: [
        { name: t('services.ai_consulting'), href: `${basePath}/${language === 'en' ? 'services/ai-consulting' : 'dienstleistungen/ki-beratung'}` },
        { name: t('services.digital_transformation'), href: `${basePath}/${language === 'en' ? 'services/digital-transformation' : 'dienstleistungen/digitale-transformation'}` },
        { name: t('services.automation'), href: `${basePath}/${language === 'en' ? 'services/automation' : 'dienstleistungen/automatisierung'}` },
        { name: t('services.development'), href: `${basePath}/${language === 'en' ? 'services/development' : 'dienstleistungen/entwicklung'}` }
      ]
    },
    solutions: {
      title: t('nav.solutions'),
      links: [
        { name: t('solutions.industries'), href: `${basePath}/${language === 'en' ? 'solutions/industries' : 'loesungen/branchen'}` },
        { name: t('solutions.technology'), href: `${basePath}/${language === 'en' ? 'solutions/technology' : 'loesungen/technologie'}` },
        { name: t('solutions.case_studies'), href: `${basePath}/${language === 'en' ? 'solutions/case-studies' : 'loesungen/fallstudien'}` }
      ]
    },
    resources: {
      title: t('nav.resources'),
      links: [
        { name: t('resources.webinars'), href: `${basePath}/${language === 'en' ? 'resources/webinars' : 'ressourcen/webinare'}` },
        { name: t('resources.whitepapers'), href: `${basePath}/${language === 'en' ? 'resources/whitepapers' : 'ressourcen/whitepapers'}` },
        { name: t('resources.blog'), href: `${basePath}/${language === 'en' ? 'resources/blog' : 'ressourcen/blog'}` },
        { name: t('resources.tools'), href: `${basePath}/${language === 'en' ? 'resources/tools' : 'ressourcen/tools'}` }
      ]
    },
    company: {
      title: language === 'en' ? 'Company' : 'Unternehmen',
      links: [
        { name: t('nav.about'), href: `${basePath}/${language === 'en' ? 'about' : 'ueber-uns'}` },
        { name: t('about.careers'), href: `${basePath}/${language === 'en' ? 'about/careers' : 'ueber-uns/karriere'}` },
        { name: t('about.partners'), href: `${basePath}/${language === 'en' ? 'about/partners' : 'ueber-uns/partner'}` },
        { name: t('about.news'), href: `${basePath}/${language === 'en' ? 'about/news' : 'ueber-uns/presse'}` },
        { name: t('nav.contact'), href: `${basePath}/${language === 'en' ? 'contact' : 'kontakt'}` }
      ]
    }
  }

  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-200">
      <div className="container">
        {/* Next 5 Webinars Section */}
        <div className="py-12 border-b border-gray-100 dark:border-gray-700">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {language === 'de' ? 'Kommende Webinare' : 'Upcoming Webinars'}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'de' 
                ? 'Melden Sie sich für unsere kostenlosen KI-Webinare an'
                : 'Register for our free AI webinars'
              }
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {upcomingWebinars.map((webinar) => {
              const formatDate = (dateString) => {
                const date = new Date(dateString)
                return language === 'de' 
                  ? date.toLocaleDateString('de-DE', { 
                      day: '2-digit', 
                      month: '2-digit',
                      year: 'numeric'
                    })
                  : date.toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })
              }
              
              return (
                <Link
                  key={webinar.id}
                  to={`/webinars/${webinar.id}`}
                  onClick={handleLinkClick}
                  className="block p-4 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-700 hover:border-violet-300 dark:hover:border-violet-600 hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-all duration-200 group"
                >
                  <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-2 line-clamp-2 group-hover:text-violet-600 dark:group-hover:text-violet-300">
                    {webinar.title}
                  </h3>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <CalendarDaysIcon className="h-3 w-3" />
                      <span>{formatDate(webinar.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <ClockIcon className="h-3 w-3" />
                      <span>{webinar.time}</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
          
          <div className="text-center mt-6">
            <Link
              to="/webinars"
              onClick={handleLinkClick}
              className="inline-flex items-center px-6 py-3 bg-violet-700 hover:bg-violet-800 text-white rounded-lg font-medium"
            >
              {language === 'de' ? 'Alle Webinare anzeigen' : 'View All Webinars'}
            </Link>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Info - Spans 2 columns */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                  <BoltIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    voltAIc Systems
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400 -mt-1">
                    AI Data Intelligence
                  </span>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-300 mb-6 max-w-md leading-relaxed">
                {language === 'en' 
                  ? 'voltAIc means artificial intelligence thought long-term: The step from great AI possibilities to economically healthy AI solutions for every company.'
                  : 'voltAIc bedeutet künstliche Intelligenz langfristig gedacht: Der Schritt von großartigen KI-Möglichkeiten zu wirtschaftlich gesunden KI-Lösungen für jedes Unternehmen.'}
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-300">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-400" />
                  <a href="mailto:datadriven@voltaic.systems" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    datadriven@voltaic.systems
                  </a>
                </div>
                <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-300">
                  <PhoneIcon className="h-5 w-5 text-gray-400 dark:text-gray-400" />
                  <a href="tel:+497117947239" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    +49 711 7947 2394
                  </a>
                </div>
                <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-300">
                  <MapPinIcon className="h-5 w-5 text-gray-400 dark:text-gray-400" />
                  <span>Stuttgart & Frankfurt, {language === 'en' ? 'Germany' : 'Deutschland'}</span>
                </div>
              </div>
            </div>
            
            {/* Services Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {footerSections.services.title}
              </h3>
              <ul className="space-y-3">
                {footerSections.services.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      onClick={handleLinkClick}
                      className="text-gray-500 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Solutions Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {footerSections.solutions.title}
              </h3>
              <ul className="space-y-3">
                {footerSections.solutions.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      onClick={handleLinkClick}
                      className="text-gray-500 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Resources Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {footerSections.resources.title}
              </h3>
              <ul className="space-y-3">
                {footerSections.resources.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      onClick={handleLinkClick}
                      className="text-gray-500 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                {footerSections.company.title}
              </h3>
              <ul className="space-y-3">
                {footerSections.company.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      onClick={handleLinkClick}
                      className="text-gray-500 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-gray-100 dark:border-gray-700 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                &copy; {currentYear} voltAIc Systems. {t('footer.rights')}.
              </p>
              <div className="flex space-x-4">
                <Link
                  to={`${basePath}/legal/${language === 'en' ? 'privacy' : 'datenschutz'}`}
                  onClick={handleLinkClick}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                >
                  {t('footer.privacy')}
                </Link>
                <Link
                  to={`${basePath}/legal/${language === 'en' ? 'terms' : 'nutzungsbedingungen'}`}
                  onClick={handleLinkClick}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                >
                  {t('footer.terms')}
                </Link>
                <Link
                  to={`${basePath}/legal/cookies`}
                  onClick={handleLinkClick}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                >
                  {t('footer.cookies')}
                </Link>
                <Link
                  to={`${basePath}/legal/${language === 'en' ? 'imprint' : 'impressum'}`}
                  onClick={handleLinkClick}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
                >
                  {t('footer.imprint')}
                </Link>
              </div>
            </div>
            
            {/* Theme Switcher and Admin Login */}
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>

              {/* Admin Login Link */}
              <Link
                to="/admin"
                onClick={handleLinkClick}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200"
              >
                {language === 'en' ? 'Admin Login' : 'Admin Anmeldung'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default FooterNew