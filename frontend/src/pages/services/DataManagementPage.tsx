import React from 'react';
import { 
  ChartBarIcon, 
  ShieldCheckIcon, 
  CloudArrowUpIcon,
  CubeIcon,
  ArrowPathIcon,
  DocumentChartBarIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import SEOHead from '../../components/common/SEOHead';
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling';

const DataManagementPage: React.FC = () => {
  const { language } = useLanguage();

  const features = [
    {
      icon: ChartBarIcon,
      title: {
        en: 'Data Strategy & Governance',
        de: 'Datenstrategie & Governance'
      },
      description: {
        en: 'Develop comprehensive data strategies and governance frameworks to ensure data quality, compliance, and optimal utilization across your organization.',
        de: 'Entwickeln Sie umfassende Datenstrategien und Governance-Frameworks, um Datenqualität, Compliance und optimale Nutzung in Ihrem Unternehmen zu gewährleisten.'
      }
    },
    {
      icon: CubeIcon,
      title: {
        en: 'Data Architecture Design',
        de: 'Datenarchitektur-Design'
      },
      description: {
        en: 'Design scalable data architectures that support your business objectives and enable seamless integration across systems.',
        de: 'Entwerfen Sie skalierbare Datenarchitekturen, die Ihre Geschäftsziele unterstützen und nahtlose Integration zwischen Systemen ermöglichen.'
      }
    },
    {
      icon: ShieldCheckIcon,
      title: {
        en: 'Data Quality & Cleansing',
        de: 'Datenqualität & Bereinigung'
      },
      description: {
        en: 'Implement robust data quality management processes to ensure your data is accurate, consistent, and reliable for decision-making.',
        de: 'Implementieren Sie robuste Datenqualitäts-Management-Prozesse, um sicherzustellen, dass Ihre Daten für Entscheidungsfindung genau, konsistent und zuverlässig sind.'
      }
    },
    {
      icon: CloudArrowUpIcon,
      title: {
        en: 'Master Data Management',
        de: 'Stammdatenmanagement'
      },
      description: {
        en: 'Establish a single source of truth for critical business entities through comprehensive master data management solutions.',
        de: 'Etablieren Sie eine einzige Wahrheitsquelle für kritische Geschäftsentitäten durch umfassende Stammdatenmanagement-Lösungen.'
      }
    },
    {
      icon: ArrowPathIcon,
      title: {
        en: 'Data Integration & Migration',
        de: 'Datenintegration & Migration'
      },
      description: {
        en: 'Seamlessly integrate data from multiple sources and migrate legacy systems to modern data platforms.',
        de: 'Integrieren Sie nahtlos Daten aus mehreren Quellen und migrieren Sie Legacy-Systeme zu modernen Datenplattformen.'
      }
    },
    {
      icon: DocumentChartBarIcon,
      title: {
        en: 'Analytics & Reporting Infrastructure',
        de: 'Analytics & Reporting-Infrastruktur'
      },
      description: {
        en: 'Build powerful analytics and reporting capabilities that transform raw data into actionable business insights.',
        de: 'Bauen Sie leistungsstarke Analytics- und Reporting-Funktionen auf, die Rohdaten in umsetzbare Geschäftseinsichten verwandeln.'
      }
    }
  ];

  const benefits = [
    {
      en: 'Up to 20% Value Creation',
      de: 'Bis zu 20% Wertschöpfung'
    },
    {
      en: 'GDPR & EU AI Act Compliance',
      de: 'DSGVO & EU KI-Gesetz Konformität'
    },
    {
      en: '€10,000 Cost Savings per Employee/Year',
      de: '€10.000 Kostenoptimierung pro Mitarbeiter/Jahr'
    },
    {
      en: '60% Faster Data Preparation',
      de: '60% schnellere Datenaufbereitung'
    },
    {
      en: '35% Performance Improvement',
      de: '35% Leistungssteigerung'
    },
    {
      en: 'Up to 10 Petabyte Scalability',
      de: 'Skalierbarkeit bis 10 Petabyte'
    }
  ];

  return (
    <>
      <SEOHead
        title={language === 'de' ? 'Datenmanagement Services' : 'Data Management Services'}
        description={language === 'de' 
          ? 'Professionelle Datenmanagement-Services von voltAIc Systems. Datenstrategie, Governance, Qualitätsmanagement und Analytics-Infrastruktur.'
          : 'Professional data management services by voltAIc Systems. Data strategy, governance, quality management, and analytics infrastructure.'
        }
        canonicalUrl={language === 'de' ? '/de/dienstleistungen/datenmanagement' : '/services/data-management'}
      />

      <div className={backgrounds.page}>
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {language === 'de' ? 'Datenmanagement' : 'Data Management'}
              </h1>
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto">
                {language === 'de' 
                  ? 'Transformieren Sie Ihre Daten in strategische Assets mit unserem Daten-Betriebssystem und vollständiger Datenhoheit. Zentralisierung trotz aller Vernetzung, wo Datensouveränität ausschließlich bei Ihnen liegt.'
                  : 'Transform your data into strategic assets with our Data Operating System and complete data sovereignty. Centralization despite all networking, where data sovereignty lies exclusively with you.'
                }
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  {language === 'de' ? 'Kostenlose Beratung' : 'Free Consultation'}
                </button>
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                  {language === 'de' ? 'Mehr erfahren' : 'Learn More'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className={getSectionClasses('alt')}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
                {language === 'de' ? 'Unsere Services' : 'Our Services'}
              </h2>
              <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto`}>
                {language === 'de' 
                  ? 'Wir bieten Ende-zu-Ende Datenmanagement-Lösungen, die Ihre Daten in wertvolle Geschäftseinsichten verwandeln'
                  : 'We provide end-to-end data management solutions that turn your data into valuable business insights'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className={`${getCardClasses()} shadow-lg hover:shadow-xl`}>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-6">
                    <feature.icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className={`text-xl font-semibold ${textColors.primary} mb-4`}>
                    {feature.title[language as keyof typeof feature.title]}
                  </h3>
                  <p className={textColors.secondary}>
                    {feature.description[language as keyof typeof feature.description]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Data Operating System Section */}
        <div className={getSectionClasses()}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className={`text-3xl font-bold ${textColors.primary} mb-6`}>
                  {language === 'de' ? 'voltAIc Daten-Betriebssystem (DOS)' : 'voltAIc Data Operating System (DOS)'}
                </h2>
                <p className={`text-lg ${textColors.secondary} mb-6`}>
                  {language === 'de' 
                    ? 'Unser Daten-Betriebssystem verwaltet das "Effizienz-Dreieck" aus Daten, Komplexität und Dynamik. Mit Schnittstellen zu ERP-, CRM- und Datenbanksystemen verarbeitet DOS bis zu 10 Petabyte Daten.'
                    : 'Our Data Operating System manages the "Efficiency Triangle" of data, complexity, and dynamics. With interfaces to ERP, CRM, and database systems, DOS processes up to 10 petabytes of data.'
                  }
                </p>
                <div className="space-y-4 mb-6">
                  {[
                    {
                      en: 'AI Data Mapper: Eliminates data silos, reduces data prep time by 60%',
                      de: 'AI Data Mapper: Eliminiert Datensilos, reduziert Datenaufbereitung um 60%'
                    },
                    {
                      en: 'Vector Space: Increases computational performance by 35%',
                      de: 'Vector Space: Steigert Rechenleistung um 35%'
                    },
                    {
                      en: 'Models: Supports LLMs & SLMs, reduces processing time by 40%',
                      de: 'Models: Unterstützt LLMs & SLMs, reduziert Verarbeitungszeit um 40%'
                    }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className={textColors.secondary}>
                        {feature[language as keyof typeof feature]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">
                  {language === 'de' ? 'Effizienz-Dreieck' : 'Efficiency Triangle'}
                </h3>
                <div className="space-y-4 mb-6">
                  <div className="flex items-center space-x-3">
                    <ChartBarIcon className="w-6 h-6" />
                    <span>{language === 'de' ? 'Daten harmonisieren' : 'Harmonize Data'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CubeIcon className="w-6 h-6" />
                    <span>{language === 'de' ? 'Komplexität reduzieren' : 'Reduce Complexity'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ArrowPathIcon className="w-6 h-6" />
                    <span>{language === 'de' ? 'Dynamik optimieren' : 'Optimize Dynamics'}</span>
                  </div>
                </div>
                <p className="text-white/90 text-sm">
                  {language === 'de' 
                    ? 'Bis 2027: 300 ZB Daten jährlich. DOS hilft dabei, diese Herausforderung zu meistern.'
                    : 'By 2027: 300 ZB data annually. DOS helps master this challenge.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Promise Section */}
        <div className={getSectionClasses('alt')}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className={`text-3xl font-bold ${textColors.primary} mb-6`}>
                {language === 'de' ? 'Unser Datenversprechen' : 'Our Data Promise'}
              </h2>
              <p className={`text-lg ${textColors.secondary} max-w-3xl mx-auto mb-8`}>
                {language === 'de' 
                  ? 'Wir betrachten Ihre Daten wie das Fundament eines Gebäudes - mit vollständiger Datensouveränität und EU-Konformität.'
                  : 'We view your data like the foundation of a building - with complete data sovereignty and EU compliance.'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: ShieldCheckIcon,
                  title: { en: 'Exclusivity', de: 'Exklusivität' },
                  description: { en: 'No mixing of customer data', de: 'Keine Vermischung von Kundendaten' }
                },
                {
                  icon: CloudArrowUpIcon,
                  title: { en: 'Sovereignty', de: 'Souveränität' },
                  description: { en: 'Storage based on your preference', de: 'Speicherung nach Ihren Wünschen' }
                },
                {
                  icon: DocumentChartBarIcon,
                  title: { en: 'Authority', de: 'Autorität' },
                  description: { en: 'GDPR & EU AI Act compliance', de: 'DSGVO & EU KI-Gesetz Konformität' }
                },
                {
                  icon: ArrowPathIcon,
                  title: { en: 'Security', de: 'Sicherheit' },
                  description: { en: 'Daily backup & restoration', de: 'Tägliche Sicherung & Wiederherstellung' }
                }
              ].map((promise, index) => (
                <div key={index} className={`${getCardClasses()} text-center p-6`}>
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-lg mb-4">
                    <promise.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className={`text-lg font-semibold ${textColors.primary} mb-2`}>
                    {promise.title[language as keyof typeof promise.title]}
                  </h3>
                  <p className={`${textColors.secondary} text-sm`}>
                    {promise.description[language as keyof typeof promise.description]}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <div className={`${getCardClasses()} p-6 max-w-2xl mx-auto`}>
                <p className={`${textColors.secondary} mb-4`}>
                  <strong>
                    {language === 'de' 
                      ? '84% der Verbraucher bevorzugen Unternehmen mit transparentem Datenmanagement'
                      : '84% of consumers prefer companies with transparent data management'
                    }
                  </strong>
                </p>
                <p className={textColors.secondary}>
                  {language === 'de' 
                    ? 'Potenzial für 30% Effizienzverbesserung durch Risikoreduktion'
                    : 'Potential for 30% efficiency improvement through risk reduction'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className={getSectionClasses()}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className={`text-3xl font-bold ${textColors.primary} mb-6`}>
                  {language === 'de' ? 'Warum Datenmanagement?' : 'Why Data Management?'}
                </h2>
                <p className={`text-lg ${textColors.secondary} mb-8`}>
                  {language === 'de' 
                    ? 'Effektives Datenmanagement ist der Grundstein für datengetriebene Entscheidungsfindung und digitale Transformation.'
                    : 'Effective data management is the foundation for data-driven decision making and digital transformation.'
                  }
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className={textColors.primary}>
                        {benefit[language as keyof typeof benefit]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:text-center">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                  <div className="text-center">
                    <ChartBarIcon className="w-16 h-16 mx-auto mb-4 text-white/80" />
                    <h3 className="text-2xl font-bold mb-4">
                      {language === 'de' ? 'Bereit anzufangen?' : 'Ready to Start?'}
                    </h3>
                    <p className="mb-6">
                      {language === 'de' 
                        ? 'Lassen Sie uns Ihre Datenherausforderungen besprechen'
                        : 'Let\'s discuss your data challenges'
                      }
                    </p>
                    <button className="bg-white text-blue-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                      {language === 'de' ? 'Kontakt aufnehmen' : 'Get in Touch'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Process Section */}
        <div className={getSectionClasses('alt')}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
              {language === 'de' ? 'Unser Ansatz' : 'Our Approach'}
            </h2>
            <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto mb-12`}>
              {language === 'de' 
                ? 'Wir folgen einem bewährten, methodischen Ansatz für das Datenmanagement'
                : 'We follow a proven, methodical approach to data management'
              }
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {[
                {
                  step: 1,
                  title: { en: 'Assessment', de: 'Bewertung' },
                  description: { en: 'Current state analysis', de: 'Ist-Zustand-Analyse' }
                },
                {
                  step: 2,
                  title: { en: 'Strategy', de: 'Strategie' },
                  description: { en: 'Data roadmap creation', de: 'Daten-Roadmap-Erstellung' }
                },
                {
                  step: 3,
                  title: { en: 'Implementation', de: 'Implementierung' },
                  description: { en: 'Solution deployment', de: 'Lösungs-Deployment' }
                },
                {
                  step: 4,
                  title: { en: 'Optimization', de: 'Optimierung' },
                  description: { en: 'Continuous improvement', de: 'Kontinuierliche Verbesserung' }
                }
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full text-xl font-bold mb-4">
                    {item.step}
                  </div>
                  <h3 className={`text-lg font-semibold ${textColors.primary} mb-2`}>
                    {item.title[language as keyof typeof item.title]}
                  </h3>
                  <p className={textColors.secondary}>
                    {item.description[language as keyof typeof item.description]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROI Section */}
        <div className={getSectionClasses('alt')}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className={`text-3xl font-bold ${textColors.primary} mb-12`}>
              {language === 'de' ? 'Investition & Wertschöpfung' : 'Investment & Value Creation'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {[
                {
                  value: '20%',
                  label: { en: 'Strategic Value Creation', de: 'Strategische Wertschöpfung' }
                },
                {
                  value: '€10.000',
                  label: { en: 'Cost Savings per Employee/Year', de: 'Kostenoptimierung pro Mitarbeiter/Jahr' }
                },
                {
                  value: '< 1 Jahr',
                  label: { en: 'Return on Investment', de: 'Return on Investment' }
                }
              ].map((stat, index) => (
                <div key={index} className={`${getCardClasses()} p-8 shadow-lg`}>
                  <div className="text-4xl md:text-5xl font-bold text-blue-600 mb-2">
                    {stat.value}
                  </div>
                  <div className={`font-medium ${textColors.primary}`}>
                    {stat.label[language as keyof typeof stat.label]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">
              {language === 'de' ? 'Starten Sie Ihre Datenreise mit voltAIc' : 'Start Your Data Journey with voltAIc'}
            </h2>
            <p className="text-xl mb-6">
              {language === 'de' 
                ? 'Entdecken Sie, wie unser Daten-Betriebssystem und Datenversprechen Ihr Unternehmen transformieren können'
                : 'Discover how our Data Operating System and data promise can transform your business'
              }
            </p>
            <p className="text-white/90 mb-8">
              {language === 'de' 
                ? 'Vollständige Datensouveränität • DSGVO-konform • Bis zu 10 Petabyte Verarbeitung'
                : 'Complete Data Sovereignty • GDPR Compliant • Up to 10 Petabyte Processing'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 font-bold text-lg px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors">
                {language === 'de' ? 'Kostenlose Beratung buchen' : 'Book Free Consultation'}
              </button>
              <button className="border-2 border-white text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-white/10 transition-colors">
                {language === 'de' ? 'DOS Demo anfragen' : 'Request DOS Demo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataManagementPage;