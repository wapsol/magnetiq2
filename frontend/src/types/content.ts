// Content Block Type Definitions for Frontend

export type BlockAlignment = 'left' | 'center' | 'right' | 'full'
export type BlockSize = 'small' | 'medium' | 'large' | 'xlarge'
export type BackgroundVariant = 'gradient' | 'solid' | 'pattern' | 'image' | 'white' | 'gray' | 'primary' | 'dark'
export type LayoutType = 'grid' | 'list' | 'carousel' | 'horizontal' | 'vertical' | 'accordion' | 'tabs' | 'single'

// Base Block Interface
export interface BaseContentBlock {
  _type: string
  _key?: string
  _meta?: {
    language?: string
    processed_at?: string
    block_type?: string
    responsive?: boolean
    responsive_config?: {
      mobile_columns?: number
      tablet_columns?: number
      desktop_columns?: number
      mobile_size?: BlockSize
      tablet_size?: BlockSize
      desktop_size?: BlockSize
      sizes?: string
      loading?: 'lazy' | 'eager'
      aspect_ratio?: string
    }
  }
}

// Action Button Interface
export interface ActionButton {
  text: string
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'white' | 'outline'
}

// Badge Interface
export interface Badge {
  text: string
  variant?: 'primary' | 'accent' | 'success'
}

// Rich Text Interfaces
export interface RichTextSpan {
  _type: 'span'
  text: string
  marks: string[]
}

export interface RichTextMarkDef {
  _key: string
  _type: string
  [key: string]: any
}

export interface RichTextBlock extends BaseContentBlock {
  _type: 'richtext'
  style?: 'normal' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'blockquote'
  children: RichTextSpan[]
  markDefs?: RichTextMarkDef[]
}

// Layout Blocks
export interface HeroBlock extends BaseContentBlock {
  _type: 'hero'
  title: string
  subtitle?: string
  description?: string
  primary_action?: ActionButton
  secondary_action?: ActionButton
  background_variant?: BackgroundVariant
  background_image?: string
  size?: BlockSize
  alignment?: 'left' | 'center'
  badge?: Badge
}

export interface FeatureItem {
  title: string
  description: string
  icon?: string
  image?: string
}

export interface FeatureBlock extends BaseContentBlock {
  _type: 'features'
  title?: string
  subtitle?: string
  items: FeatureItem[]
  layout?: LayoutType
  columns?: number
  show_icons?: boolean
}

export interface CTABlock extends BaseContentBlock {
  _type: 'cta'
  title: string
  description?: string
  primary_action: ActionButton
  secondary_action?: ActionButton
  background_variant?: 'primary' | 'secondary' | 'gradient'
  size?: BlockSize
}

export interface StatItem {
  label: string
  value: string
  description?: string
}

export interface StatsBlock extends BaseContentBlock {
  _type: 'stats'
  title?: string
  stats: StatItem[]
  layout?: 'horizontal' | 'vertical'
  columns?: number
}

export interface TestimonialAuthor {
  name: string
  title: string
  company: string
  image?: string
}

export interface TestimonialItem {
  quote: string
  author: TestimonialAuthor
}

export interface TestimonialBlock extends BaseContentBlock {
  _type: 'testimonials'
  title?: string
  testimonials: TestimonialItem[]
  layout?: 'single' | 'carousel' | 'grid'
  show_images?: boolean
}

export interface FAQItem {
  question: string
  answer: string
}

export interface FAQBlock extends BaseContentBlock {
  _type: 'faq'
  title?: string
  items: FAQItem[]
  layout?: 'accordion' | 'tabs'
}

export interface PricingFeature {
  text: string
  included: boolean
}

export interface PricingPlan {
  name: string
  price: string
  billing_period?: string
  description?: string
  features: PricingFeature[]
  cta: ActionButton
  popular?: boolean
}

export interface PricingBlock extends BaseContentBlock {
  _type: 'pricing'
  title?: string
  subtitle?: string
  plans: PricingPlan[]
  billing_toggle?: boolean
}

