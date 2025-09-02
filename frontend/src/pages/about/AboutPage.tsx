import { useLanguage } from '../../contexts/LanguageContext'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'
import { 
  BookOpenIcon,
  UserGroupIcon,
  SparklesIcon,
  BoltIcon,
  CheckCircleIcon,
  HeartIcon,
  LightBulbIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'

const AboutPage = () => {
  const { language } = useLanguage()

  const storyMilestones = [
    {
      year: "2020",
      title: language === 'en' ? 'Foundation' : 'Gründung',
      description: language === 'en' 
        ? 'voltAIc Systems was founded with the vision to make AI accessible for every business'
        : 'voltAIc Systems wurde mit der Vision gegründet, KI für jedes Unternehmen zugänglich zu machen'
    },
    {
      year: "2021",
      title: language === 'en' ? 'First Major Projects' : 'Erste Großprojekte',
      description: language === 'en'
        ? 'Successfully delivered AI transformation projects for manufacturing and healthcare clients'
        : 'Erfolgreiche Durchführung von KI-Transformationsprojekten für Fertigungs- und Gesundheitskunden'
    },
    {
      year: "2022",
      title: language === 'en' ? 'Team Expansion' : 'Team-Expansion',
      description: language === 'en'
        ? 'Grew from 3 to 15 AI specialists and data scientists'
        : 'Wachstum von 3 auf 15 KI-Spezialisten und Datenwissenschaftler'
    },
    {
      year: "2023",
      title: language === 'en' ? 'International Growth' : 'Internationales Wachstum',
      description: language === 'en'
        ? 'Expanded operations to serve clients across Europe'
        : 'Erweiterung der Aktivitäten zur Bedienung von Kunden in ganz Europa'
    },
    {
      year: "2024",
      title: language === 'en' ? 'AI Platform Launch' : 'KI-Plattform Start',
      description: language === 'en'
        ? 'Launched our proprietary AI automation platform'
        : 'Start unserer proprietären KI-Automatisierungsplattform'
    }
  ]

  const teamMembers = [
    {
      name: "Dr. Sarah Mueller",
      role: language === 'en' ? 'CEO & AI Strategy Lead' : 'CEO & KI-Strategieleiterin',
      image: "/api/placeholder/300/300",
      description: language === 'en'
        ? '15+ years in AI research and enterprise transformation'
        : '15+ Jahre in der KI-Forschung und Unternehmenstransformation'
    },
    {
      name: "Marcus Schmidt",
      role: language === 'en' ? 'CTO & Lead Data Scientist' : 'CTO & Leitender Datenwissenschaftler',
      image: "/api/placeholder/300/300", 
      description: language === 'en'
        ? 'Expert in machine learning and automation systems'
        : 'Experte für maschinelles Lernen und Automatisierungssysteme'
    },
    {
      name: "Elena Rodriguez",
      role: language === 'en' ? 'Head of Client Solutions' : 'Leiterin Kundenlösungen',
      image: "/api/placeholder/300/300",
      description: language === 'en'
        ? 'Specialized in digital transformation and change management'
        : 'Spezialisiert auf digitale Transformation und Change Management'
    },
    {
      name: "Thomas Wagner",
      role: language === 'en' ? 'Senior AI Engineer' : 'Senior KI-Ingenieur',
      image: "/api/placeholder/300/300",
      description: language === 'en'
        ? 'Focus on custom AI development and integration'
        : 'Fokus auf individuelle KI-Entwicklung und Integration'
    }
  ]

  const values = [
    {
      icon: CheckCircleIcon,
      title: language === 'en' ? 'Excellence' : 'Exzellenz',
      description: language === 'en'
        ? 'We deliver exceptional results through meticulous attention to detail and continuous improvement'
        : 'Wir liefern außergewöhnliche Ergebnisse durch akribische Detailgenauigkeit und kontinuierliche Verbesserung'
    },
    {
      icon: HeartIcon,
      title: language === 'en' ? 'Ethics' : 'Ethik',
      description: language === 'en'
        ? 'AI development with responsible practices and transparent, fair algorithms'
        : 'KI-Entwicklung mit verantwortlichen Praktiken und transparenten, fairen Algorithmen'
    },
    {
      icon: LightBulbIcon,
      title: language === 'en' ? 'Innovation' : 'Innovation',
      description: language === 'en'
        ? 'Pioneering solutions that push the boundaries of what\'s possible with AI'
        : 'Wegweisende Lösungen, die die Grenzen des mit KI Möglichen erweitern'
    },
    {
      icon: GlobeAltIcon,
      title: language === 'en' ? 'Accessibility' : 'Zugänglichkeit',
      description: language === 'en'
        ? 'Making advanced AI technology accessible and affordable for businesses of all sizes'
        : 'Erweiterte KI-Technologie für Unternehmen jeder Größe zugänglich und erschwinglich machen'
    }
  ]

  return (
    <div className={`min-h-screen ${backgrounds.pageAlt}`}>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <BoltIcon className="h-16 w-16 text-primary-200" />
            </div>
            <h1 className="text-5xl font-bold mb-6">
              {language === 'en' ? 'About voltAIc Systems' : 'Über voltAIc Systems'}
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed">
              {language === 'en'
                ? 'We believe artificial intelligence should enhance human potential, not replace it. Our mission is to bridge the gap between cutting-edge AI technology and practical business solutions.'
                : 'Wir glauben, dass künstliche Intelligenz das menschliche Potenzial erweitern, nicht ersetzen sollte. Unsere Mission ist es, die Lücke zwischen modernster KI-Technologie und praktischen Geschäftslösungen zu schließen.'}
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-12">
              <BookOpenIcon className="h-8 w-8 text-primary-600 mr-4" />
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                {language === 'en' ? 'Our Story' : 'Unsere Geschichte'}
              </h2>
            </div>
            
            <div className="prose prose-lg dark:prose-invert max-w-none mb-12">
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                {language === 'en'
                  ? 'voltAIc Systems began as a simple idea: what if every company could harness the power of artificial intelligence, regardless of their size or technical expertise? Founded in Stuttgart, Germany, we started with a small team of AI researchers and engineers who shared a common vision of democratizing AI technology.'
                  : 'voltAIc Systems begann als einfache Idee: Was wäre, wenn jedes Unternehmen die Kraft der künstlichen Intelligenz nutzen könnte, unabhängig von seiner Größe oder technischen Expertise? Gegründet in Stuttgart, Deutschland, begannen wir mit einem kleinen Team von KI-Forschern und Ingenieuren, die eine gemeinsame Vision der Demokratisierung der KI-Technologie teilten.'}
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-8">
              {storyMilestones.map((milestone, index) => (
                <div key={milestone.year} className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 dark:text-primary-400 font-bold text-sm">
                        {milestone.year.slice(-2)}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      {milestone.year} - {milestone.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Our Team Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-12">
              <UserGroupIcon className="h-8 w-8 text-primary-600 mr-4" />
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                {language === 'en' ? 'Our Team' : 'Unser Team'}
              </h2>
            </div>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 text-center max-w-3xl mx-auto">
              {language === 'en'
                ? 'Meet the experts who make AI transformation possible. Our diverse team brings together decades of experience in artificial intelligence, data science, and business strategy.'
                : 'Lernen Sie die Experten kennen, die KI-Transformation möglich machen. Unser vielfältiges Team bringt jahrzehntelange Erfahrung in künstlicher Intelligenz, Datenwissenschaft und Geschäftsstrategie zusammen.'}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <div key={member.name} className="text-center group">
                  <div className="relative mb-6">
                    <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                      <UserGroupIcon className="h-24 w-24 text-primary-600 dark:text-primary-400" />
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {member.name}
                  </h3>
                  <p className="text-primary-600 dark:text-primary-400 font-medium mb-3">
                    {member.role}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {member.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Values Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-12">
              <SparklesIcon className="h-8 w-8 text-primary-600 mr-4" />
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                {language === 'en' ? 'Mission & Values' : 'Mission & Werte'}
              </h2>
            </div>

            {/* Mission Statement */}
            <div className="bg-primary-50 dark:bg-primary-900/20 rounded-2xl p-8 mb-12">
              <h3 className="text-2xl font-semibold text-primary-900 dark:text-primary-100 mb-4">
                {language === 'en' ? 'Our Mission' : 'Unsere Mission'}
              </h3>
              <p className="text-lg text-primary-800 dark:text-primary-200 leading-relaxed">
                {language === 'en'
                  ? 'To transform businesses through intelligent automation and data-driven insights, making advanced AI technology accessible, ethical, and profitable for organizations of every size. We believe that the future belongs to companies that can successfully integrate human creativity with artificial intelligence.'
                  : 'Unternehmen durch intelligente Automatisierung und datengestützte Erkenntnisse zu transformieren und erweiterte KI-Technologie für Organisationen jeder Größe zugänglich, ethisch und profitabel zu machen. Wir glauben, dass die Zukunft Unternehmen gehört, die menschliche Kreativität erfolgreich mit künstlicher Intelligenz integrieren können.'}
              </p>
            </div>

            {/* Core Values */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {values.map((value) => (
                <div key={value.title} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
                  <div className="flex items-center mb-4">
                    <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg mr-4">
                      <value.icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {value.title}
                    </h3>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">
              {language === 'en' ? 'Ready to Transform Your Business?' : 'Bereit, Ihr Unternehmen zu transformieren?'}
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              {language === 'en'
                ? 'Let\'s discuss how AI can drive growth and efficiency in your organization.'
                : 'Lassen Sie uns besprechen, wie KI Wachstum und Effizienz in Ihrem Unternehmen vorantreiben kann.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact/booking"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-200"
              >
                {language === 'en' ? 'Schedule Consultation' : 'Beratung vereinbaren'}
              </a>
              <a
                href="/services"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200"
              >
                {language === 'en' ? 'View Our Services' : 'Unsere Services ansehen'}
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default AboutPage