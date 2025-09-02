import React from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import SEOHead from '../../components/common/SEOHead'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'
import {
  CogIcon,
  RocketLaunchIcon,
  ClockIcon,
  ChartBarIcon,
  BoltIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  CpuChipIcon,
  CloudIcon,
  UserGroupIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'

const AutomationPage = () => {
  const { language } = useLanguage()

  const automationSolutions = [
    {
      icon: <CogIcon className="h-8 w-8" />,
      title: {
        en: 'Robotic Process Automation (RPA)',
        de: 'Robotic Process Automation (RPA)'
      },
      description: {
        en: 'Automate repetitive, rule-based tasks with software robots that mimic human actions, reducing errors and freeing up valuable human resources for strategic work.',
        de: 'Automatisieren Sie sich wiederholende, regelbasierte Aufgaben mit Software-Robotern, die menschliche Aktionen nachahmen, Fehler reduzieren und wertvolle menschliche Ressourcen für strategische Arbeit freisetzen.'
      },
      capabilities: {
        en: ['Data Entry Automation', 'Report Generation', 'Email Processing', 'System Integration', 'Quality Assurance'],
        de: ['Dateneingabe-Automatisierung', 'Berichtserstellung', 'E-Mail-Verarbeitung', 'Systemintegration', 'Qualitätssicherung']
      }
    },
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: {
        en: 'Intelligent Process Automation (IPA)',
        de: 'Intelligente Prozessautomatisierung (IPA)'
      },
      description: {
        en: 'Combine RPA with AI technologies like machine learning and natural language processing to handle complex, cognitive tasks and make intelligent decisions.',
        de: 'Kombinieren Sie RPA mit KI-Technologien wie Machine Learning und natürlicher Sprachverarbeitung, um komplexe, kognitive Aufgaben zu bearbeiten und intelligente Entscheidungen zu treffen.'
      },
      capabilities: {
        en: ['Document Processing', 'Sentiment Analysis', 'Predictive Analytics', 'Decision Automation', 'Exception Handling'],
        de: ['Dokumentenverarbeitung', 'Sentimentanalyse', 'Predictive Analytics', 'Entscheidungsautomatisierung', 'Ausnahmebehandlung']
      }
    },
    {
      icon: <ArrowPathIcon className="h-8 w-8" />,
      title: {
        en: 'Workflow Optimization',
        de: 'Workflow-Optimierung'
      },
      description: {
        en: 'Analyze, redesign, and optimize business workflows to eliminate bottlenecks, reduce processing time, and improve overall operational efficiency.',
        de: 'Analysieren, redesignen und optimieren Sie Geschäftsworkflows, um Engpässe zu beseitigen, Bearbeitungszeiten zu reduzieren und die operative Effizienz zu verbessern.'
      },
      capabilities: {
        en: ['Process Mapping', 'Bottleneck Analysis', 'Performance Optimization', 'Resource Allocation', 'Continuous Improvement'],
        de: ['Prozess-Mapping', 'Engpass-Analyse', 'Performance-Optimierung', 'Ressourcenverteilung', 'Kontinuierliche Verbesserung']
      }
    },
    {
      icon: <CloudIcon className="h-8 w-8" />,
      title: {
        en: 'Cloud-Native Automation',
        de: 'Cloud-Native Automatisierung'
      },
      description: {
        en: 'Deploy scalable automation solutions in the cloud with containerized architectures, ensuring high availability and seamless integration across systems.',
        de: 'Implementieren Sie skalierbare Automatisierungslösungen in der Cloud mit containerisierten Architekturen für hohe Verfügbarkeit und nahtlose Systemintegration.'
      },
      capabilities: {
        en: ['Microservices Architecture', 'Auto-Scaling', 'Load Balancing', 'Multi-Cloud Support', 'DevOps Integration'],
        de: ['Microservices-Architektur', 'Auto-Scaling', 'Load Balancing', 'Multi-Cloud-Unterstützung', 'DevOps-Integration']
      }
    }
  ]

  const implementationSteps = [
    {
      number: 1,
      icon: <DocumentTextIcon className="h-6 w-6" />,
      title: {
        en: 'Process Discovery & Assessment',
        de: 'Prozessentdeckung & Bewertung'
      },
      description: {
        en: 'Comprehensive analysis of existing processes to identify automation opportunities and calculate potential ROI.',
        de: 'Umfassende Analyse bestehender Prozesse zur Identifikation von Automatisierungsmöglichkeiten und ROI-Berechnung.'
      }
    },
    {
      number: 2,
      icon: <CpuChipIcon className="h-6 w-6" />,
      title: {
        en: 'Solution Design & Architecture',
        de: 'Lösungsdesign & Architektur'
      },
      description: {
        en: 'Design scalable automation architecture with appropriate technology stack selection and integration planning.',
        de: 'Entwurf skalierbarer Automatisierungsarchitektur mit geeigneter Technologie-Stack-Auswahl und Integrationsplanung.'
      }
    },
    {
      number: 3,
      icon: <BoltIcon className="h-6 w-6" />,
      title: {
        en: 'Development & Testing',
        de: 'Entwicklung & Testing'
      },
      description: {
        en: 'Agile development with continuous testing, validation, and optimization of automation components.',
        de: 'Agile Entwicklung mit kontinuierlichem Testing, Validierung und Optimierung der Automatisierungskomponenten.'
      }
    },
    {
      number: 4,
      icon: <RocketLaunchIcon className="h-6 w-6" />,
      title: {
        en: 'Deployment & Go-Live',
        de: 'Deployment & Go-Live'
      },
      description: {
        en: 'Controlled rollout with monitoring, support, and immediate optimization based on real-world performance.',
        de: 'Kontrollierte Einführung mit Überwachung, Support und sofortiger Optimierung basierend auf realer Performance.'
      }
    }
  ]

  const benefits = [
    {
      icon: <ClockIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />,
      metric: '75%',
      title: {
        en: 'Time Savings',
        de: 'Zeitersparnis'
      },
      description: {
        en: 'Reduce processing time for routine tasks',
        de: 'Reduzierung der Bearbeitungszeit für Routineaufgaben'
      }
    },
    {
      icon: <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />,
      metric: '99%',
      title: {
        en: 'Accuracy Rate',
        de: 'Genauigkeitsrate'
      },
      description: {
        en: 'Eliminate human errors in repetitive processes',
        de: 'Eliminierung menschlicher Fehler in sich wiederholenden Prozessen'
      }
    },
    {
      icon: <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />,
      metric: '300%',
      title: {
        en: 'ROI Increase',
        de: 'ROI-Steigerung'
      },
      description: {
        en: 'Average return on investment within 12 months',
        de: 'Durchschnittlicher ROI innerhalb von 12 Monaten'
      }
    },
    {
      icon: <UserGroupIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />,
      metric: '24/7',
      title: {
        en: 'Availability',
        de: 'Verfügbarkeit'
      },
      description: {
        en: 'Continuous operation without breaks or downtime',
        de: 'Kontinuierlicher Betrieb ohne Pausen oder Ausfallzeiten'
      }
    }
  ]

  const useCases = [
    {
      industry: {
        en: 'Financial Services',
        de: 'Finanzdienstleistungen'
      },
      applications: {
        en: ['Loan Processing', 'Compliance Reporting', 'Customer Onboarding', 'Risk Assessment'],
        de: ['Kreditbearbeitung', 'Compliance-Berichterstattung', 'Kundenonboarding', 'Risikobewertung']
      }
    },
    {
      industry: {
        en: 'Healthcare',
        de: 'Gesundheitswesen'
      },
      applications: {
        en: ['Patient Data Management', 'Claims Processing', 'Appointment Scheduling', 'Billing Automation'],
        de: ['Patientendatenmanagement', 'Anspruchsbearbeitung', 'Terminplanung', 'Abrechnungsautomatisierung']
      }
    },
    {
      industry: {
        en: 'Manufacturing',
        de: 'Fertigung'
      },
      applications: {
        en: ['Inventory Management', 'Quality Control', 'Supply Chain Optimization', 'Production Planning'],
        de: ['Lagerverwaltung', 'Qualitätskontrolle', 'Lieferkettenoptimierung', 'Produktionsplanung']
      }
    }
  ]

  return (
    <>
      <SEOHead
        title={language === 'de' ? 'Automatisierungslösungen - voltAIc Systems' : 'Automation Solutions - voltAIc Systems'}
        description={language === 'de' 
          ? 'Intelligente Prozessautomatisierung mit RPA, Workflow-Optimierung und KI-gesteuerter Automatisierung für maximale Effizienz.'
          : 'Intelligent process automation with RPA, workflow optimization, and AI-driven automation for maximum efficiency.'
        }
      />

      <div className={backgrounds.page}>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-green-900 via-blue-900 to-purple-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <CogIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {language === 'de' ? 'Intelligente Automatisierung' : 'Intelligent Automation'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {language === 'de' ? (
                  <>Automatisierungs<span className="text-green-400">lösungen</span></>
                ) : (
                  <>Automation <span className="text-green-400">Solutions</span></>
                )}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 mb-8">
                {language === 'de' 
                  ? 'Steigern Sie Effizienz und Produktivität durch intelligente Prozessautomatisierung und KI-gesteuerte Workflows'
                  : 'Boost efficiency and productivity through intelligent process automation and AI-driven workflows'
                }
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <BoltIcon className="h-5 w-5 text-green-400" />
                  <span className="font-medium">{language === 'de' ? 'RPA & IPA' : 'RPA & IPA'}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <ChartBarIcon className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">{language === 'de' ? '75% Zeitersparnis' : '75% Time Savings'}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <ShieldCheckIcon className="h-5 w-5 text-purple-400" />
                  <span className="font-medium">{language === 'de' ? '99% Genauigkeit' : '99% Accuracy'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Automation Solutions Section */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Unsere Automatisierungslösungen' : 'Our Automation Solutions'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Von einfacher Robotics Process Automation bis zu intelligenten, KI-gesteuerten Systemen'
                  : 'From simple Robotic Process Automation to intelligent, AI-driven systems'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {automationSolutions.map((solution, index) => (
                <div key={index} className={`${getCardClasses()} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700`}>
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="flex-shrink-0 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-green-600 dark:text-green-400">
                      {solution.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${textColors.primary} mb-3`}>
                        {solution.title[language]}
                      </h3>
                      <p className={`${textColors.secondary} leading-relaxed mb-4`}>
                        {solution.description[language]}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={`font-semibold ${textColors.primary} mb-3 text-sm uppercase tracking-wide`}>
                      {language === 'de' ? 'Kernfähigkeiten:' : 'Core Capabilities:'}
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {solution.capabilities[language].map((capability, capIndex) => (
                        <div key={capIndex} className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{capability}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Implementation Process */}
        <section className={getSectionClasses()}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Unser Implementierungsprozess' : 'Our Implementation Process'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Strukturierter Ansatz für erfolgreiche Automatisierungsprojekte mit messbaren Ergebnissen'
                  : 'Structured approach for successful automation projects with measurable results'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {implementationSteps.map((step, index) => (
                <div key={step.number} className={`${getCardClasses()} text-center rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                    {step.number}
                  </div>
                  <div className="mb-4 text-blue-600 dark:text-blue-400 flex justify-center">
                    {step.icon}
                  </div>
                  <h3 className={`text-lg font-bold ${textColors.primary} mb-3`}>
                    {step.title[language]}
                  </h3>
                  <p className={`${textColors.secondary} text-sm leading-relaxed`}>
                    {step.description[language]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits & ROI Section */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Messbare Vorteile & ROI' : 'Measurable Benefits & ROI'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Konkrete Verbesserungen und nachweisbare Erfolge durch intelligente Automatisierung'
                  : 'Concrete improvements and proven success through intelligent automation'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div key={index} className={`${getCardClasses()} text-center rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                  <div className="mb-4 flex justify-center">
                    {benefit.icon}
                  </div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">{benefit.metric}</div>
                  <h3 className={`text-lg font-bold ${textColors.primary} mb-2`}>
                    {benefit.title[language]}
                  </h3>
                  <p className={`${textColors.secondary} text-sm`}>
                    {benefit.description[language]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Use Cases Section */}
        <section className={getSectionClasses()}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Branchenspezifische Anwendungsfälle' : 'Industry-Specific Use Cases'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Automatisierungslösungen, die auf die spezifischen Anforderungen Ihrer Branche zugeschnitten sind'
                  : 'Automation solutions tailored to your industry\'s specific requirements'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {useCases.map((useCase, index) => (
                <div key={index} className={`${getCardClasses()} rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                  <h3 className={`text-xl font-bold ${textColors.primary} mb-4`}>
                    {useCase.industry[language]}
                  </h3>
                  <div className="space-y-2">
                    {useCase.applications[language].map((app, appIndex) => (
                      <div key={appIndex} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
                        <span className={`text-sm ${textColors.secondary}`}>{app}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {language === 'de' ? 'Bereit für intelligente Automatisierung?' : 'Ready for Intelligent Automation?'}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {language === 'de' 
                ? 'Lassen Sie uns gemeinsam Ihre Prozesse analysieren und die optimalen Automatisierungslösungen für Ihr Unternehmen entwickeln.'
                : 'Let us analyze your processes together and develop optimal automation solutions for your business.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact/booking" 
                className="inline-flex items-center px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {language === 'de' ? 'Automatisierungs-Beratung' : 'Automation Consultation'}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </a>
              <a 
                href="/contact" 
                className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-green-600 transition-colors duration-200"
              >
                {language === 'de' ? 'Mehr erfahren' : 'Learn More'}
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default AutomationPage