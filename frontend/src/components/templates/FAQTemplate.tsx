import { useState } from 'react'
import { ChevronDownIcon } from '@heroicons/react/24/outline'

interface FAQ {
  question: string
  answer: string
}

interface FAQTemplateProps {
  faqs?: FAQ[]
  items?: FAQ[]
  title?: string
  subtitle?: string
  description?: string
  layout?: 'single' | 'two-column'
  variant?: 'simple' | 'bordered' | 'cards'
  allowMultiple?: boolean
  className?: string
}

const FAQTemplate = ({
  faqs,
  items,
  title,
  subtitle,
  description,
  layout = 'single',
  variant = 'simple',
  allowMultiple = false,
  className = ''
}: FAQTemplateProps) => {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set())

  // Support both faqs and items props
  const faqList = faqs || items || []

  const toggleItem = (index: number) => {
    const newOpenItems = new Set(openItems)
    
    if (openItems.has(index)) {
      newOpenItems.delete(index)
    } else {
      if (!allowMultiple) {
        newOpenItems.clear()
      }
      newOpenItems.add(index)
    }
    
    setOpenItems(newOpenItems)
  }

  const getItemClasses = () => {
    switch (variant) {
      case 'cards':
        return 'bg-white rounded-xl shadow-card border border-gray-200 hover:shadow-elevated transition-all duration-300'
      case 'bordered':
        return 'border border-gray-200 rounded-lg hover:border-gray-300 transition-colors duration-200'
      default:
        return 'border-b border-gray-200'
    }
  }

  const getPaddingClasses = () => {
    return variant === 'cards' || variant === 'bordered' ? 'p-6' : 'py-6'
  }

  const renderFAQItem = (faq: FAQ, index: number) => {
    const isOpen = openItems.has(index)
    
    return (
      <div key={index} className={`${getItemClasses()} ${variant === 'simple' ? 'last:border-b-0' : ''}`}>
        <button
          onClick={() => toggleItem(index)}
          className={`w-full text-left ${getPaddingClasses()} focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${variant === 'cards' || variant === 'bordered' ? 'rounded-lg' : ''}`}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 pr-4">
              {faq.question}
            </h3>
            <ChevronDownIcon 
              className={`h-5 w-5 text-gray-500 transition-transform duration-200 flex-shrink-0 ${
                isOpen ? 'transform rotate-180' : ''
              }`}
            />
          </div>
        </button>
        
        {isOpen && (
          <div className={`${variant === 'simple' ? 'pb-6' : 'px-6 pb-6'} pt-0`}>
            <div className="text-gray-600 leading-relaxed">
              {faq.answer}
            </div>
          </div>
        )}
      </div>
    )
  }

  const splitFAQs = () => {
    if (layout === 'two-column') {
      const mid = Math.ceil(faqList.length / 2)
      return [faqList.slice(0, mid), faqList.slice(mid)]
    }
    return [faqList]
  }

  const faqColumns = splitFAQs()

  return (
    <div className={className}>
      {/* Header */}
      {(title || subtitle || description) && (
        <div className="text-center mb-12">
          {subtitle && (
            <p className="text-sm font-semibold uppercase tracking-wide text-primary-600 mb-4">
              {subtitle}
            </p>
          )}
          
          {title && (
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              {title}
            </h2>
          )}
          
          {description && (
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {description}
            </p>
          )}
        </div>
      )}

      {/* FAQ Content */}
      {layout === 'two-column' && faqColumns.length === 2 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {faqColumns.map((columnFAQs, columnIndex) => (
            <div key={columnIndex} className={`space-y-${variant === 'simple' ? '0' : '4'}`}>
              {columnFAQs.map((faq, index) => 
                renderFAQItem(faq, columnIndex === 0 ? index : index + faqColumns[0].length)
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className={`max-w-4xl mx-auto space-y-${variant === 'simple' ? '0' : '4'}`}>
          {faqList.map((faq, index) => renderFAQItem(faq, index))}
        </div>
      )}
    </div>
  )
}

export default FAQTemplate