import secrets
import hashlib
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc, or_
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr
from app.database import get_db
from app.models.business import Whitepaper, WhitepaperDownload
from app.schemas.whitepaper import (
    WhitepaperPublicResponse, 
    WhitepaperDownloadRequest,
    WhitepaperDownloadResponse,
    EmailValidationRequest,
    EmailValidationResponse,
    WhitepaperDownloadLinkResponse
)
from app.services.email_service import email_service
from app.config import settings
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


def generate_secure_token() -> str:
    """Generate a secure token for email validation or download links"""
    return secrets.token_urlsafe(32)


async def get_client_info(request: Request) -> dict:
    """Extract client information from request"""
    return {
        "ip": request.client.host if request.client else "unknown",
        "user_agent": request.headers.get("user-agent", "unknown")
    }


@router.get("/whitepapers", response_model=List[WhitepaperPublicResponse])
async def list_public_whitepapers(
    db: AsyncSession = Depends(get_db),
    featured_only: bool = False,
    category: Optional[str] = None,
    industry: Optional[str] = None,
    limit: int = 20,
    offset: int = 0
):
    """List published whitepapers for public download"""
    query = select(Whitepaper).where(
        Whitepaper.status == "published",
        Whitepaper.lead_magnet_active == True,
        Whitepaper.deleted_at.is_(None)
    )
    
    if featured_only:
        query = query.where(Whitepaper.featured == True)
    
    if category:
        query = query.where(Whitepaper.category == category)
        
    if industry:
        query = query.where(
            func.json_extract(Whitepaper.industry, '$').contains(f'"{industry}"')
        )
    
    query = query.order_by(
        desc(Whitepaper.featured),
        Whitepaper.sort_order,
        desc(Whitepaper.published_at)
    ).limit(limit).offset(offset)
    
    result = await db.execute(query)
    whitepapers = result.scalars().all()
    
    # Increment view count for each whitepaper
    for whitepaper in whitepapers:
        whitepaper.view_count = (whitepaper.view_count or 0) + 1
    await db.commit()
    
    return [WhitepaperPublicResponse.from_orm(whitepaper) for whitepaper in whitepapers]


@router.get("/whitepapers/{slug}", response_model=WhitepaperPublicResponse)
async def get_whitepaper_by_slug(
    slug: str,
    db: AsyncSession = Depends(get_db),
    request: Request = None
):
    """Get a specific whitepaper by slug"""
    result = await db.execute(
        select(Whitepaper).where(
            Whitepaper.slug == slug,
            Whitepaper.status == "published",
            Whitepaper.lead_magnet_active == True,
            Whitepaper.deleted_at.is_(None)
        )
    )
    whitepaper = result.scalar_one_or_none()
    
    if not whitepaper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Whitepaper not found"
        )
    
    # Increment view count
    whitepaper.view_count = (whitepaper.view_count or 0) + 1
    await db.commit()
    
    return WhitepaperPublicResponse.from_orm(whitepaper)


