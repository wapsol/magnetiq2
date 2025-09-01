import React from 'react';
import { 
  CloudIcon, 
  ShieldCheckIcon, 
  ServerIcon,
  GlobeAltIcon,
  CpuChipIcon,
  ClockIcon,
  LockClosedIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import SEOHead from '../../components/common/SEOHead';

const PrivateCloudPage: React.FC = () => {
  const { language } = useLanguage();

  const features = [
    {
      icon: ShieldCheckIcon,
      title: {
        en: 'GDPR-Compliant Infrastructure',
        de: 'DSGVO-konforme Infrastruktur'
      },
      description: {
        en: 'Dedicated infrastructure ensuring complete data sovereignty and regulatory compliance for European businesses.',
        de: 'Dedizierte Infrastruktur, die vollständige Datensouveränität und regulatorische Compliance für europäische Unternehmen gewährleistet.'
      }
    },
    {
      icon: CpuChipIcon,
      title: {
        en: 'Custom AI Model Deployment',
        de: 'Benutzerdefinierte KI-Modell-Bereitstellung'
      },
      description: {
        en: 'Deploy and run your proprietary AI models in a secure, dedicated environment with optimal performance.',
        de: 'Bereitstellung und Betrieb Ihrer proprietären KI-Modelle in einer sicheren, dedizierten Umgebung mit optimaler Leistung.'
      }
    },
    {
      icon: ServerIcon,
      title: {
        en: 'Scalable Compute Resources',
        de: 'Skalierbare Compute-Ressourcen'
      },
      description: {
        en: 'Auto-scaling infrastructure that adapts to your workload demands with enterprise-grade reliability.',
        de: 'Auto-Scaling-Infrastruktur, die sich an Ihre Workload-Anforderungen anpasst mit Enterprise-Zuverlässigkeit.'
      }
    },
    {
      icon: ClockIcon,
      title: {
        en: '24/7 Monitoring & Support',
        de: '24/7 Überwachung & Support'
      },
      description: {
        en: 'Round-the-clock monitoring with dedicated support team ensuring maximum uptime and performance.',
        de: 'Rund-um-die-Uhr-Überwachung mit dediziertem Support-Team für maximale Verfügbarkeit und Leistung.'
      }
    },
    {
      icon: ArrowPathIcon,
      title: {
        en: 'Hybrid Cloud Integration',
        de: 'Hybrid Cloud Integration'
      },
      description: {
        en: 'Seamlessly integrate with existing cloud infrastructure while maintaining data isolation.',
        de: 'Nahtlose Integration mit bestehender Cloud-Infrastruktur bei Aufrechterhaltung der Datenisolation.'
      }
    },
    {
      icon: LockClosedIcon,
      title: {
        en: 'Advanced Security',
        de: 'Erweiterte Sicherheit'
      },
      description: {
        en: 'Multi-layered security with encryption at rest and in transit, plus advanced threat protection.',
        de: 'Mehrschichtige Sicherheit mit Verschlüsselung im Ruhezustand und während der Übertragung plus erweiterter Bedrohungsschutz.'
      }
    }
  ];

  const benefits = [
    {
      en: 'Data Sovereignty',
      de: 'Datensouveränität'
    },
    {
      en: 'Regulatory Compliance',
      de: 'Regulatorische Compliance'
    },
    {
      en: 'Predictable Costs',
      de: 'Vorhersagbare Kosten'
    },
    {
      en: 'Dedicated Resources',
      de: 'Dedizierte Ressourcen'
    },
    {
      en: 'Custom Configuration',
      de: 'Benutzerdefinierte Konfiguration'
    },
    {
      en: 'Priority Support',
      de: 'Prioritäts-Support'
    }
  ];

  const specifications = [
    {
      category: { en: 'Compute', de: 'Rechenleistung' },
      specs: [
        { en: 'Up to 1000 vCPUs per node', de: 'Bis zu 1000 vCPUs pro Knoten' },
        { en: 'Up to 8TB RAM per node', de: 'Bis zu 8TB RAM pro Knoten' },
        { en: 'GPU acceleration available', de: 'GPU-Beschleunigung verfügbar' }
      ]
    },
    {
      category: { en: 'Storage', de: 'Speicher' },
      specs: [
        { en: 'NVMe SSD storage', de: 'NVMe SSD-Speicher' },
        { en: 'Up to 100PB capacity', de: 'Bis zu 100PB Kapazität' },
        { en: 'Automated backup & recovery', de: 'Automatisierte Sicherung & Wiederherstellung' }
      ]
    },
    {
      category: { en: 'Network', de: 'Netzwerk' },
      specs: [
        { en: '100Gbps connectivity', de: '100Gbps-Konnektivität' },
        { en: 'Private network isolation', de: 'Private Netzwerkisolation' },
        { en: 'CDN integration', de: 'CDN-Integration' }
      ]
    }
  ];

  return (
    <>
      <SEOHead
        title={language === 'de' ? 'Private Cloud | voltAIc Systems' : 'Private Cloud | voltAIc Systems'}
        description={language === 'de' 
          ? 'Sichere Private Cloud-Infrastruktur von voltAIc Systems. DSGVO-konforme, dedizierte Cloud-Umgebung für Enterprise-KI-Workloads.'
          : 'Secure Private Cloud infrastructure by voltAIc Systems. GDPR-compliant, dedicated cloud environment for enterprise AI workloads.'
        }
        canonical={language === 'de' ? '/de/produkte/private-cloud' : '/products/private-cloud'}
      />

      <div className="bg-white">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-white/20 text-white px-4 py-2 rounded-full text-sm font-medium mb-8">
                <CloudIcon className="w-4 h-4" />
                <span>
                  {language === 'de' ? 'Enterprise Infrastructure' : 'Enterprise Infrastructure'}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                {language === 'de' ? (
                  <>
                    Private <span className="text-blue-400">Cloud</span>
                  </>
                ) : (
                  <>
                    Private <span className="text-blue-400">Cloud</span>
                  </>
                )}
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto">
                {language === 'de' 
                  ? 'Sichere, dedizierte Cloud-Infrastruktur für kritische KI-Workloads mit vollständiger Datensouveränität'
                  : 'Secure, dedicated cloud infrastructure for critical AI workloads with complete data sovereignty'
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-blue-500 text-white px-8 py-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors text-lg">
                  {language === 'de' ? 'Angebot anfordern' : 'Request Quote'}
                </button>
                <button className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors text-lg">
                  {language === 'de' ? 'Architektur ansehen' : 'View Architecture'}
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
                {language === 'de' ? 'Enterprise-Features' : 'Enterprise Features'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {language === 'de' 
                  ? 'Alles was Sie für kritische Unternehmens-Workloads benötigen, in einer sicheren, dedizierten Umgebung'
                  : 'Everything you need for critical enterprise workloads, in a secure, dedicated environment'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-slate-500 to-slate-700 rounded-xl mb-6">
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

        {/* Specifications Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                {language === 'de' ? 'Technische Spezifikationen' : 'Technical Specifications'}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {language === 'de' 
                  ? 'Hochleistungsinfrastruktur für die anspruchsvollsten KI- und Daten-Workloads'
                  : 'High-performance infrastructure for the most demanding AI and data workloads'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {specifications.map((spec, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-slate-800 mb-6">
                    {spec.category[language as keyof typeof spec.category]}
                  </h3>
                  <ul className="space-y-3">
                    {spec.specs.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-gray-700">
                          {item[language as keyof typeof item]}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  {language === 'de' ? 'Warum Private Cloud?' : 'Why Private Cloud?'}
                </h2>
                <p className="text-lg text-gray-600 mb-8">
                  {language === 'de' 
                    ? 'Für Unternehmen, die maximale Kontrolle, Sicherheit und Leistung für ihre kritischen Workloads benötigen.'
                    : 'For enterprises that need maximum control, security, and performance for their critical workloads.'
                  }
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  {benefits.map((benefit, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-slate-500 to-slate-700 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-800 font-medium">
                        {benefit[language as keyof typeof benefit]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="lg:text-center">
                <div className="bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl p-8 text-white">
                  <ServerIcon className="w-20 h-20 mx-auto mb-6 text-white/80" />
                  <h3 className="text-2xl font-bold mb-4">
                    {language === 'de' ? 'Bereit für Enterprise?' : 'Ready for Enterprise?'}
                  </h3>
                  <p className="mb-6 text-lg">
                    {language === 'de' 
                      ? 'Starten Sie mit Ihrer dedizierten Cloud-Infrastruktur'
                      : 'Get started with your dedicated cloud infrastructure'
                    }
                  </p>
                  <div className="space-y-3">
                    <button className="w-full bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors">
                      {language === 'de' ? 'Beratung buchen' : 'Book Consultation'}
                    </button>
                    <button className="w-full border-2 border-white text-white font-medium py-3 px-6 rounded-lg hover:bg-white/10 transition-colors">
                      {language === 'de' ? 'Preisliste anfordern' : 'Request Pricing'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Section */}
        <div className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              {language === 'de' ? 'Sicherheit & Compliance' : 'Security & Compliance'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-16">
              {language === 'de' 
                ? 'Erfüllen Sie die strengsten Sicherheits- und Compliance-Anforderungen'
                : 'Meet the strictest security and compliance requirements'
              }
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { name: 'GDPR', certified: true },
                { name: 'ISO 27001', certified: true },
                { name: 'SOC 2 Type II', certified: true },
                { name: 'BSI C5', certified: true }
              ].map((cert, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-6">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheckIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900">{cert.name}</h3>
                  <p className="text-sm text-green-600 mt-1">
                    {language === 'de' ? 'Zertifiziert' : 'Certified'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="py-16 bg-gradient-to-r from-slate-800 to-slate-600 text-white">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              {language === 'de' ? 'Bereit für Ihre Private Cloud?' : 'Ready for Your Private Cloud?'}
            </h2>
            <p className="text-xl mb-8">
              {language === 'de' 
                ? 'Sprechen Sie mit unseren Experten über Ihre individuellen Anforderungen'
                : 'Speak with our experts about your specific requirements'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-blue-500 text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-blue-600 transition-colors">
                {language === 'de' ? 'Experten-Beratung' : 'Expert Consultation'}
              </button>
              <button className="border-2 border-white text-white font-bold text-lg px-8 py-4 rounded-lg hover:bg-white/10 transition-colors">
                {language === 'de' ? 'Architektur-Guide' : 'Architecture Guide'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivateCloudPage;