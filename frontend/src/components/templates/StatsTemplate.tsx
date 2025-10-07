import { ReactNode } from 'react'

interface Stat {
  value: string | number
  label: string
  description?: string
  icon?: ReactNode
  trend?: {
    direction: 'up' | 'down' | 'neutral'
    value: string
    label?: string
  }
}

interface StatsTemplateProps {
  title?: string
  stats: Stat[]
  layout?: 'grid' | 'inline' | 'cards'
  columns?: 2 | 3 | 4 | 5
  variant?: 'simple' | 'detailed' | 'bordered'
  background?: 'white' | 'gray' | 'primary' | 'transparent'
  size?: 'small' | 'medium' | 'large'
  showTrends?: boolean
  className?: string
}

const StatsTemplate = ({
  stats,
  layout = 'grid',
  columns = 4,
  variant = 'simple',
  background = 'transparent',
  size = 'medium',
  showTrends = false,
  className = ''
}: StatsTemplateProps) => {
  const getGridClasses = () => {
    if (layout === 'inline') {
      return 'flex flex-wrap justify-center gap-8'
    }
    
    const colMap = {
      2: 'grid-cols-1 sm:grid-cols-2',
      3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
      5: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5'
    }
    
    return `grid ${colMap[columns]} gap-6`
  }

  const getBackgroundClasses = () => {
    switch (background) {
      case 'gray':
        return 'bg-gray-50'
      case 'primary':
        return 'bg-primary-50'
      case 'white':
        return 'bg-white'
      default:
        return ''
    }
  }

  const getStatClasses = () => {
    const baseClasses = layout === 'inline' ? 'text-center' : 'text-center'

    // @ts-ignore - variant can include 'cards' from dynamic content
    if (variant === 'cards') {
      return `${baseClasses} bg-white p-6 rounded-xl shadow-card border border-gray-200 hover-lift transition-all duration-300`
    } else if (variant === 'bordered') {
      return `${baseClasses} p-6 border border-gray-200 rounded-lg`
    }
    
    return `${baseClasses} p-4`
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return {
          value: 'text-2xl sm:text-3xl',
          label: 'text-sm',
          description: 'text-xs'
        }
      case 'large':
        return {
          value: 'text-4xl sm:text-5xl lg:text-6xl',
          label: 'text-base sm:text-lg',
          description: 'text-sm'
        }
      default:
        return {
          value: 'text-3xl sm:text-4xl',
          label: 'text-sm sm:text-base',
          description: 'text-xs sm:text-sm'
        }
    }
  }

  const getTrendClasses = (direction: string) => {
    switch (direction) {
      case 'up':
        return 'text-success-600'
      case 'down':
        return 'text-error-600'
      default:
        return 'text-gray-500'
    }
  }

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up':
        return '↗'
      case 'down':
        return '↘'
      default:
        return '→'
    }
  }

  const sizeClasses = getSizeClasses()
  const isLightBackground = background === 'gray' || background === 'primary' || background === 'white'
  const textColorClass = isLightBackground ? 'text-gray-900' : 'text-white'
  const subTextColorClass = isLightBackground ? 'text-gray-600' : 'text-white/80'

  return (
    <div className={`${getBackgroundClasses()} ${className}`}>
      <div className={getGridClasses()}>
        {stats.map((stat, index) => (
          <div key={index} className={getStatClasses()}>
            {stat.icon && (
              <div className="flex justify-center mb-3">
                <div className={`w-12 h-12 flex items-center justify-center rounded-full ${
                  isLightBackground ? 'bg-primary-100 text-primary-600' : 'bg-white/10 text-white'
                }`}>
                  {stat.icon}
                </div>
              </div>
            )}
            
            <div className={`${sizeClasses.value} font-bold ${textColorClass} mb-2`}>
              {stat.value}
            </div>
            
            <div className={`${sizeClasses.label} font-medium ${textColorClass} mb-1`}>
              {stat.label}
            </div>
            
            {stat.description && (
              <div className={`${sizeClasses.description} ${subTextColorClass}`}>
                {stat.description}
              </div>
            )}
            
            {showTrends && stat.trend && (
              <div className={`text-xs font-medium mt-2 flex items-center justify-center space-x-1 ${getTrendClasses(stat.trend.direction)}`}>
                <span>{getTrendIcon(stat.trend.direction)}</span>
                <span>{stat.trend.value}</span>
                {stat.trend.label && (
                  <span className={subTextColorClass}>
                    {stat.trend.label}
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default StatsTemplate