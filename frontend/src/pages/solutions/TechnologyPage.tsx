import { useLanguage } from '../../contexts/LanguageContext'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'
import { 
  CpuChipIcon,
  CogIcon,
  ChartBarIcon,
  BeakerIcon,
  LightBulbIcon,
  ClockIcon,
  SparklesIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline'

const TechnologyPage = () => {
  const { language, t } = useLanguage()

  const technologies = [
    {
      icon: BeakerIcon,
      title: language === 'en' ? 'Model Fine-tuning' : 'Modell-Feinabstimmung',
      subtitle: language === 'en' ? 'Optimize AI performance for your specific needs' : 'KI-Leistung für Ihre spezifischen Anforderungen optimieren',
      description: language === 'en' 
        ? 'Transform existing AI models into specialized solutions tailored to your business context. Our fine-tuning approach leverages transfer learning to efficiently integrate new knowledge domains while reducing computational overhead.'
        : 'Wandeln Sie bestehende KI-Modelle in spezialisierte Lösungen um, die auf Ihren Geschäftskontext zugeschnitten sind. Unser Fine-Tuning-Ansatz nutzt Transfer Learning, um neue Wissensbereiche effizient zu integrieren und dabei den Rechenaufwand zu reduzieren.',
      benefits: language === 'en' 
        ? ['Specialization for your industry', 'Flexible model adaptation', 'Dynamic responsiveness', 'Accelerated decision-making', 'Enhanced performance', 'Cost efficiency', 'Precise application cases']
        : ['Spezialisierung für Ihre Branche', 'Flexible Modellanpassung', 'Dynamische Reaktionsfähigkeit', 'Beschleunigte Entscheidungsfindung', 'Verbesserte Leistung', 'Kosteneffizienz', 'Präzise Anwendungsfälle'],
      duration: language === 'en' ? 'Few days to several weeks' : 'Wenige Tage bis mehrere Wochen',
      improvement: language === 'en' ? 'Up to 30% reduction in training time' : 'Bis zu 30% Reduzierung der Trainingszeit'
    },
    {
      icon: CogIcon,
      title: language === 'en' ? 'Intelligent Process Automation' : 'Intelligente Prozessautomatisierung',
      subtitle: language === 'en' ? 'Context-aware automation beyond traditional RPA' : 'Kontextbewusste Automatisierung jenseits traditioneller RPA',
      description: language === 'en'
        ? 'Combine Robotic Process Automation (RPA) with Semantic Process Automation (SPA) to create intelligent workflows that understand context and adapt continuously. Our approach integrates machine learning, natural language processing, and automated decision-making.'
        : 'Kombinieren Sie Robotic Process Automation (RPA) mit Semantic Process Automation (SPA), um intelligente Workflows zu schaffen, die Kontext verstehen und sich kontinuierlich anpassen. Unser Ansatz integriert maschinelles Lernen, Sprachverarbeitung und automatisierte Entscheidungsfindung.',
      technologies: language === 'en'
        ? ['Robotic Process Automation (RPA)', 'Natural Language Processing (NLP)', 'Machine Learning & AI', 'Workflow Optimization', 'Data Collection & Preparation', 'Contextual Understanding']
        : ['Robotic Process Automation (RPA)', 'Natural Language Processing (NLP)', 'Machine Learning & KI', 'Workflow-Optimierung', 'Datenerfassung & -aufbereitung', 'Kontextuelles Verständnis'],
      industries: language === 'en'
        ? ['Manufacturing', 'Logistics', 'Financial Services']
        : ['Fertigung', 'Logistik', 'Finanzdienstleistungen'],
      implementation: language === 'en' ? 'Few weeks to 3-6 months' : 'Wenige Wochen bis 3-6 Monate'
    },
    {
      icon: ChartBarIcon,
      title: language === 'en' ? 'AI-Driven Project Management' : 'KI-gesteuerte Projektleitung',
      subtitle: language === 'en' ? 'Human-centric approach with intelligent automation' : 'Menschenzentrierter Ansatz mit intelligenter Automatisierung',
      description: language === 'en'
        ? 'Our project management philosophy combines proven methodologies with AI-enhanced insights, built on three fundamental pillars: transparent communication, stakeholder transparency, and human-centric focus. We adapt our approach to each organization\'s unique context.'
        : 'Unsere Projektmanagement-Philosophie kombiniert bewährte Methoden mit KI-erweiterten Erkenntnissen, basierend auf drei grundlegenden Säulen: transparente Kommunikation, Stakeholder-Transparenz und menschenzentrierter Fokus. Wir passen unseren Ansatz an den einzigartigen Kontext jeder Organisation an.',
      pillars: [
        {
          title: language === 'en' ? 'Communication Excellence' : 'Kommunikationsexzellenz',
          description: language === 'en' 
            ? 'Address the 56% of project failures caused by poor communication with early strategies that promote collaboration and reduce misunderstandings.'
            : 'Beheben Sie die 56% der Projektfehler, die durch schlechte Kommunikation verursacht werden, mit frühen Strategien, die Zusammenarbeit fördern und Missverständnisse reduzieren.',
          icon: CpuChipIcon
        },
        {
          title: language === 'en' ? 'Stakeholder Transparency' : 'Stakeholder-Transparenz',
          description: language === 'en'
            ? 'Increase project success rates by 30% through improved stakeholder trust, real-time decision-making, and reduced budget and time overruns.'
            : 'Steigern Sie die Projekterfolgsquoten um 30% durch verbessertes Stakeholder-Vertrauen, Echtzeitentscheidungen und reduzierte Budget- und Zeitüberschreitungen.',
          icon: ArrowTrendingUpIcon
        },
        {
          title: language === 'en' ? 'Human-Centric Focus' : 'Menschenzentrierter Fokus',
          description: language === 'en'
            ? 'Align individual and organizational goals to enhance intrinsic motivation and bridge business and IT objectives effectively.'
            : 'Richten Sie individuelle und organisatorische Ziele aufeinander aus, um die intrinsische Motivation zu steigern und Geschäfts- und IT-Ziele effektiv zu verbinden.',
          icon: LightBulbIcon
        }
      ],
      methodologies: language === 'en'
        ? ['PMBOK (Project Management Body of Knowledge)', 'Agile Methodologies', 'Design Thinking', 'Kanban', 'Change Management']
        : ['PMBOK (Project Management Body of Knowledge)', 'Agile Methoden', 'Design Thinking', 'Kanban', 'Change Management']
    }
  ]

  const keyMetrics = [
    {
      icon: ClockIcon,
      title: language === 'en' ? 'Implementation Speed' : 'Implementierungsgeschwindigkeit',
      description: language === 'en' 
        ? 'From few days to several months depending on complexity'
        : 'Von wenigen Tagen bis zu mehreren Monaten je nach Komplexität'
    },
    {
      icon: ArrowTrendingUpIcon,
      title: language === 'en' ? 'Performance Improvement' : 'Leistungsverbesserung',
      description: language === 'en'
        ? 'Up to 30% improvement in training time and success rates'
        : 'Bis zu 30% Verbesserung bei Trainingszeit und Erfolgsquoten'
    },
    {
      icon: SparklesIcon,
      title: language === 'en' ? 'Continuous Learning' : 'Kontinuierliches Lernen',
      description: language === 'en'
        ? 'Adaptive systems that evolve with your business needs'
        : 'Adaptive Systeme, die sich mit Ihren Geschäftsanforderungen weiterentwickeln'
    }
  ]

  return (
    <div className={`min-h-screen ${backgrounds.pageAlt}`}>
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary-50 via-primary-100 to-purple-50 dark:from-primary-900/20 dark:via-purple-900/20 dark:to-indigo-900/20">
        <div className="container py-24">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-bold text-primary-900 dark:text-white mb-6">
              {language === 'en' ? 'Technology Solutions' : 'Technologie-Lösungen'}
            </h1>
            <p className="text-xl text-primary-700 dark:text-primary-100 mb-8 leading-relaxed">
              {language === 'en'
                ? 'Advanced AI technologies tailored to transform your business processes. From intelligent model fine-tuning to context-aware automation and human-centric project management.'
                : 'Fortschrittliche KI-Technologien, die auf die Transformation Ihrer Geschäftsprozesse zugeschnitten sind. Von intelligenter Modell-Feinabstimmung bis hin zu kontextbewusster Automatisierung und menschenzentrierter Projektleitung.'}
            </p>
            <div className="flex flex-wrap gap-4">
              {keyMetrics.map((metric, index) => (
                <div key={index} className="bg-white/60 dark:bg-white/10 backdrop-blur-sm border border-primary-200 dark:border-primary-700 rounded-lg p-4 flex items-center space-x-3">
                  <metric.icon className="h-6 w-6 text-primary-600 dark:text-primary-200" />
                  <div>
                    <div className="text-sm font-medium text-primary-800 dark:text-white">{metric.title}</div>
                    <div className="text-xs text-primary-600 dark:text-primary-200">{metric.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Technologies Section */}
      <div className="container py-20">
        <div className="text-center mb-16">
          <h2 className={`text-4xl font-bold ${textColors.primary} mb-4`}>
            {language === 'en' ? 'Our Core Technologies' : 'Unsere Kerntechnologien'}
          </h2>
          <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
            {language === 'en'
              ? 'Cutting-edge AI solutions that adapt to your business context and drive measurable results'
              : 'Hochmoderne KI-Lösungen, die sich an Ihren Geschäftskontext anpassen und messbare Ergebnisse liefern'}
          </p>
        </div>

        <div className="space-y-20">
          {technologies.map((tech, index) => (
            <div key={index} className={`flex flex-col ${index % 2 === 1 ? 'lg:flex-row-reverse' : 'lg:flex-row'} lg:items-center gap-12`}>
              <div className="lg:w-1/2">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-lg">
                    <tech.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className={`text-3xl font-bold ${textColors.primary}`}>{tech.title}</h3>
                    <p className="text-primary-600 dark:text-primary-400 font-medium">{tech.subtitle}</p>
                  </div>
                </div>
                <p className={`text-lg ${textColors.secondary} mb-6 leading-relaxed`}>
                  {tech.description}
                </p>
                
                {tech.benefits && (
                  <div className="mb-6">
                    <h4 className={`text-lg font-semibold ${textColors.primary} mb-3`}>
                      {language === 'en' ? 'Key Benefits:' : 'Hauptvorteile:'}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {tech.benefits.map((benefit, bIndex) => (
                        <div key={bIndex} className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
                          <span className={`${textColors.secondary}`}>{benefit}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tech.technologies && (
                  <div className="mb-6">
                    <h4 className={`text-lg font-semibold ${textColors.primary} mb-3`}>
                      {language === 'en' ? 'Technologies:' : 'Technologien:'}
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {tech.technologies.map((technology, tIndex) => (
                        <span key={tIndex} className="bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm">
                          {technology}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {tech.pillars && (
                  <div className="space-y-4">
                    {tech.pillars.map((pillar, pIndex) => (
                      <div key={pIndex} className={`${backgrounds.card} rounded-lg p-4 shadow-sm`}>
                        <div className="flex items-center space-x-3 mb-2">
                          <pillar.icon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                          <h5 className={`font-semibold ${textColors.primary}`}>{pillar.title}</h5>
                        </div>
                        <p className={`${textColors.secondary} text-sm`}>{pillar.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="lg:w-1/2">
                <div className={`${backgrounds.card} rounded-2xl p-8 shadow-lg`}>
                  <div className="space-y-6">
                    {tech.duration && (
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className={`text-sm font-medium ${textColors.secondary}`}>
                          {language === 'en' ? 'Implementation Time' : 'Implementierungszeit'}
                        </span>
                        <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                          {tech.duration}
                        </span>
                      </div>
                    )}
                    
                    {tech.improvement && (
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <span className={`text-sm font-medium ${textColors.secondary}`}>
                          {language === 'en' ? 'Performance Gain' : 'Leistungssteigerung'}
                        </span>
                        <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                          {tech.improvement}
                        </span>
                      </div>
                    )}

                    {tech.implementation && (
                      <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <span className={`text-sm font-medium ${textColors.secondary}`}>
                          {language === 'en' ? 'Timeline' : 'Zeitrahmen'}
                        </span>
                        <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          {tech.implementation}
                        </span>
                      </div>
                    )}

                    {tech.industries && (
                      <div>
                        <h5 className={`text-sm font-medium ${textColors.secondary} mb-2`}>
                          {language === 'en' ? 'Key Industries:' : 'Hauptbranchen:'}
                        </h5>
                        <div className="flex flex-wrap gap-2">
                          {tech.industries.map((industry, iIndex) => (
                            <span key={iIndex} className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded text-xs">
                              {industry}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {tech.methodologies && (
                      <div>
                        <h5 className={`text-sm font-medium ${textColors.secondary} mb-2`}>
                          {language === 'en' ? 'Methodologies:' : 'Methoden:'}
                        </h5>
                        <div className="space-y-1">
                          {tech.methodologies.map((methodology, mIndex) => (
                            <div key={mIndex} className={`text-xs ${textColors.secondary}`}>
                              • {methodology}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 6-Stage AI Implementation Roadmap */}
      <div className="container py-20">
        <div className="text-center mb-16">
          <h2 className={`text-4xl font-bold ${textColors.primary} mb-4`}>
            {language === 'en' ? '6-Stage AI Implementation Roadmap' : '6-Stufen KI-Implementierungs-Roadmap'}
          </h2>
          <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
            {language === 'en'
              ? 'Our proven methodology ensures successful AI integration tailored to your business needs'
              : 'Unsere bewährte Methodik gewährleistet eine erfolgreiche KI-Integration, die auf Ihre Geschäftsbedürfnisse zugeschnitten ist'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Stage 1 */}
          <div className={`${backgrounds.card} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                {language === 'en' ? 'Assessment & Strategy' : 'Bewertung & Strategie'}
              </h3>
            </div>
            <p className={`${textColors.secondary} text-sm leading-relaxed`}>
              {language === 'en'
                ? 'Comprehensive analysis of your current processes, data landscape, and business objectives to identify optimal AI opportunities.'
                : 'Umfassende Analyse Ihrer aktuellen Prozesse, Datenlandschaft und Geschäftsziele zur Identifikation optimaler KI-Möglichkeiten.'}
            </p>
          </div>

          {/* Stage 2 */}
          <div className={`${backgrounds.card} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                {language === 'en' ? 'Data Preparation' : 'Datenvorbereitung'}
              </h3>
            </div>
            <p className={`${textColors.secondary} text-sm leading-relaxed`}>
              {language === 'en'
                ? 'Collection, cleaning, and structuring of relevant data sources to ensure high-quality training datasets for optimal AI performance.'
                : 'Sammlung, Bereinigung und Strukturierung relevanter Datenquellen zur Sicherstellung hochwertiger Trainingsdatensätze für optimale KI-Leistung.'}
            </p>
          </div>

          {/* Stage 3 */}
          <div className={`${backgrounds.card} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                {language === 'en' ? 'Model Development' : 'Modellentwicklung'}
              </h3>
            </div>
            <p className={`${textColors.secondary} text-sm leading-relaxed`}>
              {language === 'en'
                ? 'Custom AI model creation or fine-tuning of existing models, optimized for your specific use cases and performance requirements.'
                : 'Benutzerdefinierte KI-Modell-Erstellung oder Fine-Tuning bestehender Modelle, optimiert für Ihre spezifischen Anwendungsfälle und Leistungsanforderungen.'}
            </p>
          </div>

          {/* Stage 4 */}
          <div className={`${backgrounds.card} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                {language === 'en' ? 'Integration & Testing' : 'Integration & Tests'}
              </h3>
            </div>
            <p className={`${textColors.secondary} text-sm leading-relaxed`}>
              {language === 'en'
                ? 'Seamless integration with your existing systems, comprehensive testing, and validation to ensure reliability and performance.'
                : 'Nahtlose Integration in Ihre bestehenden Systeme, umfassende Tests und Validierung zur Sicherstellung von Zuverlässigkeit und Leistung.'}
            </p>
          </div>

          {/* Stage 5 */}
          <div className={`${backgrounds.card} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-red-500 to-red-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                5
              </div>
              <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                {language === 'en' ? 'Deployment & Launch' : 'Bereitstellung & Start'}
              </h3>
            </div>
            <p className={`${textColors.secondary} text-sm leading-relaxed`}>
              {language === 'en'
                ? 'Strategic rollout with monitoring systems, user training, and support structures to ensure smooth adoption and immediate value delivery.'
                : 'Strategische Einführung mit Überwachungssystemen, Benutzerschulung und Support-Strukturen für reibungslose Adoption und sofortigen Wertbeitrag.'}
            </p>
          </div>

          {/* Stage 6 */}
          <div className={`${backgrounds.card} rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200`}>
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                6
              </div>
              <h3 className={`text-lg font-semibold ${textColors.primary}`}>
                {language === 'en' ? 'Optimization & Scaling' : 'Optimierung & Skalierung'}
              </h3>
            </div>
            <p className={`${textColors.secondary} text-sm leading-relaxed`}>
              {language === 'en'
                ? 'Continuous monitoring, performance optimization, and scaling strategies to maximize ROI and adapt to evolving business needs.'
                : 'Kontinuierliche Überwachung, Leistungsoptimierung und Skalierungsstrategien zur ROI-Maximierung und Anpassung an sich entwickelnde Geschäftsanforderungen.'}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className={getSectionClasses('alt')}>
        <div className="container py-16">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
              {language === 'en' ? 'Ready to Transform Your Business?' : 'Bereit, Ihr Unternehmen zu transformieren?'}
            </h2>
            <p className={`text-lg ${textColors.secondary} mb-8`}>
              {language === 'en'
                ? 'Discover how our technology solutions can be tailored to your specific needs and industry requirements.'
                : 'Entdecken Sie, wie unsere Technologielösungen auf Ihre spezifischen Bedürfnisse und Branchenanforderungen zugeschnitten werden können.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href={language === 'en' ? '/contact/booking' : '/de/kontakt/terminbuchung'}
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                {language === 'en' ? 'Schedule Consultation' : 'Beratung vereinbaren'}
              </a>
              <a
                href={language === 'en' ? '/solutions/industries' : '/de/loesungen/branchen'}
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 px-8 py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                {language === 'en' ? 'View Industry Solutions' : 'Branchenlösungen ansehen'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TechnologyPage