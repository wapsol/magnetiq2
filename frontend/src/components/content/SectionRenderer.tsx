import React from 'react'
import { SectionBlock } from '../../types/content'
import BlockRenderer from './BlockRenderer'

interface SectionRendererProps {
  block: SectionBlock
  language: string
  className?: string
}

const SectionRenderer: React.FC<SectionRendererProps> = ({ 
  block, 
  language, 
  className = '' 
}) => {
  const getBackgroundClasses = (): string => {
    switch (block.background_variant) {
      case 'white':
        return 'bg-white dark:bg-gray-900'
      case 'gray':
        return 'bg-gray-50 dark:bg-gray-800'
      case 'primary':
        return 'bg-primary-50 dark:bg-primary-900'
      case 'dark':
        return 'bg-gray-900 dark:bg-black'
      default:
        return 'bg-white dark:bg-gray-900'
    }
  }

  const getPaddingClasses = (): string => {
    switch (block.padding) {
      case 'none':
        return ''
      case 'small':
        return 'py-8 sm:py-12'
      case 'medium':
        return 'py-12 sm:py-16 lg:py-20'
      case 'large':
        return 'py-16 sm:py-20 lg:py-24'
      default:
        return 'py-12 sm:py-16 lg:py-20'
    }
  }

  const getMaxWidthClasses = (): string => {
    switch (block.max_width) {
      case 'full':
        return ''
      case 'container':
        return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
      case 'narrow':
        return 'max-w-4xl mx-auto px-4 sm:px-6 lg:px-8'
      default:
        return 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'
    }
  }

  const sectionClasses = `
    section-block 
    ${getBackgroundClasses()} 
    ${getPaddingClasses()} 
    ${className}
  `.trim()

  const containerClasses = getMaxWidthClasses()

  return (
    <section className={sectionClasses}>
      <div className={containerClasses}>
        <div className="space-y-8">
          {block.children.map((childBlock, index) => (
            <BlockRenderer
              key={childBlock._key || `section-child-${index}`}
              block={childBlock}
              language={language}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default SectionRenderer