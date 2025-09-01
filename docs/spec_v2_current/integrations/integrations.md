# Magnetiq v2 - Integrations Specification

## Overview

Magnetiq v2 integrates with multiple third-party services to provide comprehensive business automation. This specification details all external integrations, their implementation patterns, error handling, and management interfaces.

## Integration Architecture

### Design Principles
- **Service-oriented approach**: Each integration is encapsulated in its own service class
- **Async operations**: All external API calls are asynchronous with proper timeout handling
- **Retry logic**: Exponential backoff with configurable retry limits
- **Circuit breaker pattern**: Prevent cascading failures from external service issues
- **Comprehensive logging**: All integration activities are logged with detailed context
- **Security first**: All credentials are encrypted and managed securely

### Common Integration Patterns

#### Base Integration Service
```python
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import asyncio
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

class BaseIntegrationService(ABC):
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.logger = logging.getLogger(f"integration.{self.__class__.__name__}")
        self.is_enabled = config.get('enabled', False)
        
    @abstractmethod
    async def test_connection(self) -> Dict[str, Any]:
        """Test the integration connection and return status."""
        pass
    
    @retry(
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=4, max=60)
    )
    async def make_request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        """Make authenticated request to external service."""
        pass
    
    async def log_integration_activity(
        self, 
        operation: str, 
        status: str, 
        **metadata
    ) -> None:
        """Log integration activity to database."""
        # Implementation in backend/services/integration_logger.py
        pass
```

## Odoo ERP Integration

### Overview
Bidirectional integration with Odoo for CRM, Events, and Products synchronization.

### Configuration
```python
class OdooConfig:
    URL: str = "https://odoo.voltAIc.systems"
    DATABASE: str = "voltaic_production"
    USERNAME: str = "api_user"
    API_KEY: str = "encrypted_api_key"
    VERSION: str = "16.0"
    TIMEOUT: int = 30
    SYNC_INTERVAL_MINUTES: int = 60
```

### Odoo Service Implementation
```python
import xmlrpc.client
from typing import List, Dict, Any, Optional

class OdooIntegrationService(BaseIntegrationService):
    def __init__(self, config: OdooConfig):
        super().__init__(config.__dict__)
        self.url = config.URL
        self.database = config.DATABASE
        self.username = config.USERNAME
        self.api_key = config.API_KEY
        self.uid = None
        
    async def authenticate(self) -> bool:
        """Authenticate with Odoo and get user ID."""
        try:
            common = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/common')
            self.uid = common.authenticate(
                self.database, 
                self.username, 
                self.api_key, 
                {}
            )
            return self.uid is not None
        except Exception as e:
            await self.log_integration_activity(
                'authenticate', 'error', 
                error=str(e)
            )
            return False
    
    async def test_connection(self) -> Dict[str, Any]:
        """Test Odoo connection."""
        try:
            is_authenticated = await self.authenticate()
            if is_authenticated:
                # Test basic read operation
                models = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/object')
                result = models.execute_kw(
                    self.database, self.uid, self.api_key,
                    'res.users', 'read', [self.uid], {'fields': ['name']}
                )
                return {
                    'status': 'healthy',
                    'user': result[0]['name'] if result else None,
                    'version': await self.get_odoo_version()
                }
            else:
                return {'status': 'error', 'message': 'Authentication failed'}
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
```

### Lead Synchronization
```python
async def create_lead(self, lead_data: Dict[str, Any]) -> Optional[int]:
    """Create lead in Odoo CRM."""
    try:
        await self.authenticate()
        models = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/object')
        
        # Map Magnetiq lead to Odoo lead format
        odoo_lead = {
            'name': f"Website Lead - {lead_data['name']}",
            'contact_name': lead_data['name'],
            'email_from': lead_data['email'],
            'phone': lead_data.get('phone'),
            'partner_name': lead_data.get('company'),
            'website': lead_data.get('website'),
            'description': f"Lead from whitepaper download: {lead_data.get('whitepaper_title', '')}",
            'source_id': await self.get_source_id('Website'),
            'medium_id': await self.get_medium_id('Whitepaper Download'),
            'tag_ids': [(6, 0, [await self.get_tag_id('Magnetiq Lead')])],
        }
        
        lead_id = models.execute_kw(
            self.database, self.uid, self.api_key,
            'crm.lead', 'create', [odoo_lead]
        )
        
        await self.log_integration_activity(
            'create_lead', 'success',
            lead_id=lead_id,
            magnetiq_lead_id=lead_data['id']
        )
        
        return lead_id
        
    except Exception as e:
        await self.log_integration_activity(
            'create_lead', 'error',
            error=str(e),
            lead_data=lead_data
        )
        return None

async def sync_leads_to_odoo(self, limit: int = 100) -> Dict[str, Any]:
    """Sync unsent leads to Odoo."""
    from services.lead_service import LeadService
    
    lead_service = LeadService()
    unsent_leads = await lead_service.get_unsent_leads(limit=limit)
    
    results = {
        'processed': 0,
        'successful': 0,
        'failed': 0,
        'errors': []
    }
    
    for lead in unsent_leads:
        results['processed'] += 1
        
        odoo_lead_id = await self.create_lead(lead.to_dict())
        
        if odoo_lead_id:
            await lead_service.mark_as_exported(
                lead.id, 
                odoo_lead_id=odoo_lead_id
            )
            results['successful'] += 1
        else:
            results['failed'] += 1
            results['errors'].append(f"Failed to sync lead {lead.id}")
    
    return results
```

