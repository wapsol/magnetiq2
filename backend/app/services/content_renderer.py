from typing import Dict, List, Any, Optional
from app.schemas.content_blocks import (
    ContentBlockType, 
    validate_content_blocks,
    MultilingualPageContent,
    LayoutConfig
)
import json
import logging

logger = logging.getLogger(__name__)


class ContentRendererService:
    """Service for processing and rendering content blocks"""
    
    def __init__(self):
        self.supported_languages = ['en', 'de']
        self.default_language = 'en'
    
    def process_page_content(
        self, 
        content_blocks: Optional[Dict[str, List[Dict[str, Any]]]], 
        content_format: str = 'legacy',
        legacy_content: Optional[Dict[str, str]] = None
    ) -> Dict[str, Any]:
        """
        Process page content based on format type
        
        Args:
            content_blocks: Block-based content structure
            content_format: Format type ('legacy', 'blocks', 'portable_text')
            legacy_content: Legacy HTML/text content
            
        Returns:
            Processed content ready for frontend consumption
        """
        try:
            if content_format == 'blocks' and content_blocks:
                return self._process_block_content(content_blocks)
            elif content_format == 'legacy' and legacy_content:
                return self._process_legacy_content(legacy_content)
            else:
                logger.warning(f"Unsupported content format: {content_format}")
                return self._get_empty_content()
                
        except Exception as e:
            logger.error(f"Error processing content: {str(e)}")
            raise ValueError(f"Content processing failed: {str(e)}")
    
    def _process_block_content(self, content_blocks: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Any]:
        """Process block-based content"""
        processed_content = {
            'format': 'blocks',
            'blocks': {},
            'meta': {
                'block_count': {},
                'supported_languages': []
            }
        }
        
        # Process each language
        for lang, blocks in content_blocks.items():
            if lang not in self.supported_languages:
                logger.warning(f"Unsupported language: {lang}")
                continue
            
            # Validate blocks
            validated_blocks = validate_content_blocks(blocks)
            
            # Convert to serializable format
            processed_blocks = []
            for block in validated_blocks:
                processed_block = self._process_single_block(block.dict(), lang)
                processed_blocks.append(processed_block)
            
            processed_content['blocks'][lang] = processed_blocks
            processed_content['meta']['block_count'][lang] = len(processed_blocks)
            processed_content['meta']['supported_languages'].append(lang)
        
        # Ensure English content exists
        if 'en' not in processed_content['blocks']:
            raise ValueError("English content blocks are required")
        
        return processed_content
    
    def _process_single_block(self, block: Dict[str, Any], language: str) -> Dict[str, Any]:
        """Process individual content block"""
        block_type = block.get('_type', 'unknown')
        
        # Add processing metadata
        processed_block = {
            **block,
            '_meta': {
                'language': language,
                'processed_at': None,  # Will be set by frontend
                'block_type': block_type,
                'responsive': True
            }
        }
        
        # Type-specific processing
        if block_type == 'hero':
            processed_block = self._process_hero_block(processed_block)
        elif block_type == 'features':
            processed_block = self._process_features_block(processed_block)
        elif block_type == 'image':
            processed_block = self._process_image_block(processed_block)
        elif block_type == 'richtext':
            processed_block = self._process_richtext_block(processed_block)
        
        return processed_block
    
    def _process_hero_block(self, block: Dict[str, Any]) -> Dict[str, Any]:
        """Process hero block with responsive enhancements"""
        # Ensure required fields have defaults
        block.setdefault('size', 'large')
        block.setdefault('alignment', 'center')
        block.setdefault('background_variant', 'gradient')
        
        # Add responsive metadata
        block['_meta']['responsive_config'] = {
            'mobile_size': 'medium' if block['size'] == 'xlarge' else block['size'],
            'tablet_size': block['size'],
            'desktop_size': block['size']
        }
        
        return block
    
    def _process_features_block(self, block: Dict[str, Any]) -> Dict[str, Any]:
        """Process features block with grid responsiveness"""
        columns = block.get('columns', 3)
        
        # Add responsive grid configuration
        block['_meta']['responsive_config'] = {
            'mobile_columns': 1,
            'tablet_columns': min(2, columns),
            'desktop_columns': columns
        }
        
        return block
    
    def _process_image_block(self, block: Dict[str, Any]) -> Dict[str, Any]:
        """Process image block with responsive image handling"""
        # Add responsive image configuration
        block['_meta']['responsive_config'] = {
            'sizes': '(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw',
            'loading': 'lazy',
            'aspect_ratio': block.get('aspect_ratio', 'auto')
        }
        
        return block
    
    def _process_richtext_block(self, block: Dict[str, Any]) -> Dict[str, Any]:
        """Process rich text block"""
        # Validate rich text structure
        if 'children' not in block or not isinstance(block['children'], list):
            logger.warning("Invalid richtext block structure")
            block['children'] = []
        
        return block
    
    def _process_legacy_content(self, legacy_content: Dict[str, str]) -> Dict[str, Any]:
        """Process legacy HTML/text content"""
        processed_content = {
            'format': 'legacy',
            'content': legacy_content,
            'meta': {
                'supported_languages': list(legacy_content.keys())
            }
        }
        
        return processed_content
    
    def _get_empty_content(self) -> Dict[str, Any]:
        """Return empty content structure"""
        return {
            'format': 'empty',
            'blocks': {'en': []},
            'meta': {
                'block_count': {'en': 0},
                'supported_languages': ['en']
            }
        }
    
    def generate_seo_metadata(self, content_blocks: Dict[str, List[Dict[str, Any]]]) -> Dict[str, Dict[str, str]]:
        """Generate SEO metadata from content blocks"""
        seo_data = {}
        
        for lang, blocks in content_blocks.items():
            title_parts = []
            description_parts = []
            
            for block in blocks:
                block_type = block.get('_type', '')
                
                if block_type == 'hero':
                    if 'title' in block:
                        title_parts.append(block['title'])
                    if 'description' in block:
                        description_parts.append(block['description'])
                
                elif block_type == 'richtext':
                    # Extract text from richtext children
                    for child in block.get('children', []):
                        if child.get('_type') == 'span':
                            description_parts.append(child.get('text', ''))
            
            # Generate SEO title and description
            seo_title = ' | '.join(title_parts[:2])  # Max 2 title parts
            seo_description = ' '.join(description_parts)[:160]  # Max 160 chars
            
            seo_data[lang] = {
                'title': seo_title,
                'description': seo_description
            }
        
        return seo_data
    
    def validate_content_structure(self, page_data: Dict[str, Any]) -> Dict[str, Any]:
        """Validate complete page content structure"""
        validation_result = {
            'is_valid': True,
            'errors': [],
            'warnings': []
        }
        
        content_format = page_data.get('content_format', 'legacy')
        
        if content_format == 'blocks':
            content_blocks = page_data.get('content_blocks')
            if not content_blocks:
                validation_result['errors'].append("Block format specified but no content_blocks provided")
                validation_result['is_valid'] = False
            elif 'en' not in content_blocks:
                validation_result['errors'].append("English content blocks are required")
                validation_result['is_valid'] = False
            else:
                # Validate each language's blocks
                for lang, blocks in content_blocks.items():
                    try:
                        validate_content_blocks(blocks)
                    except Exception as e:
                        validation_result['errors'].append(f"Invalid {lang} blocks: {str(e)}")
                        validation_result['is_valid'] = False
        
        elif content_format == 'legacy':
            legacy_content = page_data.get('content')
            if not legacy_content or 'en' not in legacy_content:
                validation_result['errors'].append("Legacy format specified but no English content provided")
                validation_result['is_valid'] = False
        
        return validation_result
    
    def migrate_legacy_to_blocks(self, legacy_content: Dict[str, str]) -> Dict[str, List[Dict[str, Any]]]:
        """Migrate legacy HTML/text content to block format"""
        migrated_blocks = {}
        
        for lang, content in legacy_content.items():
            # Simple migration: wrap legacy content in a richtext block
            blocks = [
                {
                    '_type': 'richtext',
                    'style': 'normal',
                    'children': [
                        {
                            '_type': 'span',
                            'text': content,
                            'marks': []
                        }
                    ],
                    'markDefs': []
                }
            ]
            migrated_blocks[lang] = blocks
        
        return migrated_blocks