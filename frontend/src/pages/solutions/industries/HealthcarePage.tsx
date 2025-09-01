import { Link } from 'react-router-dom'
import { useLanguage } from '../../../contexts/LanguageContext'
import { 
  HeartIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CheckCircleIcon,
  HomeIcon,
  ChevronRightIcon,
  UserGroupIcon,
  BeakerIcon
} from '@heroicons/react/24/outline'

const HealthcarePage = () => {
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''
  const isGerman = language === 'de'

  const healthcareStats = [
    {
      value: '$4.3T',
      label: isGerman ? 'Globaler Gesundheitsmarkt 2024' : 'Global healthcare market 2024',
      icon: HeartIcon
    },
    {
      value: '30%+',
      label: isGerman ? 'Effizienzsteigerung durch KI-Integration' : 'Efficiency gains through AI integration',
      icon: CpuChipIcon
    },
    {
      value: '70%',
      label: isGerman ? 'Reduzierte Diagnosezeit durch Datenharmonisierung' : 'Reduced diagnosis time through data harmonization',
      icon: ChartBarIcon
    }
  ]

  const useCases = [
    {
      title: isGerman ? 'Autonome Patientendatenoperationen' : 'Autonomous Patient Data Operations',
      description: isGerman 
        ? 'Zentralisierte semantische Verwaltung von Patientendaten für funktionsübergreifende klinische Einblicke' 
        : 'Centralized semantic patient data management for cross-functional clinical insights',
      icon: DocumentTextIcon
    },
    {
      title: isGerman ? 'Beschleunigte Arzneimittelforschung' : 'Accelerated Drug Discovery',
      description: isGerman 
        ? 'KI-Agenten für Genomdatenverarbeitung und Medikamentenentwicklung mit semantischer Datenintegration' 
        : 'AI agents for genomic data processing and drug development with semantic data integration',
      icon: BeakerIcon
    },
    {
      title: isGerman ? 'Intelligente klinische Entscheidungsunterstützung' : 'Intelligent Clinical Decision Support',
      description: isGerman 
        ? 'Agentic KI-Systeme für Echtzeitanalyse medizinischer Daten und Behandlungsempfehlungen' 
        : 'Agentic AI systems for real-time medical data analysis and treatment recommendations',
      icon: UserGroupIcon
    }
  ]

  const benefits = [
    {
      percentage: '40%',
      description: isGerman ? 'Reduzierte medizinische Fehler' : 'Reduced medical errors'
    },
    {
      percentage: '25%',
      description: isGerman ? 'Verkürzte Behandlungszeiten' : 'Shorter treatment times'
    }
  ]

  const solutions = [
    {
      title: isGerman ? 'Semantische EHR-Integration' : 'Semantic EHR Integration',
      description: isGerman 
        ? 'Harmonisierung elektronischer Gesundheitsakten mit zentralisierten Datenoperationen' 
        : 'Harmonizing electronic health records with centralized data operations'
    },
    {
      title: isGerman ? 'KI-Agenten für medizinische Bildanalyse' : 'AI Agents for Medical Imaging',
      description: isGerman 
        ? 'Autonome Analyse von Röntgen-, CT- und MRT-Bildern mit semantischer Datenverarbeitung' 
        : 'Autonomous analysis of X-ray, CT, and MRI images with semantic data processing'
    },
    {
      title: isGerman ? 'Skalierbare Genomdatenverarbeitung' : 'Scalable Genomic Data Processing',
      description: isGerman 
        ? 'Holistische KI für Genomdatenanalyse und personalisierte Medizin' 
        : 'Holistic AI for genomic data analysis and personalized medicine'
    },
    {
      title: isGerman ? 'Autonome Compliance-Überwachung' : 'Autonomous Compliance Monitoring',
      description: isGerman 
        ? 'KI-Agenten für HIPAA-, GDPR- und FDA-Compliance mit Echtzeitüberwachung' 
        : 'AI agents for HIPAA, GDPR, and FDA compliance with real-time monitoring'
    }
  ]

  const faqs = [
    {
      question: isGerman ? 'Wie wird die Patientenprivatsphäre geschützt?' : 'How is patient privacy protected?',
      answer: isGerman 
        ? 'Wir implementieren End-to-End-Verschlüsselung, Zugriffskontrollen und vollständige HIPAA-Compliance für alle Patientendaten.' 
        : 'We implement end-to-end encryption, access controls, and full HIPAA compliance for all patient data.'
    },
    {
      question: isGerman ? 'Welche medizinischen Datentypen können verarbeitet werden?' : 'What types of medical data can be processed?',
      answer: isGerman 
        ? 'Unsere Plattform verarbeitet EHRs, medizinische Bilder, Genomdaten, Laborbefunde und klinische Studiensdaten.' 
        : 'Our platform processes EHRs, medical images, genomic data, lab results, and clinical trial data.'
    },
    {
      question: isGerman ? 'Wie verbessert KI die Diagnosegenauigkeit?' : 'How does AI improve diagnostic accuracy?',
      answer: isGerman 
        ? 'KI-Modelle analysieren große Datenmengen und Muster, die Menschen übersehen könnten, und erhöhen so die Diagnosegenauigkeit.' 
        : 'AI models analyze vast amounts of data and patterns that humans might miss, improving diagnostic accuracy.'
    },
    {
      question: isGerman ? 'Ist die Lösung mit bestehenden Systemen kompatibel?' : 'Is the solution compatible with existing systems?',
      answer: isGerman 
        ? 'Ja, unsere APIs sind mit den meisten EHR-Systemen, PACS und anderen medizinischen Anwendungen kompatibel.' 
        : 'Yes, our APIs are compatible with most EHR systems, PACS, and other medical applications.'
    }
  ]

  const regulations = [
    {
      name: 'HIPAA',
      description: isGerman ? 'US-Patientendatenschutz' : 'US patient data protection'
    },
    {
      name: 'GDPR',
      description: isGerman ? 'EU-Datenschutzverordnung' : 'EU data protection regulation'
    },
    {
      name: 'FDA',
      description: isGerman ? 'Medizinprodukte-Compliance' : 'Medical device compliance'
    },
    {
      name: 'ISO 27001',
      description: isGerman ? 'Informationssicherheit' : 'Information security standard'
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
            {isGerman ? 'Gesundheitswesen & Biotechnologie' : 'Healthcare & Life Sciences'}
          </span>
        </nav>

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {isGerman ? 'Gesundheitswesen & Biotechnologie' : 'Healthcare & Life Sciences'}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto">
            {isGerman 
              ? 'Zentralisierte semantische Datenoperationen für autonome KI-gestützte Gesundheitssysteme, medizinische Forschungsbeschleunigung und verbesserte Patientenergebnisse'
              : 'Centralized semantic data operations for autonomous AI-driven healthcare systems, accelerated medical research, and improved patient outcomes'}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          {/* Market Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {healthcareStats.map((stat, index) => (
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
              {isGerman ? 'Unsere Gesundheitslösungen' : 'Our Healthcare Solutions'}
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
              {isGerman ? 'Anwendungsfälle im Gesundheitswesen' : 'Healthcare Use Cases'}
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
              {isGerman ? 'Nachgewiesene Vorteile' : 'Proven Benefits'}
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
                <span>{isGerman ? 'Verbesserte Patientensicherheit' : 'Enhanced patient safety'}</span>
              </div>
              <div className="inline-flex items-center space-x-2 text-gray-600 dark:text-gray-300 ml-8">
                <CheckCircleIcon className="h-5 w-5 text-green-500" />
                <span>{isGerman ? 'Beschleunigte Forschung' : 'Accelerated research'}</span>
              </div>
            </div>
          </div>

          {/* Compliance */}
          <div className="mb-12">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 text-center">
              {isGerman ? 'Regulatorische Compliance' : 'Regulatory Compliance'}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {regulations.map((regulation, index) => (
                <div key={index} className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="font-semibold text-blue-700 dark:text-blue-400 mb-2">
                    {regulation.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {regulation.description}
                  </div>
                </div>
              ))}
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
                ? 'Verbessern Sie Ihre Patientenversorgung mit KI-gestützter Datenoptimierung' 
                : 'Enhance your patient care with AI-powered data optimization'}
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

export default HealthcarePage