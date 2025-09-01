from typing import List, Optional, Dict, Any, Union, Literal
from pydantic import BaseModel, Field, validator


# Base content block schema
class ContentBlock(BaseModel):
    """Base class for all content blocks"""
    block_type: str = Field(..., description="Block type identifier")
    block_key: Optional[str] = Field(None, description="Unique identifier for the block")
    
    class Config:
        extra = "allow"  # Allow additional fields for specific block types


# Text and Rich Content Blocks
class RichTextSpan(BaseModel):
    """Individual span within rich text content"""
    span_type: Literal["span"] = "span"
    text: str
    marks: Optional[List[str]] = []


class RichTextBlock(ContentBlock):
    """Rich text content block using Portable Text specification"""
    block_type: Literal["richtext"] = "richtext"
    style: Optional[str] = "normal"  # normal, h1, h2, h3, h4, h5, h6, blockquote
    children: List[RichTextSpan]
    markDefs: Optional[List[Dict[str, Any]]] = []


# Layout Blocks
class HeroBlock(ContentBlock):
    """Hero section block"""
    block_type: Literal["hero"] = "hero"
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    primary_action: Optional[Dict[str, Any]] = None  # {text: str, href: str, variant: str}
    secondary_action: Optional[Dict[str, Any]] = None
    background_variant: Optional[Literal["gradient", "solid", "pattern", "image"]] = "gradient"
    background_image: Optional[str] = None
    size: Optional[Literal["small", "medium", "large", "xlarge"]] = "large"
    alignment: Optional[Literal["left", "center"]] = "center"
    badge: Optional[Dict[str, Any]] = None  # {text: str, variant: str}


class FeatureBlock(ContentBlock):
    """Feature showcase block"""
    block_type: Literal["features"] = "features"
    title: Optional[str] = None
    subtitle: Optional[str] = None
    items: List[Dict[str, Any]]  # [{title: str, description: str, icon?: str, image?: str}]
    layout: Optional[Literal["grid", "list", "carousel"]] = "grid"
    columns: Optional[int] = 3
    show_icons: Optional[bool] = True


class CTABlock(ContentBlock):
    """Call-to-action block"""
    block_type: Literal["cta"] = "cta"
    title: str
    description: Optional[str] = None
    primary_action: Dict[str, Any]  # {text: str, href: str, variant: str}
    secondary_action: Optional[Dict[str, Any]] = None
    background_variant: Optional[Literal["primary", "secondary", "gradient"]] = "primary"
    size: Optional[Literal["small", "medium", "large"]] = "medium"


class StatsBlock(ContentBlock):
    """Statistics showcase block"""
    block_type: Literal["stats"] = "stats"
    title: Optional[str] = None
    stats: List[Dict[str, Any]]  # [{label: str, value: str, description?: str}]
    layout: Optional[Literal["horizontal", "vertical"]] = "horizontal"
    columns: Optional[int] = 4


class TestimonialBlock(ContentBlock):
    """Testimonial block"""
    block_type: Literal["testimonials"] = "testimonials"
    title: Optional[str] = None
    testimonials: List[Dict[str, Any]]  # [{quote: str, author: {name: str, title: str, company: str, image?: str}}]
    layout: Optional[Literal["single", "carousel", "grid"]] = "single"
    show_images: Optional[bool] = True


class FAQBlock(ContentBlock):
    """FAQ section block"""
    block_type: Literal["faq"] = "faq"
    title: Optional[str] = None
    items: List[Dict[str, str]]  # [{question: str, answer: str}]
    layout: Optional[Literal["accordion", "tabs"]] = "accordion"


class PricingBlock(ContentBlock):
    """Pricing table block"""
    block_type: Literal["pricing"] = "pricing"
    title: Optional[str] = None
    subtitle: Optional[str] = None
    plans: List[Dict[str, Any]]  # Complex pricing plan objects
    billing_toggle: Optional[bool] = False


# Media Blocks
class ImageBlock(ContentBlock):
    """Image block with responsive settings"""
    block_type: Literal["image"] = "image"
    src: str
    alt: str
    caption: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    aspect_ratio: Optional[str] = None  # "16:9", "4:3", "1:1", etc.
    object_fit: Optional[Literal["cover", "contain", "fill"]] = "cover"
    alignment: Optional[Literal["left", "center", "right", "full"]] = "center"
    _meta: Optional[Dict[str, Any]] = None  # Metadata from migration/processing


class GalleryImageItem(BaseModel):
    """Individual image item in a gallery"""
    src: str
    alt: str
    caption: Optional[str] = None
    title: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    thumbnail_src: Optional[str] = None
    _meta: Optional[Dict[str, Any]] = None


class GalleryBlock(ContentBlock):
    """Image gallery block with multiple layout options"""
    block_type: Literal["gallery"] = "gallery"
    title: Optional[str] = None
    description: Optional[str] = None
    images: List[GalleryImageItem]
    layout: Optional[Literal["grid", "masonry", "carousel", "lightbox"]] = "grid"
    columns: Optional[int] = 3
    gap: Optional[Literal["none", "small", "medium", "large"]] = "medium"
    aspect_ratio: Optional[str] = None  # Applied to all images in grid layout
    show_captions: Optional[bool] = True
    enable_lightbox: Optional[bool] = True
    lazy_loading: Optional[bool] = True


