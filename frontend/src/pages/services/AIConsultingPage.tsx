import React from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import SEOHead from '../../components/common/SEOHead'
import { 
  ChartBarIcon,
  CogIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  BoltIcon,
  ClockIcon,
  CheckIcon,
  ArrowRightIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  ComputerDesktopIcon,
  DocumentTextIcon,
  LightBulbIcon,
  RocketLaunchIcon
} from '@heroicons/react/24/outline'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'

const AIConsultingPage: React.FC = () => {
  const { language, t } = useLanguage()

  const roadmapStages = [
    {
      number: 1,
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: {
        en: 'Analysis & Orientation',
        de: 'Analyse & Orientierung'
      },
      description: {
        en: 'Vision and strategy development, technology motivation assessment, digitalization structure analysis, and change management approach definition.',
        de: 'Vision und Strategieentwicklung, Bewertung der Technologie-Motivation, Analyse der Digitalisierungsstruktur und Definition des Change-Management-Ansatzes.'
      },
      items: {
        en: ['Vision & Strategy', 'Technology Assessment', 'Data Structure Analysis', 'Change Management', 'Current Status & Potential'],
        de: ['Vision & Strategie', 'Technologiebewertung', 'Datenstruktur-Analyse', 'Change Management', 'Status Quo & Potenzial']
      }
    },
    {
      number: 2,
      icon: <LightBulbIcon className="h-8 w-8" />,
      title: {
        en: 'Possibilities & Goals',
        de: 'Möglichkeiten & Ziele'
      },
      description: {
        en: 'AI trends analysis, organizational workflow optimization, IT-business goal alignment, and comprehensive use case definition.',
        de: 'AI-Trend-Analyse, Optimierung der Organisationsabläufe, Ausrichtung von IT- und Geschäftszielen und umfassende Use-Case-Definition.'
      },
      items: {
        en: ['AI Trends Analysis', 'Workflow Optimization', 'Goal Alignment', 'Competency Allocation', 'Use Case Definition'],
        de: ['AI-Trend-Analyse', 'Workflow-Optimierung', 'Zielausrichtung', 'Kompetenzverteilung', 'Use-Case-Definition']
      }
    },
    {
      number: 3,
      icon: <CogIcon className="h-8 w-8" />,
      title: {
        en: 'Technology & Architecture',
        de: 'Technologie & Architektur'
      },
      description: {
        en: 'Technology and tool selection, target architecture design, project management approach, milestone tracking, and data migration strategy.',
        de: 'Technologie- und Tool-Auswahl, Zielarchitektur-Design, Projektmanagement-Ansatz, Meilenstein-Tracking und Datenmigrationsstrategie.'
      },
      items: {
        en: ['Technology Selection', 'Architecture Design', 'Project Management', 'Milestone Tracking', 'Migration Strategy'],
        de: ['Technologieauswahl', 'Architektur-Design', 'Projektmanagement', 'Meilenstein-Tracking', 'Migrationsstrategie']
      }
    },
    {
      number: 4,
      icon: <RocketLaunchIcon className="h-8 w-8" />,
      title: {
        en: 'Rollout & Piloting',
        de: 'Rollout & Pilotierung'
      },
      description: {
        en: 'Pilot project realization, stakeholder engagement, comprehensive training programs, experience exchange, and data consolidation.',
        de: 'Pilotprojekt-Umsetzung, Stakeholder-Engagement, umfassende Schulungsprogramme, Erfahrungsaustausch und Datenkonsolidierung.'
      },
      items: {
        en: ['Pilot Implementation', 'Stakeholder Engagement', 'Training Programs', 'Knowledge Exchange', 'Data Consolidation'],
        de: ['Pilot-Implementierung', 'Stakeholder-Engagement', 'Schulungsprogramme', 'Wissensaustausch', 'Datenkonsolidierung']
      }
    },
    {
      number: 5,
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      title: {
        en: 'Evaluation & Scaling',
        de: 'Evaluierung & Skalierung'
      },
      description: {
        en: 'Comprehensive testing and verification, security implementation, best practices establishment, and organizational technology integration.',
        de: 'Umfassende Tests und Verifikation, Sicherheitsimplementierung, Etablierung von Best Practices und organisatorische Technologieintegration.'
      },
      items: {
        en: ['Testing & Verification', 'Security Implementation', 'Best Practices', 'Technology Integration', 'Performance Optimization'],
        de: ['Tests & Verifikation', 'Sicherheitsimplementierung', 'Best Practices', 'Technologieintegration', 'Performance-Optimierung']
      }
    },
    {
      number: 6,
      icon: <BuildingOfficeIcon className="h-8 w-8" />,
      title: {
        en: 'Operation & Optimization',
        de: 'Betrieb & Optimierung'
      },
      description: {
        en: 'Full technology integration, ongoing application support, system stabilization, continuous training, and collaborative optimization forums.',
        de: 'Vollständige Technologieintegration, laufender Anwendungssupport, Systemstabilisierung, kontinuierliche Schulungen und kollaborative Optimierungsforen.'
      },
      items: {
        en: ['Technology Integration', 'Application Support', 'System Stabilization', 'Ongoing Training', 'Optimization Forums'],
        de: ['Technologieintegration', 'Anwendungssupport', 'Systemstabilisierung', 'Laufende Schulungen', 'Optimierungsforen']
      }
    }
  ]

  const trainingPrograms = [
    {
      icon: <ComputerDesktopIcon className="h-8 w-8" />,
      title: {
        en: 'AI from IT Perspective',
        de: 'KI aus IT-Perspektive'
      },
      duration: {
        en: '8-hour technical training',
        de: '8-stündige technische Schulung'
      },
      description: {
        en: 'Comprehensive technical training covering AI models, enterprise integration, and machine learning implementation for IT professionals.',
        de: 'Umfassende technische Schulung zu KI-Modellen, Unternehmensintegration und Machine-Learning-Implementierung für IT-Fachkräfte.'
      },
      modules: {
        en: [
          'AI Models & Architecture', 
          'Enterprise Software Integration', 
          'Data & Vector Databases', 
          'Generative AI & LLMs', 
          'Machine Learning Principles',
          'Semantic Data Processing',
          'Data Pipeline Optimization',
          'Graph-based Structures',
          'Agentic Software',
          'Model Fine-tuning',
          'RAG & RAFT Processes'
        ],
        de: [
          'KI-Modelle & Architektur', 
          'Unternehmenssoftware-Integration', 
          'Daten & Vektordatenbanken', 
          'Generative KI & LLMs', 
          'Machine-Learning-Prinzipien',
          'Semantische Datenverarbeitung',
          'Datenpipeline-Optimierung',
          'Graph-basierte Strukturen',
          'Agentic Software',
          'Model Fine-tuning',
          'RAG & RAFT Prozesse'
        ]
      }
    },
    {
      icon: <UserGroupIcon className="h-8 w-8" />,
      title: {
        en: 'AI from Business Perspective',
        de: 'KI aus Geschäfts-Perspektive'
      },
      duration: {
        en: 'Customized program length',
        de: 'Individuell angepasste Programmlänge'
      },
      description: {
        en: 'Strategic AI training for business leaders and employees, focusing on integration, legal implications, and practical applications.',
        de: 'Strategische KI-Schulung für Führungskräfte und Mitarbeiter mit Fokus auf Integration, rechtliche Aspekte und praktische Anwendungen.'
      },
      modules: {
        en: [
          'AI General Overview',
          'AI Market Trends',
          'Enterprise AI Integration',
          'In-House AI Development',
          'Data & AI Management',
          'Legal AI Implications',
          'AI Security',
          'Financial AI Analysis',
          'AI Ethics',
          'Practical Case Studies'
        ],
        de: [
          'KI Allgemeiner Überblick',
          'KI-Markttrends',
          'Unternehmens-KI-Integration',
          'Interne KI-Entwicklung',
          'Daten- & KI-Management',
          'Rechtliche KI-Aspekte',
          'KI-Sicherheit',
          'Finanzielle KI-Analyse',
          'KI-Ethik',
          'Praktische Fallstudien'
        ]
      }
    }
  ]

  const technicalCapabilities = [
    {
      icon: <ComputerDesktopIcon className="h-6 w-6" />,
      title: {
        en: 'Container-Based Architecture',
        de: 'Container-basierte Architektur'
      },
      description: {
        en: 'Docker-based microservices deployment with scalable infrastructure',
        de: 'Docker-basierte Microservices-Bereitstellung mit skalierbarer Infrastruktur'
      }
    },
    {
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      title: {
        en: 'Private Cloud Optimization',
        de: 'Private Cloud Optimierung'
      },
      description: {
        en: 'S3-compatible object storage with MinIO and secure data handling',
        de: 'S3-kompatible Objektspeicherung mit MinIO und sichere Datenverarbeitung'
      }
    },
    {
      icon: <CogIcon className="h-6 w-6" />,
      title: {
        en: 'AI-Driven Automation',
        de: 'KI-gesteuerte Automatisierung'
      },
      description: {
        en: 'Process automation with intelligent workflow optimization',
        de: 'Prozessautomatisierung mit intelligenter Workflow-Optimierung'
      }
    },
    {
      icon: <DocumentTextIcon className="h-6 w-6" />,
      title: {
        en: 'Multi-Language Support',
        de: 'Multi-Sprachen-Unterstützung'
      },
      description: {
        en: 'Python and JavaScript implementation with comprehensive SDKs',
        de: 'Python- und JavaScript-Implementierung mit umfassenden SDKs'
      }
    }
  ]

  const keyPrinciples = [
    {
      title: {
        en: 'Vendor-Neutral Approach',
        de: 'Herstellerneutraler Ansatz'
      },
      description: {
        en: '100% customized solutions independent of specific technology vendors, ensuring optimal technology selection for your needs.',
        de: '100% maßgeschneiderte Lösungen unabhängig von spezifischen Technologieanbietern, um die optimale Technologieauswahl für Ihre Bedürfnisse zu gewährleisten.'
      }
    },
    {
      title: {
        en: 'Holistic Integration',
        de: 'Ganzheitliche Integration'
      },
      description: {
        en: 'Comprehensive approach covering technological, organizational, and interpersonal aspects of AI transformation.',
        de: 'Umfassender Ansatz, der technologische, organisatorische und zwischenmenschliche Aspekte der KI-Transformation abdeckt.'
      }
    },
    {
      title: {
        en: 'Practical Experience',
        de: 'Praktische Erfahrung'
      },
      description: {
        en: 'Led by experts with 15+ years of experience in AI implementation and digital transformation projects.',
        de: 'Geleitet von Experten mit über 15 Jahren Erfahrung in KI-Implementierung und digitalen Transformationsprojekten.'
      }
    }
  ]

  return (
    <>
      <SEOHead
        title={language === 'de' ? 'KI-Beratung - voltAIc Systems' : 'AI Consulting - voltAIc Systems'}
        description={language === 'de' 
          ? 'Strategische KI-Beratung und -Implementierung mit bewährten 6-Stufen-Roadmap. Umfassende Schulungen für IT und Business Teams.'
          : 'Strategic AI consulting and implementation with proven 6-stage roadmap. Comprehensive training for IT and business teams.'
        }
      />

      <div className={backgrounds.page}>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <BoltIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {language === 'de' ? 'Strategische KI-Transformation' : 'Strategic AI Transformation'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {language === 'de' ? (
                  <>KI <span className="text-blue-400">Beratung</span></>
                ) : (
                  <>AI <span className="text-blue-400">Consulting</span></>
                )}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 mb-8">
                {language === 'de' 
                  ? 'Strategische KI-Implementierung mit bewährter 6-Stufen-Roadmap für nachhaltige digitale Transformation'
                  : 'Strategic AI implementation with proven 6-stage roadmap for sustainable digital transformation'
                }
              </p>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 mb-8">
                <p className="text-lg italic">
                  {language === 'de' 
                    ? '"KI ist so nützlich oder gefährlich wie alles, was Menschen geschaffen haben. Für den intelligenten Teil der Menschheit wird KI ein zuverlässiger starker Partner sein."'
                    : '"AI is as useful or dangerous as anything humans have created. For the intelligent part of humanity, AI will be a reliable strong partner."'
                  }
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <ClockIcon className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">3-12 {language === 'de' ? 'Monate' : 'Months'}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <ShieldCheckIcon className="h-5 w-5 text-green-400" />
                  <span className="font-medium">{language === 'de' ? 'Herstellerneutral' : 'Vendor-Neutral'}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <AcademicCapIcon className="h-5 w-5 text-purple-400" />
                  <span className="font-medium">15+ {language === 'de' ? 'Jahre Erfahrung' : 'Years Experience'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Principles Section */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold mb-4 ${textColors.primary}`}>
                {language === 'de' ? 'Unsere Beratungsprinzipien' : 'Our Consulting Principles'}
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${textColors.secondary}`}>
                {language === 'de' 
                  ? 'Bewährte Ansätze für erfolgreiche KI-Transformation in Unternehmen jeder Größe'
                  : 'Proven approaches for successful AI transformation in companies of all sizes'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {keyPrinciples.map((principle, index) => (
                <div key={index} className={`${getCardClasses()} p-8 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                  <h3 className={`text-xl font-bold mb-4 ${textColors.primary}`}>
                    {principle.title[language]}
                  </h3>
                  <p className={`leading-relaxed ${textColors.secondary}`}>
                    {principle.description[language]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Implementation Roadmap */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold mb-4 ${textColors.primary}`}>
                {language === 'de' ? '6-Stufen KI-Implementierungs-Roadmap' : '6-Stage AI Implementation Roadmap'}
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${textColors.secondary}`}>
                {language === 'de' 
                  ? 'Strukturierter Ansatz für erfolgreiche KI-Integration mit klaren Meilensteinen und messbaren Ergebnissen'
                  : 'Structured approach for successful AI integration with clear milestones and measurable results'
                }
              </p>
            </div>

            <div className="space-y-12">
              {roadmapStages.map((stage, index) => (
                <div key={stage.number} className="flex flex-col lg:flex-row items-start gap-8">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full text-2xl font-bold">
                      {stage.number}
                    </div>
                  </div>
                  
                  <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="flex-shrink-0 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                        {stage.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-2xl font-bold mb-3 ${textColors.primary}`}>
                          {stage.title[language]}
                        </h3>
                        <p className={`text-lg ${textColors.secondary}`}>
                          {stage.description[language]}
                        </p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {stage.items[language].map((item, itemIndex) => (
                        <div key={itemIndex} className="flex items-center space-x-2">
                          <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Training Programs Section */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold mb-4 ${textColors.primary}`}>
                {language === 'de' ? 'KI-Schulungsprogramme' : 'AI Training Programs'}
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${textColors.secondary}`}>
                {language === 'de' 
                  ? 'Maßgeschneiderte Schulungen für IT-Teams und Geschäftsführung mit praktischem Fokus und nachhaltigen Lernergebnissen'
                  : 'Customized training for IT teams and business leadership with practical focus and sustainable learning outcomes'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {trainingPrograms.map((program, index) => (
                <div key={index} className={`${getCardClasses()} p-8 shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="flex-shrink-0 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                      {program.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-2 ${textColors.primary}`}>
                        {program.title[language]}
                      </h3>
                      <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full text-sm font-medium mb-4">
                        <ClockIcon className="h-4 w-4" />
                        <span>{program.duration[language]}</span>
                      </div>
                      <p className={`mb-6 ${textColors.secondary}`}>
                        {program.description[language]}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className={`font-semibold mb-3 ${textColors.primary}`}>
                      {language === 'de' ? 'Schulungsmodule:' : 'Training Modules:'}
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {program.modules[language].map((module, moduleIndex) => (
                        <div key={moduleIndex} className="flex items-center space-x-2">
                          <CheckIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{module}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Capabilities */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold mb-4 ${textColors.primary}`}>
                {language === 'de' ? 'Technische Kernkompetenzen' : 'Technical Core Capabilities'}
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${textColors.secondary}`}>
                {language === 'de' 
                  ? 'Moderne Technologie-Stack mit Fokus auf Skalierbarkeit, Sicherheit und Flexibilität'
                  : 'Modern technology stack focused on scalability, security, and flexibility'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {technicalCapabilities.map((capability, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                      {capability.icon}
                    </div>
                    <h3 className={`font-semibold ${textColors.primary}`}>
                      {capability.title[language]}
                    </h3>
                  </div>
                  <p className={`text-sm ${textColors.secondary}`}>
                    {capability.description[language]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {language === 'de' ? 'Bereit für KI-Transformation?' : 'Ready for AI Transformation?'}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {language === 'de' 
                ? 'Starten Sie Ihre KI-Reise mit unserem bewährten 6-Stufen-Ansatz und erfahrenen Beratern.'
                : 'Start your AI journey with our proven 6-stage approach and experienced consultants.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact/booking" 
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {language === 'de' ? 'KI-Beratung vereinbaren' : 'Schedule AI Consultation'}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </a>
              <a 
                href="/contact" 
                className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
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

export default AIConsultingPage