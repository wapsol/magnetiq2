import { ReactNode } from 'react'

interface Feature {
  icon?: ReactNode
  title: string
  description: string
  href?: string
}

interface FeatureTemplateProps {
  title?: string
  subtitle?: string
  features: Feature[]
  layout?: 'grid' | 'list' | 'cards'
  columns?: 2 | 3 | 4
  showIcons?: boolean
  iconStyle?: 'circle' | 'square' | 'none'
  showHover?: boolean
  className?: string
}

const FeatureTemplate = ({
  features,
  layout = 'grid',
  columns = 3,
  iconStyle = 'circle',
  showHover = true,
  className = ''
}: FeatureTemplateProps) => {
  const getGridClasses = () => {
    if (layout === 'list') {
      return 'space-y-8'
    }
    
    switch (columns) {
      case 2:
        return 'grid grid-cols-1 md:grid-cols-2 gap-8'
      case 3:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
      case 4:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'
    }
  }

  const getIconClasses = () => {
    const baseClasses = 'w-12 h-12 flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400'
    
    switch (iconStyle) {
      case 'circle':
        return `${baseClasses} bg-primary-100 dark:bg-primary-900/20 rounded-full`
      case 'square':
        return `${baseClasses} bg-primary-100 dark:bg-primary-900/20 rounded-lg`
      default:
        return baseClasses
    }
  }

  const getCardClasses = () => {
    const baseClasses = layout === 'cards' 
      ? 'p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-card'
      : layout === 'list'
      ? 'flex items-start space-x-4'
      : ''
      
    return showHover && layout === 'cards' 
      ? `${baseClasses} hover-lift hover-glow transition-all duration-300`
      : baseClasses
  }

  const renderFeature = (feature: Feature, index: number) => {
    const content = (
      <>
        {feature.icon && (
          <div className={layout === 'list' ? 'flex-shrink-0' : ''}>
            <div className={getIconClasses()}>
              {feature.icon}
            </div>
          </div>
        )}
        
        <div className={layout === 'list' ? 'flex-1' : ''}>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            {feature.title}
          </h3>
          <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
            {feature.description}
          </p>
        </div>
      </>
    )

    if (feature.href) {
      return (
        <a
          key={index}
          href={feature.href}
          className={`${getCardClasses()} group cursor-pointer`}
        >
          {content}
        </a>
      )
    }

    return (
      <div key={index} className={getCardClasses()}>
        {content}
      </div>
    )
  }

  return (
    <div className={`${getGridClasses()} ${className}`}>
      {features.map((feature, index) => renderFeature(feature, index))}
    </div>
  )
}

export default FeatureTemplate