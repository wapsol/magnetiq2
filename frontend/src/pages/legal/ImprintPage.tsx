import React from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import SEOHead from '../../components/common/SEOHead'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'
import {
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  IdentificationIcon,
  ScaleIcon,
  ShieldCheckIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

const ImprintPage = () => {
  const { language } = useLanguage()

  const companyInfo = {
    name: 'Wapsol GmbH',
    brand: 'voltAIc Systems',
    business: language === 'en'
      ? 'Managing the voltAIc Systems brand - AI Data Intelligence Solutions'
      : 'Verwaltet die voltAIc Systems Marke - KI-Datenintelligentz-Lösungen',
    address: {
      street: 'Industriestraße 24b',
      postalCode: '70565',
      city: 'Stuttgart',
      country: language === 'en' ? 'Germany' : 'Deutschland'
    },
    contact: {
      phone: '+49 711 7947 2394',
      fax: '+49 711 8998 9571',
      email: 'datadriven@voltaic.systems',
      website: 'https://voltaic.systems'
    },
    legal: {
      managingDirector: 'Ashant Chalasani',
      registrationCourt: language === 'en' ? 'District Court Stuttgart' : 'Amtsgericht Stuttgart',
      registrationNumber: 'HRB 22736',
      vatId: 'DE215101721'
    }
  }

  const legalSections = [
    {
      icon: <BuildingOfficeIcon className="h-6 w-6" />,
      title: language === 'en' ? 'Company Information' : 'Firmeninformationen',
      content: (
        <div className="space-y-2">
          <p className="font-semibold text-lg">{companyInfo.name}</p>
          <p className={`${textColors.secondary}`}>{companyInfo.business}</p>
          <div className="mt-4">
            <p>{companyInfo.address.street}</p>
            <p>{companyInfo.address.postalCode} {companyInfo.address.city}, {companyInfo.address.country}</p>
          </div>
        </div>
      )
    },
    {
      icon: <PhoneIcon className="h-6 w-6" />,
      title: language === 'en' ? 'Contact Information' : 'Kontaktinformationen',
      content: (
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <PhoneIcon className="h-4 w-4 text-gray-500" />
            <a href={`tel:${companyInfo.contact.phone}`} className="text-blue-600 hover:text-blue-700">
              {companyInfo.contact.phone}
            </a>
          </div>
          <div className="flex items-center space-x-3">
            <EnvelopeIcon className="h-4 w-4 text-gray-500" />
            <a href={`mailto:${companyInfo.contact.email}`} className="text-blue-600 hover:text-blue-700">
              {companyInfo.contact.email}
            </a>
          </div>
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-4 w-4 text-gray-500" />
            <a href={companyInfo.contact.website} className="text-blue-600 hover:text-blue-700" target="_blank" rel="noopener noreferrer">
              {companyInfo.contact.website}
            </a>
          </div>
        </div>
      )
    },
    {
      icon: <ScaleIcon className="h-6 w-6" />,
      title: language === 'en' ? 'Registry Court' : 'Handelsregister',
      content: (
        <div className="space-y-2">
          <p>
            <span className={`${textColors.secondary}`}>
              {language === 'en' ? 'District Court:' : 'Amtsgericht:'}
            </span>
            <span className="ml-2">{companyInfo.legal.registrationCourt}</span>
          </p>
          <p>
            <span className={`${textColors.secondary}`}>
              {language === 'en' ? 'Registration Number:' : 'Handelsregisternummer:'}
            </span>
            <span className="ml-2">{companyInfo.legal.registrationNumber}</span>
          </p>
          <p>
            <span className={`${textColors.secondary}`}>
              {language === 'en' ? 'VAT ID:' : 'Umsatzsteuer-ID:'}
            </span>
            <span className="ml-2">{companyInfo.legal.vatId}</span>
          </p>
        </div>
      )
    },
    {
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      title: language === 'en' ? 'Responsible for Content' : 'Verantwortlich für den Inhalt',
      content: (
        <div>
          <p className={`${textColors.secondary} mb-2`}>
            {language === 'en' ? 'According to § 55 Abs. 2 RStV:' : 'Nach § 55 Abs. 2 RStV:'}
          </p>
          <div className="space-y-1">
            <p className="font-medium">Pascal Köth</p>
            <p className="font-medium">Ashant Chalasani</p>
          </div>
        </div>
      )
    }
  ]

  return (
    <>
      <SEOHead
        title={language === 'de' ? 'Impressum - voltAIc Systems' : 'Imprint - voltAIc Systems'}
        description={language === 'de'
          ? 'Rechtliche Informationen und Impressum der Wapsol GmbH, die die voltAIc Systems Marke verwaltet - Ihr Partner für KI-Datenintelligentz-Lösungen.'
          : 'Legal information and imprint of Wapsol GmbH, managing the voltAIc Systems brand - your partner for AI data intelligence solutions.'
        }
      />

      <div className={`${backgrounds.page}`}>
        {/* Header */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 mb-8">
                <ScaleIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {language === 'de' ? 'Rechtliche Informationen' : 'Legal Information'}
                </span>
              </div>
              
              <h1 className={`text-4xl md:text-5xl font-bold ${textColors.primary} mb-6`}>
                {language === 'en' ? 'Legal Imprint' : 'Impressum'}
              </h1>
              
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de'
                  ? 'Rechtliche Angaben gemäß § 5 TMG und weitere gesetzliche Informationen der Wapsol GmbH, die die voltAIc Systems Marke verwaltet.'
                  : 'Legal information according to German law and statutory details of Wapsol GmbH, managing the voltAIc Systems brand.'
                }
              </p>
            </div>
          </div>
        </section>

        {/* Legal Information Sections */}
        <section className={getSectionClasses()}>
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {legalSections.map((section, index) => (
                  <div key={index} className={`${getCardClasses()} rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300`}>
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="flex-shrink-0 p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-600 dark:text-gray-400">
                        {section.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-lg font-bold ${textColors.primary} mb-4`}>
                          {section.title}
                        </h3>
                        <div className={`${textColors.secondary}`}>
                          {section.content}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Additional Legal Sections */}
        <section className={getSectionClasses('alt')}>
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto">
              <div className={`${getCardClasses()} rounded-xl shadow-lg`}>
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {language === 'en' ? (
                    <>
                      <h2 className={`text-2xl font-bold ${textColors.primary} mb-4 flex items-center`}>
                        <ShieldCheckIcon className="h-6 w-6 mr-3" />
                        Disclaimer
                      </h2>
                      <p className={`${textColors.secondary}`}>
                        Despite careful content control, we assume no liability for the content of external links. 
                        The operators of the linked pages are exclusively responsible for their content.
                      </p>

                      <h2 className={`text-2xl font-bold ${textColors.primary} mb-4 mt-8 flex items-center`}>
                        <DocumentTextIcon className="h-6 w-6 mr-3" />
                        Privacy Policy
                      </h2>
                      <p className={`${textColors.secondary}`}>
                        The use of our website is generally possible without providing personal data. 
                        Where personal data is collected on our pages, this is done on a voluntary basis wherever possible.
                      </p>

                      <h2 className={`text-2xl font-bold ${textColors.primary} mb-4 mt-8 flex items-center`}>
                        <ScaleIcon className="h-6 w-6 mr-3" />
                        Copyright
                      </h2>
                      <p className={`${textColors.secondary}`}>
                        The content and works created by the site operators on these pages are subject to German copyright law. 
                        Duplication, processing, distribution and any form of commercialization of such material beyond the scope 
                        of the copyright law shall require the prior written consent of its respective author or creator.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className={`text-2xl font-bold ${textColors.primary} mb-4 flex items-center`}>
                        <ShieldCheckIcon className="h-6 w-6 mr-3" />
                        Haftungsausschluss
                      </h2>
                      <p className={`${textColors.secondary}`}>
                        Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. 
                        Für den Inhalt der verlinkten Seiten sind ausschließlich deren Betreiber verantwortlich.
                      </p>

                      <h2 className={`text-2xl font-bold ${textColors.primary} mb-4 mt-8 flex items-center`}>
                        <DocumentTextIcon className="h-6 w-6 mr-3" />
                        Datenschutz
                      </h2>
                      <p className={`${textColors.secondary}`}>
                        Die Nutzung unserer Webseite ist in der Regel ohne Angabe personenbezogener Daten möglich. 
                        Soweit auf unseren Seiten personenbezogene Daten erhoben werden, erfolgt dies, soweit möglich, 
                        stets auf freiwilliger Basis.
                      </p>

                      <h2 className={`text-2xl font-bold ${textColors.primary} mb-4 mt-8 flex items-center`}>
                        <ScaleIcon className="h-6 w-6 mr-3" />
                        Urheberrecht
                      </h2>
                      <p className={`${textColors.secondary}`}>
                        Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem 
                        deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung 
                        außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors 
                        bzw. Erstellers.
                      </p>

                      <h2 className={`text-2xl font-bold ${textColors.primary} mb-4 mt-8`}>
                        Angaben gemäß § 5 TMG
                      </h2>
                      <p className={`${textColors.secondary} text-sm`}>
                        Diese Angaben entsprechen den Anforderungen des Telemediengesetzes (TMG) und dienen der Transparenz 
                        und rechtlichen Klarstellung unserer Geschäftstätigkeit.
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="py-16 bg-gradient-to-r from-gray-600 to-blue-600 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="text-2xl font-bold mb-4">
              {language === 'de' ? 'Haben Sie rechtliche Fragen?' : 'Do You Have Legal Questions?'}
            </h2>
            <p className="text-lg mb-6 max-w-2xl mx-auto">
              {language === 'de' 
                ? 'Für rechtliche Angelegenheiten oder weitere Informationen kontaktieren Sie uns gerne.'
                : 'For legal matters or additional information, please feel free to contact us.'
              }
            </p>
            <a 
              href="mailto:legal@voltaic.systems" 
              className="inline-flex items-center px-6 py-3 bg-white text-gray-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              <EnvelopeIcon className="mr-2 h-4 w-4" />
              legal@voltaic.systems
            </a>
          </div>
        </section>
      </div>
    </>
  )
}

export default ImprintPage