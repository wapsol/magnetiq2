import { Link, useLocation } from 'react-router-dom'
import clsx from 'clsx'
import { 
  HomeIcon, 
  DocumentTextIcon, 
  VideoCameraIcon, 
  CalendarDaysIcon,
  ChartBarIcon,
  CogIcon,
  UsersIcon,
  BoltIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline'

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/admin', 
    icon: HomeIcon,
    description: 'Overview and analytics'
  },
  { 
    name: 'Content', 
    href: '/admin/content',
    icon: DocumentTextIcon,
    description: 'Manage pages and content',
    children: [
      { name: 'Pages', href: '/admin/content/pages' },
    ]
  },
  { 
    name: 'Business', 
    href: '/admin/business',
    icon: VideoCameraIcon,
    description: 'Webinars and bookings',
    children: [
      { name: 'Webinars', href: '/admin/business/webinars' },
      { name: 'Bookings', href: '/admin/business/bookings' },
    ]
  },
  { 
    name: 'Analytics', 
    href: '/admin/analytics', 
    icon: ChartBarIcon,
    description: 'Performance insights'
  },
  { 
    name: 'Users', 
    href: '/admin/users', 
    icon: UsersIcon,
    description: 'User management'
  },
  { 
    name: 'Settings', 
    href: '/admin/settings', 
    icon: CogIcon,
    description: 'System configuration'
  },
]

const AdminSidebar = () => {
  const location = useLocation()
  
  const isActiveLink = (href: string, children?: any[]) => {
    if (href === '/admin') {
      return location.pathname === '/admin'
    }
    if (children) {
      return children.some(child => location.pathname.startsWith(child.href)) || location.pathname === href
    }
    return location.pathname.startsWith(href)
  }
  
  return (
    <div className="flex flex-col w-72 bg-secondary-900 border-r border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-800">
        <div className="flex items-center space-x-2">
          <div className="relative">
            <BoltIcon className="h-8 w-8 text-primary-400" />
            <div className="absolute inset-0 bg-primary-400/20 rounded-lg blur-md -z-10"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white">
              voltAIc Admin
            </span>
            <span className="text-xs text-gray-400 -mt-1">
              Magnetiq v2
            </span>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = isActiveLink(item.href, item.children)
          
          return (
            <div key={item.name}>
              <Link
                to={item.href}
                className={clsx(
                  'group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
                  isActive
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                )}
              >
                <Icon 
                  className={clsx(
                    'mr-3 h-5 w-5 transition-colors duration-200',
                    isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  )} 
                />
                <div className="flex-1">
                  <div className="font-medium">{item.name}</div>
                  <div className={clsx(
                    'text-xs transition-colors duration-200',
                    isActive ? 'text-primary-100' : 'text-gray-500 group-hover:text-gray-400'
                  )}>
                    {item.description}
                  </div>
                </div>
                {item.children && (
                  <div className={clsx(
                    'ml-auto h-1.5 w-1.5 rounded-full transition-colors duration-200',
                    isActive ? 'bg-white' : 'bg-gray-500 group-hover:bg-gray-400'
                  )} />
                )}
              </Link>
              
              {/* Sub-navigation */}
              {item.children && isActive && (
                <div className="ml-8 mt-2 space-y-1 animate-fade-in">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      to={child.href}
                      className={clsx(
                        'block px-3 py-1.5 text-sm rounded-md transition-colors duration-200',
                        location.pathname === child.href
                          ? 'bg-primary-700 text-white font-medium'
                          : 'text-gray-400 hover:bg-gray-800 hover:text-gray-300'
                      )}
                    >
                      {child.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>
      
      {/* User Section */}
      <div className="border-t border-gray-800 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">
              Admin User
            </div>
            <div className="text-xs text-gray-400 truncate">
              admin@voltaicsystems.com
            </div>
          </div>
        </div>
        
        <button className="w-full flex items-center px-3 py-2 text-sm text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors duration-200 group">
          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2 group-hover:text-white" />
          Sign out
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar