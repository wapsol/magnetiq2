import React from 'react'
import { RichTextBlock, RichTextSpan } from '../../types/content'

interface RichTextRendererProps {
  block: RichTextBlock
  language: string
  className?: string
}

const RichTextRenderer: React.FC<RichTextRendererProps> = ({ 
  block, 
  language, 
  className = '' 
}) => {
  const renderSpan = (span: RichTextSpan, index: number): React.ReactNode => {
    let content: React.ReactNode = span.text

    // Apply marks (formatting)
    if (span.marks && span.marks.length > 0) {
      span.marks.forEach(mark => {
        if (typeof mark === 'string') {
          // Simple decorator marks
          switch (mark) {
            case 'strong':
              content = <strong key={`strong-${index}`}>{content}</strong>
              break
            case 'em':
              content = <em key={`em-${index}`}>{content}</em>
              break
            case 'underline':
              content = <u key={`u-${index}`}>{content}</u>
              break
            case 'code':
              content = <code key={`code-${index}`} className="bg-gray-100 px-1 py-0.5 rounded text-sm">{content}</code>
              break
          }
        } else {
          // Annotation marks - would need to look up in markDefs
          // For now, just render as plain text
          console.warn('Annotation marks not yet implemented:', mark)
        }
      })
    }

    return <span key={index}>{content}</span>
  }

  const getElementType = (style?: string): string => {
    switch (style) {
      case 'h1': return 'h1'
      case 'h2': return 'h2'
      case 'h3': return 'h3'
      case 'h4': return 'h4'
      case 'h5': return 'h5'
      case 'h6': return 'h6'
      case 'blockquote': return 'blockquote'
      default: return 'p'
    }
  }

  const getElementClasses = (style?: string): string => {
    const baseClasses = 'richtext-block'
    
    switch (style) {
      case 'h1':
        return `${baseClasses} text-4xl font-bold mb-6 text-gray-900 dark:text-white`
      case 'h2':
        return `${baseClasses} text-3xl font-bold mb-5 text-gray-900 dark:text-white`
      case 'h3':
        return `${baseClasses} text-2xl font-semibold mb-4 text-gray-900 dark:text-white`
      case 'h4':
        return `${baseClasses} text-xl font-semibold mb-3 text-gray-900 dark:text-white`
      case 'h5':
        return `${baseClasses} text-lg font-medium mb-3 text-gray-900 dark:text-white`
      case 'h6':
        return `${baseClasses} text-base font-medium mb-2 text-gray-900 dark:text-white`
      case 'blockquote':
        return `${baseClasses} border-l-4 border-primary-500 pl-4 italic text-gray-700 dark:text-gray-300 mb-4`
      default:
        return `${baseClasses} text-base mb-4 text-gray-600 dark:text-gray-300 leading-relaxed`
    }
  }

  const ElementType = getElementType(block.style) as keyof JSX.IntrinsicElements
  const elementClasses = `${getElementClasses(block.style)} ${className}`.trim()

  return (
    <ElementType className={elementClasses}>
      {block.children.map((span, index) => renderSpan(span, index))}
    </ElementType>
  )
}

export default RichTextRenderer