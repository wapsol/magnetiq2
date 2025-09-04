import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Language, getLanguageFromPath } from '../config/languages'
import translationService from '../services/translationService'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, namespace?: string, params?: Record<string, any>) => string
  isLoading: boolean
  availableLanguages: { code: Language; name: string }[]
  loadTranslations: (namespace: string) => Promise<void>
  clearTranslationCache: () => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const location = useLocation()
  const navigate = useNavigate()
  const [language, setLanguageState] = useState<Language>(() => {
    // Check localStorage first, then URL path, then default
    const stored = localStorage.getItem('preferred-language') as Language
    if (stored && (stored === 'en' || stored === 'de')) {
      return stored
    }
    return getLanguageFromPath(location.pathname)
  })
  const [isLoading, setIsLoading] = useState(false)
  const [translationCache, setTranslationCache] = useState<Map<string, Record<string, string>>>(new Map())

  useEffect(() => {
    const newLang = getLanguageFromPath(location.pathname)
    if (newLang !== language) {
      setLanguageState(newLang)
    }
  }, [location.pathname])

  // Path translation mappings
  const pathSegmentTranslations = {
    'solutions': 'loesungen',
    'loesungen': 'solutions',
    'industries': 'branchen',
    'branchen': 'industries',
    'services': 'dienstleistungen',
    'dienstleistungen': 'services',
    'about': 'ueber-uns',
    'ueber-uns': 'about',
    'contact': 'kontakt',
    'kontakt': 'contact',
    'resources': 'ressourcen',
    'ressourcen': 'resources',
    'webinars': 'webinare',
    'webinare': 'webinars',
    'whitepapers': 'whitepapers',
    'blog': 'blog',
    'tools': 'werkzeuge',
    'werkzeuge': 'tools',
    'products': 'produkte',
    'produkte': 'products',
    'technology': 'technologie',
    'technologie': 'technology',
    'case-studies': 'fallstudien',
    'fallstudien': 'case-studies',
    'story': 'geschichte',
    'geschichte': 'story',
    'team': 'team',
    'mission': 'mission',
    'careers': 'karriere',
    'karriere': 'careers',
    'partners': 'partner',
    'partner': 'partners',
    'news': 'presse',
    'presse': 'news',
    'booking': 'terminbuchung',
    'terminbuchung': 'booking',
    'general': 'allgemein',
    'allgemein': 'general',
    'support': 'support',
    'locations': 'standorte',
    'standorte': 'locations',
    'privacy': 'datenschutz',
    'datenschutz': 'privacy',
    'terms': 'nutzungsbedingungen',
    'nutzungsbedingungen': 'terms',
    'cookies': 'cookies',
    'imprint': 'impressum',
    'impressum': 'imprint'
  }

  const industrySlugTranslations = {
    'fintech': 'fintech',
    'healthcare': 'gesundheitswesen',
    'gesundheitswesen': 'healthcare',
    'manufacturing': 'fertigung',
    'fertigung': 'manufacturing',
    'retail': 'einzelhandel',
    'einzelhandel': 'retail',
    'energy': 'energie',
    'energie': 'energy',
    'sales': 'vertrieb',
    'vertrieb': 'sales',
    'service-provider': 'dienstleister',
    'dienstleister': 'service-provider',
    'food-beverage': 'lebensmittel',
    'lebensmittel': 'food-beverage'
  }

  const serviceSlugTranslations = {
    'ai-consulting': 'ki-beratung',
    'ki-beratung': 'ai-consulting',
    'digital-transformation': 'digitale-transformation',
    'digitale-transformation': 'digital-transformation',
    'automation': 'automatisierung',
    'automatisierung': 'automation',
    'development': 'entwicklung',
    'entwicklung': 'development'
  }

  const translatePathSegment = (segment: string, targetLang: Language): string => {
    // First try path segment translations
    if (pathSegmentTranslations[segment]) {
      return pathSegmentTranslations[segment]
    }
    
    // Then try industry slug translations
    if (industrySlugTranslations[segment]) {
      return industrySlugTranslations[segment]
    }
    
    // Then try service slug translations
    if (serviceSlugTranslations[segment]) {
      return serviceSlugTranslations[segment]
    }
    
    // Return original if no translation found
    return segment
  }

  const translatePath = (currentPath: string, targetLang: Language): string => {
    // Remove leading slash and split into segments
    const segments = currentPath.replace(/^\/+/, '').split('/').filter(Boolean)
    
    // Remove language prefix if present
    let pathSegments = segments
    if (segments[0] === 'de') {
      pathSegments = segments.slice(1)
    }
    
    // Translate each segment
    const translatedSegments = pathSegments.map(segment => 
      translatePathSegment(segment, targetLang)
    )
    
    // Construct new path
    let newPath = '/' + translatedSegments.join('/')
    
    // Add language prefix for German
    if (targetLang === 'de') {
      newPath = '/de' + (newPath === '/' ? '' : newPath)
    }
    
    // Handle root path
    if (newPath === '/' && targetLang === 'de') {
      newPath = '/de'
    }
    
    return newPath
  }

  const setLanguage = (newLang: Language) => {
    const currentPath = location.pathname
    const newPath = translatePath(currentPath, newLang)
    
    navigate(newPath)
    setLanguageState(newLang)
    
    // Persist language preference
    localStorage.setItem('preferred-language', newLang)
    document.documentElement.lang = newLang
  }

  const loadTranslations = useCallback(async (namespace: string) => {
    setIsLoading(true)
    try {
      const translations = await translationService.getTranslations(namespace, language)
      setTranslationCache(prev => {
        const newCache = new Map(prev)
        newCache.set(`${namespace}:${language}`, translations)
        return newCache
      })
    } catch (error) {
      console.error('Failed to load translations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [language])

  const t = useCallback((key: string, namespace: string = 'common', params?: Record<string, any>): string => {
    // Try to get from translation service cache first
    const cacheKey = `${namespace}:${language}`
    const namespaceTranslations = translationCache.get(cacheKey)
    
    let translation = ''
    
    if (namespaceTranslations && namespaceTranslations[key]) {
      translation = namespaceTranslations[key]
    } else {
      // Fallback to hardcoded translations for backward compatibility
      translation = translations[language]?.[key] || key
    }
    
    // Interpolate parameters if provided
    if (params && translation) {
      return interpolateParams(translation, params)
    }
    
    return translation
  }, [language, translationCache])

  const interpolateParams = (text: string, params: Record<string, any>): string => {
    return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return params[key]?.toString() || match
    })
  }

  const clearTranslationCache = useCallback(() => {
    setTranslationCache(new Map())
    translationService.clearCache()
  }, [])

  const availableLanguages = [
    { code: 'en' as Language, name: 'English' },
    { code: 'de' as Language, name: 'Deutsch' }
  ]

  // Load common translations on language change
  useEffect(() => {
    loadTranslations('common')
  }, [loadTranslations])

  return (
    <LanguageContext.Provider value={{ 
      language, 
      setLanguage, 
      t, 
      isLoading, 
      availableLanguages, 
      loadTranslations,
      clearTranslationCache 
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.services': 'Services',
    'nav.products': 'Products',
    'nav.solutions': 'Solutions',
    'nav.resources': 'Resources',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    
    // Services
    'services.ai_consulting': 'AI Consulting',
    'services.digital_transformation': 'Digital Transformation',
    'services.data_management': 'Data Management',
    'services.management_advisory': 'Management Advisory',
    'services.automation': 'Automation',
    'services.development': 'Development',
    'services.ai_consulting.description': 'Strategic AI implementation',
    'services.digital_transformation.description': 'Modernize your business',
    'services.data_management.description': 'Data strategy and governance',
    'services.management_advisory.description': 'Strategic IT consulting and transformation',
    
    // Products
    'products.data_operating_system': 'Data Operating System',
    'products.private_cloud': 'Private Cloud',
    'products.data_operating_system.description': 'Unified data management platform',
    'products.private_cloud.description': 'Secure cloud infrastructure',
    
    // Solutions
    'solutions.industries': 'Industries',
    'solutions.technology': 'Technology',
    'solutions.case_studies': 'Case Studies',
    'solutions.industries.description': 'Industry-specific solutions',
    'solutions.technology.description': 'Technology platforms',
    'solutions.case_studies.description': 'Success stories',
    
    // Industries
    'industries.fintech.title': 'Financial Services',
    'industries.healthcare.title': 'Healthcare & Life Sciences',
    'industries.manufacturing.title': 'Manufacturing & Supply Chain',
    'industries.retail.title': 'Retail & E-Commerce',
    'industries.energy.title': 'Energy & Utilities',
    'industries.sales.title': 'Sales & Customer Service',
    'industries.service_provider.title': 'Service Provider',
    'industries.food_beverage.title': 'Food & Beverage',
    'industries.additional': 'Additional Industries',
    'industries.coming_soon': 'More industry-specific solutions coming soon.',
    'industries.explore_other': 'Explore Other Industries',
    'industries.view_all': 'View all industries',
    'industries.status.coming_soon': 'Coming Soon',
    
    // Resources
    'resources.webinars': 'Webinars',
    'resources.whitepapers': 'Whitepapers',
    'resources.blog': 'Blog',
    'resources.tools': 'Tools',
    'resources.webinars.description': 'Live and recorded webinars',
    'resources.whitepapers.description': 'In-depth guides',
    
    // About
    'about.story': 'Our Story',
    'about.team': 'Team',
    'about.mission': 'Mission',
    'about.careers': 'Careers',
    'about.partners': 'Partners',
    'about.news': 'News',
    
    // Contact
    'contact.booking': 'Book Consultation',
    'contact.general': 'General Inquiry',
    'contact.support': 'Support',
    'contact.locations': 'Locations',
    
    // Footer
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms of Service',
    'footer.cookies': 'Cookie Policy',
    'footer.imprint': 'Imprint',
    'footer.rights': 'All rights reserved',
  },
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.services': 'Dienstleistungen',
    'nav.products': 'Produkte',
    'nav.solutions': 'Lösungen',
    'nav.resources': 'Ressourcen',
    'nav.about': 'Über uns',
    'nav.contact': 'Kontakt',
    
    // Services
    'services.ai_consulting': 'KI-Beratung',
    'services.digital_transformation': 'Digitale Transformation',
    'services.data_management': 'Datenmanagement',
    'services.management_advisory': 'Management-Beratung',
    'services.automation': 'Automatisierung',
    'services.development': 'Entwicklung',
    'services.ai_consulting.description': 'Strategische KI-Implementierung',
    'services.digital_transformation.description': 'Modernisieren Sie Ihr Unternehmen',
    'services.data_management.description': 'Datenstrategie und Governance',
    'services.management_advisory.description': 'Strategische IT-Beratung und Transformation',
    
    // Products
    'products.data_operating_system': 'Daten-Betriebssystem',
    'products.private_cloud': 'Private Cloud',
    'products.data_operating_system.description': 'Einheitliche Datenmanagement-Plattform',
    'products.private_cloud.description': 'Sichere Cloud-Infrastruktur',
    
    // Solutions
    'solutions.industries': 'Branchen',
    'solutions.technology': 'Technologie',
    'solutions.case_studies': 'Fallstudien',
    'solutions.industries.description': 'Branchenspezifische Lösungen',
    'solutions.technology.description': 'Technologieplattformen',
    'solutions.case_studies.description': 'Erfolgsgeschichten',
    
    // Industries
    'industries.fintech.title': 'Finanzdienstleistungen',
    'industries.healthcare.title': 'Gesundheitswesen & Biotechnologie',
    'industries.manufacturing.title': 'Fertigung & Lieferkette',
    'industries.retail.title': 'Einzelhandel & E-Commerce',
    'industries.energy.title': 'Energie & Versorgung',
    'industries.sales.title': 'Vertrieb & Kundenservice',
    'industries.service_provider.title': 'Dienstleister',
    'industries.food_beverage.title': 'Lebensmittel & Getränke',
    'industries.additional': 'Weitere Branchen',
    'industries.coming_soon': 'Weitere branchenspezifische Lösungen werden in Kürze verfügbar sein.',
    'industries.explore_other': 'Weitere Branchen entdecken',
    'industries.view_all': 'Alle Branchen anzeigen',
    'industries.status.coming_soon': 'Bald verfügbar',
    
    // Resources
    'resources.webinars': 'Webinare',
    'resources.whitepapers': 'Whitepapers',
    'resources.blog': 'Blog',
    'resources.tools': 'Tools',
    'resources.webinars.description': 'Live und aufgezeichnete Webinare',
    'resources.whitepapers.description': 'Ausführliche Leitfäden',
    
    // About
    'about.story': 'Unsere Geschichte',
    'about.team': 'Team',
    'about.mission': 'Mission',
    'about.careers': 'Karriere',
    'about.partners': 'Partner',
    'about.news': 'Presse',
    
    // Contact
    'contact.booking': 'Termin buchen',
    'contact.general': 'Allgemeine Anfrage',
    'contact.support': 'Support',
    'contact.locations': 'Standorte',
    
    // Footer
    'footer.privacy': 'Datenschutz',
    'footer.terms': 'Nutzungsbedingungen',
    'footer.cookies': 'Cookie-Richtlinie',
    'footer.imprint': 'Impressum',
    'footer.rights': 'Alle Rechte vorbehalten',
  }
}