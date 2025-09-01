import { Link } from 'react-router-dom'
import { useLanguage } from '../../../contexts/LanguageContext'
import { 
  CakeIcon,
  HomeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

const FoodBeveragePage = () => {
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
            {isGerman ? 'Lebensmittel & Getränke' : 'Food & Beverage'}
          </span>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isGerman ? 'Lebensmittel & Getränke' : 'Food & Beverage'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            {isGerman 
              ? 'Holistische KI für die Lebensmittelindustrie mit autonomer Lieferkettenoptimierung und funktionsübergreifender Qualitätssicherung'
              : 'Holistic AI for the food industry with autonomous supply chain optimization and cross-functional quality assurance'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <div className="text-center p-12">
            <CakeIcon className="h-24 w-24 text-primary-600 dark:text-primary-400 mx-auto mb-8" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              {isGerman ? 'Semantische Datenoperationen für die Lebensmittelindustrie' : 'Semantic Data Operations for Food Industry'}
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              {isGerman 
                ? 'Skalierbare KI-Agenten für nahtlose Interaktion zwischen Rohstoffbeschaffung, Produktion, Qualitätskontrolle und Vertrieb'
                : 'Scalable AI agents for seamless interaction between raw material sourcing, production, quality control, and distribution'}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {isGerman ? 'Intelligente Qualitätssicherung' : 'Intelligent Quality Assurance'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {isGerman ? 'KI-gestützte Lebensmittelsicherheit' : 'AI-powered food safety'}
                </p>
              </div>
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {isGerman ? 'Autonome Lieferkettenoptimierung' : 'Autonomous Supply Chain Optimization'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {isGerman ? 'Zentrale Datenoperationen für Effizienz' : 'Central data operations for efficiency'}
                </p>
              </div>
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {isGerman ? 'Semantische Nachverfolgung' : 'Semantic Traceability'}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {isGerman ? 'Vollständige Rückverfolgbarkeit' : 'Complete product traceability'}
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center p-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {isGerman 
                ? 'Optimieren Sie Ihre Lebensmittelproduktion mit KI-Agenten' 
                : 'Optimize your food production with AI agents'}
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

export default FoodBeveragePage