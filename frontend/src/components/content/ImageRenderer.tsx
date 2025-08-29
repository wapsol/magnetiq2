import React, { useState } from 'react'
import { ImageBlock } from '../../types/content'

interface ImageRendererProps {
  block: ImageBlock
  language: string
  className?: string
}

const ImageRenderer: React.FC<ImageRendererProps> = ({ 
  block, 
  language, 
  className = '' 
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const getContainerClasses = (): string => {
    const baseClasses = 'image-block'
    const alignmentClasses = {
      'left': 'text-left',
      'center': 'text-center',
      'right': 'text-right',
      'full': 'w-full'
    }
    
    return `${baseClasses} ${alignmentClasses[block.alignment || 'center']} ${className}`
  }

  const getImageClasses = (): string => {
    const baseClasses = 'transition-opacity duration-300'
    const objectFitClasses = {
      'cover': 'object-cover',
      'contain': 'object-contain',
      'fill': 'object-fill'
    }
    
    let classes = `${baseClasses} ${objectFitClasses[block.object_fit || 'cover']}`
    
    // Add opacity based on load state
    if (isLoaded) {
      classes += ' opacity-100'
    } else {
      classes += ' opacity-0'
    }

    // Add responsive classes
    if (block.alignment === 'full') {
      classes += ' w-full'
    } else {
      classes += ' max-w-full h-auto'
    }

    return classes
  }

  const getContainerStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {}
    
    if (block.aspect_ratio && block.aspect_ratio !== 'auto') {
      const [width, height] = block.aspect_ratio.split(':').map(Number)
      if (width && height) {
        style.aspectRatio = `${width} / ${height}`
      }
    }
    
    return style
  }

  const getSizes = (): string => {
    // Use responsive config from meta if available
    if (block._meta?.responsive_config?.sizes) {
      return block._meta.responsive_config.sizes
    }
    
    // Default responsive sizes based on alignment
    if (block.alignment === 'full') {
      return '100vw'
    } else {
      return '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
    }
  }

  const getLoading = (): 'lazy' | 'eager' => {
    return block._meta?.responsive_config?.loading || 'lazy'
  }

  if (hasError) {
    return (
      <div className={`${getContainerClasses()} bg-gray-100 border-2 border-dashed border-gray-300 p-8 rounded-lg`}>
        <div className="text-center text-gray-500">
          <svg className="mx-auto h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p>Image failed to load</p>
          {block.caption && (
            <p className="text-sm mt-2">{block.caption}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <figure className={getContainerClasses()}>
      <div 
        className="relative overflow-hidden rounded-lg"
        style={getContainerStyle()}
      >
        {/* Loading placeholder */}
        {!isLoaded && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        <img
          src={block.src}
          alt={block.alt}
          width={block.width}
          height={block.height}
          sizes={getSizes()}
          loading={getLoading()}
          className={getImageClasses()}
          onLoad={() => setIsLoaded(true)}
          onError={() => {
            setHasError(true)
            setIsLoaded(false)
          }}
        />
      </div>
      
      {block.caption && (
        <figcaption className="mt-3 text-sm text-gray-600 dark:text-gray-400 text-center italic">
          {block.caption}
        </figcaption>
      )}
    </figure>
  )
}

export default ImageRenderer