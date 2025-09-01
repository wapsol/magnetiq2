import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'

interface Consultant {
  id: string
  full_name: string
  email: string
  headline: string
  industry: string
  location: string
  status: string
  kyc_status: string
  average_rating?: number
  total_projects: number
  success_rate: number
  created_at: string
  last_active_at?: string
}

interface ConsultantFilters {
  search: string
  status: string
  kyc_status: string
  industry: string
}

export const ConsultantManagement: React.FC = () => {
  const { language } = useLanguage()
  const [consultants, setConsultants] = useState<Consultant[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState<ConsultantFilters>({
    search: '',
    status: '',
    kyc_status: '',
    industry: ''
  })
  const [pagination, setPagination] = useState({
    offset: 0,
    limit: 50,
    total: 0
  })
  
  const isGerman = language === 'de'

  useEffect(() => {
    loadConsultants()
  }, [filters, pagination.offset])

  const loadConsultants = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const params = new URLSearchParams({
        limit: pagination.limit.toString(),
        offset: pagination.offset.toString(),
        sort_by: 'created_at',
        sort_order: 'desc'
      })
      
      // Add filters
      if (filters.search) params.append('q', filters.search)
      if (filters.status) params.append('status', filters.status)
      if (filters.kyc_status) params.append('kyc_status', filters.kyc_status)
      if (filters.industry) params.append('industry', filters.industry)
      
      const response = await fetch(`/api/v1/consultants/admin/consultants?${params}`)
      const result = await response.json()
      
      if (result.success) {
        setConsultants(result.data.consultants)
        setPagination(prev => ({
          ...prev,
          total: result.data.total
        }))
      } else {
        setError(result.error || 'Failed to load consultants')
      }
    } catch (err) {
      setError(isGerman ? 'Fehler beim Laden der Berater' : 'Error loading consultants')
    } finally {
      setIsLoading(false)
    }
  }

  const updateConsultantStatus = async (consultantId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/v1/consultants/admin/consultants/${consultantId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus,
          notes: `Status updated to ${newStatus} by admin`
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        // Refresh the list
        loadConsultants()
      } else {
        alert(result.error || 'Status update failed')
      }
    } catch (err) {
      alert(isGerman ? 'Fehler beim Update des Status' : 'Error updating status')
    }
  }

  const generateAIProfile = async (consultantId: string) => {
    try {
      const response = await fetch(`/api/v1/consultants/admin/consultants/${consultantId}/generate-ai-profile`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (result.success) {
        alert(isGerman ? 'KI-Profil erfolgreich generiert' : 'AI profile generated successfully')
      } else {
        alert(result.error || 'AI profile generation failed')
      }
    } catch (err) {
      alert(isGerman ? 'Fehler bei der KI-Profil-Generierung' : 'Error generating AI profile')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-700 bg-green-100'
      case 'pending': return 'text-yellow-700 bg-yellow-100'
      case 'suspended': return 'text-red-700 bg-red-100'
      case 'kyc_review': return 'text-blue-700 bg-blue-100'
      default: return 'text-gray-700 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      active: isGerman ? 'Aktiv' : 'Active',
      pending: isGerman ? 'Ausstehend' : 'Pending',
      kyc_review: isGerman ? 'KYC-Prüfung' : 'KYC Review',
      suspended: isGerman ? 'Gesperrt' : 'Suspended',
      approved: isGerman ? 'Genehmigt' : 'Approved',
      rejected: isGerman ? 'Abgelehnt' : 'Rejected',
      not_started: isGerman ? 'Nicht begonnen' : 'Not Started',
      in_progress: isGerman ? 'In Bearbeitung' : 'In Progress',
      pending_review: isGerman ? 'Prüfung ausstehend' : 'Pending Review'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return CheckCircleIcon
      case 'suspended':
      case 'rejected':
        return XCircleIcon
      case 'pending':
      case 'kyc_review':
      case 'pending_review':
        return ClockIcon
      default:
        return ExclamationTriangleIcon
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isGerman ? 'Berater-Verwaltung' : 'Consultant Management'}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {isGerman 
              ? 'Verwalten Sie Beraterprofile, KYC-Status und Genehmigungen'
              : 'Manage consultant profiles, KYC status, and approvals'}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                {isGerman ? 'Suche' : 'Search'}
              </label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  id="search"
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  placeholder={isGerman ? 'Name oder E-Mail...' : 'Name or email...'}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10"
                />
                <MagnifyingGlassIcon className="absolute left-3 top-2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                {isGerman ? 'Status' : 'Status'}
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">{isGerman ? 'Alle Status' : 'All Status'}</option>
                <option value="active">{getStatusText('active')}</option>
                <option value="pending">{getStatusText('pending')}</option>
                <option value="kyc_review">{getStatusText('kyc_review')}</option>
                <option value="suspended">{getStatusText('suspended')}</option>
              </select>
            </div>

            {/* KYC Status Filter */}
            <div>
              <label htmlFor="kyc-status" className="block text-sm font-medium text-gray-700">
                KYC Status
              </label>
              <select
                id="kyc-status"
                value={filters.kyc_status}
                onChange={(e) => setFilters(prev => ({ ...prev, kyc_status: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">{isGerman ? 'Alle KYC-Status' : 'All KYC Status'}</option>
                <option value="not_started">{getStatusText('not_started')}</option>
                <option value="in_progress">{getStatusText('in_progress')}</option>
                <option value="pending_review">{getStatusText('pending_review')}</option>
                <option value="approved">{getStatusText('approved')}</option>
                <option value="rejected">{getStatusText('rejected')}</option>
              </select>
            </div>

            {/* Industry Filter */}
            <div>
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700">
                {isGerman ? 'Branche' : 'Industry'}
              </label>
              <select
                id="industry"
                value={filters.industry}
                onChange={(e) => setFilters(prev => ({ ...prev, industry: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">{isGerman ? 'Alle Branchen' : 'All Industries'}</option>
                <option value="Healthcare">{isGerman ? 'Gesundheitswesen' : 'Healthcare'}</option>
                <option value="Manufacturing">{isGerman ? 'Fertigung' : 'Manufacturing'}</option>
                <option value="Financial Services">{isGerman ? 'Finanzdienstleistungen' : 'Financial Services'}</option>
                <option value="Technology">{isGerman ? 'Technologie' : 'Technology'}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">
            {isGerman ? 'Lade Berater...' : 'Loading consultants...'}
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Consultants Table */}
      {!isLoading && !error && (
        <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
          <div className="min-w-full overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isGerman ? 'Berater' : 'Consultant'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    KYC
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isGerman ? 'Leistung' : 'Performance'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isGerman ? 'Erstellt' : 'Created'}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {isGerman ? 'Aktionen' : 'Actions'}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {consultants.map((consultant) => {
                  const StatusIcon = getStatusIcon(consultant.status)
                  const KYCIcon = getStatusIcon(consultant.kyc_status)
                  
                  return (
                    <tr key={consultant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {consultant.full_name}
                          </div>
                          <div className="text-sm text-gray-500">{consultant.email}</div>
                          <div className="text-xs text-gray-400 truncate max-w-xs">
                            {consultant.headline}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <StatusIcon className={`h-4 w-4 mr-2 ${getStatusColor(consultant.status).split(' ')[0]}`} />
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(consultant.status)}`}>
                            {getStatusText(consultant.status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <KYCIcon className={`h-4 w-4 mr-2 ${getStatusColor(consultant.kyc_status).split(' ')[0]}`} />
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(consultant.kyc_status)}`}>
                            {getStatusText(consultant.kyc_status)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{consultant.total_projects} {isGerman ? 'Projekte' : 'projects'}</div>
                          <div className="text-xs text-gray-500">
                            {Math.round(consultant.success_rate)}% {isGerman ? 'Erfolg' : 'success'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(consultant.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => window.open(`/admin/consultants/${consultant.id}`, '_blank')}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                            title={isGerman ? 'Details anzeigen' : 'View details'}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => generateAIProfile(consultant.id)}
                            className="text-purple-600 hover:text-purple-900 p-1 rounded"
                            title={isGerman ? 'KI-Profil generieren' : 'Generate AI profile'}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          
                          {/* Status Actions */}
                          {consultant.status === 'pending' && consultant.kyc_status === 'approved' && (
                            <button
                              onClick={() => updateConsultantStatus(consultant.id, 'active')}
                              className="text-green-600 hover:text-green-900 p-1 rounded"
                              title={isGerman ? 'Aktivieren' : 'Activate'}
                            >
                              <CheckCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                          
                          {consultant.status === 'active' && (
                            <button
                              onClick={() => updateConsultantStatus(consultant.id, 'suspended')}
                              className="text-red-600 hover:text-red-900 p-1 rounded"
                              title={isGerman ? 'Sperren' : 'Suspend'}
                            >
                              <XCircleIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.total > pagination.limit && (
            <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  {isGerman ? 'Zeige' : 'Showing'} {pagination.offset + 1} {isGerman ? 'bis' : 'to'}{' '}
                  {Math.min(pagination.offset + pagination.limit, pagination.total)} {isGerman ? 'von' : 'of'}{' '}
                  {pagination.total} {isGerman ? 'Beratern' : 'consultants'}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, offset: Math.max(0, prev.offset - prev.limit) }))}
                    disabled={pagination.offset === 0}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    {isGerman ? 'Zurück' : 'Previous'}
                  </button>
                  <button
                    onClick={() => setPagination(prev => ({ ...prev, offset: prev.offset + prev.limit }))}
                    disabled={pagination.offset + pagination.limit >= pagination.total}
                    className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    {isGerman ? 'Weiter' : 'Next'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && consultants.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">
            {isGerman ? 'Keine Berater gefunden' : 'No consultants found'}
          </p>
        </div>
      )}
    </div>
  )
}