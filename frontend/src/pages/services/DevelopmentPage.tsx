import { useLanguage } from '../../contexts/LanguageContext'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'

const DevelopmentPage = () => {
  const { language } = useLanguage()

  return (
    <div className={`min-h-screen ${backgrounds.pageAlt}`}>
      <div className="container py-16">
        <h1 className={`text-4xl font-bold ${textColors.primary} mb-8`}>
          {language === 'en' ? 'Custom Development' : 'Individuelle Entwicklung'}
        </h1>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className={`text-xl ${textColors.secondary}`}>
            {language === 'en' 
              ? 'AI/ML application development and custom software solutions'
              : 'KI/ML-Anwendungsentwicklung und maßgeschneiderte Softwarelösungen'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DevelopmentPage