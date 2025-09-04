import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import SEOHead from '../../components/common/SEOHead'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'
import { 
  BuildingOfficeIcon,
  CpuChipIcon,
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  CogIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  RocketLaunchIcon,
  BoltIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const SolutionsOverview = () => {
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''

  const mainSolutions = [
    {
      title: {
        en: 'Industry Solutions',
        de: 'Branchenlösungen'
      },
      description: {
        en: 'Tailored AI and digital solutions designed specifically for your industry\'s unique challenges and requirements.',
        de: 'Maßgeschneiderte KI- und digitale Lösungen, die speziell für die einzigartigen Herausforderungen und Anforderungen Ihrer Branche entwickelt wurden.'
      },
      icon: BuildingOfficeIcon,
      path: `${basePath}/solutions/industries`,
      features: {
        en: ['Financial Services', 'Healthcare', 'Manufacturing', 'Energy & Utilities', 'Retail & E-commerce', 'Service Providers'],
        de: ['Finanzdienstleistungen', 'Gesundheitswesen', 'Fertigung', 'Energie & Versorgung', 'Einzelhandel & E-Commerce', 'Dienstleister']
      },
      color: 'blue'
    },
    {
      title: {
        en: 'Technology Solutions',
        de: 'Technologielösungen'
      },
      description: {
        en: 'Platform-specific implementations and technology-focused solutions for optimal system integration and performance.',
        de: 'Plattformspezifische Implementierungen und technologieorientierte Lösungen für optimale Systemintegration und Performance.'
      },
      icon: CpuChipIcon,
      path: `${basePath}/solutions/technology`,
      features: {
        en: ['AI/ML Platforms', 'Cloud Architecture', 'Data Management', 'Integration Solutions', 'Security Frameworks', 'Automation Tools'],
        de: ['KI/ML-Plattformen', 'Cloud-Architektur', 'Datenmanagement', 'Integrationslösungen', 'Security-Frameworks', 'Automatisierung-Tools']
      },
      color: 'purple'
    },
    {
      title: {
        en: 'Case Studies',
        de: 'Fallstudien'
      },
      description: {
        en: 'Real-world success stories and proven results from our AI and digital transformation projects across various industries.',
        de: 'Reale Erfolgsgeschichten und bewährte Ergebnisse aus unseren KI- und digitalen Transformationsprojekten in verschiedenen Branchen.'
      },
      icon: DocumentTextIcon,
      path: `${basePath}/solutions/case-studies`,
      features: {
        en: ['Documented ROI', 'Performance Metrics', 'Implementation Details', 'Lessons Learned', 'Best Practices', 'Client Testimonials'],
        de: ['Dokumentierter ROI', 'Performance-Metriken', 'Implementierungsdetails', 'Erkenntnisse', 'Best Practices', 'Kundenstimmen']
      },
      color: 'green'
    }
  ]

  const keyBenefits = [
    {
      icon: <RocketLaunchIcon className="h-6 w-6" />,
      title: {
        en: 'Accelerated Implementation',
        de: 'Beschleunigte Implementierung'
      },
      description: {
        en: 'Pre-built templates and proven methodologies for faster deployment',
        de: 'Vorgefertigte Templates und bewährte Methoden für schnellere Bereitstellung'
      }
    },
    {
      icon: <BoltIcon className="h-6 w-6" />,
      title: {
        en: 'Proven ROI',
        de: 'Bewiesener ROI'
      },
      description: {
        en: 'Documented success stories with measurable business impact',
        de: 'Dokumentierte Erfolgsgeschichten mit messbaren Geschäftsauswirkungen'
      }
    },
    {
      icon: <CogIcon className="h-6 w-6" />,
      title: {
        en: 'Scalable Architecture',
        de: 'Skalierbare Architektur'
      },
      description: {
        en: 'Solutions designed to grow with your business needs',
        de: 'Lösungen, die mit Ihren Geschäftsanforderungen mitwachsen'
      }
    },
    {
      icon: <UserGroupIcon className="h-6 w-6" />,
      title: {
        en: 'Expert Support',
        de: 'Experten-Support'
      },
      description: {
        en: 'Dedicated team support throughout implementation and beyond',
        de: 'Dedizierte Team-Unterstützung während der Implementierung und darüber hinaus'
      }
    }
  ]

  const stats = [
    { 
      label: language === 'en' ? 'Industries Served' : 'Betreute Branchen', 
      value: '8+' 
    },
    { 
      label: language === 'en' ? 'Successful Projects' : 'Erfolgreiche Projekte', 
      value: '150+' 
    },
    { 
      label: language === 'en' ? 'Average ROI' : 'Durchschnittlicher ROI', 
      value: '300%' 
    },
    { 
      label: language === 'en' ? 'Client Satisfaction' : 'Kundenzufriedenheit', 
      value: '98%' 
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-800/30',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-800/30'
    }
    return colorMap[color] || colorMap.blue
  }

  return (
    <>
      <SEOHead
        title={language === 'de' ? 'Lösungen - voltAIc Systems' : 'Solutions - voltAIc Systems'}
        description={language === 'de' 
          ? 'Branchenspezifische KI-Lösungen, Technologie-Implementierungen und bewährte Fallstudien für verschiedene Industriezweige.'
          : 'Industry-specific AI solutions, technology implementations, and proven case studies across various industry sectors.'
        }
      />

      <div className={`${backgrounds.page}`}>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-primary-50 via-primary-100 to-purple-50 text-gray-800 overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="relative container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center space-x-2 bg-primary-600 text-white rounded-full px-4 py-2 mb-8">
                <GlobeAltIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {language === 'de' ? 'Branchenübergreifende Expertise' : 'Cross-Industry Expertise'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-primary-900">
                {language === 'de' ? (
                  <>Unsere <span className="text-primary-600">Lösungen</span></>
                ) : (
                  <>Our <span className="text-primary-600">Solutions</span></>
                )}
              </h1>
              
              <p className="text-xl md:text-2xl text-primary-700 mb-8">
                {language === 'de' 
                  ? 'Branchenspezifische KI-Lösungen und technologieorientierte Implementierungen für nachhaltigen Geschäftserfolg'
                  : 'Industry-specific AI solutions and technology-focused implementations for sustainable business success'
                }
              </p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center bg-white/60 backdrop-blur-sm border border-primary-200 rounded-lg p-4">
                    <div className="text-2xl md:text-3xl font-bold text-primary-600">{stat.value}</div>
                    <div className="text-sm text-primary-800">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Main Solutions */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Unser Lösungsportfolio' : 'Our Solution Portfolio'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Umfassende Lösungen für verschiedene Branchen, Technologien und Anwendungsfälle'
                  : 'Comprehensive solutions for various industries, technologies, and use cases'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {mainSolutions.map((solution, index) => (
                <Link
                  key={solution.path}
                  to={solution.path}
                  className={`${getCardClasses()} group rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 block`}
                >
                  <div className="mb-6">
                    <div className={`flex-shrink-0 p-4 rounded-lg transition-colors duration-300 ${getColorClasses(solution.color)} mb-4 inline-block`}>
                      <solution.icon className="h-8 w-8" />
                    </div>
                    <h3 className={`text-xl font-bold ${textColors.primary} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 mb-3`}>
                      {solution.title[language]}
                    </h3>
                    <p className={`${textColors.secondary} leading-relaxed mb-4`}>
                      {solution.description[language]}
                    </p>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className={`font-semibold ${textColors.primary} mb-3 text-sm uppercase tracking-wide`}>
                      {language === 'de' ? 'Schwerpunkte:' : 'Focus Areas:'}
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {solution.features[language].map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className={`text-sm font-medium ${textColors.secondary}`}>
                      {language === 'de' ? 'Mehr erfahren' : 'Learn More'}
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Key Benefits */}
        <section className={getSectionClasses()}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Warum unsere Lösungen?' : 'Why Our Solutions?'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Bewährte Ansätze mit messbaren Ergebnissen und nachhaltiger Wertschöpfung'
                  : 'Proven approaches with measurable results and sustainable value creation'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {keyBenefits.map((benefit, index) => (
                <div key={index} className={`${getCardClasses()} text-center rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                  <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="text-purple-600 dark:text-purple-400">{benefit.icon}</div>
                  </div>
                  <h3 className={`text-lg font-bold ${textColors.primary} mb-3`}>
                    {benefit.title[language]}
                  </h3>
                  <p className={`${textColors.secondary} text-sm leading-relaxed`}>
                    {benefit.description[language]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industry Focus Preview */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Unsere Branchenschwerpunkte' : 'Our Industry Focus'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Spezialisierte Expertise in kritischen Industriezweigen mit nachweislichen Erfolgen'
                  : 'Specialized expertise in critical industry sectors with proven track records'
                }
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { emoji: '🏦', name: language === 'de' ? 'Finanzwesen' : 'Financial Services' },
                { emoji: '🏥', name: language === 'de' ? 'Gesundheitswesen' : 'Healthcare' },
                { emoji: '🏭', name: language === 'de' ? 'Fertigung' : 'Manufacturing' },
                { emoji: '⚡', name: language === 'de' ? 'Energie' : 'Energy' },
                { emoji: '🏢', name: language === 'de' ? 'Einzelhandel' : 'Retail' },
                { emoji: '🤝', name: language === 'de' ? 'Vertrieb' : 'Sales' },
                { emoji: '🛡️', name: language === 'de' ? 'Dienstleister' : 'Service Providers' },
                { emoji: '🍕', name: language === 'de' ? 'Gastronomie' : 'Food & Beverage' }
              ].map((industry, index) => (
                <div key={index} className={`${getCardClasses()} text-center rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                  <div className="text-4xl mb-3">{industry.emoji}</div>
                  <h4 className={`font-semibold ${textColors.primary} text-sm`}>{industry.name}</h4>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link 
                to={`${basePath}/solutions/industries`} 
                className="inline-flex items-center px-8 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 transition-colors duration-200"
              >
                {language === 'de' ? 'Alle Branchen anzeigen' : 'View All Industries'}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-600 dark:to-purple-700 text-violet-900 dark:text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {language === 'de' ? 'Bereit für maßgeschneiderte Lösungen?' : 'Ready for Tailored Solutions?'}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {language === 'de' 
                ? 'Entdecken Sie, wie unsere bewährten Lösungen Ihr Unternehmen transformieren können.'
                : 'Discover how our proven solutions can transform your business.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact/booking" 
                className="inline-flex items-center px-8 py-3 bg-violet-600 text-white font-semibold rounded-lg hover:bg-violet-700 dark:bg-white dark:text-violet-600 dark:hover:bg-gray-100 transition-colors duration-200"
              >
                {language === 'de' ? 'Lösungs-Beratung' : 'Solution Consultation'}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </a>
              <a 
                href="/contact" 
                className="inline-flex items-center px-8 py-3 border-2 border-violet-600 text-violet-600 font-semibold rounded-lg hover:bg-violet-600 hover:text-white dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-violet-600 transition-colors duration-200"
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

export default SolutionsOverview