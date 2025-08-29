import { ReactNode } from 'react'

interface ContentTemplateProps {
  children: ReactNode
  className?: string
  maxWidth?: 'full' | 'container' | 'narrow'
}

const ContentTemplate = ({ 
  children, 
  className = '', 
  maxWidth = 'full'
}: ContentTemplateProps) => {
  const getMaxWidthClass = () => {
    switch (maxWidth) {
      case 'container':
        return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
      case 'narrow':
        return 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'
      default:
        return ''
    }
  }

  return (
    <div className={`${className} dark:text-gray-100`}>
      <div className={`${getMaxWidthClass()}`}>
        {children}
      </div>
    </div>
  )
}

export default ContentTemplate