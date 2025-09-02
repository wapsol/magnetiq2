import React from 'react'
import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import SEOHead from '../../components/common/SEOHead'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'
import { 
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  LifebuoyIcon,
  MapPinIcon,
  ArrowRightIcon,
  PhoneIcon,
  EnvelopeIcon,
  ClockIcon,
  UserGroupIcon,
  GlobeAltIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

const ContactOverview = () => {
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''

  const contactOptions = [
    {
      title: language === 'en' ? 'Book Consultation' : 'Beratung buchen',
      path: `${basePath}/contact/booking`,
      icon: CalendarIcon,
      description: language === 'en' 
        ? 'Schedule a personalized consultation with our AI experts to discuss your specific needs and challenges.'
        : 'Vereinbaren Sie eine persönliche Beratung mit unseren KI-Experten, um Ihre spezifischen Bedürfnisse und Herausforderungen zu besprechen.',
      color: 'blue',
      features: language === 'en'
        ? ['1-on-1 Expert Session', 'Custom Solution Planning', 'ROI Assessment', 'Implementation Roadmap']
        : ['1-zu-1 Experten-Sitzung', 'Maßgeschneiderte Lösungsplanung', 'ROI-Bewertung', 'Implementierungs-Roadmap']
    },
    {
      title: language === 'en' ? 'General Inquiries' : 'Allgemeine Anfragen',
      path: `${basePath}/contact/general`,
      icon: ChatBubbleLeftRightIcon,
      description: language === 'en'
        ? 'Get answers to general questions about our services, partnerships, or company information.'
        : 'Erhalten Sie Antworten auf allgemeine Fragen zu unseren Dienstleistungen, Partnerschaften oder Unternehmensinformationen.',
      color: 'green',
      features: language === 'en'
        ? ['Partnership Opportunities', 'Service Information', 'Company Details', 'Media Inquiries']
        : ['Partnerschaftsmöglichkeiten', 'Service-Informationen', 'Unternehmensdetails', 'Medienanfragen']
    },
    {
      title: language === 'en' ? 'Technical Support' : 'Technischer Support',
      path: `${basePath}/contact/support`,
      icon: LifebuoyIcon,
      description: language === 'en'
        ? 'Get professional technical assistance and support for your existing AI solutions and implementations.'
        : 'Erhalten Sie professionelle technische Unterstützung für Ihre bestehenden KI-Lösungen und Implementierungen.',
      color: 'orange',
      features: language === 'en'
        ? ['24/7 Priority Support', 'Technical Documentation', 'Solution Troubleshooting', 'Performance Optimization']
        : ['24/7 Prioritäts-Support', 'Technische Dokumentation', 'Lösungs-Fehlerbehebung', 'Performance-Optimierung']
    },
    {
      title: language === 'en' ? 'Office Locations' : 'Bürostandorte',
      path: `${basePath}/contact/locations`,
      icon: MapPinIcon,
      description: language === 'en'
        ? 'Find our global office locations and visit us for in-person meetings and consultations.'
        : 'Finden Sie unsere globalen Bürostandorte und besuchen Sie uns für persönliche Termine und Beratungen.',
      color: 'purple',
      features: language === 'en'
        ? ['Global Presence', 'Local Support', 'In-Person Meetings', 'Regional Expertise']
        : ['Globale Präsenz', 'Lokaler Support', 'Persönliche Termine', 'Regionale Expertise']
    }
  ]

  const quickContact = [
    {
      type: language === 'en' ? 'Phone' : 'Telefon',
      value: '+49 (0) 30 1234 5678',
      icon: PhoneIcon,
      href: 'tel:+4930123456780'
    },
    {
      type: language === 'en' ? 'Email' : 'E-Mail',
      value: 'contact@voltaic.systems',
      icon: EnvelopeIcon,
      href: 'mailto:contact@voltaic.systems'
    },
    {
      type: language === 'en' ? 'Response Time' : 'Antwortzeit',
      value: language === 'en' ? 'Within 24 hours' : 'Innerhalb von 24 Stunden',
      icon: ClockIcon,
      href: null
    }
  ]

  const supportFeatures = [
    {
      icon: <UserGroupIcon className="h-6 w-6" />,
      title: {
        en: 'Expert Team',
        de: 'Experten-Team'
      },
      description: {
        en: 'Direct access to senior AI consultants and technical specialists',
        de: 'Direkter Zugang zu Senior KI-Beratern und technischen Spezialisten'
      }
    },
    {
      icon: <GlobeAltIcon className="h-6 w-6" />,
      title: {
        en: 'Global Coverage',
        de: 'Globale Abdeckung'
      },
      description: {
        en: 'Worldwide support with local expertise and understanding',
        de: 'Weltweiter Support mit lokaler Expertise und Verständnis'
      }
    },
    {
      icon: <CheckCircleIcon className="h-6 w-6" />,
      title: {
        en: 'Proven Results',
        de: 'Bewiesene Ergebnisse'
      },
      description: {
        en: '150+ successful projects across various industries and use cases',
        de: '150+ erfolgreiche Projekte in verschiedenen Branchen und Anwendungsfällen'
      }
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-800/30',
      green: 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 group-hover:bg-green-100 dark:group-hover:bg-green-800/30',
      orange: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 group-hover:bg-orange-100 dark:group-hover:bg-orange-800/30',
      purple: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-100 dark:group-hover:bg-purple-800/30'
    }
    return colorMap[color] || colorMap.blue
  }

  return (
    <>
      <SEOHead
        title={language === 'de' ? 'Kontakt - voltAIc Systems' : 'Contact - voltAIc Systems'}
        description={language === 'de' 
          ? 'Kontaktieren Sie voltAIc Systems für KI-Beratung, technischen Support oder allgemeine Anfragen. Unser Expertenteam steht Ihnen zur Verfügung.'
          : 'Contact voltAIc Systems for AI consultation, technical support, or general inquiries. Our expert team is here to help.'
        }
      />

      <div className={backgrounds.page}>
        {/* Hero Section */}
        <section className="relative py-20 bg-gradient-to-br from-teal-900 via-green-900 to-blue-900 text-white overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
                <ChatBubbleLeftRightIcon className="h-5 w-5" />
                <span className="text-sm font-medium">
                  {language === 'de' ? 'Wir sind für Sie da' : 'We\'re Here to Help'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {language === 'de' ? (
                  <>Kontakt <span className="text-teal-400">aufnehmen</span></>
                ) : (
                  <>Get in <span className="text-teal-400">Touch</span></>
                )}
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-200 mb-12">
                {language === 'de' 
                  ? 'Bereit, Ihr nächstes KI-Projekt zu starten? Unser Expertenteam steht Ihnen für Beratung, Support und Partnerschaften zur Verfügung.'
                  : 'Ready to start your next AI project? Our expert team is available for consultation, support, and partnerships.'
                }
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {quickContact.map((contact, index) => (
                  <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center justify-center mb-2">
                      <contact.icon className="h-6 w-6 text-teal-400" />
                    </div>
                    <div className="text-sm font-medium mb-1">{contact.type}</div>
                    {contact.href ? (
                      <a href={contact.href} className="text-sm text-gray-300 hover:text-white transition-colors">
                        {contact.value}
                      </a>
                    ) : (
                      <div className="text-sm text-gray-300">{contact.value}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Options */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Wie können wir Ihnen helfen?' : 'How Can We Help You?'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Wählen Sie die passende Kontaktmöglichkeit für Ihr Anliegen und erhalten Sie professionelle Unterstützung'
                  : 'Choose the right contact option for your needs and receive professional support'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {contactOptions.map((option, index) => (
                <Link
                  key={option.path}
                  to={option.path}
                  className={`${getCardClasses()} group rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:border-teal-200 dark:hover:border-teal-600 block`}
                >
                  <div className="flex items-start space-x-4 mb-6">
                    <div className={`flex-shrink-0 p-4 rounded-lg transition-colors duration-300 ${getColorClasses(option.color)}`}>
                      <option.icon className="h-8 w-8" />
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-xl font-bold ${textColors.primary} group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors duration-300 mb-3`}>
                        {option.title}
                      </h3>
                      <p className={`${textColors.secondary} leading-relaxed mb-4`}>
                        {option.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <h4 className={`font-semibold ${textColors.primary} mb-3 text-sm uppercase tracking-wide`}>
                      {language === 'de' ? 'Inklusive:' : 'Includes:'}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {option.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 bg-teal-400 rounded-full flex-shrink-0"></div>
                          <span className="text-sm text-gray-600 dark:text-gray-400">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                    <span className={`text-sm font-medium ${textColors.secondary}`}>
                      {language === 'de' ? 'Jetzt kontaktieren' : 'Contact Now'}
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Support Features */}
        <section className={getSectionClasses()}>
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Warum voltAIc kontaktieren?' : 'Why Contact voltAIc?'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Unser Engagement für Exzellenz zeigt sich in jedem Kundengespräch und jeder Lösung, die wir liefern'
                  : 'Our commitment to excellence shows in every customer interaction and solution we deliver'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {supportFeatures.map((feature, index) => (
                <div key={index} className={`${getCardClasses()} text-center rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                  <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="text-teal-600 dark:text-teal-400">{feature.icon}</div>
                  </div>
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

        {/* Emergency Contact */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="text-center">
              <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-8 max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <LifebuoyIcon className="h-12 w-12 text-red-600 dark:text-red-400" />
                </div>
                <h3 className={`text-2xl font-bold ${textColors.primary} mb-4`}>
                  {language === 'de' ? 'Notfall-Support' : 'Emergency Support'}
                </h3>
                <p className={`${textColors.secondary} mb-6`}>
                  {language === 'de' 
                    ? 'Bei kritischen Systemausfällen oder dringenden technischen Problemen erreichen Sie unseren 24/7-Notfall-Support:'
                    : 'For critical system failures or urgent technical issues, reach our 24/7 emergency support:'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="tel:+4930123456789"
                    className="inline-flex items-center px-6 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors duration-200"
                  >
                    <PhoneIcon className="mr-2 h-4 w-4" />
                    +49 (0) 30 1234 5679
                  </a>
                  <a
                    href="mailto:emergency@voltaic.systems"
                    className="inline-flex items-center px-6 py-3 border-2 border-red-600 text-red-600 dark:text-red-400 font-semibold rounded-lg hover:bg-red-600 hover:text-white transition-colors duration-200"
                  >
                    <EnvelopeIcon className="mr-2 h-4 w-4" />
                    emergency@voltaic.systems
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default ContactOverview