import React, { useState, useCallback } from 'react'
import { GalleryBlock } from '../../types/content'

interface GalleryRendererProps {
  block: GalleryBlock
  language: string
  className?: string
}

interface LightboxState {
  isOpen: boolean
  currentIndex: number
}

const GalleryRenderer: React.FC<GalleryRendererProps> = ({ 
  block, 
  language, 
  className = '' 
}) => {
  const [lightbox, setLightbox] = useState<LightboxState>({ isOpen: false, currentIndex: 0 })
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())

  const handleImageLoad = useCallback((index: number) => {
    setLoadedImages(prev => new Set(prev).add(index))
  }, [])

  const openLightbox = useCallback((index: number) => {
    if (block.enable_lightbox !== false) {
      setLightbox({ isOpen: true, currentIndex: index })
    }
  }, [block.enable_lightbox])

  const closeLightbox = useCallback(() => {
    setLightbox({ isOpen: false, currentIndex: 0 })
  }, [])

  const navigateLightbox = useCallback((direction: 'prev' | 'next') => {
    setLightbox(prev => ({
      ...prev,
      currentIndex: direction === 'next' 
        ? (prev.currentIndex + 1) % block.images.length
        : (prev.currentIndex - 1 + block.images.length) % block.images.length
    }))
  }, [block.images.length])

  const getContainerClasses = (): string => {
    const baseClasses = 'gallery-block'
    const gapClasses = {
      'none': 'gap-0',
      'small': 'gap-2',
      'medium': 'gap-4', 
      'large': 'gap-6'
    }
    
    return `${baseClasses} ${gapClasses[block.gap || 'medium']} ${className}`
  }

  const getGridClasses = (): string => {
    const { layout, columns = 3 } = block
    
    if (layout === 'masonry') {
      return `columns-1 md:columns-${Math.min(columns, 3)} gap-4 space-y-4`
    }
    
    if (layout === 'carousel') {
      return 'flex overflow-x-auto gap-4 scrollbar-hide'
    }
    
    // Default grid layout
    const gridCols = {
      1: 'grid-cols-1',
      2: 'grid-cols-1 md:grid-cols-2',
      3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
      4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }
    
    return `grid ${gridCols[columns as keyof typeof gridCols] || gridCols[3]}`
  }

  const getImageClasses = (index: number): string => {
    const baseClasses = 'transition-all duration-300'
    const isLoaded = loadedImages.has(index)
    
    let classes = `${baseClasses} ${isLoaded ? 'opacity-100' : 'opacity-0'}`
    
    if (block.aspect_ratio && block.layout === 'grid') {
      classes += ' w-full h-full object-cover'
    } else if (block.layout === 'carousel') {
      classes += ' h-64 w-auto flex-shrink-0 object-cover'
    } else {
      classes += ' w-full h-auto object-cover'
    }
    
    if (block.enable_lightbox !== false) {
      classes += ' cursor-pointer hover:opacity-80'
    }
    
    return classes
  }

  const getContainerStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {}
    
    if (block.aspect_ratio && block.layout === 'grid') {
      const [width, height] = block.aspect_ratio.split(':').map(Number)
      if (width && height) {
        style.aspectRatio = `${width} / ${height}`
      }
    }
    
    return style
  }

  const renderImage = (image: GalleryBlock['images'][0], index: number) => {
    const imageSrc = image.thumbnail_src && block.layout === 'grid' ? image.thumbnail_src : image.src
    
    return (
      <div
        key={index}
        className={`relative overflow-hidden rounded-lg ${block.layout === 'masonry' ? 'break-inside-avoid mb-4' : ''}`}
        style={block.layout === 'grid' ? getContainerStyle() : undefined}
        onClick={() => openLightbox(index)}
      >
        {/* Loading placeholder */}
        {!loadedImages.has(index) && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg flex items-center justify-center">
            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        
        <img
          src={imageSrc}
          alt={image.alt}
          title={image.title}
          width={image.width}
          height={image.height}
          loading={block.lazy_loading !== false ? 'lazy' : 'eager'}
          className={getImageClasses(index)}
          onLoad={() => handleImageLoad(index)}
        />
        
        {/* Caption overlay for grid layout */}
        {block.show_captions && image.caption && block.layout === 'grid' && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
            <p className="text-white text-sm font-medium">{image.caption}</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      <div className={getContainerClasses()}>
        {/* Gallery header */}
        {(block.title || block.description) && (
          <div className="mb-8 text-center">
            {block.title && (
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {block.title}
              </h2>
            )}
            {block.description && (
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                {block.description}
              </p>
            )}
          </div>
        )}
        
        {/* Image grid */}
        <div className={getGridClasses()}>
          {block.images.map((image, index) => renderImage(image, index))}
        </div>
        
        {/* Captions for masonry and carousel layouts */}
        {block.show_captions && ['masonry', 'carousel'].includes(block.layout || 'grid') && (
          <div className="mt-4 space-y-2">
            {block.images.map((image, index) => (
              image.caption && (
                <p key={index} className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  {image.caption}
                </p>
              )
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      {lightbox.isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center"
          onClick={closeLightbox}
        >
          <div className="relative max-w-7xl max-h-full p-4" onClick={e => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              aria-label="Close lightbox"
            >
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Navigation arrows */}
            {block.images.length > 1 && (
              <>
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
                  aria-label="Previous image"
                >
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 z-10"
                  aria-label="Next image"
                >
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Main image */}
            <img
              src={block.images[lightbox.currentIndex]?.src}
              alt={block.images[lightbox.currentIndex]?.alt}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {/* Image counter */}
            {block.images.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white text-sm bg-black/50 px-3 py-1 rounded">
                {lightbox.currentIndex + 1} / {block.images.length}
              </div>
            )}
            
            {/* Caption */}
            {block.images[lightbox.currentIndex]?.caption && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-white text-center max-w-2xl px-4">
                <p className="bg-black/50 px-4 py-2 rounded">
                  {block.images[lightbox.currentIndex].caption}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default GalleryRenderer