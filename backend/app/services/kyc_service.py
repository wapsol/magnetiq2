from typing import Optional, Dict, Any, List
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import desc, func
from datetime import datetime
from fastapi import UploadFile
import uuid
import os
import logging

from ..models.consultant import (
    Consultant, ConsultantKYC, ConsultantStatus, KYCStatus
)
from ..config import settings

logger = logging.getLogger(__name__)


class KYCService:
    def __init__(self, db: Session):
        self.db = db
        self.upload_dir = settings.kyc_upload_dir
        
        # Ensure upload directory exists
        os.makedirs(self.upload_dir, exist_ok=True)

    async def get_kyc_status(self, consultant_id: str) -> Dict[str, Any]:
        """Get KYC status and requirements for consultant"""
        
        consultant = self.db.query(Consultant).filter(
            Consultant.id == consultant_id
        ).first()
        
        if not consultant:
            return {
                'success': False,
                'error': 'Consultant not found'
            }
        
        # Get or create KYC record
        kyc_record = self.db.query(ConsultantKYC).filter(
            ConsultantKYC.consultant_id == consultant_id
        ).first()
        
        if not kyc_record:
            kyc_record = ConsultantKYC(consultant_id=consultant_id)
            self.db.add(kyc_record)
            self.db.commit()
            self.db.refresh(kyc_record)
        
        # Build requirements checklist
        requirements = {
            'identity_document': {
                'required': True,
                'completed': kyc_record.identity_verified,
                'document_url': kyc_record.identity_document_url,
                'document_type': kyc_record.identity_document_type
            },
            'tax_information': {
                'required': True,
                'completed': kyc_record.tax_verified,
                'document_url': kyc_record.tax_document_url,
                'tax_id_number': kyc_record.tax_id_number,
                'tax_country': kyc_record.tax_country
            },
            'address_verification': {
                'required': True,
                'completed': kyc_record.address_verified,
                'document_url': kyc_record.address_document_url,
                'address': {
                    'line1': kyc_record.address_line1,
                    'line2': kyc_record.address_line2,
                    'city': kyc_record.city,
                    'state_province': kyc_record.state_province,
                    'postal_code': kyc_record.postal_code,
                    'country': kyc_record.country
                }
            },
            'banking_information': {
                'required': True,
                'completed': kyc_record.banking_verified,
                'account_holder': kyc_record.bank_account_holder,
                'iban': kyc_record.iban,
                'bic_swift': kyc_record.bic_swift,
                'bank_name': kyc_record.bank_name,
                'bank_country': kyc_record.bank_country
            },
            'contract_agreement': {
                'required': True,
                'completed': kyc_record.contract_signed_at is not None,
                'contract_url': kyc_record.contract_document_url,
                'signed_at': kyc_record.contract_signed_at.isoformat() if kyc_record.contract_signed_at else None,
                'terms_accepted': kyc_record.terms_accepted,
                'gdpr_consent': kyc_record.gdpr_consent
            }
        }
        
        # Calculate completion percentage
        total_requirements = len(requirements)
        completed_requirements = sum(1 for req in requirements.values() if req['completed'])
        completion_percentage = int((completed_requirements / total_requirements) * 100)
        
        return {
            'success': True,
            'kyc_data': {
                'consultant_id': consultant_id,
                'kyc_status': kyc_record.status,
                'completion_percentage': completion_percentage,
                'requirements': requirements,
                'review_notes': kyc_record.review_notes,
                'rejection_reason': kyc_record.rejection_reason,
                'reviewed_by': kyc_record.reviewed_by,
                'reviewed_at': kyc_record.reviewed_at.isoformat() if kyc_record.reviewed_at else None,
                'created_at': kyc_record.created_at.isoformat(),
                'updated_at': kyc_record.updated_at.isoformat() if kyc_record.updated_at else None
            }
        }

    async def upload_kyc_document(
        self,
        consultant_id: str,
        document_type: str,
        file: UploadFile,
        document_subtype: Optional[str] = None
    ) -> Dict[str, Any]:
        """Upload and process KYC document"""
        
        try:
            # Get or create KYC record
            kyc_record = self.db.query(ConsultantKYC).filter(
                ConsultantKYC.consultant_id == consultant_id
            ).first()
            
            if not kyc_record:
                kyc_record = ConsultantKYC(consultant_id=consultant_id)
                self.db.add(kyc_record)
                self.db.commit()
                self.db.refresh(kyc_record)
            
            # Generate unique filename
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{consultant_id}_{document_type}_{uuid.uuid4().hex}{file_extension}"
            file_path = os.path.join(self.upload_dir, unique_filename)
            
            # Save file
            with open(file_path, "wb") as buffer:
                content = await file.read()
                buffer.write(content)
            
            # Update KYC record based on document type
            if document_type == 'identity':
                kyc_record.identity_document_url = file_path
                kyc_record.identity_document_type = document_subtype or 'unknown'
                # Auto-verify simple document uploads (in production, add verification logic)
                kyc_record.identity_verified = True
                
            elif document_type == 'tax':
                kyc_record.tax_document_url = file_path
                kyc_record.tax_verified = True
                
            elif document_type == 'address':
                kyc_record.address_document_url = file_path
                kyc_record.address_verified = True
                
            elif document_type == 'contract':
                kyc_record.contract_document_url = file_path
                kyc_record.contract_signed_at = datetime.utcnow()
                
            # Update KYC status if not started
            if kyc_record.status == KYCStatus.NOT_STARTED:
                kyc_record.status = KYCStatus.IN_PROGRESS
            
            kyc_record.updated_at = datetime.utcnow()
            self.db.commit()
            
            return {
                'success': True,
                'message': f'{document_type.title()} document uploaded successfully',
                'document_info': {
                    'document_type': document_type,
                    'document_subtype': document_subtype,
                    'filename': file.filename,
                    'uploaded_at': datetime.utcnow().isoformat()
                }
            }
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"Document upload error: {e}")
            return {
                'success': False,
                'error': f'Document upload failed: {str(e)}'
            }

    async def update_kyc_personal_info(
        self,
        consultant_id: str,
        updates: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update KYC personal information"""
        
        try:
            kyc_record = self.db.query(ConsultantKYC).filter(
                ConsultantKYC.consultant_id == consultant_id
            ).first()
            
            if not kyc_record:
                kyc_record = ConsultantKYC(consultant_id=consultant_id)
                self.db.add(kyc_record)
            
            # Update allowed fields
            allowed_fields = [
                'tax_id_number', 'tax_country', 'address_line1', 'address_line2',
                'city', 'state_province', 'postal_code', 'country'
            ]
            
            for field, value in updates.items():
                if field in allowed_fields and value is not None:
                    setattr(kyc_record, field, value)
            
            # Check if address is complete for verification
            if all([
                kyc_record.address_line1,
                kyc_record.city,
                kyc_record.postal_code,
                kyc_record.country
            ]):
                # In production, add address verification logic
                kyc_record.address_verified = True
            
            # Check if tax info is complete
            if kyc_record.tax_id_number and kyc_record.tax_country:
                kyc_record.tax_verified = True
            
            # Update status
            if kyc_record.status == KYCStatus.NOT_STARTED:
                kyc_record.status = KYCStatus.IN_PROGRESS
            
            kyc_record.updated_at = datetime.utcnow()
            self.db.commit()
            
            return {
                'success': True,
                'message': 'Personal information updated successfully'
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                'success': False,
                'error': f'Update failed: {str(e)}'
            }

    async def update_kyc_banking_info(
        self,
        consultant_id: str,
        banking_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Update KYC banking information"""
        
        try:
            kyc_record = self.db.query(ConsultantKYC).filter(
                ConsultantKYC.consultant_id == consultant_id
            ).first()
            
            if not kyc_record:
                kyc_record = ConsultantKYC(consultant_id=consultant_id)
                self.db.add(kyc_record)
            
            # Update banking fields
            kyc_record.bank_account_holder = banking_data.get('bank_account_holder')
            kyc_record.iban = banking_data.get('iban')
            kyc_record.bic_swift = banking_data.get('bic_swift')
            kyc_record.bank_name = banking_data.get('bank_name')
            kyc_record.bank_country = banking_data.get('bank_country')
            
            # Validate IBAN format (basic validation)
            if kyc_record.iban:
                iban_clean = kyc_record.iban.replace(' ', '').upper()
                if len(iban_clean) >= 15 and iban_clean[:2].isalpha():
                    kyc_record.banking_verified = True
                    kyc_record.iban = iban_clean
                else:
                    return {
                        'success': False,
                        'error': 'Invalid IBAN format'
                    }
            
            if kyc_record.status == KYCStatus.NOT_STARTED:
                kyc_record.status = KYCStatus.IN_PROGRESS
            
            kyc_record.updated_at = datetime.utcnow()
            self.db.commit()
            
            return {
                'success': True,
                'message': 'Banking information updated successfully'
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                'success': False,
                'error': f'Banking update failed: {str(e)}'
            }

    async def submit_kyc_for_review(self, consultant_id: str) -> Dict[str, Any]:
        """Submit KYC for admin review"""
        
        try:
            kyc_record = self.db.query(ConsultantKYC).filter(
                ConsultantKYC.consultant_id == consultant_id
            ).first()
            
            if not kyc_record:
                return {
                    'success': False,
                    'error': 'KYC record not found'
                }
            
            # Check if all requirements are met
            requirements_met = all([
                kyc_record.identity_verified,
                kyc_record.tax_verified,
                kyc_record.address_verified,
                kyc_record.banking_verified,
                kyc_record.contract_signed_at is not None
            ])
            
            if not requirements_met:
                return {
                    'success': False,
                    'error': 'All KYC requirements must be completed before submission'
                }
            
            # Update status and consultant
            kyc_record.status = KYCStatus.PENDING_REVIEW
            kyc_record.updated_at = datetime.utcnow()
            
            # Update consultant KYC status
            consultant = self.db.query(Consultant).filter(
                Consultant.id == consultant_id
            ).first()
            
            if consultant:
                consultant.kyc_status = KYCStatus.PENDING_REVIEW
            
            self.db.commit()
            
            return {
                'success': True,
                'message': 'KYC submitted for review successfully'
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                'success': False,
                'error': f'Submission failed: {str(e)}'
            }

    async def get_pending_kyc_reviews(
        self,
        limit: int = 50,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Get all KYC submissions pending review"""
        
        try:
            query = self.db.query(ConsultantKYC).join(Consultant).filter(
                ConsultantKYC.status == KYCStatus.PENDING_REVIEW
            ).order_by(desc(ConsultantKYC.updated_at))
            
            total_count = query.count()
            kyc_records = query.offset(offset).limit(limit).all()
            
            pending_reviews = []
            for kyc_record in kyc_records:
                consultant = self.db.query(Consultant).filter(
                    Consultant.id == kyc_record.consultant_id
                ).first()
                
                pending_reviews.append({
                    'consultant_id': kyc_record.consultant_id,
                    'consultant_name': f"{consultant.first_name} {consultant.last_name}" if consultant else "Unknown",
                    'consultant_email': consultant.email if consultant else None,
                    'kyc_id': kyc_record.id,
                    'submitted_at': kyc_record.updated_at.isoformat(),
                    'days_pending': (datetime.utcnow() - kyc_record.updated_at).days
                })
            
            return {
                'pending_reviews': pending_reviews,
                'total': total_count,
                'limit': limit,
                'offset': offset,
                'has_more': (offset + limit) < total_count
            }
            
        except Exception as e:
            logger.error(f"Get pending reviews error: {e}")
            return {
                'pending_reviews': [],
                'total': 0,
                'error': str(e)
            }

    async def get_kyc_details_for_review(self, consultant_id: str) -> Dict[str, Any]:
        """Get full KYC details for admin review"""
        
        consultant = self.db.query(Consultant).filter(
            Consultant.id == consultant_id
        ).first()
        
        if not consultant:
            return {
                'success': False,
                'error': 'Consultant not found'
            }
        
        kyc_record = self.db.query(ConsultantKYC).filter(
            ConsultantKYC.consultant_id == consultant_id
        ).first()
        
        if not kyc_record:
            return {
                'success': False,
                'error': 'KYC record not found'
            }
        
        return {
            'success': True,
            'kyc_data': {
                'consultant_info': {
                    'id': consultant.id,
                    'name': f"{consultant.first_name} {consultant.last_name}",
                    'email': consultant.email,
                    'linkedin_url': consultant.linkedin_url,
                    'created_at': consultant.created_at.isoformat()
                },
                'kyc_details': {
                    'status': kyc_record.status,
                    'identity': {
                        'document_url': kyc_record.identity_document_url,
                        'document_type': kyc_record.identity_document_type,
                        'verified': kyc_record.identity_verified
                    },
                    'tax': {
                        'document_url': kyc_record.tax_document_url,
                        'tax_id': kyc_record.tax_id_number,
                        'country': kyc_record.tax_country,
                        'verified': kyc_record.tax_verified
                    },
                    'address': {
                        'document_url': kyc_record.address_document_url,
                        'line1': kyc_record.address_line1,
                        'line2': kyc_record.address_line2,
                        'city': kyc_record.city,
                        'state_province': kyc_record.state_province,
                        'postal_code': kyc_record.postal_code,
                        'country': kyc_record.country,
                        'verified': kyc_record.address_verified
                    },
                    'banking': {
                        'account_holder': kyc_record.bank_account_holder,
                        'iban': kyc_record.iban,
                        'bic_swift': kyc_record.bic_swift,
                        'bank_name': kyc_record.bank_name,
                        'bank_country': kyc_record.bank_country,
                        'verified': kyc_record.banking_verified
                    },
                    'contract': {
                        'document_url': kyc_record.contract_document_url,
                        'signed_at': kyc_record.contract_signed_at.isoformat() if kyc_record.contract_signed_at else None,
                        'terms_accepted': kyc_record.terms_accepted,
                        'gdpr_consent': kyc_record.gdpr_consent
                    },
                    'review_history': {
                        'reviewed_by': kyc_record.reviewed_by,
                        'reviewed_at': kyc_record.reviewed_at.isoformat() if kyc_record.reviewed_at else None,
                        'review_notes': kyc_record.review_notes,
                        'rejection_reason': kyc_record.rejection_reason
                    }
                }
            }
        }

    async def review_kyc_submission(
        self,
        consultant_id: str,
        status: str,
        reviewed_by: Optional[str] = None,
        review_notes: Optional[str] = None,
        rejection_reason: Optional[str] = None
    ) -> Dict[str, Any]:
        """Review and approve/reject KYC submission"""
        
        try:
            kyc_record = self.db.query(ConsultantKYC).filter(
                ConsultantKYC.consultant_id == consultant_id
            ).first()
            
            if not kyc_record:
                return {
                    'success': False,
                    'error': 'KYC record not found'
                }
            
            consultant = self.db.query(Consultant).filter(
                Consultant.id == consultant_id
            ).first()
            
            if not consultant:
                return {
                    'success': False,
                    'error': 'Consultant not found'
                }
            
            # Update KYC record
            if status == 'approved':
                kyc_record.status = KYCStatus.APPROVED
                consultant.kyc_status = KYCStatus.APPROVED
                consultant.status = ConsultantStatus.ACTIVE
            else:
                kyc_record.status = KYCStatus.REJECTED
                consultant.kyc_status = KYCStatus.REJECTED
                consultant.status = ConsultantStatus.PENDING
            
            kyc_record.reviewed_by = reviewed_by
            kyc_record.reviewed_at = datetime.utcnow()
            kyc_record.review_notes = review_notes
            kyc_record.rejection_reason = rejection_reason if status == 'rejected' else None
            kyc_record.updated_at = datetime.utcnow()
            
            self.db.commit()
            
            return {
                'success': True,
                'message': f'KYC {status} successfully',
                'new_status': status,
                'consultant_status': consultant.status
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                'success': False,
                'error': f'Review failed: {str(e)}'
            }

    async def get_kyc_statistics(self) -> Dict[str, Any]:
        """Get KYC processing statistics"""
        
        try:
            stats = {}
            
            # Status counts
            for status in KYCStatus:
                count = self.db.query(ConsultantKYC).filter(
                    ConsultantKYC.status == status
                ).count()
                stats[f'kyc_{status.value}'] = count
            
            # Processing times
            approved_records = self.db.query(ConsultantKYC).filter(
                ConsultantKYC.status == KYCStatus.APPROVED,
                ConsultantKYC.reviewed_at.isnot(None)
            ).all()
            
            if approved_records:
                processing_times = [
                    (record.reviewed_at - record.created_at).total_seconds() / 3600  # hours
                    for record in approved_records
                ]
                stats['average_processing_time_hours'] = sum(processing_times) / len(processing_times)
            else:
                stats['average_processing_time_hours'] = 0
            
            # Completion rates
            total_submissions = self.db.query(ConsultantKYC).filter(
                ConsultantKYC.status.in_([KYCStatus.APPROVED, KYCStatus.REJECTED])
            ).count()
            
            approved_count = stats.get('kyc_approved', 0)
            stats['approval_rate'] = (approved_count / total_submissions * 100) if total_submissions > 0 else 0
            
            return stats
            
        except Exception as e:
            logger.error(f"KYC statistics error: {e}")
            return {'error': str(e)}