### Event Synchronization
```python
async def create_webinar_event(self, webinar_session: Dict[str, Any]) -> Optional[int]:
    """Create Odoo event for webinar session."""
    try:
        await self.authenticate()
        models = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/object')
        
        odoo_event = {
            'name': webinar_session['title']['en'],
            'date_begin': webinar_session['datetime'].isoformat(),
            'date_end': (
                webinar_session['datetime'] + 
                timedelta(minutes=webinar_session['duration'])
            ).isoformat(),
            'seats_max': webinar_session.get('capacity'),
            'event_type_id': await self.get_event_type_id('Webinar'),
            'website_published': webinar_session['status'] == 'published',
            'description': webinar_session['description']['en'],
            'address': 'Online Event',
            'tag_ids': [(6, 0, [await self.get_tag_id('Webinar')])],
        }
        
        event_id = models.execute_kw(
            self.database, self.uid, self.api_key,
            'event.event', 'create', [odoo_event]
        )
        
        return event_id
        
    except Exception as e:
        await self.log_integration_activity(
            'create_webinar_event', 'error',
            error=str(e),
            webinar_id=webinar_session['id']
        )
        return None

async def sync_webinar_registrations(self, session_id: str) -> Dict[str, Any]:
    """Sync webinar registrations to Odoo event registrations."""
    from services.webinar_service import WebinarService
    
    webinar_service = WebinarService()
    registrations = await webinar_service.get_session_registrations(session_id)
    
    results = {'successful': 0, 'failed': 0, 'errors': []}
    
    for registration in registrations:
        try:
            await self.authenticate()
            models = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/object')
            
            # Create partner if doesn't exist
            partner_id = await self.find_or_create_partner(
                registration.email,
                registration.first_name + ' ' + registration.last_name,
                registration.company
            )
            
            # Create event registration
            registration_data = {
                'event_id': registration.session.odoo_event_id,
                'partner_id': partner_id,
                'email': registration.email,
                'phone': registration.phone,
                'state': 'open' if registration.status == 'confirmed' else 'cancel'
            }
            
            reg_id = models.execute_kw(
                self.database, self.uid, self.api_key,
                'event.registration', 'create', [registration_data]
            )
            
            results['successful'] += 1
            
        except Exception as e:
            results['failed'] += 1
            results['errors'].append(str(e))
    
    return results
```

### Product Synchronization
```python
async def sync_webinar_topics_from_odoo(self) -> Dict[str, Any]:
    """Import webinar topics from Odoo product catalog."""
    try:
        await self.authenticate()
        models = xmlrpc.client.ServerProxy(f'{self.url}/xmlrpc/2/object')
        
        # Get webinar products from Odoo
        product_ids = models.execute_kw(
            self.database, self.uid, self.api_key,
            'product.template', 'search', 
            [[('categ_id.name', '=', 'Webinars')]]
        )
        
        products = models.execute_kw(
            self.database, self.uid, self.api_key,
            'product.template', 'read', 
            [product_ids], 
            {'fields': ['name', 'description', 'list_price', 'default_code']}
        )
        
        from services.webinar_service import WebinarService
        webinar_service = WebinarService()
        
        synced_count = 0
        
        for product in products:
            # Check if topic already exists
            existing_topic = await webinar_service.get_topic_by_odoo_id(product['id'])
            
            if not existing_topic:
                topic_data = {
                    'title': {'en': product['name'], 'de': product['name']},
                    'description': {'en': product['description'] or '', 'de': ''},
                    'default_price': product['list_price'],
                    'odoo_product_id': product['id'],
                    'category': 'Imported from Odoo'
                }
                
                await webinar_service.create_topic(topic_data)
                synced_count += 1
        
        return {'status': 'success', 'synced_count': synced_count}
        
    except Exception as e:
        return {'status': 'error', 'message': str(e)}
```

## Google Calendar Integration

### Overview
Integration with Google Calendar API for consultant availability checking and automatic meeting creation.

### Google Calendar Service Implementation
```python
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
from google_auth_oauthlib.flow import Flow

class GoogleCalendarService(BaseIntegrationService):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.scopes = ['https://www.googleapis.com/auth/calendar']
        self.credentials = None
        self.service = None
    
    async def get_authorization_url(self) -> str:
        """Get OAuth authorization URL for initial setup."""
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": self.config['client_id'],
                    "client_secret": self.config['client_secret'],
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [self.config['redirect_uri']]
                }
            },
            scopes=self.scopes
        )
        
        flow.redirect_uri = self.config['redirect_uri']
        auth_url, _ = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        
        return auth_url
    
    async def exchange_code_for_tokens(self, auth_code: str) -> Dict[str, Any]:
        """Exchange authorization code for access tokens."""
        try:
            flow = Flow.from_client_config(
                {
                    "web": {
                        "client_id": self.config['client_id'],
                        "client_secret": self.config['client_secret'],
                        "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                        "token_uri": "https://oauth2.googleapis.com/token"
                    }
                },
                scopes=self.scopes
            )
            
            flow.redirect_uri = self.config['redirect_uri']
            flow.fetch_token(code=auth_code)
            
            # Store credentials securely
            credentials_data = {
                'token': flow.credentials.token,
                'refresh_token': flow.credentials.refresh_token,
                'token_uri': flow.credentials.token_uri,
                'client_id': flow.credentials.client_id,
                'client_secret': flow.credentials.client_secret,
                'scopes': flow.credentials.scopes
            }
            
            await self.store_credentials(credentials_data)
            
            return {
                'status': 'success',
                'message': 'Calendar integration configured successfully'
            }
            
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
    
    async def load_credentials(self) -> bool:
        """Load stored credentials and refresh if needed."""
        try:
            # Load from secure storage (database/vault)
            credentials_data = await self.get_stored_credentials()
            
            if not credentials_data:
                return False
            
            self.credentials = Credentials.from_authorized_user_info(credentials_data)
            
            # Refresh token if expired
            if self.credentials.expired and self.credentials.refresh_token:
                self.credentials.refresh(Request())
                await self.store_credentials(self.credentials.to_json())
            
            self.service = build('calendar', 'v3', credentials=self.credentials)
            return True
            
        except Exception as e:
            await self.log_integration_activity(
                'load_credentials', 'error', 
                error=str(e)
            )
            return False
```

