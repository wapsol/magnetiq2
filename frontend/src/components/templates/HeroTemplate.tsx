import { ReactNode } from 'react'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

interface HeroTemplateProps {
  title: string | ReactNode
  subtitle?: string
  description?: string
  primaryAction?: {
    text: string
    href?: string
    onClick?: () => void
    variant?: 'primary' | 'white'
  }
  secondaryAction?: {
    text: string
    href?: string
    onClick?: () => void
  }
  backgroundVariant?: 'gradient' | 'solid' | 'pattern' | 'image'
  backgroundImage?: string
  size?: 'small' | 'medium' | 'large' | 'xlarge'
  alignment?: 'left' | 'center'
  children?: ReactNode
  badge?: {
    text: string
    variant?: 'primary' | 'accent' | 'success'
  }
}

const HeroTemplate = ({
  title,
  subtitle,
  description,
  primaryAction,
  secondaryAction,
  backgroundVariant = 'gradient',
  backgroundImage,
  size = 'large',
  alignment = 'center',
  children,
  badge
}: HeroTemplateProps) => {
  const getBackgroundClasses = () => {
    switch (backgroundVariant) {
      case 'gradient':
        return 'bg-gradient-to-br from-gray-50 to-primary-25 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white'
      case 'solid':
        return 'bg-primary-50 dark:bg-gray-800 text-gray-900 dark:text-white'
      case 'pattern':
        return 'bg-gradient-to-br from-gray-50 to-primary-25 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white'
      case 'image':
        return `bg-cover bg-center bg-no-repeat text-gray-900 dark:text-white ${backgroundImage ? `bg-[url('${backgroundImage}')]` : 'bg-gray-50 dark:bg-gray-800'}`
      default:
        return 'bg-gradient-to-br from-gray-50 to-primary-25 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-white'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'p-12 sm:p-16'
      case 'medium':
        return 'p-16 sm:p-20'
      case 'large':
        return 'p-20 sm:p-24 lg:p-32'
      case 'xlarge':
        return 'p-6 sm:p-8 lg:p-10'
      default:
        return 'p-20 sm:p-24 lg:p-32'
    }
  }

  const getAlignmentClasses = () => {
    return alignment === 'center' ? 'text-center' : 'text-left'
  }

  const getBadgeClasses = (variant?: string) => {
    switch (variant) {
      case 'accent':
        return 'bg-accent-100 text-accent-800'
      case 'success':
        return 'bg-success-100 text-success-800'
      default:
        return 'bg-primary-100 text-primary-800'
    }
  }

  const renderAction = (action: any, isPrimary: boolean) => {
    const baseClasses = isPrimary 
      ? (action.variant === 'white' ? 'btn-xl bg-white text-primary-600 hover:bg-primary-50' : 'btn-xl btn-primary')
      : 'btn-xl border-2 border-primary-200 text-primary-600 hover:bg-primary-50'
    
    // Add flex and whitespace classes to prevent text/arrow wrapping
    const combinedClasses = `${baseClasses} inline-flex items-center whitespace-nowrap`

    if (action.href) {
      return (
        <a href={action.href} className={combinedClasses}>
          {action.text}
          {!isPrimary && <ChevronRightIcon className="ml-2 h-5 w-5" />}
        </a>
      )
    }

    return (
      <button onClick={action.onClick} className={combinedClasses}>
        {action.text}
        {!isPrimary && <ChevronRightIcon className="ml-2 h-5 w-5" />}
      </button>
    )
  }

  return (
    <div className={`relative overflow-hidden ${getBackgroundClasses()}`}>
      {backgroundVariant === 'pattern' && (
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      )}
      {backgroundVariant === 'image' && (
        <div className="absolute inset-0 bg-black/50"></div>
      )}
      
      <div className={`relative container ${getSizeClasses()}`}>
        <div className={`${alignment === 'center' ? 'max-w-4xl mx-auto' : 'max-w-3xl'} ${getAlignmentClasses()}`}>
          {badge && (
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mb-6 ${getBadgeClasses(badge.variant)}`}>
              {badge.text}
            </div>
          )}
          
          {subtitle && (
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300 mb-4">
              {subtitle}
            </p>
          )}
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight text-gray-900 dark:text-white">
            {title}
          </h1>
          
          {description && (
            <p className="text-xl text-gray-600 dark:text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
              {description}
            </p>
          )}
          
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {primaryAction && renderAction(primaryAction, true)}
              {secondaryAction && renderAction(secondaryAction, false)}
            </div>
          )}
          
          {children && (
            <div className="mt-12">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HeroTemplate