// Media Blocks
export interface ImageBlock extends BaseContentBlock {
  _type: 'image'
  src: string
  alt: string
  caption?: string
  width?: number
  height?: number
  aspect_ratio?: string
  object_fit?: 'cover' | 'contain' | 'fill'
  alignment?: BlockAlignment
}

export interface GalleryImageItem {
  src: string
  alt: string
  caption?: string
  title?: string
  width?: number
  height?: number
  thumbnail_src?: string
  _meta?: any
}

export interface GalleryBlock extends BaseContentBlock {
  _type: 'gallery'
  title?: string
  description?: string
  images: GalleryImageItem[]
  layout?: 'grid' | 'masonry' | 'carousel' | 'lightbox'
  columns?: number
  gap?: 'none' | 'small' | 'medium' | 'large'
  aspect_ratio?: string
  show_captions?: boolean
  enable_lightbox?: boolean
  lazy_loading?: boolean
}

export interface HeroImageBlock extends BaseContentBlock {
  _type: 'hero_image'
  title: string
  subtitle?: string
  description?: string
  primary_action?: ActionButton
  secondary_action?: ActionButton
  
  // Image configuration
  background_image: string
  background_image_alt: string
  mobile_image?: string
  overlay_opacity?: number
  overlay_color?: string
  
  // Layout and presentation
  text_alignment?: 'left' | 'center' | 'right'
  text_position?: 'top' | 'center' | 'bottom'
  content_width?: 'narrow' | 'medium' | 'wide' | 'full'
  height?: 'small' | 'medium' | 'large' | 'viewport' | 'auto'
  
  // Advanced image settings
  focal_point?: { x: number; y: number }
  parallax_enabled?: boolean
  blur_background?: boolean
}

export interface VideoBlock extends BaseContentBlock {
  _type: 'video'
  src: string
  thumbnail?: string
  title?: string
  autoplay?: boolean
  controls?: boolean
  aspect_ratio?: string
}

// Container Blocks
export interface SectionBlock extends BaseContentBlock {
  _type: 'section'
  background_variant?: BackgroundVariant
  padding?: 'none' | 'small' | 'medium' | 'large'
  max_width?: 'full' | 'container' | 'narrow'
  children: ContentBlock[]
}

// Union Type for all Content Blocks
export type ContentBlock = 
  | RichTextBlock
  | HeroBlock
  | FeatureBlock
  | CTABlock
  | StatsBlock
  | TestimonialBlock
  | FAQBlock
  | PricingBlock
  | ImageBlock
  | GalleryBlock
  | HeroImageBlock
  | VideoBlock
  | SectionBlock

// Page Content Structure
export interface MultilingualContent {
  en: ContentBlock[]
  de?: ContentBlock[]
}

export interface LayoutConfig {
  template?: string
  responsive?: boolean
  theme?: 'light' | 'dark' | 'auto'
  animation_enabled?: boolean
  lazy_loading?: boolean
  seo_optimized?: boolean
}

export interface ProcessedPageContent {
  format: 'blocks' | 'legacy' | 'empty'
  blocks?: MultilingualContent
  content?: { [lang: string]: string }  // Legacy content
  meta: {
    block_count?: { [lang: string]: number }
    supported_languages: string[]
  }
}

// Page Response Interface
export interface PageResponse {
  id: number
  slug: string
  title: { [lang: string]: string }
  content?: { [lang: string]: string }
  content_blocks?: MultilingualContent
  excerpt?: { [lang: string]: string }
  meta_description?: { [lang: string]: string }
  template: string
  content_format: 'legacy' | 'blocks' | 'portable_text'
  layout_config?: LayoutConfig
  status: string
  is_featured: boolean
  sort_order: number
  published_at?: string
  created_at: string
  updated_at?: string
}

// Content Rendering Utilities
export interface ContentRendererProps {
  content: ProcessedPageContent
  language: string
  className?: string
}

export interface BlockRendererProps {
  block: ContentBlock
  language: string
  index?: number
  className?: string
}