### Availability Checking
```python
async def check_consultant_availability(
    self,
    consultant_calendar_id: str,
    start_time: datetime,
    end_time: datetime
) -> Dict[str, Any]:
    """Check if consultant is available for booking."""
    try:
        if not await self.load_credentials():
            return {'available': True, 'note': 'Calendar not configured'}
        
        # Query calendar for events in the time range
        events_result = self.service.events().list(
            calendarId=consultant_calendar_id,
            timeMin=start_time.isoformat(),
            timeMax=end_time.isoformat(),
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])
        
        # Check for conflicts
        conflicts = []
        for event in events:
            event_start = event['start'].get('dateTime', event['start'].get('date'))
            event_end = event['end'].get('dateTime', event['end'].get('date'))
            
            conflicts.append({
                'title': event.get('summary', 'Busy'),
                'start': event_start,
                'end': event_end
            })
        
        is_available = len(conflicts) == 0
        
        await self.log_integration_activity(
            'check_availability', 'success',
            consultant_calendar_id=consultant_calendar_id,
            requested_start=start_time.isoformat(),
            requested_end=end_time.isoformat(),
            available=is_available,
            conflicts_count=len(conflicts)
        )
        
        return {
            'available': is_available,
            'conflicts': conflicts,
            'message': 'Available' if is_available else f'{len(conflicts)} conflict(s) found'
        }
        
    except Exception as e:
        await self.log_integration_activity(
            'check_availability', 'error',
            error=str(e),
            consultant_calendar_id=consultant_calendar_id
        )
        return {
            'available': True,  # Fail open - allow booking if check fails
            'note': 'Calendar check failed, assuming available'
        }

async def create_booking_event(self, booking_data: Dict[str, Any]) -> Optional[str]:
    """Create calendar event for confirmed booking."""
    try:
        if not await self.load_credentials():
            return None
        
        event = {
            'summary': f'Consultation - {booking_data["client_name"]}',
            'description': (
                f"Consultation with {booking_data['client_name']}\n"
                f"Company: {booking_data.get('client_company', 'N/A')}\n"
                f"Email: {booking_data['client_email']}\n"
                f"Phone: {booking_data.get('client_phone', 'N/A')}\n\n"
                f"Message:\n{booking_data.get('message', 'No specific message')}\n\n"
                f"Booking Reference: {booking_data['reference']}"
            ),
            'start': {
                'dateTime': booking_data['datetime'].isoformat(),
                'timeZone': booking_data['timezone']
            },
            'end': {
                'dateTime': (
                    booking_data['datetime'] + 
                    timedelta(minutes=booking_data['duration'])
                ).isoformat(),
                'timeZone': booking_data['timezone']
            },
            'attendees': [
                {'email': booking_data['consultant_email']},
                {'email': booking_data['client_email']}
            ],
            'conferenceData': {
                'createRequest': {
                    'requestId': f"booking-{booking_data['id']}",
                    'conferenceSolutionKey': {'type': 'hangoutsMeet'}
                }
            } if booking_data.get('meeting_type') == 'video' else None,
            'reminders': {
                'useDefault': False,
                'overrides': [
                    {'method': 'email', 'minutes': 24 * 60},  # 1 day before
                    {'method': 'popup', 'minutes': 30}        # 30 min before
                ]
            }
        }
        
        created_event = self.service.events().insert(
            calendarId=booking_data['consultant_calendar_id'],
            body=event,
            conferenceDataVersion=1 if booking_data.get('meeting_type') == 'video' else 0
        ).execute()
        
        await self.log_integration_activity(
            'create_booking_event', 'success',
            booking_id=booking_data['id'],
            event_id=created_event['id'],
            consultant_calendar_id=booking_data['consultant_calendar_id']
        )
        
        return created_event['id']
        
    except Exception as e:
        await self.log_integration_activity(
            'create_booking_event', 'error',
            error=str(e),
            booking_id=booking_data.get('id')
        )
        return None
```

### Multi-Week Availability
```python
async def get_multi_week_availability(
    self,
    consultant_calendar_ids: List[str],
    weeks: int = 4,
    start_date: Optional[date] = None
) -> Dict[str, Any]:
    """Get availability across multiple weeks for consultants."""
    if start_date is None:
        start_date = date.today()
    
    end_date = start_date + timedelta(weeks=weeks)
    
    availability = {}
    
    for calendar_id in consultant_calendar_ids:
        try:
            # Get all events for the period
            events_result = self.service.events().list(
                calendarId=calendar_id,
                timeMin=datetime.combine(start_date, datetime.min.time()).isoformat() + 'Z',
                timeMax=datetime.combine(end_date, datetime.min.time()).isoformat() + 'Z',
                singleEvents=True,
                orderBy='startTime'
            ).execute()
            
            events = events_result.get('items', [])
            
            # Generate daily availability
            daily_availability = {}
            current_date = start_date
            
            while current_date < end_date:
                day_events = [
                    event for event in events
                    if self.event_on_date(event, current_date)
                ]
                
                # Assume working hours 9 AM - 5 PM (configurable per consultant)
                working_start = datetime.combine(current_date, time(9, 0))
                working_end = datetime.combine(current_date, time(17, 0))
                
                # Calculate available time slots
                available_slots = self.calculate_available_slots(
                    working_start, working_end, day_events
                )
                
                daily_availability[current_date.isoformat()] = {
                    'available_slots': available_slots,
                    'total_events': len(day_events),
                    'is_weekend': current_date.weekday() >= 5
                }
                
                current_date += timedelta(days=1)
            
            availability[calendar_id] = daily_availability
            
        except Exception as e:
            availability[calendar_id] = {
                'error': str(e),
                'message': 'Failed to fetch availability'
            }
    
    return availability
```

## Email Service Integration

### SMTP Configuration
```python
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import aiosmtplib

class EmailService(BaseIntegrationService):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.smtp_host = config['host']
        self.smtp_port = config['port']
        self.username = config['username']
        self.password = config['password']
        self.from_email = config['from_email']
        self.from_name = config['from_name']
    
    async def test_connection(self) -> Dict[str, Any]:
        """Test SMTP connection."""
        try:
            await aiosmtplib.connect(
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.username,
                password=self.password,
                timeout=10
            )
            return {'status': 'healthy', 'message': 'SMTP connection successful'}
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
```

