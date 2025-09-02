import { useLanguage } from '../../contexts/LanguageContext'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'

const DigitalTransformationPage = () => {
  const { language } = useLanguage()

  return (
    <div className={`min-h-screen ${backgrounds.pageAlt}`}>
      <div className="container py-16">
        <h1 className={`text-4xl font-bold ${textColors.primary} mb-8`}>
          {language === 'en' ? 'Digital Transformation' : 'Digitale Transformation'}
        </h1>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className={`text-xl ${textColors.secondary}`}>
            {language === 'en' 
              ? 'Modernize your business processes and legacy systems'
              : 'Modernisieren Sie Ihre Geschäftsprozesse und Legacy-Systeme'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default DigitalTransformationPage