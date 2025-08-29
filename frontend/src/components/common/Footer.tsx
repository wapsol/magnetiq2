import { Link } from 'react-router-dom'
import { 
  BoltIcon, 
  EnvelopeIcon, 
  PhoneIcon, 
  MapPinIcon, 
  SunIcon, 
  MoonIcon,
  LanguageIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { useState } from 'react'
import { useTheme } from '../../contexts/ThemeContext'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  const { isDarkMode, toggleDarkMode } = useTheme()
  const [currentLanguage, setCurrentLanguage] = useState('DE')
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700 text-gray-600 dark:text-gray-200">
      <div className="container">
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
                  <span>datadriven@voltaic.systems</span>
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