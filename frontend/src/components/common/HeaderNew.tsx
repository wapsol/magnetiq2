import { Link, useLocation } from 'react-router-dom'
import { Fragment } from 'react'
import { Disclosure, Menu, Transition } from '@headlessui/react'
import { 
  Bars3Icon, 
  XMarkIcon, 
  BoltIcon,
  ChevronDownIcon,
  LanguageIcon
} from '@heroicons/react/24/outline'
import clsx from 'clsx'
import { useLanguage } from '../../contexts/LanguageContext'

interface NavItem {
  name: string
  href?: string
  children?: {
    name: string
    href: string
    description?: string
  }[]
}

const Header = () => {
  const location = useLocation()
  const { language, setLanguage, t } = useLanguage()
  
  const basePath = language === 'de' ? '/de' : ''
  
  const navigation: NavItem[] = [
    {
      name: t('nav.services'),
      children: [
        { 
          name: t('services.ai_consulting'), 
          href: `${basePath}/${language === 'en' ? 'services/ai-consulting' : 'dienstleistungen/ki-beratung'}`,
          description: language === 'en' ? 'Strategic AI implementation' : 'Strategische KI-Implementierung'
        },
        { 
          name: t('services.digital_transformation'), 
          href: `${basePath}/${language === 'en' ? 'services/digital-transformation' : 'dienstleistungen/digitale-transformation'}`,
          description: language === 'en' ? 'Modernize your business' : 'Modernisieren Sie Ihr Unternehmen'
        },
        { 
          name: t('services.data_management'), 
          href: `${basePath}/${language === 'en' ? 'services/data-management' : 'dienstleistungen/datenmanagement'}`,
          description: language === 'en' ? 'Data strategy and governance' : 'Datenstrategie und Governance'
        },
        { 
          name: t('services.management_advisory'), 
          href: `${basePath}/${language === 'en' ? 'services/management-advisory' : 'dienstleistungen/management-beratung'}`,
          description: language === 'en' ? 'Strategic IT consulting and transformation' : 'Strategische IT-Beratung und Transformation'
        },
      ]
    },
    {
      name: t('nav.products'),
      children: [
        { 
          name: t('products.data_operating_system'), 
          href: `${basePath}/${language === 'en' ? 'products/data-operating-system' : 'produkte/daten-betriebssystem'}`,
          description: language === 'en' ? 'Unified data management platform' : 'Einheitliche Datenmanagement-Plattform'
        },
        { 
          name: t('products.private_cloud'), 
          href: `${basePath}/${language === 'en' ? 'products/private-cloud' : 'produkte/private-cloud'}`,
          description: language === 'en' ? 'Secure cloud infrastructure' : 'Sichere Cloud-Infrastruktur'
        },
      ]
    },
    {
      name: t('nav.solutions'),
      children: [
        { 
          name: t('solutions.industries'), 
          href: `${basePath}/${language === 'en' ? 'solutions/industries' : 'loesungen/branchen'}`,
          description: language === 'en' ? 'Industry-specific solutions' : 'Branchenspezifische Lösungen'
        },
        { 
          name: t('solutions.technology'), 
          href: `${basePath}/${language === 'en' ? 'solutions/technology' : 'loesungen/technologie'}`,
          description: language === 'en' ? 'Technology platforms' : 'Technologieplattformen'
        },
        { 
          name: t('solutions.case_studies'), 
          href: `${basePath}/${language === 'en' ? 'solutions/case-studies' : 'loesungen/fallstudien'}`,
          description: language === 'en' ? 'Success stories' : 'Erfolgsgeschichten'
        },
      ]
    },
    {
      name: t('nav.resources'),
      children: [
        { 
          name: t('resources.webinars'), 
          href: `${basePath}/${language === 'en' ? 'resources/webinars' : 'ressourcen/webinare'}`,
          description: language === 'en' ? 'Live and recorded webinars' : 'Live und aufgezeichnete Webinare'
        },
        { 
          name: t('resources.whitepapers'), 
          href: `${basePath}/${language === 'en' ? 'resources/whitepapers' : 'ressourcen/whitepapers'}`,
          description: language === 'en' ? 'In-depth guides' : 'Ausführliche Leitfäden'
        },
        { 
          name: t('resources.tools'), 
          href: `${basePath}/${language === 'en' ? 'resources/tools' : 'ressourcen/tools'}`,
          description: language === 'en' ? 'Calculators and assessments' : 'Rechner und Bewertungen'
        },
      ]
    }
  ]
  
  const isActiveLink = (href: string) => {
    if (href === '/' || href === '/de' || href === '/de/') {
      return location.pathname === href || 
             (href === '/' && location.pathname === '') ||
             (href === '/de' && location.pathname === '/de/')
    }
    return location.pathname.startsWith(href)
  }
  
  return (
    <Disclosure as="nav" className="bg-white/95 dark:bg-violet-900/95 backdrop-blur-xl shadow-lg border-b border-gray-100 dark:border-violet-700 sticky top-0 z-50">
      {({ open }) => (
        <>
          <div className="container">
            <div className="flex h-18 justify-between items-center">
              {/* Logo */}
              <div className="flex items-center">
                <Link to={basePath || '/'} className="flex items-center space-x-2 group">
                  <div className="relative">
                    <BoltIcon className="h-8 w-8 text-primary-600 group-hover:text-primary-700 transition-colors duration-200" />
                    <div className="absolute inset-0 bg-primary-600/20 rounded-lg blur-md group-hover:bg-primary-700/30 transition-colors duration-200 -z-10"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold text-gray-900 dark:text-gray-100 transition-colors duration-200">
                      voltAIc Systems
                    </span>
                    <span className="text-xs text-gray-500 -mt-1 font-medium">
                      AI Data Intelligence
                    </span>
                  </div>
                </Link>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden lg:flex lg:items-center lg:space-x-1">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.children ? (
                      <Menu as="div" className="relative">
                        <Menu.Button className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors duration-200">
                          {item.name}
                          <ChevronDownIcon className="ml-1 h-4 w-4" />
                        </Menu.Button>
                        
                        <Transition
                          as={Fragment}
                          enter="transition ease-out duration-200"
                          enterFrom="transform opacity-0 scale-95"
                          enterTo="transform opacity-100 scale-100"
                          leave="transition ease-in duration-150"
                          leaveFrom="transform opacity-100 scale-100"
                          leaveTo="transform opacity-0 scale-95"
                        >
                          <Menu.Items className="absolute left-0 mt-2 w-64 origin-top-left rounded-lg bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
                            <div className="py-2">
                              {item.children.map((child) => (
                                <Menu.Item key={child.href}>
                                  {({ active }) => (
                                    <Link
                                      to={child.href}
                                      className={clsx(
                                        'block px-4 py-3 text-sm',
                                        active ? 'bg-gray-50 dark:bg-gray-700' : '',
                                        isActiveLink(child.href) 
                                          ? 'text-primary-600 dark:text-primary-400 font-medium' 
                                          : 'text-gray-700 dark:text-gray-200'
                                      )}
                                    >
                                      <div className="font-medium">{child.name}</div>
                                      {child.description && (
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                          {child.description}
                                        </div>
                                      )}
                                    </Link>
                                  )}
                                </Menu.Item>
                              ))}
                            </div>
                          </Menu.Items>
                        </Transition>
                      </Menu>
                    ) : (
                      <Link
                        to={item.href!}
                        className={clsx(
                          'px-4 py-2 font-medium transition-colors duration-200',
                          isActiveLink(item.href!) 
                            ? 'text-primary-600 dark:text-primary-400' 
                            : 'text-gray-700 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400'
                        )}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Desktop Actions */}
              <div className="hidden lg:flex lg:items-center lg:space-x-4">
                {/* Language Switcher */}
                <Menu as="div" className="relative">
                  <Menu.Button className="flex items-center px-3 py-1.5 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                    <LanguageIcon className="h-4 w-4 mr-2" />
                    {language === 'en' ? 'EN' : 'DE'}
                    <ChevronDownIcon className="ml-1 h-3 w-3" />
                  </Menu.Button>
                  
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute right-0 mt-2 w-32 origin-top-right rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setLanguage('en')}
                              className={clsx(
                                'w-full text-left px-4 py-2 text-sm',
                                active ? 'bg-gray-50 dark:bg-gray-700' : '',
                                language === 'en' 
                                  ? 'text-primary-600 dark:text-primary-400 font-medium' 
                                  : 'text-gray-700 dark:text-gray-200'
                              )}
                            >
                              English
                            </button>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              onClick={() => setLanguage('de')}
                              className={clsx(
                                'w-full text-left px-4 py-2 text-sm',
                                active ? 'bg-gray-50 dark:bg-gray-700' : '',
                                language === 'de' 
                                  ? 'text-primary-600 dark:text-primary-400 font-medium' 
                                  : 'text-gray-700 dark:text-gray-200'
                              )}
                            >
                              Deutsch
                            </button>
                          )}
                        </Menu.Item>
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
                
                {/* CTA Button */}
                <Link
                  to={`${basePath}/${language === 'en' ? 'contact/booking' : 'kontakt/terminbuchung'}`}
                  className="btn-primary btn-sm"
                >
                  {language === 'en' ? 'Book Consultation' : 'Beratung buchen'}
                </Link>
              </div>
              
              {/* Mobile menu button */}
              <div className="flex items-center lg:hidden">
                <Disclosure.Button className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-violet-800 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500 transition-colors duration-200">
                  <span className="sr-only">Open main menu</span>
                  {open ? (
                    <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                  ) : (
                    <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                  )}
                </Disclosure.Button>
              </div>
            </div>
          </div>

          {/* Mobile Navigation Panel */}
          <Disclosure.Panel className="lg:hidden border-t border-gray-100 dark:border-violet-700">
            <div className="bg-white/95 dark:bg-violet-900/95 backdrop-blur-md">
              <div className="px-4 py-3 space-y-1">
                {navigation.map((item) => (
                  <div key={item.name}>
                    {item.children ? (
                      <Disclosure as="div">
                        {({ open: subOpen }) => (
                          <>
                            <Disclosure.Button className="w-full flex items-center justify-between px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-violet-800 rounded-lg">
                              {item.name}
                              <ChevronDownIcon 
                                className={clsx(
                                  'h-4 w-4 transition-transform',
                                  subOpen ? 'rotate-180' : ''
                                )} 
                              />
                            </Disclosure.Button>
                            <Disclosure.Panel className="pl-8 pr-4 py-2 space-y-1">
                              {item.children.map((child) => (
                                <Link
                                  key={child.href}
                                  to={child.href}
                                  className="block px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 rounded-lg"
                                >
                                  {child.name}
                                </Link>
                              ))}
                            </Disclosure.Panel>
                          </>
                        )}
                      </Disclosure>
                    ) : (
                      <Link
                        to={item.href!}
                        className="block px-4 py-3 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-violet-800 rounded-lg"
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                ))}
                
                <div className="pt-4 border-t border-gray-200 dark:border-violet-700">
                  <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Language:</span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setLanguage('en')}
                        className={clsx(
                          'px-3 py-1 text-sm rounded',
                          language === 'en' 
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                            : 'text-gray-600 dark:text-gray-400'
                        )}
                      >
                        EN
                      </button>
                      <button
                        onClick={() => setLanguage('de')}
                        className={clsx(
                          'px-3 py-1 text-sm rounded',
                          language === 'de' 
                            ? 'bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400' 
                            : 'text-gray-600 dark:text-gray-400'
                        )}
                      >
                        DE
                      </button>
                    </div>
                  </div>
                  
                  <Link
                    to={`${basePath}/${language === 'en' ? 'contact/booking' : 'kontakt/terminbuchung'}`}
                    className="block mx-4 mt-2 text-center btn-primary btn-sm"
                  >
                    {language === 'en' ? 'Book Consultation' : 'Beratung buchen'}
                  </Link>
                </div>
              </div>
            </div>
          </Disclosure.Panel>
        </>
      )}
    </Disclosure>
  )
}

export default Header