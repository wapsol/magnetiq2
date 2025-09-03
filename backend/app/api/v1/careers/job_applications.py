from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, Request, Response
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any
import logging
from pathlib import Path

from ....database import get_db
from ....services.job_application_service import JobApplicationService
from ....schemas.job_application import (
    JobApplicationCreate, JobApplicationResponse, JobApplicationDetailedResponse,
    JobApplicationListResponse, JobApplicationSubmissionResponse, ApplicationConfigResponse,
    ApplicationSearchFilters, ApplicationStatusUpdate, ApplicationStatistics
)
from ....middleware.language_detection import get_current_language

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/applications", response_model=Dict[str, Any])
async def submit_job_application(
    request: Request,
    position_title: str = Form(...),
    position_department: str = Form(...),
    position_location: Optional[str] = Form(None),
    position_type: Optional[str] = Form(None),
    linkedin_profile: str = Form(...),
    github_profile: Optional[str] = Form(None),
    consent_cv_sharing: bool = Form(...),
    consent_ai_processing: bool = Form(...),
    consent_communications: bool = Form(...),
    application_language: Optional[str] = Form('en'),
    referrer_url: Optional[str] = Form(None),
    cv_file: UploadFile = File(...),
    language: str = Depends(get_current_language),
    db: AsyncSession = Depends(get_db)
):
    """Submit a new job application with CV upload"""
    
    service = JobApplicationService(db)
    
    try:
        # Create application data object
        from ....schemas.job_application import JobApplicationCreate
        from pydantic import ValidationError
        
        try:
            application_data = JobApplicationCreate(
                position_title=position_title,
                position_department=position_department,
                position_location=position_location,
                position_type=position_type,
                linkedin_profile=linkedin_profile,
                github_profile=github_profile,
                consent_cv_sharing=consent_cv_sharing,
                consent_ai_processing=consent_ai_processing,
                consent_communications=consent_communications,
                application_language=application_language or language,
                referrer_url=referrer_url
            )
        except ValidationError as e:
            logger.error(f"Validation error in job application: {e}")
            raise HTTPException(status_code=422, detail=f"Validation error: {str(e)}")
        
        # Extract request metadata
        user_agent = request.headers.get('user-agent')
        ip_address = request.client.host if request.client else None
        
        # Create application
        result = await service.create_application(
            application_data=application_data,
            cv_file=cv_file,
            user_agent=user_agent,
            ip_address=ip_address
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result.get('error', 'Application submission failed'))
        
        # Prepare response messages
        messages = {
            'en': {
                'confirmation': "Your application has been submitted successfully. We'll review it and get back to you within 5-7 business days.",
                'next_steps': "You will receive a confirmation email shortly. Please check your spam folder if you don't see it in your inbox."
            },
            'de': {
                'confirmation': "Ihre Bewerbung wurde erfolgreich eingereicht. Wir werden sie prüfen und uns innerhalb von 5-7 Werktagen bei Ihnen melden.",
                'next_steps': "Sie erhalten in Kürze eine Bestätigungs-E-Mail. Bitte überprüfen Sie Ihren Spam-Ordner, falls Sie sie nicht in Ihrem Posteingang finden."
            }
        }
        
        current_lang = language if language in ['en', 'de'] else 'en'
        
        return {
            'success': True,
            'data': {
                'application_id': result['application_id'],
                'reference_number': result['reference_number'],
                'submitted_at': result['submitted_at'],
                'confirmation_message': messages[current_lang]['confirmation'],
                'next_steps': messages[current_lang]['next_steps']
            },
            'language': current_lang
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error submitting job application: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to submit application")


@router.get("/applications/config", response_model=Dict[str, Any])
async def get_application_config(
    language: str = Depends(get_current_language),
    db: AsyncSession = Depends(get_db)
):
    """Get application configuration and validation rules"""
    
    service = JobApplicationService(db)
    
    try:
        config = service.get_application_config()
        
        # Add localized messages
        messages = {
            'en': {
                'upload_instructions': "Upload your CV in PDF, DOC, or DOCX format (max 10MB)",
                'linkedin_required': "LinkedIn profile is required for all applications",
                'github_optional': "GitHub profile is optional but recommended for technical roles",
                'consent_cv_sharing': "I allow voltAIc to share my CV with trusted recruitment partners to identify suitable career opportunities.",
                'consent_ai_processing': "I consent to the processing of my application materials by AI systems in the private cloud to optimize the recruitment process.",
                'consent_communications': "I would like to be informed about new job openings and the status of my application.",
                'success_message': "Your application has been submitted successfully. We'll be in touch soon!",
                'error_file_size': "File size must be less than 10MB",
                'error_file_type': "Please upload a PDF, DOC, or DOCX file",
                'error_linkedin_format': "Please enter a valid LinkedIn profile URL",
                'error_github_format': "Please enter a valid GitHub profile URL"
            },
            'de': {
                'upload_instructions': "Laden Sie Ihren Lebenslauf im PDF-, DOC- oder DOCX-Format hoch (max. 10MB)",
                'linkedin_required': "LinkedIn-Profil ist für alle Bewerbungen erforderlich",
                'github_optional': "GitHub-Profil ist optional, aber für technische Rollen empfohlen",
                'consent_cv_sharing': "Ich erlaube voltAIc, meinen Lebenslauf mit vertrauenswürdigen Recruiting-Partnern zu teilen, um passende Karrieremöglichkeiten zu finden.",
                'consent_ai_processing': "Ich stimme der Verarbeitung meiner Bewerbungsunterlagen durch KI-Systeme in der privaten Cloud zu, um den Bewerbungsprozess zu optimieren.",
                'consent_communications': "Ich möchte über neue Stellenausschreibungen und den Status meiner Bewerbung informiert werden.",
                'success_message': "Ihre Bewerbung wurde erfolgreich eingereicht. Wir melden uns bald bei Ihnen!",
                'error_file_size': "Dateigröße muss kleiner als 10MB sein",
                'error_file_type': "Bitte laden Sie eine PDF-, DOC- oder DOCX-Datei hoch",
                'error_linkedin_format': "Bitte geben Sie eine gültige LinkedIn-Profil-URL ein",
                'error_github_format': "Bitte geben Sie eine gültige GitHub-Profil-URL ein"
            }
        }
        
        config['messages'] = messages
        
        return {
            'success': True,
            'data': {
                'config': config,
                'language': language
            }
        }
        
    except Exception as e:
        logger.error(f"Error fetching application config: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch configuration")


@router.get("/applications/{application_id}")
async def get_application(
    application_id: str,
    language: str = Depends(get_current_language),
    db: AsyncSession = Depends(get_db)
):
    """Get job application by ID"""
    
    service = JobApplicationService(db)
    
    try:
        application = await service.get_application_by_id(application_id)
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return {
            'success': True,
            'data': {
                'application': application,
                'language': language
            }
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error fetching application: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch application")


# Admin endpoints
@router.get("/admin/applications", response_model=Dict[str, Any])
async def search_applications(
    position_title: Optional[str] = None,
    position_department: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = 'created_at',
    sort_order: str = 'desc',
    db: AsyncSession = Depends(get_db)
):
    """Search applications with filtering and pagination (Admin only)"""
    
    service = JobApplicationService(db)
    
    try:
        from ....schemas.job_application import ApplicationSearchFilters
        
        filters = ApplicationSearchFilters(
            position_title=position_title,
            position_department=position_department,
            status=status,
            page=page,
            page_size=page_size,
            sort_by=sort_by,
            sort_order=sort_order
        )
        
        result = await service.search_applications(filters)
        
        return {
            'success': True,
            'data': result
        }
        
    except Exception as e:
        logger.error(f"Error searching applications: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to search applications")


@router.get("/admin/applications/{application_id}/detailed")
async def get_detailed_application(
    application_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get detailed application information (Admin only)"""
    
    service = JobApplicationService(db)
    
    try:
        application = await service.get_application_by_id(application_id)
        
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        return {
            'success': True,
            'data': {
                'application': application
            }
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error fetching detailed application: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch application details")


@router.put("/admin/applications/{application_id}/status")
async def update_application_status(
    application_id: str,
    status_update: ApplicationStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update application status (Admin only)"""
    
    service = JobApplicationService(db)
    
    try:
        result = await service.update_application_status(
            application_id=application_id,
            status_update=status_update,
            changed_by_id="admin",  # TODO: Get from authentication
            changed_by_name="System Administrator"  # TODO: Get from user session
        )
        
        return {
            'success': True,
            'data': result
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error updating application status: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update application status")


@router.get("/admin/applications/{application_id}/cv")
async def download_cv(
    application_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Download CV file (Admin only)"""
    
    service = JobApplicationService(db)
    
    try:
        file_path, original_filename = await service.download_cv(application_id)
        
        return FileResponse(
            path=file_path,
            filename=original_filename,
            media_type='application/octet-stream'
        )
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Error downloading CV: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to download CV")


@router.get("/admin/statistics")
async def get_application_statistics(
    db: AsyncSession = Depends(get_db)
):
    """Get application statistics (Admin only)"""
    
    service = JobApplicationService(db)
    
    try:
        stats = await service.get_application_statistics()
        
        return {
            'success': True,
            'data': stats
        }
        
    except Exception as e:
        logger.error(f"Error fetching application statistics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch statistics")