class HeroImageBlock(ContentBlock):
    """Enhanced hero block with advanced image capabilities"""
    block_type: Literal["hero_image"] = "hero_image"
    title: str
    subtitle: Optional[str] = None
    description: Optional[str] = None
    primary_action: Optional[Dict[str, Any]] = None
    secondary_action: Optional[Dict[str, Any]] = None
    
    # Image configuration
    background_image: str
    background_image_alt: str
    mobile_image: Optional[str] = None  # Alternative image for mobile
    overlay_opacity: Optional[float] = Field(0.4, ge=0, le=1)
    overlay_color: Optional[str] = "#000000"
    
    # Layout and presentation
    text_alignment: Optional[Literal["left", "center", "right"]] = "center"
    text_position: Optional[Literal["top", "center", "bottom"]] = "center"
    content_width: Optional[Literal["narrow", "medium", "wide", "full"]] = "medium"
    height: Optional[Literal["small", "medium", "large", "viewport", "auto"]] = "large"
    
    # Advanced image settings
    focal_point: Optional[Dict[str, float]] = None  # {x: 0.5, y: 0.5} for image positioning
    parallax_enabled: Optional[bool] = False
    blur_background: Optional[bool] = False
    
    # Responsive configuration  
    _meta: Optional[Dict[str, Any]] = None


class VideoBlock(ContentBlock):
    """Video embed block"""
    block_type: Literal["video"] = "video"
    src: str
    thumbnail: Optional[str] = None
    title: Optional[str] = None
    autoplay: Optional[bool] = False
    controls: Optional[bool] = True
    aspect_ratio: Optional[str] = "16:9"


# Container Blocks
class SectionBlock(ContentBlock):
    """Generic section wrapper"""
    block_type: Literal["section"] = "section"
    background_variant: Optional[Literal["white", "gray", "primary", "dark"]] = "white"
    padding: Optional[Literal["none", "small", "medium", "large"]] = "medium"
    max_width: Optional[Literal["full", "container", "narrow"]] = "container"
    children: List[ContentBlock]


# Union type for all block types
ContentBlockType = Union[
    RichTextBlock,
    HeroBlock,
    FeatureBlock,
    CTABlock,
    StatsBlock,
    TestimonialBlock,
    FAQBlock,
    PricingBlock,
    ImageBlock,
    GalleryBlock,
    HeroImageBlock,
    VideoBlock,
    SectionBlock
]


# Page content structure
class MultilingualPageContent(BaseModel):
    """Multilingual page content using blocks"""
    en: List[ContentBlockType] = Field(..., description="English content blocks")
    de: Optional[List[ContentBlockType]] = Field(None, description="German content blocks")
    
    @validator('en')
    def validate_english_required(cls, v):
        if not v:
            raise ValueError('English content is required')
        return v


class LayoutConfig(BaseModel):
    """Page layout configuration"""
    template: Optional[str] = "default"
    responsive: Optional[bool] = True
    theme: Optional[Literal["light", "dark", "auto"]] = "light"
    animation_enabled: Optional[bool] = True
    lazy_loading: Optional[bool] = True
    seo_optimized: Optional[bool] = True


# Content validation helpers
def validate_content_blocks(blocks: List[Dict[str, Any]]) -> List[ContentBlockType]:
    """Validate and parse content blocks"""
    validated_blocks = []
    
    for block_data in blocks:
        # Handle both _type (frontend) and block_type (backend) formats
        block_type = block_data.get('_type') or block_data.get('block_type')
        
        # Convert _type to block_type for validation
        if '_type' in block_data:
            block_data = {**block_data, 'block_type': block_data['_type']}
        if '_key' in block_data:
            block_data = {**block_data, 'block_key': block_data['_key']}
        
        if block_type == 'richtext':
            validated_blocks.append(RichTextBlock(**block_data))
        elif block_type == 'hero':
            validated_blocks.append(HeroBlock(**block_data))
        elif block_type == 'features':
            validated_blocks.append(FeatureBlock(**block_data))
        elif block_type == 'cta':
            validated_blocks.append(CTABlock(**block_data))
        elif block_type == 'stats':
            validated_blocks.append(StatsBlock(**block_data))
        elif block_type == 'testimonials':
            validated_blocks.append(TestimonialBlock(**block_data))
        elif block_type == 'faq':
            validated_blocks.append(FAQBlock(**block_data))
        elif block_type == 'pricing':
            validated_blocks.append(PricingBlock(**block_data))
        elif block_type == 'image':
            validated_blocks.append(ImageBlock(**block_data))
        elif block_type == 'gallery':
            validated_blocks.append(GalleryBlock(**block_data))
        elif block_type == 'hero_image':
            validated_blocks.append(HeroImageBlock(**block_data))
        elif block_type == 'video':
            validated_blocks.append(VideoBlock(**block_data))
        elif block_type == 'section':
            validated_blocks.append(SectionBlock(**block_data))
        else:
            # Allow unknown block types but validate as base ContentBlock
            validated_blocks.append(ContentBlock(**block_data))
    
    return validated_blocks