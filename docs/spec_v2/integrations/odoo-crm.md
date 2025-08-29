# Magnetiq v2 - Odoo CRM Integration Specification

## Overview

The Odoo CRM integration provides seamless lead transfer from whitepaper downloads to Odoo's CRM.lead model. This integration ensures captured leads are automatically synchronized with the customer relationship management system for sales team follow-up and pipeline management.

→ **Business Integration**: [Lead Generation Strategy](../features/lead-generation.md), [Sales Pipeline](../features/sales-pipeline.md)
← **Supports**: [Whitepaper Lead Capture](../frontend/public/features/whitepapers.md#lead-capture), [Admin Lead Management](../adminpanel/admin.md#lead-management)
🔗 **Cross-References**: [Backend API](../backend/api.md#lead-management-api), [Database Schema](../backend/database.md#whitepaper-leads)
⚡ **Dependencies**: [Authentication System](../security.md#api-authentication), [SMTP Integration](smtp-brevo.md#notification-emails)

## Technical Architecture

### Integration Method
- **Direct ORM Integration**: Direct connection to Odoo database using ORM models
- **Batch Processing**: Scheduled synchronization with retry mechanisms
- **Real-time Options**: Webhook-based immediate transfer for high-priority leads
- **Data Validation**: Complete validation before CRM record creation

### Odoo Version Compatibility
- **Odoo 16+**: Primary target version with modern API support
- **Odoo 15**: Backward compatibility with minor adjustments
- **Community/Enterprise**: Compatible with both editions

## Data Mapping

### Lead Data Transformation

#### Magnetiq to Odoo Field Mapping
```python
# Lead mapping configuration
ODOO_LEAD_MAPPING = {
    # Basic Contact Information
    'name': 'name',                          # Contact name
    'email_from': 'email',                   # Primary email
    'phone': 'phone',                        # Phone number
    'contact_name': 'name',                  # Contact name (duplicate for compatibility)
    
    # Company Information
    'partner_name': 'company',               # Company name
    'website': 'website',                    # Company website
    'function': 'job_title',                 # Job title/function
    
    # Lead Classification
    'source_id': 'whitepaper_source_id',     # Lead source (configurable)
    'medium_id': 'utm_medium_id',            # UTM medium mapping
    'campaign_id': 'utm_campaign_id',        # UTM campaign mapping
    
    # Lead Details
    'description': 'lead_description',       # Generated description
    'referred': 'referrer_url',              # Referrer information
    'day_open': 0,                          # Days since creation
    'day_close': 0,                         # Days to close (initial)
    
    # Priority and Scoring
    'priority': 'odoo_priority',             # Calculated from lead score
    'probability': 'probability_score',      # Conversion probability
    
    # Stage and Status
    'stage_id': 'initial_stage_id',          # Initial CRM stage
    'type': 'lead',                          # Record type (lead vs opportunity)
    
    # Geographic Information
    'country_id': 'country_odoo_id',         # Country mapping
    'state_id': 'region_odoo_id',            # State/region mapping
    'city': 'location_city',                 # City information
    
    # Custom Fields (if configured)
    'x_whitepaper_id': 'whitepaper_id',      # Custom field: source whitepaper
    'x_lead_score': 'lead_score',            # Custom field: calculated lead score
    'x_download_source': 'download_source',  # Custom field: download source
    'x_utm_source': 'utm_source',            # Custom field: UTM source
    'x_utm_medium': 'utm_medium',            # Custom field: UTM medium
    'x_utm_campaign': 'utm_campaign',        # Custom field: UTM campaign
    'x_industry': 'industry',                # Custom field: target industry
    'x_company_size': 'company_size',        # Custom field: company size
    'x_consent_marketing': 'marketing_consent', # Custom field: marketing consent
}
```

### Lead Description Generation
```python
def generate_lead_description(lead_data, whitepaper_data):
    """Generate descriptive text for Odoo CRM lead."""
    template = """
Lead generated from whitepaper download: "{whitepaper_title}"

Contact Details:
- Name: {name}
- Email: {email}
- Company: {company}
- Job Title: {job_title}
- Phone: {phone}

Whitepaper Information:
- Title: {whitepaper_title}
- Category: {whitepaper_category}
- Author: {whitepaper_author}
- Download Date: {download_date}

Lead Qualification:
- Lead Score: {lead_score}/100
- Company Size: {company_size}
- Industry: {industry}
- Source: {download_source}

Marketing Attribution:
- UTM Source: {utm_source}
- UTM Medium: {utm_medium}
- UTM Campaign: {utm_campaign}
- Referrer: {referrer_url}

Consent & Preferences:
- Marketing Consent: {'Yes' if marketing_consent else 'No'}
- Privacy Consent: {'Yes' if privacy_consent else 'No'}

Next Steps:
- Follow up within 24-48 hours
- Reference downloaded whitepaper for context
- Assess {whitepaper_category} consulting needs
    """.strip()
    
    return template.format(**{
        **lead_data,
        **whitepaper_data,
        'download_date': lead_data['created_at'].strftime('%Y-%m-%d %H:%M:%S'),
        'marketing_consent': lead_data.get('marketing_consent', False),
        'privacy_consent': lead_data.get('privacy_consent', False),
    })
```

## Integration Implementation

### Odoo Connection Configuration
```python
# Odoo connection settings
ODOO_CONFIG = {
    'host': 'your-odoo-instance.com',
    'port': 443,
    'database': 'your_database_name',
    'username': 'integration_user@company.com',
    'api_key': 'your_api_key',  # Odoo 16+ API key
    'protocol': 'https',
    
    # Connection settings
    'timeout': 30,
    'retry_attempts': 3,
    'retry_delay': 5,  # seconds
    
    # Batch settings
    'batch_size': 50,
    'sync_interval': 300,  # seconds (5 minutes)
    
    # Lead source configuration
    'default_source_id': 123,  # Odoo lead source ID for whitepapers
    'source_name': 'Website - Whitepaper Download',
}
```

### ORM Integration Service
```python
# services/odoo_integration.py
import xmlrpc.client
import logging
from datetime import datetime
from typing import List, Dict, Optional, Tuple
from ..models.whitepaper_leads import WhitepaperLead
from ..models.whitepapers import Whitepaper

class OdooIntegrationService:
    """Service for integrating with Odoo CRM."""
    
    def __init__(self, config: dict):
        self.config = config
        self.logger = logging.getLogger(__name__)
        self._connection = None
        self._user_id = None
    
    def connect(self) -> bool:
        """Establish connection to Odoo instance."""
        try:
            # Common endpoint for authentication
            common = xmlrpc.client.ServerProxy(
                f"{self.config['protocol']}://{self.config['host']}:{self.config['port']}/xmlrpc/2/common"
            )
            
            # Authenticate and get user ID
            self._user_id = common.authenticate(
                self.config['database'],
                self.config['username'],
                self.config['api_key'],
                {}
            )
            
            if not self._user_id:
                raise Exception("Authentication failed")
            
            # Object endpoint for operations
            self._connection = xmlrpc.client.ServerProxy(
                f"{self.config['protocol']}://{self.config['host']}:{self.config['port']}/xmlrpc/2/object"
            )
            
            self.logger.info(f"Connected to Odoo as user ID: {self._user_id}")
            return True
            
        except Exception as e:
            self.logger.error(f"Failed to connect to Odoo: {e}")
            return False
    
    def test_connection(self) -> Dict[str, any]:
        """Test connection and return system information."""
        if not self._connection:
            if not self.connect():
                return {'status': 'error', 'message': 'Failed to connect'}
        
        try:
            # Get Odoo version info
            version_info = self._connection.execute_kw(
                self.config['database'], self._user_id, self.config['api_key'],
                'ir.module.module', 'search_read',
                [[['name', '=', 'crm']]],
                {'fields': ['name', 'state', 'latest_version'], 'limit': 1}
            )
            
            # Test lead creation access
            can_create_leads = self._connection.execute_kw(
                self.config['database'], self._user_id, self.config['api_key'],
                'crm.lead', 'check_access_rights',
                ['create'], {'raise_exception': False}
            )
            
            return {
                'status': 'success',
                'odoo_version': version_info[0]['latest_version'] if version_info else 'Unknown',
                'crm_module_state': version_info[0]['state'] if version_info else 'Unknown',
                'can_create_leads': can_create_leads,
                'user_id': self._user_id
            }
            
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
    
    def export_lead(self, lead: WhitepaperLead, whitepaper: Whitepaper) -> Tuple[bool, str, Optional[int]]:
        """Export a single lead to Odoo CRM."""
        if not self._connection:
            if not self.connect():
                return False, "Failed to connect to Odoo", None
        
        try:
            # Prepare lead data
            odoo_lead_data = self._prepare_lead_data(lead, whitepaper)
            
            # Create lead in Odoo
            odoo_lead_id = self._connection.execute_kw(
                self.config['database'], self._user_id, self.config['api_key'],
                'crm.lead', 'create',
                [odoo_lead_data]
            )
            
            self.logger.info(f"Created Odoo lead {odoo_lead_id} for Magnetiq lead {lead.id}")
            return True, "Success", odoo_lead_id
            
        except Exception as e:
            error_msg = f"Failed to export lead {lead.id}: {e}"
            self.logger.error(error_msg)
            return False, error_msg, None
    
    def export_leads_batch(self, leads: List[Tuple[WhitepaperLead, Whitepaper]]) -> Dict[str, any]:
        """Export multiple leads in batch."""
        if not self._connection:
            if not self.connect():
                return {'success': False, 'message': 'Failed to connect to Odoo'}
        
        results = {
            'total': len(leads),
            'success': 0,
            'failed': 0,
            'errors': []
        }
        
        # Process leads in batches
        batch_size = self.config.get('batch_size', 50)
        for i in range(0, len(leads), batch_size):
            batch = leads[i:i + batch_size]
            batch_data = []
            
            for lead, whitepaper in batch:
                try:
                    odoo_lead_data = self._prepare_lead_data(lead, whitepaper)
                    batch_data.append(odoo_lead_data)
                except Exception as e:
                    results['failed'] += 1
                    results['errors'].append(f"Lead {lead.id}: {e}")
            
            # Create batch in Odoo
            if batch_data:
                try:
                    odoo_lead_ids = self._connection.execute_kw(
                        self.config['database'], self._user_id, self.config['api_key'],
                        'crm.lead', 'create',
                        batch_data
                    )
                    
                    results['success'] += len(odoo_lead_ids)
                    self.logger.info(f"Created {len(odoo_lead_ids)} leads in batch")
                    
                except Exception as e:
                    results['failed'] += len(batch_data)
                    results['errors'].append(f"Batch error: {e}")
        
        return results
    
    def _prepare_lead_data(self, lead: WhitepaperLead, whitepaper: Whitepaper) -> Dict[str, any]:
        """Prepare lead data for Odoo format."""
        # Basic lead data
        lead_data = {
            'name': f"Whitepaper Lead: {lead.name}",
            'contact_name': lead.name,
            'email_from': lead.email,
            'phone': lead.phone or False,
            'partner_name': lead.company or False,
            'website': lead.website or False,
            'function': lead.job_title or False,
            
            # Lead classification
            'source_id': self._get_source_id(lead.download_source),
            'medium_id': self._get_medium_id(lead.utm_medium),
            'campaign_id': self._get_campaign_id(lead.utm_campaign),
            
            # Lead details
            'description': generate_lead_description(
                lead.__dict__, 
                whitepaper.__dict__
            ),
            'referred': lead.referrer_url or False,
            
            # Priority based on lead score
            'priority': self._calculate_priority(lead.lead_score),
            'probability': self._calculate_probability(lead.lead_score),
            
            # Geographic information
            'country_id': self._get_country_id(lead.location_country),
            'state_id': self._get_state_id(lead.location_region),
            'city': lead.location_city or False,
            
            # Stage
            'stage_id': self._get_initial_stage_id(),
            'type': 'lead',
            
            # Custom fields (if configured in Odoo)
            'x_whitepaper_id': whitepaper.id,
            'x_lead_score': lead.lead_score,
            'x_download_source': lead.download_source,
            'x_utm_source': lead.utm_source or False,
            'x_utm_medium': lead.utm_medium or False,
            'x_utm_campaign': lead.utm_campaign or False,
            'x_industry': lead.industry or False,
            'x_company_size': lead.company_size or False,
            'x_consent_marketing': lead.marketing_consent,
        }
        
        # Remove None/False values for cleaner data
        return {k: v for k, v in lead_data.items() if v is not None}
    
    def _get_source_id(self, download_source: str) -> Optional[int]:
        """Get Odoo source ID based on download source."""
        source_mapping = {
            'direct': self.config.get('direct_source_id'),
            'social': self.config.get('social_source_id'), 
            'email': self.config.get('email_source_id'),
            'referral': self.config.get('referral_source_id')
        }
        
        return source_mapping.get(download_source) or self.config.get('default_source_id')
    
    def _get_medium_id(self, utm_medium: Optional[str]) -> Optional[int]:
        """Get Odoo medium ID based on UTM medium."""
        if not utm_medium:
            return None
            
        # This would typically query Odoo for medium IDs
        # For now, return default or None
        return self.config.get('default_medium_id')
    
    def _get_campaign_id(self, utm_campaign: Optional[str]) -> Optional[int]:
        """Get Odoo campaign ID based on UTM campaign."""
        if not utm_campaign:
            return None
            
        # This would typically query Odoo for campaign IDs
        # For now, return default or None
        return self.config.get('default_campaign_id')
    
    def _calculate_priority(self, lead_score: int) -> str:
        """Calculate Odoo priority based on lead score."""
        if lead_score >= 80:
            return '3'  # High
        elif lead_score >= 60:
            return '2'  # Medium
        elif lead_score >= 40:
            return '1'  # Low
        else:
            return '0'  # Very Low
    
    def _calculate_probability(self, lead_score: int) -> int:
        """Calculate conversion probability based on lead score."""
        # Simple linear mapping: 0-100 score -> 0-100% probability
        return min(max(lead_score, 0), 100)
    
    def _get_country_id(self, country_code: Optional[str]) -> Optional[int]:
        """Get Odoo country ID from country code."""
        if not country_code:
            return None
            
        # Cache country mappings for performance
        if not hasattr(self, '_country_cache'):
            self._country_cache = {}
            
        if country_code in self._country_cache:
            return self._country_cache[country_code]
        
        try:
            countries = self._connection.execute_kw(
                self.config['database'], self._user_id, self.config['api_key'],
                'res.country', 'search_read',
                [[['code', '=', country_code.upper()]]],
                {'fields': ['id'], 'limit': 1}
            )
            
            country_id = countries[0]['id'] if countries else None
            self._country_cache[country_code] = country_id
            return country_id
            
        except Exception:
            return None
    
    def _get_state_id(self, region: Optional[str]) -> Optional[int]:
        """Get Odoo state ID from region name."""
        # Similar implementation to country lookup
        return None  # Simplified for now
    
    def _get_initial_stage_id(self) -> int:
        """Get the initial CRM stage ID for new leads."""
        return self.config.get('initial_stage_id', 1)
```

### Automated Synchronization Service
```python
# services/lead_sync_service.py
from typing import List, Dict
from ..services.odoo_integration import OdooIntegrationService
from ..models.whitepaper_leads import WhitepaperLead
from ..models.whitepapers import Whitepaper
from sqlalchemy.orm import Session

class LeadSyncService:
    """Service for automated lead synchronization."""
    
    def __init__(self, db: Session, odoo_service: OdooIntegrationService):
        self.db = db
        self.odoo_service = odoo_service
        self.logger = logging.getLogger(__name__)
    
    async def sync_pending_leads(self) -> Dict[str, any]:
        """Sync all leads that haven't been exported to Odoo."""
        # Get pending leads
        pending_leads = self.db.query(WhitepaperLead).filter(
            WhitepaperLead.export_status == 'pending',
            WhitepaperLead.exported_to_odoo == False
        ).all()
        
        if not pending_leads:
            return {'status': 'success', 'message': 'No pending leads to sync'}
        
        # Prepare leads with whitepaper data
        lead_data = []
        for lead in pending_leads:
            whitepaper = self.db.query(Whitepaper).filter(
                Whitepaper.id == lead.whitepaper_id
            ).first()
            
            if whitepaper:
                lead_data.append((lead, whitepaper))
            else:
                # Mark as failed if whitepaper not found
                lead.export_status = 'failed'
                lead.export_error = 'Whitepaper not found'
                self.db.commit()
        
        # Export to Odoo
        results = self.odoo_service.export_leads_batch(lead_data)
        
        # Update lead statuses
        success_count = 0
        for i, (lead, whitepaper) in enumerate(lead_data):
            if i < results.get('success', 0):
                lead.exported_to_odoo = True
                lead.export_status = 'success'
                lead.exported_at = datetime.utcnow()
                success_count += 1
            else:
                lead.export_status = 'failed'
                lead.export_error = 'Batch export failed'
        
        self.db.commit()
        
        return {
            'status': 'success',
            'total_leads': len(pending_leads),
            'synced_leads': success_count,
            'failed_leads': len(pending_leads) - success_count,
            'errors': results.get('errors', [])
        }
    
    async def retry_failed_leads(self, max_retries: int = 3) -> Dict[str, any]:
        """Retry exporting leads that previously failed."""
        # Get failed leads that haven't exceeded retry limit
        failed_leads = self.db.query(WhitepaperLead).filter(
            WhitepaperLead.export_status == 'failed',
            WhitepaperLead.retry_count < max_retries
        ).all()
        
        results = {'retried': 0, 'success': 0, 'still_failed': 0}
        
        for lead in failed_leads:
            whitepaper = self.db.query(Whitepaper).filter(
                Whitepaper.id == lead.whitepaper_id
            ).first()
            
            if not whitepaper:
                continue
                
            # Attempt export
            success, message, odoo_lead_id = self.odoo_service.export_lead(lead, whitepaper)
            
            lead.retry_count = getattr(lead, 'retry_count', 0) + 1
            results['retried'] += 1
            
            if success:
                lead.exported_to_odoo = True
                lead.export_status = 'success'
                lead.exported_at = datetime.utcnow()
                lead.odoo_lead_id = odoo_lead_id
                results['success'] += 1
            else:
                lead.export_error = message
                results['still_failed'] += 1
        
        self.db.commit()
        return results
```

## API Endpoints

### Admin Lead Export Endpoints
```python
# api/v1/admin/leads.py
@router.post("/leads/{lead_id}/export-odoo")
async def export_lead_to_odoo(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin_user),
    odoo_service: OdooIntegrationService = Depends(get_odoo_service)
):
    """Export individual lead to Odoo CRM."""
    
    # Get lead and whitepaper
    lead = db.query(WhitepaperLead).filter(WhitepaperLead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    
    whitepaper = db.query(Whitepaper).filter(Whitepaper.id == lead.whitepaper_id).first()
    if not whitepaper:
        raise HTTPException(status_code=404, detail="Associated whitepaper not found")
    
    # Export to Odoo
    success, message, odoo_lead_id = odoo_service.export_lead(lead, whitepaper)
    
    # Update lead status
    if success:
        lead.exported_to_odoo = True
        lead.export_status = 'success'
        lead.exported_at = datetime.utcnow()
        lead.odoo_lead_id = odoo_lead_id
    else:
        lead.export_status = 'failed'
        lead.export_error = message
    
    db.commit()
    
    return {
        "success": success,
        "message": message,
        "odoo_lead_id": odoo_lead_id,
        "lead_id": lead_id
    }

@router.post("/leads/bulk-export")
async def bulk_export_leads(
    request: BulkExportRequest,
    db: Session = Depends(get_db),
    current_user: AdminUser = Depends(get_current_admin_user),
    sync_service: LeadSyncService = Depends(get_sync_service)
):
    """Bulk export selected leads to Odoo CRM."""
    
    # Get selected leads
    leads = db.query(WhitepaperLead).filter(
        WhitepaperLead.id.in_(request.lead_ids)
    ).all()
    
    if not leads:
        raise HTTPException(status_code=404, detail="No leads found")
    
    # Prepare lead data
    lead_data = []
    for lead in leads:
        whitepaper = db.query(Whitepaper).filter(
            Whitepaper.id == lead.whitepaper_id
        ).first()
        if whitepaper:
            lead_data.append((lead, whitepaper))
    
    # Export batch
    results = await sync_service.odoo_service.export_leads_batch(lead_data)
    
    # Update statuses (simplified)
    for lead in leads:
        if results['success'] > 0:
            lead.exported_to_odoo = True
            lead.export_status = 'success'
            lead.exported_at = datetime.utcnow()
        else:
            lead.export_status = 'failed'
    
    db.commit()
    
    return {
        "total_leads": len(leads),
        "results": results
    }
```

## Error Handling and Logging

### Error Types and Handling
```python
class OdooIntegrationError(Exception):
    """Base exception for Odoo integration errors."""
    pass

class OdooConnectionError(OdooIntegrationError):
    """Odoo connection or authentication error."""
    pass

class OdooDataValidationError(OdooIntegrationError):
    """Odoo data validation error."""
    pass

class OdooAPIError(OdooIntegrationError):
    """Odoo API operation error."""
    pass

# Error handling with retry logic
def with_retry(max_attempts=3, delay=5):
    """Decorator for retrying Odoo operations."""
    def decorator(func):
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except (OdooConnectionError, OdooAPIError) as e:
                    if attempt == max_attempts - 1:
                        raise e
                    time.sleep(delay * (attempt + 1))
            return None
        return wrapper
    return decorator
```

## Configuration Management

### Environment Variables
```bash
# Odoo CRM Integration Configuration
ODOO_HOST=your-odoo-instance.com
ODOO_PORT=443
ODOO_DATABASE=your_database_name
ODOO_USERNAME=integration_user@company.com
ODOO_API_KEY=your_api_key
ODOO_PROTOCOL=https

# Integration Settings
ODOO_BATCH_SIZE=50
ODOO_SYNC_INTERVAL=300
ODOO_RETRY_ATTEMPTS=3
ODOO_RETRY_DELAY=5
ODOO_CONNECTION_TIMEOUT=30

# Lead Source Configuration
ODOO_DEFAULT_SOURCE_ID=123
ODOO_DIRECT_SOURCE_ID=124
ODOO_SOCIAL_SOURCE_ID=125
ODOO_EMAIL_SOURCE_ID=126
ODOO_REFERRAL_SOURCE_ID=127

# CRM Stage Configuration
ODOO_INITIAL_STAGE_ID=1
ODOO_QUALIFIED_STAGE_ID=2
```

### Admin Configuration Interface
```typescript
// Admin panel configuration for Odoo integration
interface OdooIntegrationConfig {
  connection: {
    host: string;
    database: string;
    username: string;
    apiKey: string;
    testConnection: () => Promise<ConnectionTestResult>;
  };
  
  synchronization: {
    enableAutoSync: boolean;
    syncInterval: number; // minutes
    batchSize: number;
    retryAttempts: number;
  };
  
  leadSources: {
    defaultSourceId: number;
    directSourceId: number;
    socialSourceId: number;
    emailSourceId: number;
    referralSourceId: number;
  };
  
  stages: {
    initialStageId: number;
    qualifiedStageId: number;
  };
  
  fieldMapping: {
    customFields: Record<string, string>;
    enableCustomFields: boolean;
  };
}
```

## Monitoring and Analytics

### Integration Health Monitoring
```python
# Monitoring metrics for Odoo integration
class OdooIntegrationMonitor:
    def __init__(self):
        self.metrics = {
            'total_exports': 0,
            'successful_exports': 0,
            'failed_exports': 0,
            'connection_failures': 0,
            'last_sync_time': None,
            'average_sync_duration': 0,
            'retry_count': 0
        }
    
    def record_export_attempt(self, success: bool, duration: float):
        """Record export attempt metrics."""
        self.metrics['total_exports'] += 1
        if success:
            self.metrics['successful_exports'] += 1
        else:
            self.metrics['failed_exports'] += 1
        
        # Update average duration
        total_time = (self.metrics['average_sync_duration'] * 
                     (self.metrics['total_exports'] - 1) + duration)
        self.metrics['average_sync_duration'] = total_time / self.metrics['total_exports']
    
    def get_health_status(self) -> Dict[str, any]:
        """Get current integration health status."""
        total = self.metrics['total_exports']
        if total == 0:
            success_rate = 0
        else:
            success_rate = (self.metrics['successful_exports'] / total) * 100
        
        health_status = 'healthy' if success_rate >= 95 else 'warning' if success_rate >= 80 else 'critical'
        
        return {
            'status': health_status,
            'success_rate': round(success_rate, 2),
            'total_exports': total,
            'failed_exports': self.metrics['failed_exports'],
            'last_sync': self.metrics['last_sync_time'],
            'average_duration': round(self.metrics['average_sync_duration'], 2)
        }
```

## Testing Strategy

### Integration Testing
```python
# tests/test_odoo_integration.py
class TestOdooIntegration:
    def test_connection(self):
        """Test Odoo connection and authentication."""
        service = OdooIntegrationService(test_config)
        assert service.connect() == True
        
        status = service.test_connection()
        assert status['status'] == 'success'
        assert status['can_create_leads'] == True
    
    def test_lead_export(self):
        """Test individual lead export."""
        # Create test lead and whitepaper
        lead = create_test_lead()
        whitepaper = create_test_whitepaper()
        
        service = OdooIntegrationService(test_config)
        success, message, odoo_id = service.export_lead(lead, whitepaper)
        
        assert success == True
        assert odoo_id is not None
        assert isinstance(odoo_id, int)
    
    def test_batch_export(self):
        """Test batch lead export."""
        leads = [create_test_lead() for _ in range(10)]
        whitepapers = [create_test_whitepaper() for _ in range(10)]
        
        service = OdooIntegrationService(test_config)
        results = service.export_leads_batch(list(zip(leads, whitepapers)))
        
        assert results['success'] == 10
        assert results['failed'] == 0
    
    def test_error_handling(self):
        """Test error handling for invalid data."""
        invalid_lead = create_invalid_lead()  # Missing required fields
        whitepaper = create_test_whitepaper()
        
        service = OdooIntegrationService(test_config)
        success, message, odoo_id = service.export_lead(invalid_lead, whitepaper)
        
        assert success == False
        assert 'validation' in message.lower()
        assert odoo_id is None
```

## Security Considerations

### API Security
- **API Key Management**: Secure storage and rotation of Odoo API keys
- **Network Security**: HTTPS-only communication with certificate validation
- **Access Control**: Dedicated Odoo user with minimal required permissions
- **Data Validation**: Input sanitization before sending to Odoo

### Privacy Compliance
- **Data Minimization**: Only export necessary lead information
- **Consent Tracking**: Respect user consent preferences for data sharing
- **Right to Erasure**: Support for deleting leads from Odoo when requested
- **Audit Trail**: Complete logging of all data exports for compliance

## Performance Optimization

### Optimization Strategies
- **Batch Processing**: Export leads in configurable batches
- **Connection Pooling**: Reuse Odoo connections for multiple operations
- **Caching**: Cache Odoo metadata (countries, sources, stages)
- **Asynchronous Processing**: Non-blocking lead export operations
- **Retry Logic**: Intelligent retry with exponential backoff

### Monitoring and Alerts
- **Export Success Rate**: Alert if success rate drops below threshold
- **Sync Duration**: Monitor and alert on unusually long sync times
- **Connection Health**: Regular health checks with notification on failures
- **Queue Length**: Alert if pending export queue grows too large

## Deployment and Maintenance

### Deployment Steps
1. **Odoo Configuration**: Create integration user and configure permissions
2. **Custom Fields**: Add custom fields to Odoo CRM.lead model if needed
3. **Lead Sources**: Configure lead sources in Odoo for proper attribution
4. **Environment Setup**: Configure environment variables and connection settings
5. **Testing**: Run integration tests against staging Odoo environment
6. **Monitoring Setup**: Configure health checks and alerting
7. **Production Deployment**: Deploy with gradual rollout

### Ongoing Maintenance
- **Regular Health Checks**: Monitor integration performance and success rates
- **API Key Rotation**: Periodic rotation of Odoo API keys
- **Version Updates**: Keep compatible with Odoo version updates
- **Performance Tuning**: Optimize batch sizes and sync intervals based on usage
- **Data Quality**: Regular audits of exported lead data quality

## Cross-References

### Related Specifications
→ **Database Schema**: [Whitepaper Leads Table](../backend/database.md#whitepaper-leads)
→ **API Endpoints**: [Lead Management API](../backend/api.md#lead-management-api)
→ **Admin Panel**: [Lead Management Interface](../frontend/adminpanel/admin.md#lead-management)
← **Lead Capture**: [Whitepaper Downloads](../frontend/public/features/whitepapers.md#lead-capture-system)
↔️ **Email Integration**: [SMTP-Brevo Notifications](smtp-brevo.md#lead-notifications)

### Business Impact
- **Lead Quality**: Automated lead scoring and qualification before CRM export
- **Sales Efficiency**: Immediate lead availability in sales team's CRM workflow
- **Attribution**: Complete marketing attribution through UTM and source tracking
- **Compliance**: GDPR-compliant lead handling with consent tracking

This comprehensive Odoo CRM integration specification ensures seamless lead transfer from whitepaper downloads to the sales team's CRM system, maintaining data quality, security, and performance while providing complete visibility into the lead generation pipeline.