import { useState, useEffect } from 'react'
import { 
  PencilIcon,
  TrashIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  LanguageIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'
import translationService from '../../../services/translationService'

interface Translation {
  id: string
  namespace: string
  key: string
  source_text: string
  translated_text?: string
  target_language: string
  status: 'pending' | 'translated' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
  confidence?: number
  method?: string
}

interface TranslationStats {
  total_translations: number
  by_language: Record<string, number>
  by_status: Record<string, number>
  by_namespace: Record<string, number>
  completion_rate: Record<string, {
    total: number
    completed: number
    percentage: number
  }>
}

const TranslationManager = () => {
  const [translations, setTranslations] = useState<Translation[]>([])
  const [stats, setStats] = useState<TranslationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedTranslations, setSelectedTranslations] = useState<string[]>([])
  const [filters, setFilters] = useState({
    namespace: '',
    language: '',
    status: '',
    query: ''
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null)
  const [aiTranslating, setAiTranslating] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    limit: 50,
    offset: 0,
    total: 0
  })

  useEffect(() => {
    loadTranslations()
    loadStatistics()
  }, [filters, pagination.offset])

  const loadTranslations = async () => {
    setLoading(true)
    try {
      // Build query parameters
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString()
      })
      
      if (filters.namespace) params.append('namespace', filters.namespace)
      if (filters.language) params.append('language', filters.language)
      if (filters.status) params.append('status', filters.status)
      if (filters.query) params.append('query', filters.query)
      
      const response = await fetch(`/api/v1/translations/admin/translations?${params}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        const translationsData = data.data.items || data.data.translations || []
        const total = data.data.total || translationsData.length
        
        // Map API response to our Translation interface
        const mappedTranslations: Translation[] = translationsData.map((t: any) => ({
          id: t.id,
          namespace: t.namespace,
          key: t.key,
          source_text: t.source_text,
          translated_text: t.translated_text || '',
          target_language: t.target_language,
          status: t.status,
          created_at: t.created_at,
          updated_at: t.updated_at,
          confidence: t.confidence_score,
          method: t.translation_method
        }))
        
        setTranslations(mappedTranslations)
        setPagination(prev => ({ ...prev, total }))
      } else {
        console.error('Failed to load translations:', data)
        setTranslations([])
        setPagination(prev => ({ ...prev, total: 0 }))
      }
    } catch (error) {
      console.error('Failed to load translations:', error)
      setTranslations([])
      setPagination(prev => ({ ...prev, total: 0 }))
    } finally {
      setLoading(false)
    }
  }

  const loadStatistics = async () => {
    try {
      const response = await fetch('/api/v1/translations/admin/translations/statistics')
      const data = await response.json()
      
      if (data.success && data.data) {
        setStats(data.data)
      } else {
        console.error('Failed to load statistics:', data)
        // Fallback to empty stats
        setStats({
          total_translations: 0,
          by_language: {},
          by_status: {},
          by_namespace: {},
          completion_rate: {}
        })
      }
    } catch (error) {
      console.error('Failed to load statistics:', error)
      // Fallback to empty stats
      setStats({
        total_translations: 0,
        by_language: {},
        by_status: {},
        by_namespace: {},
        completion_rate: {}
      })
    }
  }

  const handleAITranslate = async (translation: Translation) => {
    setAiTranslating(translation.id)
    try {
      const result = await translationService.aiTranslate(
        translation.source_text,
        'en',
        translation.target_language,
        `Namespace: ${translation.namespace}, Key: ${translation.key}`
      )
      
      if (result?.success) {
        // Update the translation with AI result
        setTranslations(prev => prev.map(t => 
          t.id === translation.id 
            ? { 
                ...t, 
                translated_text: result.data.translated_text,
                status: 'translated' as const,
                confidence: result.data.confidence,
                method: result.data.method
              }
            : t
        ))
      }
    } catch (error) {
      console.error('AI translation failed:', error)
    } finally {
      setAiTranslating(null)
    }
  }

  const handleUpdateTranslation = async (id: string, translatedText: string, status: string = 'translated') => {
    try {
      // Mock update - replace with actual API
      setTranslations(prev => prev.map(t => 
        t.id === id 
          ? { ...t, translated_text: translatedText, status: status as any, updated_at: new Date().toISOString() }
          : t
      ))
    } catch (error) {
      console.error('Failed to update translation:', error)
    }
  }

  const handleBulkAction = async (action: string) => {
    if (selectedTranslations.length === 0) return
    
    try {
      switch (action) {
        case 'approve':
          setTranslations(prev => prev.map(t => 
            selectedTranslations.includes(t.id) 
              ? { ...t, status: 'approved' as const }
              : t
          ))
          break
        case 'reject':
          setTranslations(prev => prev.map(t => 
            selectedTranslations.includes(t.id) 
              ? { ...t, status: 'rejected' as const }
              : t
          ))
          break
        case 'ai_translate':
          // Batch AI translate
          const toTranslate = translations.filter(t => selectedTranslations.includes(t.id))
          const batchTexts = toTranslate.map(t => ({
            id: t.id,
            text: t.source_text,
            context: `Namespace: ${t.namespace}, Key: ${t.key}`
          }))
          
          const results = await translationService.batchTranslate(batchTexts, 'en', 'de')
          
          // Update translations with results
          setTranslations(prev => prev.map(t => {
            const result = results.find(r => r.id === t.id)
            if (result?.success) {
              return {
                ...t,
                translated_text: result.translated_text,
                status: 'translated' as const,
                confidence: result.confidence
              }
            }
            return t
          }))
          break
      }
      
      setSelectedTranslations([])
    } catch (error) {
      console.error('Bulk action failed:', error)
    }
  }

  const getStatusBadge = (status: Translation['status']) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: ClockIcon },
      translated: { bg: 'bg-blue-100', text: 'text-blue-800', icon: PencilIcon },
      approved: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircleIcon },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircleIcon }
    }
    
    const badge = badges[status]
    const Icon = badge.icon
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    )
  }

  if (loading && translations.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Translation Manager</h1>
            <p className="mt-2 text-gray-600">Manage multilingual content and AI-powered translations</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
              <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
              Import
            </button>
            <button className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
              <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
              Export
            </button>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Translation
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <LanguageIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Translations</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_translations}</p>
              </div>
            </div>
          </div>
          
          <div 
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilters(prev => ({ ...prev, status: filters.status === 'approved' ? '' : 'approved' }))}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center ${
                  filters.status === 'approved' ? 'ring-2 ring-green-500' : ''
                }`}>
                  <CheckCircleIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Approved</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.by_status.approved || 0}</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => setFilters(prev => ({ ...prev, status: filters.status === 'pending' ? '' : 'pending' }))}
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center ${
                  filters.status === 'pending' ? 'ring-2 ring-yellow-500' : ''
                }`}>
                  <ClockIcon className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.by_status.pending || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">German Completion</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.completion_rate.de?.percentage.toFixed(1) || 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search translations..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 w-full"
                  value={filters.query}
                  onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                />
              </div>
            </div>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              value={filters.namespace}
              onChange={(e) => setFilters(prev => ({ ...prev, namespace: e.target.value }))}
            >
              <option value="">All Namespaces</option>
              <option value="common">Common</option>
              <option value="industries">Industries</option>
              <option value="services">Services</option>
              <option value="admin">Admin</option>
            </select>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              value={filters.language}
              onChange={(e) => setFilters(prev => ({ ...prev, language: e.target.value }))}
            >
              <option value="">All Languages</option>
              <option value="de">German</option>
              <option value="en">English</option>
            </select>
            
            <select
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="translated">Translated</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedTranslations.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700">
                {selectedTranslations.length} translation{selectedTranslations.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleBulkAction('ai_translate')}
                  className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 flex items-center"
                >
                  <SparklesIcon className="h-4 w-4 mr-1" />
                  AI Translate
                </button>
                <button
                  onClick={() => handleBulkAction('approve')}
                  className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Translations Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary-600"
                    checked={selectedTranslations.length === translations.length}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTranslations(translations.map(t => t.id))
                      } else {
                        setSelectedTranslations([])
                      }
                    }}
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Key
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source Text
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Translation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {translations.map((translation) => (
                <tr key={translation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600"
                      checked={selectedTranslations.includes(translation.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTranslations(prev => [...prev, translation.id])
                        } else {
                          setSelectedTranslations(prev => prev.filter(id => id !== translation.id))
                        }
                      }}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{translation.key}</div>
                    <div className="text-sm text-gray-500">{translation.namespace}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {translation.source_text}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {editingTranslation?.id === translation.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="text"
                          className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                          defaultValue={translation.translated_text || ''}
                          onBlur={(e) => {
                            handleUpdateTranslation(translation.id, e.target.value)
                            setEditingTranslation(null)
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleUpdateTranslation(translation.id, e.currentTarget.value)
                              setEditingTranslation(null)
                            }
                            if (e.key === 'Escape') {
                              setEditingTranslation(null)
                            }
                          }}
                          autoFocus
                        />
                      </div>
                    ) : (
                      <div
                        className={`text-sm cursor-pointer hover:bg-gray-100 p-1 rounded ${
                          !translation.translated_text ? 'text-gray-400 italic' : 'text-gray-900'
                        }`}
                        onClick={() => setEditingTranslation(translation)}
                      >
                        {translation.translated_text || 'No translation'}
                        {translation.confidence && (
                          <span className="ml-2 text-xs text-gray-500">
                            ({Math.round(translation.confidence * 100)}%)
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(translation.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      {!translation.translated_text && (
                        <button
                          onClick={() => handleAITranslate(translation)}
                          disabled={aiTranslating === translation.id}
                          className="text-purple-600 hover:text-purple-900 disabled:opacity-50"
                        >
                          {aiTranslating === translation.id ? (
                            <div className="animate-spin h-4 w-4 border-2 border-purple-600 border-t-transparent rounded-full" />
                          ) : (
                            <SparklesIcon className="h-4 w-4" />
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => setEditingTranslation(translation)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {pagination.offset + 1} to {Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} results
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
              disabled={pagination.offset === 0}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
              disabled={pagination.offset + pagination.limit >= pagination.total}
              className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TranslationManager