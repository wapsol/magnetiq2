import { useLanguage } from '../../contexts/LanguageContext'

const AutomationPage = () => {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          {language === 'en' ? 'Automation Solutions' : 'Automatisierungslösungen'}
        </h1>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-600 dark:text-gray-300">
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