### Email Templates
```python
class EmailTemplateService:
    def __init__(self):
        self.templates = {
            'booking_confirmation': {
                'en': {
                    'subject': 'Consultation Confirmed - {reference}',
                    'template': 'templates/booking_confirmation_en.html'
                },
                'de': {
                    'subject': 'Beratungstermin bestätigt - {reference}',
                    'template': 'templates/booking_confirmation_de.html'
                }
            },
            'webinar_registration': {
                'en': {
                    'subject': 'Webinar Registration Confirmed - {webinar_title}',
                    'template': 'templates/webinar_registration_en.html'
                },
                'de': {
                    'subject': 'Webinar-Anmeldung bestätigt - {webinar_title}',
                    'template': 'templates/webinar_registration_de.html'
                }
            },
            'webinar_reminder': {
                'en': {
                    'subject': 'Webinar Reminder - {webinar_title} starts {when}',
                    'template': 'templates/webinar_reminder_en.html'
                },
                'de': {
                    'subject': 'Webinar-Erinnerung - {webinar_title} beginnt {when}',
                    'template': 'templates/webinar_reminder_de.html'
                }
            }
        }
    
    async def render_template(
        self,
        template_name: str,
        language: str,
        context: Dict[str, Any]
    ) -> Dict[str, str]:
        """Render email template with context data."""
        template_config = self.templates.get(template_name, {}).get(language, {})
        
        if not template_config:
            raise ValueError(f"Template {template_name} not found for language {language}")
        
        # Load and render template
        with open(template_config['template'], 'r', encoding='utf-8') as f:
            template_content = f.read()
        
        # Simple template rendering (use Jinja2 for more complex needs)
        rendered_content = template_content.format(**context)
        rendered_subject = template_config['subject'].format(**context)
        
        return {
            'subject': rendered_subject,
            'html_content': rendered_content
        }

async def send_booking_confirmation(
    self,
    booking: Dict[str, Any],
    language: str = 'en'
) -> bool:
    """Send booking confirmation email."""
    try:
        template_service = EmailTemplateService()
        
        context = {
            'client_name': booking['client_name'],
            'consultant_name': booking['consultant_name'],
            'datetime': booking['datetime'].strftime('%Y-%m-%d %H:%M'),
            'timezone': booking['timezone'],
            'duration': booking['duration'],
            'reference': booking['reference'],
            'meeting_url': booking.get('meeting_url', ''),
            'company_name': 'voltAIc Systems'
        }
        
        email_content = await template_service.render_template(
            'booking_confirmation', language, context
        )
        
        # Send email
        success = await self.send_email(
            to=booking['client_email'],
            subject=email_content['subject'],
            html_content=email_content['html_content']
        )
        
        await self.log_integration_activity(
            'send_booking_confirmation', 
            'success' if success else 'error',
            booking_id=booking['id'],
            recipient=booking['client_email']
        )
        
        return success
        
    except Exception as e:
        await self.log_integration_activity(
            'send_booking_confirmation', 'error',
            error=str(e),
            booking_id=booking.get('id')
        )
        return False
```

## Payment Gateway Integration (Future)

### Stripe Integration Preparation
```python
class StripeService(BaseIntegrationService):
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        import stripe
        stripe.api_key = config['secret_key']
        self.stripe = stripe
        self.webhook_secret = config['webhook_secret']
    
    async def create_payment_intent(
        self,
        amount: int,
        currency: str = 'eur',
        metadata: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        """Create payment intent for webinar registration."""
        try:
            intent = self.stripe.PaymentIntent.create(
                amount=amount,  # in cents
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={'enabled': True}
            )
            
            return {
                'client_secret': intent.client_secret,
                'payment_intent_id': intent.id,
                'status': intent.status
            }
            
        except Exception as e:
            await self.log_integration_activity(
                'create_payment_intent', 'error',
                error=str(e),
                amount=amount,
                currency=currency
            )
            return {'error': str(e)}
    
    async def handle_webhook(self, payload: bytes, signature: str) -> Dict[str, Any]:
        """Handle Stripe webhook events."""
        try:
            event = self.stripe.Webhook.construct_event(
                payload, signature, self.webhook_secret
            )
            
            if event['type'] == 'payment_intent.succeeded':
                payment_intent = event['data']['object']
                # Update webinar registration status
                await self.update_registration_payment_status(
                    payment_intent['metadata'].get('registration_id'),
                    'completed'
                )
            
            return {'status': 'processed', 'event_type': event['type']}
            
        except Exception as e:
            return {'status': 'error', 'message': str(e)}
```

## Integration Management Interface

### Admin Panel Integration Management
```python
class IntegrationManager:
    def __init__(self):
        self.services = {
            'odoo': OdooIntegrationService,
            'google_calendar': GoogleCalendarService,
            'email': EmailService,
            'stripe': StripeService
        }
    
    async def get_integration_status(self) -> Dict[str, Any]:
        """Get status of all integrations."""
        status = {}
        
        for name, service_class in self.services.items():
            try:
                config = await self.get_integration_config(name)
                if config and config.get('enabled'):
                    service = service_class(config)
                    status[name] = await service.test_connection()
                else:
                    status[name] = {'status': 'disabled'}
            except Exception as e:
                status[name] = {'status': 'error', 'message': str(e)}
        
        return status
    
    async def update_integration_config(
        self,
        integration_name: str,
        config_data: Dict[str, Any],
        user_id: str
    ) -> bool:
        """Update integration configuration."""
        try:
            # Encrypt sensitive data
            encrypted_config = await self.encrypt_sensitive_data(
                integration_name, config_data
            )
            
            # Store in database
            await self.store_integration_config(
                integration_name, encrypted_config
            )
            
            # Log configuration change
            await self.log_integration_activity(
                integration_name, 'config_updated', 
                updated_by=user_id
            )
            
            return True
            
        except Exception as e:
            await self.log_integration_activity(
                integration_name, 'config_update_failed',
                error=str(e),
                updated_by=user_id
            )
            return False
```

