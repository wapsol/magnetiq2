import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import SEOHead from '../../components/common/SEOHead'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'
import { 
  BookOpenIcon,
  UserGroupIcon,
  SparklesIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  NewspaperIcon,
  ArrowRightIcon,
  RocketLaunchIcon,
  HeartIcon,
  CpuChipIcon,
  GlobeAltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const AboutOverview = () => {
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''

  const sections = [
    {
      title: language === 'en' ? 'Our Story' : 'Unsere Geschichte',
      path: `${basePath}/about/story`,
      icon: BookOpenIcon,
      description: language === 'en' 
        ? 'Discover our journey from vision to innovation in AI and data transformation.'
        : 'Entdecken Sie unsere Reise von der Vision zur Innovation in KI und Datentransformation.',
      color: 'blue'
    },
    {
      title: language === 'en' ? 'Our Team' : 'Unser Team',
      path: `${basePath}/about/team`,
      icon: UserGroupIcon,
      description: language === 'en'
        ? 'Meet the experts driving AI innovation and delivering exceptional results for our clients.'
        : 'Lernen Sie die Experten kennen, die KI-Innovation vorantreiben und außergewöhnliche Ergebnisse für unsere Kunden liefern.',
      color: 'green'
    },
    {
      title: language === 'en' ? 'Mission & Vision' : 'Mission & Vision',
      path: `${basePath}/about/mission`,
      icon: SparklesIcon,
      description: language === 'en'
        ? 'Our commitment to making AI accessible, ethical, and transformative for businesses worldwide.'
        : 'Unser Engagement, KI zugänglich, ethisch und transformativ für Unternehmen weltweit zu machen.',
      color: 'purple'
    },
    {
      title: language === 'en' ? 'Careers' : 'Karrieren',
      path: `${basePath}/about/careers`,
      icon: BriefcaseIcon,
      description: language === 'en'
        ? 'Join our team and shape the future of AI technology in a collaborative, innovative environment.'
        : 'Werden Sie Teil unseres Teams und gestalten Sie die Zukunft der KI-Technologie in einer kollaborativen, innovativen Umgebung.',
      color: 'orange'
    },
    {
      title: language === 'en' ? 'Technology Partners' : 'Technologie-Partner',
      path: `${basePath}/about/partners`,
      icon: BuildingOffice2Icon,
      description: language === 'en'
        ? 'Strategic partnerships with industry leaders to deliver cutting-edge AI solutions.'
        : 'Strategische Partnerschaften mit Branchenführern zur Bereitstellung modernster KI-Lösungen.',
      color: 'indigo'
    },
    {
      title: language === 'en' ? 'News & Press' : 'Nachrichten & Presse',
      path: `${basePath}/about/news`,
      icon: NewspaperIcon,
      description: language === 'en'
        ? 'Latest company news, press releases, and industry recognition.'
        : 'Neueste Unternehmensnachrichten, Pressemitteilungen und Branchenanerkennung.',
      color: 'red'
    }
  ]

  const companyValues = [
    {
      icon: <CpuChipIcon className="h-6 w-6" />,
      title: {
        en: 'Innovation First',
        de: 'Innovation an erster Stelle'
      },
      description: {
        en: 'Pushing the boundaries of what\'s possible with AI technology',
        de: 'Die Grenzen des mit KI-Technologie Möglichen erweitern'
      }
    },
    {
      icon: <HeartIcon className="h-6 w-6" />,
      title: {
        en: 'Human-Centric',
        de: 'Menschenzentriert'
      },
      description: {
        en: 'Technology that empowers people and enhances human capabilities',
        de: 'Technologie, die Menschen stärkt und menschliche Fähigkeiten erweitert'
      }
    },
    {
      icon: <CheckCircleIcon className="h-6 w-6" />,
      title: {
        en: 'Excellence',
        de: 'Exzellenz'
      },
      description: {
        en: 'Delivering exceptional quality in every project and interaction',
        de: 'Außergewöhnliche Qualität in jedem Projekt und jeder Interaktion liefern'
      }
    },
    {
      icon: <GlobeAltIcon className="h-6 w-6" />,
      title: {
        en: 'Global Impact',
        de: 'Globale Wirkung'
      },
      description: {
        en: 'Creating solutions that make a positive difference worldwide',
        de: 'Lösungen schaffen, die weltweit einen positiven Unterschied machen'
      }
    }
  ]

  const stats = [
    { 
      label: language === 'en' ? 'Years of Experience' : 'Jahre Erfahrung', 
      value: '20+' 
    },
    { 
      label: language === 'en' ? 'Expert Team Members' : 'Experten-Teammitglieder', 
      value: '25+' 
    },
    { 
      label: language === 'en' ? 'Successful Projects' : 'Erfolgreiche Projekte', 
      value: '150+' 
    },
    { 
      label: language === 'en' ? 'Global Clients' : 'Globale Kunden', 
      value: '50+' 
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-800/30',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-800/30',
      orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-800/30',
      indigo: 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 group-hover:bg-indigo-100 dark:group-hover:bg-indigo-800/30',
      red: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 group-hover:bg-red-100 dark:group-hover:bg-red-800/30'
    }
    return colorMap[color] || colorMap.blue
  }

  return (
    <>
      <SEOHead
        title={language === 'de' ? 'Über uns - voltAIc Systems' : 'About Us - voltAIc Systems'}
        description={language === 'de' 
          ? 'Erfahren Sie mehr über voltAIc Systems - unser Team, unsere Mission und unsere Vision für die Zukunft der KI-Technologie.'
          : 'Learn more about voltAIc Systems - our team, mission, and vision for the future of AI technology.'
        }
      />

      <div className={backgrounds.page}>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-indigo-900 via-purple-900 to-blue-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <RocketLaunchIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {language === 'de' ? 'Seit 2020 in der KI-Innovation führend' : 'Leading AI Innovation Since 2020'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {language === 'de' ? (
                  <>Über <span className="text-blue-400">voltAIc</span></>
                ) : (
                  <>About <span className="text-blue-400">voltAIc</span></>
                )}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 mb-12">
                {language === 'de' 
                  ? 'Ihr Partner für KI-Innovation und digitale Transformation - mit über 20 Jahren Erfahrung in der Entwicklung intelligenter Lösungen'
                  : 'Your partner for AI innovation and digital transformation - with over 20 years of experience in developing intelligent solutions'
                }
              </p>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
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

        {/* Company Values */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Unsere Werte' : 'Our Values'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Die Grundprinzipien, die unser Handeln leiten und unsere Innovationen vorantreiben'
                  : 'The core principles that guide our actions and drive our innovations'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {companyValues.map((value, index) => (
                <div key={index} className={`${getCardClasses()} text-center rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}>
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="text-indigo-600 dark:text-indigo-400">{value.icon}</div>
                  </div>
                  <h3 className={`text-lg font-bold ${textColors.primary} mb-3`}>
                    {value.title[language]}
                  </h3>
                  <p className={`${textColors.secondary} text-sm leading-relaxed`}>
                    {value.description[language]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Sections Navigation */}
        <section className={getSectionClasses()}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Erfahren Sie mehr über uns' : 'Learn More About Us'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Entdecken Sie alle Aspekte unseres Unternehmens - von unserer Geschichte bis zu unseren Zukunftsplänen'
                  : 'Discover all aspects of our company - from our history to our future plans'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {sections.map((section, index) => (
                <Link
                  key={section.path}
                  to={section.path}
                  className={`${getCardClasses()} group rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 block`}
                >
                  <div className="mb-6">
                    <div className={`flex-shrink-0 p-4 rounded-lg transition-colors duration-300 ${getColorClasses(section.color)} mb-4 inline-block`}>
                      <section.icon className="h-8 w-8" />
                    </div>
                    <h3 className={`text-xl font-bold ${textColors.primary} group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 mb-3`}>
                      {section.title}
                    </h3>
                    <p className={`${textColors.secondary} leading-relaxed`}>
                      {section.description}
                    </p>
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

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl font-bold mb-4">
              {language === 'de' ? 'Bereit für eine Partnerschaft?' : 'Ready to Partner With Us?'}
            </h2>
            <p className="text-xl mb-8 max-w-2xl mx-auto">
              {language === 'de' 
                ? 'Lassen Sie uns gemeinsam die Zukunft Ihres Unternehmens mit innovativen KI-Lösungen gestalten.'
                : 'Let us work together to shape the future of your business with innovative AI solutions.'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/contact/booking" 
                className="inline-flex items-center px-8 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
              >
                {language === 'de' ? 'Gespräch vereinbaren' : 'Schedule a Meeting'}
                <ArrowRightIcon className="ml-2 h-4 w-4" />
              </a>
              <a 
                href="/contact" 
                className="inline-flex items-center px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-indigo-600 transition-colors duration-200"
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

export default AboutOverview