@router.post("/whitepapers/{whitepaper_id}/download", response_model=WhitepaperDownloadResponse)
async def request_whitepaper_download(
    whitepaper_id: int,
    download_request: WhitepaperDownloadRequest,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """Request whitepaper download - triggers email validation"""
    
    # Verify whitepaper exists and is available
    result = await db.execute(
        select(Whitepaper).where(
            Whitepaper.id == whitepaper_id,
            Whitepaper.status == "published",
            Whitepaper.lead_magnet_active == True,
            Whitepaper.deleted_at.is_(None)
        )
    )
    whitepaper = result.scalar_one_or_none()
    
    if not whitepaper:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Whitepaper not found or not available for download"
        )
    
    client_info = await get_client_info(request)
    
    # Check if user has already requested this whitepaper
    existing_download = await db.execute(
        select(WhitepaperDownload).where(
            and_(
                WhitepaperDownload.whitepaper_id == whitepaper_id,
                WhitepaperDownload.email == download_request.email.lower()
            )
        )
    )
    existing = existing_download.scalar_one_or_none()
    
    if existing:
        if existing.email_validated:
            # User already validated, generate new download link
            download_token = generate_secure_token()
            expires_at = datetime.utcnow() + timedelta(days=7)
            
            existing.download_token = download_token
            existing.download_link_expires_at = expires_at
            await db.commit()
            
            download_url = f"{settings.base_url}/api/v1/public/whitepapers/download/{download_token}"
            
            return WhitepaperDownloadResponse(
                message="Download link has been sent to your email",
                validation_required=False,
                download_id=existing.id
            )
        else:
            # Resend validation email with existing token
            validation_token = existing.validation_token
            if not validation_token:
                validation_token = generate_secure_token()
                existing.validation_token = validation_token
                existing.validation_sent_at = datetime.utcnow()
                await db.commit()
    else:
        # Create new download request
        validation_token = generate_secure_token()
        download_token = generate_secure_token()
        expires_at = datetime.utcnow() + timedelta(days=7)
        
        new_download = WhitepaperDownload(
            whitepaper_id=whitepaper_id,
            first_name=download_request.first_name.strip(),
            last_name=download_request.last_name.strip(),
            email=download_request.email.lower(),
            company=download_request.company.strip() if download_request.company else None,
            job_title=download_request.job_title.strip() if download_request.job_title else None,
            phone=download_request.phone.strip() if download_request.phone else None,
            validation_token=validation_token,
            download_token=download_token,
            download_link_expires_at=expires_at,
            validation_sent_at=datetime.utcnow(),
            download_ip=client_info["ip"],
            user_agent=client_info["user_agent"],
            download_source="website",
            utm_source=download_request.utm_source,
            utm_medium=download_request.utm_medium,
            utm_campaign=download_request.utm_campaign
        )
        
        db.add(new_download)
        await db.commit()
        await db.refresh(new_download)
        existing = new_download
    
    # Send validation email
    try:
        validation_url = f"{settings.base_url}/api/v1/public/whitepapers/validate-email/{validation_token}"
        
        # Generate email content
        subject = f"Confirm your email to download: {whitepaper.title.get('en', 'Whitepaper')}"
        
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }}
                .header h1 {{ margin: 0; font-size: 24px; }}
                .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }}
                .button {{ display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }}
                .whitepaper-info {{ background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #667eea; }}
                .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>voltAIc Systems</h1>
                    <p>Confirm Your Email to Download Whitepaper</p>
                </div>
                <div class="content">
                    <p>Hello {existing.first_name},</p>
                    
                    <p>Thank you for your interest in downloading our whitepaper!</p>
                    
                    <div class="whitepaper-info">
                        <h3>{whitepaper.title.get('en', 'Whitepaper')}</h3>
                        <p>{whitepaper.description.get('en', '')}</p>
                    </div>
                    
                    <p>To complete your download, please confirm your email address by clicking the button below:</p>
                    
                    <p style="text-align: center;">
                        <a href="{validation_url}" class="button">Confirm Email & Download</a>
                    </p>
                    
                    <p>This link will expire in 24 hours. After validation, you'll receive a secure download link that's valid for 7 days.</p>
                    
                    <p>If you didn't request this whitepaper, please ignore this email.</p>
                    
                    <div class="footer">
                        <p>© 2025 voltAIc Systems. All rights reserved.</p>
                        <p>This email was automatically generated. Please do not reply.</p>
                    </div>
                </div>
            </div>
        </body>
        </html>
        """
        
        text_content = f"""
        voltAIc Systems - Confirm Your Email
        
        Hello {existing.first_name},
        
        Thank you for your interest in downloading our whitepaper: {whitepaper.title.get('en', 'Whitepaper')}
        
        To complete your download, please confirm your email address by visiting:
        {validation_url}
        
        This link will expire in 24 hours. After validation, you'll receive a secure download link that's valid for 7 days.
        
        If you didn't request this whitepaper, please ignore this email.
        
        © 2025 voltAIc Systems. All rights reserved.
        """
        
        success = await email_service.send_email(
            to=[existing.email],
            subject=subject,
            html_content=html_content,
            text_content=text_content
        )
        
        if not success:
            logger.warning(f"Failed to send validation email to {existing.email}")
        
    except Exception as e:
        logger.error(f"Error sending validation email: {e}")
    
    return WhitepaperDownloadResponse(
        message="Please check your email to confirm your download request",
        validation_required=True,
        download_id=existing.id
    )


@router.get("/whitepapers/validate-email/{token}")
async def validate_email_and_download(
    token: str,
    db: AsyncSession = Depends(get_db)
):
    """Validate email and redirect to download or return download link"""
    
    # Find download request by validation token
    result = await db.execute(
        select(WhitepaperDownload).where(
            WhitepaperDownload.validation_token == token
        )
    )
    download_request = result.scalar_one_or_none()
    
    if not download_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid or expired validation token"
        )
    
    # Check if token is expired (24 hours)
    if download_request.validation_sent_at:
        if datetime.utcnow() - download_request.validation_sent_at > timedelta(hours=24):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Validation token has expired. Please request a new download link."
            )
    
    # Mark email as validated
    download_request.email_validated = True
    download_request.email_validated_at = datetime.utcnow()
    
    # Ensure download token exists and is valid
    if not download_request.download_token or not download_request.download_link_expires_at:
        download_request.download_token = generate_secure_token()
        download_request.download_link_expires_at = datetime.utcnow() + timedelta(days=7)
    
    await db.commit()
    
    # Get whitepaper info for the success page
    whitepaper_result = await db.execute(
        select(Whitepaper).where(Whitepaper.id == download_request.whitepaper_id)
    )
    whitepaper = whitepaper_result.scalar_one()
    
    download_url = f"{settings.base_url}/api/v1/public/whitepapers/download/{download_request.download_token}"
    
    # Return HTML success page with download link
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Email Confirmed - Download Your Whitepaper</title>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background: #f5f5f5; }}
            .container {{ max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }}
            .header {{ background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 28px; }}
            .content {{ padding: 40px; }}
            .success-message {{ background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin-bottom: 20px; text-align: center; }}
            .download-section {{ background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }}
            .download-button {{ display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px; font-size: 16px; }}
            .download-button:hover {{ background: #5a6fd8; }}
            .info {{ background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0; }}
            .whitepaper-info {{ border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; }}
            .footer {{ text-align: center; margin-top: 30px; color: #666; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Email Confirmed!</h1>
                <p>Your whitepaper is ready for download</p>
            </div>
            <div class="content">
                <div class="success-message">
                    <strong>✓ Success!</strong> Your email has been confirmed.
                </div>
                
                <div class="whitepaper-info">
                    <h3>{whitepaper.title.get('en', 'Whitepaper')}</h3>
                    <p>{whitepaper.description.get('en', '')}</p>
                </div>
                
                <div class="download-section">
                    <h3>Download Your Whitepaper</h3>
                    <a href="{download_url}" class="download-button">Download PDF</a>
                    <p>You can download this whitepaper up to 3 times.</p>
                </div>
                
                <div class="info">
                    <strong>Important:</strong> This download link expires in 7 days. 
                    You can bookmark this page or save the download link for future reference.
                </div>
                
                <div class="footer">
                    <p>Thank you for your interest in voltAIc Systems!</p>
                    <p>© 2025 voltAIc Systems. All rights reserved.</p>
                </div>
            </div>
        </div>
        
        <script>
            // Auto-trigger download after 2 seconds
            setTimeout(function() {{
                window.location.href = '{download_url}';
            }}, 2000);
        </script>
    </body>
    </html>
    """
    
    from fastapi.responses import HTMLResponse
    return HTMLResponse(content=html_content)


@router.get("/whitepapers/download/{download_token}")
async def download_whitepaper(
    download_token: str,
    db: AsyncSession = Depends(get_db),
    request: Request = None
):
    """Download whitepaper with secure token"""
    
    # Find download request by download token
    result = await db.execute(
        select(WhitepaperDownload).where(
            WhitepaperDownload.download_token == download_token
        )
    )
    download_request = result.scalar_one_or_none()
    
    if not download_request:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid download token"
        )
    
    # Check if email is validated
    if not download_request.email_validated:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not validated. Please check your email for validation link."
        )
    
    # Check if download link is expired
    if download_request.download_link_expires_at and datetime.utcnow() > download_request.download_link_expires_at:
        raise HTTPException(
            status_code=status.HTTP_410_GONE,
            detail="Download link has expired. Please request a new download."
        )
    
    # Check download limit
    if download_request.download_count >= download_request.download_limit:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Download limit reached. Please request a new download link."
        )
    
    # Get whitepaper
    whitepaper_result = await db.execute(
        select(Whitepaper).where(Whitepaper.id == download_request.whitepaper_id)
    )
    whitepaper = whitepaper_result.scalar_one()
    
    if not whitepaper or not whitepaper.file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Whitepaper file not found"
        )
    
    # Update download tracking
    download_request.download_count += 1
    download_request.downloaded_at = datetime.utcnow()
    
    # Update whitepaper download count
    whitepaper.download_count = (whitepaper.download_count or 0) + 1
    
    await db.commit()
    
    # Return file download
    from fastapi.responses import FileResponse
    import os
    
    # Assuming files are stored in a specific directory
    file_path = f"/Users/ashant/magnetiq2/data/media/{whitepaper.file.filename}"
    
    if not os.path.exists(file_path):
        # Try alternative paths
        alternative_paths = [
            f"/Users/ashant/magnetiq2/backend/media/{whitepaper.file.filename}",
            f"/Users/ashant/magnetiq2/media/{whitepaper.file.filename}",
            whitepaper.file.file_path if hasattr(whitepaper.file, 'file_path') else None
        ]
        
        for alt_path in alternative_paths:
            if alt_path and os.path.exists(alt_path):
                file_path = alt_path
                break
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="File not found on server"
            )
    
    # Generate safe filename
    safe_filename = f"{whitepaper.slug}.pdf"
    
    return FileResponse(
        path=file_path,
        filename=safe_filename,
        media_type='application/pdf',
        headers={
            "Content-Disposition": f"attachment; filename=\"{safe_filename}\"",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            "Pragma": "no-cache",
            "Expires": "0"
        }
    )