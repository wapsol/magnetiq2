import React from 'react'
import { ContentBlock, BlockRendererProps } from '../../types/content'
import HeroTemplate from '../templates/HeroTemplate'
import FeatureTemplate from '../templates/FeatureTemplate'
import CTATemplate from '../templates/CTATemplate'
import StatsTemplate from '../templates/StatsTemplate'
import TestimonialTemplate from '../templates/TestimonialTemplate'
import FAQTemplate from '../templates/FAQTemplate'
import PricingTemplate from '../templates/PricingTemplate'
import RichTextRenderer from './RichTextRenderer'
import ImageRenderer from './ImageRenderer'
import GalleryRenderer from './GalleryRenderer'
import HeroImageRenderer from './HeroImageRenderer'
import VideoRenderer from './VideoRenderer'
import SectionRenderer from './SectionRenderer'

const BlockRenderer: React.FC<BlockRendererProps> = ({ 
  block, 
  language, 
  index = 0, 
  className = '' 
}) => {
  const blockKey = block._key || `${block._type}-${index}`

  // Add responsive classes and animation classes
  const baseClasses = `block-renderer ${className} ${
    block._meta?.responsive ? 'responsive-block' : ''
  }`

  const renderBlock = (): React.ReactNode => {
    switch (block._type) {
      case 'hero':
        const heroBlock = block as any
        return (
          <HeroTemplate
            title={heroBlock.title}
            subtitle={heroBlock.subtitle}
            description={heroBlock.description}
            primaryAction={heroBlock.primary_action}
            secondaryAction={heroBlock.secondary_action}
            backgroundVariant={heroBlock.background_variant}
            backgroundImage={heroBlock.background_image}
            size={heroBlock.size}
            alignment={heroBlock.alignment}
            badge={heroBlock.badge}
          />
        )

      case 'features':
        const featureBlock = block as any
        return (
          <FeatureTemplate
            title={featureBlock.title}
            subtitle={featureBlock.subtitle}
            features={featureBlock.items}
            layout={featureBlock.layout}
            columns={featureBlock.columns}
            showIcons={featureBlock.show_icons}
          />
        )

      case 'cta':
        const ctaBlock = block as any
        return (
          <CTATemplate
            title={ctaBlock.title}
            description={ctaBlock.description}
            primaryAction={ctaBlock.primary_action}
            secondaryAction={ctaBlock.secondary_action}
            backgroundVariant={ctaBlock.background_variant}
            size={ctaBlock.size}
          />
        )

      case 'stats':
        const statsBlock = block as any
        return (
          <StatsTemplate
            title={statsBlock.title}
            stats={statsBlock.stats}
            layout={statsBlock.layout}
            columns={statsBlock.columns}
          />
        )

      case 'testimonials':
        const testimonialBlock = block as any
        return (
          <TestimonialTemplate
            title={testimonialBlock.title}
            testimonials={testimonialBlock.testimonials}
            layout={testimonialBlock.layout}
            showImages={testimonialBlock.show_images}
          />
        )

      case 'faq':
        const faqBlock = block as any
        return (
          <FAQTemplate
            title={faqBlock.title}
            items={faqBlock.items}
            layout={faqBlock.layout}
          />
        )

      case 'pricing':
        const pricingBlock = block as any
        return (
          <PricingTemplate
            title={pricingBlock.title}
            subtitle={pricingBlock.subtitle}
            plans={pricingBlock.plans}
            billingToggle={pricingBlock.billing_toggle}
          />
        )

      case 'richtext':
        return (
          <RichTextRenderer 
            block={block as any}
            language={language}
          />
        )

      case 'image':
        return (
          <ImageRenderer
            block={block as any}
            language={language}
          />
        )

      case 'gallery':
        return (
          <GalleryRenderer
            block={block as any}
            language={language}
          />
        )

      case 'hero_image':
        return (
          <HeroImageRenderer
            block={block as any}
            language={language}
          />
        )

      case 'video':
        return (
          <VideoRenderer
            block={block as any}
            language={language}
          />
        )

      case 'section':
        return (
          <SectionRenderer
            block={block as any}
            language={language}
          />
        )

      default:
        // Unknown block type - render as debug info in development
        if (import.meta.env.MODE === 'development') {
          return (
            <div className="border-2 border-dashed border-yellow-300 bg-yellow-50 p-4 rounded-lg">
              <p className="text-yellow-800 font-medium">Unknown block type: {block._type}</p>
              <details className="mt-2">
                <summary className="text-yellow-700 cursor-pointer">Block data</summary>
                <pre className="text-xs mt-2 bg-yellow-100 p-2 rounded overflow-auto">
                  {JSON.stringify(block, null, 2)}
                </pre>
              </details>
            </div>
          )
        }
        
        // In production, render nothing for unknown blocks
        return null
    }
  }

  const renderedBlock = renderBlock()
  
  if (!renderedBlock) {
    return null
  }

  return (
    <div 
      key={blockKey}
      className={baseClasses}
      data-block-type={block._type}
      data-block-index={index}
    >
      {renderedBlock}
    </div>
  )
}

export default BlockRenderer