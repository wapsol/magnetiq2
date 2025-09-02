import { useState } from 'react'
import { backgrounds, textColors, getCardClasses, getSectionClasses } from '../../utils/styling'
import { 
  VideoCameraIcon, 
  CalendarDaysIcon, 
  ClockIcon,
  UserGroupIcon,
  PlayIcon,
  BookmarkIcon,
  ShareIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

const WebinarsPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedLevel, setSelectedLevel] = useState(null)

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'react', name: 'React & Frontend' },
    { id: 'backend', name: 'Backend Development' },
    { id: 'devops', name: 'DevOps & Cloud' },
    { id: 'ai', name: 'AI & Machine Learning' },
    { id: 'business', name: 'Business Strategy' },
  ]

  const statuses = [
    { id: 'all', name: 'All Webinars' },
    { id: 'upcoming', name: 'Upcoming' },
    { id: 'live', name: 'Live Now' },
    { id: 'recorded', name: 'Recorded' },
  ]

  const webinars = [
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
      duration: '90 minutes',
      attendees: 247,
      maxAttendees: 500,
      image: '/api/placeholder/400/250',
      tags: ['React', 'Architecture', 'Best Practices'],
      level: 'Intermediate',
    },
    {
      id: 2,
      title: 'Building Microservices with Node.js and Docker',
      description: 'Deep dive into microservices architecture, containerization strategies, and deployment patterns for modern web applications.',
      presenter: 'Marcus Rodriguez',
      presenterTitle: 'DevOps Lead',
      category: 'backend',
      status: 'upcoming',
      date: '2024-01-18',
      time: '2:00 PM CET',
      duration: '120 minutes',
      attendees: 156,
      maxAttendees: 300,
      image: '/api/placeholder/400/250',
      tags: ['Node.js', 'Docker', 'Microservices'],
      level: 'Advanced',
    },
    {
      id: 3,
      title: 'AI-Powered Content Management: The Future is Here',
      description: 'Explore how artificial intelligence is revolutionizing content management systems and what it means for businesses.',
      presenter: 'Dr. Emily Watson',
      presenterTitle: 'AI Research Director',
      category: 'ai',
      status: 'upcoming',
      date: '2024-01-22',
      time: '4:00 PM CET',
      duration: '75 minutes',
      attendees: 89,
      maxAttendees: 200,
      image: '/api/placeholder/400/250',
      tags: ['AI', 'CMS', 'Innovation'],
      level: 'Beginner',
    },
    {
      id: 4,
      title: 'Scaling Your SaaS: From Startup to Enterprise',
      description: 'Strategic insights on scaling software-as-a-service products, managing technical debt, and building for enterprise clients.',
      presenter: 'Alex Thompson',
      presenterTitle: 'CTO & Co-founder',
      category: 'business',
      status: 'recorded',
      date: '2024-01-10',
      time: 'On Demand',
      duration: '105 minutes',
      attendees: 432,
      maxAttendees: null,
      image: '/api/placeholder/400/250',
      tags: ['SaaS', 'Scaling', 'Strategy'],
      level: 'Intermediate',
    },
  ]

  const filteredWebinars = webinars.filter(webinar => {
    const matchesSearch = webinar.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webinar.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webinar.presenter.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         webinar.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || webinar.category === selectedCategory
    const matchesStatus = selectedStatus === 'all' || webinar.status === selectedStatus
    const matchesLevel = !selectedLevel || webinar.level === selectedLevel
    
    return matchesSearch && matchesCategory && matchesStatus && matchesLevel
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'live':
        return <span className="badge badge-error animate-pulse">🔴 Live Now</span>
      case 'upcoming':
        return <span className="badge badge-primary">📅 Upcoming</span>
      case 'recorded':
        return <span className="badge badge-secondary">🎬 Recorded</span>
      default:
        return null
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'text-success-600 bg-success-100'
      case 'Intermediate':
        return 'text-warning-600 bg-warning-100'
      case 'Advanced':
        return 'text-error-600 bg-error-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  return (
    <div className={`${backgrounds.pageAlt} min-h-screen`}>
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 text-white overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        <div className="relative container section-sm">
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <VideoCameraIcon className="h-12 w-12 text-primary-200" />
              <h1 className="text-4xl lg:text-6xl font-bold">
                Expert Webinars
              </h1>
            </div>
            <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              Join our live webinars and recorded sessions featuring industry experts sharing 
              the latest trends, best practices, and innovative solutions.
            </p>
            
            {/* Search and Filters in Hero */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-4xl mx-auto">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Enhanced Search */}
                <div className="flex-1">
                  <div className="relative">
                    <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search webinars by topic, presenter, or keyword..."
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-0 text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-white/50 text-lg"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Filters Row */}
                <div className="flex flex-wrap gap-3 lg:flex-nowrap">
                  <div className="flex items-center space-x-2">
                    <FunnelIcon className="h-5 w-5 text-white/70" />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="rounded-lg border-0 bg-white/20 text-white backdrop-blur-sm py-2 px-3 focus:ring-2 focus:ring-white/50"
                    >
                      {categories.map(category => (
                        <option key={category.id} value={category.id} className="text-gray-900">
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="rounded-lg border-0 bg-white/20 text-white backdrop-blur-sm py-2 px-3 focus:ring-2 focus:ring-white/50"
                  >
                    {statuses.map(status => (
                      <option key={status.id} value={status.id} className="text-gray-900">
                        {status.name}
                      </option>
                    ))}
                  </select>
                  
                  {/* Level Filter */}
                  <select
                    value={selectedLevel || 'all'}
                    onChange={(e) => setSelectedLevel(e.target.value === 'all' ? null : e.target.value)}
                    className="rounded-lg border-0 bg-white/20 text-white backdrop-blur-sm py-2 px-3 focus:ring-2 focus:ring-white/50"
                  >
                    <option value="all" className="text-gray-900">All Levels</option>
                    <option value="Beginner" className="text-gray-900">Beginner</option>
                    <option value="Intermediate" className="text-gray-900">Intermediate</option>
                    <option value="Advanced" className="text-gray-900">Advanced</option>
                  </select>
                </div>
              </div>
              
              {/* Quick Filter Tags */}
              <div className="flex flex-wrap gap-2 mt-6">
                <span className="text-white/90 text-lg font-semibold mr-4">Quick Filters:</span>
                {[{ id: 'live', name: '🔴 Live Now', type: 'status' }, { id: 'upcoming', name: '📅 Upcoming', type: 'status' }, { id: 'recorded', name: '🎬 Recorded', type: 'status' }, { id: 'ai', name: '🤖 AI & ML', type: 'category' }, { id: 'react', name: '⚛️ React', type: 'category' }, { id: 'backend', name: '⚙️ Backend', type: 'category' }, { id: 'business', name: '📊 Business', type: 'category' }].map(tag => (
                  <button
                    key={tag.id}
                    onClick={() => {
                      if (tag.type === 'status') {
                        setSelectedStatus(tag.id)
                      } else {
                        setSelectedCategory(tag.id)
                      }
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors backdrop-blur-sm ${
                      (tag.type === 'status' && selectedStatus === tag.id) || 
                      (tag.type === 'category' && selectedCategory === tag.id) 
                        ? 'bg-white text-primary-600 shadow-lg' 
                        : 'bg-white/20 text-white/90 hover:bg-white/30'
                    }`}
                  >
                    {tag.name}
                  </button>
                ))}
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                    setSelectedStatus('all')
                    setSelectedLevel(null)
                  }}
                  className="px-4 py-2 rounded-full bg-red-500/20 text-white/90 text-sm font-medium hover:bg-red-500/30 transition-colors backdrop-blur-sm"
                >
                  ✕ Clear All
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Webinars Grid */}
      <div className="container section">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredWebinars.map((webinar, index) => (
            <div 
              key={webinar.id} 
              className="card hover-lift hover-glow group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Webinar Image */}
              <div className="relative overflow-hidden rounded-t-xl">
                <div className="h-48 bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                  <VideoCameraIcon className="h-16 w-16 text-primary-400" />
                </div>
                <div className="absolute top-4 left-4">
                  {getStatusBadge(webinar.status)}
                </div>
                <div className="absolute top-4 right-4">
                  <span className={`badge ${getLevelColor(webinar.level)}`}>
                    {webinar.level}
                  </span>
                </div>
                {webinar.status === 'live' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <PlayIcon className="h-16 w-16 text-white" />
                  </div>
                )}
              </div>

              {/* Webinar Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-700 transition-colors line-clamp-2">
                    {webinar.title}
                  </h3>
                  <button className="text-gray-400 hover:text-gray-600 p-1">
                    <BookmarkIcon className="h-5 w-5" />
                  </button>
                </div>

                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {webinar.description}
                </p>

                {/* Presenter Info */}
                <div className="flex items-center space-x-3 mb-4">
                  <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-600">
                      {webinar.presenter.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {webinar.presenter}
                    </div>
                    <div className="text-xs text-gray-500">
                      {webinar.presenterTitle}
                    </div>
                  </div>
                </div>

                {/* Meta Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-500">
                    <CalendarDaysIcon className="h-4 w-4 mr-2" />
                    {webinar.date} at {webinar.time}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="h-4 w-4 mr-2" />
                    {webinar.duration}
                  </div>
                  {webinar.maxAttendees && (
                    <div className="flex items-center text-sm text-gray-500">
                      <UserGroupIcon className="h-4 w-4 mr-2" />
                      {webinar.attendees}/{webinar.maxAttendees} attendees
                    </div>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {webinar.tags.map(tag => (
                    <span key={tag} className="badge badge-secondary text-xs">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between">
                  <Link
                    to={`/webinars/${webinar.id}`}
                    className={`btn-sm ${
                      webinar.status === 'live' 
                        ? 'bg-error-600 text-white hover:bg-error-700' 
                        : webinar.status === 'upcoming'
                        ? 'btn-primary'
                        : 'btn-outline'
                    } group`}
                  >
                    {webinar.status === 'live' ? 'Join Live' :
                     webinar.status === 'upcoming' ? 'Register' : 'Watch Recording'}
                    <ArrowRightIcon className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                  
                  <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors">
                    <ShareIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredWebinars.length === 0 && (
          <div className="text-center py-16">
            <VideoCameraIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No webinars found
            </h3>
            <p className="text-gray-600 mb-6">
              Try adjusting your search terms or filters to find relevant webinars.
            </p>
            <button 
              onClick={() => {
                setSearchTerm('')
                setSelectedCategory('all')
                setSelectedStatus('all')
              }}
              className="btn-outline"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="bg-secondary-900 text-white">
        <div className="container section text-center">
          <h2 className="text-3xl font-bold mb-4">
            Want to Host a Webinar?
          </h2>
          <p className="text-secondary-300 mb-8 max-w-2xl mx-auto">
            Share your expertise with our community. We provide the platform, 
            you provide the knowledge.
          </p>
          <Link
            to="/book-consultation"
            className="btn-lg bg-primary-600 text-white hover:bg-primary-700 shadow-lg"
          >
            Propose a Webinar
          </Link>
        </div>
      </div>
    </div>
  )
}

export default WebinarsPage