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
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling';

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
        canonicalUrl={language === 'de' ? '/de/produkte/daten-betriebssystem' : '/products/data-operating-system'}
      />

      <div className={`${backgrounds.page}`}>
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50 dark:from-violet-900 dark:via-purple-900 dark:to-indigo-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 bg-violet-100 text-violet-800 dark:bg-violet-800 dark:text-violet-100 px-4 py-2 rounded-full text-sm font-medium mb-8">
                <CircleStackIcon className="w-4 h-4" />
                <span>
                  {language === 'de' ? 'Enterprise Data Platform' : 'Enterprise Data Platform'}
                </span>
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
                {language === 'de' ? (
                  <>
                    Daten-<span className="text-violet-600 dark:text-violet-400">Betriebssystem</span>
                  </>
                ) : (
                  <>
                    Data <span className="text-violet-600 dark:text-violet-400">Operating System</span>
                  </>
                )}
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto text-gray-700 dark:text-gray-200">
                {language === 'de' 
                  ? 'Das Daten-Betriebssystem für Unternehmen - effizient, sicher, skalierbar. Vision ist es, eine zentralisierende Instanz trotz aller Vernetzung und Interdependenzen zu ermöglichen, wo die Datenhoheit und -autonomie ausschließlich bei Kunden und Partnern liegt.'
                  : 'The Data Operating System for enterprises - efficient, secure, scalable. Our vision is to enable a centralizing instance despite all networking and interdependencies, where data authority and autonomy lie exclusively with customers and partners.'
                }
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="bg-violet-600 text-white px-8 py-4 rounded-lg font-semibold hover:bg-violet-700 transition-colors text-lg">
                  {language === 'de' ? 'Demo anfordern' : 'Request Demo'}
                </button>
                <button className="border-2 border-violet-600 text-violet-600 dark:text-violet-400 dark:border-violet-400 px-8 py-4 rounded-lg font-semibold hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors text-lg">
                  {language === 'de' ? 'Mehr erfahren' : 'Learn More'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Overview Section */}
        <div className={`py-20 ${backgrounds.page}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${textColors.primary}`}>
                  {language === 'de' ? 'DOS 1.0 - Determinismus-Standard' : 'DOS 1.0 - Determinism Standard'}
                </h2>
                <p className={`text-lg mb-6 ${textColors.secondary}`}>
                  {language === 'de' 
                    ? 'Das DOS verwaltet das "Effizienz-Dreieck" aus Daten, Komplexität und Dynamik. In Umgebungen mit über 90% Technologienutzung und 80% unstrukturierten Daten bewältigt es die schnell wachsenden Datenintegrationsanforderungen.'
                    : 'The DOS manages the "Efficiency Triangle" of data, complexity, and dynamics. In environments with over 90% technology usage and 80% unstructured data, it manages rapidly increasing data integration needs.'
                  }
                </p>
                <p className={`text-lg mb-8 ${textColors.secondary}`}>
                  {language === 'de' 
                    ? 'Mit Schnittstellen zu ERP-, CRM- und Datenbanksystemen sowie Deployment-Optionen (On-Premise, Hybrid oder Cloud) verarbeitet DOS bis zu 10 Petabyte Daten und bietet anpassbare Implementierungen für bis zu 20% Wertschöpfung.'
                    : 'With interfaces to ERP, CRM, and database systems and deployment options (on-premise, hybrid, or cloud), DOS processes up to 10 petabytes of data and offers customizable implementations for up to 20% value creation.'
                  }
                </p>
                <div className="flex space-x-4">
                  <button className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors">
                    {language === 'de' ? 'DOS Basic herunterladen' : 'Download DOS Basic'}
                  </button>
                  <button className="border border-violet-600 text-violet-600 px-6 py-3 rounded-lg hover:bg-violet-50 transition-colors">
                    {language === 'de' ? 'DOS Standard erkunden' : 'Explore DOS Standard'}
                  </button>
                </div>
              </div>
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">
                  {language === 'de' ? 'Effizienz-Dreieck' : 'Efficiency Triangle'}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CircleStackIcon className="w-6 h-6" />
                    <span>{language === 'de' ? 'Daten harmonisieren' : 'Harmonize Data'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CpuChipIcon className="w-6 h-6" />
                    <span>{language === 'de' ? 'Komplexität reduzieren' : 'Reduce Complexity'}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <ArrowPathIcon className="w-6 h-6" />
                    <span>{language === 'de' ? 'Dynamik optimieren' : 'Optimize Dynamics'}</span>
                  </div>
                </div>
                <p className="mt-6 text-sm text-white/90">
                  {language === 'de' 
                    ? 'Bis 2027 werden jährlich 300 ZB Daten generiert - DOS hilft dabei, diese Herausforderung zu meistern.'
                    : 'By 2027, 300 ZB of data will be generated annually - DOS helps master this challenge.'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Components Section */}
        <div className={`py-20 ${backgrounds.sectionAlt}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${textColors.primary}`}>
                {language === 'de' ? 'Komponenten' : 'Components'}
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${textColors.secondary}`}>
                {language === 'de' 
                  ? 'Eine umfassende Umgebung, die es Unternehmen ermöglicht, KI-Anwendungen schnell zu entwickeln, implementieren und skalieren.'
                  : 'A comprehensive environment that enables companies to quickly develop, implement, and scale AI applications tailored to their specific business requirements.'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* AI Data Mapper */}
              <div className={`rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${backgrounds.card}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl mb-6">
                  <CircleStackIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-semibold mb-4 ${textColors.primary}`}>
                  {language === 'de' ? 'AI Data Mapper' : 'AI Data Mapper'}
                </h3>
                <p className={`mb-6 leading-relaxed ${textColors.secondary}`}>
                  {language === 'de' 
                    ? 'Konsolidiert, strukturiert und harmonisiert Daten aus verschiedenen Unternehmens-Datenquellen. Transformiert Daten aus verschiedenen Systemen in ein einheitliches, KI-bereites Format. Eliminiert Datensilos und reduziert die Datenaufbereitungszeit um bis zu 60%.'
                    : 'Consolidates, structures, and harmonizes data from diverse corporate data sources. Transforms data from various systems into a consistent, AI-ready format. Eliminates data silos and reduces data preparation time by up to 60%.'
                  }
                </p>
                <ul className={`space-y-2 text-sm ${textColors.secondary}`}>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{language === 'de' ? 'AWS S3, Google Cloud Storage, Microsoft Azure (bis zu 10 GB/s)' : 'AWS S3, Google Cloud Storage, Microsoft Azure (up to 10 GB/s)'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{language === 'de' ? 'SQL-Datenbanken (bis zu 100 TB mit nativer SQL Runtime)' : 'SQL Databases (up to 100 TB with native SQL runtime)'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{language === 'de' ? 'SaaS-Anwendungen, Metadaten-Katalog mit OCR-Extraktion' : 'SaaS Applications, metadata catalog with OCR extraction'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span>{language === 'de' ? 'AES-256-Verschlüsselung für sensible Daten' : 'AES-256 encryption for sensitive data'}</span>
                  </li>
                </ul>
              </div>

              {/* Models */}
              <div className={`rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${backgrounds.card}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl mb-6">
                  <CpuChipIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-semibold mb-4 ${textColors.primary}`}>
                  {language === 'de' ? 'Models' : 'Models'}
                </h3>
                <p className={`mb-6 leading-relaxed ${textColors.secondary}`}>
                  {language === 'de' 
                    ? 'Vertikale Integration von Sprachmodellen mit spezialisierten GPU- und TPU-basierten Inference-Servern. Unterstützt sowohl Large Language Models (LLMs) als auch Small Language Models (SLMs) für effiziente Inferenz-Operationen und reduziert Verarbeitungszeit um bis zu 40%.'
                    : 'Vertical integration of language models with specialized GPU and TPU-based inference servers. Supports both Large Language Models (LLMs) and Small Language Models (SLMs) for efficient inference operations and reduces processing time by up to 40%.'
                  }
                </p>
                <ul className={`space-y-2 text-sm ${textColors.secondary}`}>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>{language === 'de' ? 'Skalierbare Hosting-Lösungen für verschiedene Modellgrößen' : 'Scalable hosting solutions for different model sizes'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>{language === 'de' ? 'Branchenspezifische Präzision (Finanz, Gesundheit, Fertigung)' : 'Industry-specific precision (Finance, Healthcare, Manufacturing)'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full"></div>
                    <span>{language === 'de' ? 'Echtzeit-Inferenz für Bildverarbeitung und Textgenerierung' : 'Real-time inference for image processing and text generation'}</span>
                  </li>
                </ul>
              </div>

              {/* Vector Space */}
              <div className={`rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${backgrounds.card}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-xl mb-6">
                  <GlobeAltIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-semibold mb-4 ${textColors.primary}`}>
                  {language === 'de' ? 'Vector Space' : 'Vector Space'}
                </h3>
                <p className={`mb-6 leading-relaxed ${textColors.secondary}`}>
                  {language === 'de' 
                    ? 'Ideale Lösung für Unternehmen, die schnelle und präzise Analysen in KI-unterstützten Prozessen benötigen. Ermöglicht Umwandlung von Skalardaten zu Vektordaten für maschinelles Lernen und steigert die Rechenleistung um bis zu 35% bei 25% Kostenreduzierung.'
                    : 'Ideal solution for companies needing fast and precise analyses in AI-supported processes. Enables conversion of scalar data to vector data for machine learning and increases computational performance by up to 35% with 25% cost reduction.'
                  }
                </p>
                <ul className={`space-y-2 text-sm ${textColors.secondary}`}>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>{language === 'de' ? 'Multidimensionale Datenstrukturen für erweiterte Berechnungen' : 'Multidimensional data structures for advanced calculations'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>{language === 'de' ? 'Optimierte Hardware-Nutzung für komplexe Algorithmen' : 'Optimized hardware utilization for complex algorithms'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    <span>{language === 'de' ? 'Schnellere und präzisere KI-Modell-Berechnungen' : 'Faster and more precise AI model calculations'}</span>
                  </li>
                </ul>
              </div>

              {/* User Interfaces */}
              <div className={`rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${backgrounds.card}`}>
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl mb-6">
                  <ShieldCheckIcon className="w-8 h-8 text-white" />
                </div>
                <h3 className={`text-2xl font-semibold mb-4 ${textColors.primary}`}>
                  {language === 'de' ? 'User Interfaces & APIs' : 'User Interfaces & APIs'}
                </h3>
                <p className={`mb-6 leading-relaxed ${textColors.secondary}`}>
                  {language === 'de' 
                    ? 'Ermöglicht effiziente Interaktion zwischen Benutzern und verschiedenen Systemen. Bietet benutzerfreundliche Tools für nahtlose Systemintegration und unterstützt sowohl Maschine-zu-Maschine- als auch Mensch-Maschine-Kommunikation. Steigert Systemeffizienz um bis zu 40%.'
                    : 'Enables efficient interaction between users and different systems. Provides user-friendly tools for seamless system integration and supports both machine-to-machine and human-machine communication. Increases system efficiency by up to 40%.'
                  }
                </p>
                <ul className={`space-y-2 text-sm ${textColors.secondary}`}>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>{language === 'de' ? 'Vielfältige Autorisierungsmechanismen für Zugriffskontrolle' : 'Diverse authorization mechanisms for access control'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>{language === 'de' ? 'APIs und Mikroservices für Systemkommunikation' : 'APIs and microservices for system communication'}</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span>{language === 'de' ? 'Reduziert Datenverlustrisiko um ca. 40%' : 'Reduces data loss risk by approximately 40%'}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className={`py-20 ${backgrounds.page}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${textColors.primary}`}>
                {language === 'de' ? 'Kernfunktionen' : 'Core Features'}
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${textColors.secondary}`}>
                {language === 'de' 
                  ? 'Eine vollständige Plattform, die alle Aspekte Ihres Datenlebenszyklus abdeckt'
                  : 'A complete platform that covers all aspects of your data lifecycle'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className={`rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${backgrounds.card}`}>
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-500 rounded-xl mb-6">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-xl font-semibold ${textColors.primary} mb-4`}>
                    {feature.title[language as keyof typeof feature.title]}
                  </h3>
                  <p className={`${textColors.secondary} leading-relaxed`}>
                    {feature.description[language as keyof typeof feature.description]}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Capabilities Section */}
        <div className="py-20 bg-violet-50 dark:bg-violet-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${textColors.primary}`}>
                {language === 'de' ? 'Systemfähigkeiten' : 'System Capabilities'}
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${textColors.secondary}`}>
                {language === 'de' 
                  ? 'DOS deckt sechs organisatorische Perspektiven ab und ist mit ERP-, CRM- und Datenbanksystemen kompatibel.'
                  : 'DOS covers six organizational perspectives and is compatible with ERP, CRM, and database systems.'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  title: { en: 'Business Perspective', de: 'Business-Perspektive' },
                  description: { en: 'Strategic value creation up to 20% through data-driven decision making and improved employee satisfaction', de: 'Strategische Wertschöpfung bis zu 20% durch datengetriebene Entscheidungsfindung und verbesserte Mitarbeiterzufriedenheit' }
                },
                {
                  title: { en: 'Technology Integration', de: 'Technologie-Integration' },
                  description: { en: 'Interfaces with ERP, CRM, and database systems. Supports all deployment models with up to 10 GB/s data transfer', de: 'Schnittstellen zu ERP-, CRM- und Datenbanksystemen. Unterstützt alle Deployment-Modelle mit bis zu 10 GB/s Datenübertragung' }
                },
                {
                  title: { en: 'People & User Experience', de: 'Menschen & Benutzererfahrung' },
                  description: { en: 'Natural language processing for intuitive interaction. 80% of companies prefer intuitive user interfaces', de: 'Natural Language Processing für intuitive Interaktion. 80% der Unternehmen bevorzugen intuitive Benutzeroberflächen' }
                },
                {
                  title: { en: 'Governance, Risk & Compliance', de: 'Governance, Risk & Compliance' },
                  description: { en: 'Built-in security guardrails, AES-256 encryption, and comprehensive GDPR compliance with legal and ethical standards', de: 'Integrierte Sicherheits-Leitplanken, AES-256-Verschlüsselung und umfassende DSGVO-Konformität mit rechtlichen und ethischen Standards' }
                },
                {
                  title: { en: 'Operations & Supply Chain', de: 'Betrieb & Lieferkette' },
                  description: { en: 'Process automation reducing errors and improving compliance. Up to 40% reduction in AI model training/inference latency', de: 'Prozessautomatisierung zur Fehlerreduzierung und Compliance-Verbesserung. Bis zu 40% Reduzierung der KI-Modell-Training/Inferenz-Latenz' }
                },
                {
                  title: { en: 'Sales & Distribution', de: 'Vertrieb & Distribution' },
                  description: { en: 'Enhanced customer insights through AI analytics and real-time data synchronization for improved distribution networks', de: 'Verbesserte Kundeneinblicke durch KI-Analytics und Echtzeit-Datensynchronisation für verbesserte Vertriebsnetzwerke' }
                }
              ].map((capability, index) => (
                <div key={index} className={`${backgrounds.card} rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300`}>
                  <h3 className={`text-lg font-semibold ${textColors.primary} mb-3`}>
                    {capability.title[language as keyof typeof capability.title]}
                  </h3>
                  <p className={`${textColors.secondary} text-sm leading-relaxed`}>
                    {capability.description[language as keyof typeof capability.description]}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-16 text-center">
              <div className={`${backgrounds.card} rounded-2xl p-8 shadow-lg max-w-2xl mx-auto`}>
                <h3 className={`text-2xl font-bold ${textColors.primary} mb-4`}>
                  {language === 'de' ? 'Technische Spezifikationen' : 'Technical Specifications'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-violet-600 mb-2">10 PB</div>
                    <div className={`${textColors.secondary} text-sm`}>
                      {language === 'de' ? 'Datenverarbeitungskapazität (Skalierbar 1 TB - 10 PB)' : 'Data Processing Capacity (Scalable 1 TB - 10 PB)'}
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-violet-600 mb-2">300 ZB</div>
                    <div className={`${textColors.secondary} text-sm`}>
                      {language === 'de' ? 'Prognostizierte Datenmenge bis 2027' : 'Projected Data Volume by 2027'}
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-violet-600 mb-2">90%+</div>
                    <div className={`${textColors.secondary} text-sm`}>
                      {language === 'de' ? 'Technologienutzung in Zielumgebungen' : 'Technology Usage in Target Environments'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Architecture Section */}
        <div className={`py-20 ${backgrounds.page}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${textColors.primary}`}>
                  {language === 'de' ? 'Moderne Datenarchitektur' : 'Modern Data Architecture'}
                </h2>
                <p className={`text-lg mb-8 ${textColors.secondary}`}>
                  {language === 'de' 
                    ? 'Aufgebaut auf modernsten Cloud-Native-Technologien für maximale Leistung, Skalierbarkeit und Zuverlässigkeit.'
                    : 'Built on cutting-edge cloud-native technologies for maximum performance, scalability, and reliability.'
                  }
                </p>
                
                <div className="space-y-4">
                  {capabilities.map((capability, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-violet-500 to-purple-500 rounded-full flex items-center justify-center">
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
                <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-8 text-white">
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
                    <button className="w-full bg-white text-violet-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors">
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

        {/* DOS Versions Section */}
        <div className={`py-20 ${backgrounds.sectionAlt}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${textColors.primary}`}>
                {language === 'de' ? 'DOS Versionen' : 'DOS Versions'}
              </h2>
              <p className={`text-xl max-w-3xl mx-auto ${textColors.secondary}`}>
                {language === 'de' 
                  ? 'Wählen Sie die richtige DOS-Version für Ihre Unternehmensanforderungen'
                  : 'Choose the right DOS version for your enterprise requirements'
                }
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* DOS Basic */}
              <div className={`${backgrounds.card} rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300`}>
                <div className="flex items-center justify-between mb-6">
                  <h3 className={`text-2xl font-bold ${textColors.primary}`}>DOS 1.0 Basic</h3>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    {language === 'de' ? 'Kostenlos' : 'Free'}
                  </span>
                </div>
                <p className={`${textColors.secondary} mb-6`}>
                  {language === 'de' 
                    ? 'Das Daten-Betriebssystem für Unternehmen - effizient, sicher, skalierbar. Zentralisiertes Datenmanagement mit verbesserter Datensicherheit, skalierbarer Infrastruktur und benutzerfreundlicher Oberfläche.'
                    : 'The Data Operating System for enterprises - efficient, secure, scalable. Centralized data management with enhanced data security, scalable infrastructure, and user-friendly interface.'
                  }
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{language === 'de' ? 'Natural Language Queries (NLQ) für 24/7 Zugriff' : 'Natural Language Queries (NLQ) for 24/7 access'}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{language === 'de' ? 'Vollständige Chat-Funktionalität mit LLM & SLM Integration' : 'Full Chat Functionality with LLM & SLM integration'}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{language === 'de' ? 'Integrierte Sicherheits-Leitplanken & DSGVO-Konformität' : 'Built-in security guardrails & GDPR compliance'}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">{language === 'de' ? 'Flexible Bereitstellung (On-Premise/Hybrid/Cloud)' : 'Flexible deployment (On-premise/Hybrid/Cloud)'}</span>
                  </li>
                </ul>
                <button className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition-colors">
                  {language === 'de' ? 'DOS Basic herunterladen' : 'Download DOS Basic'}
                </button>
              </div>

              {/* DOS Standard */}
              <div className="bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl p-8 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold">DOS 1.0 Standard</h3>
                  <span className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium">
                    {language === 'de' ? 'Enterprise' : 'Enterprise'}
                  </span>
                </div>
                <p className="text-white/90 mb-6">
                  {language === 'de' 
                    ? 'Vollständiges Enterprise-System mit Mapper (Datenstrukturierung), Vector (Service-Harmonisierung), Matrix (selbstlernende Optimierung) und Interface (intuitiver Zugang). Unterstützt sechs Organisationsperspektiven.'
                    : 'Complete enterprise system with Mapper (data structuring), Vector (service harmonization), Matrix (self-learning optimization), and Interface (intuitive access). Supports six organizational perspectives.'
                  }
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 backgrounds.page/20 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white/90">{language === 'de' ? 'Alle DOS Basic Funktionen' : 'All DOS Basic Features'}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 backgrounds.page/20 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white/90">{language === 'de' ? 'Vollständige Komponentensuite: Mapper, Vector, Matrix, Interface' : 'Complete component suite: Mapper, Vector, Matrix, Interface'}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 backgrounds.page/20 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white/90">{language === 'de' ? 'Bis zu 10 Petabyte Datenverarbeitung' : 'Up to 10 Petabyte Data Processing'}</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <div className="w-5 h-5 backgrounds.page/20 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white/90">{language === 'de' ? 'Business, Technologie, Menschen, GRC, Operations & Vertrieb' : 'Business, Technology, People, GRC, Operations & Sales'}</span>
                  </li>
                </ul>
                <button className="w-full bg-white text-indigo-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  {language === 'de' ? 'DOS Standard anfragen' : 'Request DOS Standard'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Benefits Section */}
        <div className="py-20 bg-violet-50 dark:bg-violet-900/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className={`text-3xl md:text-4xl font-bold ${textColors.primary} mb-4`}>
              {language === 'de' ? 'Warum unser Data OS?' : 'Why Our Data OS?'}
            </h2>
            <p className={`text-xl ${textColors.secondary} max-w-3xl mx-auto mb-16`}>
              {language === 'de' 
                ? 'Transformieren Sie Ihre Dateninfrastruktur mit einer Plattform, die für die Zukunft gebaut ist'
                : 'Transform your data infrastructure with a platform built for the future'
              }
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  value: '20%',
                  label: { en: 'Value Creation', de: 'Wertschöpfung' }
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
                <div key={index} className={`${backgrounds.card} rounded-xl p-8 shadow-lg`}>
                  <div className="text-4xl md:text-5xl font-bold text-violet-600 mb-2">
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
        <div className="py-16 bg-gradient-to-r from-violet-600 to-purple-600 text-white">
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
              <button className="bg-white text-violet-600 font-bold text-lg px-8 py-4 rounded-lg hover:bg-gray-100 transition-colors">
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