import React from 'react';
import { 
  CircleStackIcon, 
  BoltIcon, 
  ShieldCheckIcon,
  CloudIcon,
  ChartBarIcon,
  CpuChipIcon,
  ArrowPathIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import SEOHead from '../../components/common/SEOHead';

const DataOperatingSystemPage: React.FC = () => {
  const { language } = useLanguage();

  const features = [
    {
      icon: CircleStackIcon,
      title: {
        en: 'Unified Data Management',
        de: 'Einheitliches Datenmanagement'
      },
      description: {
        en: 'Centralize all your data sources into a single, coherent platform with automated data discovery and cataloging.',
        de: 'Zentralisieren Sie alle Ihre Datenquellen in einer einzigen, kohärenten Plattform mit automatisierter Datenerkennung und Katalogisierung.'
      }
    },
    {
      icon: BoltIcon,
      title: {
        en: 'Real-time Processing',
        de: 'Echtzeitverarbeitung'
      },
      description: {
        en: 'Process and analyze data streams in real-time with our high-performance processing engine.',
        de: 'Verarbeiten und analysieren Sie Datenströme in Echtzeit mit unserer Hochleistungs-Verarbeitungsmaschine.'
      }
    },
    {
      icon: CpuChipIcon,
      title: {
        en: 'AI-Powered Insights',
        de: 'KI-gestützte Einblicke'
      },
      description: {
        en: 'Leverage advanced AI algorithms to automatically discover patterns and generate actionable insights.',
        de: 'Nutzen Sie fortschrittliche KI-Algorithmen, um automatisch Muster zu entdecken und umsetzbare Erkenntnisse zu generieren.'
      }
    },
    {
      icon: ShieldCheckIcon,
      title: {
        en: 'Enterprise Security',
        de: 'Unternehmenssicherheit'
      },
      description: {
        en: 'Bank-grade security with end-to-end encryption, access controls, and audit trails.',
        de: 'Banken-taugliche Sicherheit mit Ende-zu-Ende-Verschlüsselung, Zugriffskontrollen und Audit-Trails.'
      }
    },
    {
      icon: CloudIcon,
      title: {
        en: 'Multi-Cloud Deployment',
        de: 'Multi-Cloud-Deployment'
      },
      description: {
        en: 'Deploy across any cloud provider or on-premises infrastructure with seamless scalability.',
        de: 'Bereitstellung bei jedem Cloud-Anbieter oder On-Premises-Infrastruktur mit nahtloser Skalierbarkeit.'
      }
    },
    {
      icon: ArrowPathIcon,
      title: {
        en: 'Enterprise Integration',
        de: 'Enterprise-Integration'
      },
      description: {
        en: 'Connect with existing enterprise systems through pre-built connectors and APIs.',
        de: 'Verbindung mit bestehenden Enterprise-Systemen über vorgefertigte Konnektoren und APIs.'
      }
    }
  ];

  const capabilities = [
    {
      en: 'Data Lake & Warehouse',
      de: 'Data Lake & Warehouse'
    },
    {
      en: 'Stream Processing',
      de: 'Stream-Verarbeitung'
    },
    {
      en: 'Machine Learning Ops',
      de: 'Machine Learning Ops'
    },
    {
      en: 'Data Governance',
      de: 'Data Governance'
    },
    {
      en: 'Self-Service Analytics',
      de: 'Self-Service Analytics'
    },
    {
      en: 'API Management',
      de: 'API Management'
    }
  ];

  return (
    <>
      <SEOHead
        title={language === 'de' ? 'Daten-Betriebssystem | voltAIc Systems' : 'Data Operating System | voltAIc Systems'}
        description={language === 'de' 
          ? 'Das voltAIc Daten-Betriebssystem - Eine einheitliche Plattform für Datenmanagement, Echtzeitverarbeitung und KI-gestützte Analytics.'
          : 'The voltAIc Data Operating System - A unified platform for data management, real-time processing, and AI-powered analytics.'
        }
        canonical={language === 'de' ? '/de/produkte/daten-betriebssystem' : '/products/data-operating-system'}
      />

      <div className="bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
                <CircleStackIcon className="w-4 h-4" />
                <span>
                  {language === 'de' ? 'Enterprise Data Platform' : 'Enterprise Data Platform'}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {language === 'de' ? (
                  <>
                    Daten-<span className="text-yellow-300">Betriebssystem</span>
                  </>
                ) : (
                  <>
                    Data <span className="text-yellow-300">Operating System</span>
                  </>
                )}
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto">
                {language === 'de' 
                  ? 'Die einheitliche Plattform für modernes Datenmanagement, KI-Analytics und Enterprise-Integration'
                  : 'The unified platform for modern data management, AI analytics, and enterprise integration'
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors text-lg">
                  {language === 'de' ? 'Demo anfordern' : 'Request Demo'}
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors text-lg">
                  {language === 'de' ? 'Mehr erfahren' : 'Learn More'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {language === 'de' ? 'Kernfunktionen' : 'Core Features'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {language === 'de' 
                  ? 'Eine vollständige Plattform, die alle Aspekte Ihres Datenlebenszyklus abdeckt'
                  : 'A complete platform that covers all aspects of your data lifecycle'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-xl mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {feature.title[language as keyof typeof feature.title]}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description[language as keyof typeof feature.description]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Architecture Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  {language === 'de' ? 'Moderne Datenarchitektur' : 'Modern Data Architecture'}
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  {language === 'de' 
                    ? 'Aufgebaut auf modernsten Cloud-Native-Technologien für maximale Leistung, Skalierbarkeit und Zuverlässigkeit.'
                    : 'Built on cutting-edge cloud-native technologies for maximum performance, scalability, and reliability.'
                  }
                </p>
                
                <div className="space-y-4">
                  {capabilities.map((capability, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-800 font-medium">
                        {capability[language as keyof typeof capability]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="lg:text-center">
                <div className="bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl p-8 text-white">
                  <ChartBarIcon className="w-20 h-20 mx-auto mb-6 text-white/80" />
                  <h3 className="text-2xl font-bold mb-4">
                    {language === 'de' ? 'Bereit für die Zukunft?' : 'Ready for the Future?'}
                  </h3>
                  <p className="mb-6 text-lg">
                    {language === 'de' 
                      ? 'Starten Sie Ihre Datenreise mit unserem Betriebssystem'
                      : 'Start your data journey with our operating system'
                    }
                  </p>
                  <div className="space-y-3">
                    <button className="w-full bg-white text-indigo-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
                      {language === 'de' ? 'Live Demo buchen' : 'Book Live Demo'}
                    </button>
                    <button className="w-full border-2 border-white text-white font-medium py-3 px-6 rounded-lg hover:bg-white/10 transition-colors">
                      {language === 'de' ? 'Preise anfragen' : 'Get Pricing'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-20 bg-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {language === 'de' ? 'Warum unser Data OS?' : 'Why Our Data OS?'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16">
              {language === 'de' 
                ? 'Transformieren Sie Ihre Dateninfrastruktur mit einer Plattform, die für die Zukunft gebaut ist'
                : 'Transform your data infrastructure with a platform built for the future'
              }
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  value: '10x',
                  label: { en: 'Faster Deployment', de: 'Schnellere Bereitstellung' }
                },
                {
                  value: '90%',
                  label: { en: 'Cost Reduction', de: 'Kostenreduzierung' }
                },
                {
                  value: '99.9%',
                  label: { en: 'Uptime Guarantee', de: 'Verfügbarkeitsgarantie' }
                }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-lg">
                  <div className="text-4xl md:text-5xl font-bold text-indigo-600 mb-2">
                    {stat.value}
                  </div>
                  <div className="text-gray-700 font-medium">
                    {stat.label[language as keyof typeof stat.label]}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {language === 'de' ? 'Bereit, Ihre Daten zu revolutionieren?' : 'Ready to Revolutionize Your Data?'}
            </h2>
            <p className="text-xl mb-8">
              {language === 'de' 
                ? 'Entdecken Sie, wie unser Data Operating System Ihr Unternehmen transformieren kann'
                : 'Discover how our Data Operating System can transform your business'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-indigo-600 font-bold text-lg px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors">
                {language === 'de' ? 'Kostenlose Demo starten' : 'Start Free Demo'}
              </button>
              <button className="border-2 border-white text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-white/10 transition-colors">
                {language === 'de' ? 'Vertrieb kontaktieren' : 'Contact Sales'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DataOperatingSystemPage;