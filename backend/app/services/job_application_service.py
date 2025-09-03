from typing import Optional, Dict, Any, List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy import select, and_, or_, func, desc, asc, text
from datetime import datetime, timedelta
from fastapi import UploadFile, HTTPException
import uuid
import hashlib
import os
import shutil
import logging
import mimetypes
from pathlib import Path
import asyncio
import aiofiles
from urllib.parse import urlparse

from ..models.careers import (
    JobApplication, JobApplicationAuditLog, ApplicationStatusHistory, 
    ApplicationUploadMetadata, ApplicationStatus
)
from ..schemas.job_application import (
    JobApplicationCreate, JobApplicationUpdate, ApplicationSearchFilters,
    ApplicationStatusUpdate, CVUploadInfo
)
# from .email_service import SMTPEmailService
# from .audit_service import AuditService

logger = logging.getLogger(__name__)


class JobApplicationService:
    """Service for managing job applications with file upload and consent tracking"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
        self.upload_base_path = Path("uploads/cvs")
        self.allowed_extensions = {'.pdf', '.doc', '.docx'}
        self.allowed_mime_types = {
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        }
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        
        # Ensure upload directory exists
        self.upload_base_path.mkdir(parents=True, exist_ok=True)
        
    async def create_application(
        self,
        application_data: JobApplicationCreate,
        cv_file: UploadFile,
        user_agent: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a new job application with CV upload"""
        
        try:
            # Generate unique application ID
            application_id = str(uuid.uuid4())
            
            # Validate and process CV file
            cv_info = await self._process_cv_upload(cv_file, application_id)
            
            # Create application record
            application = JobApplication(
                id=application_id,
                position_title=application_data.position_title,
                position_department=application_data.position_department,
                position_location=application_data.position_location,
                position_type=application_data.position_type,
                linkedin_profile=str(application_data.linkedin_profile),
                github_profile=str(application_data.github_profile) if application_data.github_profile else None,
                cv_filename=cv_info['filename'],
                cv_original_filename=cv_info['original_filename'],
                cv_file_path=cv_info['file_path'],
                cv_file_size=cv_info['file_size'],
                cv_mime_type=cv_info['mime_type'],
                cv_file_hash=cv_info['file_hash'],
                consent_cv_sharing=application_data.consent_cv_sharing,
                consent_ai_processing=application_data.consent_ai_processing,
                consent_communications=application_data.consent_communications,
                application_language=application_data.application_language or 'en',
                user_agent=user_agent,
                ip_address=ip_address,
                referrer_url=application_data.referrer_url,
                status=ApplicationStatus.SUBMITTED
            )
            
            self.db.add(application)
            await self.db.flush()
            
            # Create upload metadata record
            upload_metadata = ApplicationUploadMetadata(
                id=str(uuid.uuid4()),
                application_id=application_id,
                file_type='cv',
                filename=cv_info['filename'],
                original_filename=cv_info['original_filename'],
                file_path=cv_info['file_path'],
                file_size=cv_info['file_size'],
                mime_type=cv_info['mime_type'],
                file_hash=cv_info['file_hash']
            )
            
            self.db.add(upload_metadata)
            
            # Create initial status history record
            status_history = ApplicationStatusHistory(
                application_id=application_id,
                previous_status=None,
                new_status=ApplicationStatus.SUBMITTED,
                status_reason="Initial application submission",
                changed_by_type="system",
                notes="Application submitted via career page",
                automated_change=True
            )
            
            self.db.add(status_history)
            
            # Create audit log entry
            await self._create_audit_log(
                application_id=application_id,
                action="created",
                actor_type="candidate",
                actor_details={
                    "ip_address": ip_address,
                    "user_agent": user_agent,
                    "application_language": application_data.application_language
                }
            )
            
            await self.db.commit()
            
            # Send notification emails asynchronously
            asyncio.create_task(self._send_application_notifications(application))
            
            # Generate reference number
            reference_number = f"JA-{application_id[:8].upper()}"
            
            logger.info(f"Job application created successfully: {application_id}")
            
            return {
                "success": True,
                "application_id": application_id,
                "reference_number": reference_number,
                "submitted_at": application.created_at,
                "status": application.status
            }
            
        except Exception as e:
            await self.db.rollback()
            logger.error(f"Error creating job application: {str(e)}")
            # Clean up uploaded file if it exists
            if 'cv_info' in locals() and cv_info:
                try:
                    os.remove(cv_info['file_path'])
                except:
                    pass
            raise HTTPException(status_code=500, detail=f"Failed to create application: {str(e)}")
    
    async def _process_cv_upload(self, cv_file: UploadFile, application_id: str) -> Dict[str, Any]:
        """Process and validate CV file upload"""
        
        # Validate file
        if not cv_file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Check file size
        file_content = await cv_file.read()
        file_size = len(file_content)
        
        if file_size > self.max_file_size:
            raise HTTPException(
                status_code=400, 
                detail=f"File too large. Maximum size is {self.max_file_size // (1024*1024)}MB"
            )
        
        # Validate file extension
        file_ext = Path(cv_file.filename).suffix.lower()
        if file_ext not in self.allowed_extensions:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file type. Allowed types: {', '.join(self.allowed_extensions)}"
            )
        
        # Validate MIME type
        mime_type, _ = mimetypes.guess_type(cv_file.filename)
        if not mime_type or mime_type not in self.allowed_mime_types:
            # Fallback to content type if provided
            if cv_file.content_type in self.allowed_mime_types:
                mime_type = cv_file.content_type
            else:
                raise HTTPException(
                    status_code=400,
                    detail="Invalid file type. Please upload PDF, DOC, or DOCX files only"
                )
        
        # Create application-specific directory
        app_dir = self.upload_base_path / application_id
        app_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate secure filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        safe_filename = f"cv_{timestamp}{file_ext}"
        file_path = app_dir / safe_filename
        
        # Calculate file hash for integrity
        file_hash = hashlib.sha256(file_content).hexdigest()
        
        try:
            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(file_content)
            
            # Set secure permissions (read/write for owner only)
            os.chmod(file_path, 0o600)
            
            return {
                'filename': safe_filename,
                'original_filename': cv_file.filename,
                'file_path': str(file_path),
                'file_size': file_size,
                'mime_type': mime_type,
                'file_hash': file_hash
            }
            
        except Exception as e:
            # Clean up on error
            try:
                if file_path.exists():
                    file_path.unlink()
                if app_dir.exists() and not any(app_dir.iterdir()):
                    app_dir.rmdir()
            except:
                pass
            raise HTTPException(status_code=500, detail=f"Failed to save file: {str(e)}")
    
    async def get_application_by_id(self, application_id: str) -> Optional[JobApplication]:
        """Get job application by ID"""
        
        query = select(JobApplication).where(JobApplication.id == application_id)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
    
    async def update_application_status(
        self,
        application_id: str,
        status_update: ApplicationStatusUpdate,
        changed_by_id: Optional[str] = None,
        changed_by_name: Optional[str] = None
    ) -> Dict[str, Any]:
        """Update application status with audit trail"""
        
        # Get existing application
        application = await self.get_application_by_id(application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        previous_status = application.status
        
        # Update application
        application.status = status_update.status
        application.updated_at = datetime.utcnow()
        
        # Create status history record
        status_history = ApplicationStatusHistory(
            application_id=application_id,
            previous_status=previous_status,
            new_status=status_update.status,
            status_reason=status_update.status_reason,
            changed_by_type="admin" if changed_by_id else "system",
            changed_by_id=changed_by_id,
            changed_by_name=changed_by_name,
            notes=status_update.notes,
            automated_change=changed_by_id is None
        )
        
        self.db.add(status_history)
        
        # Create audit log
        await self._create_audit_log(
            application_id=application_id,
            action="status_updated",
            actor_type="admin" if changed_by_id else "system",
            actor_id=changed_by_id,
            field_changed="status",
            old_value=previous_status,
            new_value=status_update.status,
            change_reason=status_update.status_reason
        )
        
        await self.db.commit()
        
        # Send notification if required
        if status_update.notification_required:
            asyncio.create_task(self._send_status_notification(application, status_update.status))
        
        return {
            "success": True,
            "application_id": application_id,
            "previous_status": previous_status,
            "new_status": status_update.status,
            "updated_at": application.updated_at
        }
    
    async def search_applications(self, filters: ApplicationSearchFilters) -> Dict[str, Any]:
        """Search applications with filtering and pagination"""
        
        query = select(JobApplication)
        
        # Apply filters
        conditions = []
        
        if filters.position_title:
            conditions.append(JobApplication.position_title.ilike(f"%{filters.position_title}%"))
        
        if filters.position_department:
            conditions.append(JobApplication.position_department == filters.position_department)
        
        if filters.status:
            conditions.append(JobApplication.status == filters.status)
        
        if filters.date_from:
            conditions.append(JobApplication.created_at >= filters.date_from)
        
        if filters.date_to:
            conditions.append(JobApplication.created_at <= filters.date_to)
        
        if filters.rating_min:
            conditions.append(JobApplication.recruiter_rating >= filters.rating_min)
        
        if filters.rating_max:
            conditions.append(JobApplication.recruiter_rating <= filters.rating_max)
        
        if filters.has_github_profile is not None:
            if filters.has_github_profile:
                conditions.append(JobApplication.github_profile.isnot(None))
            else:
                conditions.append(JobApplication.github_profile.is_(None))
        
        if filters.consent_ai_processing is not None:
            conditions.append(JobApplication.consent_ai_processing == filters.consent_ai_processing)
        
        if filters.application_language:
            conditions.append(JobApplication.application_language == filters.application_language)
        
        if conditions:
            query = query.where(and_(*conditions))
        
        # Get total count
        count_query = select(func.count()).select_from(query.subquery())
        total_result = await self.db.execute(count_query)
        total = total_result.scalar()
        
        # Apply sorting
        sort_column = getattr(JobApplication, filters.sort_by, JobApplication.created_at)
        if filters.sort_order == 'asc':
            query = query.order_by(asc(sort_column))
        else:
            query = query.order_by(desc(sort_column))
        
        # Apply pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.offset(offset).limit(filters.page_size)
        
        result = await self.db.execute(query)
        applications = result.scalars().all()
        
        total_pages = (total + filters.page_size - 1) // filters.page_size
        
        return {
            "applications": applications,
            "total": total,
            "page": filters.page,
            "page_size": filters.page_size,
            "total_pages": total_pages
        }
    
    async def get_application_statistics(self) -> Dict[str, Any]:
        """Get application statistics for dashboard"""
        
        # Total applications
        total_query = select(func.count(JobApplication.id))
        total_result = await self.db.execute(total_query)
        total_applications = total_result.scalar()
        
        # Applications by status
        status_query = select(
            JobApplication.status,
            func.count(JobApplication.id)
        ).group_by(JobApplication.status)
        status_result = await self.db.execute(status_query)
        applications_by_status = {status: count for status, count in status_result.fetchall()}
        
        # Applications by department
        dept_query = select(
            JobApplication.position_department,
            func.count(JobApplication.id)
        ).group_by(JobApplication.position_department)
        dept_result = await self.db.execute(dept_query)
        applications_by_department = {dept: count for dept, count in dept_result.fetchall()}
        
        # Applications by month (last 12 months)
        month_query = select(
            func.date_trunc('month', JobApplication.created_at).label('month'),
            func.count(JobApplication.id)
        ).where(
            JobApplication.created_at >= datetime.now() - timedelta(days=365)
        ).group_by(
            func.date_trunc('month', JobApplication.created_at)
        ).order_by(
            func.date_trunc('month', JobApplication.created_at)
        )
        month_result = await self.db.execute(month_query)
        applications_by_month = {
            month.strftime('%Y-%m'): count 
            for month, count in month_result.fetchall()
        }
        
        # Average rating
        rating_query = select(func.avg(JobApplication.recruiter_rating)).where(
            JobApplication.recruiter_rating.isnot(None)
        )
        rating_result = await self.db.execute(rating_query)
        average_rating = rating_result.scalar()
        
        # Consent statistics
        consent_stats = {}
        for consent_type in ['consent_cv_sharing', 'consent_ai_processing', 'consent_communications']:
            consent_query = select(func.count(JobApplication.id)).where(
                getattr(JobApplication, consent_type) == True
            )
            consent_result = await self.db.execute(consent_query)
            consent_stats[consent_type] = consent_result.scalar()
        
        return {
            "total_applications": total_applications,
            "applications_by_status": applications_by_status,
            "applications_by_department": applications_by_department,
            "applications_by_month": applications_by_month,
            "average_rating": float(average_rating) if average_rating else None,
            "consent_statistics": consent_stats,
            "processing_metrics": {
                "avg_time_to_review": None,  # Can be calculated based on status history
                "application_completion_rate": None  # Can be calculated based on tracking
            }
        }
    
    async def download_cv(self, application_id: str) -> Tuple[str, str]:
        """Get CV file path and filename for download"""
        
        application = await self.get_application_by_id(application_id)
        if not application:
            raise HTTPException(status_code=404, detail="Application not found")
        
        file_path = Path(application.cv_file_path)
        if not file_path.exists():
            raise HTTPException(status_code=404, detail="CV file not found")
        
        # Log access
        await self._create_audit_log(
            application_id=application_id,
            action="cv_downloaded",
            actor_type="admin"  # Assume admin access for now
        )
        
        return str(file_path), application.cv_original_filename
    
    async def _create_audit_log(
        self,
        application_id: str,
        action: str,
        actor_type: str,
        actor_id: Optional[str] = None,
        actor_details: Optional[Dict[str, Any]] = None,
        field_changed: Optional[str] = None,
        old_value: Optional[str] = None,
        new_value: Optional[str] = None,
        change_reason: Optional[str] = None
    ):
        """Create audit log entry"""
        
        audit_log = JobApplicationAuditLog(
            application_id=application_id,
            action=action,
            actor_type=actor_type,
            actor_id=actor_id,
            actor_details=actor_details or {},
            field_changed=field_changed,
            old_value=old_value,
            new_value=new_value,
            change_reason=change_reason
        )
        
        self.db.add(audit_log)
    
    async def _send_application_notifications(self, application: JobApplication):
        """Send notification emails for new application"""
        
        try:
            # Send confirmation to candidate
            if application.consent_communications:
                # Implementation would use EmailService
                logger.info(f"Would send confirmation email for application {application.id}")
            
            # Send notification to HR team
            logger.info(f"Would send HR notification for new application {application.id}")
            
        except Exception as e:
            logger.error(f"Error sending application notifications: {str(e)}")
    
    async def _send_status_notification(self, application: JobApplication, new_status: str):
        """Send status update notification"""
        
        try:
            if application.consent_communications:
                logger.info(f"Would send status update notification for application {application.id}: {new_status}")
            
        except Exception as e:
            logger.error(f"Error sending status notification: {str(e)}")
    
    def get_application_config(self) -> Dict[str, Any]:
        """Get application configuration for frontend"""
        
        return {
            "file_upload": {
                "max_size_mb": self.max_file_size // (1024 * 1024),
                "allowed_extensions": list(self.allowed_extensions),
                "allowed_mime_types": list(self.allowed_mime_types)
            },
            "profile_validation": {
                "linkedin_pattern": r"^https?://(www\.)?linkedin\.com/in/[\w\-\.]+/?$",
                "github_pattern": r"^https?://(www\.)?github\.com/[\w\-\.]+/?$"
            },
            "positions": [
                {"title": "Senior AI Engineer", "department": "Engineering"},
                {"title": "Data Scientist", "department": "Analytics"},
                {"title": "Business Development Manager", "department": "Sales"}
            ]
        }