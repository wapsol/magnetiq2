import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  BuildingOfficeIcon,
  HeartIcon,
  CogIcon,
  ShoppingBagIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CakeIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

const IndustriesPage = () => {
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''
  const isGerman = language === 'de'

  // Industry slug translations
  const getIndustrySlug = (industryId: string): string => {
    const industrySlugMap = {
      'fintech': 'fintech',
      'healthcare': isGerman ? 'gesundheitswesen' : 'healthcare',
      'manufacturing': isGerman ? 'fertigung' : 'manufacturing',
      'retail': isGerman ? 'einzelhandel' : 'retail',
      'energy': isGerman ? 'energie' : 'energy',
      'sales': isGerman ? 'vertrieb' : 'sales',
      'service-provider': isGerman ? 'dienstleister' : 'service-provider',
      'food-beverage': isGerman ? 'lebensmittel' : 'food-beverage'
    }
    return industrySlugMap[industryId] || industryId
  }

  // Generate localized industry path
  const getIndustryPath = (industryId: string): string => {
    const slug = getIndustrySlug(industryId)
    if (isGerman) {
      return `/de/loesungen/branchen/${slug}`
    }
    return `/solutions/industries/${slug}`
  }

  const industries = [
    {
      id: 'fintech',
      title: isGerman ? 'Finanzdienstleistungen' : 'Financial Services',
      description: isGerman 
        ? 'Datenoptimierung für Banken, Fintech und Versicherungen'
        : 'Data optimization for banks, fintech, and insurance companies',
      icon: BuildingOfficeIcon,
      path: getIndustryPath('fintech'),
      marketSize: '$15T',
      growth: '15%+'
    },
    {
      id: 'healthcare',
      title: isGerman ? 'Gesundheitswesen & Biotechnologie' : 'Healthcare & Life Sciences',
      description: isGerman 
        ? 'KI-gesteuerte Lösungen für medizinische Datenoptimierung'
        : 'AI-driven solutions for medical data optimization',
      icon: HeartIcon,
      path: getIndustryPath('healthcare'),
      marketSize: '$4.3T',
      growth: '30%+'
    },
    {
      id: 'manufacturing',
      title: isGerman ? 'Fertigung & Lieferkette' : 'Manufacturing & Supply Chain',
      description: isGerman 
        ? 'Smart Manufacturing und IoT-Datenintegration'
        : 'Smart manufacturing and IoT data integration',
      icon: CogIcon,
      path: getIndustryPath('manufacturing'),
      marketSize: '$12T',
      growth: '25%+'
    },
    {
      id: 'retail',
      title: isGerman ? 'Einzelhandel & E-Commerce' : 'Retail & E-Commerce',
      description: isGerman 
        ? 'Kundenanalyse und Bestandsoptimierung'
        : 'Customer analytics and inventory optimization',
      icon: ShoppingBagIcon,
      path: getIndustryPath('retail'),
      marketSize: '$24T',
      growth: '20%+'
    },
    {
      id: 'energy',
      title: isGerman ? 'Energie & Versorgung' : 'Energy & Utilities',
      description: isGerman 
        ? 'Smart Grid und Energiedatenmanagement'
        : 'Smart grid and energy data management',
      icon: BoltIcon,
      path: getIndustryPath('energy'),
      marketSize: '$6T',
      growth: '15%+'
    },
    {
      id: 'sales',
      title: isGerman ? 'Vertrieb & Kundenservice' : 'Sales & Customer Service',
      description: isGerman 
        ? 'CRM-Optimierung und Kundenanalyse'
        : 'CRM optimization and customer analytics',
      icon: ChatBubbleLeftRightIcon,
      path: getIndustryPath('sales'),
      marketSize: '$1.2T',
      growth: '25%+'
    },
    {
      id: 'service-provider',
      title: isGerman ? 'Dienstleister' : 'Service Provider',
      description: isGerman 
        ? 'Digitale Transformation für professionelle Dienstleistungen'
        : 'Digital transformation for professional services',
      icon: UserGroupIcon,
      path: getIndustryPath('service-provider'),
      marketSize: '$2.8T',
      growth: '30%+'
    },
    {
      id: 'food-beverage',
      title: isGerman ? 'Lebensmittel & Getränke' : 'Food & Beverage',
      description: isGerman 
        ? 'Rückverfolgbarkeit und Qualitätskontrolle'
        : 'Traceability and quality control solutions',
      icon: CakeIcon,
      path: getIndustryPath('food-beverage'),
      marketSize: '$8T',
      growth: '20%+'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('solutions.industries')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            {isGerman 
              ? 'Maßgeschneiderte Datenoptimierungslösungen für verschiedene Branchen'
              : 'Tailored data optimization solutions for various industries'}
          </p>
        </div>

        {/* Industries Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {industries.map((industry) => (
            <Link
              key={industry.id}
              to={industry.path}
              className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-all duration-300 group hover:scale-105"
            >
              <div className="flex flex-col h-full">
                {/* Icon and Market Info */}
                <div className="flex justify-between items-start mb-4">
                  <industry.icon className="h-12 w-12 text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors" />
                  <div className="text-right">
                    <div className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                      {industry.marketSize}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {industry.growth} {isGerman ? 'Wachstum' : 'growth'}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {industry.title}
                </h3>

                {/* Description */}
                <p className="text-gray-600 dark:text-gray-300 flex-grow mb-4">
                  {industry.description}
                </p>

                {/* Learn More Link */}
                <div className="flex items-center text-primary-600 dark:text-primary-400 group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                  <span className="text-sm font-medium">
                    {isGerman ? 'Mehr erfahren' : 'Learn more'}
                  </span>
                  <ArrowRightIcon className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-16 text-center p-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
            {isGerman 
              ? 'Ihre Branche nicht dabei?' 
              : 'Don\'t see your industry?'}
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            {isGerman 
              ? 'Wir entwickeln maßgeschneiderte Lösungen für jede Branche. Lassen Sie uns über Ihre spezifischen Anforderungen sprechen.'
              : 'We develop customized solutions for every industry. Let\'s discuss your specific requirements.'}
          </p>
          <button className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-colors">
            {isGerman ? 'Beratung vereinbaren' : 'Schedule a consultation'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default IndustriesPage