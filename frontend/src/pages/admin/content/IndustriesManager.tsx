import { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  PencilIcon,
  EyeIcon,
  PlusIcon,
  TrashIcon,
  BuildingOfficeIcon,
  HeartIcon,
  CogIcon,
  ShoppingBagIcon,
  BoltIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  CakeIcon,
  ChartBarIcon
} from '@heroicons/react/24/outline'

interface Industry {
  id: string
  name: string
  nameDE: string
  slug: string
  icon: typeof BuildingOfficeIcon
  marketSize: string
  growth: string
  status: 'published' | 'draft' | 'coming_soon'
  lastModified: string
}

const IndustriesManager = () => {
  const [industries] = useState<Industry[]>([
    {
      id: '1',
      name: 'Financial Services',
      nameDE: 'Finanzdienstleistungen',
      slug: 'fintech',
      icon: BuildingOfficeIcon,
      marketSize: '$15T',
      growth: '15%+',
      status: 'published',
      lastModified: '2024-08-31'
    },
    {
      id: '2',
      name: 'Healthcare & Life Sciences',
      nameDE: 'Gesundheitswesen & Biotechnologie',
      slug: 'healthcare',
      icon: HeartIcon,
      marketSize: '$4.3T',
      growth: '30%+',
      status: 'published',
      lastModified: '2024-08-31'
    },
    {
      id: '3',
      name: 'Manufacturing & Supply Chain',
      nameDE: 'Fertigung & Lieferkette',
      slug: 'manufacturing',
      icon: CogIcon,
      marketSize: '$12T',
      growth: '25%+',
      status: 'published',
      lastModified: '2024-08-31'
    },
    {
      id: '4',
      name: 'Retail & E-Commerce',
      nameDE: 'Einzelhandel & E-Commerce',
      slug: 'retail',
      icon: ShoppingBagIcon,
      marketSize: '$24T',
      growth: '20%+',
      status: 'published',
      lastModified: '2024-08-31'
    },
    {
      id: '5',
      name: 'Energy & Utilities',
      nameDE: 'Energie & Versorgung',
      slug: 'energy',
      icon: BoltIcon,
      marketSize: '$6T',
      growth: '15%+',
      status: 'published',
      lastModified: '2024-08-31'
    },
    {
      id: '6',
      name: 'Sales & Customer Service',
      nameDE: 'Vertrieb & Kundenservice',
      slug: 'sales',
      icon: ChatBubbleLeftRightIcon,
      marketSize: '$1.2T',
      growth: '25%+',
      status: 'coming_soon',
      lastModified: '2024-08-31'
    },
    {
      id: '7',
      name: 'Service Provider',
      nameDE: 'Dienstleister',
      slug: 'service-provider',
      icon: UserGroupIcon,
      marketSize: '$2.8T',
      growth: '30%+',
      status: 'coming_soon',
      lastModified: '2024-08-31'
    },
    {
      id: '8',
      name: 'Food & Beverage',
      nameDE: 'Lebensmittel & Getränke',
      slug: 'food-beverage',
      icon: CakeIcon,
      marketSize: '$8T',
      growth: '20%+',
      status: 'coming_soon',
      lastModified: '2024-08-31'
    }
  ])

  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([])

  const getStatusBadge = (status: Industry['status']) => {
    const badges = {
      published: 'bg-green-100 text-green-800',
      draft: 'bg-yellow-100 text-yellow-800',
      coming_soon: 'bg-gray-100 text-gray-800'
    }
    
    const labels = {
      published: 'Published',
      draft: 'Draft',
      coming_soon: 'Coming Soon'
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badges[status]}`}>
        {labels[status]}
      </span>
    )
  }

  const handleSelectIndustry = (industryId: string) => {
    setSelectedIndustries(prev => 
      prev.includes(industryId) 
        ? prev.filter(id => id !== industryId)
        : [...prev, industryId]
    )
  }

  const handleSelectAll = () => {
    setSelectedIndustries(
      selectedIndustries.length === industries.length 
        ? [] 
        : industries.map(industry => industry.id)
    )
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Industries Manager</h1>
            <p className="mt-2 text-gray-600">Manage industry landing pages and content</p>
          </div>
          <div className="flex space-x-3">
            <button className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 flex items-center">
              <PlusIcon className="h-5 w-5 mr-2" />
              Add Industry
            </button>
            <button 
              className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center"
              disabled={selectedIndustries.length === 0}
            >
              Bulk Actions
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Published</p>
              <p className="text-2xl font-semibold text-gray-900">
                {industries.filter(i => i.status === 'published').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <PencilIcon className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Draft</p>
              <p className="text-2xl font-semibold text-gray-900">
                {industries.filter(i => i.status === 'draft').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                <CogIcon className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Coming Soon</p>
              <p className="text-2xl font-semibold text-gray-900">
                {industries.filter(i => i.status === 'coming_soon').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <ChartBarIcon className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">{industries.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Industries Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Industry Pages</h2>
            <div className="flex items-center space-x-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-primary-600"
                  checked={selectedIndustries.length === industries.length}
                  onChange={handleSelectAll}
                />
                <span className="ml-2 text-sm text-gray-600">Select All</span>
              </label>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Select
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Market Data
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Modified
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {industries.map((industry) => (
                <tr key={industry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-primary-600"
                      checked={selectedIndustries.includes(industry.id)}
                      onChange={() => handleSelectIndustry(industry.id)}
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <industry.icon className="h-6 w-6 text-primary-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {industry.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {industry.nameDE}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{industry.marketSize}</div>
                    <div className="text-sm text-gray-500">{industry.growth} growth</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(industry.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {industry.lastModified}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Link
                        to={`/solutions/industries/${industry.slug}`}
                        target="_blank"
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </Link>
                      <button className="text-primary-600 hover:text-primary-900">
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Content Templates</h3>
          <p className="text-sm text-gray-600 mb-4">
            Use predefined templates to quickly create new industry pages with standard sections.
          </p>
          <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm">
            Browse Templates
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Operations</h3>
          <p className="text-sm text-gray-600 mb-4">
            Update multiple industries at once, export content, or apply changes across pages.
          </p>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 text-sm">
            Bulk Actions
          </button>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Analytics</h3>
          <p className="text-sm text-gray-600 mb-4">
            View performance metrics and visitor analytics for each industry page.
          </p>
          <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 text-sm">
            View Analytics
          </button>
        </div>
      </div>
    </div>
  )
}

export default IndustriesManager