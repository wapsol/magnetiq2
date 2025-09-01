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
  PlusIcon,
  EnvelopeIcon,
  CurrencyDollarIcon,
  UsersIcon,
  ServerIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BellIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline'

const AdminDashboard = () => {
  // Key Performance Indicators
  const kpiStats = [
    {
      name: 'Monthly Revenue',
      value: '€47,200',
      change: '+22.5%',
      changeType: 'positive' as const,
      icon: CurrencyDollarIcon,
      color: 'success',
      href: '/admin/analytics/revenue'
    },
    {
      name: 'New Leads',
      value: '342',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: UserGroupIcon,
      color: 'primary',
      href: '/admin/leads'
    },
    {
      name: 'Conversion Rate',
      value: '12.8%',
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: ChartBarIcon,
      color: 'accent',
      href: '/admin/analytics/conversions'
    },
    {
      name: 'Active Sessions',
      value: '156',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: EyeIcon,
      color: 'warning',
      href: '/admin/analytics/traffic'
    }
  ]

  // Content & Business Stats
  const contentStats = [
    {
      name: 'Content Pages',
      value: '24',
      change: '+3',
      changeType: 'positive' as const,
      icon: DocumentTextIcon,
      color: 'primary',
      href: '/admin/content/pages'
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
      name: 'Active Webinars',
      value: '8',
      change: '+1',
      changeType: 'positive' as const,
      icon: VideoCameraIcon,
      color: 'accent',
      href: '/admin/business/webinars'
    },
    {
      name: 'Consultations',
      value: '23',
      change: '+5',
      changeType: 'positive' as const,
      icon: CalendarDaysIcon,
      color: 'warning',
      href: '/admin/business/bookings'
    }
  ]

  // Communication & System Health
  const systemStats = [
    {
      name: 'Email Delivery Rate',
      value: '99.2%',
      change: '+0.3%',
      changeType: 'positive' as const,
      icon: EnvelopeIcon,
      color: 'success',
      href: '/admin/communications/email'
    },
    {
      name: 'System Uptime',
      value: '99.9%',
      change: '0%',
      changeType: 'neutral' as const,
      icon: ServerIcon,
      color: 'success',
      href: '/admin/system/health'
    },
    {
      name: 'API Response Time',
      value: '142ms',
      change: '-8ms',
      changeType: 'positive' as const,
      icon: GlobeAltIcon,
      color: 'primary',
      href: '/admin/system/performance'
    },
    {
      name: 'Security Events',
      value: '2',
      change: '-3',
      changeType: 'positive' as const,
      icon: ShieldCheckIcon,
      color: 'warning',
      href: '/admin/system/security'
    }
  ]

  const recentActivity = [
    {
      id: 1,
      type: 'lead',
      title: 'New qualified lead',
      description: 'Enterprise prospect downloaded "AI Strategy Whitepaper"',
      time: '2 minutes ago',
      icon: UserGroupIcon,
      color: 'text-primary-600',
      priority: 'high'
    },
    {
      id: 2,
      type: 'booking',
      title: 'Consultation booked',
      description: 'TechCorp CEO - AI Strategy Session (€500)',
      time: '5 minutes ago',
      icon: CalendarDaysIcon,
      color: 'text-success-600',
      priority: 'high'
    },
    {
      id: 3,
      type: 'webinar',
      title: 'Webinar starting soon',
      description: '"Digital Transformation" - 127 registered attendees',
      time: '10 minutes ago',
      icon: PlayIcon,
      color: 'text-accent-600',
      priority: 'medium'
    },
    {
      id: 4,
      type: 'email',
      title: 'Campaign performance',
      description: '"Q4 Newsletter" - 42% open rate, 8.3% click rate',
      time: '15 minutes ago',
      icon: EnvelopeIcon,
      color: 'text-indigo-600',
      priority: 'medium'
    },
    {
      id: 5,
      type: 'download',
      title: 'Whitepaper milestone',
      description: '"Modern Web Architecture" reached 1,000 downloads',
      time: '30 minutes ago',
      icon: ArrowDownTrayIcon,
      color: 'text-success-600',
      priority: 'low'
    },
    {
      id: 6,
      type: 'content',
      title: 'Content updated',
      description: '"Services" page content refreshed with new case study',
      time: '1 hour ago',
      icon: DocumentTextIcon,
      color: 'text-gray-600',
      priority: 'low'
    }
  ]

  const upcomingEvents = [
    {
      id: 1,
      title: 'Digital Transformation Masterclass',
      type: 'webinar',
      date: 'Today, 3:00 PM CET',
      attendees: 127,
      revenue: '€1,270',
      status: 'live-soon',
      consultant: 'Dr. Mueller'
    },
    {
      id: 2,
      title: 'AI Strategy Consultation - TechCorp',
      type: 'consultation',
      date: 'Tomorrow, 10:00 AM CET',
      attendees: 3,
      revenue: '€500',
      status: 'confirmed',
      consultant: 'Sarah Johnson'
    },
    {
      id: 3,
      title: '30-for-30 Startup Session',
      type: 'consultation',
      date: 'Tomorrow, 2:30 PM CET',
      attendees: 2,
      revenue: '€150',
      status: 'confirmed',
      consultant: 'Michael Chen'
    },
    {
      id: 4,
      title: 'Enterprise Architecture Workshop',
      type: 'webinar',
      date: 'Wednesday, 4:00 PM CET',
      attendees: 89,
      revenue: '€890',
      status: 'scheduled',
      consultant: 'Alex Rodriguez'
    },
    {
      id: 5,
      title: 'System Maintenance Window',
      type: 'maintenance',
      date: 'Friday, 11:00 PM CET',
      attendees: null,
      revenue: null,
      status: 'scheduled',
      consultant: null
    }
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

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
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
      
      {/* KPI Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {kpiStats.map((stat, index) => {
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
                        ) : stat.changeType === 'negative' ? (
                          <ArrowTrendingDownIcon className="h-4 w-4 text-error-600" />
                        ) : (
                          <div className="h-4 w-4" />
                        )}
                        <span className={`ml-1 text-sm font-medium ${
                          stat.changeType === 'positive' ? 'text-success-600' : 
                          stat.changeType === 'negative' ? 'text-error-600' : 'text-gray-500'
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
      </div>
      
      {/* Content & Business Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Content & Operations</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {contentStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Link
                key={stat.name}
                to={stat.href}
                className="card hover-lift hover-glow p-6 group transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${(index + 4) * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700">
                      {stat.name}
                    </p>
                    <div className="mt-2 flex items-baseline">
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      <div className="ml-2 flex items-center">
                        <ArrowTrendingUpIcon className="h-4 w-4 text-success-600" />
                        <span className="ml-1 text-sm font-medium text-success-600">
                          {stat.change}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </div>
      
      {/* System Health Stats */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Health</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {systemStats.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Link
                key={stat.name}
                to={stat.href}
                className="card hover-lift hover-glow p-6 group transition-all duration-300 animate-fade-in-up"
                style={{ animationDelay: `${(index + 8) * 100}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 group-hover:text-gray-700">
                      {stat.name}
                    </p>
                    <div className="mt-2 flex items-baseline">
                      <p className="text-2xl font-bold text-gray-900">
                        {stat.value}
                      </p>
                      {stat.changeType !== 'neutral' && (
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
                      )}
                    </div>
                  </div>
                  <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
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
                        <div className="flex-shrink-0 relative">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activity.color.replace('text-', 'bg-').replace('-600', '-100')}`}>
                            <Icon className={`h-5 w-5 ${activity.color}`} />
                          </div>
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getPriorityIndicator(activity.priority)}`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900">
                              {activity.title}
                            </h3>
                            {activity.priority === 'high' && (
                              <span className="badge badge-error text-xs">High Priority</span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {activity.description}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">
                                {activity.time}
                              </span>
                            </div>
                            {activity.type === 'booking' && (
                              <div className="flex items-center text-xs text-success-600">
                                <CurrencyDollarIcon className="h-3 w-3 mr-1" />
                                Revenue opportunity
                              </div>
                            )}
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
                      event.status === 'confirmed' ? 'bg-success-500' :
                      event.status === 'scheduled' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">
                          {event.title}
                        </h3>
                        {event.revenue && (
                          <span className="text-xs font-medium text-success-600">
                            {event.revenue}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {event.date}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center space-x-4">
                          {event.attendees !== null && (
                            <div className="flex items-center">
                              <UserGroupIcon className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">
                                {event.attendees}
                              </span>
                            </div>
                          )}
                          {event.consultant && (
                            <div className="flex items-center">
                              <UsersIcon className="h-4 w-4 text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">
                                {event.consultant}
                              </span>
                            </div>
                          )}
                        </div>
                        {event.status === 'live-soon' && (
                          <span className="badge badge-error text-xs animate-pulse">
                            Starting Soon
                          </span>
                        )}
                        {event.status === 'confirmed' && (
                          <span className="badge badge-success text-xs">
                            Confirmed
                          </span>
                        )}
                      </div>
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