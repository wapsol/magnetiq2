import { Link } from 'react-router-dom'
import {
  DocumentTextIcon,
  VideoCameraIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChartBarIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PlusIcon,
  CurrencyDollarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'
import { backgrounds, textColors, getCardClasses } from '../../utils/styling'

const AdminDashboard = () => {
  // Simplified core metrics only
  const coreStats = [
    {
      name: 'Monthly Revenue',
      value: '€47,200',
      change: '+22.5%',
      icon: CurrencyDollarIcon,
      href: '/admin/analytics/revenue'
    },
    {
      name: 'New Leads',
      value: '342',
      change: '+15.3%',
      icon: UserGroupIcon,
      href: '/admin/leads'
    },
    {
      name: 'Active Webinars',
      value: '8',
      change: '+1',
      icon: VideoCameraIcon,
      href: '/admin/webinars'
    },
    {
      name: 'Content Pages',
      value: '24',
      change: '+3',
      icon: DocumentTextIcon,
      href: '/admin/content'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      title: 'New qualified lead',
      description: 'Enterprise prospect downloaded "AI Strategy Whitepaper"',
      time: '2 minutes ago',
      icon: UserGroupIcon,
    },
    {
      id: 2,
      title: 'Consultation booked',
      description: 'TechCorp CEO - AI Strategy Session (€500)',
      time: '5 minutes ago',
      icon: CalendarDaysIcon,
    },
    {
      id: 3,
      title: 'Webinar starting soon',
      description: '"Digital Transformation" - 127 registered attendees',
      time: '10 minutes ago',
      icon: VideoCameraIcon,
    },
    {
      id: 4,
      title: 'Content updated',
      description: '"Services" page content refreshed with new case study',
      time: '1 hour ago',
      icon: DocumentTextIcon,
    }
  ]

  return (
    <div className={`space-y-8 ${backgrounds.page} min-h-screen p-6`}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className={`text-3xl font-bold ${textColors.primary}`}>Dashboard</h1>
          <p className={`mt-2 ${textColors.secondary}`}>
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex space-x-3">
          <Link
            to="/admin/content"
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Content
          </Link>
          <Link
            to="/admin/webinars"
            className="inline-flex items-center px-4 py-2 bg-black border border-transparent rounded-md text-sm font-medium text-white hover:bg-gray-800"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Webinar
          </Link>
        </div>
      </div>
      
      {/* Core Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {coreStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.name}
              to={stat.href}
              className={`${getCardClasses()} p-6`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className={`text-sm font-medium ${textColors.secondary}`}>
                    {stat.name}
                  </p>
                  <div className="mt-2 flex items-baseline">
                    <p className={`text-2xl font-bold ${textColors.primary}`}>
                      {stat.value}
                    </p>
                    <span className="ml-2 text-sm font-medium text-gray-600">
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Icon className="h-5 w-5 text-black" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>
      
      {/* Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className={getCardClasses()}>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className={`text-lg font-semibold ${textColors.primary}`}>Recent Activity</h2>
                <button className="text-sm text-black hover:text-gray-700 font-medium">
                  View all
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {recentActivity.map((activity) => {
                const Icon = activity.icon
                return (
                  <div key={activity.id} className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-sm font-medium ${textColors.primary}`}>
                          {activity.title}
                        </h3>
                        <p className={`text-sm ${textColors.secondary} mt-1`}>
                          {activity.description}
                        </p>
                        <div className="flex items-center mt-2">
                          <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">
                            {activity.time}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <div className={getCardClasses()}>
            <div className="p-6 border-b border-gray-200">
              <h2 className={`text-lg font-semibold ${textColors.primary}`}>Quick Actions</h2>
            </div>
            <div className="p-6 space-y-4">
              <Link
                to="/admin/content"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <DocumentTextIcon className="h-6 w-6 text-gray-400 mr-3" />
                  <div>
                    <div className={`text-sm font-medium ${textColors.primary}`}>
                      Manage Content
                    </div>
                    <div className="text-xs text-gray-500">
                      Create and edit pages
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link
                to="/admin/webinars"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <VideoCameraIcon className="h-6 w-6 text-gray-400 mr-3" />
                  <div>
                    <div className={`text-sm font-medium ${textColors.primary}`}>
                      Host Webinar
                    </div>
                    <div className="text-xs text-gray-500">
                      Schedule new event
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link
                to="/admin/whitepapers"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <ArrowDownTrayIcon className="h-6 w-6 text-gray-400 mr-3" />
                  <div>
                    <div className={`text-sm font-medium ${textColors.primary}`}>
                      Manage Whitepapers
                    </div>
                    <div className="text-xs text-gray-500">
                      Upload and organize
                    </div>
                  </div>
                </div>
              </Link>
              
              <Link
                to="/admin/users"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <UserGroupIcon className="h-6 w-6 text-gray-400 mr-3" />
                  <div>
                    <div className={`text-sm font-medium ${textColors.primary}`}>
                      Manage Users
                    </div>
                    <div className="text-xs text-gray-500">
                      User administration
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard