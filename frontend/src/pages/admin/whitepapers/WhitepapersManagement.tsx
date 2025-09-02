import React, { useState, useEffect } from 'react'
import { backgrounds, textColors, getCardClasses } from '../../../utils/styling'
import {
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  DocumentArrowDownIcon,
  TagIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'

interface Whitepaper {
  id: number
  title: string
  description: string
  author: string
  authorTitle: string
  category: string
  status: 'draft' | 'published' | 'archived'
  publishDate: string
  downloadCount: number
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  tags: string[]
  fileUrl?: string
  coverImageUrl?: string
  createdAt: string
  updatedAt: string
}

const WhitepapersManagement: React.FC = () => {
  const [whitepapers, setWhitepapers] = useState<Whitepaper[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWhitepaper, setEditingWhitepaper] = useState<Whitepaper | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - replace with API calls
  useEffect(() => {
    const mockWhitepapers: Whitepaper[] = [
      {
        id: 1,
        title: 'The Future of AI in Enterprise Software Development',
        description: 'A comprehensive guide to implementing artificial intelligence solutions in enterprise environments, covering best practices and real-world case studies.',
        author: 'Dr. Sarah Chen',
        authorTitle: 'Chief Technology Officer',
        category: 'ai',
        status: 'published',
        publishDate: '2024-01-10',
        downloadCount: 1247,
        level: 'Advanced',
        tags: ['AI', 'Enterprise', 'Software Development'],
        fileUrl: 'https://example.com/whitepapers/ai-enterprise-dev.pdf',
        coverImageUrl: 'https://example.com/covers/ai-whitepaper.jpg',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-10T15:30:00Z'
      },
      {
        id: 2,
        title: 'Digital Transformation Roadmap for SMBs',
        description: 'Strategic guidance for small and medium businesses looking to accelerate their digital transformation journey.',
        author: 'Marcus Rodriguez',
        authorTitle: 'Senior Business Consultant',
        category: 'business',
        status: 'published',
        publishDate: '2024-01-15',
        downloadCount: 892,
        level: 'Intermediate',
        tags: ['Digital Transformation', 'SMB', 'Strategy'],
        fileUrl: 'https://example.com/whitepapers/digital-transformation-smb.pdf',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-12T09:15:00Z'
      },
      {
        id: 3,
        title: 'Data Security Best Practices in the Cloud Era',
        description: 'Essential security frameworks and practices for protecting sensitive data in cloud environments.',
        author: 'Dr. Emily Watson',
        authorTitle: 'Cybersecurity Director',
        category: 'security',
        status: 'draft',
        publishDate: '2024-01-25',
        downloadCount: 0,
        level: 'Advanced',
        tags: ['Security', 'Cloud', 'Data Protection'],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-14T11:45:00Z'
      }
    ]
    
    setTimeout(() => {
      setWhitepapers(mockWhitepapers)
      setIsLoading(false)
    }, 1000)
  }, [])

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'ai', name: 'AI & Machine Learning' },
    { id: 'business', name: 'Business Strategy' },
    { id: 'security', name: 'Security & Compliance' },
    { id: 'cloud', name: 'Cloud Computing' },
    { id: 'automation', name: 'Automation' }
  ]

  const statuses = [
    { id: 'all', name: 'All Statuses' },
    { id: 'draft', name: 'Draft' },
    { id: 'published', name: 'Published' },
    { id: 'archived', name: 'Archived' }
  ]

  const filteredWhitepapers = whitepapers.filter(whitepaper => {
    const matchesSearch = whitepaper.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         whitepaper.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         whitepaper.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || whitepaper.status === selectedStatus
    const matchesCategory = selectedCategory === 'all' || whitepaper.category === selectedCategory
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    switch (status) {
      case 'published':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'draft':
        return `${baseClasses} bg-gray-100 text-gray-800`
      case 'archived':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const handleCreateWhitepaper = () => {
    setEditingWhitepaper(null)
    setIsModalOpen(true)
  }

  const handleEditWhitepaper = (whitepaper: Whitepaper) => {
    setEditingWhitepaper(whitepaper)
    setIsModalOpen(true)
  }

  const handleDeleteWhitepaper = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this whitepaper?')) {
      // API call to delete whitepaper
      setWhitepapers(whitepapers.filter(w => w.id !== id))
    }
  }

  const handleDuplicateWhitepaper = (whitepaper: Whitepaper) => {
    const duplicate = {
      ...whitepaper,
      id: Math.max(...whitepapers.map(w => w.id)) + 1,
      title: `${whitepaper.title} (Copy)`,
      status: 'draft' as const,
      downloadCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setWhitepapers([duplicate, ...whitepapers])
  }

  const handleStatusChange = async (whitepaper: Whitepaper, newStatus: string) => {
    // API call to update status
    setWhitepapers(whitepapers.map(w => 
      w.id === whitepaper.id 
        ? { ...w, status: newStatus as any, updatedAt: new Date().toISOString() }
        : w
    ))
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Header Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div>
          <h2 className={`text-2xl font-bold ${textColors.primary} mb-2`}>
            Manage Whitepapers
          </h2>
          <p className={textColors.secondary}>
            Create, edit, and manage your whitepaper content
          </p>
        </div>
          
          <button
            onClick={handleCreateWhitepaper}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Whitepaper
          </button>
        </div>

      {/* Filters */}
      <div className={`${getCardClasses()} p-6 mb-8`}>
        <div className="flex flex-col lg:flex-row lg:items-center gap-4">
          <div className="flex-1">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search whitepapers..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex gap-4">
            <div className="flex items-center space-x-2">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statuses.map(status => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Whitepapers List */}
      <div className="space-y-4">
          {filteredWhitepapers.map((whitepaper) => (
            <div key={whitepaper.id} className={`${getCardClasses()} p-6 hover:shadow-lg transition-shadow`}>
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Whitepaper Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`text-xl font-semibold ${textColors.primary} mb-2`}>
                        {whitepaper.title}
                      </h3>
                      <p className={`${textColors.secondary} line-clamp-2 mb-3`}>
                        {whitepaper.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(whitepaper.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <TagIcon className="h-4 w-4 mr-2" />
                      {whitepaper.author}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarDaysIcon className="h-4 w-4 mr-2" />
                      {whitepaper.publishDate}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                      {whitepaper.downloadCount} downloads
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <DocumentTextIcon className="h-4 w-4 mr-2" />
                      {whitepaper.level}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {whitepaper.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-row lg:flex-col gap-2">
                  <button
                    onClick={() => handleEditWhitepaper(whitepaper)}
                    className="flex items-center justify-center p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => handleDuplicateWhitepaper(whitepaper)}
                    className="flex items-center justify-center p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <DocumentDuplicateIcon className="h-5 w-5" />
                  </button>
                  
                  {whitepaper.status === 'draft' && (
                    <button
                      onClick={() => handleStatusChange(whitepaper, 'published')}
                      className="flex items-center justify-center p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Publish"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                  
                  <button
                    className="flex items-center justify-center p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteWhitepaper(whitepaper.id)}
                    className="flex items-center justify-center p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredWhitepapers.length === 0 && (
          <div className={`${getCardClasses()} p-12 text-center`}>
            <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No whitepapers found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your filters to find whitepapers.'
                : 'Get started by creating your first whitepaper.'}
            </p>
            {!searchTerm && selectedStatus === 'all' && selectedCategory === 'all' && (
              <button
                onClick={handleCreateWhitepaper}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Your First Whitepaper
              </button>
            )}
          </div>
        )}
      </div>
  )
}

export default WhitepapersManagement