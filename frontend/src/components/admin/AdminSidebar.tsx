import { Link, useLocation } from 'react-router-dom'
import { 
  HomeIcon, 
  DocumentTextIcon, 
  VideoCameraIcon, 
  UsersIcon,
  UserGroupIcon,
  BoltIcon,
  ArrowRightOnRectangleIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline'
import { backgrounds, textColors } from '../../utils/styling'

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/admin', 
    icon: HomeIcon
  },
  { 
    name: 'Content', 
    href: '/admin/content',
    icon: DocumentTextIcon,
    children: [
      { name: 'Pages', href: '/admin/content/pages' },
    ]
  },
  { 
    name: 'Webinars', 
    href: '/admin/webinars',
    icon: VideoCameraIcon
  },
  { 
    name: 'Whitepapers', 
    href: '/admin/whitepapers',
    icon: DocumentArrowDownIcon
  },
  { 
    name: 'Consultants', 
    href: '/admin/consultants',
    icon: UserGroupIcon,
    children: [
      { name: 'Management', href: '/admin/consultants' },
      { name: 'Analytics', href: '/admin/consultants/analytics' },
    ]
  },
  { 
    name: 'Users', 
    href: '/admin/users', 
    icon: UsersIcon
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
    <div className="flex flex-col w-72 bg-black border-r border-gray-300">
      {/* Header */}
      <div className="flex items-center h-16 px-6 border-b border-gray-300">
        <div className="flex items-center space-x-2">
          <BoltIcon className="h-8 w-8 text-white" />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-white">
              voltAIc Admin
            </span>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon
          const isActive = isActiveLink(item.href, item.children)
          
          return (
            <div key={item.name}>
              <Link
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  isActive
                    ? 'bg-black text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <Icon className="mr-3 h-5 w-5" />
                {item.name}
              </Link>
              
              {/* Sub-navigation */}
              {item.children && isActive && (
                <div className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <Link
                      key={child.name}
                      to={child.href}
                      className={`block px-3 py-1.5 text-sm rounded-md ${
                        location.pathname === child.href
                          ? 'bg-gray-800 text-white font-medium'
                          : 'text-gray-400 hover:bg-gray-700 hover:text-gray-300'
                      }`}
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
      <div className="border-t border-gray-300 p-4">
        <div className="flex items-center space-x-3 mb-3">
          <div className="h-8 w-8 bg-black rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-white">A</span>
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium text-white">
              Admin User
            </div>
            <div className="text-xs text-gray-400">
              admin@voltaic.systems
            </div>
          </div>
        </div>
        
        <button className="w-full flex items-center px-3 py-2 text-sm text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg">
          <ArrowRightOnRectangleIcon className="h-4 w-4 mr-2" />
          Sign out
        </button>
      </div>
    </div>
  )
}

export default AdminSidebar