### Integration Testing Endpoints
```python
from fastapi import APIRouter, Depends
from services.auth import get_admin_user

integration_router = APIRouter(prefix="/api/v1/admin/integrations")

@integration_router.get("/status")
async def get_integrations_status(
    current_user = Depends(get_admin_user)
):
    """Get status of all integrations."""
    manager = IntegrationManager()
    status = await manager.get_integration_status()
    
    return {
        'success': True,
        'data': status
    }

@integration_router.post("/{integration_name}/test")
async def test_integration(
    integration_name: str,
    current_user = Depends(get_admin_user)
):
    """Test specific integration connection."""
    manager = IntegrationManager()
    
    if integration_name not in manager.services:
        return {
            'success': False,
            'error': {'message': 'Integration not found'}
        }
    
    config = await manager.get_integration_config(integration_name)
    service_class = manager.services[integration_name]
    service = service_class(config)
    
    result = await service.test_connection()
    
    return {
        'success': True,
        'data': result
    }

@integration_router.post("/odoo/sync-leads")
async def sync_leads_to_odoo(
    current_user = Depends(get_admin_user)
):
    """Manually trigger lead sync to Odoo."""
    config = await IntegrationManager().get_integration_config('odoo')
    odoo_service = OdooIntegrationService(config)
    
    result = await odoo_service.sync_leads_to_odoo()
    
    return {
        'success': True,
        'data': result
    }
```

## Synchronous Integration Operations

**Note**: Magnetiq v2 uses synchronous operations instead of background task queues to maintain simplicity and eliminate external dependencies like Celery/Redis.

### Manual and Cron-triggered Operations
```python
from services.integrations import IntegrationManager
from datetime import datetime, timedelta
import logging

def sync_leads_to_odoo():
    """Synchronous operation to sync leads to Odoo."""
    logger = logging.getLogger(__name__)
    try:
        manager = IntegrationManager()
        config = await manager.get_integration_config('odoo')
        
        if config and config.get('enabled'):
            odoo_service = OdooIntegrationService(config)
            result = await odoo_service.sync_leads_to_odoo()
            
            return {
                'status': 'completed',
                'processed': result['processed'],
                'successful': result['successful'],
                'failed': result['failed']
            }
    except Exception as exc:
        logger.error(f"Failed to sync leads to Odoo: {exc}")
        # In v2, we handle errors synchronously without retries
        raise exc

def send_webinar_reminders():
    """Send webinar reminder emails."""
    # Get webinars starting in 2 and 7 days
    for days_ahead in [2, 7]:
        webinars = WebinarService.get_webinars_starting_in_days(days_ahead)
        
        for webinar in webinars:
            for registration in webinar.registrations:
                EmailService.send_webinar_reminder.delay(
                    webinar.id,
                    registration.id,
                    days_ahead
                )

def health_check_integrations():
    """Monitor integration health and send alerts."""
    manager = IntegrationManager()
    status = await manager.get_integration_status()
    
    unhealthy_services = [
        name for name, health in status.items()
        if health.get('status') != 'healthy'
    ]
    
    if unhealthy_services:
        # Send alert email to administrators (synchronously)
        from services.email_service import EmailService
        email_service = EmailService()
        email_service.send_integration_alert(unhealthy_services)
```

### Cron-based Scheduling

Instead of Celery, use standard cron jobs to trigger operations:

```bash
# /etc/cron.d/magnetiq-integrations
# Sync leads to Odoo every 4 hours
0 */4 * * * www-data /usr/bin/python3 /app/scripts/sync_leads.py

# Send webinar reminders daily at 9 AM
0 9 * * * www-data /usr/bin/python3 /app/scripts/send_reminders.py

# Health check every 15 minutes
*/15 * * * * www-data /usr/bin/python3 /app/scripts/health_check.py
```

```python
# /app/scripts/sync_leads.py
#!/usr/bin/env python3
import asyncio
import sys
import os

# Add the app directory to Python path
sys.path.append('/app')

from integrations.integrations import sync_leads_to_odoo

async def main():
    try:
        result = sync_leads_to_odoo()
        print(f"Sync completed: {result}")
    except Exception as e:
        print(f"Sync failed: {e}")
        sys.exit(1)

if __name__ == "__main__":
    asyncio.run(main())
```

## Security Considerations

### Credential Management
- All API keys and secrets are encrypted at rest
- Credentials are rotated regularly
- Access to integration settings requires admin privileges
- All integration activities are logged with user context

### Rate Limiting
```python
class IntegrationRateLimiter:
    def __init__(self, redis_client):
        self.redis = redis_client
    
    async def check_rate_limit(
        self,
        integration_name: str,
        operation: str,
        limit: int = 100,
        window: int = 3600
    ) -> bool:
        """Check if operation is within rate limit."""
        key = f"rate_limit:{integration_name}:{operation}"
        current = await self.redis.get(key)
        
        if current is None:
            await self.redis.setex(key, window, 1)
            return True
        elif int(current) < limit:
            await self.redis.incr(key)
            return True
        else:
            return False
```

## Monitoring and Alerting

