import { useLanguage } from '../../contexts/LanguageContext'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'

const AutomationPage = () => {
  const { language } = useLanguage()

  return (
    <div className={`min-h-screen ${backgrounds.pageAlt}`}>
      <div className="container py-16">
        <h1 className={`text-4xl font-bold ${textColors.primary} mb-8`}>
          {language === 'en' ? 'Automation Solutions' : 'Automatisierungslösungen'}
        </h1>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className={`text-xl ${textColors.secondary}`}>
            {language === 'en' 
              ? 'Robotic Process Automation and workflow optimization'
              : 'Robotic Process Automation und Workflow-Optimierung'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AutomationPage