import { ReactNode } from 'react'
import { StarIcon } from '@heroicons/react/24/solid'

interface Testimonial {
  content: string
  author: {
    name: string
    title?: string
    company?: string
    avatar?: string
  }
  rating?: number
}

interface TestimonialTemplateProps {
  testimonials: Testimonial[]
  layout?: 'single' | 'grid' | 'carousel'
  columns?: 1 | 2 | 3
  showRating?: boolean
  showQuotes?: boolean
  variant?: 'card' | 'minimal' | 'featured'
  background?: 'white' | 'gray' | 'primary'
  className?: string
}

const TestimonialTemplate = ({
  testimonials,
  layout = 'grid',
  columns = 3,
  showRating = true,
  showQuotes = true,
  variant = 'card',
  background = 'white',
  className = ''
}: TestimonialTemplateProps) => {
  const getGridClasses = () => {
    if (layout === 'single') {
      return 'max-w-3xl mx-auto'
    }
    
    switch (columns) {
      case 1:
        return 'max-w-3xl mx-auto space-y-8'
      case 2:
        return 'grid grid-cols-1 lg:grid-cols-2 gap-8'
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
    }
  }

  const getCardClasses = () => {
    const baseClasses = variant === 'card' 
      ? 'bg-white p-6 rounded-xl shadow-card border border-gray-200'
      : variant === 'featured'
      ? 'bg-white p-8 rounded-xl shadow-elevated border-0'
      : 'p-6'
      
    return variant === 'card' || variant === 'featured'
      ? `${baseClasses} hover-lift transition-all duration-300`
      : baseClasses
  }

  const getBackgroundClasses = () => {
    switch (background) {
      case 'gray':
        return 'bg-gray-50'
      case 'primary':
        return 'bg-primary-50'
      default:
        return ''
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center space-x-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <StarIcon
            key={i}
            className={`h-5 w-5 ${
              i < rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const renderTestimonial = (testimonial: Testimonial, index: number) => {
    const isTextLight = background === 'primary'
    
    return (
      <div key={index} className={getCardClasses()}>
        {showRating && testimonial.rating && renderStars(testimonial.rating)}
        
        <blockquote className={`text-lg ${isTextLight ? 'text-primary-800' : 'text-gray-700'} mb-6 leading-relaxed`}>
          {showQuotes && (
            <span className={`text-4xl ${isTextLight ? 'text-primary-400' : 'text-gray-300'} leading-none`}>
              "
            </span>
          )}
          {testimonial.content}
          {showQuotes && (
            <span className={`text-4xl ${isTextLight ? 'text-primary-400' : 'text-gray-300'} leading-none`}>
              "
            </span>
          )}
        </blockquote>
        
        <div className="flex items-center space-x-3">
          {testimonial.author.avatar ? (
            <img
              className="h-12 w-12 rounded-full object-cover"
              src={testimonial.author.avatar}
              alt={testimonial.author.name}
            />
          ) : (
            <div className={`h-12 w-12 rounded-full ${isTextLight ? 'bg-primary-200' : 'bg-primary-100'} flex items-center justify-center`}>
              <span className={`text-sm font-medium ${isTextLight ? 'text-primary-700' : 'text-primary-600'}`}>
                {testimonial.author.name.charAt(0)}
              </span>
            </div>
          )}
          
          <div>
            <div className={`text-sm font-medium ${isTextLight ? 'text-primary-900' : 'text-gray-900'}`}>
              {testimonial.author.name}
            </div>
            {(testimonial.author.title || testimonial.author.company) && (
              <div className={`text-sm ${isTextLight ? 'text-primary-600' : 'text-gray-500'}`}>
                {testimonial.author.title}
                {testimonial.author.title && testimonial.author.company && ', '}
                {testimonial.author.company}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`${getBackgroundClasses()} ${className}`}>
      <div className={getGridClasses()}>
        {testimonials.map((testimonial, index) => renderTestimonial(testimonial, index))}
      </div>
    </div>
  )
}

export default TestimonialTemplate