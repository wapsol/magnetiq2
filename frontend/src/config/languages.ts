export type Language = 'en' | 'de'

export interface LanguageConfig {
  code: Language
  name: string
  nativeName: string
  dateFormat: string
  currencySymbol: string
}

export const languages: Record<Language, LanguageConfig> = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    dateFormat: 'MM/DD/YYYY',
    currencySymbol: '$'
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    dateFormat: 'DD.MM.YYYY',
    currencySymbol: '€'
  }
}

export const defaultLanguage: Language = 'en'

export function getLanguageFromPath(pathname: string): Language {
  if (pathname.startsWith('/de/') || pathname === '/de') {
    return 'de'
  }
  return 'en'
}