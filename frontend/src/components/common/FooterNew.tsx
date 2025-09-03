import { Link } from 'react-router-dom'
import { 
  BoltIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from '../../contexts/LanguageContext'
import { useTheme } from '../../contexts/ThemeContext'

const FooterNew = () => {
  const currentYear = new Date().getFullYear()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''

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