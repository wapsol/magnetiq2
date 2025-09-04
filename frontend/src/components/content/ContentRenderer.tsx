import React from 'react'
import { ProcessedPageContent, ContentRendererProps } from '../../types/content'
import BlockRenderer from './BlockRenderer'

const ContentRenderer: React.FC<ContentRendererProps> = ({ 
  content, 
  language, 
  className = '' 
}) => {
  // Handle empty or invalid content
  if (!content) {
    if (import.meta.env.MODE === 'development') {
      return (
        <div className="border-2 border-dashed border-red-300 bg-red-50 p-4 rounded-lg">
          <p className="text-red-800">No content provided to ContentRenderer</p>
        </div>
      )
    }
    return null
  }

  // Render based on content format
  const renderContent = (): React.ReactNode => {
    switch (content.format) {
      case 'blocks':
        return renderBlockContent()
      case 'legacy':
        return renderLegacyContent()
      case 'empty':
        return renderEmptyContent()
      default:
        if (import.meta.env.MODE === 'development') {
          return (
            <div className="border-2 border-dashed border-orange-300 bg-orange-50 p-4 rounded-lg">
              <p className="text-orange-800">Unknown content format: {content.format}</p>
            </div>
          )
        }
        return null
    }
  }

  const renderBlockContent = (): React.ReactNode => {
    const blocks = content.blocks?.[language] || content.blocks?.['en'] || []
    
    if (blocks.length === 0) {
      return renderEmptyContent()
    }

    return (
      <div className="content-blocks space-y-0">
        {blocks.map((block, index) => (
          <BlockRenderer
            key={block._key || `block-${index}`}
            block={block}
            language={language}
            index={index}
          />
        ))}
      </div>
    )
  }

  const renderLegacyContent = (): React.ReactNode => {
    const htmlContent = content.content?.[language] || content.content?.['en'] || ''
    
    if (!htmlContent) {
      return renderEmptyContent()
    }

    return (
      <div 
        className="legacy-content prose prose-lg dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: htmlContent }}
      />
    )
  }

  const renderEmptyContent = (): React.ReactNode => {
    if (import.meta.env.MODE === 'development') {
      return (
        <div className="border-2 border-dashed border-gray-300 bg-gray-50 p-8 rounded-lg text-center">
          <p className="text-gray-600">No content available for language: {language}</p>
          <p className="text-sm text-gray-500 mt-2">
            Available languages: {content.meta.supported_languages.join(', ')}
          </p>
        </div>
      )
    }
    
    // In production, try to fall back to English if current language is not available
    if (language !== 'en' && content.meta.supported_languages.includes('en')) {
      return (
        <ContentRenderer
          content={content}
          language="en"
          className={className}
        />
      )
    }
    
    return null
  }

  const containerClasses = `content-renderer ${className}`.trim()

  return (
    <div 
      className={containerClasses}
      data-content-format={content.format}
      data-language={language}
    >
      {renderContent()}
    </div>
  )
}

export default ContentRenderer