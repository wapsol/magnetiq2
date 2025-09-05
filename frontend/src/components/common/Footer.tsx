import { Link } from 'react-router-dom'
import { 
  BoltIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  SunIcon, 
  MoonIcon,
  LanguageIcon,
  ChevronDownIcon,
  CalendarDaysIcon,
  ClockIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { useLanguage } from '../../contexts/LanguageContext'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const { language } = useLanguage()
  const [currentLanguage, setCurrentLanguage] = useState('DE')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)

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
              className="inline-flex items-center px-6 py-3 bg-violet-700 hover:bg-violet-800 text-white rounded-lg font-medium"
            >
              {language === 'de' ? 'Alle Webinare anzeigen' : 'View All Webinars'}
            </Link>
          </div>
        </div>

        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center justify-center w-10 h-10 bg-primary-50 rounded-lg">
                  <BoltIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
                    voltAIc Systems
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-300 -mt-1">
                    AI Data Intelligence
                  </span>
                </div>
              </div>
              <p className="text-gray-500 dark:text-gray-200 mb-6 max-w-md leading-relaxed">
                VoltAIc bedeutet künstliche Intelligenz langfristig gedacht: Der Schritt von großartigen 
                KI-Möglichkeiten zu wirtschaftlich gesunden KI-Lösungen für jedes Unternehmen.
              </p>
              
              {/* Contact Info */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-200">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                  <span>datadriven@voltAIc.systems</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-200">
                  <PhoneIcon className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                  <span>+49 711 7947 2394</span>
                </div>
                <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-200">
                  <MapPinIcon className="h-5 w-5 text-gray-400 dark:text-gray-300" />
                  <span>Stuttgart & Frankfurt, Deutschland</span>
                </div>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Software</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/webinars"
                    className="text-gray-500 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-200"
                  >
                    DOS - Data Operating System
                  </Link>
                </li>
                <li>
                  <Link
                    to="/whitepapers"
                    className="text-gray-500 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-200"
                  >
                    AI Data Mapper
                  </Link>
                </li>
                <li>
                  <Link
                    to="/book-consultation"
                    className="text-gray-500 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-200"
                  >
                    AI Customizing
                  </Link>
                </li>
              </ul>
            </div>
            
            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Services</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="#"
                    className="text-gray-500 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-200"
                  >
                    Model Fine-tuning
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-500 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-200"
                  >
                    Process Automation
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-500 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-200"
                  >
                    Enterprise Solutions
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-500 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-300 transition-colors duration-200"
                  >
                    Entwickler Support
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Footer Bottom */}
        <div className="border-t border-gray-100 dark:border-gray-700 py-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm text-gray-500 dark:text-gray-200">
                &copy; {currentYear} voltAIc Systems. All rights reserved.
              </p>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-200"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-200"
                >
                  Terms of Service
                </a>
                <a
                  href="#"
                  className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-200"
                >
                  Cookie Policy
                </a>
              </div>
            </div>
            
            {/* Theme and Language Controls */}
            <div className="mt-4 md:mt-0 flex items-center space-x-4">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDarkMode ? (
                  <SunIcon className="h-4 w-4" />
                ) : (
                  <MoonIcon className="h-4 w-4" />
                )}
                <span>{isDarkMode ? 'Light' : 'Dark'}</span>
              </button>
              
              {/* Language Switcher */}
              <div className="relative">
                <button
                  onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:text-gray-100 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  <LanguageIcon className="h-4 w-4" />
                  <span>{currentLanguage}</span>
                  <ChevronDownIcon className={`h-3 w-3 transition-transform duration-200 ${showLanguageMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {showLanguageMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 min-w-[100px]">
                    {['DE', 'EN'].map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          setCurrentLanguage(lang)
                          setShowLanguageMenu(false)
                        }}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 ${
                          currentLanguage === lang ? 'text-primary-600 dark:text-primary-300 font-medium' : 'text-gray-700 dark:text-gray-200'
                        }`}
                      >
                        {lang === 'DE' ? 'Deutsch' : 'English'}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer