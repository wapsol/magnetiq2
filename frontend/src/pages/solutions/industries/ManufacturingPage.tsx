import { Link } from 'react-router-dom'
import { useLanguage } from '../../../contexts/LanguageContext'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../../utils/styling'
import { 
  CogIcon,
  TruckIcon,
  WrenchScrewdriverIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  HomeIcon,
  ChevronRightIcon,
  CircleStackIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'

const ManufacturingPage = () => {
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''
  const isGerman = language === 'de'

  const manufacturingStats = [
    {
      value: '$12T',
      label: isGerman ? 'Globaler Fertigungsmarkt 2024' : 'Global manufacturing market 2024',
      icon: CogIcon
    },
    {
      value: '25%+',
      label: isGerman ? 'Effizienzsteigerung durch holistische KI-Integration' : 'Efficiency improvement through holistic AI integration',
      icon: ChartBarIcon
    },
    {
      value: '60%',
      label: isGerman ? 'Reduzierte Ausfallzeiten durch autonome Überwachung' : 'Reduced downtime through autonomous monitoring',
      icon: ClockIcon
    }
  ]

  const useCases = [
    {
      title: isGerman ? 'Autonome vorausschauende Wartung' : 'Autonomous Predictive Maintenance',
      description: isGerman 
        ? 'KI-Agenten harmonisieren IoT-Sensordaten für funktionsübergreifende Wartungseinblicke und Ausfallvorhersagen' 
        : 'AI agents harmonize IoT sensor data for cross-functional maintenance insights and failure predictions',
      icon: WrenchScrewdriverIcon
    },
    {
      title: isGerman ? 'Semantische Lieferkettenoptimierung' : 'Semantic Supply Chain Optimization',
      description: isGerman 
        ? 'Zentralisierte Datenoperationen für nahtlose Interaktion zwischen Lieferanten, Produktion und Logistik' 
        : 'Centralized data operations for seamless interaction between suppliers, production, and logistics',
      icon: TruckIcon
    },
    {
      title: isGerman ? 'Intelligente Qualitätssicherung' : 'Intelligent Quality Assurance',
      description: isGerman 
        ? 'Holistische KI für Computer Vision, Datenvalidierung und automatisierte Qualitätskontrolle' 
        : 'Holistic AI for computer vision, data validation, and automated quality control',
      icon: ShieldCheckIcon
    }
  ]

  const benefits = [
    {
      percentage: '30%',
      description: isGerman ? 'Reduzierte Produktionskosten' : 'Reduced production costs'
    },
    {
      percentage: '45%',
      description: isGerman ? 'Weniger ungeplante Ausfälle' : 'Fewer unplanned downtimes'
    }
  ]

  const solutions = [
    {
      title: isGerman ? 'Semantische IoT-Datenintegration' : 'Semantic IoT Data Integration',
      description: isGerman 
        ? 'Autonome Harmonisierung von Maschinendaten mit zentralisiertem semantischen Datenoperationssystem' 
        : 'Autonomous harmonization of machine data with centralized semantic data operating system'
    },
    {
      title: isGerman ? 'KI-Agenten für Produktionsoptimierung' : 'AI Agents for Production Optimization',
      description: isGerman 
        ? 'Skalierbare KI-Agenten für funktionsübergreifende Produktionsanalyse und -optimierung' 
        : 'Scalable AI agents for cross-functional production analysis and optimization'
    },
    {
      title: isGerman ? 'Intelligente Bestandsoptimierung' : 'Intelligent Inventory Optimization',
      description: isGerman 
        ? 'Holistische KI für Nachfrageprognose, Bestandsmanagement und Lieferkettenharmonisierung' 
        : 'Holistic AI for demand forecasting, inventory management, and supply chain harmonization'
    },
    {
      title: isGerman ? 'Semantischer Digitaler Zwilling' : 'Semantic Digital Twin',
      description: isGerman 
        ? 'Zentrale Datenoperationen für virtuelle Modellierung, Simulation und Echtzeit-Optimierung' 
        : 'Central data operations for virtual modeling, simulation, and real-time optimization'
    }
  ]

  const faqs = [
    {
      question: isGerman ? 'Wie wird die Integration in bestehende Systeme durchgeführt?' : 'How is integration with existing systems performed?',
      answer: isGerman 
        ? 'Unsere Lösung verwendet standardisierte APIs und Protokolle wie OPC-UA, MQTT und REST für nahtlose Integration.' 
        : 'Our solution uses standardized APIs and protocols like OPC-UA, MQTT, and REST for seamless integration.'
    },
    {
      question: isGerman ? 'Welche Art von Produktionsdaten können analysiert werden?' : 'What types of production data can be analyzed?',
      answer: isGerman 
        ? 'Wir verarbeiten Maschinendaten, Sensordaten, Qualitätsdaten, Produktionspläne und Wartungsprotokolle.' 
        : 'We process machine data, sensor data, quality data, production schedules, and maintenance logs.'
    },
    {
      question: isGerman ? 'Wie genau sind die Vorhersagen für die Wartung?' : 'How accurate are the maintenance predictions?',
      answer: isGerman 
        ? 'Unsere KI-Modelle erreichen eine Vorhersagegenauigkeit von über 90% bei kritischen Maschinenkomponenten.' 
        : 'Our AI models achieve prediction accuracy of over 90% for critical machine components.'
    },
    {
      question: isGerman ? 'Ist die Lösung skalierbar für große Fabriken?' : 'Is the solution scalable for large factories?',
      answer: isGerman 
        ? 'Ja, unsere Cloud-native Architektur skaliert automatisch mit der Anzahl der angeschlossenen Maschinen und Standorte.' 
        : 'Yes, our cloud-native architecture automatically scales with the number of connected machines and locations.'
    }
  ]

  return (
    <div className={`min-h-screen ${backgrounds.pageAlt}`}>
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
            {isGerman ? 'Fertigung & Lieferkette' : 'Manufacturing & Supply Chain'}
          </span>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isGerman ? 'Fertigung & Lieferkette' : 'Manufacturing & Supply Chain'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            {isGerman 
              ? 'Skalierbare, holistische KI für Fertigungsoptimierung mit autonomer Datenharmonisierung entlang der gesamten Wertschöpfungskette'
              : 'Scalable, holistic AI for manufacturing optimization with autonomous data harmonization across the entire value chain'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {manufacturingStats.map((stat, index) => (
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
              {isGerman ? 'Unsere Fertigungslösungen' : 'Our Manufacturing Solutions'}
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
              {isGerman ? 'Anwendungsfälle in der Fertigung' : 'Manufacturing Use Cases'}
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
              {isGerman ? 'Messbare Ergebnisse' : 'Measurable Results'}
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
                <span>{isGerman ? 'Verbesserte Produktqualität' : 'Improved product quality'}</span>
              </div>
              <div className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-300 ml-8">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>{isGerman ? 'Optimierte Lieferkette' : 'Optimized supply chain'}</span>
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
                ? 'Revolutionieren Sie Ihre Produktion mit Smart Manufacturing' 
                : 'Revolutionize your production with smart manufacturing'}
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

export default ManufacturingPage