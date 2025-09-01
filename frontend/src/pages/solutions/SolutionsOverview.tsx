import { Link } from 'react-router-dom'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  BuildingOfficeIcon,
  CpuChipIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'

const SolutionsOverview = () => {
  const { language, t } = useLanguage()
  const basePath = language === 'de' ? '/de' : ''

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          {t('nav.solutions')}
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-12">
          {language === 'en' 
            ? 'Industry-specific and technology-focused solutions'
            : 'Branchenspezifische und technologiefokussierte Lösungen'}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link
            to={`${basePath}/solutions/industries`}
            className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group"
          >
            <BuildingOfficeIcon className="h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('solutions.industries')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'en'
                ? 'Tailored solutions for your industry'
                : 'Maßgeschneiderte Lösungen für Ihre Branche'}
            </p>
          </Link>

          <Link
            to={`${basePath}/solutions/technology`}
            className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group"
          >
            <CpuChipIcon className="h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('solutions.technology')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'en'
                ? 'Platform-specific implementations'
                : 'Plattformspezifische Implementierungen'}
            </p>
          </Link>

          <Link
            to={`${basePath}/solutions/case-studies`}
            className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 group"
          >
            <DocumentTextIcon className="h-12 w-12 text-primary-600 dark:text-primary-400 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
              {t('solutions.case_studies')}
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              {language === 'en'
                ? 'Success stories and results'
                : 'Erfolgsgeschichten und Ergebnisse'}
            </p>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SolutionsOverview