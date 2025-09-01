import { Link } from 'react-router-dom'
import { useLanguage } from '../../../contexts/LanguageContext'
import { 
  BoltIcon,
  ChartBarIcon,
  CpuChipIcon,
  CloudIcon,
  CheckCircleIcon,
  HomeIcon,
  ChevronRightIcon,
  SunIcon,
  CircleStackIcon
} from '@heroicons/react/24/outline'

const EnergyPage = () => {
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''
  const isGerman = language === 'de'

  const energyStats = [
    {
      value: '$6T',
      label: isGerman ? 'Globaler Energiesektor 2024' : 'Global energy sector 2024',
      icon: BoltIcon
    },
    {
      value: '15%+',
      label: isGerman ? 'Effizienzsteigerung durch KI-gestützte Smart Grids' : 'Efficiency improvement through AI-powered smart grids',
      icon: ChartBarIcon
    },
    {
      value: '40%',
      label: isGerman ? 'Reduzierter Energieverlust durch autonome Optimierung' : 'Reduced energy loss through autonomous optimization',
      icon: CloudIcon
    }
  ]

  const useCases = [
    {
      title: isGerman ? 'Autonome Smart Grid Optimierung' : 'Autonomous Smart Grid Optimization',
      description: isGerman 
        ? 'KI-Agenten für zentralisierte semantische Netzsteuerung mit funktionsübergreifender Energieverteilungsoptimierung' 
        : 'AI agents for centralized semantic grid control with cross-functional energy distribution optimization',
      icon: BoltIcon
    },
    {
      title: isGerman ? 'Holistische Erneuerbare Energien Prognose' : 'Holistic Renewable Energy Forecasting',
      description: isGerman 
        ? 'Skalierbare KI für nahtlose Interaktion zwischen Wettervorhersage, Energieerzeugung und Netzmanagement' 
        : 'Scalable AI for seamless interaction between weather forecasting, energy generation, and grid management',
      icon: SunIcon
    },
    {
      title: isGerman ? 'Intelligente Verbrauchsanalyse' : 'Intelligent Consumption Analytics',
      description: isGerman 
        ? 'Autonome Datenharmonisierung für Echtzeit-Energieverbrauchsoptimierung und Effizienzsteigerung' 
        : 'Autonomous data harmonization for real-time energy consumption optimization and efficiency improvement',
      icon: CircleStackIcon
    }
  ]

  const benefits = [
    {
      percentage: '25%',
      description: isGerman ? 'Reduzierte Betriebskosten' : 'Reduced operational costs'
    },
    {
      percentage: '30%',
      description: isGerman ? 'Verbesserte Netzstabilität' : 'Improved grid stability'
    }
  ]

  const solutions = [
    {
      title: isGerman ? 'Zentralisiertes Smart Grid Management' : 'Centralized Smart Grid Management',
      description: isGerman 
        ? 'Semantische Datenoperationen für intelligente Steuerung und autonome Netzüberwachung' 
        : 'Semantic data operations for intelligent control and autonomous grid monitoring'
    },
    {
      title: isGerman ? 'KI-Agenten für Anlagenwartung' : 'AI Agents for Asset Maintenance',
      description: isGerman 
        ? 'Holistische KI für Vorhersage von Wartungsbedarf mit funktionsübergreifenden Einblicken' 
        : 'Holistic AI for maintenance needs prediction with cross-functional insights'
    },
    {
      title: isGerman ? 'Autonomes Demand Response' : 'Autonomous Demand Response',
      description: isGerman 
        ? 'Skalierbare KI für automatische Laststeuerung und Energieeffizienzmaximierung' 
        : 'Scalable AI for automatic load management and energy efficiency maximization'
    },
    {
      title: isGerman ? 'Intelligenter Energiehandel' : 'Intelligent Energy Trading',
      description: isGerman 
        ? 'Zentrale Datenoperationen für optimierten Energiehandel mit Echtzeit-Marktanalysen' 
        : 'Central data operations for optimized energy trading with real-time market analysis'
    }
  ]

  const faqs = [
    {
      question: isGerman ? 'Wie wird die Netzstabilität gewährleistet?' : 'How is grid stability ensured?',
      answer: isGerman 
        ? 'Unsere KI überwacht kontinuierlich Netzzustand und -belastung und passt automatisch die Energieverteilung an.' 
        : 'Our AI continuously monitors grid condition and load, automatically adjusting energy distribution.'
    },
    {
      question: isGerman ? 'Können erneuerbare Energien integriert werden?' : 'Can renewable energy sources be integrated?',
      answer: isGerman 
        ? 'Ja, unser System optimiert die Integration von Solar, Wind und anderen erneuerbaren Energiequellen.' 
        : 'Yes, our system optimizes integration of solar, wind, and other renewable energy sources.'
    },
    {
      question: isGerman ? 'Wie genau sind die Verbrauchsprognosen?' : 'How accurate are consumption forecasts?',
      answer: isGerman 
        ? 'Unsere Prognosemodelle erreichen eine Genauigkeit von über 95% bei der Vorhersage des Energieverbrauchs.' 
        : 'Our forecasting models achieve over 95% accuracy in predicting energy consumption.'
    },
    {
      question: isGerman ? 'Ist die Lösung skalierbar für verschiedene Netzgrößen?' : 'Is the solution scalable for different grid sizes?',
      answer: isGerman 
        ? 'Ja, unsere Architektur skaliert von lokalen Mikronetzen bis hin zu nationalen Stromnetzen.' 
        : 'Yes, our architecture scales from local microgrids to national power grids.'
    }
  ]

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
            {isGerman ? 'Energie & Versorgung' : 'Energy & Utilities'}
          </span>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isGerman ? 'Energie & Versorgung' : 'Energy & Utilities'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            {isGerman 
              ? 'Smart Grid Management, Energieprognosen und Verbrauchsoptimierung für nachhaltige und effiziente Energiesysteme'
              : 'Smart grid management, energy forecasting, and consumption optimization for sustainable and efficient energy systems'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {energyStats.map((stat, index) => (
              <div key={index} className="text-center p-6 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                <stat.icon className="h-12 w-12 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
                <div className="text-3xl font-bold text-primary-600 dark:text-primary-400 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 dark:text-gray-300">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* Key Solutions */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
              {isGerman ? 'Unsere Energielösungen' : 'Our Energy Solutions'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {solutions.map((solution, index) => (
                <div key={index} className="text-center p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {solution.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {solution.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Use Cases */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
              {isGerman ? 'Anwendungsfälle in der Energiewirtschaft' : 'Energy Industry Use Cases'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <div key={index} className="p-6 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <useCase.icon className="h-10 w-10 text-primary-600 dark:text-primary-400 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {useCase.title}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {useCase.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
              {isGerman ? 'Nachhaltige Verbesserungen' : 'Sustainable Improvements'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center p-6 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {benefit.percentage}
                  </div>
                  <div className="text-gray-700 dark:text-gray-300">
                    {benefit.description}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <div className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>{isGerman ? 'Erhöhte Energiesicherheit' : 'Increased energy security'}</span>
              </div>
              <div className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-300 ml-8">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>{isGerman ? 'Nachhaltige Energieversorgung' : 'Sustainable energy supply'}</span>
              </div>
            </div>
          </div>

          {/* FAQs */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
              {isGerman ? 'Häufig gestellte Fragen' : 'Frequently Asked Questions'}
            </h3>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="border-l-4 border-primary-500 pl-4">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.question}
                  </h4>
                  <p className="text-gray-600 dark:text-gray-300">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center p-8 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              {isGerman 
                ? 'Optimieren Sie Ihre Energiesysteme mit intelligenten Datenanalysen' 
                : 'Optimize your energy systems with intelligent data analytics'}
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

export default EnergyPage