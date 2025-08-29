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

const HomePage = () => {
  const features = [
    {
      icon: <CpuChipIcon className="h-6 w-6" />,
      title: 'DOS - Data Operating System',
      description: 'Unser semantisches Datenmanagement-System ermöglicht Unternehmen die vollständige Kontrolle über ihre Datenlandschaft.',
      href: '/webinars'
    },
    {
      icon: <ChartBarIcon className="h-6 w-6" />,
      title: 'AI Data Mapper',
      description: 'KI-gesteuerte Datenintegration und -transformation für komplexe Unternehmensarchitekturen und Prozessautomatisierung.',
      href: '/whitepapers'
    },
    {
      icon: <BoltIcon className="h-6 w-6" />,
      title: 'AI Customizing',
      description: 'Maßgeschneiderte KI-Lösungen für Ihre spezifischen Geschäftsanforderungen mit Model Fine-tuning und Prozessoptimierung.',
      href: '/book-consultation'
    },
    {
      icon: <ShieldCheckIcon className="h-6 w-6" />,
      title: 'Enterprise Solutions',
      description: 'Branchenspezifische Lösungen für Finanzdienstleistungen, Gesundheitswesen, Fertigung und weitere Industrien.'
    },
  ]

  const stats = [
    { label: 'AI-Lösungen', value: '100+' },
    { label: 'Unternehmen', value: '50+' },
    { label: 'Standorte', value: '2' },
    { label: 'Datenquellen', value: '1000+' },
  ]

  const benefits = [
    'Semantische Datenmanagement-Plattform',
    'KI-gesteuerte Prozessautomatisierung',
    'Maßgeschneiderte Unternehmenslösungen',
    'Dediziertes Entwickler-Support-Team',
    'Bewiesene Zuverlässigkeit in komplexen Umgebungen',
    'Nachhaltige KI-Technologie für die Zukunft',
  ]

  return (
    <ContentTemplate className="bg-white">
      {/* Hero Section */}
      <HeroTemplate
        badge={{ text: "🤖 Stuttgart & Frankfurt • Deutschland", variant: "primary" }}
        title={<>
          Daten-Intelligenz für <span className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-200 bg-clip-text text-transparent">Unternehmen</span> <br />
          Souveränität und <span className="bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-200 bg-clip-text text-transparent">Autonomie</span> in der IT
        </>}
        description="VoltAIc bedeutet künstliche Intelligenz langfristig gedacht: Der Schritt von großartigen KI-Möglichkeiten zu wirtschaftlich gesunden KI-Lösungen für jedes Unternehmen. Semantische Datenquelle und KI-gesteuerte Unternehmenslösungen."
        primaryAction={{
          text: "Software entdecken",
          href: "/webinars",
          variant: "primary"
        }}
        secondaryAction={{
          text: "Mehr erfahren", 
          href: "/templates"
        }}
        backgroundVariant="gradient"
        backgroundImage={undefined}
        size="xlarge"
        alignment="center"
      >
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8 border-t border-primary-100 dark:border-gray-600 mt-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</div>
              <div className="text-sm text-primary-600 dark:text-primary-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </HeroTemplate>

      {/* Industries Section */}
      <SectionTemplate
        title="KI-Lösungen für verschiedene Branchen"
        subtitle="Branchenspezifische Anwendungen"
        description="Von Finanzdienstleistungen bis hin zum Gesundheitswesen - unsere KI-Lösungen sind auf die spezifischen Anforderungen Ihrer Branche zugeschnitten"
        size="medium"
        background="white"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-3">🏦</div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Financial Services</h4>
            <p className="text-sm text-gray-600 dark:text-gray-200">Risikomanagement & Compliance</p>
          </div>
          <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-3">🏥</div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Healthcare</h4>
            <p className="text-sm text-gray-600 dark:text-gray-200">Patientendaten & Diagnostik</p>
          </div>
          <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-3">🏭</div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Manufacturing</h4>
            <p className="text-sm text-gray-600 dark:text-gray-200">Produktionsoptimierung</p>
          </div>
          <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-3">📊</div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Analytics</h4>
            <p className="text-sm text-gray-600 dark:text-gray-200">Business Intelligence</p>
          </div>
          <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-3">🚚</div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Logistics</h4>
            <p className="text-sm text-gray-600 dark:text-gray-200">Supply Chain Management</p>
          </div>
          <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-3">🏢</div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Retail</h4>
            <p className="text-sm text-gray-600 dark:text-gray-200">Customer Experience</p>
          </div>
          <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-3">⚙️</div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Automation</h4>
            <p className="text-sm text-gray-600 dark:text-gray-200">Prozessautomatisierung</p>
          </div>
          <div className="text-center p-6 rounded-xl hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <div className="text-4xl mb-3">💱</div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Enterprise</h4>
            <p className="text-sm text-gray-600 dark:text-gray-200">Unternehmensintegration</p>
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
        title="Unsere Vision"
        subtitle="Künstliche Intelligenz langfristig gedacht"
        description="VoltAIc bedeutet KI langfristig gedacht: Der Schritt von großartigen KI-Möglichkeiten zu wirtschaftlich gesunden KI-Lösungen für jedes Unternehmen."
        size="medium"
        background="primary"
        alignment="center"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-gray-900">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <CpuChipIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">Autonomie</h3>
            <p className="text-gray-600 dark:text-gray-200">
              Vollständige Kontrolle über Ihre Daten und KI-Systeme ohne Abhängigkeiten
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <ShieldCheckIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">Souveränität</h3>
            <p className="text-gray-600 dark:text-gray-200">
              Datensouveränität und Unabhängigkeit in Ihrer IT-Infrastruktur
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <ChartBarIcon className="h-8 w-8 text-primary-600" />
            </div>
            <h3 className="text-xl font-semibold mb-2 dark:text-gray-100">Innovation</h3>
            <p className="text-gray-600 dark:text-gray-200">
              Modernste KI-Technologien für nachhaltige Unternehmenslösungen
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
                  <CheckCircleIcon className="h-6 w-6 text-success-600 dark:text-success-400 flex-shrink-0" />
                  <span className="text-gray-700 dark:text-gray-200">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 rounded-2xl transform rotate-3"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 dark:bg-primary-900/20 rounded-full mb-4">
                  <BoltIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">KI-Experten</h3>
                <p className="text-gray-600 dark:text-gray-200 mb-6">
                  Führend in der Entwicklung von KI-Lösungen mit Fokus auf Datensouveränität.
                </p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">100+</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">AI Lösungen</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-success-600 dark:text-success-400">24/7</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">Support</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-accent-600 dark:text-accent-400">DE</div>
                    <div className="text-xs text-gray-500 dark:text-gray-300">Made</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SectionTemplate>

      {/* CTA Section */}
      <CTATemplate
        title="Starten Sie Ihre KI-Transformation"
        description="Schließen Sie sich Dutzenden von Unternehmen an, die mit voltAIc Systems ihre Datenlandschaft revolutionieren. Lassen Sie uns gemeinsam Ihre maßgeschneiderte Lösung entwickeln."
        primaryAction={{
          text: "Beratung anfragen",
          href: "/book-consultation"
        }}
        secondaryAction={{
          text: "Dokumentation",
          href: "/whitepapers"
        }}
        variant="centered"
        background="gradient"
        size="large"
        pattern={true}
        icon={<BoltIcon className="h-12 w-12 text-primary-400" />}
      />
    </ContentTemplate>
  )
}

export default HomePage