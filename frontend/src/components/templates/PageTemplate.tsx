import { ReactNode } from 'react'
import Header from '../common/Header'
import Footer from '../common/Footer'

interface PageTemplateProps {
  children: ReactNode
  className?: string
  headerVariant?: 'default' | 'transparent' | 'minimal'
  showFooter?: boolean
  maxWidth?: 'full' | 'container' | 'narrow'
}

const PageTemplate = ({ 
  children, 
  className = '', 
  headerVariant = 'default',
  showFooter = true,
  maxWidth = 'full'
}: PageTemplateProps) => {
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
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <Header variant={headerVariant} />
      <main className={`flex-1 ${getMaxWidthClass()}`}>
        {children}
      </main>
      {showFooter && <Footer />}
    </div>
  )
}

export default PageTemplate