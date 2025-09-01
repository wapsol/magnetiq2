import { Link } from 'react-router-dom'
import { useLanguage } from '../../../contexts/LanguageContext'
import { 
  ChartBarIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  BanknotesIcon,
  CheckCircleIcon,
  HomeIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline'

const FintechPage = () => {
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''
  const isGerman = language === 'de'

  const fintechStats = [
    {
      value: '$15T',
      label: isGerman ? 'Verwaltete Finanzdaten global' : 'Global financial data managed',
      icon: BanknotesIcon
    },
    {
      value: '250B',
      label: isGerman ? 'Transaktionen jährlich verarbeitet' : 'Transactions processed annually',
      icon: ChartBarIcon
    },
    {
      value: '15%+',
      label: isGerman ? 'Jährliches Wachstum digitaler Zahlungen' : 'Annual digital payments growth',
      icon: ArrowTrendingUpIcon
    }
  ]

  const useCases = [
    {
      title: isGerman ? 'Prädiktive Risikobewertungsmodelle' : 'Predictive Risk Assessment Models',
      description: isGerman 
        ? 'Entwickeln Sie präzise Risikobewertungsrahmen basierend auf historischen Transaktionsdaten und prädiktiven Analysen' 
        : 'Develop precise risk evaluation frameworks using historical transaction data and predictive analytics',
      icon: ShieldCheckIcon
    },
    {
      title: isGerman ? 'Echtzeit-Betrugserkennung' : 'Real-time Fraud Detection Systems',
      description: isGerman 
        ? 'Proaktive Identifikation betrügerischer Aktivitäten durch Echtzeit-Zahlungsinformationsintegration' 
        : 'Proactive identification of fraudulent activities through real-time payment information integration',
      icon: ShieldCheckIcon
    },
    {
      title: isGerman ? 'Personalisierte Anlageempfehlungen' : 'Personalized Investment Recommendations',
      description: isGerman 
        ? 'Analysieren Sie individuelle Kundenportfolios und generieren Sie maßgeschneiderte Anlagevorschläge' 
        : 'Analyze individual customer portfolios and generate tailored investment suggestions',
      icon: CurrencyDollarIcon
    }
  ]

  const benefits = [
    {
      percentage: '20-30%',
      description: isGerman ? 'Verbesserung der Betriebseffizienz' : 'Operational efficiency improvement'
    },
    {
      percentage: '5-15%',
      description: isGerman ? 'Potenzielle Umsatzsteigerung durch Big Data-Lösungen' : 'Potential revenue increase through big data solutions'
    }
  ]

  const solutions = [
    {
      title: isGerman ? 'Umfassende Datenstrukturierung' : 'Comprehensive Data Structuring',
      description: isGerman 
        ? 'Organisierung und Standardisierung Ihrer Finanzdaten nach BCBS 239-Prinzipien' 
        : 'Organization and standardization of financial data following BCBS 239 principles'
    },
    {
      title: isGerman ? 'Intelligente Datenkonsolidierung' : 'Intelligent Data Consolidation',
      description: isGerman 
        ? 'Harmonisierung von Daten aus internen und externen Quellen' 
        : 'Harmonizing data from internal and external sources'
    },
    {
      title: isGerman ? 'Nahtlose Datenintegration' : 'Seamless Data Integration',
      description: isGerman 
        ? 'Verbindung verschiedener Systeme für ganzheitliche Datenoperationen' 
        : 'Connecting different systems for holistic data operations'
    },
    {
      title: isGerman ? 'Regulatorische Datenvalidierung' : 'Regulatory Data Validation',
      description: isGerman 
        ? 'Sicherstellung der Datenqualität für MiFID II und Basel III-Compliance' 
        : 'Ensuring data quality for MiFID II and Basel III compliance'
    }
  ]

  const faqs = [
    {
      question: isGerman ? 'Was bedeutet Datenoptimierung?' : 'What does data optimization mean?',
      answer: isGerman 
        ? 'Datenoptimierung umfasst die Verbesserung der Datenstruktur, -qualität und -zugänglichkeit für bessere Geschäftsentscheidungen.' 
        : 'Data optimization involves improving data structure, quality, and accessibility for better business decisions.'
    },
    {
      question: isGerman ? 'Warum ist Datenkonsolidierung wichtig?' : 'Why is data consolidation important?',
      answer: isGerman 
        ? 'Datenkonsolidierung schafft einen einheitlichen Überblick über alle Geschäftsaktivitäten und ermöglicht fundierte strategische Entscheidungen.' 
        : 'Data consolidation creates a unified view of all business activities and enables informed strategic decisions.'
    },
    {
      question: isGerman ? 'Welche Vorteile bietet Datenintegration?' : 'What benefits does data integration offer?',
      answer: isGerman 
        ? 'Datenintegration verbessert die Effizienz, reduziert Redundanzen und ermöglicht Echtzeiteinblicke in Geschäftsprozesse.' 
        : 'Data integration improves efficiency, reduces redundancies, and enables real-time insights into business processes.'
    },
    {
      question: isGerman ? 'Was ist Datensouveränität im Finanzwesen?' : 'What is data sovereignty in financial services?',
      answer: isGerman 
        ? 'Datensouveränität bedeutet vollständige Kontrolle über Ihre Daten unter Einhaltung aller regulatorischen Anforderungen wie Basel III und Solvency II.' 
        : 'Data sovereignty means complete control over your data while complying with all regulatory requirements like Basel III and Solvency II.'
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
            {isGerman ? 'Finanzdienstleistungen' : 'Financial Services'}
          </span>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isGerman ? 'Finanzdienstleistungen' : 'Financial Services'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            {isGerman 
              ? 'Zentralisierte semantische Datenoperationen für autonome KI-gestützte Finanzprozesse, regulatorische Compliance und datengetriebene Innovationen'
              : 'Centralized semantic data operations for autonomous AI-driven financial processes, regulatory compliance, and data-driven innovations'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {fintechStats.map((stat, index) => (
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
              {isGerman ? 'Unsere Lösungen' : 'Our Solutions'}
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
              {isGerman ? 'Branchenspezifische Anwendungsfälle' : 'Industry Use Cases'}
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
              {isGerman ? 'Wichtige Vorteile' : 'Key Benefits'}
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
                <span>{isGerman ? 'Verbesserte Datensouveränität' : 'Enhanced data sovereignty'}</span>
              </div>
              <div className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-300 ml-8">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>{isGerman ? 'Basel III & Solvency II Compliance' : 'Basel III & Solvency II compliance'}</span>
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
                ? 'Entdecken Sie, wie Sie Ihre Effizienz und Sicherheit steigern können' 
                : 'Discover how to increase your efficiency and security'}
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

export default FintechPage