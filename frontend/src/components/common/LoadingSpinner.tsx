import { BoltIcon } from '@heroicons/react/24/outline'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  fullScreen?: boolean
}

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false 
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const containerClasses = fullScreen 
    ? 'fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50'
    : 'flex items-center justify-center p-8'

  return (
    <div className={containerClasses}>
      <div className="text-center">
        <div className="relative inline-block">
          {/* Spinning outer ring */}
          <div className={`${sizeClasses[size]} border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin`}></div>
          
          {/* Center icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <BoltIcon className={`${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-4 w-4' : size === 'lg' ? 'h-6 w-6' : 'h-8 w-8'} text-primary-600 animate-pulse`} />
          </div>
          
          {/* Glow effect */}
          <div className={`absolute inset-0 ${sizeClasses[size]} bg-primary-600/20 rounded-full blur-md animate-pulse`}></div>
        </div>
        
        {text && (
          <p className={`mt-4 text-gray-600 ${size === 'sm' ? 'text-xs' : size === 'md' ? 'text-sm' : 'text-base'} font-medium animate-pulse`}>
            {text}
          </p>
        )}
      </div>
    </div>
  )
}

export default LoadingSpinner