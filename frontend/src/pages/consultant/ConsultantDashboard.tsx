import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../contexts/LanguageContext'
import { 
  CheckCircleIcon, 
  ExclamationTriangleIcon, 
  ClockIcon,
  BanknotesIcon,
  ChartBarIcon,
  UserIcon,
  DocumentIcon,
  CogIcon
} from '@heroicons/react/24/outline'

interface ConsultantProfile {
  id: string
  full_name: string
  email: string
  headline: string
  profile_picture_url?: string
  status: string
  kyc_status: string
  average_rating?: number
  total_projects: number
  completed_projects: number
  success_rate: number
  total_earnings: number
  ai_summary?: string
}

interface DashboardStats {
  profile_completion: number
  active_projects: number
  pending_proposals: number
  this_month_earnings: number
}

export const ConsultantDashboard: React.FC = () => {
  const { language } = useLanguage()
  const [profile, setProfile] = useState<ConsultantProfile | null>(null)
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  
  const isGerman = language === 'de'

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    
    try {
      const consultantId = localStorage.getItem('consultant_id')
      if (!consultantId) {
        setError(isGerman ? 'Keine Berater-ID gefunden' : 'No consultant ID found')
        return
      }

      const [profileResponse, statsResponse] = await Promise.all([
        fetch(`/api/v1/consultants/${consultantId}`),
        fetch(`/api/v1/consultants/admin/consultants/${consultantId}`) // Will need auth
      ])

      if (profileResponse.ok) {
        const profileResult = await profileResponse.json()
        if (profileResult.success) {
          setProfile(profileResult.data)
        }
      }

      // Mock stats for now
      setStats({
        profile_completion: 75,
        active_projects: 2,
        pending_proposals: 5,
        this_month_earnings: 4250
      })

    } catch (err) {
      setError(isGerman ? 'Fehler beim Laden der Daten' : 'Error loading dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'suspended': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusText = (status: string) => {
    const statusMap = {
      active: isGerman ? 'Aktiv' : 'Active',
      pending: isGerman ? 'Ausstehend' : 'Pending',
      kyc_review: isGerman ? 'KYC-Prüfung' : 'KYC Review',
      suspended: isGerman ? 'Gesperrt' : 'Suspended'
    }
    return statusMap[status as keyof typeof statusMap] || status
  }

  const quickActions = [
    {
      title: isGerman ? 'Profil bearbeiten' : 'Edit Profile',
      description: isGerman ? 'Aktualisieren Sie Ihre Beraterinformationen' : 'Update your consultant information',
      icon: UserIcon,
      href: '/consultant/profile'
    },
    {
      title: isGerman ? 'KYC vervollständigen' : 'Complete KYC',
      description: isGerman ? 'Identitätsprüfung abschließen' : 'Complete identity verification',
      icon: DocumentIcon,
      href: '/consultant/kyc',
      highlight: profile?.kyc_status !== 'approved'
    },
    {
      title: isGerman ? 'Projekte verwalten' : 'Manage Projects',
      description: isGerman ? 'Laufende und vergangene Projekte' : 'Current and past projects',
      icon: ChartBarIcon,
      href: '/consultant/projects'
    },
    {
      title: isGerman ? 'Einstellungen' : 'Settings',
      description: isGerman ? 'Konto- und Benachrichtigungseinstellungen' : 'Account and notification settings',
      icon: CogIcon,
      href: '/consultant/settings'
    }
  ]

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-500" />
          <h2 className="mt-2 text-lg font-medium text-gray-900">
            {error || (isGerman ? 'Profil nicht gefunden' : 'Profile not found')}
          </h2>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {profile.profile_picture_url ? (
                  <img
                    className="h-16 w-16 rounded-full"
                    src={profile.profile_picture_url}
                    alt={profile.full_name}
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-indigo-500 flex items-center justify-center">
                    <span className="text-xl font-medium text-white">
                      {profile.full_name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{profile.full_name}</h1>
                  <p className="text-sm text-gray-500">{profile.headline}</p>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(profile.status)}`}>
                      {getStatusText(profile.status)}
                    </span>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(profile.kyc_status)}`}>
                      KYC: {getStatusText(profile.kyc_status)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-gray-900">
                  €{stats?.this_month_earnings.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-gray-500">
                  {isGerman ? 'Dieser Monat' : 'This Month'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Stats & Quick Actions */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <ChartBarIcon className="h-8 w-8 text-indigo-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      {isGerman ? 'Erfolgsquote' : 'Success Rate'}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {Math.round(profile.success_rate)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <ClockIcon className="h-8 w-8 text-green-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      {isGerman ? 'Aktive Projekte' : 'Active Projects'}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats?.active_projects || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <DocumentIcon className="h-8 w-8 text-blue-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      {isGerman ? 'Angebote' : 'Proposals'}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {stats?.pending_proposals || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <BanknotesIcon className="h-8 w-8 text-yellow-600" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">
                      {isGerman ? 'Gesamtverdienst' : 'Total Earnings'}
                    </p>
                    <p className="text-2xl font-semibold text-gray-900">
                      €{profile.total_earnings.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">
                  {isGerman ? 'Schnellzugriff' : 'Quick Actions'}
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {quickActions.map((action, index) => (
                    <a
                      key={index}
                      href={action.href}
                      className={`flex items-start p-4 rounded-lg border-2 border-dashed transition-colors ${
                        action.highlight
                          ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <action.icon className={`flex-shrink-0 h-6 w-6 ${
                        action.highlight ? 'text-yellow-600' : 'text-gray-600'
                      }`} />
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-gray-900">
                          {action.title}
                          {action.highlight && (
                            <ExclamationTriangleIcon className="inline ml-1 h-4 w-4 text-yellow-500" />
                          )}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">{action.description}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Profile Summary & Actions */}
          <div className="space-y-6">
            
            {/* Profile Completion */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {isGerman ? 'Profil-Vollständigkeit' : 'Profile Completion'}
                </h3>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>{stats?.profile_completion}% {isGerman ? 'abgeschlossen' : 'complete'}</span>
                  </div>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats?.profile_completion || 0}%` }}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  {isGerman 
                    ? 'Vervollständigen Sie Ihr Profil, um mehr Kunden zu gewinnen.'
                    : 'Complete your profile to attract more clients.'}
                </p>
              </div>
            </div>

            {/* AI Profile Summary */}
            {profile.ai_summary && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {isGerman ? 'KI-Profil-Zusammenfassung' : 'AI Profile Summary'}
                  </h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {profile.ai_summary}
                  </p>
                  <button className="mt-4 text-sm text-indigo-600 hover:text-indigo-500">
                    {isGerman ? 'Bearbeiten' : 'Edit'}
                  </button>
                </div>
              </div>
            )}

            {/* Recent Activity Placeholder */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {isGerman ? 'Letzte Aktivitäten' : 'Recent Activity'}
                </h3>
                <div className="space-y-3">
                  <div className="text-sm text-gray-500 text-center py-8">
                    {isGerman 
                      ? 'Keine aktuellen Aktivitäten'
                      : 'No recent activity'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}