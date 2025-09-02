import { Link } from 'react-router-dom'
import { 
  BoltIcon, 
  DocumentTextIcon, 
  VideoCameraIcon, 
  CalendarDaysIcon,
  GlobeAltIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  CpuChipIcon,
  ArrowRightIcon,
  SparklesIcon,
  CheckCircleIcon,
  LightBulbIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline'
import { 
  ContentTemplate, 
  HeroTemplate, 
  SectionTemplate, 
  FeatureTemplate, 
  CTATemplate 
} from '../../components/templates'
import HeroImageRenderer from '../../components/content/HeroImageRenderer'
import GalleryRenderer from '../../components/content/GalleryRenderer'
import ImageRenderer from '../../components/content/ImageRenderer'
import { backgrounds, textColors, borders, getCardClasses, getSectionClasses } from '../../utils/styling'

const HomePage = () => {
  const features = [
    {
      icon: <CpuChipIcon className="h-6 w-6" />,
      title: 'DOS - Data Operating System',
      description: 'Vollständige semantische Datenverwaltung mit autonomer KI-Integration für Enterprise-Umgebungen und komplexe Datenlandschaften.',
      href: '/webinars'
    },
    {
      icon: <ChartBarIcon className="h-6 w-6" />,
      title: 'AI Data Mapper',
      description: 'Intelligente Datenintegration und -transformation mit Machine Learning für komplexe Unternehmensstrukturen und Prozessautomatisierung.',
      href: '/whitepapers'
    },
    {
      icon: <BoltIcon className="h-6 w-6" />,
      title: 'AI Customizing & Model Fine-tuning',
      description: 'Maßgeschneiderte KI-Lösungen mit Model Fine-tuning für spezifische Geschäftsanforderungen und Prozessoptimierung.',
      href: '/book-consultation'
    },
    {
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      title: 'Elastic Autonomous Cloud Solutions',
      description: 'Skalierbare Cloud-native KI-Infrastruktur mit autonomer Verwaltung und Elastic Computing für Enterprise-Anwendungen.'
    },
  ]

  const stats = [
    { label: 'Enterprise AI Lösungen', value: '100+' },
    { label: 'Zufriedene Unternehmen', value: '50+' },
    { label: 'Deutsche Standorte', value: '2' },
    { label: 'Integrierte Datenquellen', value: '1000+' },
  ]

  const benefits = [
    'Semantische Datenmanagement-Plattform mit vollständiger Datensouveränität',
    'KI-gesteuerte Prozessautomatisierung und autonome Systeme',
    'Maßgeschneiderte Enterprise AI-Lösungen mit Model Fine-tuning',
    'Dediziertes Entwickler-Support-Team und 24/7 Service',
    'Bewiesene Zuverlässigkeit in komplexen Enterprise-Umgebungen',
    'Nachhaltige KI-Technologie für zukunftsorientierte Unternehmen',
  ]

  return (
    <ContentTemplate className={backgrounds.page}>
      {/* Hero Image Section with Professional Background */}
      <HeroImageRenderer
        block={{
          _type: 'hero_image',
          _key: 'voltaic-hero-main',
          title: 'Enterprise AI Agents und Semantic Data Management',
          subtitle: 'Daten-Intelligenz für Unternehmen - Souveränität und Autonomie',
          description: 'VoltAIc bedeutet künstliche Intelligenz langfristig gedacht: Der Schritt von großartigen KI-Möglichkeiten zu wirtschaftlich gesunden KI-Lösungen für jedes Unternehmen.',
          primary_action: {
            text: 'Enterprise Lösungen entdecken',
            href: '/webinars',
            variant: 'primary'
          },
          secondary_action: {
            text: 'Über voltAIc erfahren',
            href: '/about'
          },
          background_image: '/images/migrated/voltaic-systems/hero/hero_laptop_data.jpg',
          background_image_alt: 'Laptop mit Datenvisualisierung für Enterprise AI Solutions',
          mobile_image: '/images/migrated/voltaic-systems/hero/hero_building_reflection.jpg',
          overlay_opacity: 0.4,
          overlay_color: '#000000',
          text_alignment: 'left',
          text_position: 'center',
          content_width: 'wide',
          height: 'large'
        }}
        language="de"
      />

      {/* Stats Section */}
      <SectionTemplate
        title=""
        size="medium"
        background="white"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{stat.value}</div>
              <div className={`text-sm mt-2 ${textColors.secondary}`}>{stat.label}</div>
            </div>
          ))}
        </div>
      </SectionTemplate>

      {/* Industries Section */}
      <SectionTemplate
        title="KI-Lösungen für verschiedene Branchen"
        subtitle="Branchenspezifische Anwendungen"
        description="Von Finanzdienstleistungen bis hin zum Gesundheitswesen - unsere KI-Lösungen sind auf die spezifischen Anforderungen Ihrer Branche zugeschnitten"
        size="medium"
        background="white"
      >
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          <div className={`text-center p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 ${getCardClasses()}`}>
            <div className="text-4xl mb-3">🏦</div>
            <h4 className={`font-semibold mb-1 ${textColors.primary}`}>Financial Services</h4>
            <p className={`text-sm ${textColors.secondary}`}>Risikomanagement, Compliance und Fraud Detection</p>
          </div>
          <div className={`text-center p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 ${getCardClasses()}`}>
            <div className="text-4xl mb-3">🏥</div>
            <h4 className={`font-semibold mb-1 ${textColors.primary}`}>Healthcare</h4>
            <p className={`text-sm ${textColors.secondary}`}>Patientendaten-Management und Diagnostik-Unterstützung</p>
          </div>
          <div className={`text-center p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 ${getCardClasses()}`}>
            <div className="text-4xl mb-3">🏭</div>
            <h4 className={`font-semibold mb-1 ${textColors.primary}`}>Manufacturing</h4>
            <p className={`text-sm ${textColors.secondary}`}>Produktionsoptimierung und Qualitätskontrolle</p>
          </div>
          <div className={`text-center p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 ${getCardClasses()}`}>
            <div className="text-4xl mb-3">⚡</div>
            <h4 className={`font-semibold mb-1 ${textColors.primary}`}>Energy & Utilities</h4>
            <p className={`text-sm ${textColors.secondary}`}>Smart Grid Optimierung und Predictive Maintenance</p>
          </div>
          <div className={`text-center p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 ${getCardClasses()}`}>
            <div className="text-4xl mb-3">🏢</div>
            <h4 className={`font-semibold mb-1 ${textColors.primary}`}>Retail</h4>
            <p className={`text-sm ${textColors.secondary}`}>Customer Experience Enhancement und Inventory Management</p>
          </div>
          <div className={`text-center p-6 rounded-xl transition-all duration-300 hover:-translate-y-1 ${getCardClasses()}`}>
            <div className="text-4xl mb-3">🤝</div>
            <h4 className={`font-semibold mb-1 ${textColors.primary}`}>Sales & Customer Service</h4>
            <p className={`text-sm ${textColors.secondary}`}>CRM Enhancement und automatisierte Kundenbetreuung</p>
          </div>
        </div>
      </SectionTemplate>

      {/* Features Section */}
      <SectionTemplate
        title="Unsere KI-Plattform"
        subtitle="Von Datenintegration bis zu intelligenten Lösungen"
        description="Wir bieten alles von semantischem Datenmanagement bis hin zu vollständig integrierten KI-Systemen mit Process Automation und Model Fine-tuning."
        size="large"
        background="gray"
      >
        <FeatureTemplate
          features={features}
          layout="grid"
          columns={2}
          iconStyle="circle"
          showHover={true}
        />
      </SectionTemplate>

      {/* Mission Section */}
      <SectionTemplate
        title="Unsere Vision: Enterprise AI langfristig gedacht"
        subtitle="Datensouveränität und Autonomie für Ihr Unternehmen"
        description="VoltAIc Systems bedeutet KI langfristig gedacht: Der Schritt von großartigen KI-Möglichkeiten zu wirtschaftlich gesunden, nachhaltigen Enterprise AI-Lösungen für jedes Unternehmen."
        size="medium"
        background="primary"
        alignment="center"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <CpuChipIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${textColors.primary}`}>Autonomie</h3>
            <p className={textColors.secondary}>
              Vollständige Kontrolle über Ihre Daten und KI-Systeme ohne Abhängigkeiten von externen Anbietern
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${textColors.primary}`}>Souveränität</h3>
            <p className={textColors.secondary}>
              Datensouveränität und Unabhängigkeit in Ihrer IT-Infrastruktur mit deutscher Ingenieursqualität
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
              <ChartBarIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className={`text-xl font-semibold mb-2 ${textColors.primary}`}>Innovation</h3>
            <p className={textColors.secondary}>
              Modernste KI-Technologien und Semantic Data Engineering für nachhaltige Enterprise-Lösungen
            </p>
          </div>
        </div>
      </SectionTemplate>

      {/* Benefits Section */}
      <SectionTemplate
        title="Warum voltAIc Systems wählen?"
        description="Als erfahrener Partner für KI-Lösungen bieten wir Unternehmen die nötige Expertise für erfolgreiche digitale Transformation."
        size="large"
        background="white"
        alignment="left"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <ul className="space-y-4">
              {benefits.map((benefit, index) => (
                <li key={index} className="flex items-center space-x-3">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                  <span className={textColors.secondary}>{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-orange-100 dark:from-purple-900/20 dark:to-orange-900/20 rounded-2xl transform rotate-3"></div>
            <div className={`relative rounded-2xl shadow-xl p-8 ${backgrounds.card} ${borders.default} border`}>
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full mb-4">
                  <BoltIcon className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className={`text-xl font-semibold mb-2 ${textColors.primary}`}>KI-Experten</h3>
                <p className={`mb-6 ${textColors.secondary}`}>
                  Führend in der Entwicklung von KI-Lösungen mit Fokus auf Datensouveränität.
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">100+</div>
                    <div className={`text-xs ${textColors.muted}`}>AI Lösungen</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">24/7</div>
                    <div className={`text-xs ${textColors.muted}`}>Support</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">DE</div>
                    <div className={`text-xs ${textColors.muted}`}>Made</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionTemplate>

      {/* Technology Gallery */}
      <SectionTemplate
        title="Moderne Technologien für Enterprise AI"
        subtitle="Cutting-edge Technologies"
        description="Unsere KI-Lösungen basieren auf modernsten Technologien für Semantic Data Engineering und autonome Cloud-Systeme"
        size="large"
        background="gray"
      >
        <GalleryRenderer
          block={{
            _type: 'gallery',
            _key: 'voltaic-tech-gallery',
            title: '',
            images: [
              {
                src: '/images/migrated/voltaic-systems/graphics/ai_intelligence.webp',
                alt: 'Artificial Intelligence und Machine Learning Visualisierung',
                caption: 'Agentic AI - Intelligente autonome Systeme',
                width: 800,
                height: 600
              },
              {
                src: '/images/migrated/voltaic-systems/graphics/futuristic_tech.jpg',
                alt: 'Futuristische Technologie und Innovation',
                caption: 'Elastic Autonomous Cloud Solutions',
                width: 800,
                height: 600
              },
              {
                src: '/images/migrated/voltaic-systems/graphics/network_tech.jpg',
                alt: 'Netzwerk und Datenverbindungen',
                caption: 'Semantic Data Engineering',
                width: 800,
                height: 600
              }
            ],
            layout: 'grid',
            columns: 3,
            gap: 'large',
            aspect_ratio: '4:3',
            show_captions: true,
            enable_lightbox: true,
            _meta: {
              responsive: true,
              responsive_config: {
                mobile_columns: 1,
                tablet_columns: 2,
                desktop_columns: 3
              }
            }
          }}
          language="de"
        />
      </SectionTemplate>

      {/* Partner Gallery */}
      <SectionTemplate
        title="Technologie-Partner"
        subtitle="Zusammenarbeit mit Führenden der Branche"
        description="Partnerschaften mit führenden Technologie-Unternehmen für erstklassige Enterprise AI Solutions"
        size="medium"
        background="white"
      >
        <GalleryRenderer
          block={{
            _type: 'gallery',
            _key: 'voltaic-partners',
            title: '',
            images: [
              {
                src: '/images/migrated/voltaic-systems/partners/nvidia_logo.webp',
                alt: 'NVIDIA Logo - AI Computing Platform Partnership',
                width: 300,
                height: 200
              },
              {
                src: '/images/migrated/voltaic-systems/partners/google_logo.webp',
                alt: 'Google Logo - Cloud Services Integration',
                width: 300,
                height: 200
              },
              {
                src: '/images/migrated/voltaic-systems/partners/bvmw_logo.webp',
                alt: 'BVMW Logo - German Business Network',
                width: 300,
                height: 200
              },
              {
                src: '/images/migrated/voltaic-systems/partners/50_experts_logo.webp',
                alt: '50 Experts Logo - Professional Network',
                width: 300,
                height: 200
              }
            ],
            layout: 'grid',
            columns: 4,
            gap: 'large',
            aspect_ratio: '3:2',
            show_captions: false,
            enable_lightbox: false,
            _meta: {
              responsive: true,
              responsive_config: {
                mobile_columns: 2,
                tablet_columns: 2,
                desktop_columns: 4
              }
            }
          }}
          language="de"
        />
      </SectionTemplate>

      {/* CTA Section */}
      <CTATemplate
        title="Starten Sie Ihre Enterprise AI-Transformation"
        description="Schließen Sie sich Dutzenden von Unternehmen an, die mit voltAIc Systems ihre Datenlandschaft revolutionieren. Lassen Sie uns gemeinsam Ihre maßgeschneiderte KI-Lösung entwickeln."
        primaryAction={{
          text: "Enterprise Beratung anfragen",
          href: "/book-consultation"
        }}
        secondaryAction={{
          text: "Technische Dokumentation",
          href: "/whitepapers"
        }}
        variant="centered"
        background="gradient"
        size="large"
        pattern={true}
        icon={<BoltIcon className="h-12 w-12 text-purple-400" />}
      />
    </ContentTemplate>
  )
}

export default HomePage