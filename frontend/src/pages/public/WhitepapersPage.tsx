import { useState, useEffect } from 'react'
import { backgrounds, textColors, getCardClasses, getSectionClasses, gradients, responsive, shadows, borders } from '../../utils/styling'
import { 
  DocumentTextIcon, 
  CalendarDaysIcon,
  UserIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ShareIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/react/24/outline'
import { Whitepaper } from '../../types/whitepaper'
import { whitepaperService } from '../../services/whitepaper'
import { WhitepaperDownloadDialog } from '../../components/whitepapers/WhitepaperDownloadDialog'

const WhitepapersPage = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [whitepapers, setWhitepapers] = useState<Whitepaper[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false)
  const [selectedWhitepaper, setSelectedWhitepaper] = useState<Whitepaper | null>(null)

  useEffect(() => {
    fetchWhitepapers()
  }, [])

  const fetchWhitepapers = async () => {
    try {
      setLoading(true)
      const data = await whitepaperService.listWhitepapers()
      setWhitepapers(data)
      setError(null)
    } catch (err) {
      console.error('Error fetching whitepapers:', err)
      setError('Failed to load whitepapers')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadClick = (whitepaper: Whitepaper) => {
    setSelectedWhitepaper(whitepaper)
    setDownloadDialogOpen(true)
  }

  const handleDownloadSuccess = () => {
    setDownloadDialogOpen(false)
    setSelectedWhitepaper(null)
    fetchWhitepapers() // Refresh to update download counts
  }

  const categories = [
    { id: 'all', name: 'All Topics' },
    { id: 'case-study', name: 'Case Studies' },
    { id: 'guide', name: 'Guides' },
    { id: 'report', name: 'Reports' },
    { id: 'research', name: 'Research' },
    { id: 'best-practices', name: 'Best Practices' },
  ]

  const types = [
    { id: 'all', name: 'All Types' },
    { id: 'whitepaper', name: 'Whitepapers' },
    { id: 'case-study', name: 'Case Studies' },
    { id: 'report', name: 'Research Reports' },
    { id: 'guide', name: 'Implementation Guides' },
  ]

  // Use mock data as fallback when loading
  const staticWhitepapers = [
    {
      id: 1,
      title: 'The Future of Content Management: AI-Driven Solutions',
      description: 'Comprehensive analysis of how artificial intelligence is transforming content management systems and what businesses need to know to stay competitive.',
      author: 'Dr. Sarah Mitchell',
      authorTitle: 'Chief Technology Officer',
      category: 'technology',
      type: 'whitepaper',
      publishDate: '2024-01-10',
      readTime: '15 min read',
      pages: 24,
      downloads: 73,
      views: 5632,
      featured: true,
      tags: ['AI', 'CMS', 'Technology', 'Innovation'],
      thumbnail: '/api/placeholder/400/500',
    },
    {
      id: 2,
      title: 'Scaling SaaS: From MVP to Enterprise',
      description: 'Real-world case study examining how TechCorp scaled their SaaS platform from 100 to 100,000 users, including technical challenges and solutions.',
      author: 'Marcus Chen',
      authorTitle: 'VP of Engineering',
      category: 'business',
      type: 'case-study',
      publishDate: '2024-01-08',
      readTime: '12 min read',
      pages: 18,
      downloads: 89,
      views: 3421,
      featured: false,
      tags: ['SaaS', 'Scaling', 'Case Study', 'Growth'],
      thumbnail: '/api/placeholder/400/500',
    },
    {
      id: 3,
      title: '2024 Digital Transformation Report',
      description: 'Industry-wide analysis of digital transformation trends, challenges, and opportunities based on survey data from 500+ enterprises.',
      author: 'Research Team',
      authorTitle: 'voltAIc Systems Research',
      category: 'business',
      type: 'report',
      publishDate: '2024-01-05',
      readTime: '25 min read',
      pages: 42,
      downloads: 67,
      views: 8934,
      featured: true,
      tags: ['Digital Transformation', 'Enterprise', 'Research', 'Trends'],
      thumbnail: '/api/placeholder/400/500',
    },
    {
      id: 4,
      title: 'Modern Web Security: Implementation Guide',
      description: 'Step-by-step guide to implementing enterprise-grade security measures for modern web applications, including code examples and best practices.',
      author: 'Alex Rodriguez',
      authorTitle: 'Security Architect',
      category: 'security',
      type: 'guide',
      publishDate: '2024-01-03',
      readTime: '18 min read',
      pages: 31,
      downloads: 91,
      views: 2845,
      featured: false,
      tags: ['Security', 'Web Development', 'Implementation', 'Best Practices'],
      thumbnail: '/api/placeholder/400/500',
    },
    {
      id: 5,
      title: 'Machine Learning in Content Personalization',
      description: 'Exploring how machine learning algorithms can be used to create personalized content experiences, with practical implementation strategies.',
      author: 'Dr. Emily Watson',
      authorTitle: 'AI Research Director',
      category: 'ai',
      type: 'whitepaper',
      publishDate: '2023-12-28',
      readTime: '20 min read',
      pages: 28,
      downloads: 84,
      views: 4567,
      featured: true,
      tags: ['Machine Learning', 'Personalization', 'AI', 'Content'],
      thumbnail: '/api/placeholder/400/500',
    },
    {
      id: 6,
      title: 'ROI Analysis: Modern CMS Migration',
      description: 'Detailed cost-benefit analysis of migrating from legacy content management systems to modern solutions, including timeline and resource requirements.',
      author: 'Jennifer Park',
      authorTitle: 'Business Analyst',
      category: 'business',
      type: 'report',
      publishDate: '2023-12-20',
      readTime: '14 min read',
      pages: 22,
      downloads: 76,
      views: 2134,
      featured: false,
      tags: ['ROI', 'Migration', 'CMS', 'Analysis'],
      thumbnail: '/api/placeholder/400/500',
    },
  ]

  const currentWhitepapers = loading ? staticWhitepapers : whitepapers

  const filteredWhitepapers = currentWhitepapers.filter(whitepaper => {
    // For API whitepapers, get text from multilingual fields
    const title = whitepaper.title?.en || whitepaper.title || ''
    const description = whitepaper.description?.en || whitepaper.description || ''
    
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (whitepaper.tags && whitepaper.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
    
    const matchesCategory = selectedCategory === 'all' || whitepaper.category === selectedCategory
    const matchesType = selectedType === 'all' || whitepaper.type === selectedType || whitepaper.category === selectedType
    
    return matchesSearch && matchesCategory && matchesType
  })

  const featuredWhitepapers = currentWhitepapers.filter(wp => wp.featured)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'whitepaper':
      case 'guide':
        return DocumentTextIcon
      case 'case-study':
      case 'report':
      case 'research':
      case 'best-practices':
        return ChartBarIcon
      default:
        return DocumentTextIcon
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'whitepaper':
        return 'text-primary-600 bg-primary-100'
      case 'case-study':
        return 'text-success-600 bg-success-100'
      case 'report':
        return 'text-accent-600 bg-accent-100'
      case 'guide':
        return 'text-warning-600 bg-warning-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  return (
    <div className={`${backgrounds.pageAlt} min-h-screen`}>
      {/* Hero Section */}
      <div className={`relative ${gradients.heroVioletLight} text-gray-900 dark:text-white overflow-hidden`}>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className={`relative ${responsive.container} py-16 lg:py-20`}>
          <div className="max-w-4xl mx-auto text-center">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <DocumentTextIcon className="h-12 w-12 text-violet-600" />
              <h1 className="text-4xl lg:text-6xl font-bold">
                Knowledge Library
              </h1>
            </div>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Download our comprehensive whitepapers, case studies, and research reports 
              to stay ahead in the digital transformation journey.
            </p>

            {/* Stats in Hero */}
            <div className={`${responsive.gridCols4} mb-8 bg-white/60 dark:bg-black/30 backdrop-blur-sm rounded-2xl p-8 border border-violet-200/30 dark:border-violet-800/30 shadow-lg`}>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-violet-700 dark:text-violet-300 mb-1">{whitepapers.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Resources Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-violet-700 dark:text-violet-300 mb-1">
                  {whitepapers.reduce((sum, wp) => sum + (wp.download_count || wp.downloads || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Downloads</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-violet-700 dark:text-violet-300 mb-1">
                  {whitepapers.reduce((sum, wp) => sum + (wp.view_count || wp.views || 0), 0).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Total Views</div>
              </div>
              <div className="text-center">
                <div className="text-3xl lg:text-4xl font-bold text-violet-700 dark:text-violet-300 mb-1">
                  {whitepapers.length > 0 ? Math.round(whitepapers.reduce((sum, wp) => sum + (wp.pages || 0), 0) / whitepapers.length) : 0}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Pages</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#featured" className="btn-xl bg-violet-600 text-white hover:bg-violet-700 shadow-lg">
                Browse Featured Content
              </a>
              <a href="#all" className="btn-xl border-2 border-violet-300 dark:border-violet-400 text-violet-700 dark:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/30 backdrop-blur-sm">
                View All Resources
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Section */}
      <div id="featured" className={`${backgrounds.section}`}>
        <div className={`${responsive.container} py-16 lg:py-20`}>
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
              Featured Resources
            </h2>
            <p className={`text-xl ${textColors.secondary}`}>
              Our most popular and recently published content
            </p>
          </div>

          <div className={`${responsive.gridCols3} mb-16`}>
            {featuredWhitepapers.map((whitepaper, index) => {
              const TypeIcon = getTypeIcon(whitepaper.category || whitepaper.type || 'document')
              return (
                <div 
                  key={whitepaper.id} 
                  className="card hover-lift hover-glow group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative">
                    <div className="h-64 bg-gradient-to-br from-primary-100 to-accent-100 rounded-t-xl flex items-center justify-center">
                      <DocumentTextIcon className="h-20 w-20 text-primary-400" />
                    </div>
                    <div className="absolute top-4 left-4">
                      <span className="badge badge-warning">✨ Featured</span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`badge ${getTypeColor(whitepaper.category || whitepaper.type || 'document')}`}>
                        {(whitepaper.category || whitepaper.type || 'document').charAt(0).toUpperCase() + (whitepaper.category || whitepaper.type || 'document').slice(1).replace('-', ' ')}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-3 group-hover:text-primary-700 transition-colors line-clamp-2">
                      {typeof whitepaper.title === 'object' ? whitepaper.title.en || whitepaper.title.de : whitepaper.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {typeof whitepaper.description === 'object' ? whitepaper.description.en || whitepaper.description.de : whitepaper.description}
                    </p>

                    {(whitepaper.author || whitepaper.authorTitle) && (
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-primary-600">
                            {(whitepaper.author || 'A').charAt(0)}
                          </span>
                        </div>
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            {whitepaper.author || 'voltAIc Systems'}
                          </div>
                          <div className="text-gray-500">
                            {whitepaper.authorTitle || 'Research Team'}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                      <div className="flex items-center">
                        <CalendarDaysIcon className="h-4 w-4 mr-1" />
                        {formatDate(whitepaper.published_at || whitepaper.publishDate)}
                      </div>
                      {whitepaper.readTime && (
                        <div className="flex items-center">
                          <ClockIcon className="h-4 w-4 mr-1" />
                          {whitepaper.readTime}
                        </div>
                      )}
                      <div className="flex items-center">
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        {whitepaper.download_count || whitepaper.downloads || 0}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {whitepaper.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="badge badge-secondary text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <button 
                        className="btn-primary btn-sm group"
                        onClick={() => handleDownloadClick(whitepaper)}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        {whitepaper.requires_registration !== false ? 'Get Whitepaper' : 'Download PDF'}
                      </button>
                      <div className="flex space-x-2">
                        <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                          <ShareIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* All Resources Section */}
      <div id="all" className={`${backgrounds.sectionAlt}`}>
        <div className={`${responsive.container} py-16 lg:py-20`}>
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${textColors.primary} mb-4`}>
              All Resources
            </h2>
            <p className={`text-xl ${textColors.secondary}`}>
              Explore our complete library of knowledge resources
            </p>
          </div>


          {/* Resources Grid */}
          <div className={responsive.gridCols3}>
            {filteredWhitepapers.map((whitepaper, index) => {
              const TypeIcon = getTypeIcon(whitepaper.category || whitepaper.type || 'document')
              return (
                <div 
                  key={whitepaper.id} 
                  className="card hover-lift hover-glow group animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="relative">
                    <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-xl flex items-center justify-center">
                      <TypeIcon className="h-16 w-16 text-gray-400" />
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`badge ${getTypeColor(whitepaper.category || whitepaper.type || 'document')}`}>
                        {(whitepaper.category || whitepaper.type || 'document').charAt(0).toUpperCase() + (whitepaper.category || whitepaper.type || 'document').slice(1).replace('-', ' ')}
                      </span>
                    </div>
                    {whitepaper.featured && (
                      <div className="absolute top-4 left-4">
                        <span className="badge badge-warning text-xs">Featured</span>
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-base font-semibold text-gray-900 mb-2 group-hover:text-primary-700 transition-colors line-clamp-2">
                      {typeof whitepaper.title === 'object' ? whitepaper.title.en || whitepaper.title.de : whitepaper.title}
                    </h3>

                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {typeof whitepaper.description === 'object' ? whitepaper.description.en || whitepaper.description.de : whitepaper.description}
                    </p>

                    <div className="flex items-center text-xs text-gray-500 mb-4">
                      <UserIcon className="h-4 w-4 mr-1" />
                      <span className="mr-4">{whitepaper.author || 'voltAIc Systems'}</span>
                      {whitepaper.pages && (
                        <>
                          <DocumentTextIcon className="h-4 w-4 mr-1" />
                          <span>{whitepaper.pages} pages</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <button 
                        className="btn-outline btn-sm group"
                        onClick={() => handleDownloadClick(whitepaper)}
                      >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                        Download
                      </button>
                      <div className="text-xs text-gray-500">
                        {whitepaper.download_count || whitepaper.downloads || 0} downloads
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredWhitepapers.length === 0 && (
            <div className="text-center py-16">
              <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No resources found
              </h3>
              <p className="text-gray-600 mb-6">
                Try adjusting your search terms or filters to find relevant resources.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setSelectedType('all')
                }}
                className="btn-outline"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Newsletter CTA */}
      <div className="bg-violet-50 dark:bg-violet-900/30 border-t border-violet-100 dark:border-violet-800">
        <div className="container section text-center">
          <h2 className="text-3xl font-bold text-violet-900 dark:text-violet-200 mb-4">
            Stay Updated with Latest Research
          </h2>
          <p className="text-violet-700 dark:text-violet-300 mb-8 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know when we publish 
            new whitepapers and research reports.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="form-input flex-1"
            />
            <button className="btn-lg bg-violet-600 text-white hover:bg-violet-700 shadow-lg">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* Download Dialog */}
      {selectedWhitepaper && (
        <WhitepaperDownloadDialog
          open={downloadDialogOpen}
          onClose={() => setDownloadDialogOpen(false)}
          whitepaper={selectedWhitepaper}
          onSuccess={handleDownloadSuccess}
        />
      )}
    </div>
  )
}

export default WhitepapersPage