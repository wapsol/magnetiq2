"""
Enhanced Content Extraction Service for Migration

This service handles extracting content from web pages with advanced image detection,
semantic analysis, and content structure preservation.
"""

import re
from typing import Dict, List, Optional, Tuple, Any
from urllib.parse import urljoin, urlparse
from dataclasses import dataclass

import httpx
from bs4 import BeautifulSoup, NavigableString, Tag

from app.services.image_processing_service import image_service


@dataclass
class ExtractedImage:
    """Represents an extracted image with metadata"""
    url: str
    alt_text: str
    title: str
    caption: str
    context: str
    dimensions: Optional[Tuple[int, int]]
    is_decorative: bool
    suggested_presentation: str


@dataclass
class ExtractedContent:
    """Represents extracted content with structure"""
    title: str
    content_html: str
    content_text: str
    excerpt: str
    images: List[ExtractedImage]
    meta_description: str
    suggested_blocks: List[Dict[str, Any]]
    structure_analysis: Dict[str, Any]


class ContentExtractionService:
    """Service for extracting and analyzing web content with image intelligence"""
    
    # CSS selectors for common decorative elements to ignore
    DECORATIVE_SELECTORS = [
        'nav', 'header', 'footer', 'aside', '.sidebar', '.menu', '.navigation',
        '.ads', '.advertisement', '.social', '.sharing', '.related', '.comments'
    ]
    
    # Image patterns that are likely decorative
    DECORATIVE_IMAGE_PATTERNS = [
        r'icon', r'logo', r'badge', r'bullet', r'arrow', r'divider',
        r'spacer', r'pixel', r'tracking', r'analytics'
    ]
    
    def __init__(self):
        self.session = None
    
    async def extract_content(self, url: str) -> Optional[ExtractedContent]:
        """Extract and analyze content from a URL"""
        try:
            # Fetch the page
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url,
                    headers={
                        'User-Agent': 'voltAIc Content Migrator 1.0 (Compatible)',
                        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                    },
                    timeout=30.0
                )
                
                if response.status_code != 200:
                    return None
                
                html_content = response.text
                base_url = str(response.url)
            
            # Parse HTML
            soup = BeautifulSoup(html_content, 'html.parser')
            
            # Extract basic metadata
            title = self._extract_title(soup)
            meta_description = self._extract_meta_description(soup)
            
            # Remove unwanted elements
            self._clean_soup(soup)
            
            # Extract main content
            content_element = self._find_main_content(soup)
            
            # Extract images with context
            images = self._extract_images(soup, base_url, content_element)
            
            # Process content
            content_html = str(content_element) if content_element else ""
            content_text = content_element.get_text(strip=True) if content_element else ""
            excerpt = self._generate_excerpt(content_text)
            
            # Analyze structure and suggest blocks
            structure_analysis = self._analyze_structure(content_element)
            suggested_blocks = self._suggest_content_blocks(content_element, images, structure_analysis)
            
            return ExtractedContent(
                title=title,
                content_html=content_html,
                content_text=content_text,
                excerpt=excerpt,
                images=images,
                meta_description=meta_description,
                suggested_blocks=suggested_blocks,
                structure_analysis=structure_analysis
            )
            
        except Exception as e:
            print(f"Failed to extract content from {url}: {e}")
            return None
    
    def _extract_title(self, soup: BeautifulSoup) -> str:
        """Extract page title with fallbacks"""
        # Try different title sources in order of preference
        title_sources = [
            soup.find('meta', attrs={'property': 'og:title'}),
            soup.find('meta', attrs={'name': 'twitter:title'}),
            soup.find('h1'),
            soup.find('title')
        ]
        
        for source in title_sources:
            if source:
                if source.name == 'meta':
                    title = source.get('content', '')
                elif source.name in ['h1', 'title']:
                    title = source.get_text(strip=True)
                
                if title and len(title.strip()) > 0:
                    return title.strip()
        
        return "Untitled"
    
    def _extract_meta_description(self, soup: BeautifulSoup) -> str:
        """Extract meta description"""
        desc_sources = [
            soup.find('meta', attrs={'name': 'description'}),
            soup.find('meta', attrs={'property': 'og:description'}),
            soup.find('meta', attrs={'name': 'twitter:description'})
        ]
        
        for source in desc_sources:
            if source and source.get('content'):
                return source['content'].strip()
        
        return ""
    
    def _clean_soup(self, soup: BeautifulSoup) -> None:
        """Remove unwanted elements from soup"""
        # Remove script and style tags
        for tag in soup(['script', 'style', 'noscript']):
            tag.decompose()
        
        # Remove elements by CSS selectors
        for selector in self.DECORATIVE_SELECTORS:
            for element in soup.select(selector):
                element.decompose()
        
        # Remove comments
        from bs4 import Comment
        for comment in soup.find_all(string=Comment):
            comment.extract()
    
    def _find_main_content(self, soup: BeautifulSoup) -> Optional[Tag]:
        """Find the main content area of the page"""
        # Try semantic HTML5 elements first
        main_selectors = [
            'main',
            'article',
            '[role="main"]',
            '.main-content',
            '.content',
            '.post-content',
            '.entry-content',
            '#content',
            '#main'
        ]
        
        for selector in main_selectors:
            element = soup.select_one(selector)
            if element:
                return element
        
        # Fallback: find the element with most text content
        candidates = soup.find_all(['div', 'section'], recursive=True)
        if not candidates:
            return soup.body or soup
        
        # Score candidates by text content length
        scored_candidates = []
        for candidate in candidates:
            text_length = len(candidate.get_text(strip=True))
            # Penalize elements with too many links (likely navigation)
            link_penalty = len(candidate.find_all('a')) * 10
            score = text_length - link_penalty
            scored_candidates.append((score, candidate))
        
        if scored_candidates:
            return max(scored_candidates, key=lambda x: x[0])[1]
        
        return soup.body or soup
    
    def _extract_images(self, soup: BeautifulSoup, base_url: str, content_element: Optional[Tag] = None) -> List[ExtractedImage]:
        """Extract images with semantic context analysis"""
        images = []
        
        # Find all img elements
        img_tags = soup.find_all('img')
        
        for img in img_tags:
            try:
                src = img.get('src') or img.get('data-src') or img.get('data-lazy-src')
                if not src:
                    continue
                
                # Convert relative URLs to absolute
                full_url = urljoin(base_url, src)
                
                # Extract image attributes
                alt_text = img.get('alt', '').strip()
                title = img.get('title', '').strip()
                
                # Find caption by looking at surrounding elements
                caption = self._find_image_caption(img)
                
                # Determine context and presentation style
                context = self._analyze_image_context(img, content_element)
                is_decorative = self._is_decorative_image(img, src, alt_text)
                
                # Get dimensions if available
                dimensions = None
                width = img.get('width')
                height = img.get('height')
                if width and height:
                    try:
                        dimensions = (int(width), int(height))
                    except ValueError:
                        pass
                
                # Suggest presentation style
                suggested_presentation = self._suggest_image_presentation(
                    img, dimensions, context, is_decorative
                )
                
                extracted_image = ExtractedImage(
                    url=full_url,
                    alt_text=alt_text,
                    title=title,
                    caption=caption,
                    context=context,
                    dimensions=dimensions,
                    is_decorative=is_decorative,
                    suggested_presentation=suggested_presentation
                )
                
                images.append(extracted_image)
                
            except Exception as e:
                print(f"Error processing image: {e}")
                continue
        
        return images
    
    def _find_image_caption(self, img: Tag) -> str:
        """Find caption for an image by analyzing surrounding elements"""
        # Check if image is in a figure with figcaption
        figure = img.find_parent('figure')
        if figure:
            figcaption = figure.find('figcaption')
            if figcaption:
                return figcaption.get_text(strip=True)
        
        # Look for caption in common patterns
        parent = img.parent
        if parent:
            # Check siblings for caption elements
            for sibling in parent.find_all(['p', 'div', 'span']):
                text = sibling.get_text(strip=True).lower()
                if any(word in text for word in ['caption', 'photo', 'image', 'figure']):
                    return sibling.get_text(strip=True)
        
        return ""
    
    def _analyze_image_context(self, img: Tag, content_element: Optional[Tag]) -> str:
        """Analyze the semantic context of an image"""
        contexts = []
        
        # Check class names for context clues
        classes = img.get('class', [])
        for cls in classes:
            cls_lower = cls.lower()
            if 'hero' in cls_lower:
                contexts.append('hero')
            elif 'gallery' in cls_lower:
                contexts.append('gallery')
            elif 'profile' in cls_lower or 'avatar' in cls_lower:
                contexts.append('profile')
            elif 'logo' in cls_lower:
                contexts.append('logo')
        
        # Analyze parent elements
        parent = img.parent
        if parent:
            parent_classes = ' '.join(parent.get('class', [])).lower()
            parent_id = (parent.get('id') or '').lower()
            
            if 'hero' in parent_classes or 'hero' in parent_id:
                contexts.append('hero')
            elif 'gallery' in parent_classes or 'gallery' in parent_id:
                contexts.append('gallery')
            elif 'banner' in parent_classes or 'banner' in parent_id:
                contexts.append('banner')
        
        # Check if image is at the top of content (likely hero)
        if content_element:
            first_elements = list(content_element.children)[:3]
            for elem in first_elements:
                if isinstance(elem, Tag) and img in elem.find_all('img'):
                    contexts.append('hero')
                    break
        
        return ' '.join(set(contexts)) if contexts else 'content'
    
    def _is_decorative_image(self, img: Tag, src: str, alt_text: str) -> bool:
        """Determine if an image is decorative rather than content"""
        # Check for decorative patterns in src
        src_lower = src.lower()
        for pattern in self.DECORATIVE_IMAGE_PATTERNS:
            if re.search(pattern, src_lower):
                return True
        
        # Very small images are likely decorative
        width = img.get('width')
        height = img.get('height')
        if width and height:
            try:
                w, h = int(width), int(height)
                if w <= 50 or h <= 50:
                    return True
            except ValueError:
                pass
        
        # Empty alt text might indicate decorative image
        if not alt_text or alt_text.lower() in ['', 'image', 'photo', 'picture']:
            return True
        
        # Check if image has role="presentation"
        if img.get('role') == 'presentation':
            return True
        
        return False
    
    def _suggest_image_presentation(self, img: Tag, dimensions: Optional[Tuple[int, int]], context: str, is_decorative: bool) -> str:
        """Suggest optimal presentation style for an image"""
        if is_decorative:
            return 'inline'
        
        if 'hero' in context:
            return 'hero'
        
        if 'gallery' in context:
            return 'gallery'
        
        if 'profile' in context or 'avatar' in context:
            return 'portrait'
        
        if 'banner' in context:
            return 'banner'
        
        # Use dimensions to suggest presentation
        if dimensions:
            width, height = dimensions
            aspect_ratio = width / height
            
            if width >= 1200 and aspect_ratio > 1.5:
                return 'hero'
            elif width >= 800 and 0.7 <= aspect_ratio <= 1.4:
                return 'gallery'
            elif aspect_ratio < 0.7:
                return 'portrait'
            elif aspect_ratio > 2.0:
                return 'banner'
        
        return 'inline'
    
    def _analyze_structure(self, content_element: Optional[Tag]) -> Dict[str, Any]:
        """Analyze content structure for block suggestions"""
        if not content_element:
            return {}
        
        analysis = {
            'headings': [],
            'paragraphs': len(content_element.find_all('p')),
            'lists': len(content_element.find_all(['ul', 'ol'])),
            'images': len(content_element.find_all('img')),
            'links': len(content_element.find_all('a')),
            'has_hero_potential': False,
            'has_cta_elements': False,
            'sections': 0
        }
        
        # Analyze headings
        for level in range(1, 7):
            headings = content_element.find_all(f'h{level}')
            analysis['headings'].extend([
                {'level': level, 'text': h.get_text(strip=True)[:100]}
                for h in headings
            ])
        
        # Check for hero potential (large image at top)
        first_elements = list(content_element.children)[:2]
        for elem in first_elements:
            if isinstance(elem, Tag) and elem.find('img'):
                analysis['has_hero_potential'] = True
                break
        
        # Check for CTA elements
        cta_indicators = ['button', 'btn', 'cta', 'call-to-action', 'contact', 'signup']
        for element in content_element.find_all(['a', 'button']):
            element_text = element.get_text(strip=True).lower()
            element_classes = ' '.join(element.get('class', [])).lower()
            
            if any(indicator in element_text or indicator in element_classes 
                   for indicator in cta_indicators):
                analysis['has_cta_elements'] = True
                break
        
        # Count logical sections
        analysis['sections'] = len(content_element.find_all(['section', 'div'], 
                                                           attrs={'class': re.compile(r'section|block|content-block')}))
        
        return analysis
    
    def _suggest_content_blocks(self, content_element: Optional[Tag], images: List[ExtractedImage], analysis: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Suggest content block structure based on analysis"""
        blocks = []
        
        if not content_element:
            return blocks
        
        # Hero block suggestion
        hero_images = [img for img in images if img.suggested_presentation == 'hero']
        if hero_images and analysis.get('has_hero_potential'):
            hero_block = {
                'block_type': 'hero',
                'title': analysis.get('headings', [{}])[0].get('text', '') if analysis.get('headings') else '',
                'background_image': hero_images[0].url,
                'background_variant': 'image',
                'size': 'large'
            }
            blocks.append(hero_block)
        
        # Rich text blocks for content sections
        if analysis.get('paragraphs', 0) > 0:
            blocks.append({
                'block_type': 'richtext',
                'style': 'normal',
                'content': 'Main content will be processed here'
            })
        
        # Image gallery suggestion
        gallery_images = [img for img in images if img.suggested_presentation == 'gallery']
        if len(gallery_images) >= 3:
            gallery_block = {
                'block_type': 'gallery',
                'layout': 'grid',
                'images': [
                    {
                        'src': img.url,
                        'alt': img.alt_text,
                        'caption': img.caption
                    }
                    for img in gallery_images
                ]
            }
            blocks.append(gallery_block)
        
        # CTA block suggestion
        if analysis.get('has_cta_elements'):
            cta_block = {
                'block_type': 'cta',
                'title': 'Ready to get started?',
                'description': 'Contact us to learn more about our services.',
                'primary_action': {
                    'text': 'Get Started',
                    'href': '/contact',
                    'variant': 'primary'
                }
            }
            blocks.append(cta_block)
        
        return blocks
    
    def _generate_excerpt(self, content_text: str, max_length: int = 200) -> str:
        """Generate an excerpt from content text"""
        if not content_text:
            return ""
        
        # Clean up text
        text = re.sub(r'\s+', ' ', content_text.strip())
        
        if len(text) <= max_length:
            return text
        
        # Find the last complete sentence within the limit
        truncated = text[:max_length]
        last_sentence_end = max(
            truncated.rfind('.'),
            truncated.rfind('!'),
            truncated.rfind('?')
        )
        
        if last_sentence_end > max_length * 0.7:  # At least 70% of desired length
            return text[:last_sentence_end + 1].strip()
        
        # Fallback: cut at word boundary
        last_space = truncated.rfind(' ')
        if last_space > 0:
            return text[:last_space].strip() + '...'
        
        return truncated + '...'


# Global instance
content_extraction_service = ContentExtractionService()