### Integration Health Monitoring
```python
class IntegrationHealthMonitor:
    def __init__(self):
        self.thresholds = {
            'error_rate': 0.1,  # 10% error rate threshold
            'response_time': 5000,  # 5 seconds response time threshold
            'consecutive_failures': 5
        }
    
    async def check_integration_health(self, integration_name: str) -> Dict[str, Any]:
        """Check health metrics for integration."""
        # Get recent integration logs
        logs = await self.get_recent_integration_logs(integration_name, hours=1)
        
        total_requests = len(logs)
        if total_requests == 0:
            return {'status': 'no_activity', 'message': 'No recent activity'}
        
        # Calculate error rate
        errors = len([log for log in logs if log.status == 'error'])
        error_rate = errors / total_requests
        
        # Calculate average response time
        response_times = [log.duration_ms for log in logs if log.duration_ms]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 0
        
        # Check consecutive failures
        recent_logs = sorted(logs, key=lambda x: x.started_at, reverse=True)[:10]
        consecutive_failures = 0
        for log in recent_logs:
            if log.status == 'error':
                consecutive_failures += 1
            else:
                break
        
        # Determine health status
        health_issues = []
        
        if error_rate > self.thresholds['error_rate']:
            health_issues.append(f'High error rate: {error_rate:.1%}')
        
        if avg_response_time > self.thresholds['response_time']:
            health_issues.append(f'Slow response time: {avg_response_time:.0f}ms')
        
        if consecutive_failures >= self.thresholds['consecutive_failures']:
            health_issues.append(f'Consecutive failures: {consecutive_failures}')
        
        status = 'unhealthy' if health_issues else 'healthy'
        
        return {
            'status': status,
            'error_rate': error_rate,
            'avg_response_time': avg_response_time,
            'consecutive_failures': consecutive_failures,
            'issues': health_issues
        }
```

## Social Media Integrations

### LinkedIn Integration

#### OAuth2 Authentication Flow
```python
class LinkedInIntegrationService(BaseIntegrationService):
    """LinkedIn API integration for professional content publishing."""
    
    BASE_URL = "https://api.linkedin.com/v2"
    AUTH_URL = "https://www.linkedin.com/oauth/v2/authorization"
    TOKEN_URL = "https://www.linkedin.com/oauth/v2/accessToken"
    
    REQUIRED_SCOPES = [
        'r_liteprofile',
        'r_emailaddress', 
        'w_member_social',
        'r_organization_social',
        'w_organization_social'
    ]
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.client_id = config.get('client_id')
        self.client_secret = config.get('client_secret')
        self.redirect_uri = config.get('redirect_uri')
    
    def get_authorization_url(self, state: str) -> str:
        """Generate LinkedIn OAuth2 authorization URL."""
        params = {
            'response_type': 'code',
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'state': state,
            'scope': ' '.join(self.REQUIRED_SCOPES)
        }
        
        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        return f"{self.AUTH_URL}?{query_string}"
    
    async def exchange_code_for_token(self, authorization_code: str) -> Dict[str, Any]:
        """Exchange authorization code for access token."""
        token_data = {
            'grant_type': 'authorization_code',
            'code': authorization_code,
            'redirect_uri': self.redirect_uri,
            'client_id': self.client_id,
            'client_secret': self.client_secret
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(self.TOKEN_URL, data=token_data) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    raise IntegrationError(f"Token exchange failed: {response.status}")
    
    async def get_profile_info(self, access_token: str) -> Dict[str, Any]:
        """Get LinkedIn profile information."""
        headers = {'Authorization': f'Bearer {access_token}'}
        
        async with aiohttp.ClientSession() as session:
            async with session.get(f"{self.BASE_URL}/me", headers=headers) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    raise IntegrationError(f"Profile fetch failed: {response.status}")
    
    async def publish_post(
        self, 
        access_token: str,
        account_id: str,
        content: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Publish content to LinkedIn."""
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json',
            'X-Restli-Protocol-Version': '2.0.0'
        }
        
        # LinkedIn post structure
        post_data = {
            "author": f"urn:li:person:{account_id}",
            "lifecycleState": "PUBLISHED",
            "specificContent": {
                "com.linkedin.ugc.ShareContent": {
                    "shareCommentary": {
                        "text": content.get('text', '')
                    },
                    "shareMediaCategory": "NONE"
                }
            },
            "visibility": {
                "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
            }
        }
        
        # Add media if present
        if content.get('media_urls'):
            media_data = []
            for media_url in content['media_urls']:
                media_data.append({
                    "status": "READY",
                    "media": media_url,
                    "title": {"text": content.get('title', '')},
                    "description": {"text": content.get('description', '')}
                })
            
            post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["shareMediaCategory"] = "IMAGE"
            post_data["specificContent"]["com.linkedin.ugc.ShareContent"]["media"] = media_data
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.BASE_URL}/ugcPosts", 
                headers=headers, 
                json=post_data
            ) as response:
                if response.status in [200, 201]:
                    result = await response.json()
                    return {
                        'platform_post_id': result.get('id'),
                        'platform_url': f"https://linkedin.com/feed/update/{result.get('id')}",
                        'status': 'published',
                        'published_at': datetime.utcnow().isoformat()
                    }
                else:
                    error_text = await response.text()
                    raise IntegrationError(f"LinkedIn publish failed: {response.status} - {error_text}")
    
    async def get_post_analytics(
        self, 
        access_token: str, 
        post_id: str
    ) -> Dict[str, Any]:
        """Get analytics for a LinkedIn post."""
        headers = {'Authorization': f'Bearer {access_token}'}
        
        analytics_url = f"{self.BASE_URL}/socialActions/{post_id}"
        
        async with aiohttp.ClientSession() as session:
            async with session.get(analytics_url, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    return {
                        'likes': data.get('numLikes', 0),
                        'comments': data.get('numComments', 0),
                        'shares': data.get('numShares', 0),
                        'clicks': data.get('clickCount', 0),
                        'impressions': data.get('impressionCount', 0)
                    }
                else:
                    self.logger.warning(f"LinkedIn analytics fetch failed: {response.status}")
                    return {}
```

### Twitter/X Integration

