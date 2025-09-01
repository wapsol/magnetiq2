import { useLanguage } from '../../contexts/LanguageContext'

const AIConsultingPage = () => {
  const { language } = useLanguage()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container py-16">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
          {language === 'en' ? 'AI Consulting' : 'KI-Beratung'}
        </h1>
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <p className="text-xl text-gray-600 dark:text-gray-300">
            {language === 'en' 
              ? 'Strategic AI implementation and technology assessment for your business'
              : 'Strategische KI-Implementierung und Technologiebewertung für Ihr Unternehmen'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AIConsultingPage