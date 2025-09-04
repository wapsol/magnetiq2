import React from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import SEOHead from '../../components/common/SEOHead'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'
import {
  CodeBracketIcon,
  CpuChipIcon,
  CloudIcon,
  CogIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  BoltIcon,
  DocumentTextIcon,
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  GlobeAltIcon,
  CircleStackIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  RocketLaunchIcon,
  UserGroupIcon,
  WrenchScrewdriverIcon
} from '@heroicons/react/24/outline'

const DevelopmentPage = () => {
  const { language } = useLanguage()

  const developmentServices = [
    {
      icon: <CpuChipIcon className="h-8 w-8" />,
      title: {
        en: 'AI/ML Application Development',
        de: 'KI/ML-Anwendungsentwicklung'
      },
      description: {
        en: 'Custom artificial intelligence and machine learning applications tailored to your business needs, from prototype to production-ready solutions.',
        de: 'Maßgeschneiderte künstliche Intelligenz- und Machine Learning-Anwendungen für Ihre Geschäftsanforderungen, vom Prototyp bis zu produktionsreifen Lösungen.'
      },
      technologies: {
        en: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Hugging Face', 'OpenAI API', 'Custom Models'],
        de: ['TensorFlow', 'PyTorch', 'Scikit-learn', 'Hugging Face', 'OpenAI API', 'Custom Models']
      }
    },
    {
      icon: <CircleStackIcon className="h-8 w-8" />,
      title: {
        en: 'Semantic Data Management',
        de: 'Semantisches Datenmanagement'
      },
      description: {
        en: 'Advanced data management solutions using semantic technologies, knowledge graphs, and intelligent data processing for enterprise-grade applications.',
        de: 'Fortgeschrittene Datenmanagemnt-Lösungen mit semantischen Technologien, Wissensgraphen und intelligenter Datenverarbeitung für Enterprise-Anwendungen.'
      },
      technologies: {
        en: ['Knowledge Graphs', 'RDF/OWL', 'SPARQL', 'Apache Jena', 'Neo4j', 'Vector Databases'],
        de: ['Knowledge Graphs', 'RDF/OWL', 'SPARQL', 'Apache Jena', 'Neo4j', 'Vektordatenbanken']
      }
    },
    {
      icon: <ComputerDesktopIcon className="h-8 w-8" />,
      title: {
        en: 'Enterprise Applications',
        de: 'Enterprise-Anwendungen'
      },
      description: {
        en: 'Scalable enterprise applications with modern architectures, microservices, and cloud-native design for high-performance business operations.',
        de: 'Skalierbare Enterprise-Anwendungen mit modernen Architekturen, Microservices und Cloud-nativen Design für hochperformante Geschäftsabläufe.'
      },
      technologies: {
        en: ['Microservices', 'Kubernetes', 'Docker', 'Spring Boot', 'Node.js', 'React/Vue'],
        de: ['Microservices', 'Kubernetes', 'Docker', 'Spring Boot', 'Node.js', 'React/Vue']
      }
    },
    {
      icon: <DevicePhoneMobileIcon className="h-8 w-8" />,
      title: {
        en: 'Cross-Platform Solutions',
        de: 'Cross-Platform-Lösungen'
      },
      description: {
        en: 'Mobile and desktop applications that work seamlessly across all platforms with native performance and user experience.',
        de: 'Mobile und Desktop-Anwendungen, die nahtlos auf allen Plattformen mit nativer Performance und Benutzererfahrung funktionieren.'
      },
      technologies: {
        en: ['React Native', 'Flutter', 'Electron', 'Progressive Web Apps', 'Native Development'],
        de: ['React Native', 'Flutter', 'Electron', 'Progressive Web Apps', 'Native Development']
      }
    }
  ]

  const technicalExpertise = [
    {
      category: {
        en: 'Programming Languages',
        de: 'Programmiersprachen'
      },
      technologies: ['Python', 'JavaScript/TypeScript', 'Java', 'Go', 'Rust', 'C++', 'Swift', 'Kotlin']
    },
    {
      category: {
        en: 'AI/ML Frameworks',
        de: 'KI/ML-Frameworks'
      },
      technologies: ['TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'XGBoost', 'OpenCV', 'NLTK', 'spaCy']
    },
    {
      category: {
        en: 'Cloud Platforms',
        de: 'Cloud-Plattformen'
      },
      technologies: ['AWS', 'Google Cloud', 'Microsoft Azure', 'Private Cloud', 'Hybrid Cloud']
    },
    {
      category: {
        en: 'Databases & Storage',
        de: 'Datenbanken & Speicher'
      },
      technologies: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch', 'Neo4j', 'Vector DBs']
    }
  ]

  const developmentProcess = [
    {
      phase: {
        en: 'Discovery & Planning',
        de: 'Entdeckung & Planung'
      },
      description: {
        en: 'Requirements analysis, technical feasibility study, and project roadmap creation with clear milestones and deliverables.',
        de: 'Anforderungsanalyse, technische Machbarkeitsstudie und Projektfahrplan-Erstellung mit klaren Meilensteinen und Liefergegenständen.'
      },
      duration: '1-2 weeks'
    },
    {
      phase: {
        en: 'Architecture Design',
        de: 'Architektur-Design'
      },
      description: {
        en: 'System architecture design, technology stack selection, and scalability planning for optimal performance.',
        de: 'Systemarchitektur-Design, Technologie-Stack-Auswahl und Skalierbarkeitsplanung für optimale Performance.'
      },
      duration: '1-3 weeks'
    },
    {
      phase: {
        en: 'Agile Development',
        de: 'Agile Entwicklung'
      },
      description: {
        en: 'Iterative development with continuous testing, regular feedback loops, and incremental delivery of features.',
        de: 'Iterative Entwicklung mit kontinuierlichen Tests, regelmäßigen Feedback-Schleifen und schrittweiser Feature-Lieferung.'
      },
      duration: '4-16 weeks'
    },
    {
      phase: {
        en: 'Deployment & Support',
        de: 'Deployment & Support'
      },
      description: {
        en: 'Production deployment, monitoring setup, performance optimization, and ongoing maintenance and support.',
        de: 'Produktions-Deployment, Monitoring-Setup, Performance-Optimierung und laufende Wartung und Support.'
      },
      duration: 'Ongoing'
    }
  ]

  const caseStudies = [
    {
      title: {
        en: 'AI-Powered Document Processing',
        de: 'KI-gestützte Dokumentenverarbeitung'
      },
      industry: {
        en: 'Financial Services',
        de: 'Finanzdienstleistungen'
      },
      challenge: {
        en: 'Process 10,000+ documents daily with 99% accuracy',
        de: '10.000+ Dokumente täglich mit 99% Genauigkeit verarbeiten'
      },
      solution: {
        en: 'Custom ML pipeline with OCR, NLP, and automated classification',
        de: 'Maßgeschneiderte ML-Pipeline mit OCR, NLP und automatisierter Klassifizierung'
      },
      results: {
        en: ['85% faster processing', '99.2% accuracy rate', '$500K annual savings'],
        de: ['85% schnellere Verarbeitung', '99,2% Genauigkeitsrate', '500K€ jährliche Einsparungen']
      }
    },
    {
      title: {
        en: 'Semantic Knowledge Platform',
        de: 'Semantische Wissensplattform'
      },
      industry: {
        en: 'Healthcare',
        de: 'Gesundheitswesen'
      },
      challenge: {
        en: 'Unify medical knowledge across multiple data sources',
        de: 'Medizinisches Wissen über mehrere Datenquellen hinweg vereinheitlichen'
      },
      solution: {
        en: 'Knowledge graph with semantic search and AI recommendations',
        de: 'Wissensgraph mit semantischer Suche und KI-Empfehlungen'
      },
      results: {
        en: ['70% faster research', '300% better data discovery', '40% improved outcomes'],
        de: ['70% schnellere Forschung', '300% bessere Datenerkennung', '40% verbesserte Ergebnisse']
      }
    }
  ]

  return (
    <>
      <SEOHead
        title={language === 'de' ? 'Individuelle Entwicklung - voltAIc Systems' : 'Custom Development - voltAIc Systems'}
        description={language === 'de' 
          ? 'Maßgeschneiderte KI/ML-Anwendungen, semantisches Datenmanagement und Enterprise-Lösungen für Ihre spezifischen Anforderungen.'
          : 'Custom AI/ML applications, semantic data management, and enterprise solutions tailored to your specific requirements.'
        }
      />

      <div className={`${backgrounds.page}`}>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-orange-900 via-purple-900 to-indigo-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <CodeBracketIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {language === 'de' ? 'Maßgeschneiderte Entwicklung' : 'Custom Development'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {language === 'de' ? (
                  <>Individuelle <span className="text-orange-400">Entwicklung</span></>
                ) : (
                  <>Custom <span className="text-orange-400">Development</span></>
                )}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 mb-8">
                {language === 'de' 
                  ? 'Von KI/ML-Anwendungen bis zu Enterprise-Lösungen - wir entwickeln maßgeschneiderte Software für Ihre spezifischen Anforderungen'
                  : 'From AI/ML applications to enterprise solutions - we develop custom software for your specific requirements'
                }
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <CpuChipIcon className="h-5 w-5 text-orange-400" />
                  <span className="font-medium">{language === 'de' ? 'KI/ML-Entwicklung' : 'AI/ML Development'}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <CircleStackIcon className="h-5 w-5 text-blue-400" />
                  <span className="font-medium">{language === 'de' ? 'Semantic Data' : 'Semantic Data'}</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <CloudIcon className="h-5 w-5 text-purple-400" />
                  <span className="font-medium">{language === 'de' ? 'Cloud-Native' : 'Cloud-Native'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Development Services */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Unsere Entwicklungsleistungen' : 'Our Development Services'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Spezialisiert auf modernste Technologien für intelligente, skalierbare und zukunftssichere Lösungen'
                  : 'Specialized in cutting-edge technologies for intelligent, scalable, and future-proof solutions'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {developmentServices.map((service, index) => (
                <div key={index} className={`${getCardClasses()} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700`}>
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="flex-shrink-0 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg text-orange-600 dark:text-orange-400">
                      {service.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${textColors.primary} mb-3`}>
                        {service.title[language]}
                      </h3>
                      <p className={`${textColors.secondary} leading-relaxed mb-4`}>
                        {service.description[language]}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className={`font-semibold ${textColors.primary} mb-3 text-sm uppercase tracking-wide`}>
                      {language === 'de' ? 'Technologien:' : 'Technologies:'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {service.technologies[language].map((tech, techIndex) => (
                        <span key={techIndex} className="inline-flex items-center px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs font-medium rounded-full">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Expertise */}
        <section className={getSectionClasses()}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Technische Expertise' : 'Technical Expertise'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Umfassende Kenntnis modernster Technologien und Frameworks für optimale Lösungsarchitektur'
                  : 'Comprehensive knowledge of cutting-edge technologies and frameworks for optimal solution architecture'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {technicalExpertise.map((category, index) => (
                <div key={index} className={`${getCardClasses()} rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                  <h3 className={`text-lg font-bold ${textColors.primary} mb-4`}>
                    {category.category[language]}
                  </h3>
                  <div className="space-y-2">
                    {category.technologies.map((tech, techIndex) => (
                      <div key={techIndex} className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-400 rounded-full flex-shrink-0"></div>
                        <span className={`text-sm ${textColors.secondary}`}>{tech}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Development Process */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Unser Entwicklungsprozess' : 'Our Development Process'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Agiler Entwicklungsansatz mit kontinuierlicher Kommunikation und iterativer Verbesserung'
                  : 'Agile development approach with continuous communication and iterative improvement'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {developmentProcess.map((process, index) => (
                <div key={index} className={`${getCardClasses()} text-center rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                  <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-bold">
                    {index + 1}
                  </div>
                  <h3 className={`text-lg font-bold ${textColors.primary} mb-3`}>
                    {process.phase[language]}
                  </h3>
                  <p className={`${textColors.secondary} text-sm leading-relaxed mb-3`}>
                    {process.description[language]}
                  </p>
                  <div className="inline-flex items-center px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs font-medium rounded-full">
                    {process.duration}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Case Studies */}
        <section className={getSectionClasses()}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Erfolgreiche Projekte' : 'Successful Projects'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Beispiele für erfolgreich umgesetzte maßgeschneiderte Entwicklungsprojekte mit messbaren Ergebnissen'
                  : 'Examples of successfully implemented custom development projects with measurable results'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {caseStudies.map((study, index) => (
                <div key={index} className={`${getCardClasses()} rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700`}>
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-xl font-bold ${textColors.primary}`}>
                        {study.title[language]}
                      </h3>
                      <span className="inline-flex items-center px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm font-medium rounded-full">
                        {study.industry[language]}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className={`font-semibold ${textColors.primary} mb-2 text-sm uppercase tracking-wide`}>
                          {language === 'de' ? 'Herausforderung:' : 'Challenge:'}
                        </h4>
                        <p className={`${textColors.secondary} text-sm`}>
                          {study.challenge[language]}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className={`font-semibold ${textColors.primary} mb-2 text-sm uppercase tracking-wide`}>
                          {language === 'de' ? 'Lösung:' : 'Solution:'}
                        </h4>
                        <p className={`${textColors.secondary} text-sm`}>
                          {study.solution[language]}
                        </p>
                      </div>
                      
                      <div>
                        <h4 className={`font-semibold ${textColors.primary} mb-2 text-sm uppercase tracking-wide`}>
                          {language === 'de' ? 'Ergebnisse:' : 'Results:'}
                        </h4>
                        <div className="grid grid-cols-1 gap-1">
                          {study.results[language].map((result, resultIndex) => (
                            <div key={resultIndex} className="flex items-center space-x-2">
                              <CheckCircleIcon className="h-4 w-4 text-green-500 flex-shrink-0" />
                              <span className="text-sm text-gray-700 dark:text-gray-300">{result}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-orange-600 to-purple-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {language === 'de' ? 'Bereit für Ihr maßgeschneidertes Projekt?' : 'Ready for Your Custom Project?'}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {language === 'de' 
                ? 'Lassen Sie uns gemeinsam Ihre Vision in eine innovative, skalierbare Software-Lösung verwandeln.'
                : 'Let us work together to transform your vision into an innovative, scalable software solution.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact/booking" 
                className="inline-flex items-center px-8 py-3 bg-white text-orange-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {language === 'de' ? 'Entwicklungs-Beratung' : 'Development Consultation'}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </a>
              <a 
                href="/contact" 
                className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-orange-600 transition-colors duration-200"
              >
                {language === 'de' ? 'Projekt besprechen' : 'Discuss Project'}
              </a>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default DevelopmentPage