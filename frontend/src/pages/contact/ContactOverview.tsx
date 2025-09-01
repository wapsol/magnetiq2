import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  LifebuoyIcon,
  MapPinIcon
} from '@heroicons/react/24/outline'

const ContactOverview = () => {
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''

  const contactOptions = [
    {
      title: t('contact.booking'),
      path: `${basePath}/contact/booking`,
      icon: CalendarIcon,
      description: language === 'en' 
        ? 'Schedule a consultation with our experts'
        : 'Vereinbaren Sie einen Termin mit unseren Experten'
    },
    {
      title: t('contact.general'),
      path: `${basePath}/contact/general`,
      icon: ChatBubbleLeftRightIcon,
      description: language === 'en'
        ? 'General inquiries and partnerships'
        : 'Allgemeine Anfragen und Partnerschaften'
    },
    {
      title: t('contact.support'),
      path: `${basePath}/contact/support`,
      icon: LifebuoyIcon,
      description: language === 'en'
        ? 'Technical support and assistance'
        : 'Technischer Support und Hilfe'
    },
    {
      title: t('contact.locations'),
      path: `${basePath}/contact/locations`,
      icon: MapPinIcon,
      description: language === 'en'
        ? 'Our office locations'
        : 'Unsere Bürostandorte'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('nav.contact')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
          {language === 'en' 
            ? 'Get in touch with our team'
            : 'Nehmen Sie Kontakt mit unserem Team auf'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {contactOptions.map((option) => (
            <Link
              key={option.path}
              to={option.path}
              className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group"
            >
              <div className="flex items-start space-x-4">
                <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg">
                  <option.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                    {option.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    {option.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ContactOverview