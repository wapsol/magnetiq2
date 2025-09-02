import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import SEOHead from '../../components/common/SEOHead'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'
import { 
  CpuChipIcon, 
  ArrowPathIcon, 
  CogIcon, 
  CodeBracketIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  BoltIcon
} from '@heroicons/react/24/outline'

const ServicesOverview = () => {
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''

  const services = [
    {
      title: language === 'en' ? 'AI Consulting' : 'KI-Beratung',
      path: `${basePath}/services/ai-consulting`,
      icon: CpuChipIcon,
      description: language === 'en' 
        ? 'Strategic AI implementation with proven 6-stage roadmap for sustainable digital transformation and comprehensive training programs.'
        : 'Strategische KI-Implementierung mit bewährter 6-Stufen-Roadmap für nachhaltige digitale Transformation und umfassende Schulungsprogramme.',
      features: language === 'en'
        ? ['6-Stage Implementation', 'Vendor-Neutral Approach', 'IT & Business Training', 'Holistic Integration']
        : ['6-Stufen-Implementierung', 'Herstellerneutraler Ansatz', 'IT & Business Schulungen', 'Ganzheitliche Integration'],
      color: 'blue'
    },
    {
      title: language === 'en' ? 'Digital Transformation' : 'Digitale Transformation',
      path: `${basePath}/services/digital-transformation`,
      icon: ArrowPathIcon,
      description: language === 'en'
        ? 'Comprehensive digitalization through strategic technology integration, SAP rapid prototyping, and process optimization.'
        : 'Umfassende Digitalisierung durch strategische Technologie-Integration, SAP Rapid Prototyping und Prozessoptimierung.',
      features: language === 'en'
        ? ['SAP Integration', 'Cloud Migration', 'Process Digitization', 'Advanced Analytics']
        : ['SAP Integration', 'Cloud Migration', 'Prozessdigitalisierung', 'Erweiterte Analytik'],
      color: 'purple'
    },
    {
      title: language === 'en' ? 'Automation Solutions' : 'Automatisierungslösungen',
      path: `${basePath}/services/automation`,
      icon: CogIcon,
      description: language === 'en'
        ? 'Intelligent process automation with RPA, workflow optimization, and autonomous system integration for enhanced efficiency.'
        : 'Intelligente Prozessautomatisierung mit RPA, Workflow-Optimierung und autonomer Systemintegration für erhöhte Effizienz.',
      features: language === 'en'
        ? ['Robotic Process Automation', 'Workflow Optimization', 'AI-Driven Automation', 'System Integration']
        : ['Robotic Process Automation', 'Workflow-Optimierung', 'KI-gesteuerte Automatisierung', 'Systemintegration'],
      color: 'green'
    },
    {
      title: language === 'en' ? 'Custom Development' : 'Individuelle Entwicklung',
      path: `${basePath}/services/development`,
      icon: CodeBracketIcon,
      description: language === 'en'
        ? 'Custom AI/ML solutions, semantic data management, and enterprise application development tailored to your specific needs.'
        : 'Maßgeschneiderte KI/ML-Lösungen, semantisches Datenmanagement und Enterprise-Anwendungsentwicklung für Ihre spezifischen Anforderungen.',
      features: language === 'en'
        ? ['AI/ML Development', 'Semantic Data Management', 'Enterprise Applications', 'Custom Integrations']
        : ['KI/ML-Entwicklung', 'Semantisches Datenmanagement', 'Enterprise-Anwendungen', 'Maßgeschneiderte Integrationen'],
      color: 'orange'
    },
    {
      title: language === 'en' ? 'Management Advisory' : 'Management-Beratung',
      path: `${basePath}/services/management-advisory`,
      icon: UserGroupIcon,
      description: language === 'en'
        ? 'Strategic IT consulting and transformation with 20+ years of experience. Specialized in change management and project rescue.'
        : 'Strategische IT-Beratung und Transformation mit über 20 Jahren Erfahrung. Spezialisiert auf Change Management und Projektrettung.',
      features: language === 'en'
        ? ['20+ Years Experience', 'Change Management', 'Project Rescue', 'IT Strategy']
        : ['20+ Jahre Erfahrung', 'Change Management', 'Projektrettung', 'IT-Strategie'],
      color: 'indigo'
    }
  ]

  const stats = [
    { 
      label: language === 'en' ? 'Successful Projects' : 'Erfolgreiche Projekte', 
      value: '150+' 
    },
    { 
      label: language === 'en' ? 'Enterprise Clients' : 'Enterprise-Kunden', 
      value: '50+' 
    },
    { 
      label: language === 'en' ? 'Years of Experience' : 'Jahre Erfahrung', 
      value: '20+' 
    },
    { 
      label: language === 'en' ? 'AI Solutions Deployed' : 'Eingesetzte KI-Lösungen', 
      value: '100+' 
    }
  ]

  const keyBenefits = [
    {
      icon: <CheckCircleIcon className="h-6 w-6" />,
      title: language === 'en' ? 'Proven Methodologies' : 'Bewährte Methoden',
      description: language === 'en'
        ? 'Time-tested approaches with measurable results and clear milestones'
        : 'Zeitgeprüfte Ansätze mit messbaren Ergebnissen und klaren Meilensteinen'
    },
    {
      icon: <BoltIcon className="h-6 w-6" />,
      title: language === 'en' ? 'Rapid Implementation' : 'Schnelle Umsetzung',
      description: language === 'en'
        ? 'Accelerated deployment with minimal disruption to business operations'
        : 'Beschleunigte Implementierung mit minimalen Geschäftsunterbrechungen'
    },
    {
      icon: <ChartBarIcon className="h-6 w-6" />,
      title: language === 'en' ? 'Scalable Solutions' : 'Skalierbare Lösungen',
      description: language === 'en'
        ? 'Enterprise-grade solutions that grow with your business needs'
        : 'Enterprise-taugliche Lösungen, die mit Ihren Geschäftsanforderungen wachsen'
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-800/30',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-800/30',
      orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-800/30',
      indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800/30'
    }
    return colorMap[color] || colorMap.blue
  }

  return (
    <>
      <SEOHead
        title={language === 'de' ? 'Dienstleistungen - voltAIc Systems' : 'Services - voltAIc Systems'}
        description={language === 'de' 
          ? 'Umfassende KI- und Digitalisierungslösungen: KI-Beratung, digitale Transformation, Automatisierung, Entwicklung und Management-Beratung.'
          : 'Comprehensive AI and digitalization solutions: AI consulting, digital transformation, automation, development, and management advisory.'
        }
      />

      <div className={backgrounds.page}>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <CogIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {language === 'de' ? 'Vollständige Dienstleistungspalette' : 'Complete Service Portfolio'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {language === 'de' ? (
                  <>Unsere <span className="text-blue-400">Dienstleistungen</span></>
                ) : (
                  <>Our <span className="text-blue-400">Services</span></>
                )}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 mb-8">
                {language === 'de' 
                  ? 'Von strategischer KI-Beratung bis zur vollständigen digitalen Transformation - wir begleiten Sie auf Ihrem Weg zur Digitalisierung'
                  : 'From strategic AI consulting to complete digital transformation - we guide you on your digitalization journey'
                }
              </p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="text-2xl md:text-3xl font-bold text-blue-400">{stat.value}</div>
                    <div className="text-sm text-gray-300">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Services Grid */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Unser Service-Portfolio' : 'Our Service Portfolio'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Maßgeschneiderte Lösungen für jede Phase Ihrer digitalen Transformation'
                  : 'Tailored solutions for every phase of your digital transformation'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {services.map((service, index) => (
                <Link
                  key={service.path}
                  to={service.path}
                  className={`${getCardClasses()} group rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600`}
                >
                  <div className="flex items-start space-x-4 mb-6">
                    <div className={`flex-shrink-0 p-4 rounded-lg transition-colors duration-300 ${getColorClasses(service.color)}`}>
                      <service.icon className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold mb-3 ${textColors.primary} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300`}>
                        {service.title}
                      </h3>
                      <p className={`${textColors.secondary} leading-relaxed mb-4`}>
                        {service.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className={`font-semibold ${textColors.primary} mb-3 text-sm uppercase tracking-wide`}>
                      {language === 'de' ? 'Hauptmerkmale:' : 'Key Features:'}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {service.features.map((feature, featureIndex) => (
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

        {/* Key Benefits Section */}
        <section className={getSectionClasses()}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Warum voltAIc Systems?' : 'Why voltAIc Systems?'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Unsere bewährten Ansätze und langjährige Erfahrung garantieren Ihren Erfolg'
                  : 'Our proven approaches and years of experience guarantee your success'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {keyBenefits.map((benefit, index) => (
                <div key={index} className={`${getCardClasses()} text-center rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                  <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="text-blue-600 dark:text-blue-400">{benefit.icon}</div>
                  </div>
                  <h3 className={`text-xl font-bold ${textColors.primary} mb-4`}>
                    {benefit.title}
                  </h3>
                  <p className={`${textColors.secondary} leading-relaxed`}>
                    {benefit.description}
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
              {language === 'de' ? 'Bereit für Ihre digitale Transformation?' : 'Ready for Your Digital Transformation?'}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {language === 'de' 
                ? 'Lassen Sie uns gemeinsam den besten Ansatz für Ihr Unternehmen finden und Ihre digitale Zukunft gestalten.'
                : 'Let us work together to find the best approach for your company and shape your digital future.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact/booking" 
                className="inline-flex items-center px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {language === 'de' ? 'Beratung vereinbaren' : 'Schedule Consultation'}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
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

export default ServicesOverview