import { useState } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  UserGroupIcon,
  SparklesIcon,
  HeartIcon,
  LightBulbIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  HandRaisedIcon
} from '@heroicons/react/24/outline'
import JobApplicationPopup from '../../components/careers/JobApplicationPopup'

interface Position {
  title: string
  department: string
  location: string
  type: string
  description: string
}

const CareersPage = () => {
  const { language } = useLanguage()
  
  // Job application popup state
  const [isApplicationPopupOpen, setIsApplicationPopupOpen] = useState(false)
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null)
  
  // Handle apply button click
  const handleApplyClick = (position: any) => {
    setSelectedPosition({
      title: position.title,
      department: position.department,
      location: position.location,
      type: position.type,
      description: position.description
    })
    setIsApplicationPopupOpen(true)
  }
  
  // Handle popup close
  const handlePopupClose = () => {
    setIsApplicationPopupOpen(false)
    setSelectedPosition(null)
  }


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

  const benefits = [
    {
      icon: LightBulbIcon,
      title: language === 'en' ? 'Innovation Focus' : 'Innovationsfokus',
      description: language === 'en'
        ? 'Work on cutting-edge AI projects that shape the future'
        : 'Arbeiten Sie an modernsten KI-Projekten, die die Zukunft prägen'
    },
    {
      icon: GlobeAltIcon,
      title: language === 'en' ? 'International Environment' : 'Internationales Umfeld',
      description: language === 'en'
        ? 'Collaborate with clients and team members across Europe'
        : 'Zusammenarbeit mit Kunden und Teammitgliedern in ganz Europa'
    },
    {
      icon: SparklesIcon,
      title: language === 'en' ? 'Professional Growth' : 'Berufliche Entwicklung',
      description: language === 'en'
        ? 'Continuous learning and development opportunities'
        : 'Kontinuierliche Lern- und Entwicklungsmöglichkeiten'
    },
    {
      icon: HeartIcon,
      title: language === 'en' ? 'Work-Life Balance' : 'Work-Life-Balance',
      description: language === 'en'
        ? 'Flexible working arrangements and supportive culture'
        : 'Flexible Arbeitsmodelle und unterstützende Unternehmenskultur'
    }
  ]

  const openPositions = [
    {
      title: language === 'en' ? 'Senior AI Engineer' : 'Senior KI-Ingenieur',
      department: language === 'en' ? 'Engineering' : 'Entwicklung',
      location: 'Stuttgart, Germany / Remote',
      type: language === 'en' ? 'Full-time' : 'Vollzeit',
      description: language === 'en'
        ? 'Lead the development of AI solutions for enterprise clients'
        : 'Leitung der Entwicklung von KI-Lösungen für Unternehmenskunden'
    },
    {
      title: language === 'en' ? 'Data Scientist' : 'Datenwissenschaftler',
      department: language === 'en' ? 'Analytics' : 'Analytics',
      location: 'Stuttgart, Germany / Remote',
      type: language === 'en' ? 'Full-time' : 'Vollzeit',
      description: language === 'en'
        ? 'Transform data into actionable insights for business optimization'
        : 'Transformation von Daten in umsetzbare Erkenntnisse für Geschäftsoptimierung'
    },
    {
      title: language === 'en' ? 'Business Development Manager' : 'Business Development Manager',
      department: language === 'en' ? 'Sales' : 'Vertrieb',
      location: 'Stuttgart, Germany',
      type: language === 'en' ? 'Full-time' : 'Vollzeit',
      description: language === 'en'
        ? 'Drive growth by identifying and developing new business opportunities'
        : 'Wachstum vorantreiben durch Identifizierung und Entwicklung neuer Geschäftsmöglichkeiten'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white py-20">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center mb-6">
              <BriefcaseIcon className="h-16 w-16 text-primary-200" />
            </div>
            <h1 className="text-5xl font-bold mb-6">
              {language === 'en' ? 'Join Our Mission' : 'Werden Sie Teil unserer Mission'}
            </h1>
            <p className="text-xl text-primary-100 leading-relaxed mb-8">
              {language === 'en'
                ? 'Help us create sustainable awareness, knowledge, and access to easily accessible, secure, and adequate AI & technology solutions.'
                : 'Helfen Sie uns dabei, nachhaltiges Bewusstsein, Wissen und Zugang zu leicht zugänglichen, sicheren und angemessenen KI- und Technologielösungen zu schaffen.'}
            </p>
            <div className="bg-primary-800/50 rounded-lg p-6 max-w-3xl mx-auto">
              <p className="text-lg font-medium text-primary-100">
                {language === 'en' ? 'Our Mission:' : 'Unsere Mission:'}
              </p>
              <p className="text-primary-200 mt-2">
                {language === 'en'
                  ? 'Enable every workplace to efficiently, profitably, and sustainably shape value creation, autonomously and independently.'
                  : 'Jeden Arbeitsplatz befähigen, Wertschöpfung effizient, profitabel und nachhaltig zu gestalten - autonom und unabhängig.'}
              </p>
            </div>
          </div>
        </div>
      </section>


      {/* Core Values Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'en' ? 'Our Core Values' : 'Unsere Grundwerte'}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {language === 'en'
                  ? 'The principles that guide everything we do and define our company culture'
                  : 'Die Prinzipien, die alles leiten, was wir tun, und unsere Unternehmenskultur definieren'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {coreValues.map((value) => (
                <div key={value.title} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start space-x-6">
                    <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-lg">
                      <value.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                        {value.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300">
                        {value.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'en' ? 'Why Work With Us' : 'Warum bei uns arbeiten'}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {language === 'en'
                  ? 'Join a team that values innovation, growth, and making a meaningful impact'
                  : 'Werden Sie Teil eines Teams, das Innovation, Wachstum und sinnvolle Wirkung schätzt'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="text-center bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <div className="bg-primary-100 dark:bg-primary-900 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <benefit.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                {language === 'en' ? 'Open Positions' : 'Offene Stellen'}
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                {language === 'en'
                  ? 'Explore exciting opportunities to grow your career with us'
                  : 'Entdecken Sie spannende Möglichkeiten, Ihre Karriere bei uns zu entwickeln'}
              </p>
            </div>

            <div className="space-y-6">
              {openPositions.map((position, index) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            {position.title}
                          </h3>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
                            <span className="bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full">
                              {position.department}
                            </span>
                            <span>📍 {position.location}</span>
                            <span>⏰ {position.type}</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        {position.description}
                      </p>
                    </div>
                    <div className="lg:ml-6 mt-4 lg:mt-0">
                      <button
                        onClick={() => handleApplyClick(position)}
                        className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors duration-200"
                      >
                        {language === 'en' ? 'Apply Now' : 'Jetzt bewerben'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {language === 'en'
                  ? "Don't see the perfect role? We're always looking for talented individuals."
                  : 'Sehen Sie nicht die perfekte Rolle? Wir suchen immer nach talentierten Personen.'}
              </p>
              <button
                onClick={() => handleApplyClick({
                  title: language === 'en' ? 'General Application' : 'Allgemeine Bewerbung',
                  department: language === 'en' ? 'Various Departments' : 'Verschiedene Abteilungen',
                  location: 'Stuttgart, Germany / Remote',
                  type: language === 'en' ? 'Full-time' : 'Vollzeit',
                  description: language === 'en' 
                    ? 'Open application for talented individuals who want to join our mission'
                    : 'Initiativbewerbung für talentierte Personen, die Teil unserer Mission werden möchten'
                })}
                className="border-2 border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400 px-8 py-3 rounded-lg font-semibold hover:bg-primary-600 hover:text-white dark:hover:bg-primary-400 dark:hover:text-gray-900 transition-colors duration-200"
              >
                {language === 'en' ? 'Apply Now' : 'Jetzt bewerben'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-6">
              {language === 'en' ? 'Ready to Shape the Future of AI?' : 'Bereit, die Zukunft der KI zu gestalten?'}
            </h2>
            <p className="text-xl text-primary-100 mb-8">
              {language === 'en'
                ? 'Join our mission to make AI accessible, ethical, and transformative for businesses worldwide.'
                : 'Werden Sie Teil unserer Mission, KI zugänglich, ethisch und transformativ für Unternehmen weltweit zu machen.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => handleApplyClick({
                  title: language === 'en' ? 'Interview Application' : 'Interview-Bewerbung',
                  department: language === 'en' ? 'Various Departments' : 'Verschiedene Abteilungen',
                  location: 'Stuttgart, Germany / Remote',
                  type: language === 'en' ? 'Interview' : 'Interview',
                  description: language === 'en' 
                    ? 'Apply for a direct interview to discuss your career opportunities'
                    : 'Bewerben Sie sich für ein direktes Interview, um Ihre Karrieremöglichkeiten zu besprechen'
                })}
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors duration-200"
              >
                {language === 'en' ? 'Apply for Interview' : 'Für Interview bewerben'}
              </button>
              <a
                href="/about"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors duration-200"
              >
                {language === 'en' ? 'Learn About Our Company' : 'Über unser Unternehmen'}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Job Application Popup */}
      <JobApplicationPopup
        isOpen={isApplicationPopupOpen}
        onClose={handlePopupClose}
        position={selectedPosition}
      />
    </div>
  )
}

export default CareersPage