#### OAuth2 Authentication and Publishing
```python
class TwitterIntegrationService(BaseIntegrationService):
    """Twitter/X API integration for tweet publishing and engagement."""
    
    BASE_URL = "https://api.twitter.com/2"
    AUTH_URL = "https://twitter.com/i/oauth2/authorize"
    TOKEN_URL = "https://api.twitter.com/2/oauth2/token"
    
    REQUIRED_SCOPES = [
        'tweet.read',
        'tweet.write',
        'users.read',
        'tweet.moderate.write',
        'offline.access'
    ]
    
    def __init__(self, config: Dict[str, Any]):
        super().__init__(config)
        self.client_id = config.get('client_id')
        self.client_secret = config.get('client_secret')
        self.redirect_uri = config.get('redirect_uri')
    
    def get_authorization_url(self, state: str, code_challenge: str) -> str:
        """Generate Twitter OAuth2 authorization URL with PKCE."""
        params = {
            'response_type': 'code',
            'client_id': self.client_id,
            'redirect_uri': self.redirect_uri,
            'scope': ' '.join(self.REQUIRED_SCOPES),
            'state': state,
            'code_challenge': code_challenge,
            'code_challenge_method': 'S256'
        }
        
        query_string = '&'.join([f"{k}={v}" for k, v in params.items()])
        return f"{self.AUTH_URL}?{query_string}"
    
    async def exchange_code_for_token(
        self, 
        authorization_code: str, 
        code_verifier: str
    ) -> Dict[str, Any]:
        """Exchange authorization code for access token."""
        token_data = {
            'grant_type': 'authorization_code',
            'code': authorization_code,
            'redirect_uri': self.redirect_uri,
            'client_id': self.client_id,
            'client_secret': self.client_secret,
            'code_verifier': code_verifier
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(self.TOKEN_URL, data=token_data) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    raise IntegrationError(f"Twitter token exchange failed: {response.status}")
    
    async def get_user_info(self, access_token: str) -> Dict[str, Any]:
        """Get Twitter user information."""
        headers = {'Authorization': f'Bearer {access_token}'}
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.BASE_URL}/users/me",
                headers=headers,
                params={'user.fields': 'public_metrics,verified'}
            ) as response:
                if response.status == 200:
                    return await response.json()
                else:
                    raise IntegrationError(f"Twitter user fetch failed: {response.status}")
    
    async def publish_tweet(
        self, 
        access_token: str, 
        content: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Publish a tweet or thread to Twitter."""
        headers = {
            'Authorization': f'Bearer {access_token}',
            'Content-Type': 'application/json'
        }
        
        # Handle thread creation
        if content.get('content_type') == 'thread':
            return await self._publish_thread(headers, content)
        else:
            return await self._publish_single_tweet(headers, content)
    
    async def _publish_single_tweet(
        self, 
        headers: Dict[str, str], 
        content: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Publish a single tweet."""
        tweet_data = {
            'text': content.get('text', '')
        }
        
        # Add media if present
        if content.get('media_urls'):
            # Note: Media must be uploaded separately using Twitter's media upload endpoint
            tweet_data['media'] = {
                'media_ids': content.get('media_ids', [])
            }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.BASE_URL}/tweets",
                headers=headers,
                json=tweet_data
            ) as response:
                if response.status in [200, 201]:
                    result = await response.json()
                    tweet_id = result['data']['id']
                    return {
                        'platform_post_id': tweet_id,
                        'platform_url': f"https://twitter.com/user/status/{tweet_id}",
                        'status': 'published',
                        'published_at': datetime.utcnow().isoformat()
                    }
                else:
                    error_text = await response.text()
                    raise IntegrationError(f"Twitter publish failed: {response.status} - {error_text}")
    
    async def _publish_thread(
        self, 
        headers: Dict[str, str], 
        content: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Publish a Twitter thread."""
        thread_texts = content.get('thread_texts', [])
        if not thread_texts:
            raise ValueError("Thread content cannot be empty")
        
        tweet_ids = []
        reply_to_id = None
        
        for i, text in enumerate(thread_texts):
            tweet_data = {'text': text}
            
            if reply_to_id:
                tweet_data['reply'] = {'in_reply_to_tweet_id': reply_to_id}
            
            async with aiohttp.ClientSession() as session:
                async with session.post(
                    f"{self.BASE_URL}/tweets",
                    headers=headers,
                    json=tweet_data
                ) as response:
                    if response.status in [200, 201]:
                        result = await response.json()
                        tweet_id = result['data']['id']
                        tweet_ids.append(tweet_id)
                        reply_to_id = tweet_id
                    else:
                        error_text = await response.text()
                        raise IntegrationError(f"Thread tweet {i+1} failed: {response.status} - {error_text}")
        
        # Return information about the first tweet (thread starter)
        return {
            'platform_post_id': tweet_ids[0],
            'platform_url': f"https://twitter.com/user/status/{tweet_ids[0]}",
            'status': 'published',
            'thread_ids': tweet_ids,
            'published_at': datetime.utcnow().isoformat()
        }
    
    async def get_tweet_analytics(
        self, 
        access_token: str, 
        tweet_id: str
    ) -> Dict[str, Any]:
        """Get analytics for a Twitter tweet."""
        headers = {'Authorization': f'Bearer {access_token}'}
        
        params = {
            'tweet.fields': 'public_metrics,non_public_metrics,organic_metrics',
            'expansions': 'author_id'
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"{self.BASE_URL}/tweets/{tweet_id}",
                headers=headers,
                params=params
            ) as response:
                if response.status == 200:
                    data = await response.json()
                    metrics = data['data'].get('public_metrics', {})
                    
                    return {
                        'likes': metrics.get('like_count', 0),
                        'retweets': metrics.get('retweet_count', 0),
                        'replies': metrics.get('reply_count', 0),
                        'quotes': metrics.get('quote_count', 0),
                        'bookmarks': metrics.get('bookmark_count', 0),
                        'impressions': data['data'].get('organic_metrics', {}).get('impression_count', 0)
                    }
                else:
                    self.logger.warning(f"Twitter analytics fetch failed: {response.status}")
                    return {}
    
    async def upload_media(
        self, 
        access_token: str, 
        media_file: bytes, 
        media_type: str
    ) -> str:
        """Upload media to Twitter and return media_id."""
        # This is a simplified version - actual implementation requires chunked upload for larger files
        upload_url = "https://upload.twitter.com/1.1/media/upload.json"
        
        headers = {'Authorization': f'Bearer {access_token}'}
        
        files = {'media': media_file}
        data = {'media_category': 'tweet_image' if 'image' in media_type else 'tweet_video'}
        
        async with aiohttp.ClientSession() as session:
            async with session.post(upload_url, headers=headers, data=files) as response:
                if response.status == 200:
                    result = await response.json()
                    return result['media_id_string']
                else:
                    raise IntegrationError(f"Media upload failed: {response.status}")
```

