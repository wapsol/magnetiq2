import React, { useState, useEffect } from 'react'
import { backgrounds, textColors, getCardClasses } from '../../../utils/styling'
import {
  VideoCameraIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ClockIcon,
  UserGroupIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlayIcon,
  DocumentDuplicateIcon
} from '@heroicons/react/24/outline'

interface Webinar {
  id: number
  title: string
  description: string
  presenter: string
  presenterTitle: string
  category: string
  status: 'draft' | 'scheduled' | 'live' | 'completed' | 'cancelled'
  date: string
  time: string
  duration: string
  maxAttendees: number | null
  currentAttendees: number
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  tags: string[]
  registrationUrl?: string
  recordingUrl?: string
  createdAt: string
  updatedAt: string
}

const WebinarManagement: React.FC = () => {
  const [webinars, setWebinars] = useState<Webinar[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingWebinar, setEditingWebinar] = useState<Webinar | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Mock data - replace with API calls
  useEffect(() => {
    const mockWebinars: Webinar[] = [
      {
        id: 1,
        title: 'Advanced React Patterns for Scalable Applications',
        description: 'Learn advanced React patterns including render props, compound components, and custom hooks for building maintainable applications.',
        presenter: 'Sarah Chen',
        presenterTitle: 'Senior Frontend Architect',
        category: 'react',
        status: 'live',
        date: '2024-01-15',
        time: '3:00 PM CET',
        duration: '90',
        maxAttendees: 500,
        currentAttendees: 247,
        level: 'Intermediate',
        tags: ['React', 'Architecture', 'Best Practices'],
        registrationUrl: 'https://example.com/register/1',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-10T15:30:00Z'
      },
      {
        id: 2,
        title: 'Building Microservices with Node.js and Docker',
        description: 'Deep dive into microservices architecture, containerization strategies, and deployment patterns.',
        presenter: 'Marcus Rodriguez',
        presenterTitle: 'DevOps Lead',
        category: 'backend',
        status: 'scheduled',
        date: '2024-01-18',
        time: '2:00 PM CET',
        duration: '120',
        maxAttendees: 300,
        currentAttendees: 156,
        level: 'Advanced',
        tags: ['Node.js', 'Docker', 'Microservices'],
        registrationUrl: 'https://example.com/register/2',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-12T09:15:00Z'
      },
      {
        id: 3,
        title: 'AI-Powered Content Management: The Future is Here',
        description: 'Explore how artificial intelligence is revolutionizing content management systems.',
        presenter: 'Dr. Emily Watson',
        presenterTitle: 'AI Research Director',
        category: 'ai',
        status: 'draft',
        date: '2024-01-22',
        time: '4:00 PM CET',
        duration: '75',
        maxAttendees: 200,
        currentAttendees: 0,
        level: 'Beginner',
        tags: ['AI', 'CMS', 'Innovation'],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-14T11:45:00Z'
      }
    ]
    
    setTimeout(() => {
      setWebinars(mockWebinars)
      setIsLoading(false)
    }, 1000)
  }, [])

  const categories = [
    { id: 'all', name: 'All Categories' },
    { id: 'react', name: 'React & Frontend' },
    { id: 'backend', name: 'Backend Development' },
    { id: 'devops', name: 'DevOps & Cloud' },
    { id: 'ai', name: 'AI & Machine Learning' },
    { id: 'business', name: 'Business Strategy' }
  ]

  const statuses = [
    { id: 'all', name: 'All Statuses' },
    { id: 'draft', name: 'Draft' },
    { id: 'scheduled', name: 'Scheduled' },
    { id: 'live', name: 'Live' },
    { id: 'completed', name: 'Completed' },
    { id: 'cancelled', name: 'Cancelled' }
  ]

  const filteredWebinars = webinars.filter(webinar => {
    const matchesSearch = webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webinar.presenter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webinar.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || webinar.status === selectedStatus
    const matchesCategory = selectedCategory === 'all' || webinar.category === selectedCategory
    
    return matchesSearch && matchesStatus && matchesCategory
  })

  const getStatusBadge = (status: string) => {
    const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
    switch (status) {
      case 'live':
        return `${baseClasses} bg-red-100 text-red-800 animate-pulse`
      case 'scheduled':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'completed':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'draft':
        return `${baseClasses} bg-gray-100 text-gray-800`
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const handleCreateWebinar = () => {
    setEditingWebinar(null)
    setIsModalOpen(true)
  }

  const handleEditWebinar = (webinar: Webinar) => {
    setEditingWebinar(webinar)
    setIsModalOpen(true)
  }

  const handleDeleteWebinar = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this webinar?')) {
      // API call to delete webinar
      setWebinars(webinars.filter(w => w.id !== id))
    }
  }

  const handleDuplicateWebinar = (webinar: Webinar) => {
    const duplicate = {
      ...webinar,
      id: Math.max(...webinars.map(w => w.id)) + 1,
      title: `${webinar.title} (Copy)`,
      status: 'draft' as const,
      currentAttendees: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setWebinars([duplicate, ...webinars])
  }

  const handleStatusChange = async (webinar: Webinar, newStatus: string) => {
    // API call to update status
    setWebinars(webinars.map(w => 
      w.id === webinar.id 
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
            Manage Webinars
          </h2>
          <p className={textColors.secondary}>
            Create, edit, and manage your webinar sessions
          </p>
        </div>
          
          <button
            onClick={handleCreateWebinar}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Webinar
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
                placeholder="Search webinars..."
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

      {/* Webinars List */}
      <div className="space-y-4">
          {filteredWebinars.map((webinar) => (
            <div key={webinar.id} className={`${getCardClasses()} p-6 hover:shadow-lg transition-shadow`}>
              <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                {/* Webinar Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className={`text-xl font-semibold ${textColors.primary} mb-2`}>
                        {webinar.title}
                      </h3>
                      <p className={`${textColors.secondary} line-clamp-2 mb-3`}>
                        {webinar.description}
                      </p>
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(webinar.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <UserGroupIcon className="h-4 w-4 mr-2" />
                      {webinar.presenter}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <CalendarDaysIcon className="h-4 w-4 mr-2" />
                      {webinar.date}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      {webinar.duration} min
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <VideoCameraIcon className="h-4 w-4 mr-2" />
                      {webinar.currentAttendees}{webinar.maxAttendees ? `/${webinar.maxAttendees}` : ''} attendees
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {webinar.tags.map(tag => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex flex-row lg:flex-col gap-2">
                  <button
                    onClick={() => handleEditWebinar(webinar)}
                    className="flex items-center justify-center p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => handleDuplicateWebinar(webinar)}
                    className="flex items-center justify-center p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    title="Duplicate"
                  >
                    <DocumentDuplicateIcon className="h-5 w-5" />
                  </button>
                  
                  {webinar.status === 'scheduled' && (
                    <button
                      onClick={() => handleStatusChange(webinar, 'live')}
                      className="flex items-center justify-center p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Go Live"
                    >
                      <PlayIcon className="h-5 w-5" />
                    </button>
                  )}
                  
                  <button
                    className="flex items-center justify-center p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <EyeIcon className="h-5 w-5" />
                  </button>
                  
                  <button
                    onClick={() => handleDeleteWebinar(webinar.id)}
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

        {filteredWebinars.length === 0 && (
          <div className={`${getCardClasses()} p-12 text-center`}>
            <VideoCameraIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No webinars found
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedStatus !== 'all' || selectedCategory !== 'all'
                ? 'Try adjusting your filters to find webinars.'
                : 'Get started by creating your first webinar.'}
            </p>
            {!searchTerm && selectedStatus === 'all' && selectedCategory === 'all' && (
              <button
                onClick={handleCreateWebinar}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Your First Webinar
              </button>
            )}
          </div>
        )}
      </div>
  )
}

export default WebinarManagement