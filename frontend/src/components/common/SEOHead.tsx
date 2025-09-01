import { Helmet } from 'react-helmet-async'
import { useLanguage } from '../../contexts/LanguageContext'
import { useLocation } from 'react-router-dom'

export interface TranslatedText {
  en: string
  de?: string
}

interface SEOHeadProps {
  title: TranslatedText | string
  description: TranslatedText | string
  keywords?: TranslatedText | string
  canonicalUrl?: string
  alternateUrls?: {
    en: string
    de: string
  }
  ogImage?: string
  ogType?: string
  structuredData?: object
  noIndex?: boolean
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  alternateUrls,
  ogImage,
  ogType = 'website',
  structuredData,
  noIndex = false
}) => {
  const { language } = useLanguage()
  const location = useLocation()

  // Helper function to get localized content
  const getLocalizedContent = (content: TranslatedText | string): string => {
    if (typeof content === 'string') return content
    return content[language] || content.en || ''
  }

  // Generate alternate URLs if not provided
  const generateAlternateUrls = () => {
    if (alternateUrls) return alternateUrls
    
    const currentPath = location.pathname
    const baseUrl = window.location.origin
    
    // Remove language prefix from current path
    let pathWithoutLang = currentPath
    if (currentPath.startsWith('/de/')) {
      pathWithoutLang = currentPath.replace('/de/', '/')
    } else if (currentPath === '/de') {
      pathWithoutLang = '/'
    }
    
    // Generate localized paths
    const englishPath = pathWithoutLang
    const germanPath = pathWithoutLang === '/' ? '/de' : `/de${pathWithoutLang}`
    
    return {
      en: `${baseUrl}${englishPath}`,
      de: `${baseUrl}${germanPath}`
    }
  }

  const altUrls = generateAlternateUrls()
  const localizedTitle = getLocalizedContent(title)
  const localizedDescription = getLocalizedContent(description)
  const localizedKeywords = keywords ? getLocalizedContent(keywords) : undefined

  // Generate canonical URL
  const canonical = canonicalUrl || altUrls[language]

  // Generate structured data with language context
  const getStructuredData = () => {
    if (!structuredData) return null

    const baseStructuredData = {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "name": localizedTitle,
      "description": localizedDescription,
      "inLanguage": language === 'de' ? 'de-DE' : 'en-US',
      "url": canonical,
      ...structuredData
    }

    // Add organization info for voltAIc Systems
    const organization = {
      "@type": "Organization",
      "name": "voltAIc Systems",
      "description": language === 'de' 
        ? "KI-gesteuerte Datenoptimierung und digitale Transformation"
        : "AI-powered data optimization and digital transformation",
      "url": altUrls.en,
      "sameAs": [
        "https://linkedin.com/company/voltaic-systems",
        "https://twitter.com/voltaic_systems"
      ]
    }

    return {
      ...baseStructuredData,
      "publisher": organization
    }
  }

  const structuredDataJson = getStructuredData()

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={language} />
      <title>{localizedTitle}</title>
      <meta name="description" content={localizedDescription} />
      {localizedKeywords && <meta name="keywords" content={localizedKeywords} />}
      
      {/* Robots */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonical} />
      
      {/* Hreflang Tags */}
      <link rel="alternate" hrefLang="en" href={altUrls.en} />
      <link rel="alternate" hrefLang="de" href={altUrls.de} />
      <link rel="alternate" hrefLang="x-default" href={altUrls.en} />
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={localizedTitle} />
      <meta property="og:description" content={localizedDescription} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={language === 'de' ? 'de_DE' : 'en_US'} />
      <meta property="og:site_name" content="voltAIc Systems" />
      
      {/* Alternate locales */}
      {language === 'en' && (
        <meta property="og:locale:alternate" content="de_DE" />
      )}
      {language === 'de' && (
        <meta property="og:locale:alternate" content="en_US" />
      )}
      
      {ogImage && <meta property="og:image" content={ogImage} />}
      
      {/* Twitter Card Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@voltaic_systems" />
      <meta name="twitter:title" content={localizedTitle} />
      <meta name="twitter:description" content={localizedDescription} />
      {ogImage && <meta name="twitter:image" content={ogImage} />}
      
      {/* Language and Region */}
      <meta httpEquiv="content-language" content={language} />
      
      {/* Structured Data */}
      {structuredDataJson && (
        <script type="application/ld+json">
          {JSON.stringify(structuredDataJson)}
        </script>
      )}
      
      {/* Preconnect to External Resources */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* DNS Prefetch */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//fonts.gstatic.com" />
    </Helmet>
  )
}

// Helper component for common page types
export const IndustryPageSEO: React.FC<{
  industryName: TranslatedText
  industryDescription: TranslatedText
  marketSize?: string
  ogImage?: string
}> = ({ industryName, industryDescription, marketSize, ogImage }) => {
  const { language } = useLanguage()
  
  const title: TranslatedText = {
    en: `${industryName.en} Solutions - AI Data Optimization | voltAIc Systems`,
    de: `${industryName.de || industryName.en} Lösungen - KI-Datenoptimierung | voltAIc Systems`
  }

  const description: TranslatedText = {
    en: `Transform your ${industryName.en.toLowerCase()} business with AI-powered data optimization. ${industryDescription.en} ${marketSize ? `Market size: ${marketSize}` : ''}`.trim(),
    de: `Transformieren Sie Ihr ${(industryName.de || industryName.en).toLowerCase()}-Unternehmen mit KI-gestützter Datenoptimierung. ${industryDescription.de || industryDescription.en} ${marketSize ? `Marktgröße: ${marketSize}` : ''}`.trim()
  }

  const keywords: TranslatedText = {
    en: `${industryName.en}, AI, data optimization, digital transformation, business intelligence, automation`,
    de: `${industryName.de || industryName.en}, KI, Datenoptimierung, digitale Transformation, Business Intelligence, Automatisierung`
  }

  const structuredData = {
    "@type": "Service",
    "name": title[language],
    "description": description[language],
    "provider": {
      "@type": "Organization",
      "name": "voltAIc Systems"
    },
    "areaServed": {
      "@type": "Place",
      "name": language === 'de' ? "DACH Region" : "Global"
    }
  }

  return (
    <SEOHead
      title={title}
      description={description}
      keywords={keywords}
      ogImage={ogImage}
      structuredData={structuredData}
    />
  )
}

// Helper component for service pages
export const ServicePageSEO: React.FC<{
  serviceName: TranslatedText
  serviceDescription: TranslatedText
  ogImage?: string
}> = ({ serviceName, serviceDescription, ogImage }) => {
  const title: TranslatedText = {
    en: `${serviceName.en} - Professional AI Services | voltAIc Systems`,
    de: `${serviceName.de || serviceName.en} - Professionelle KI-Dienstleistungen | voltAIc Systems`
  }

  const description: TranslatedText = {
    en: `Professional ${serviceName.en.toLowerCase()} services. ${serviceDescription.en} Transform your business with AI-powered solutions.`,
    de: `Professionelle ${(serviceName.de || serviceName.en).toLowerCase()}-Dienstleistungen. ${serviceDescription.de || serviceDescription.en} Transformieren Sie Ihr Unternehmen mit KI-gestützten Lösungen.`
  }

  const structuredData = {
    "@type": "ProfessionalService",
    "name": title,
    "description": description,
    "provider": {
      "@type": "Organization", 
      "name": "voltAIc Systems"
    }
  }

  return (
    <SEOHead
      title={title}
      description={description}
      ogImage={ogImage}
      structuredData={structuredData}
    />
  )
}

export default SEOHead