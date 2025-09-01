import { Link } from 'react-router-dom'
import { useLanguage } from '../../../contexts/LanguageContext'
import { 
  ShoppingBagIcon,
  UserGroupIcon,
  ChartBarIcon,
  CpuChipIcon,
  TruckIcon,
  CheckCircleIcon,
  HomeIcon,
  ChevronRightIcon,
  EyeIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'

const RetailPage = () => {
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''
  const isGerman = language === 'de'

  const retailStats = [
    {
      value: '$24T',
      label: isGerman ? 'Globaler Einzelhandelsmarkt 2024' : 'Global retail market 2024',
      icon: ShoppingBagIcon
    },
    {
      value: '20%+',
      label: isGerman ? 'Umsatzwachstum durch KI-Personalisierung' : 'Revenue growth through AI personalization',
      icon: UserGroupIcon
    },
    {
      value: '35%',
      label: isGerman ? 'Höhere Conversion durch funktionsübergreifende Einblicke' : 'Higher conversion through cross-functional insights',
      icon: ChartBarIcon
    }
  ]

  const useCases = [
    {
      title: isGerman ? 'Autonome Kundenverhalten-Analyse' : 'Autonomous Customer Behavior Analytics',
      description: isGerman 
        ? 'KI-Agenten für 360-Grad-Kundensicht mit zentralisierten semantischen Datenoperationen' 
        : 'AI agents for 360-degree customer view with centralized semantic data operations',
      icon: EyeIcon
    },
    {
      title: isGerman ? 'Intelligente Bestandsoptimierung' : 'Intelligent Inventory Optimization',
      description: isGerman 
        ? 'Skalierbare KI für Nachfrageprognose und autonomes Supply Chain Management' 
        : 'Scalable AI for demand forecasting and autonomous supply chain management',
      icon: TruckIcon
    },
    {
      title: isGerman ? 'Semantisches Dynamic Pricing' : 'Semantic Dynamic Pricing',
      description: isGerman 
        ? 'Holistische KI für Echtzeitpreisoptimierung basierend auf Markt- und Verbrauchereinblicken' 
        : 'Holistic AI for real-time price optimization based on market and consumer insights',
      icon: CurrencyDollarIcon
    }
  ]

  const benefits = [
    {
      percentage: '25%',
      description: isGerman ? 'Steigerung der Kundenzufriedenheit' : 'Increase in customer satisfaction'
    },
    {
      percentage: '30%',
      description: isGerman ? 'Reduzierte Lagerkosten' : 'Reduced inventory costs'
    }
  ]

  const solutions = [
    {
      title: isGerman ? 'Semantische Customer 360 Plattform' : 'Semantic Customer 360 Platform',
      description: isGerman 
        ? 'Zentralisierte Datenoperationen für einheitliche Kundensicht mit funktionsübergreifender Harmonisierung' 
        : 'Centralized data operations for unified customer view with cross-functional harmonization'
    },
    {
      title: isGerman ? 'KI-Agenten für Produktempfehlungen' : 'AI Agents for Product Recommendations',
      description: isGerman 
        ? 'Autonome Empfehlungssysteme mit semantischer Datenverarbeitung für Echtzeit-Personalisierung' 
        : 'Autonomous recommendation systems with semantic data processing for real-time personalization'
    },
    {
      title: isGerman ? 'Holistische Preisoptimierung' : 'Holistic Pricing Optimization',
      description: isGerman 
        ? 'Skalierbare KI für intelligente Preisgestaltung entlang der gesamten Wertschöpfungskette' 
        : 'Scalable AI for intelligent pricing across the entire value chain'
    },
    {
      title: isGerman ? 'Autonome Omnichannel-Analytik' : 'Autonomous Omnichannel Analytics',
      description: isGerman 
        ? 'KI-gestützte nahtlose Interaktion zwischen Online-, Offline- und mobilen Kanälen' 
        : 'AI-powered seamless interaction between online, offline, and mobile channels'
    }
  ]

  const faqs = [
    {
      question: isGerman ? 'Wie wird die Kundenprivatsphäre geschützt?' : 'How is customer privacy protected?',
      answer: isGerman 
        ? 'Wir implementieren GDPR-konforme Datenverarbeitung mit vollständiger Transparenz und Kontrolle für Kunden.' 
        : 'We implement GDPR-compliant data processing with full transparency and customer control.'
    },
    {
      question: isGerman ? 'Kann das System mit E-Commerce-Plattformen integriert werden?' : 'Can the system integrate with e-commerce platforms?',
      answer: isGerman 
        ? 'Ja, unsere APIs sind mit führenden Plattformen wie Shopify, Magento und WooCommerce kompatibel.' 
        : 'Yes, our APIs are compatible with leading platforms like Shopify, Magento, and WooCommerce.'
    },
    {
      question: isGerman ? 'Wie genau sind die Nachfrageprognosen?' : 'How accurate are the demand forecasts?',
      answer: isGerman 
        ? 'Unsere KI-Modelle erreichen eine Vorhersagegenauigkeit von bis zu 95% bei saisonalen Produkten.' 
        : 'Our AI models achieve prediction accuracy of up to 95% for seasonal products.'
    },
    {
      question: isGerman ? 'Wie schnell können Empfehlungen implementiert werden?' : 'How quickly can recommendations be implemented?',
      answer: isGerman 
        ? 'Produktempfehlungen werden in Echtzeit generiert und können sofort auf der Website angezeigt werden.' 
        : 'Product recommendations are generated in real-time and can be displayed on websites immediately.'
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
            {isGerman ? 'Einzelhandel & E-Commerce' : 'Retail & E-Commerce'}
          </span>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isGerman ? 'Einzelhandel & E-Commerce' : 'Retail & E-Commerce'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            {isGerman 
              ? 'Holistische KI für nahtlose Omnichannel-Interaktionen mit autonomer Datenharmonisierung für maximale Arbeitsplatzwertschöpfung'
              : 'Holistic AI for seamless omnichannel interactions with autonomous data harmonization for maximum workplace value creation'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {retailStats.map((stat, index) => (
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
              {isGerman ? 'Unsere Retail-Lösungen' : 'Our Retail Solutions'}
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
              {isGerman ? 'Anwendungsfälle im Einzelhandel' : 'Retail Use Cases'}
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
              {isGerman ? 'Bewiesene Ergebnisse' : 'Proven Results'}
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
                <span>{isGerman ? 'Verbesserte Kundenbindung' : 'Improved customer retention'}</span>
              </div>
              <div className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-300 ml-8">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>{isGerman ? 'Optimierte Lagerhaltung' : 'Optimized inventory management'}</span>
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
                ? 'Steigern Sie Ihren Umsatz mit datengesteuerten Retail-Lösungen' 
                : 'Boost your revenue with data-driven retail solutions'}
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

export default RetailPage