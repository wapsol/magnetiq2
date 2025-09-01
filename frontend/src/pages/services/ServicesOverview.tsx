import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  CpuChipIcon, 
  ArrowPathIcon, 
  CogIcon, 
  CodeBracketIcon 
} from '@heroicons/react/24/outline'

const ServicesOverview = () => {
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''

  const services = [
    {
      title: t('services.ai_consulting'),
      path: `${basePath}/services/ai-consulting`,
      icon: CpuChipIcon,
      description: language === 'en' 
        ? 'Strategic AI implementation and technology assessment'
        : 'Strategische KI-Implementierung und Technologiebewertung'
    },
    {
      title: t('services.digital_transformation'),
      path: `${basePath}/services/digital-transformation`,
      icon: ArrowPathIcon,
      description: language === 'en'
        ? 'Modernize your business processes and systems'
        : 'Modernisieren Sie Ihre Geschäftsprozesse und Systeme'
    },
    {
      title: t('services.automation'),
      path: `${basePath}/services/automation`,
      icon: CogIcon,
      description: language === 'en'
        ? 'Streamline operations with intelligent automation'
        : 'Optimieren Sie Abläufe mit intelligenter Automatisierung'
    },
    {
      title: t('services.development'),
      path: `${basePath}/services/development`,
      icon: CodeBracketIcon,
      description: language === 'en'
        ? 'Custom AI/ML solutions tailored to your needs'
        : 'Maßgeschneiderte KI/ML-Lösungen für Ihre Bedürfnisse'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('nav.services')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
          {language === 'en' 
            ? 'Transform your business with our comprehensive AI and digital solutions'
            : 'Transformieren Sie Ihr Unternehmen mit unseren umfassenden KI- und digitalen Lösungen'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => (
            <Link
              key={service.path}
              to={service.path}
              className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg group-hover:bg-primary-200 dark:group-hover:bg-primary-800 transition-colors duration-300">
                  <service.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                    {service.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {service.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ServicesOverview