import React from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import SEOHead from '../../components/common/SEOHead'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'
import { 
  CpuChipIcon,
  ChartBarIcon,
  CloudArrowUpIcon,
  CogIcon,
  RocketLaunchIcon,
  AcademicCapIcon,
  ShieldCheckIcon,
  ArrowPathIcon,
  DevicePhoneMobileIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'

const DigitalTransformationPage: React.FC = () => {
  const { language, t } = useLanguage()

  return (
    <>
      <SEOHead
        title={language === 'de' ? 'Digitale Transformation - voltAIc Systems' : 'Digital Transformation - voltAIc Systems'}
        description={language === 'de' 
          ? 'Umfassende digitale Transformation mit SAP Rapid Prototyping, Prozessoptimierung und Change Management für moderne Unternehmen.'
          : 'Comprehensive digital transformation with SAP rapid prototyping, process optimization, and change management for modern enterprises.'
        }
      />

      <div className={`${backgrounds.page}`}>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-violet-900 dark:via-purple-900 dark:to-indigo-900 text-gray-800 dark:text-white overflow-hidden">
          <div className="absolute inset-0 bg-violet-100/20 dark:bg-black/20"></div>
          <div className="relative container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center space-x-2 bg-violet-100/80 dark:bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <RocketLaunchIcon className="h-5 w-5 text-violet-600 dark:text-white" />
                <span className="text-sm font-medium text-violet-700 dark:text-white">
                  {language === 'de' ? 'Innovation durch Digitalisierung' : 'Innovation through Digitalization'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {language === 'de' ? (
                  <>Digitale <span className="text-violet-600 dark:text-violet-400">Transformation</span></>
                ) : (
                  <>Digital <span className="text-violet-600 dark:text-violet-400">Transformation</span></>
                )}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-200 mb-8">
                {language === 'de' 
                  ? 'Förderung von Leistungsfähigkeit, Resilienz und Wettbewerbsfähigkeit durch strategischen Einsatz digitaler Technologien'
                  : 'Promoting performance, resilience, and competitiveness through strategic deployment of digital technologies'
                }
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <div className="flex items-center space-x-2 bg-violet-100/80 dark:bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <CpuChipIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                  <span className="font-medium text-violet-700 dark:text-white">{language === 'de' ? 'SAP Integration' : 'SAP Integration'}</span>
                </div>
                <div className="flex items-center space-x-2 bg-violet-100/80 dark:bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <CloudArrowUpIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <span className="font-medium text-violet-700 dark:text-white">{language === 'de' ? 'Cloud Migration' : 'Cloud Migration'}</span>
                </div>
                <div className="flex items-center space-x-2 bg-violet-100/80 dark:bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
                  <ChartBarIcon className="h-5 w-5 text-violet-600 dark:text-purple-400" />
                  <span className="font-medium text-violet-700 dark:text-white">{language === 'de' ? 'Analytics & KI' : 'Analytics & AI'}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Unsere Transformationsleistungen' : 'Our Transformation Services'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Ganzheitliche Digitalisierung durch strategische Technologie-Integration und Prozessoptimierung'
                  : 'Comprehensive digitalization through strategic technology integration and process optimization'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Scope & Methodology Card */}
              <div className={`${getCardClasses()} rounded-xl shadow-lg hover:shadow-xl duration-300 p-8`}>
                <div className="flex items-center mb-6">
                  <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg mr-4">
                    <CogIcon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className={`text-2xl font-bold ${textColors.primary}`}>
                    {language === 'de' ? 'Umfang & Methodik' : 'Scope & Methodology'}
                  </h3>
                </div>
                <div className={`${textColors.secondary} space-y-4 leading-relaxed`}>
                  <p>
                    {language === 'de' 
                      ? 'Unsere digitale Transformationsreise beginnt mit einer detaillierten Analyse der bestehenden Strukturen, Prozesse und technologischen Landschaften. Wir führen umfassende Bewertungen durch, um Optimierungsmöglichkeiten zu identifizieren.'
                      : 'Our digital transformation journey begins with a thorough analysis of existing structures, processes, and technological landscapes. We conduct comprehensive assessments to identify optimization opportunities.'
                    }
                  </p>
                  <p>
                    {language === 'de' 
                      ? 'Die Prozessdigitalisierung bildet den Grundstein unseres Transformationsansatzes, bei dem wir bestehende Arbeitsabläufe systematisch optimieren und automatisieren.'
                      : 'Process digitization forms the cornerstone of our transformation approach, where we systematically optimize and automate existing workflows.'
                    }
                  </p>
                </div>
              </div>

              {/* Advanced Analytics Card */}
              <div className={`${getCardClasses()} rounded-xl shadow-lg hover:shadow-xl duration-300 p-8`}>
                <div className="flex items-center mb-6">
                  <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg mr-4">
                    <ChartBarIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className={`text-2xl font-bold ${textColors.primary}`}>
                    {language === 'de' ? 'Erweiterte Analytik & Intelligence' : 'Advanced Analytics & Intelligence'}
                  </h3>
                </div>
                <div className={`${textColors.secondary} space-y-4 leading-relaxed`}>
                  <p>
                    {language === 'de' 
                      ? 'Wir implementieren fortschrittliche Analysetools und integrieren Machine Learning-Funktionen, um datengesteuerte Entscheidungsprozesse zu ermöglichen.'
                      : 'We deploy sophisticated analytical tools and integrate Machine Learning capabilities to enable data-driven decision-making processes.'
                    }
                  </p>
                  <p>
                    {language === 'de' 
                      ? 'Unsere Lösungen nutzen Echtzeit- und historische Daten für handlungsorientierte Einblicke und Predictive Analytics.'
                      : 'Our solutions leverage real-time and historical data to provide actionable insights and predictive analytics.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SAP Rapid Prototyping Section */}
        <section className={getSectionClasses()}>
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-full px-6 py-2 mb-6">
                  <CpuChipIcon className="h-5 w-5" />
                  <span className="font-medium">{language === 'de' ? 'Spezialisierte SAP-Lösungen' : 'Specialized SAP Solutions'}</span>
                </div>
                <h2 className={`text-4xl font-bold ${textColors.primary} mb-6`}>
                  SAP Rapid Prototyping
                </h2>
                <p className={`text-xl ${textColors.secondary} mb-8`}>
                  {language === 'de' 
                    ? 'Schließung kritischer Prozesslücken in SAP-Umgebungen durch maßgeschneiderte Rapid-Prototyping-Lösungen'
                    : 'Addressing critical process gaps in SAP environments through tailored rapid prototyping solutions'
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Office Solutions */}
                <div className={`${getCardClasses()} rounded-xl shadow-lg p-6`}>
                  <div className="text-center mb-6">
                    <div className="bg-green-100 dark:bg-green-900 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                      <BuildingOfficeIcon className="h-8 w-8 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className={`text-xl font-bold ${textColors.primary} mb-2`}>
                      {language === 'de' ? 'Büro-Anwendungen' : 'Office Applications'}
                    </h3>
                  </div>
                  <p className={`${textColors.secondary} text-center leading-relaxed`}>
                    {language === 'de' 
                      ? 'Entwicklung maßgeschneiderter Desktop-Anwendungen, die nahtlos in bestehende SAP-Landschaften integrieren und komplexe Geschäftsprozesse vereinfachen.'
                      : 'Development of tailored desktop applications that seamlessly integrate with existing SAP landscapes and simplify complex business processes.'
                    }
                  </p>
                </div>

                {/* Mobile Solutions */}
                <div className={`${getCardClasses()} rounded-xl shadow-lg p-6`}>
                  <div className="text-center mb-6">
                    <div className="bg-orange-100 dark:bg-orange-900 p-4 rounded-full w-16 h-16 mx-auto mb-4">
                      <DevicePhoneMobileIcon className="h-8 w-8 text-orange-600 dark:text-orange-400" />
                    </div>
                    <h3 className={`text-xl font-bold ${textColors.primary} mb-2`}>
                      {language === 'de' ? 'Mobile Lösungen' : 'Mobile Solutions'}
                    </h3>
                  </div>
                  <p className={`${textColors.secondary} text-center leading-relaxed`}>
                    {language === 'de' 
                      ? 'Mobile Anwendungen für Außendienst und Feldoperationen, die kritische SAP-Funktionen unabhängig von Standort und Gerät zugänglich machen.'
                      : 'Mobile applications for field service and operations, making critical SAP functions accessible regardless of location and device.'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Digital Competency Development */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-12">
                <AcademicCapIcon className={`h-16 w-16 ${textColors.primary} mx-auto mb-6`} />
                <h2 className={`text-3xl font-bold ${textColors.primary} mb-6`}>
                  {language === 'de' ? 'Entwicklung digitaler Kompetenzen' : 'Digital Competency Development'}
                </h2>
                <p className={`text-xl ${textColors.secondary} mb-8`}>
                  {language === 'de' 
                    ? 'Nachhaltige digitale Transformation durch kulturellen Wandel und strategische Kompetenzentwicklung'
                    : 'Sustainable digital transformation through cultural change and strategic competency development'
                  }
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`${getCardClasses()} rounded-lg p-6`}>
                  <ArrowPathIcon className={`h-8 w-8 ${textColors.primary} mx-auto mb-4`} />
                  <h4 className={`font-bold ${textColors.primary} mb-2`}>
                    {language === 'de' ? 'Change Management' : 'Change Management'}
                  </h4>
                  <p className={`${textColors.secondary} text-sm`}>
                    {language === 'de' 
                      ? 'Strukturierte Begleitung organisatorischer Veränderungen'
                      : 'Structured guidance for organizational changes'
                    }
                  </p>
                </div>

                <div className={`${getCardClasses()} rounded-lg p-6`}>
                  <AcademicCapIcon className={`h-8 w-8 ${textColors.primary} mx-auto mb-4`} />
                  <h4 className={`font-bold ${textColors.primary} mb-2`}>
                    {language === 'de' ? 'Schulungsprogramme' : 'Training Programs'}
                  </h4>
                  <p className={`${textColors.secondary} text-sm`}>
                    {language === 'de' 
                      ? 'Umfassende Weiterbildung für digitale Technologien'
                      : 'Comprehensive education for digital technologies'
                    }
                  </p>
                </div>

                <div className={`${getCardClasses()} rounded-lg p-6`}>
                  <ShieldCheckIcon className={`h-8 w-8 ${textColors.primary} mx-auto mb-4`} />
                  <h4 className={`font-bold ${textColors.primary} mb-2`}>
                    {language === 'de' ? 'Kontinuierliche Unterstützung' : 'Ongoing Support'}
                  </h4>
                  <p className={`${textColors.secondary} text-sm`}>
                    {language === 'de' 
                      ? 'Langfristige Begleitung des Transformationsprozesses'
                      : 'Long-term guidance throughout transformation'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-20 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-600 dark:to-purple-700">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold text-violet-900 dark:text-white mb-6">
              {language === 'de' ? 'Bereit für Ihre digitale Transformation?' : 'Ready for Your Digital Transformation?'}
            </h2>
            <p className="text-xl text-violet-700 dark:text-violet-100 mb-8 max-w-2xl mx-auto">
              {language === 'de' 
                ? 'Lassen Sie uns gemeinsam Ihre Unternehmensprozesse modernisieren und Ihre Wettbewerbsfähigkeit stärken.'
                : 'Let us work together to modernize your business processes and strengthen your competitive advantage.'
              }
            </p>
            <button className="bg-violet-600 text-white font-bold py-4 px-8 rounded-lg hover:bg-violet-700 dark:bg-white dark:text-violet-600 dark:hover:bg-gray-100 transition duration-300 shadow-lg">
              {language === 'de' ? 'Beratungstermin vereinbaren' : 'Schedule Consultation'}
            </button>
          </div>
        </section>
      </div>
    </>
  )
}

export default DigitalTransformationPage