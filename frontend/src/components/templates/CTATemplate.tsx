import { ReactNode } from 'react'
import { ChevronRightIcon } from '@heroicons/react/24/outline'

interface CTATemplateProps {
  title: string
  description?: string
  primaryAction: {
    text: string
    href?: string
    onClick?: () => void
  }
  secondaryAction?: {
    text: string
    href?: string
    onClick?: () => void
  }
  variant?: 'default' | 'centered' | 'split' | 'minimal'
  background?: 'primary' | 'accent' | 'dark' | 'gray' | 'gradient'
  backgroundVariant?: 'primary' | 'accent' | 'dark' | 'gray' | 'gradient'
  size?: 'small' | 'medium' | 'large'
  icon?: ReactNode
  pattern?: boolean
  className?: string
}

const CTATemplate = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  variant = 'centered',
  background = 'primary',
  size = 'medium',
  icon,
  pattern = false,
  className = ''
}: CTATemplateProps) => {
  const getBackgroundClasses = () => {
    switch (background) {
      case 'accent':
        return 'bg-accent-50 dark:bg-gray-800 text-gray-900 dark:text-white'
      case 'dark':
        return 'bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white'
      case 'gray':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
      case 'gradient':
        return 'bg-gradient-to-r from-primary-50 to-accent-50 dark:from-gray-800 dark:to-gray-700 text-gray-900 dark:text-white'
      default:
        return 'bg-primary-50 dark:bg-gray-800 text-gray-900 dark:text-white'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'py-12'
      case 'large':
        return 'py-20 sm:py-24'
      default:
        return 'py-16 sm:py-20'
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case 'split':
        return 'flex flex-col lg:flex-row lg:items-center lg:justify-between'
      case 'minimal':
        return 'text-center max-w-2xl mx-auto'
      case 'default':
        return 'text-left max-w-4xl mx-auto'
      default:
        return 'text-center max-w-3xl mx-auto'
    }
  }

  const renderAction = (action: any, isPrimary: boolean) => {
    const baseClasses = isPrimary
      ? 'btn-lg btn-primary'
      : 'btn-lg btn-outline'

    const content = (
      <>
        {action.text}
        {!isPrimary && <ChevronRightIcon className="ml-2 h-5 w-5" />}
      </>
    )

    if (action.href) {
      return (
        <a href={action.href} className={baseClasses}>
          {content}
        </a>
      )
    }

    return (
      <button onClick={action.onClick} className={baseClasses}>
        {content}
      </button>
    )
  }

  const textColorClass = 'text-gray-600 dark:text-gray-200'

  return (
    <section className={`relative overflow-hidden ${getBackgroundClasses()} ${getSizeClasses()} ${className}`}>
      {pattern && (
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      )}
      
      <div className="relative container">
        <div className={getVariantClasses()}>
          {variant === 'split' ? (
            <>
              <div className="lg:flex-1 mb-8 lg:mb-0">
                {icon && (
                  <div className="mb-6">
                    {icon}
                  </div>
                )}
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-900 dark:text-white">
                  {title}
                </h2>
                {description && (
                  <p className={`text-lg ${textColorClass} leading-relaxed`}>
                    {description}
                  </p>
                )}
              </div>
              
              <div className="lg:flex-shrink-0 lg:ml-8">
                <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row gap-4">
                  {renderAction(primaryAction, true)}
                  {secondaryAction && renderAction(secondaryAction, false)}
                </div>
              </div>
            </>
          ) : (
            <>
              {icon && (
                <div className="mb-6 flex justify-center">
                  {icon}
                </div>
              )}
              
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 dark:text-white">
                {title}
              </h2>
              
              {description && (
                <p className={`text-lg ${textColorClass} mb-8 leading-relaxed`}>
                  {description}
                </p>
              )}
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {renderAction(primaryAction, true)}
                {secondaryAction && renderAction(secondaryAction, false)}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}

export default CTATemplate