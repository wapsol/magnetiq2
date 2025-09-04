import React from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import SEOHead from '../../components/common/SEOHead'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'
import { 
  UserGroupIcon,
  AcademicCapIcon,
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CloudIcon,
  BuildingOfficeIcon,
  CpuChipIcon,
  GlobeAltIcon,
  ChartPieIcon,
  LockClosedIcon
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
        en: 'Develop holistic IT concepts ensuring strategic, future-proof IT architecture. Focus on resilient infrastructure, digital process optimization, and innovation to create comprehensive technology roadmaps.',
        de: 'Entwicklung ganzheitlicher IT-Konzepte zur Gewährleistung strategischer, zukunftssicherer IT-Architektur. Fokus auf belastbare Infrastruktur, digitale Prozessoptimierung und Innovation zur Erstellung umfassender Technologie-Roadmaps.'
      }
    },
    {
      icon: <CogIcon className="h-8 w-8" />,
      title: {
        en: 'Program & Project Management',
        de: 'Programm- & Projektmanagement'
      },
      description: {
        en: 'Successful project realization within quality, time, and budget constraints. Systematic conceptualization, implementation, and complete project lifecycle management to ensure optimal outcomes.',
        de: 'Erfolgreiche Projektumsetzung innerhalb der Qualitäts-, Zeit- und Budgetbeschränkungen. Systematische Konzeptionierung, Implementierung und vollständiges Projektlebenszyklus-Management für optimale Ergebnisse.'
      }
    },
    {
      icon: <ArrowPathIcon className="h-8 w-8" />,
      title: {
        en: 'Change Management',
        de: 'Change Management'
      },
      description: {
        en: 'Strategic implementation of organizational changes promoting change readiness, employee acceptance, and engagement. Address resistance while creating flexible, resilient organizational structures.',
        de: 'Strategische Implementierung organisatorischer Veränderungen zur Förderung der Veränderungsbereitschaft, Mitarbeiterakzeptanz und -engagement. Widerstandsbewältigung bei gleichzeitiger Schaffung flexibler, belastbarer Organisationsstrukturen.'
      }
    },
    {
      icon: <ExclamationTriangleIcon className="h-8 w-8" />,
      title: {
        en: 'Crisis Handling & Project Rescue',
        de: 'Krisenmanagement & Projektrettung'
      },
      description: {
        en: 'Stabilize and secure endangered projects through comprehensive root cause analysis. Identify core problems, implement corrective measures, and realign projects with strategic goals.',
        de: 'Stabilisierung und Sicherung gefährdeter Projekte durch umfassende Ursachenanalyse. Identifikation von Kernproblemen, Implementierung von Korrekturmaßnahmen und Neuausrichtung auf strategische Ziele.'
      }
    },
    {
      icon: <ShieldCheckIcon className="h-8 w-8" />,
      title: {
        en: 'IT Service Management',
        de: 'IT Service Management'
      },
      description: {
        en: 'Efficient design and continuous improvement of IT services to maximize stability and service availability. Implement standardized methodologies for optimal infrastructure resilience.',
        de: 'Effiziente Gestaltung und kontinuierliche Verbesserung von IT-Services zur Maximierung von Stabilität und Serviceverfügbarkeit. Implementierung standardisierter Methoden für optimale Infrastruktur-Belastbarkeit.'
      }
    },
    {
      icon: <CloudIcon className="h-8 w-8" />,
      title: {
        en: 'Digital Transformation',
        de: 'Digitale Transformation'
      },
      description: {
        en: 'Enhance organizational performance through digital technologies. Includes process digitalization, infrastructure updates, and digital competence building with strategic roadmaps.',
        de: 'Verbesserung der Organisationsleistung durch digitale Technologien. Umfasst Prozessdigitalisierung, Infrastruktur-Updates und Aufbau digitaler Kompetenzen mit strategischen Roadmaps.'
      }
    },
    {
      icon: <BuildingOfficeIcon className="h-8 w-8" />,
      title: {
        en: 'ERP Consulting (AI-First Approach)',
        de: 'ERP-Beratung (KI-First Ansatz)'
      },
      description: {
        en: 'Harmonize business areas in an integrated, vendor-neutral system with AI-first approach. Includes implementation support and comprehensive change management for optimal business transformation.',
        de: 'Harmonisierung von Geschäftsbereichen in einem integrierten, herstellerneutralen System mit KI-First Ansatz. Umfasst Implementierungsunterstützung und umfassendes Change Management für optimale Geschäftstransformation.'
      }
    },
    {
      icon: <CpuChipIcon className="h-8 w-8" />,
      title: {
        en: 'Artificial Intelligence & Cognitive Twins',
        de: 'Künstliche Intelligenz & Cognitive Twins'
      },
      description: {
        en: 'Create digital representations of physical systems with autonomous decision-making capabilities. Advanced AI solutions and cognitive twins for intelligent process automation and strategic decision support.',
        de: 'Erstellung digitaler Repräsentationen physischer Systeme mit autonomen Entscheidungsfähigkeiten. Fortgeschrittene KI-Lösungen und Cognitive Twins für intelligente Prozessautomation und strategische Entscheidungsunterstützung.'
      }
    },
    {
      icon: <GlobeAltIcon className="h-8 w-8" />,
      title: {
        en: 'Industry 4.0 & Internet of Things',
        de: 'Industrie 4.0 & Internet of Things'
      },
      description: {
        en: 'Intelligent networking and data-driven control of devices and production processes. Connected manufacturing solutions and IoT implementations for comprehensive smart factory transformation.',
        de: 'Intelligente Vernetzung und datengesteuerte Kontrolle von Geräten und Produktionsprozessen. Vernetzte Fertigungslösungen und IoT-Implementierungen für umfassende Smart Factory Transformation.'
      }
    },
    {
      icon: <LockClosedIcon className="h-8 w-8" />,
      title: {
        en: 'Cyber Security',
        de: 'Cyber Security'
      },
      description: {
        en: 'Ensure confidentiality, integrity, and availability of systems and data through multi-layered defense strategies. Comprehensive security implementations to protect digital assets and ensure business continuity.',
        de: 'Gewährleistung der Vertraulichkeit, Integrität und Verfügbarkeit von Systemen und Daten durch mehrschichtige Verteidigungsstrategien. Umfassende Sicherheitsimplementierungen zum Schutz digitaler Assets und zur Geschäftskontinuität.'
      }
    },
    {
      icon: <ChartPieIcon className="h-8 w-8" />,
      title: {
        en: 'Data Science & Data Mining',
        de: 'Data Science & Data Mining'
      },
      description: {
        en: 'Automated analysis of large, heterogeneous data sets to identify patterns supporting operational and strategic decisions. Advanced analytics and data mining techniques for comprehensive business intelligence.',
        de: 'Automatisierte Analyse großer, heterogener Datensätze zur Identifikation von Mustern, die operative und strategische Entscheidungen unterstützen. Fortgeschrittene Analytik und Data Mining Techniken für umfassende Business Intelligence.'
      }
    }
  ]

  const keyPrinciples = [
    {
      title: {
        en: 'The Silverbacks Are Back',
        de: 'Die Silverbacks sind zurück'
      },
      description: {
        en: 'Every consultant brings at least 20 years of experience in national and international projects, ensuring senior-level expertise across all engagements.',
        de: 'Jeder Berater bringt mindestens 20 Jahre Erfahrung in nationalen und internationalen Projekten mit und gewährleistet Senior-Level-Expertise in allen Bereichen.'
      }
    },
    {
      title: {
        en: 'Swarm Knowledge',
        de: 'Schwarmwissen'
      },
      description: {
        en: 'Continuous iterative exchange with international IT experts enables us to bundle collective intelligence precisely for partner project requirements.',
        de: 'Kontinuierlicher iterativer Austausch mit internationalen IT-Experten ermöglicht es uns, Schwarmwissen punktgenau auf die Anforderungen der Partnerprojekte zu bündeln.'
      }
    },
    {
      title: {
        en: 'Holistic Solutions',
        de: 'Ganzheitliche Lösungen'
      },
      description: {
        en: 'Looking beyond the plate - comprehensive problem-solving approach combining diverse expertise for optimal results within time and budget. Focused on delivering the best possible results.',
        de: 'Über den Tellerrand hinausblicken - ganzheitlicher Problemlösungsansatz durch Kombination vielfältiger Expertise für optimale Ergebnisse in Zeit und Budget. Fokussiert auf bestmögliche Resultate.'
      }
    }
  ]

  const valuePropositions = [
    {
      title: {
        en: 'Senior-Level Expertise',
        de: 'Senior-Level Expertise'
      },
      description: {
        en: 'Exclusively comprised of experts with minimum 20 years of IT and project experience in national and international environments.',
        de: 'Ausschließlich bestehend aus Experten mit mindestens 20 Jahren IT- und Projekterfahrung in nationalen und internationalen Umgebungen.'
      }
    },
    {
      title: {
        en: 'Holistic Approach',
        de: 'Ganzheitlicher Ansatz'
      },
      description: {
        en: 'Comprehensive "look beyond the plate" methodology ensuring all aspects of your business transformation are considered and optimized.',
        de: 'Umfassende "Blick über den Tellerrand" Methodik, die sicherstellt, dass alle Aspekte Ihrer Unternehmenstransformation berücksichtigt und optimiert werden.'
      }
    },
    {
      title: {
        en: 'Proven Results',
        de: 'Bewährte Ergebnisse'
      },
      description: {
        en: 'Focused on delivering the best possible results "in time & budget" with a track record of successful project implementations.',
        de: 'Fokussiert auf die Lieferung bestmöglicher Ergebnisse "in Zeit & Budget" mit einer Erfolgsgeschichte erfolgreicher Projektimplementierungen.'
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

      <div className={`${backgrounds.page}`}>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary-50 via-primary-100 to-purple-50 text-gray-800 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center space-x-2 bg-primary-600 text-white rounded-full px-4 py-2 mb-8">
                <UserGroupIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {language === 'de' ? '"The Silverbacks are Back"' : '"The Silverbacks are Back"'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary-900">
                {language === 'de' ? (
                  <>Management <span className="text-primary-600">Advisory</span></>
                ) : (
                  <>Management <span className="text-primary-600">Advisory</span></>
                )}
              </h1>
              
              <p className="text-xl md:text-2xl text-primary-700 mb-8">
                {language === 'de' 
                  ? 'Strategische IT-Beratung und Transformation mit mindestens 20 Jahren Erfahrung in nationalen und internationalen Projekten'
                  : 'Strategic IT consulting and transformation with at least 20 years of experience in national and international projects'
                }
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center space-x-2 bg-white border border-primary-200 rounded-lg px-4 py-2">
                  <AcademicCapIcon className="h-5 w-5 text-primary-600" />
                  <span className="font-medium text-primary-800">20+ {language === 'de' ? 'Jahre Erfahrung' : 'Years Experience'}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white border border-primary-200 rounded-lg px-4 py-2">
                  <UserGroupIcon className="h-5 w-5 text-green-600" />
                  <span className="font-medium text-primary-800">{language === 'de' ? 'Internationale Experten' : 'International Experts'}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white border border-primary-200 rounded-lg px-4 py-2">
                  <ShieldCheckIcon className="h-5 w-5 text-primary-600" />
                  <span className="font-medium text-primary-800">{language === 'de' ? 'Bewährte Methoden' : 'Proven Methods'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Key Principles Section */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Unsere Grundprinzipien' : 'Our Core Principles'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Kombinieren unsere Expertise unter einem Management-Beratungsverbund, um Schwarmwissen für die bestmöglichen Ergebnisse zu bündeln'
                  : 'Combining our expertise under a management consulting alliance to bundle swarm knowledge for optimal results'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {keyPrinciples.map((principle, index) => (
                <div key={index} className={`${getCardClasses()} rounded-xl shadow-lg hover:shadow-xl duration-300`}>
                  <h3 className={`text-xl font-bold ${textColors.primary} mb-4`}>
                    {principle.title[language]}
                  </h3>
                  <p className={`${textColors.secondary} leading-relaxed`}>
                    {principle.description[language]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className={getSectionClasses()}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Unser Service-Portfolio' : 'Our Service Portfolio'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Umfassende Beratungsdienstleistungen für strategische IT-Transformation und Projektmanagement'
                  : 'Comprehensive consulting services for strategic IT transformation and project management'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <div key={index} className={`${getCardClasses()} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-blue-200`}>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-3 bg-blue-50 rounded-lg text-blue-600">
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">
                        {service.title[language]}
                      </h3>
                      <p className={`${textColors.secondary} leading-relaxed`}>
                        {service.description[language]}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Value Propositions Section */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Warum voltAIc Management Advisory?' : 'Why voltAIc Management Advisory?'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Unsere einzigartige Kombination aus Erfahrung, Methodik und Fokus auf Ergebnisse unterscheidet uns von anderen Beratungsunternehmen'
                  : 'Our unique combination of experience, methodology, and focus on results sets us apart from other consulting firms'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {valuePropositions.map((proposition, index) => (
                <div key={index} className={`${getCardClasses()} rounded-xl shadow-lg hover:shadow-xl duration-300 text-center`}>
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                  </div>
                  <h3 className={`text-xl font-bold ${textColors.primary} mb-4`}>
                    {proposition.title[language]}
                  </h3>
                  <p className={`${textColors.secondary} leading-relaxed`}>
                    {proposition.description[language]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Information Section */}
        <section className={getSectionClasses()}>
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-6`}>
                {language === 'de' ? 'Lassen Sie uns sprechen' : 'Let\'s Talk'}
              </h2>
              <p className={`text-xl ${textColors.secondary} mb-8`}>
                {language === 'de' 
                  ? 'Kontaktieren Sie unsere erfahrenen Management-Berater für ein unverbindliches Beratungsgespräch über Ihre strategischen IT-Herausforderungen.'
                  : 'Contact our experienced management consultants for a no-obligation consultation about your strategic IT challenges.'
                }
              </p>
              
              <div className="bg-blue-50 rounded-2xl p-8 mb-8">
                <div className="flex items-center justify-center mb-4">
                  <UserGroupIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <span className="text-lg font-semibold text-blue-900">
                    {language === 'de' ? 'Direkter Kontakt zu unseren Experten' : 'Direct Contact to Our Experts'}
                  </span>
                </div>
                <p className="text-blue-800 mb-4">
                  {language === 'de' 
                    ? 'Für datengetriebene Lösungen und strategische Beratung:'
                    : 'For data-driven solutions and strategic consulting:'
                  }
                </p>
                <a 
                  href="mailto:datadriven@voltaic.systems" 
                  className="inline-flex items-center text-blue-600 font-semibold hover:text-blue-800 transition-colors duration-200"
                >
                  datadriven@voltaic.systems
                </a>
              </div>
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