### Platform-Specific Configuration Management

#### Social Media Service Manager
```python
class SocialMediaManager:
    """Centralized manager for all social media integrations."""
    
    def __init__(self):
        self.services = {
            'linkedin': LinkedInIntegrationService,
            'twitter': TwitterIntegrationService
        }
        self.active_connections = {}
    
    async def connect_platform(
        self, 
        platform: str, 
        user_id: int, 
        auth_config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Connect a social media platform for a user."""
        if platform not in self.services:
            raise ValueError(f"Unsupported platform: {platform}")
        
        service_class = self.services[platform]
        service = service_class(auth_config)
        
        # Test connection
        connection_result = await service.test_connection()
        
        if connection_result['status'] == 'success':
            # Store connection in database
            social_account = await self._create_social_account(
                platform=platform,
                user_id=user_id,
                auth_data=auth_config,
                account_info=connection_result['account_info']
            )
            
            self.active_connections[f"{platform}_{user_id}"] = service
            
            return {
                'status': 'connected',
                'account_id': social_account.id,
                'platform': platform,
                'account_info': connection_result['account_info']
            }
        else:
            raise IntegrationError(f"Failed to connect {platform}: {connection_result['error']}")
    
    async def publish_content(
        self, 
        social_account_id: int, 
        content: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Publish content to a connected social media platform."""
        # Get account details from database
        social_account = await self._get_social_account(social_account_id)
        
        if not social_account or not social_account.is_active:
            raise ValueError("Social account not found or inactive")
        
        platform = social_account.platform
        service_key = f"{platform}_{social_account.created_by}"
        
        if service_key not in self.active_connections:
            # Recreate service from stored credentials
            auth_config = await self._get_auth_config(social_account)
            service_class = self.services[platform]
            self.active_connections[service_key] = service_class(auth_config)
        
        service = self.active_connections[service_key]
        
        # Publish content
        result = await service.publish_content(
            access_token=social_account.access_token,
            content=content
        )
        
        # Store content record in database
        await self._create_content_record(social_account_id, content, result)
        
        return result
    
    async def sync_engagement_metrics(self, social_account_id: int) -> Dict[str, Any]:
        """Sync engagement metrics for all published content from an account."""
        social_account = await self._get_social_account(social_account_id)
        platform = social_account.platform
        
        # Get all published content for this account
        published_content = await self._get_published_content(social_account_id)
        
        service_key = f"{platform}_{social_account.created_by}"
        if service_key not in self.active_connections:
            auth_config = await self._get_auth_config(social_account)
            service_class = self.services[platform]
            self.active_connections[service_key] = service_class(auth_config)
        
        service = self.active_connections[service_key]
        
        metrics_updated = 0
        for content in published_content:
            try:
                if platform == 'linkedin':
                    analytics = await service.get_post_analytics(
                        social_account.access_token, 
                        content.platform_post_id
                    )
                elif platform == 'twitter':
                    analytics = await service.get_tweet_analytics(
                        social_account.access_token, 
                        content.platform_post_id
                    )
                
                await self._update_engagement_metrics(content.id, analytics)
                metrics_updated += 1
                
            except Exception as e:
                self.logger.error(f"Failed to sync metrics for {content.id}: {e}")
        
        return {
            'status': 'completed',
            'metrics_updated': metrics_updated,
            'total_content': len(published_content)
        }
```

## Integration Error Handling

### Platform-Specific Error Patterns
```python
class SocialMediaErrorHandler:
    """Centralized error handling for social media integrations."""
    
    LINKEDIN_ERROR_CODES = {
        429: ('rate_limit_exceeded', 'LinkedIn API rate limit reached'),
        401: ('authentication_failed', 'LinkedIn access token expired or invalid'),
        403: ('permission_denied', 'Insufficient LinkedIn permissions'),
        400: ('invalid_request', 'LinkedIn API request validation failed')
    }
    
    TWITTER_ERROR_CODES = {
        429: ('rate_limit_exceeded', 'Twitter API rate limit reached'),
        401: ('authentication_failed', 'Twitter access token expired or invalid'),
        403: ('forbidden', 'Twitter API request forbidden'),
        422: ('validation_failed', 'Twitter content validation failed')
    }
    
    @classmethod
    def handle_platform_error(cls, platform: str, status_code: int, response_data: Dict) -> Dict[str, Any]:
        """Handle platform-specific errors and provide actionable responses."""
        
        error_maps = {
            'linkedin': cls.LINKEDIN_ERROR_CODES,
            'twitter': cls.TWITTER_ERROR_CODES
        }
        
        error_map = error_maps.get(platform, {})
        error_type, error_message = error_map.get(status_code, ('unknown_error', 'Unknown platform error'))
        
        recovery_actions = []
        
        if error_type == 'rate_limit_exceeded':
            recovery_actions.append('Wait for rate limit reset')
            recovery_actions.append('Reduce posting frequency')
        elif error_type == 'authentication_failed':
            recovery_actions.append('Refresh access token')
            recovery_actions.append('Re-authenticate account')
        elif error_type == 'permission_denied':
            recovery_actions.append('Review required permissions')
            recovery_actions.append('Reconnect account with proper scopes')
        
        return {
            'error_type': error_type,
            'error_message': error_message,
            'status_code': status_code,
            'platform': platform,
            'recovery_actions': recovery_actions,
            'response_data': response_data
        }
```

This comprehensive integration specification provides a robust foundation for connecting Magnetiq v2 with all required external services while maintaining security, reliability, and monitoring capabilities.