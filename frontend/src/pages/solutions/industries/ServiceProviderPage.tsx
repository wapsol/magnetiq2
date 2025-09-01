import { Link } from 'react-router-dom'
import { useLanguage } from '../../../contexts/LanguageContext'
import { 
  UserGroupIcon,
  HomeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

const ServiceProviderPage = () => {
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''
  const isGerman = language === 'de'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container py-16">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 mb-8">
          <Link to={`${basePath}/`} className="hover:text-primary-600 dark:hover:text-primary-400">
            <HomeIcon className="h-4 w-4" />
          </Link>
          <ChevronRightIcon className="h-4 w-4" />
          <Link to={`${basePath}/solutions`} className="hover:text-primary-600 dark:hover:text-primary-400">
            {t('nav.solutions')}
          </Link>
          <ChevronRightIcon className="h-4 w-4" />
          <Link to={`${basePath}/solutions/industries`} className="hover:text-primary-600 dark:hover:text-primary-400">
            {t('solutions.industries')}
          </Link>
          <ChevronRightIcon className="h-4 w-4" />
          <span className="text-gray-900 dark:text-white">
            {isGerman ? 'Dienstleister' : 'Service Provider'}
          </span>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isGerman ? 'Dienstleister' : 'Service Provider'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            {isGerman 
              ? 'Skalierbare, holistische KI für Dienstleistungsunternehmen mit autonomer Datenharmonisierung und End-to-End-Workflow-Automatisierung'
              : 'Scalable, holistic AI for service businesses with autonomous data harmonization and end-to-end workflow automation'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center p-12">
            <UserGroupIcon className="h-24 w-24 text-primary-600 dark:text-primary-400 mx-auto mb-8" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {isGerman ? 'Zentralisierte semantische Datenoperationen für Dienstleister' : 'Centralized Semantic Data Operations for Service Providers'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              {isGerman 
                ? 'Nahtlose Interaktion zwischen Kundenmanagement, Projektabwicklung und Ressourcenoptimierung mit KI-Agenten für maximale Arbeitsplatzwertschöpfung'
                : 'Seamless interaction between customer management, project delivery, and resource optimization with AI agents for maximum workplace value creation'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {isGerman ? 'Autonome Kundenbetreuung' : 'Autonomous Customer Care'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {isGerman ? 'KI-Agenten für 24/7 Kundenservice' : 'AI agents for 24/7 customer service'}
                </p>
              </div>
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {isGerman ? 'Intelligentes Projektmanagement' : 'Intelligent Project Management'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {isGerman ? 'Holistische KI für Projektoptimierung' : 'Holistic AI for project optimization'}
                </p>
              </div>
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {isGerman ? 'Semantische Ressourcenplanung' : 'Semantic Resource Planning'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {isGerman ? 'Zentrale Datenoperationen für Effizienz' : 'Central data operations for efficiency'}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center p-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {isGerman 
                ? 'Transformieren Sie Ihr Dienstleistungsunternehmen mit KI-Agenten' 
                : 'Transform your service business with AI agents'}
            </h3>
            <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
              {isGerman ? 'Beratung vereinbaren' : 'Schedule a consultation'}
            </button>
          </div>
        </div>

        {/* Other Industries */}
        <div className="mt-16">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
            {isGerman ? 'Weitere Branchen entdecken' : 'Explore Other Industries'}
          </h2>
          <div className="text-center">
            <Link 
              to={`${basePath}/solutions/industries`}
              className="inline-flex items-center text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
            >
              <span>{isGerman ? 'Alle Branchen anzeigen' : 'View all industries'}</span>
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ServiceProviderPage