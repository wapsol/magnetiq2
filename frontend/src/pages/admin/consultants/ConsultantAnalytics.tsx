import React, { useState, useEffect } from 'react'
import { useLanguage } from '../../../contexts/LanguageContext'
import { 
  ChartBarIcon,
  UsersIcon,
  BanknotesIcon,
  TrophyIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface OverviewMetrics {
  total_consultants: number
  new_consultants: number
  active_projects: number
  completed_projects: number
  new_consultants_change: number
}

interface PerformanceMetrics {
  average_rating: number
  average_response_rate: number
  average_response_time_hours: number
  project_success_rate: number
  total_reviews: number
}

interface RevenueMetrics {
  total_earnings: number
  platform_revenue: number
  consultant_net_earnings: number
  average_project_value: number
  earnings_change: number
  hourly_rates: {
    min: number
    max: number
    average: number
  }
}

interface IndustryBreakdown {
  industry: string
  consultant_count: number
  project_count: number
  total_earnings: number
}

interface TopPerformer {
  id: string
  full_name: string
  industry: string
  average_rating: number
  total_projects: number
  success_rate: number
  total_earnings: number
}

interface AnalyticsData {
  overview: OverviewMetrics
  performance: PerformanceMetrics
  revenue: RevenueMetrics
  industry_breakdown: IndustryBreakdown[]
  top_performers: TopPerformer[]
}

export const ConsultantAnalytics: React.FC = () => {
  const { language } = useLanguage()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedPeriod, setSelectedPeriod] = useState(30)
  
  const isGerman = language === 'de'

  useEffect(() => {
    loadAnalytics()
  }, [selectedPeriod])

  const loadAnalytics = async () => {
    setIsLoading(true)
    setError('')
    
    try {
      const [overviewRes, performanceRes, revenueRes, topPerformersRes] = await Promise.all([
        fetch(`/api/v1/consultants/analytics/platform/overview?days=${selectedPeriod}`),
        fetch(`/api/v1/consultants/analytics/platform/performance?days=${selectedPeriod}`),
        fetch(`/api/v1/consultants/analytics/platform/revenue?days=${selectedPeriod}`),
        fetch('/api/v1/consultants/analytics/platform/top-performers?limit=10')
      ])

      const [overviewData, performanceData, revenueData, topPerformersData] = await Promise.all([
        overviewRes.json(),
        performanceRes.json(), 
        revenueRes.json(),
        topPerformersRes.json()
      ])

      if (overviewData.success && performanceData.success && revenueData.success && topPerformersData.success) {
        setAnalytics({
          overview: overviewData.data.overview,
          performance: performanceData.data.performance,
          revenue: revenueData.data.revenue,
          industry_breakdown: performanceData.data.industry_breakdown || [],
          top_performers: topPerformersData.data.top_performers || []
        })
      } else {
        throw new Error('Failed to load analytics data')
      }
    } catch (err) {
      setError(isGerman ? 'Fehler beim Laden der Analytik' : 'Error loading analytics')
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatPercentage = (value: number) => {
    const sign = value > 0 ? '+' : ''
    return `${sign}${value.toFixed(1)}%`
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? ArrowUpIcon : ArrowDownIcon
  }

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-gray-200 h-32 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error || (isGerman ? 'Keine Daten verfügbar' : 'No data available')}</p>
        <button 
          onClick={loadAnalytics}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {isGerman ? 'Erneut versuchen' : 'Retry'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isGerman ? 'Berater-Analytik' : 'Consultant Analytics'}
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            {isGerman 
              ? 'Umfassende Einblicke in die Berater-Performance und Plattform-Metriken'
              : 'Comprehensive insights into consultant performance and platform metrics'}
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value={7}>{isGerman ? 'Letzte 7 Tage' : 'Last 7 days'}</option>
            <option value={30}>{isGerman ? 'Letzte 30 Tage' : 'Last 30 days'}</option>
            <option value={90}>{isGerman ? 'Letzte 90 Tage' : 'Last 90 days'}</option>
          </select>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {isGerman ? 'Berater gesamt' : 'Total Consultants'}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {analytics.overview.total_consultants}
              </p>
              <div className="flex items-center mt-2">
                {React.createElement(getChangeIcon(analytics.overview.new_consultants_change), {
                  className: `h-4 w-4 ${getChangeColor(analytics.overview.new_consultants_change)}`
                })}
                <span className={`text-sm ml-1 ${getChangeColor(analytics.overview.new_consultants_change)}`}>
                  {formatPercentage(analytics.overview.new_consultants_change)}
                </span>
                <span className="text-sm text-gray-500 ml-1">
                  {isGerman ? 'vs. vorherige Periode' : 'vs. previous period'}
                </span>
              </div>
            </div>
            <UsersIcon className="h-12 w-12 text-indigo-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {isGerman ? 'Aktive Projekte' : 'Active Projects'}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {analytics.overview.active_projects}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {analytics.overview.completed_projects} {isGerman ? 'abgeschlossen' : 'completed'}
              </p>
            </div>
            <ChartBarIcon className="h-12 w-12 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {isGerman ? 'Plattform-Umsatz' : 'Platform Revenue'}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {formatCurrency(analytics.revenue.platform_revenue)}
              </p>
              <div className="flex items-center mt-2">
                {React.createElement(getChangeIcon(analytics.revenue.earnings_change), {
                  className: `h-4 w-4 ${getChangeColor(analytics.revenue.earnings_change)}`
                })}
                <span className={`text-sm ml-1 ${getChangeColor(analytics.revenue.earnings_change)}`}>
                  {formatPercentage(analytics.revenue.earnings_change)}
                </span>
              </div>
            </div>
            <BanknotesIcon className="h-12 w-12 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                {isGerman ? 'Durchschn. Bewertung' : 'Avg. Rating'}
              </p>
              <p className="text-3xl font-bold text-gray-900">
                {analytics.performance.average_rating.toFixed(1)}
              </p>
              <p className="text-sm text-gray-500 mt-2">
                {analytics.performance.total_reviews} {isGerman ? 'Bewertungen' : 'reviews'}
              </p>
            </div>
            <TrophyIcon className="h-12 w-12 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {isGerman ? 'Performance-Kennzahlen' : 'Performance Metrics'}
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {isGerman ? 'Erfolgsquote' : 'Success Rate'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isGerman ? 'Erfolgreich abgeschlossene Projekte' : 'Successfully completed projects'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.performance.project_success_rate.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {isGerman ? 'Antwortrate' : 'Response Rate'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isGerman ? 'Durchschnittliche Antwortrate' : 'Average response rate'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.performance.average_response_rate.toFixed(1)}%
                  </p>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {isGerman ? 'Antwortzeit' : 'Response Time'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {isGerman ? 'Durchschnittliche Antwortzeit' : 'Average response time'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    {analytics.performance.average_response_time_hours.toFixed(1)}h
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {isGerman ? 'Stundensätze' : 'Hourly Rates'}
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">
                  {isGerman ? 'Minimum' : 'Minimum'}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(analytics.revenue.hourly_rates.min)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">
                  {isGerman ? 'Durchschnitt' : 'Average'}
                </span>
                <span className="text-lg font-bold text-indigo-600">
                  {formatCurrency(analytics.revenue.hourly_rates.average)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-900">
                  {isGerman ? 'Maximum' : 'Maximum'}
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(analytics.revenue.hourly_rates.max)}
                </span>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">
                    {isGerman ? 'Durchschnittlicher Projektwert' : 'Avg. Project Value'}
                  </span>
                  <span className="text-lg font-bold text-green-600">
                    {formatCurrency(analytics.revenue.average_project_value)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Industry Breakdown and Top Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {isGerman ? 'Branchen-Aufschlüsselung' : 'Industry Breakdown'}
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.industry_breakdown.slice(0, 5).map((industry, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{industry.industry}</p>
                    <p className="text-xs text-gray-500">
                      {industry.consultant_count} {isGerman ? 'Berater' : 'consultants'} • {industry.project_count} {isGerman ? 'Projekte' : 'projects'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(industry.total_earnings)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Performers */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">
              {isGerman ? 'Top-Performer' : 'Top Performers'}
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics.top_performers.slice(0, 5).map((performer, index) => (
                <div key={performer.id} className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-indigo-600">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {performer.full_name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {performer.industry} • ⭐ {performer.average_rating.toFixed(1)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">
                      {formatCurrency(performer.total_earnings)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {performer.total_projects} {isGerman ? 'Projekte' : 'projects'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}