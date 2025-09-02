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
      en: 'Improved Data Quality',
      de: 'Verbesserte Datenqualität'
    },
    {
      en: 'Regulatory Compliance',
      de: 'Regulatorische Compliance'
    },
    {
      en: 'Cost Reduction',
      de: 'Kostenreduzierung'
    },
    {
      en: 'Faster Decision Making',
      de: 'Schnellere Entscheidungsfindung'
    },
    {
      en: 'Operational Efficiency',
      de: 'Betriebseffizienz'
    },
    {
      en: 'Scalable Architecture',
      de: 'Skalierbare Architektur'
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
        canonical={language === 'de' ? '/de/dienstleistungen/datenmanagement' : '/services/data-management'}
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
                  ? 'Transformieren Sie Ihre Daten in strategische Assets mit unseren umfassenden Datenmanagement-Services'
                  : 'Transform your data into strategic assets with our comprehensive data management services'
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

        {/* CTA Section */}
        <div className="py-16 bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold mb-4">
              {language === 'de' ? 'Lassen Sie uns über Ihre Daten sprechen' : 'Let\'s Talk About Your Data'}
            </h2>
            <p className="text-xl mb-8">
              {language === 'de' 
                ? 'Entdecken Sie, wie professionelles Datenmanagement Ihr Unternehmen transformieren kann'
                : 'Discover how professional data management can transform your business'
              }
            </p>
            <button className="bg-white text-blue-600 font-bold text-lg px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors">
              {language === 'de' ? 'Kostenlose Beratung buchen' : 'Book Free Consultation'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataManagementPage;