import React from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import SEOHead from '../../components/common/SEOHead'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'
import { 
  ShieldCheckIcon,
  LockClosedIcon,
  ServerIcon,
  CloudIcon,
  CpuChipIcon,
  GlobeAltIcon,
  DocumentCheckIcon,
  EyeSlashIcon,
  BoltIcon,
  ScaleIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  CurrencyEuroIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

const PrivateCloudPage: React.FC = () => {
  const { language, t } = useLanguage()

  const advantages = [
    {
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      title: {
        en: 'Maximum Security',
        de: 'Maximale Sicherheit'
      },
      description: {
        en: 'Dedicated infrastructure with enterprise-grade security measures, ensuring your AI applications and sensitive data remain completely isolated from external threats.',
        de: 'Dedizierte Infrastruktur mit Sicherheitsmaßnahmen auf Enterprise-Niveau, die gewährleistet, dass Ihre KI-Anwendungen und sensiblen Daten vollständig von externen Bedrohungen isoliert bleiben.'
      }
    },
    {
      icon: <LockClosedIcon className="h-8 w-8" />,
      title: {
        en: 'Data Sovereignty',
        de: 'Datenhoheit'
      },
      description: {
        en: 'Complete control over your data location and processing, ensuring compliance with GDPR, DSGVO, and other regulatory requirements while maintaining full autonomy.',
        de: 'Vollständige Kontrolle über Ihren Datenstandort und die Verarbeitung, um die Einhaltung von DSGVO, GDPR und anderen regulatorischen Anforderungen bei voller Autonomie zu gewährleisten.'
      }
    },
    {
      icon: <EyeSlashIcon className="h-8 w-8" />,
      title: {
        en: 'Privacy by Design',
        de: 'Privacy by Design'
      },
      description: {
        en: 'Built-in privacy protection for AI workloads, ensuring sensitive training data, model parameters, and business intelligence never leave your controlled environment.',
        de: 'Eingebauter Datenschutz für KI-Workloads, der sicherstellt, dass sensible Trainingsdaten, Modellparameter und Business Intelligence niemals Ihre kontrollierte Umgebung verlassen.'
      }
    },
    {
      icon: <BoltIcon className="h-8 w-8" />,
      title: {
        en: 'Optimized Performance',
        de: 'Optimierte Leistung'
      },
      description: {
        en: 'High-performance computing resources specifically optimized for AI/ML workloads with GPU acceleration, specialized hardware configurations, and ultra-low latency networking.',
        de: 'Hochleistungsrechenressourcen, die speziell für KI/ML-Workloads mit GPU-Beschleunigung, spezialisierten Hardware-Konfigurationen und Ultra-Low-Latency-Netzwerken optimiert sind.'
      }
    },
    {
      icon: <ScaleIcon className="h-8 w-8" />,
      title: {
        en: 'Elastic Scalability',
        de: 'Elastische Skalierbarkeit'
      },
      description: {
        en: 'Dynamic scaling capabilities that adapt seamlessly to your AI application demands, from development environments to production-scale deployments without service interruption.',
        de: 'Dynamische Skalierungsfähigkeiten, die sich nahtlos an Ihre KI-Anwendungsanforderungen anpassen, von Entwicklungsumgebungen bis hin zu produktionsreifen Bereitstellungen ohne Serviceunterbrechung.'
      }
    },
    {
      icon: <DocumentCheckIcon className="h-8 w-8" />,
      title: {
        en: 'Compliance Ready',
        de: 'Compliance-Ready'
      },
      description: {
        en: 'Pre-configured compliance frameworks including ISO 27001, SOC 2, BSI C5, and industry-specific standards for healthcare, finance, and government sectors ensuring regulatory readiness.',
        de: 'Vorkonfigurierte Compliance-Frameworks einschließlich ISO 27001, SOC 2, BSI C5 und branchenspezifischen Standards für Gesundheitswesen, Finanzen und Behörden für regulatorische Bereitschaft.'
      }
    }
  ]

  const aiProtectionFeatures = [
    {
      title: {
        en: 'Intellectual Property Protection',
        de: 'Schutz des geistigen Eigentums'
      },
      description: {
        en: 'AI models, algorithms, and proprietary business logic remain within your private infrastructure, preventing intellectual property exposure and unauthorized access.',
        de: 'KI-Modelle, Algorithmen und proprietäre Geschäftslogik verbleiben in Ihrer privaten Infrastruktur und verhindern die Preisgabe von geistigem Eigentum und unbefugten Zugriff.'
      }
    },
    {
      title: {
        en: 'Secure Training Data Management',
        de: 'Sichere Verwaltung von Trainingsdaten'
      },
      description: {
        en: 'Sensitive training datasets, customer data, and proprietary information never leave your controlled environment, maintaining absolute data confidentiality and integrity.',
        de: 'Sensible Trainingsdatensätze, Kundendaten und proprietäre Informationen verlassen niemals Ihre kontrollierte Umgebung und wahren absolute Datenvertraulichkeit und -integrität.'
      }
    },
    {
      title: {
        en: 'Autonomous AI Operations',
        de: 'Autonome KI-Operationen'
      },
      description: {
        en: 'Complete independence from third-party cloud providers ensures business continuity, operational autonomy, and eliminates vendor lock-in risks for critical AI systems.',
        de: 'Vollständige Unabhängigkeit von Drittanbieter-Cloud-Providern gewährleistet Geschäftskontinuität, operative Autonomie und eliminiert Vendor-Lock-in-Risiken für kritische KI-Systeme.'
      }
    },
    {
      title: {
        en: 'Regulatory Compliance Assurance',
        de: 'Sicherstellung der regulatorischen Compliance'
      },
      description: {
        en: 'Built-in compliance mechanisms ensure your AI applications meet stringent regulatory requirements without compromising performance or functionality.',
        de: 'Integrierte Compliance-Mechanismen gewährleisten, dass Ihre KI-Anwendungen strenge regulatorische Anforderungen erfüllen, ohne Leistung oder Funktionalität zu beeinträchtigen.'
      }
    }
  ]

  return (
    <>
      <SEOHead
        title={language === 'de' ? 'Private Cloud - voltAIc Systems' : 'Private Cloud - voltAIc Systems'}
        description={language === 'de' 
          ? 'Sichere Private Cloud-Lösungen für KI-Enterprise-Anwendungen. Powered by re-cloud.io mit maximaler Datensicherheit, Privacy und Compliance für autonome AI-Operationen.'
          : 'Secure private cloud solutions for AI enterprise applications. Powered by re-cloud.io with maximum data security, privacy, and compliance for autonomous AI operations.'
        }
      />

      <div className={backgrounds.page}>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <CloudIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {language === 'de' ? 'Powered by re-cloud.io' : 'Powered by re-cloud.io'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {language === 'de' ? (
                  <>Private <span className="text-blue-400">Cloud</span></>
                ) : (
                  <>Private <span className="text-blue-400">Cloud</span></>
                )}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 mb-8">
                {language === 'de' 
                  ? 'Sichere, autonome Cloud-Infrastruktur für KI-Enterprise-Anwendungen mit vollständiger Datenhoheit, Privacy-Schutz und strategischer Unabhängigkeit'
                  : 'Secure, autonomous cloud infrastructure for AI enterprise applications with complete data sovereignty, privacy protection, and strategic independence'
                }
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-400" />
                  <span className="font-medium">{language === 'de' ? 'DSGVO-Konform' : 'GDPR Compliant'}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <LockClosedIcon className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">{language === 'de' ? 'Datenhoheit' : 'Data Sovereignty'}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <CpuChipIcon className="h-5 w-5 text-purple-400" />
                  <span className="font-medium">{language === 'de' ? 'KI-Optimiert' : 'AI-Optimized'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* re-cloud.io Partnership Section */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-16">
              <div className="mb-8">
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg inline-block">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                      re-cloud.io
                    </div>
                    <ServerIcon className="h-12 w-12 text-blue-600" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {language === 'de' ? 'Europäische Private Cloud Excellence' : 'European Private Cloud Excellence'}
                  </p>
                </div>
              </div>
              
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-6`}>
                {language === 'de' ? 'Strategische Partnerschaft mit re-cloud.io' : 'Strategic Partnership with re-cloud.io'}
              </h2>
              
              <p className={`text-xl ${textColors.secondary} mb-8`}>
                {language === 'de' 
                  ? 're-cloud.io ist unser ausgewählter Partner für Private Cloud-Infrastrukturen und bietet europäische Datenschutzstandards, technische Exzellenz und vollständige Transparenz für Ihre kritischen KI-Anwendungen. Als führender europäischer Anbieter garantiert re-cloud.io höchste Sicherheitsstandards und regulatorische Compliance.'
                  : 're-cloud.io is our selected partner for private cloud infrastructures, providing European data protection standards, technical excellence, and complete transparency for your critical AI applications. As a leading European provider, re-cloud.io guarantees the highest security standards and regulatory compliance.'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Technical Advantages */}
              <div className={`${getCardClasses()} rounded-xl shadow-lg hover:shadow-xl transition-duration-300 p-8`}>
                <div className="text-center mb-6">
                  <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                    <CpuChipIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className={`text-xl font-bold ${textColors.primary} mb-2`}>
                    {language === 'de' ? 'Technische Vorteile' : 'Technical Advantages'}
                  </h3>
                </div>
                <ul className={`${textColors.secondary} space-y-3 text-sm`}>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{language === 'de' ? 'High-Performance Computing speziell für KI/ML-Workloads' : 'High-Performance Computing specifically for AI/ML workloads'}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{language === 'de' ? 'GPU-beschleunigte Rechenleistung mit NVIDIA A100/H100' : 'GPU-accelerated computing with NVIDIA A100/H100'}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{language === 'de' ? 'Elastische Auto-Skalierung ohne Serviceunterbrechung' : 'Elastic auto-scaling without service interruption'}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{language === 'de' ? 'Kubernetes-native Container-Orchestrierung' : 'Kubernetes-native container orchestration'}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{language === 'de' ? 'Edge-Computing-Integration für verteilte KI' : 'Edge computing integration for distributed AI'}</span>
                  </li>
                </ul>
              </div>

              {/* Commercial Advantages */}
              <div className={`${getCardClasses()} rounded-xl shadow-lg hover:shadow-xl transition-duration-300 p-8`}>
                <div className="text-center mb-6">
                  <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                    <CurrencyEuroIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <h3 className={`text-xl font-bold ${textColors.primary} mb-2`}>
                    {language === 'de' ? 'Kommerzielle Vorteile' : 'Commercial Advantages'}
                  </h3>
                </div>
                <ul className={`${textColors.secondary} space-y-3 text-sm`}>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{language === 'de' ? 'Transparente Preisgestaltung ohne versteckte Kosten' : 'Transparent pricing without hidden costs'}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{language === 'de' ? 'Pay-as-you-scale Modell mit Kostenkontrolle' : 'Pay-as-you-scale model with cost control'}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{language === 'de' ? 'Kein Vendor Lock-in - vollständige Portabilität' : 'No vendor lock-in - complete portability'}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{language === 'de' ? '24/7 Premium Support mit deutschen Ingenieuren' : '24/7 premium support with German engineers'}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{language === 'de' ? 'SLA-Garantien bis 99.99% Verfügbarkeit' : 'SLA guarantees up to 99.99% availability'}</span>
                  </li>
                </ul>
              </div>

              {/* Legal/Privacy Advantages */}
              <div className={`${getCardClasses()} rounded-xl shadow-lg hover:shadow-xl transition-duration-300 p-8`}>
                <div className="text-center mb-6">
                  <div className="bg-purple-100 dark:bg-purple-900 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                    <DocumentCheckIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className={`text-xl font-bold ${textColors.primary} mb-2`}>
                    {language === 'de' ? 'Rechtliche & Privacy-Vorteile' : 'Legal & Privacy Advantages'}
                  </h3>
                </div>
                <ul className={`${textColors.secondary} space-y-3 text-sm`}>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{language === 'de' ? 'Ausschließlich EU-basierte Rechenzentren' : 'Exclusively EU-based data centers'}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{language === 'de' ? 'DSGVO-konforme Architektur by Design' : 'GDPR-compliant architecture by design'}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{language === 'de' ? 'ISO 27001, SOC 2, BSI C5 zertifiziert' : 'ISO 27001, SOC 2, BSI C5 certified'}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{language === 'de' ? 'Zero-Knowledge-Prinzip für maximale Privacy' : 'Zero-knowledge principle for maximum privacy'}</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <CheckCircleIcon className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{language === 'de' ? 'Vollständige Datenresidenz in Deutschland' : 'Complete data residency in Germany'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* AI Protection Section */}
        <section className={getSectionClasses()}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-6`}>
                {language === 'de' ? 'Maximaler Schutz für KI-Enterprise-Anwendungen' : 'Maximum Protection for AI Enterprise Applications'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'KI-gesteuerte Unternehmensanwendungen erhalten in unserer Private Cloud-Umgebung maximalen Schutz, absolute Privacy und strategische Autonomie von externen Anbietern'
                  : 'AI-driven enterprise applications receive maximum protection, absolute privacy, and strategic autonomy from external providers in our private cloud environment'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {aiProtectionFeatures.map((feature, index) => (
                <div key={index} className={`${getCardClasses()} rounded-xl shadow-lg p-8`}>
                  <h3 className={`text-xl font-bold ${textColors.primary} mb-4`}>
                    {feature.title[language]}
                  </h3>
                  <p className={`${textColors.secondary} leading-relaxed`}>
                    {feature.description[language]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Key Advantages Grid */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Warum Private Cloud für KI-Anwendungen?' : 'Why Private Cloud for AI Applications?'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Sechs entscheidende Vorteile, die Ihre KI-Strategie transformieren und nachhaltigen Wettbewerbsvorteil schaffen'
                  : 'Six decisive advantages that transform your AI strategy and create sustainable competitive advantage'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {advantages.map((advantage, index) => (
                <div key={index} className={`${getCardClasses()} rounded-xl shadow-lg hover:shadow-xl duration-300 p-6`}>
                  <div className={`text-blue-600 dark:text-blue-400 mb-4`}>
                    {advantage.icon}
                  </div>
                  <h3 className={`text-lg font-bold ${textColors.primary} mb-3`}>
                    {advantage.title[language]}
                  </h3>
                  <p className={`${textColors.secondary} text-sm leading-relaxed`}>
                    {advantage.description[language]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">
              {language === 'de' ? 'Bereit für Ihre sichere Private Cloud?' : 'Ready for Your Secure Private Cloud?'}
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              {language === 'de' 
                ? 'Erfahren Sie, wie eine private Cloud-Infrastruktur von re-cloud.io Ihre KI-Anwendungen schützt und Ihr Unternehmen strategisch autonomer macht.'
                : 'Discover how private cloud infrastructure from re-cloud.io protects your AI applications and makes your business strategically more autonomous.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 font-bold py-4 px-8 rounded-lg hover:bg-blue-50 transition duration-300 shadow-lg">
                {language === 'de' ? 'Kostenlose Expertenberatung' : 'Free Expert Consultation'}
              </button>
              <button className="border-2 border-white text-white font-bold py-4 px-8 rounded-lg hover:bg-white hover:text-blue-600 transition duration-300">
                {language === 'de' ? 'Architektur & Preise' : 'Architecture & Pricing'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default PrivateCloudPage