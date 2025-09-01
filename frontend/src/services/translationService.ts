import axios from 'axios'

export interface TranslationResponse {
  success: boolean
  data: {
    translations: Record<string, string>
    language: string
    namespace: string
  }
}

export interface AITranslationResponse {
  success: boolean
  data: {
    translated_text: string
    confidence: number
    method: string
    cached: boolean
  }
}

class TranslationService {
  private baseURL: string
  private cache: Map<string, Record<string, string>>
  private loading: Set<string>

  constructor() {
    this.baseURL = '/api/v1/translations'
    this.cache = new Map()
    this.loading = new Set()
  }

  private getCacheKey(namespace: string, language: string): string {
    return `${namespace}:${language}`
  }

  async getTranslations(namespace: string, language: string = 'en'): Promise<Record<string, string>> {
    const cacheKey = this.getCacheKey(namespace, language)
    
    // Return cached translations if available
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!
    }
    
    // Prevent duplicate requests
    if (this.loading.has(cacheKey)) {
      // Wait for ongoing request
      while (this.loading.has(cacheKey)) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return this.cache.get(cacheKey) || {}
    }
    
    this.loading.add(cacheKey)
    
    try {
      const response = await axios.get<TranslationResponse>(
        `${this.baseURL}/public/translations/${namespace}`,
        {
          params: { language },
          headers: {
            'Accept-Language': language === 'de' ? 'de-DE,de;q=0.9,en;q=0.8' : 'en-US,en;q=0.9'
          }
        }
      )
      
      if (response.data.success) {
        const translations = response.data.data.translations
        this.cache.set(cacheKey, translations)
        return translations
      }
      
      return {}
    } catch (error) {
      console.error(`Failed to load translations for ${namespace}:${language}`, error)
      return {}
    } finally {
      this.loading.delete(cacheKey)
    }
  }

  async getTranslation(
    namespace: string,
    key: string,
    language: string = 'en'
  ): Promise<string> {
    try {
      const response = await axios.get(
        `${this.baseURL}/public/translation/${namespace}/${key}`,
        {
          params: { language },
          headers: {
            'Accept-Language': language === 'de' ? 'de-DE,de;q=0.9,en;q=0.8' : 'en-US,en;q=0.9'
          }
        }
      )
      
      if (response.data.success) {
        return response.data.data.translation
      }
      
      return key // Fallback to key if translation not found
    } catch (error) {
      console.error(`Failed to load translation for ${namespace}.${key}:${language}`, error)
      return key
    }
  }

  async createTranslation(
    namespace: string,
    key: string,
    sourceText: string,
    targetLanguage: string = 'de',
    translatedText?: string,
    context?: string
  ): Promise<boolean> {
    try {
      const response = await axios.post(`${this.baseURL}/admin/translations`, {
        namespace,
        key,
        source_text: sourceText,
        target_language: targetLanguage,
        translated_text: translatedText,
        context
      })
      
      if (response.data.success) {
        // Invalidate cache for this namespace
        const cacheKey = this.getCacheKey(namespace, targetLanguage)
        this.cache.delete(cacheKey)
        return true
      }
      
      return false
    } catch (error) {
      console.error('Failed to create translation', error)
      return false
    }
  }

  async aiTranslate(
    text: string,
    sourceLanguage: string = 'en',
    targetLanguage: string = 'de',
    context?: string,
    domain: string = 'business'
  ): Promise<AITranslationResponse | null> {
    try {
      const response = await axios.post<AITranslationResponse>(
        `${this.baseURL}/admin/translations/ai-translate`,
        {
          text,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          context,
          domain
        }
      )
      
      return response.data
    } catch (error) {
      console.error('AI translation failed', error)
      return null
    }
  }

  async batchTranslate(
    texts: Array<{ id?: string; text: string; context?: string; domain?: string }>,
    sourceLanguage: string = 'en',
    targetLanguage: string = 'de',
    context?: string
  ): Promise<any[]> {
    try {
      const response = await axios.post(
        `${this.baseURL}/admin/translations/batch-translate`,
        {
          texts,
          source_language: sourceLanguage,
          target_language: targetLanguage,
          context
        }
      )
      
      if (response.data.success) {
        return response.data.data.results
      }
      
      return []
    } catch (error) {
      console.error('Batch translation failed', error)
      return []
    }
  }

  clearCache(namespace?: string, language?: string): void {
    if (namespace && language) {
      const cacheKey = this.getCacheKey(namespace, language)
      this.cache.delete(cacheKey)
    } else if (namespace) {
      // Clear all cache entries for namespace
      for (const [key] of this.cache.entries()) {
        if (key.startsWith(`${namespace}:`)) {
          this.cache.delete(key)
        }
      }
    } else {
      // Clear all cache
      this.cache.clear()
    }
  }

  preloadTranslations(namespaces: string[], languages: string[]): Promise<void[]> {
    const promises: Promise<void>[] = []
    
    for (const namespace of namespaces) {
      for (const language of languages) {
        promises.push(
          this.getTranslations(namespace, language).then(() => {})
        )
      }
    }
    
    return Promise.all(promises)
  }
}

export const translationService = new TranslationService()
export default translationService