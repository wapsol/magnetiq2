import { Link } from 'react-router-dom'
import { 
  VideoCameraIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'

const BusinessOverview = () => {
  const businessSections = [
    {
      title: 'Webinars Manager',
      description: 'Manage webinar scheduling, registrations, and analytics',
      icon: VideoCameraIcon,
      path: '/admin/business/webinars',
      color: 'bg-indigo-500',
      stats: 'Live webinars & recordings'
    },
    {
      title: 'Event Calendar',
      description: 'Coordinate events, meetings, and business schedules',
      icon: CalendarDaysIcon,
      path: '/admin/business/events',
      color: 'bg-emerald-500',
      stats: 'Upcoming events'
    },
    {
      title: 'Analytics Dashboard',
      description: 'Track engagement, conversions, and business metrics',
      icon: ChartBarIcon,
      path: '/admin/business/analytics',
      color: 'bg-orange-500',
      stats: 'Performance insights'
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Business Operations</h1>
        <p className="mt-2 text-gray-600">
          Manage your business activities, events, and performance analytics
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {businessSections.map((section) => (
          <Link
            key={section.path}
            to={section.path}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 group"
          >
            <div className="flex items-center mb-4">
              <div className={`${section.color} p-3 rounded-lg text-white mr-4`}>
                <section.icon className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                  {section.title}
                </h3>
                <p className="text-sm text-gray-500">{section.stats}</p>
              </div>
            </div>
            
            <p className="text-gray-600 mb-4">
              {section.description}
            </p>
            
            <div className="flex items-center text-primary-600 text-sm font-medium group-hover:text-primary-700 transition-colors">
              <span>Manage</span>
              <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default BusinessOverview