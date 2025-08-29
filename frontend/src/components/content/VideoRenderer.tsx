import React, { useState, useRef } from 'react'
import { VideoBlock } from '../../types/content'

interface VideoRendererProps {
  block: VideoBlock
  language: string
  className?: string
}

const VideoRenderer: React.FC<VideoRendererProps> = ({ 
  block, 
  language, 
  className = '' 
}) => {
  const [isPlaying, setIsPlaying] = useState(block.autoplay || false)
  const [showControls, setShowControls] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const getContainerClasses = (): string => {
    return `video-block relative overflow-hidden rounded-lg bg-black ${className}`
  }

  const getContainerStyle = (): React.CSSProperties => {
    const style: React.CSSProperties = {}
    
    if (block.aspect_ratio) {
      const [width, height] = block.aspect_ratio.split(':').map(Number)
      if (width && height) {
        style.aspectRatio = `${width} / ${height}`
      }
    }
    
    return style
  }

  const handlePlayPause = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const isVideoUrl = (url: string): boolean => {
    return url.match(/\.(mp4|webm|ogg)$/i) !== null
  }

  const isYouTubeUrl = (url: string): boolean => {
    return url.includes('youtube.com') || url.includes('youtu.be')
  }

  const getYouTubeEmbedUrl = (url: string): string => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    return videoId ? `https://www.youtube.com/embed/${videoId[1]}` : url
  }

  const renderVideoPlayer = (): React.ReactNode => {
    if (isVideoUrl(block.src)) {
      // Direct video file
      return (
        <>
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay={block.autoplay}
            controls={block.controls && showControls}
            poster={block.thumbnail}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={block.src} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Custom play/pause overlay */}
          {!block.controls && (
            <button
              onClick={handlePlayPause}
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 hover:bg-opacity-50 transition-all duration-200 group"
              aria-label={isPlaying ? 'Pause video' : 'Play video'}
            >
              <div className="bg-white bg-opacity-90 rounded-full p-4 group-hover:scale-110 transition-transform duration-200">
                {isPlaying ? (
                  <svg className="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 text-gray-800 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1M9 16h1m4 0h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
            </button>
          )}
        </>
      )
    } else if (isYouTubeUrl(block.src)) {
      // YouTube embed
      return (
        <iframe
          className="w-full h-full"
          src={getYouTubeEmbedUrl(block.src)}
          title={block.title || 'Video'}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )
    } else {
      // Generic embed or unsupported format
      return (
        <iframe
          className="w-full h-full"
          src={block.src}
          title={block.title || 'Video'}
          frameBorder="0"
          allowFullScreen
        />
      )
    }
  }

  return (
    <div className={getContainerClasses()}>
      <div 
        className="w-full h-full"
        style={getContainerStyle()}
      >
        {renderVideoPlayer()}
      </div>
      
      {block.title && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
          <h3 className="text-white font-medium text-lg">{block.title}</h3>
        </div>
      )}
    </div>
  )
}

export default VideoRenderer