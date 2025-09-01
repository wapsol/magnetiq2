import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  BookOpenIcon,
  UserGroupIcon,
  SparklesIcon,
  BriefcaseIcon,
  BuildingOffice2Icon,
  NewspaperIcon
} from '@heroicons/react/24/outline'

const AboutOverview = () => {
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''

  const sections = [
    {
      title: t('about.story'),
      path: `${basePath}/about/story`,
      icon: BookOpenIcon,
      description: language === 'en' 
        ? 'Our journey and evolution'
        : 'Unsere Reise und Entwicklung'
    },
    {
      title: t('about.team'),
      path: `${basePath}/about/team`,
      icon: UserGroupIcon,
      description: language === 'en'
        ? 'Meet our experts'
        : 'Lernen Sie unsere Experten kennen'
    },
    {
      title: t('about.mission'),
      path: `${basePath}/about/mission`,
      icon: SparklesIcon,
      description: language === 'en'
        ? 'Our values and vision'
        : 'Unsere Werte und Vision'
    },
    {
      title: t('about.careers'),
      path: `${basePath}/about/careers`,
      icon: BriefcaseIcon,
      description: language === 'en'
        ? 'Join our team'
        : 'Werden Sie Teil unseres Teams'
    },
    {
      title: t('about.partners'),
      path: `${basePath}/about/partners`,
      icon: BuildingOffice2Icon,
      description: language === 'en'
        ? 'Our technology partners'
        : 'Unsere Technologiepartner'
    },
    {
      title: t('about.news'),
      path: `${basePath}/about/news`,
      icon: NewspaperIcon,
      description: language === 'en'
        ? 'Latest news and press'
        : 'Aktuelle Nachrichten und Presse'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('nav.about')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
          {language === 'en' 
            ? 'Learn more about voltAIc Systems and our mission'
            : 'Erfahren Sie mehr über voltAIc Systems und unsere Mission'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sections.map((section) => (
            <Link
              key={section.path}
              to={section.path}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 group"
            >
              <section.icon className="h-10 w-10 text-primary-600 dark:text-primary-400 mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                {section.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                {section.description}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

export default AboutOverview