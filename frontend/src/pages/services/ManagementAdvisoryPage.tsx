import React from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import SEOHead from '../../components/common/SEOHead'
import { 
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CloudIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

const ManagementAdvisoryPage: React.FC = () => {
  const { language, t } = useLanguage()

  const services = [
    {
      icon: <ChartBarIcon className="h-8 w-8" />,
      title: {
        en: 'IT Strategy & Transformation',
        de: 'IT-Strategie & Transformation'
      },
      description: {
        en: 'Develop comprehensive IT concepts ensuring future-proof architecture with strategic infrastructure alignment and digital process optimization.',
        de: 'Entwicklung umfassender IT-Konzepte zur Gewährleistung zukunftssicherer Architektur mit strategischer Infrastruktur-Ausrichtung und digitaler Prozessoptimierung.'
      }
    },
    {
      icon: <CogIcon className="h-8 w-8" />,
      title: {
        en: 'Program & Project Management',
        de: 'Programm- & Projektmanagement'
      },
      description: {
        en: 'Successful project realization within quality, time, and budget constraints through systematic conceptualization and implementation.',
        de: 'Erfolgreiche Projektumsetzung innerhalb der Qualitäts-, Zeit- und Budgetbeschränkungen durch systematische Konzeptionierung und Umsetzung.'
      }
    },
    {
      icon: <ArrowPathIcon className="h-8 w-8" />,
      title: {
        en: 'Change Management',
        de: 'Change Management'
      },
      description: {
        en: 'Strategic implementation of organizational changes, addressing resistance and creating flexible, resilient structures.',
        de: 'Strategische Implementierung organisatorischer Veränderungen, Adressierung von Widerständen und Schaffung flexibler, belastbarer Strukturen.'
      }
    },
    {
      icon: <ExclamationTriangleIcon className="h-8 w-8" />,
      title: {
        en: 'Crisis Handling & Project Rescue',
        de: 'Krisenmanagement & Projektrettung'
      },
      description: {
        en: 'Stabilize and secure endangered projects through root cause analysis and realignment with project goals.',
        de: 'Stabilisierung und Sicherung gefährdeter Projekte durch Ursachenanalyse und Neuausrichtung auf Projektziele.'
      }
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      title: {
        en: 'IT Service Management',
        de: 'IT Service Management'
      },
      description: {
        en: 'Efficient IT service design and continuous improvement with standardized methodologies and infrastructure resilience.',
        de: 'Effiziente IT-Service-Gestaltung und kontinuierliche Verbesserung mit standardisierten Methoden und Infrastruktur-Belastbarkeit.'
      }
    },
    {
      icon: <CloudIcon className="h-8 w-8" />,
      title: {
        en: 'Digital Transformation',
        de: 'Digitale Transformation'
      },
      description: {
        en: 'Enhance organizational performance through digital technologies with strategic roadmaps and cloud-based integration.',
        de: 'Verbesserung der Organisationsleistung durch digitale Technologien mit strategischen Roadmaps und Cloud-basierter Integration.'
      }
    },
    {
      icon: <BuildingOfficeIcon className="h-8 w-8" />,
      title: {
        en: 'ERP Consulting (AI-Enhanced)',
        de: 'ERP-Beratung (KI-Enhanced)'
      },
      description: {
        en: 'Harmonize business areas with vendor-agnostic, AI-featured ERP solutions for comprehensive business optimization.',
        de: 'Harmonisierung von Geschäftsbereichen mit herstellerneutralen, KI-gestützten ERP-Lösungen für umfassende Geschäftsoptimierung.'
      }
    }
  ]

  const keyPrinciples = [
    {
      title: {
        en: 'Senior Expertise',
        de: 'Senior-Expertise'
      },
      description: {
        en: 'Each consultant has at least 20 years of experience in national and international projects.',
        de: 'Jeder Berater verfügt über mindestens 20 Jahre Erfahrung in nationalen und internationalen Projekten.'
      }
    },
    {
      title: {
        en: 'Collective Intelligence',
        de: 'Kollektive Intelligenz'
      },
      description: {
        en: 'Continuous exchange with international IT experts leveraging collective "swarm knowledge".',
        de: 'Kontinuierlicher Austausch mit internationalen IT-Experten unter Nutzung des kollektiven "Schwarmwissens".'
      }
    },
    {
      title: {
        en: 'Holistic Approach',
        de: 'Ganzheitlicher Ansatz'
      },
      description: {
        en: 'Comprehensive problem-solving approach focused on delivering results in time and budget.',
        de: 'Umfassender Problemlösungsansatz mit Fokus auf termingerechte und budgetgerechte Ergebnisse.'
      }
    }
  ]

  return (
    <>
      <SEOHead
        title={language === 'de' ? 'Management Advisory - voltAIc Systems' : 'Management Advisory - voltAIc Systems'}
        description={language === 'de' 
          ? 'Strategische IT-Beratung und Transformation mit über 20 Jahren Erfahrung. Spezialisiert auf Change Management, Projektrettung und digitale Transformation.'
          : 'Strategic IT consulting and transformation with over 20 years of experience. Specialized in change management, project rescue, and digital transformation.'
        }
      />

      <div className="bg-white">
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <UserGroupIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {language === 'de' ? '"The Silverbacks are Back"' : '"The Silverbacks are Back"'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {language === 'de' ? (
                  <>Management <span className="text-blue-400">Advisory</span></>
                ) : (
                  <>Management <span className="text-blue-400">Advisory</span></>
                )}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 mb-8">
                {language === 'de' 
                  ? 'Strategische IT-Beratung mit mindestens 20 Jahren Erfahrung in nationalen und internationalen Projekten'
                  : 'Strategic IT consulting with at least 20 years of experience in national and international projects'
                }
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <AcademicCapIcon className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">20+ {language === 'de' ? 'Jahre Erfahrung' : 'Years Experience'}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <UserGroupIcon className="h-5 w-5 text-green-400" />
                  <span className="font-medium">{language === 'de' ? 'Internationale Experten' : 'International Experts'}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <ShieldCheckIcon className="h-5 w-5 text-purple-400" />
                  <span className="font-medium">{language === 'de' ? 'Bewährte Methoden' : 'Proven Methods'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Principles Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {language === 'de' ? 'Unsere Grundprinzipien' : 'Our Core Principles'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {language === 'de' 
                  ? 'Kontinuierlicher Austausch und Feedback mit internationalen IT-Experten für bestmögliche Projektergebnisse'
                  : 'Continuous exchange and feedback with international IT experts for optimal project results'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {keyPrinciples.map((principle, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    {principle.title[language]}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {principle.description[language]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                {language === 'de' ? 'Unser Service-Portfolio' : 'Our Service Portfolio'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {language === 'de' 
                  ? 'Umfassende Beratungsdienstleistungen für strategische IT-Transformation und Projektmanagement'
                  : 'Comprehensive consulting services for strategic IT transformation and project management'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg text-blue-600">
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {service.title[language]}
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {service.description[language]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {language === 'de' ? 'Bereit für strategische Transformation?' : 'Ready for Strategic Transformation?'}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {language === 'de' 
                ? 'Lassen Sie uns gemeinsam Ihre IT-Herausforderungen lösen und Ihr Unternehmen zukunftssicher machen.'
                : 'Let us work together to solve your IT challenges and future-proof your business.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact/booking" 
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {language === 'de' ? 'Beratung vereinbaren' : 'Schedule Consultation'}
              </a>
              <a 
                href="/contact" 
                className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200"
              >
                {language === 'de' ? 'Kontakt aufnehmen' : 'Get in Touch'}
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default ManagementAdvisoryPage