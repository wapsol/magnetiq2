import React, { useState, useEffect } from 'react'
import { HeroImageBlock } from '../../types/content'

interface HeroImageRendererProps {
  block: HeroImageBlock
  language: string
  className?: string
}

const HeroImageRenderer: React.FC<HeroImageRendererProps> = ({ 
  block, 
  language, 
  className = '' 
}) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const getContainerClasses = (): string => {
    const baseClasses = 'hero-image-block relative overflow-hidden'
    
    // Height classes
    const heightClasses = {
      'small': 'h-64 md:h-80',
      'medium': 'h-80 md:h-96',
      'large': 'h-96 md:h-[32rem]',
      'viewport': 'h-screen',
      'auto': 'h-auto'
    }
    
    const heightClass = heightClasses[block.height || 'large']
    
    return `${baseClasses} ${heightClass} ${className}`
  }

  const getContentClasses = (): string => {
    const baseClasses = 'relative z-10 h-full flex'
    
    // Text position classes
    const positionClasses = {
      'top': 'items-start pt-16 md:pt-24',
      'center': 'items-center',
      'bottom': 'items-end pb-16 md:pb-24'
    }
    
    // Text alignment classes
    const alignmentClasses = {
      'left': 'justify-start text-left',
      'center': 'justify-center text-center', 
      'right': 'justify-end text-right'
    }
    
    const positionClass = positionClasses[block.text_position || 'center']
    const alignmentClass = alignmentClasses[block.text_alignment || 'center']
    
    return `${baseClasses} ${positionClass} ${alignmentClass}`
  }

  const getContentWrapperClasses = (): string => {
    const baseClasses = 'px-4 sm:px-6 lg:px-8'
    
    // Content width classes
    const widthClasses = {
      'narrow': 'max-w-2xl',
      'medium': 'max-w-4xl',
      'wide': 'max-w-6xl',
      'full': 'max-w-full'
    }
    
    const widthClass = widthClasses[block.content_width || 'medium']
    
    if (block.text_alignment === 'left') {
      return `${baseClasses} ${widthClass}`
    } else if (block.text_alignment === 'right') {
      return `${baseClasses} ${widthClass} ml-auto`
    } else {
      return `${baseClasses} ${widthClass} mx-auto`
    }
  }

  const getBackgroundImageStyle = (): React.CSSProperties => {
    const currentImage = isMobile && block.mobile_image ? block.mobile_image : block.background_image
    
    let style: React.CSSProperties = {
      backgroundImage: `url(${currentImage})`,
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center'
    }
    
    // Apply focal point if specified
    if (block.focal_point) {
      const { x = 0.5, y = 0.5 } = block.focal_point
      style.backgroundPosition = `${x * 100}% ${y * 100}%`
    }
    
    // Apply blur effect if enabled
    if (block.blur_background) {
      style.filter = 'blur(2px)'
      style.transform = 'scale(1.1)' // Prevent blur edge artifacts
    }
    
    // Apply parallax transform if enabled (handled by parent)
    return style
  }

  const getOverlayStyle = (): React.CSSProperties => {
    const opacity = block.overlay_opacity ?? 0.4
    const color = block.overlay_color || '#000000'
    
    return {
      backgroundColor: color,
      opacity: opacity
    }
  }

  const currentImage = isMobile && block.mobile_image ? block.mobile_image : block.background_image

  return (
    <section className={getContainerClasses()}>
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{
          ...getBackgroundImageStyle(),
          opacity: isImageLoaded ? 1 : 0
        }}
        aria-hidden="true"
      />
      
      {/* Background image preloader */}
      <img
        src={currentImage}
        alt=""
        className="sr-only"
        onLoad={() => setIsImageLoaded(true)}
        aria-hidden="true"
      />
      
      {/* Loading placeholder */}
      {!isImageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <svg className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          ...getOverlayStyle(),
          opacity: isImageLoaded ? (block.overlay_opacity ?? 0.4) : 0
        }}
        aria-hidden="true"
      />
      
      {/* Content */}
      <div className={getContentClasses()}>
        <div className={getContentWrapperClasses()}>
          <div className="text-white">
            {/* Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              {block.title}
            </h1>
            
            {/* Subtitle */}
            {block.subtitle && (
              <p className="text-xl sm:text-2xl lg:text-3xl font-light mb-6 text-gray-100">
                {block.subtitle}
              </p>
            )}
            
            {/* Description */}
            {block.description && (
              <p className="text-lg sm:text-xl mb-8 text-gray-200 max-w-3xl leading-relaxed">
                {block.description}
              </p>
            )}
            
            {/* Actions */}
            {(block.primary_action || block.secondary_action) && (
              <div className="flex flex-col sm:flex-row gap-4">
                {block.primary_action && (
                  <a
                    href={block.primary_action.href}
                    className={`
                      inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200
                      ${block.primary_action.variant === 'outline' 
                        ? 'border-2 border-white text-white hover:bg-white hover:text-gray-900' 
                        : 'bg-white text-gray-900 hover:bg-gray-100'
                      }
                      ${block.text_alignment === 'center' ? 'w-full sm:w-auto' : ''}
                    `}
                  >
                    {block.primary_action.text}
                  </a>
                )}
                
                {block.secondary_action && (
                  <a
                    href={block.secondary_action.href}
                    className={`
                      inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-lg transition-all duration-200
                      border-2 border-white/50 text-white hover:border-white hover:bg-white/10
                      ${block.text_alignment === 'center' ? 'w-full sm:w-auto' : ''}
                    `}
                  >
                    {block.secondary_action.text}
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Screen reader accessible image description */}
      <div className="sr-only">
        Image: {block.background_image_alt}
      </div>
    </section>
  )
}

export default HeroImageRenderer