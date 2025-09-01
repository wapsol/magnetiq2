import { Link } from 'react-router-dom'
import { useLanguage } from '../../../contexts/LanguageContext'
import { 
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  ChartBarIcon,
  CpuChipIcon,
  CheckCircleIcon,
  HomeIcon,
  ChevronRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  PresentationChartLineIcon
} from '@heroicons/react/24/outline'

const SalesPage = () => {
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''
  const isGerman = language === 'de'

  const salesStats = [
    {
      value: '$8T',
      label: isGerman ? 'Globaler CRM-Markt 2024' : 'Global CRM market 2024',
      icon: UserGroupIcon
    },
    {
      value: '35%+',
      label: isGerman ? 'Umsatzsteigerung durch KI-Automatisierung' : 'Revenue increase through AI automation',
      icon: ChartBarIcon
    },
    {
      value: '50%',
      label: isGerman ? 'Höhere Konversionsraten durch Personalisierung' : 'Higher conversion rates through personalization',
      icon: PresentationChartLineIcon
    }
  ]

  const useCases = [
    {
      title: isGerman ? 'Autonome Lead-Qualifizierung' : 'Autonomous Lead Qualification',
      description: isGerman 
        ? 'KI-Agenten für intelligente Lead-Bewertung mit zentralisierten semantischen Kundenoperationen' 
        : 'AI agents for intelligent lead scoring with centralized semantic customer operations',
      icon: UserGroupIcon
    },
    {
      title: isGerman ? 'Intelligente Verkaufsautomatisierung' : 'Intelligent Sales Automation',
      description: isGerman 
        ? 'Holistische KI für nahtlose Interaktion zwischen CRM, Marketing und Kundenservice' 
        : 'Holistic AI for seamless interaction between CRM, marketing, and customer service',
      icon: CpuChipIcon
    },
    {
      title: isGerman ? 'Predictive Customer Support' : 'Predictive Customer Support',
      description: isGerman 
        ? 'Skalierbare KI für proaktive Kundenbetreuung mit funktionsübergreifenden Einblicken' 
        : 'Scalable AI for proactive customer care with cross-functional insights',
      icon: ChatBubbleLeftRightIcon
    }
  ]

  const benefits = [
    {
      percentage: '40%',
      description: isGerman ? 'Reduzierte Vertriebszykluszeiten' : 'Reduced sales cycle times'
    },
    {
      percentage: '60%',
      description: isGerman ? 'Verbesserte Kundenzufriedenheit' : 'Improved customer satisfaction'
    }
  ]

  const solutions = [
    {
      title: isGerman ? 'Semantisches CRM-System' : 'Semantic CRM System',
      description: isGerman 
        ? 'Zentralisierte Datenoperationen für einheitliche Kundensicht mit autonomer Datenharmonisierung' 
        : 'Centralized data operations for unified customer view with autonomous data harmonization'
    },
    {
      title: isGerman ? 'KI-Agenten für Verkaufsautomatisierung' : 'AI Agents for Sales Automation',
      description: isGerman 
        ? 'Autonome End-to-End-Kommunikationsworkflows für maximale Arbeitsplatzwertschöpfung' 
        : 'Autonomous end-to-end communication workflows for maximum workplace value creation'
    },
    {
      title: isGerman ? 'Holistische Kundenservice-KI' : 'Holistic Customer Service AI',
      description: isGerman 
        ? 'Skalierbare KI für alle Kundenservice-Funktionen mit funktionsübergreifender Harmonisierung' 
        : 'Scalable AI for all customer service functions with cross-functional harmonization'
    },
    {
      title: isGerman ? 'Intelligente Vertriebsanalytik' : 'Intelligent Sales Analytics',
      description: isGerman 
        ? 'Zentrale Datenoperationen für Echtzeit-Verkaufseinblicke und prädiktive Marktanalysen' 
        : 'Central data operations for real-time sales insights and predictive market analysis'
    }
  ]

  const faqs = [
    {
      question: isGerman ? 'Wie integriert sich das System mit bestehenden CRM-Plattformen?' : 'How does the system integrate with existing CRM platforms?',
      answer: isGerman 
        ? 'Unsere semantischen Datenoperationen sind mit führenden CRM-Systemen wie Salesforce, HubSpot und Microsoft Dynamics kompatibel.' 
        : 'Our semantic data operations are compatible with leading CRM systems like Salesforce, HubSpot, and Microsoft Dynamics.'
    },
    {
      question: isGerman ? 'Kann die KI personalisierte Verkaufsgespräche führen?' : 'Can the AI conduct personalized sales conversations?',
      answer: isGerman 
        ? 'Ja, unsere KI-Agenten nutzen funktionsübergreifende Kundeneinblicke für personalisierte und kontextbewusste Verkaufsinteraktionen.' 
        : 'Yes, our AI agents use cross-functional customer insights for personalized and context-aware sales interactions.'
    },
    {
      question: isGerman ? 'Wie wird die Kundendatenqualität sichergestellt?' : 'How is customer data quality ensured?',
      answer: isGerman 
        ? 'Zentrale semantische Datenoperationen gewährleisten automatische Datenvalidierung, -bereinigung und -harmonisierung.' 
        : 'Central semantic data operations ensure automatic data validation, cleansing, and harmonization.'
    },
    {
      question: isGerman ? 'Ist das System skalierbar für große Vertriebsteams?' : 'Is the system scalable for large sales teams?',
      answer: isGerman 
        ? 'Ja, unsere holistische KI-Architektur skaliert automatisch mit der Teamgröße und Kundenvolumen.' 
        : 'Yes, our holistic AI architecture automatically scales with team size and customer volume.'
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
            {isGerman ? 'Vertrieb & Kundenservice' : 'Sales & Customer Service'}
          </span>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isGerman ? 'Vertrieb & Kundenservice' : 'Sales & Customer Service'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            {isGerman 
              ? 'Holistische KI für autonome Vertriebsprozesse mit nahtloser Interaktion zwischen CRM, Marketing und Kundenbetreuung'
              : 'Holistic AI for autonomous sales processes with seamless interaction between CRM, marketing, and customer care'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {salesStats.map((stat, index) => (
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
              {isGerman ? 'Unsere Vertriebslösungen' : 'Our Sales Solutions'}
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
              {isGerman ? 'Anwendungsfälle im Vertrieb' : 'Sales Use Cases'}
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
              {isGerman ? 'Nachgewiesene Ergebnisse' : 'Proven Results'}
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
                <span>{isGerman ? 'Verbesserte Lead-Qualität' : 'Improved lead quality'}</span>
              </div>
              <div className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-300 ml-8">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>{isGerman ? 'Autonome Kundenbetreuung' : 'Autonomous customer care'}</span>
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
                ? 'Revolutionieren Sie Ihren Vertrieb mit autonomen KI-Agenten' 
                : 'Revolutionize your sales with autonomous AI agents'}
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

export default SalesPage