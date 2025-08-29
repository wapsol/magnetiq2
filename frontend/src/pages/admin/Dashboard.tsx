import { Link } from 'react-router-dom'
import {
  DocumentTextIcon,
  VideoCameraIcon,
  CalendarDaysIcon,
  UserGroupIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  PlayIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlusIcon
} from '@heroicons/react/24/outline'

const AdminDashboard = () => {
  const stats = [
    {
      name: 'Total Pages',
      value: '24',
      change: '+12%',
      changeType: 'positive' as const,
      icon: DocumentTextIcon,
      color: 'primary',
      href: '/admin/content/pages'
    },
    {
      name: 'Active Webinars',
      value: '8',
      change: '+3',
      changeType: 'positive' as const,
      icon: VideoCameraIcon,
      color: 'accent',
      href: '/admin/business/webinars'
    },
    {
      name: 'Whitepapers',
      value: '15',
      change: '+2',
      changeType: 'positive' as const,
      icon: ArrowDownTrayIcon,
      color: 'success',
      href: '/admin/content/whitepapers'
    },
    {
      name: 'Pending Bookings',
      value: '5',
      change: '-2',
      changeType: 'negative' as const,
      icon: CalendarDaysIcon,
      color: 'warning',
      href: '/admin/business/bookings'
    },
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'webinar',
      title: 'New webinar registration',
      description: '"Advanced React Patterns" - John Doe registered',
      time: '2 minutes ago',
      icon: PlayIcon,
      color: 'text-primary-600'
    },
    {
      id: 2,
      type: 'download',
      title: 'Whitepaper downloaded',
      description: '"Modern Web Architecture" - 15 downloads today',
      time: '5 minutes ago',
      icon: ArrowDownTrayIcon,
      color: 'text-success-600'
    },
    {
      id: 3,
      type: 'booking',
      title: 'Consultation booked',
      description: 'Enterprise client - Tomorrow 2:00 PM',
      time: '10 minutes ago',
      icon: CalendarDaysIcon,
      color: 'text-accent-600'
    },
    {
      id: 4,
      type: 'content',
      title: 'Page updated',
      description: '"About Us" page content refreshed',
      time: '1 hour ago',
      icon: DocumentTextIcon,
      color: 'text-gray-600'
    },
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: 'React Advanced Patterns',
      type: 'webinar',
      date: 'Today, 3:00 PM',
      attendees: 45,
      status: 'live-soon'
    },
    {
      id: 2,
      title: 'Client Consultation - TechCorp',
      type: 'meeting',
      date: 'Tomorrow, 10:00 AM',
      attendees: 1,
      status: 'scheduled'
    },
    {
      id: 3,
      title: 'System Maintenance',
      type: 'maintenance',
      date: 'Friday, 11:00 PM',
      attendees: null,
      status: 'scheduled'
    },
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      primary: 'text-primary-600 bg-primary-100',
      accent: 'text-accent-600 bg-accent-100',
      success: 'text-success-600 bg-success-100',
      warning: 'text-warning-600 bg-warning-100',
    }
    return colors[color as keyof typeof colors] || colors.primary
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome back! Here's what's happening with your platform today.
          </p>
        </div>
        
        <div className="mt-4 lg:mt-0 flex space-x-3">
          <Link
            to="/admin/content/pages"
            className="btn-outline btn-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Page
          </Link>
          <Link
            to="/admin/business/webinars"
            className="btn-primary btn-sm"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            New Webinar
          </Link>
        </div>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Link
              key={stat.name}
              to={stat.href}
              className="card hover-lift hover-glow p-6 group transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700">
                    {stat.name}
                  </p>
                  <div className="mt-2 flex items-baseline">
                    <p className="text-3xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    <div className="ml-2 flex items-center">
                      {stat.changeType === 'positive' ? (
                        <ArrowTrendingUpIcon className="h-4 w-4 text-success-600" />
                      ) : (
                        <ArrowTrendingDownIcon className="h-4 w-4 text-error-600" />
                      )}
                      <span className={`ml-1 text-sm font-medium ${
                        stat.changeType === 'positive' ? 'text-success-600' : 'text-error-600'
                      }`}>
                        {stat.change}
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)} group-hover:scale-110 transition-transform duration-300`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View all
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="divide-y divide-gray-100">
                {recentActivity.map((activity, index) => {
                  const Icon = activity.icon
                  return (
                    <div 
                      key={activity.id} 
                      className="p-6 hover:bg-gray-50 transition-colors duration-200 animate-fade-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start space-x-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${activity.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                          <Icon className={`h-5 w-5 ${activity.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900">
                            {activity.title}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
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
        </div>

        {/* Upcoming Events */}
        <div>
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming</h2>
            </div>
            <div className="card-body space-y-4">
              {upcomingEvents.map((event, index) => (
                <div 
                  key={event.id} 
                  className="animate-fade-in"
                  style={{ animationDelay: `${(index + 4) * 100}ms` }}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                      event.status === 'live-soon' ? 'bg-error-500 animate-pulse' :
                      event.status === 'scheduled' ? 'bg-success-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900">
                        {event.title}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.date}
                      </p>
                      {event.attendees !== null && (
                        <div className="flex items-center mt-2">
                          <UserGroupIcon className="h-4 w-4 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">
                            {event.attendees} attendees
                          </span>
                        </div>
                      )}
                      {event.status === 'live-soon' && (
                        <div className="mt-2">
                          <span className="badge badge-error text-xs">
                            Starting Soon
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="card-footer">
              <Link
                to="/admin/business"
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                View calendar →
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card">
        <div className="card-header">
          <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              to="/admin/content/pages"
              className="group p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200"
            >
              <DocumentTextIcon className="h-8 w-8 text-gray-400 group-hover:text-primary-600 mb-3" />
              <div className="text-sm font-medium text-gray-900 group-hover:text-primary-700">
                Manage Pages
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Create and edit content
              </div>
            </Link>
            
            <Link
              to="/admin/business/webinars"
              className="group p-4 border border-gray-200 rounded-lg hover:border-accent-300 hover:bg-accent-50 transition-all duration-200"
            >
              <VideoCameraIcon className="h-8 w-8 text-gray-400 group-hover:text-accent-600 mb-3" />
              <div className="text-sm font-medium text-gray-900 group-hover:text-accent-700">
                Host Webinar
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Schedule new event
              </div>
            </Link>
            
            <Link
              to="/admin/analytics"
              className="group p-4 border border-gray-200 rounded-lg hover:border-success-300 hover:bg-success-50 transition-all duration-200"
            >
              <ChartBarIcon className="h-8 w-8 text-gray-400 group-hover:text-success-600 mb-3" />
              <div className="text-sm font-medium text-gray-900 group-hover:text-success-700">
                View Analytics
              </div>
              <div className="text-xs text-gray-500 mt-1">
                Performance insights
              </div>
            </Link>
            
            <Link
              to="/admin/settings"
              className="group p-4 border border-gray-200 rounded-lg hover:border-warning-300 hover:bg-warning-50 transition-all duration-200"
            >
              <UserGroupIcon className="h-8 w-8 text-gray-400 group-hover:text-warning-600 mb-3" />
              <div className="text-sm font-medium text-gray-900 group-hover:text-warning-700">
                Manage Users
              </div>
              <div className="text-xs text-gray-500 mt-1">
                User administration
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard