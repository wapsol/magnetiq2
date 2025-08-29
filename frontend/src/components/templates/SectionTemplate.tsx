import { ReactNode } from 'react'

interface SectionTemplateProps {
  children: ReactNode
  title?: string
  subtitle?: string
  description?: string
  size?: 'small' | 'medium' | 'large'
  background?: 'white' | 'gray' | 'primary' | 'accent' | 'dark'
  alignment?: 'left' | 'center'
  className?: string
  containerSize?: 'full' | 'container' | 'narrow'
  id?: string
}

const SectionTemplate = ({
  children,
  title,
  subtitle,
  description,
  size = 'medium',
  background = 'white',
  alignment = 'center',
  className = '',
  containerSize = 'container',
  id
}: SectionTemplateProps) => {
  const getBackgroundClasses = () => {
    switch (background) {
      case 'gray':
        return 'bg-gray-25 dark:bg-gray-800'
      case 'primary':
        return 'bg-primary-50 dark:bg-gray-800'
      case 'accent':
        return 'bg-accent-50 dark:bg-gray-800'
      case 'dark':
        return 'bg-gray-900 dark:bg-gray-950'
      default:
        return 'bg-white dark:bg-gray-900'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'py-12 sm:py-16'
      case 'medium':
        return 'py-16 sm:py-24'
      case 'large':
        return 'py-20 sm:py-32'
      default:
        return 'py-16 sm:py-24'
    }
  }

  const getContainerClasses = () => {
    switch (containerSize) {
      case 'narrow':
        return 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'
      case 'container':
        return 'container'
      default:
        return 'px-4 sm:px-6 lg:px-8'
    }
  }

  const getAlignmentClasses = () => {
    return alignment === 'center' ? 'text-center' : 'text-left'
  }

  const getTextColor = () => {
    if (background === 'dark') {
      return {
        subtitle: 'text-white/80',
        title: 'text-white',
        description: 'text-white/90'
      }
    }
    return {
      subtitle: 'text-primary-600 dark:text-primary-300',
      title: 'text-gray-900 dark:text-gray-100',
      description: 'text-gray-600 dark:text-gray-200'
    }
  }

  const textColors = getTextColor()

  return (
    <section 
      id={id}
      className={`${getBackgroundClasses()} ${getSizeClasses()} ${className}`}
    >
      <div className={getContainerClasses()}>
        {(title || subtitle || description) && (
          <div className={`${getAlignmentClasses()} ${alignment === 'center' ? 'max-w-3xl mx-auto' : ''} mb-12`}>
            {subtitle && (
              <p className={`text-sm font-semibold uppercase tracking-wide ${textColors.subtitle} mb-4`}>
                {subtitle}
              </p>
            )}
            
            {title && (
              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-bold ${textColors.title} mb-6`}>
                {title}
              </h2>
            )}
            
            {description && (
              <p className={`text-lg ${textColors.description} leading-relaxed`}>
                {description}
              </p>
            )}
          </div>
        )}
        
        {children}
      </div>
    </section>
  )
}

export default SectionTemplate