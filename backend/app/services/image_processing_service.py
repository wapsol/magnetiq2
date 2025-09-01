"""
Image Processing Service for Content Migration

This service handles downloading, processing, optimizing, and creating responsive variants
of images extracted during content migration.
"""

import os
import hashlib
import asyncio
from io import BytesIO
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any
from urllib.parse import urljoin, urlparse
import uuid

import aiofiles
import httpx
from PIL import Image, ImageOps
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.content import MediaFile
from app.config import settings


class ImageProcessingService:
    """Service for processing and optimizing images during content migration"""
    
    # Standard responsive breakpoints
    RESPONSIVE_SIZES = {
        'thumbnail': 150,
        'small': 400,
        'medium': 800,
        'large': 1200,
        'xlarge': 1920
    }
    
    # Supported image formats for optimization
    SUPPORTED_FORMATS = {'JPEG', 'PNG', 'WebP', 'GIF', 'BMP', 'TIFF'}
    
    def __init__(self, upload_dir: str = "media/images"):
        self.upload_dir = Path(upload_dir)
        self.upload_dir.mkdir(parents=True, exist_ok=True)
        
    async def download_image(self, url: str, base_url: str = None) -> Optional[bytes]:
        """Download image from URL with error handling"""
        try:
            # Convert relative URLs to absolute
            if base_url and not url.startswith(('http://', 'https://')):
                url = urljoin(base_url, url)
            
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    url,
                    headers={
                        'User-Agent': 'voltAIc Content Migrator 1.0'
                    },
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    return response.content
                    
        except Exception as e:
            print(f"Failed to download image {url}: {e}")
            
        return None
    
    def extract_image_metadata(self, image_data: bytes) -> Dict[str, Any]:
        """Extract metadata from image data"""
        try:
            image = Image.open(BytesIO(image_data))
            
            metadata = {
                'width': image.width,
                'height': image.height,
                'format': image.format,
                'mode': image.mode,
                'aspect_ratio': round(image.width / image.height, 3)
            }
            
            # Extract EXIF data if available
            if hasattr(image, '_getexif') and image._getexif():
                metadata['exif'] = dict(image._getexif().items())
            
            return metadata
            
        except Exception as e:
            print(f"Failed to extract image metadata: {e}")
            return {}
    
    def optimize_image(
        self, 
        image_data: bytes, 
        target_width: Optional[int] = None,
        quality: int = 85,
        format: str = 'JPEG'
    ) -> Tuple[bytes, Dict[str, Any]]:
        """Optimize image with compression and resizing"""
        try:
            image = Image.open(BytesIO(image_data))
            
            # Convert to RGB if necessary for JPEG
            if format.upper() == 'JPEG' and image.mode in ('RGBA', 'LA', 'P'):
                # Create white background
                background = Image.new('RGB', image.size, (255, 255, 255))
                if image.mode == 'P':
                    image = image.convert('RGBA')
                background.paste(image, mask=image.split()[-1] if image.mode == 'RGBA' else None)
                image = background
            
            # Resize if target width specified
            if target_width and image.width > target_width:
                ratio = target_width / image.width
                new_height = int(image.height * ratio)
                image = image.resize((target_width, new_height), Image.Resampling.LANCZOS)
            
            # Apply auto-orientation
            image = ImageOps.exif_transpose(image)
            
            # Save optimized image
            output = BytesIO()
            save_kwargs = {'format': format.upper()}
            
            if format.upper() == 'JPEG':
                save_kwargs.update({
                    'quality': quality,
                    'optimize': True,
                    'progressive': True
                })
            elif format.upper() == 'PNG':
                save_kwargs.update({
                    'optimize': True
                })
            elif format.upper() == 'WEBP':
                save_kwargs.update({
                    'quality': quality,
                    'method': 6  # Best compression
                })
            
            image.save(output, **save_kwargs)
            
            # Get metadata for optimized image
            metadata = {
                'width': image.width,
                'height': image.height,
                'format': format.upper(),
                'size': len(output.getvalue()),
                'aspect_ratio': round(image.width / image.height, 3)
            }
            
            return output.getvalue(), metadata
            
        except Exception as e:
            print(f"Failed to optimize image: {e}")
            raise
    
    def create_responsive_variants(self, image_data: bytes) -> Dict[str, Tuple[bytes, Dict[str, Any]]]:
        """Create multiple responsive variants of an image"""
        variants = {}
        
        try:
            original_image = Image.open(BytesIO(image_data))
            original_width = original_image.width
            
            for size_name, target_width in self.RESPONSIVE_SIZES.items():
                # Skip if original is smaller than target
                if original_width <= target_width and size_name != 'thumbnail':
                    continue
                
                # Create optimized variant
                optimized_data, metadata = self.optimize_image(
                    image_data, 
                    target_width=target_width,
                    quality=85 if size_name in ['large', 'xlarge'] else 90,
                    format='JPEG'
                )
                
                variants[size_name] = (optimized_data, metadata)
            
            # Always include WebP variants for modern browsers
            for size_name, target_width in self.RESPONSIVE_SIZES.items():
                if original_width <= target_width and size_name != 'thumbnail':
                    continue
                
                try:
                    webp_data, webp_metadata = self.optimize_image(
                        image_data,
                        target_width=target_width,
                        quality=80,
                        format='WebP'
                    )
                    variants[f"{size_name}_webp"] = (webp_data, webp_metadata)
                except:
                    pass  # WebP not always supported
        
        except Exception as e:
            print(f"Failed to create responsive variants: {e}")
        
        return variants
    
    async def save_image_file(
        self, 
        image_data: bytes, 
        filename: str,
        folder: str = "/"
    ) -> str:
        """Save image file to storage and return file path"""
        # Generate unique filename
        file_hash = hashlib.sha256(image_data).hexdigest()[:16]
        file_ext = Path(filename).suffix.lower()
        unique_filename = f"{file_hash}_{filename}"
        
        # Create folder structure
        folder_path = self.upload_dir / folder.strip('/')
        folder_path.mkdir(parents=True, exist_ok=True)
        
        file_path = folder_path / unique_filename
        
        # Save file
        async with aiofiles.open(file_path, 'wb') as f:
            await f.write(image_data)
        
        return str(file_path.relative_to(self.upload_dir))
    
    async def process_and_store_image(
        self,
        db: AsyncSession,
        image_url: str,
        base_url: str = None,
        alt_text: str = "",
        title: str = "",
        description: str = "",
        folder: str = "migrated",
        uploader_id: Optional[int] = None
    ) -> Optional[MediaFile]:
        """Complete workflow: download, process, and store image with metadata"""
        
        # Download image
        image_data = await self.download_image(image_url, base_url)
        if not image_data:
            return None
        
        try:
            # Extract original metadata
            original_metadata = self.extract_image_metadata(image_data)
            
            # Generate filename from URL or use UUID
            parsed_url = urlparse(image_url)
            original_filename = os.path.basename(parsed_url.path) or f"{uuid.uuid4()}.jpg"
            
            # Create main optimized version
            optimized_data, optimized_metadata = self.optimize_image(image_data)
            
            # Save main image
            file_path = await self.save_image_file(
                optimized_data,
                original_filename,
                folder
            )
            
            # Create responsive variants
            variants = self.create_responsive_variants(image_data)
            
            # Save variants and build srcset info
            variant_info = {}
            for variant_name, (variant_data, variant_metadata) in variants.items():
                variant_filename = f"{Path(original_filename).stem}_{variant_name}{Path(original_filename).suffix}"
                variant_path = await self.save_image_file(
                    variant_data,
                    variant_filename, 
                    f"{folder}/variants"
                )
                variant_info[variant_name] = {
                    'path': variant_path,
                    'width': variant_metadata['width'],
                    'height': variant_metadata['height'],
                    'size': variant_metadata['size']
                }
            
            # Calculate file hash for deduplication
            file_hash = hashlib.sha256(optimized_data).hexdigest()
            
            # Create MediaFile record
            media_file = MediaFile(
                filename=Path(file_path).name,
                original_filename=original_filename,
                file_path=file_path,
                file_size=len(optimized_data),
                mime_type=f"image/{optimized_metadata['format'].lower()}",
                file_hash=file_hash,
                title={"en": title, "de": title} if title else None,
                alt_text={"en": alt_text, "de": alt_text} if alt_text else None,
                description={"en": description, "de": description} if description else None,
                image_metadata={
                    **optimized_metadata,
                    'original_url': image_url,
                    'variants': variant_info,
                    'responsive_config': {
                        'sizes': "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
                        'loading': 'lazy'
                    }
                },
                folder=folder,
                uploaded_by=uploader_id
            )
            
            db.add(media_file)
            await db.commit()
            await db.refresh(media_file)
            
            return media_file
            
        except Exception as e:
            print(f"Failed to process and store image {image_url}: {e}")
            await db.rollback()
            return None
    
    def determine_presentation_style(self, metadata: Dict[str, Any], context: str = "") -> str:
        """Determine optimal presentation style based on image characteristics"""
        width = metadata.get('width', 0)
        height = metadata.get('height', 0)
        aspect_ratio = metadata.get('aspect_ratio', 1.0)
        
        # Hero image criteria
        if width >= 1200 and aspect_ratio > 1.5:
            return 'hero'
        
        # Gallery criteria
        if width >= 800 and 0.7 <= aspect_ratio <= 1.4:
            return 'gallery'
        
        # Portrait/profile image
        if aspect_ratio < 0.7:
            return 'portrait'
        
        # Wide landscape
        if aspect_ratio > 2.0:
            return 'banner'
        
        # Default inline
        return 'inline'
    
    def generate_alt_text_suggestions(self, filename: str, context: str = "") -> List[str]:
        """Generate alt text suggestions based on filename and context"""
        suggestions = []
        
        # Clean filename for suggestions
        clean_name = Path(filename).stem.replace('-', ' ').replace('_', ' ')
        
        # Basic suggestion from filename
        if clean_name and not clean_name.isdigit():
            suggestions.append(clean_name.title())
        
        # Context-based suggestions
        if 'hero' in context.lower():
            suggestions.append(f"Hero image: {clean_name}")
        elif 'team' in context.lower():
            suggestions.append(f"Team member: {clean_name}")
        elif 'product' in context.lower():
            suggestions.append(f"Product image: {clean_name}")
        elif 'logo' in filename.lower():
            suggestions.append("Company logo")
        
        return suggestions[:3]  # Limit to top 3 suggestions


# Global instance
image_service = ImageProcessingService()