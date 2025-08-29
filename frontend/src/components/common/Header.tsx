import { Link, useLocation } from 'react-router-dom'
import { Disclosure } from '@headlessui/react'
import { Bars3Icon, XMarkIcon, BoltIcon } from '@heroicons/react/24/outline'
import clsx from 'clsx'

const navigation = [
  { name: 'Software', href: '/webinars' },
  { name: 'Services', href: '/whitepapers' },
  { name: 'Über uns', href: '/templates' },
  { name: 'Entwickler', href: '/book-consultation' },
]

interface HeaderProps {
  variant?: 'default' | 'transparent' | 'minimal'
}

const Header = ({ variant = 'default' }: HeaderProps) => {
  const location = useLocation()
  
  const isActiveLink = (href: string) => {
    if (href === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }
  
  const getHeaderClasses = () => {
    switch (variant) {
      case 'transparent':
        return 'bg-white/10 dark:bg-violet-900/10 backdrop-blur-md border-b border-white/20 dark:border-violet-700/20 sticky top-0 z-50 h-18'
      case 'minimal':
        return 'bg-white dark:bg-violet-900 border-b border-gray-100 dark:border-violet-700 sticky top-0 z-50 h-18'
      default:
        return 'bg-white/95 dark:bg-violet-900/95 backdrop-blur-xl shadow-lg border-b border-gray-100 dark:border-violet-700 sticky top-0 z-50 h-18'
    }
  }
  
  const getTextClasses = () => {
    return variant === 'transparent'
      ? 'text-white group-hover:text-white/80'
      : 'text-gray-900 dark:text-gray-100 group-hover:text-primary-700 dark:group-hover:text-primary-300'
  }
  
  const getNavLinkClasses = (isActive: boolean) => {
    if (variant === 'transparent') {
      return clsx(
        'nav-link px-4 py-2 text-white/90 hover:text-white hover:bg-white/10',
        isActive && 'text-white bg-white/20'
      )
    }
    return clsx(
      'nav-link px-4 py-2',
      isActive ? 'nav-link-active' : 'nav-link-inactive'
    )
  }
  
  return (
    <Disclosure as="nav" className={getHeaderClasses()}>
      {({ open }) => (
        <>
          <div className="container">
            <div className="flex h-18 justify-between items-center">
              {/* Logo and Brand */}
              <div className="flex items-center">
                <div className="flex flex-shrink-0 items-center">
                  <Link to="/" className="flex items-center space-x-2 group">
                    <div className="relative">
                      <BoltIcon className="h-8 w-8 text-primary-600 group-hover:text-primary-700 transition-colors duration-200" />
                      <div className="absolute inset-0 bg-primary-600/20 rounded-lg blur-md group-hover:bg-primary-700/30 transition-colors duration-200 -z-10"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xl font-bold transition-colors duration-200 ${getTextClasses()}`}>
                        voltAIc Systems
                      </span>
                      <span className="text-xs text-gray-500 -mt-1 font-medium">
                        AI Data Intelligence
                      </span>
                    </div>
                  </Link>
                </div>
                
              </div>
              
              {/* Desktop Navigation - Centered */}
              <div className="hidden lg:flex lg:space-x-1 lg:absolute lg:left-1/2 lg:transform lg:-translate-x-1/2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={getNavLinkClasses(isActiveLink(item.href))}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              
              {/* Desktop Actions */}
              <div className="hidden lg:flex lg:items-center">
                <Link
                  to="/book-consultation"
                  className="btn-primary btn-sm"
                >
                  Kontakt
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
                  <Link
                    key={item.name}
                    to={item.href}
                    className={clsx(
                      'block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200',
                      isActiveLink(item.href)
                        ? 'bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-l-4 border-primary-600'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-violet-800 hover:text-gray-900 dark:hover:text-white'
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
                
                <div className="pt-4 border-t border-gray-200 dark:border-violet-700">
                  <Link
                    to="/auth/login"
                    className="block px-4 py-3 text-base font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 rounded-lg transition-colors duration-200"
                  >
                    Admin Login
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