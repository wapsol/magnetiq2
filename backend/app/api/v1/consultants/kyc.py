from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional, Dict, Any
from pydantic import BaseModel
import logging
import uuid
from datetime import datetime

from ....database import get_db
from ....services.kyc_service import KYCService
from ....models.consultant import KYCStatus

logger = logging.getLogger(__name__)
router = APIRouter()


# Pydantic models
class KYCDocumentUploadRequest(BaseModel):
    consultant_id: str
    document_type: str  # identity, tax, address, banking, contract
    document_subtype: Optional[str] = None  # passport, id_card, drivers_license


class KYCPersonalInfoRequest(BaseModel):
    consultant_id: str
    tax_id_number: Optional[str] = None
    tax_country: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    state_province: Optional[str] = None
    postal_code: Optional[str] = None
    country: Optional[str] = None


class KYCBankingInfoRequest(BaseModel):
    consultant_id: str
    bank_account_holder: str
    iban: str
    bic_swift: Optional[str] = None
    bank_name: str
    bank_country: str


class KYCReviewRequest(BaseModel):
    status: str  # approved, rejected
    review_notes: Optional[str] = None
    rejection_reason: Optional[str] = None


# Consultant KYC endpoints
@router.get("/consultant/{consultant_id}/kyc-status")
async def get_kyc_status(
    consultant_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get KYC status and requirements for consultant"""
    
    try:
        service = KYCService(db)
        result = await service.get_kyc_status(consultant_id)
        
        if not result['success']:
            raise HTTPException(status_code=404, detail=result['error'])
        
        return {
            'success': True,
            'data': result['kyc_data']
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Get KYC status error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get KYC status")


@router.post("/consultant/{consultant_id}/kyc-document")
async def upload_kyc_document(
    consultant_id: str,
    document_type: str = Form(...),
    document_subtype: str = Form(None),
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload KYC document for consultant"""
    
    try:
        service = KYCService(db)
        
        # Validate document type
        valid_types = ['identity', 'tax', 'address', 'banking', 'contract']
        if document_type not in valid_types:
            raise HTTPException(status_code=400, detail="Invalid document type")
        
        # Validate file
        if not file.filename:
            raise HTTPException(status_code=400, detail="No file provided")
        
        # Check file size (10MB limit)
        if file.size and file.size > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large (max 10MB)")
        
        # Check file type
        allowed_extensions = {'.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'}
        file_extension = '.' + file.filename.split('.')[-1].lower()
        if file_extension not in allowed_extensions:
            raise HTTPException(status_code=400, detail="Invalid file type")
        
        result = await service.upload_kyc_document(
            consultant_id=consultant_id,
            document_type=document_type,
            document_subtype=document_subtype,
            file=file
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Document upload error: {e}")
        raise HTTPException(status_code=500, detail="Document upload failed")


@router.put("/consultant/{consultant_id}/kyc-personal-info")
async def update_kyc_personal_info(
    consultant_id: str,
    request: KYCPersonalInfoRequest,
    db: AsyncSession = Depends(get_db)
):
    """Update KYC personal information"""
    
    try:
        service = KYCService(db)
        
        updates = request.dict(exclude={'consultant_id'}, exclude_unset=True)
        
        result = await service.update_kyc_personal_info(
            consultant_id=consultant_id,
            updates=updates
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Personal info update error: {e}")
        raise HTTPException(status_code=500, detail="Personal info update failed")


@router.put("/consultant/{consultant_id}/kyc-banking-info")
async def update_kyc_banking_info(
    consultant_id: str,
    request: KYCBankingInfoRequest,
    db: AsyncSession = Depends(get_db)
):
    """Update KYC banking information"""
    
    try:
        service = KYCService(db)
        
        banking_data = request.dict(exclude={'consultant_id'})
        
        result = await service.update_kyc_banking_info(
            consultant_id=consultant_id,
            banking_data=banking_data
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Banking info update error: {e}")
        raise HTTPException(status_code=500, detail="Banking info update failed")


@router.post("/consultant/{consultant_id}/kyc-submit")
async def submit_kyc_for_review(
    consultant_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Submit KYC for admin review"""
    
    try:
        service = KYCService(db)
        
        result = await service.submit_kyc_for_review(consultant_id)
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"KYC submit error: {e}")
        raise HTTPException(status_code=500, detail="KYC submission failed")


# Admin KYC review endpoints
@router.get("/admin/kyc-pending")
async def get_pending_kyc_reviews(
    limit: int = 50,
    offset: int = 0,
    db: AsyncSession = Depends(get_db)
):
    """Get all KYC submissions pending review"""
    
    try:
        service = KYCService(db)
        
        result = await service.get_pending_kyc_reviews(
            limit=limit,
            offset=offset
        )
        
        return {
            'success': True,
            'data': result
        }
        
    except Exception as e:
        logger.error(f"Get pending KYC error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get pending reviews")


@router.get("/admin/consultant/{consultant_id}/kyc-details")
async def get_kyc_details_for_review(
    consultant_id: str,
    db: AsyncSession = Depends(get_db)
):
    """Get full KYC details for admin review"""
    
    try:
        service = KYCService(db)
        
        result = await service.get_kyc_details_for_review(consultant_id)
        
        if not result['success']:
            raise HTTPException(status_code=404, detail=result['error'])
        
        return {
            'success': True,
            'data': result['kyc_data']
        }
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"Get KYC details error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get KYC details")


@router.post("/admin/consultant/{consultant_id}/kyc-review")
async def review_kyc_submission(
    consultant_id: str,
    request: KYCReviewRequest,
    db: AsyncSession = Depends(get_db)
):
    """Review and approve/reject KYC submission"""
    
    try:
        service = KYCService(db)
        
        # Validate status
        if request.status not in ['approved', 'rejected']:
            raise HTTPException(status_code=400, detail="Invalid review status")
        
        # Require rejection reason if rejecting
        if request.status == 'rejected' and not request.rejection_reason:
            raise HTTPException(status_code=400, detail="Rejection reason required")
        
        result = await service.review_kyc_submission(
            consultant_id=consultant_id,
            status=request.status,
            review_notes=request.review_notes,
            rejection_reason=request.rejection_reason,
            reviewed_by=None  # Will add admin user tracking later
        )
        
        if not result['success']:
            raise HTTPException(status_code=400, detail=result['error'])
        
        return result
        
    except HTTPException as e:
        raise e
    except Exception as e:
        logger.error(f"KYC review error: {e}")
        raise HTTPException(status_code=500, detail="KYC review failed")


@router.get("/admin/kyc-statistics")
async def get_kyc_statistics(
    db: AsyncSession = Depends(get_db)
):
    """Get KYC processing statistics"""
    
    try:
        service = KYCService(db)
        
        stats = await service.get_kyc_statistics()
        
        return {
            'success': True,
            'data': stats
        }
        
    except Exception as e:
        logger.error(f"KYC statistics error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get KYC statistics")