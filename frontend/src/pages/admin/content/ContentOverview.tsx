import { Link } from 'react-router-dom'
import { 
  DocumentTextIcon, 
  GlobeAltIcon, 
  LanguageIcon,
  ArrowRightIcon 
} from '@heroicons/react/24/outline'

const ContentOverview = () => {
  const contentSections = [
    {
      title: 'Pages Manager',
      description: 'Manage your website pages and content structure',
      icon: DocumentTextIcon,
      path: '/admin/content/pages',
      color: 'bg-blue-500',
    },
    {
      title: 'Industries Manager', 
      description: 'Configure industry-specific content and solutions',
      icon: GlobeAltIcon,
      path: '/admin/content/industries',
      color: 'bg-green-500',
    },
    {
      title: 'Translation Manager',
      description: 'Manage multilingual content and translations',
      icon: LanguageIcon,
      path: '/admin/content/translations', 
      color: 'bg-purple-500',
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Content Management</h1>
        <p className="mt-2 text-gray-600">
          Manage all your website content, pages, and translations from here
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contentSections.map((section) => (
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

export default ContentOverview