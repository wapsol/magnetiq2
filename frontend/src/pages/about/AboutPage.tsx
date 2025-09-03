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
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  HandRaisedIcon
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

  const founders = [
    {
      name: "Ashant Chalasani, M.Sc.",
      role: language === 'en' ? 'Co-Founder' : 'Mitgründer',
      quote: language === 'en' 
        ? 'AI will determine our future for the next 20 to 25 years and beyond. We help companies understand and harness this transformative power.'
        : 'KI wird unsere Zukunft für die nächsten 20 bis 25 Jahre und darüber hinaus bestimmen. Wir helfen Unternehmen, diese transformative Kraft zu verstehen und zu nutzen.',
      image: "/images/team/ashant.webp"
    },
    {
      name: "Pascal Köth, Dipl.Ök.",
      role: language === 'en' ? 'Co-Founder' : 'Mitgründer',
      quote: language === 'en'
        ? 'Actively shaping the digital revolution - sustainable adaptation & efficiency improvement through intelligent automation.'
        : 'Die digitale Revolution aktiv mitgestalten - nachhaltige Adaptierung & Effizienzsteigerung durch intelligente Automatisierung.',
      image: "/images/team/pascal.webp"
    }
  ]

  const advisoryBoard = [
    {
      name: "Dr. Codrina Lauth",
      role: language === 'en' ? 'Executive Director, Perton HPC AI Supercomputing' : 'Geschäftsführerin, Perton HPC AI Supercomputing',
      quote: language === 'en'
        ? 'There is no one-size-fits-all AI solution - we create the right AI for each unique challenge.'
        : 'Es gibt nicht die richtige KI, sondern wir erschaffen sie jedes Mal neu für jede einzigartige Herausforderung.',
      image: "/images/team/codrina.webp"
    },
    {
      name: "Markus Eberius",
      role: language === 'en' ? 'CIO/CTO (Previously at Nasdaq)' : 'CIO/CTO (Ehemals bei Nasdaq)',
      quote: language === 'en'
        ? 'AI is as useful or dangerous as everything else humanity has created. The key is responsible development and implementation.'
        : 'KI ist so nützlich oder gefährlich, wie alles was der Mensch geschaffen hat. Der Schlüssel liegt in verantwortlicher Entwicklung und Umsetzung.',
      image: "/images/team/markus.webp"
    }
  ]

  const coreValues = [
    {
      icon: ChatBubbleLeftRightIcon,
      title: language === 'en' ? 'Transparency' : 'Transparenz',
      description: language === 'en'
        ? 'Clarity and solution-oriented communication in all our interactions'
        : 'Klarheit und lösungsorientierte Kommunikation in allen unseren Interaktionen'
    },
    {
      icon: ShieldCheckIcon,
      title: language === 'en' ? 'Sustainability' : 'Nachhaltigkeit',
      description: language === 'en'
        ? 'Reliability and continuity in our approach to technology and partnerships'
        : 'Zuverlässigkeit und Kontinuität in unserem Ansatz zu Technologie und Partnerschaften'
    },
    {
      icon: HandRaisedIcon,
      title: language === 'en' ? 'Responsibility' : 'Verantwortung',
      description: language === 'en'
        ? 'Foundation of our products, services, and partnerships'
        : 'Grundlage unserer Produkte, Dienstleistungen und Partnerschaften'
    },
    {
      icon: UserGroupIcon,
      title: language === 'en' ? 'Diversity' : 'Diversität',
      description: language === 'en'
        ? 'Driver of growth and innovation in our team and solutions'
        : 'Treiber von Wachstum und Innovation in unserem Team und unseren Lösungen'
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

      {/* Leadership Team Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-12">
              <UserGroupIcon className="h-8 w-8 text-primary-600 mr-4" />
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white">
                {language === 'en' ? 'Our Founders' : 'Unsere Gründer'}
              </h2>
            </div>
            
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-12 text-center max-w-3xl mx-auto">
              {language === 'en'
                ? 'Visionary leaders driving AI innovation and business transformation'
                : 'Visionäre Führungspersönlichkeiten, die KI-Innovation und Unternehmenstransformation vorantreiben'}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
              {founders.map((founder) => (
                <div key={founder.name} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
                  <div className="flex items-start space-x-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                      <img 
                        src={founder.image} 
                        alt={founder.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {founder.name}
                      </h3>
                      <p className="text-primary-600 dark:text-primary-400 font-medium mb-4">
                        {founder.role}
                      </p>
                      <blockquote className="text-gray-600 dark:text-gray-300 italic">
                        "{founder.quote}"
                      </blockquote>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Advisory Board */}
            <div className="flex items-center mb-12">
              <UserGroupIcon className="h-8 w-8 text-primary-600 mr-4" />
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                {language === 'en' ? 'Advisory Board' : 'Beirat'}
              </h3>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-12 text-center max-w-2xl mx-auto">
              {language === 'en'
                ? 'Industry experts guiding our strategic direction'
                : 'Branchenexperten, die unsere strategische Ausrichtung leiten'}
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {advisoryBoard.map((advisor) => (
                <div key={advisor.name} className="bg-gray-50 dark:bg-gray-900 rounded-2xl p-8 shadow-lg">
                  <div className="flex items-start space-x-6">
                    <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                      <img 
                        src={advisor.image} 
                        alt={advisor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {advisor.name}
                      </h3>
                      <p className="text-primary-600 dark:text-primary-400 font-medium mb-4 text-sm">
                        {advisor.role}
                      </p>
                      <blockquote className="text-gray-600 dark:text-gray-300 italic">
                        "{advisor.quote}"
                      </blockquote>
                    </div>
                  </div>
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
              {coreValues.map((value) => (
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