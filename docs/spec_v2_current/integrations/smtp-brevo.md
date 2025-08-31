# Magnetiq v2 - SMTP-Brevo Integration Specification

## Overview

The SMTP-Brevo integration provides comprehensive email services for the Magnetiq v2 platform, including transactional emails, marketing campaigns, and automated whitepaper delivery. This integration handles all email communications with leads, authors, and administrators.

’ **Business Integration**: [Email Marketing Strategy](../features/email-marketing.md), [Lead Nurturing](../features/lead-nurturing.md)
 **Supports**: [Whitepaper Lead Capture](../frontend/public/features/whitepapers.md#lead-capture), [Author Notifications](../features/author-notifications.md)
= **Cross-References**: [Backend API](../backend/api.md#email-endpoints), [Admin Panel](../frontend/adminpanel/admin.md#email-management)
¡ **Dependencies**: [Configuration Management](../backend/config.md), [Template System](../features/email-templates.md)

## Technical Architecture

### Integration Method
- **Brevo API v3**: RESTful API integration with comprehensive email services
- **SMTP Fallback**: Direct SMTP for critical transactional emails
- **Template Management**: Dynamic template system with multilingual support
- **Delivery Tracking**: Complete email delivery and engagement tracking

### Service Configuration
```python
# Brevo configuration settings
BREVO_CONFIG = {
    'api_key': 'your_brevo_api_key',
    'api_url': 'https://api.brevo.com/v3',
    'smtp_server': 'smtp-relay.brevo.com',
    'smtp_port': 587,
    'smtp_username': 'your_smtp_username',
    'smtp_password': 'your_smtp_password',
    
    # Sender configurations
    'default_sender': {
        'name': 'voltAIc Systems',
        'email': 'noreply@voltaic.systems'
    },
    'whitepaper_sender': {
        'name': 'voltAIc Knowledge Center',
        'email': 'whitepapers@voltaic.systems'
    },
    'support_sender': {
        'name': 'voltAIc Support',
        'email': 'support@voltaic.systems'
    },
    
    # Email processing
    'max_batch_size': 100,
    'retry_attempts': 3,
    'retry_delay': 5,  # seconds
    'rate_limit': 300,  # emails per hour
}
```

## Whitepaper Email Services

### Download Delivery Emails
```python
# Email service for whitepaper delivery
class WhitepaperEmailService:
    """Handle all whitepaper-related email communications."""
    
    def __init__(self, brevo_client: BrevoClient):
        self.brevo = brevo_client
        self.logger = logging.getLogger(__name__)
    
    async def send_download_email(
        self, 
        lead: WhitepaperLead, 
        whitepaper: Whitepaper,
        download_token: str
    ) -> Dict[str, any]:
        """Send whitepaper download email with 48-hour valid link."""
        
        # Generate secure download URL
        download_url = f"https://voltaic.systems/api/v1/public/whitepapers/download/{download_token}"
        
        # Prepare template data
        template_data = {
            'lead_name': lead.name,
            'lead_first_name': lead.name.split()[0],
            'company': lead.company or 'your organization',
            'whitepaper_title': whitepaper.title,
            'whitepaper_author': whitepaper.author_name,
            'whitepaper_description': whitepaper.description,
            'download_url': download_url,
            'expires_at': lead.download_expires_at.strftime('%B %d, %Y at %I:%M %p UTC'),
            'whitepaper_page_url': f"https://voltaic.systems/whitepapers/{whitepaper.slug}",
            'author_bio': whitepaper.author_bio,
            'author_linkedin': whitepaper.author_linkedin_url,
            'key_takeaways': json.loads(whitepaper.key_takeaways or '[]'),
            'reading_time': whitepaper.reading_time,
            'page_count': whitepaper.page_count,
        }
        
        # Send email via Brevo
        email_data = {
            'to': [{'email': lead.email, 'name': lead.name}],
            'sender': BREVO_CONFIG['whitepaper_sender'],
            'subject': f"Your {whitepaper.title} is ready for download",
            'templateId': self._get_template_id('whitepaper_download'),
            'params': template_data,
            'tags': ['whitepaper', 'download', whitepaper.category],
            'headers': {
                'X-Whitepaper-ID': str(whitepaper.id),
                'X-Lead-ID': str(lead.id),
                'X-Download-Token': download_token
            }
        }
        
        try:
            response = await self.brevo.send_transactional_email(email_data)
            
            # Log successful delivery
            self.logger.info(
                f"Whitepaper download email sent to {lead.email} "
                f"for whitepaper {whitepaper.id} (Message ID: {response['messageId']})"
            )
            
            return {
                'success': True,
                'message_id': response['messageId'],
                'email': lead.email
            }
            
        except Exception as e:
            self.logger.error(f"Failed to send whitepaper email to {lead.email}: {e}")
            return {
                'success': False,
                'error': str(e),
                'email': lead.email
            }
    
    async def send_author_confirmation(
        self,
        whitepaper: Whitepaper,
        submission: EmailSubmission
    ) -> Dict[str, any]:
        """Send confirmation email to whitepaper author after submission."""
        
        template_data = {
            'author_name': whitepaper.author_name,
            'whitepaper_title': whitepaper.title,
            'submission_date': submission.received_at.strftime('%B %d, %Y'),
            'processing_status': submission.llm_processing_status,
            'publication_url': f"https://voltaic.systems/whitepapers/{whitepaper.slug}",
            'admin_contact': 'admin@voltaic.systems',
            'expected_review_time': '24-48 hours',
        }
        
        email_data = {
            'to': [{'email': whitepaper.author_email, 'name': whitepaper.author_name}],
            'sender': BREVO_CONFIG['default_sender'],
            'subject': f"Confirmation: Your whitepaper '{whitepaper.title}' has been received",
            'templateId': self._get_template_id('author_confirmation'),
            'params': template_data,
            'tags': ['author', 'confirmation', 'submission']
        }
        
        return await self._send_email(email_data)
    
    async def send_publication_notice(
        self,
        whitepaper: Whitepaper
    ) -> Dict[str, any]:
        """Send publication notice to author when whitepaper goes live."""
        
        template_data = {
            'author_name': whitepaper.author_name,
            'whitepaper_title': whitepaper.title,
            'publication_date': whitepaper.publication_date.strftime('%B %d, %Y'),
            'whitepaper_url': f"https://voltaic.systems/whitepapers/{whitepaper.slug}",
            'share_linkedin': f"https://www.linkedin.com/sharing/share-offsite/?url=https://voltaic.systems/whitepapers/{whitepaper.slug}",
            'share_twitter': f"https://twitter.com/intent/tweet?url=https://voltaic.systems/whitepapers/{whitepaper.slug}&text=Check%20out%20my%20latest%20whitepaper%3A%20{whitepaper.title}",
            'analytics_available': True,
            'author_dashboard_url': f"https://voltaic.systems/admin/whitepapers/{whitepaper.id}/analytics",
        }
        
        email_data = {
            'to': [{'email': whitepaper.author_email, 'name': whitepaper.author_name}],
            'sender': BREVO_CONFIG['whitepaper_sender'],
            'subject': f"<‰ Your whitepaper '{whitepaper.title}' is now live!",
            'templateId': self._get_template_id('publication_notice'),
            'params': template_data,
            'tags': ['author', 'publication', 'success']
        }
        
        return await self._send_email(email_data)
```

### Email Template System
```python
# Email templates for whitepaper system
WHITEPAPER_EMAIL_TEMPLATES = {
    'whitepaper_download': {
        'id': 1,
        'name': 'Whitepaper Download Delivery',
        'subject': 'Your {{params.whitepaper_title}} is ready for download',
        'html_content': '''
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Your Whitepaper is Ready</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #007bff;">
                <h1 style="color: #007bff; margin: 0;">voltAIc Systems</h1>
                <p style="margin: 5px 0 0 0; color: #666;">Knowledge Center</p>
            </div>
            
            <div style="padding: 30px 20px;">
                <h2 style="color: #333;">Hi {{params.lead_first_name}},</h2>
                
                <p>Thank you for your interest in our whitepaper! Your download is ready:</p>
                
                <div style="background-color: #f8f9fa; border-left: 4px solid #007bff; padding: 20px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #007bff;">{{params.whitepaper_title}}</h3>
                    <p style="color: #666; margin: 10px 0;"><strong>Author:</strong> {{params.whitepaper_author}}</p>
                    <p style="color: #666; margin: 10px 0;"><strong>Reading Time:</strong> {{params.reading_time}} minutes</p>
                    <p style="color: #666; margin: 10px 0;"><strong>Pages:</strong> {{params.page_count}}</p>
                    <p>{{params.whitepaper_description}}</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{params.download_url}}" style="display: inline-block; background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        =Ä Download Your Whitepaper
                    </a>
                </div>
                
                <p style="font-size: 14px; color: #666; text-align: center;">
                    <strong>Important:</strong> This download link expires on {{params.expires_at}}
                </p>
                
                {{#params.key_takeaways}}
                <div style="background-color: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h4 style="color: #0056b3; margin-top: 0;">Key Takeaways:</h4>
                    <ul style="color: #333;">
                        {{#params.key_takeaways}}
                        <li>{{.}}</li>
                        {{/params.key_takeaways}}
                    </ul>
                </div>
                {{/params.key_takeaways}}
                
                <div style="border-top: 1px solid #dee2e6; padding-top: 20px; margin-top: 30px;">
                    <h4>About the Author</h4>
                    <p><strong>{{params.whitepaper_author}}</strong></p>
                    <p>{{params.author_bio}}</p>
                    {{#params.author_linkedin}}
                    <a href="{{params.author_linkedin}}" style="color: #0077b5;">Connect on LinkedIn</a>
                    {{/params.author_linkedin}}
                </div>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6;">
                    <p style="color: #666;">Found this valuable? Share it with your network:</p>
                    <a href="https://www.linkedin.com/sharing/share-offsite/?url={{params.whitepaper_page_url}}" style="display: inline-block; margin: 0 10px; color: #0077b5; text-decoration: none;">LinkedIn</a>
                    <a href="https://twitter.com/intent/tweet?url={{params.whitepaper_page_url}}&text=Great insights in this whitepaper" style="display: inline-block; margin: 0 10px; color: #1da1f2; text-decoration: none;">Twitter</a>
                </div>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                <p>This email was sent because you downloaded a whitepaper from voltAIc Systems.</p>
                <p>voltAIc Systems | AI Consulting & Strategy | <a href="https://voltaic.systems">voltaic.systems</a></p>
                <p>
                    <a href="{{unsubscribe}}" style="color: #666;">Unsubscribe</a> | 
                    <a href="mailto:support@voltaic.systems" style="color: #666;">Contact Support</a>
                </p>
            </div>
        </body>
        </html>
        '''
    },
    
    'author_confirmation': {
        'id': 2,
        'name': 'Author Submission Confirmation',
        'subject': 'Confirmation: Your whitepaper "{{params.whitepaper_title}}" has been received',
        'html_content': '''
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #28a745;">
                <h1 style="color: #28a745; margin: 0;">voltAIc Systems</h1>
                <p style="margin: 5px 0 0 0; color: #666;">Author Portal</p>
            </div>
            
            <div style="padding: 30px 20px;">
                <h2 style="color: #333;">Hi {{params.author_name}},</h2>
                
                <p>We've successfully received your whitepaper submission!</p>
                
                <div style="background-color: #d4edda; border-left: 4px solid #28a745; padding: 20px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #155724;">Submission Confirmed</h3>
                    <p style="margin: 10px 0;"><strong>Title:</strong> {{params.whitepaper_title}}</p>
                    <p style="margin: 10px 0;"><strong>Received:</strong> {{params.submission_date}}</p>
                    <p style="margin: 10px 0;"><strong>Status:</strong> {{params.processing_status}}</p>
                </div>
                
                <h4>What happens next?</h4>
                <ol>
                    <li><strong>Content Review:</strong> Our team will review your submission for quality and relevance</li>
                    <li><strong>Processing:</strong> If approved, we'll format and optimize your content for publication</li>
                    <li><strong>Publication:</strong> Your whitepaper will be published on our knowledge center</li>
                    <li><strong>Notification:</strong> You'll receive a publication notice with sharing links</li>
                </ol>
                
                <p><strong>Expected review time:</strong> {{params.expected_review_time}}</p>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{params.publication_url}}" style="display: inline-block; background-color: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                        =€ Preview Landing Page
                    </a>
                </div>
                
                <p>If you have any questions about the submission process, please don't hesitate to contact us at 
                <a href="mailto:{{params.admin_contact}}" style="color: #007bff;">{{params.admin_contact}}</a>.</p>
                
                <p>Thank you for contributing to our knowledge center!</p>
                
                <p>Best regards,<br>
                The voltAIc Systems Team</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                <p>voltAIc Systems | AI Consulting & Strategy | <a href="https://voltaic.systems">voltaic.systems</a></p>
            </div>
        </body>
        </html>
        '''
    },
    
    'publication_notice': {
        'id': 3,
        'name': 'Whitepaper Publication Notice',
        'subject': '<‰ Your whitepaper "{{params.whitepaper_title}}" is now live!',
        'html_content': '''
        <!DOCTYPE html>
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #fff3cd; padding: 20px; text-align: center; border-bottom: 3px solid #ffc107;">
                <h1 style="color: #856404; margin: 0;"><‰ Congratulations!</h1>
                <p style="margin: 5px 0 0 0; color: #856404; font-weight: bold;">Your whitepaper is now live</p>
            </div>
            
            <div style="padding: 30px 20px;">
                <h2 style="color: #333;">Hi {{params.author_name}},</h2>
                
                <p>Great news! Your whitepaper has been published and is now available to our audience.</p>
                
                <div style="background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 20px; margin: 20px 0;">
                    <h3 style="margin-top: 0; color: #856404;">{{params.whitepaper_title}}</h3>
                    <p style="margin: 10px 0;"><strong>Publication Date:</strong> {{params.publication_date}}</p>
                    <p style="margin: 10px 0;"><strong>Status:</strong> Live and available for download</p>
                </div>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{params.whitepaper_url}}" style="display: inline-block; background-color: #ffc107; color: #856404; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px;">
                        =Ä View Your Whitepaper
                    </a>
                    {{#params.analytics_available}}
                    <a href="{{params.author_dashboard_url}}" style="display: inline-block; background-color: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 10px;">
                        =Ê View Analytics
                    </a>
                    {{/params.analytics_available}}
                </div>
                
                <h4>Share your success!</h4>
                <p>Help spread the word about your valuable insights:</p>
                
                <div style="text-align: center; margin: 20px 0;">
                    <a href="{{params.share_linkedin}}" style="display: inline-block; background-color: #0077b5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">
                        Share on LinkedIn
                    </a>
                    <a href="{{params.share_twitter}}" style="display: inline-block; background-color: #1da1f2; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin: 5px;">
                        Share on Twitter
                    </a>
                </div>
                
                <div style="background-color: #e8f4fd; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <h4 style="color: #0056b3; margin-top: 0;">What's next?</h4>
                    <ul style="color: #333;">
                        <li>Monitor your whitepaper's performance with real-time analytics</li>
                        <li>Engage with readers who download your content</li>
                        <li>Consider writing follow-up content on related topics</li>
                        <li>Share insights from your download metrics</li>
                    </ul>
                </div>
                
                <p>We're excited to see how your whitepaper performs and helps our community!</p>
                
                <p>Best regards,<br>
                The voltAIc Systems Team</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                <p>voltAIc Systems | AI Consulting & Strategy | <a href="https://voltaic.systems">voltaic.systems</a></p>
                <p>Author Support: <a href="mailto:authors@voltaic.systems" style="color: #666;">authors@voltaic.systems</a></p>
            </div>
        </body>
        </html>
        '''
    }
}
```

## Lead Nurturing Email Automation

### Automated Email Sequences
```python
class LeadNurturingService:
    """Automated email sequences for whitepaper leads."""
    
    def __init__(self, brevo_client: BrevoClient):
        self.brevo = brevo_client
        self.logger = logging.getLogger(__name__)
    
    async def start_nurturing_sequence(self, lead: WhitepaperLead, whitepaper: Whitepaper):
        """Start automated nurturing sequence for a new lead."""
        
        # Schedule follow-up emails
        sequences = [
            {'delay_days': 3, 'template': 'follow_up_related_content'},
            {'delay_days': 7, 'template': 'consultation_offer'},
            {'delay_days': 14, 'template': 'case_study_share'},
            {'delay_days': 21, 'template': 'industry_insights'},
            {'delay_days': 30, 'template': 'final_touch'}
        ]
        
        for sequence in sequences:
            await self._schedule_nurturing_email(
                lead=lead,
                whitepaper=whitepaper,
                template=sequence['template'],
                delay_days=sequence['delay_days']
            )
    
    async def _schedule_nurturing_email(
        self, 
        lead: WhitepaperLead, 
        whitepaper: Whitepaper,
        template: str,
        delay_days: int
    ):
        """Schedule a nurturing email for future delivery."""
        
        send_date = datetime.utcnow() + timedelta(days=delay_days)
        
        # Add to Brevo automation workflow
        automation_data = {
            'email': lead.email,
            'attributes': {
                'LEAD_NAME': lead.name,
                'COMPANY': lead.company or '',
                'WHITEPAPER_TITLE': whitepaper.title,
                'INDUSTRY': lead.industry or '',
                'LEAD_SCORE': lead.lead_score,
                'DOWNLOAD_DATE': lead.created_at.isoformat()
            },
            'listIds': [self._get_nurturing_list_id()],
            'templateId': self._get_template_id(template),
            'scheduledAt': send_date.isoformat()
        }
        
        try:
            response = await self.brevo.add_contact_to_automation(automation_data)
            self.logger.info(f"Scheduled {template} email for {lead.email} on {send_date}")
            return response
        except Exception as e:
            self.logger.error(f"Failed to schedule nurturing email for {lead.email}: {e}")
            return None
```

### Admin Email Management

#### Email Queue Management
```python
class AdminEmailService:
    """Admin email management and monitoring."""
    
    def get_email_statistics(self, days: int = 30) -> Dict[str, any]:
        """Get comprehensive email statistics."""
        
        # Get stats from Brevo API
        stats = self.brevo.get_email_statistics(days=days)
        
        return {
            'total_sent': stats.get('total_sent', 0),
            'delivered': stats.get('delivered', 0),
            'bounced': stats.get('bounced', 0),
            'opened': stats.get('opened', 0),
            'clicked': stats.get('clicked', 0),
            'unsubscribed': stats.get('unsubscribed', 0),
            'spam_reports': stats.get('spam_reports', 0),
            
            # Calculated metrics
            'delivery_rate': self._calculate_rate(stats.get('delivered', 0), stats.get('total_sent', 1)),
            'open_rate': self._calculate_rate(stats.get('opened', 0), stats.get('delivered', 1)),
            'click_rate': self._calculate_rate(stats.get('clicked', 0), stats.get('delivered', 1)),
            'bounce_rate': self._calculate_rate(stats.get('bounced', 0), stats.get('total_sent', 1)),
            
            # Whitepaper-specific stats
            'whitepaper_emails': self._get_whitepaper_email_stats(days),
            'nurturing_emails': self._get_nurturing_email_stats(days),
            'author_emails': self._get_author_email_stats(days)
        }
    
    def get_failed_emails(self, limit: int = 100) -> List[Dict[str, any]]:
        """Get list of failed email deliveries for admin review."""
        
        failed_emails = self.brevo.get_bounced_emails(limit=limit)
        
        return [{
            'email': email['email'],
            'bounce_type': email['reason'],
            'bounce_date': email['date'],
            'whitepaper_id': email.get('whitepaper_id'),
            'lead_id': email.get('lead_id'),
            'retry_count': email.get('retry_count', 0)
        } for email in failed_emails]
    
    def retry_failed_emails(self, email_ids: List[str]) -> Dict[str, any]:
        """Retry sending failed emails."""
        
        results = {'success': 0, 'failed': 0, 'errors': []}
        
        for email_id in email_ids:
            try:
                response = self.brevo.retry_email(email_id)
                if response['status'] == 'success':
                    results['success'] += 1
                else:
                    results['failed'] += 1
                    results['errors'].append(f"Email {email_id}: {response.get('error', 'Unknown error')}")
            except Exception as e:
                results['failed'] += 1
                results['errors'].append(f"Email {email_id}: {str(e)}")
        
        return results
```

## Email Template Management

### Dynamic Template System
```python
class EmailTemplateService:
    """Manage email templates with multilingual support."""
    
    def __init__(self, brevo_client: BrevoClient):
        self.brevo = brevo_client
        self.templates = WHITEPAPER_EMAIL_TEMPLATES
    
    def get_template(self, template_key: str, language: str = 'en') -> Dict[str, any]:
        """Get email template with language-specific content."""
        
        base_template = self.templates.get(template_key)
        if not base_template:
            raise ValueError(f"Template {template_key} not found")
        
        # For now, all templates are in English
        # Future: implement multilingual template support
        return base_template
    
    def render_template(
        self, 
        template_key: str, 
        params: Dict[str, any],
        language: str = 'en'
    ) -> Dict[str, str]:
        """Render template with provided parameters."""
        
        template = self.get_template(template_key, language)
        
        # Use Brevo's template rendering or implement custom rendering
        rendered = {
            'subject': self._render_string(template['subject'], params),
            'html_content': self._render_string(template['html_content'], params)
        }
        
        return rendered
    
    def _render_string(self, template_string: str, params: Dict[str, any]) -> str:
        """Render string template with parameters."""
        # Simple parameter replacement
        # In production, use proper template engine like Jinja2
        result = template_string
        for key, value in params.items():
            placeholder = f"{{{{params.{key}}}}}"
            result = result.replace(placeholder, str(value))
        
        return result
    
    def create_template(self, template_data: Dict[str, any]) -> int:
        """Create new email template in Brevo."""
        
        brevo_template = {
            'name': template_data['name'],
            'subject': template_data['subject'],
            'htmlContent': template_data['html_content'],
            'isActive': True,
            'tags': template_data.get('tags', [])
        }
        
        response = self.brevo.create_email_template(brevo_template)
        return response['id']
    
    def update_template(self, template_id: int, template_data: Dict[str, any]) -> bool:
        """Update existing email template."""
        
        brevo_template = {
            'name': template_data['name'],
            'subject': template_data['subject'],
            'htmlContent': template_data['html_content'],
            'isActive': template_data.get('is_active', True)
        }
        
        try:
            self.brevo.update_email_template(template_id, brevo_template)
            return True
        except Exception as e:
            self.logger.error(f"Failed to update template {template_id}: {e}")
            return False
```

## API Integration Implementation

### Brevo API Client
```python
import aiohttp
import asyncio
from typing import Dict, List, Optional

class BrevoClient:
    """Async Brevo API client."""
    
    def __init__(self, api_key: str, api_url: str = 'https://api.brevo.com/v3'):
        self.api_key = api_key
        self.api_url = api_url
        self.session = None
    
    async def __aenter__(self):
        self.session = aiohttp.ClientSession(
            headers={
                'api-key': self.api_key,
                'Content-Type': 'application/json'
            },
            timeout=aiohttp.ClientTimeout(total=30)
        )
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        if self.session:
            await self.session.close()
    
    async def send_transactional_email(self, email_data: Dict[str, any]) -> Dict[str, any]:
        """Send transactional email via Brevo API."""
        
        url = f"{self.api_url}/smtp/email"
        
        async with self.session.post(url, json=email_data) as response:
            if response.status == 201:
                result = await response.json()
                return result
            else:
                error_text = await response.text()
                raise Exception(f"Brevo API error: {response.status} - {error_text}")
    
    async def get_email_statistics(self, days: int = 30) -> Dict[str, any]:
        """Get email statistics from Brevo."""
        
        end_date = datetime.utcnow()
        start_date = end_date - timedelta(days=days)
        
        url = f"{self.api_url}/emailCampaigns/statistics"
        params = {
            'startDate': start_date.strftime('%Y-%m-%d'),
            'endDate': end_date.strftime('%Y-%m-%d')
        }
        
        async with self.session.get(url, params=params) as response:
            if response.status == 200:
                return await response.json()
            else:
                raise Exception(f"Failed to get statistics: {response.status}")
    
    async def add_contact_to_list(self, email: str, attributes: Dict[str, any], list_id: int) -> Dict[str, any]:
        """Add contact to Brevo list for automation."""
        
        url = f"{self.api_url}/contacts"
        
        contact_data = {
            'email': email,
            'attributes': attributes,
            'listIds': [list_id],
            'updateEnabled': True
        }
        
        async with self.session.post(url, json=contact_data) as response:
            if response.status in [201, 204]:
                return {'status': 'success'}
            else:
                error_text = await response.text()
                raise Exception(f"Failed to add contact: {response.status} - {error_text}")
```

## Configuration and Environment

### Environment Variables
```bash
# Brevo/SMTP Configuration
BREVO_API_KEY=your_brevo_api_key
BREVO_SMTP_SERVER=smtp-relay.brevo.com
BREVO_SMTP_PORT=587
BREVO_SMTP_USERNAME=your_smtp_username
BREVO_SMTP_PASSWORD=your_smtp_password

# Email Settings
DEFAULT_FROM_EMAIL=noreply@voltaic.systems
WHITEPAPER_FROM_EMAIL=whitepapers@voltaic.systems
SUPPORT_FROM_EMAIL=support@voltaic.systems

# Template Configuration
WHITEPAPER_DOWNLOAD_TEMPLATE_ID=1
AUTHOR_CONFIRMATION_TEMPLATE_ID=2
PUBLICATION_NOTICE_TEMPLATE_ID=3

# Rate Limiting
EMAIL_RATE_LIMIT=300  # emails per hour
EMAIL_BATCH_SIZE=100
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAY=5

# List IDs for automation
WHITEPAPER_NURTURING_LIST_ID=1
AUTHOR_NOTIFICATION_LIST_ID=2
```

### Admin Configuration Interface
```typescript
// Admin panel email configuration
interface EmailConfiguration {
  brevoSettings: {
    apiKey: string;
    smtpServer: string;
    smtpPort: number;
    smtpUsername: string;
    smtpPassword: string;
    testConnection: () => Promise<boolean>;
  };
  
  senderProfiles: {
    default: SenderProfile;
    whitepaper: SenderProfile;
    support: SenderProfile;
    custom: SenderProfile[];
  };
  
  templates: {
    whitepaperDownload: TemplateConfig;
    authorConfirmation: TemplateConfig;
    publicationNotice: TemplateConfig;
    nurturingSequence: TemplateConfig[];
  };
  
  automation: {
    enableNurturing: boolean;
    nurturingDelay: number[]; // days
    leadScoringThreshold: number;
    maxNurturingEmails: number;
  };
  
  delivery: {
    rateLimitPerHour: number;
    batchSize: number;
    retryAttempts: number;
    retryDelay: number;
  };
}

interface SenderProfile {
  name: string;
  email: string;
  replyTo?: string;
  isActive: boolean;
}

interface TemplateConfig {
  templateId: number;
  subject: string;
  isActive: boolean;
  tags: string[];
  customization: {
    allowCustomSubject: boolean;
    allowCustomContent: boolean;
    requiredParameters: string[];
  };
}
```

## Monitoring and Analytics

### Email Performance Tracking
```python
class EmailAnalyticsService:
    """Track and analyze email performance."""
    
    def get_whitepaper_email_metrics(self, whitepaper_id: int, days: int = 30) -> Dict[str, any]:
        """Get email metrics for specific whitepaper."""
        
        # Get emails related to this whitepaper
        emails = self.db.query(EmailLog).filter(
            EmailLog.whitepaper_id == whitepaper_id,
            EmailLog.sent_at >= datetime.utcnow() - timedelta(days=days)
        ).all()
        
        total_sent = len(emails)
        delivered = len([e for e in emails if e.delivery_status == 'delivered'])
        opened = len([e for e in emails if e.opened_at is not None])
        clicked = len([e for e in emails if e.clicked_at is not None])
        
        return {
            'total_sent': total_sent,
            'delivered': delivered,
            'opened': opened,
            'clicked': clicked,
            'delivery_rate': (delivered / total_sent * 100) if total_sent > 0 else 0,
            'open_rate': (opened / delivered * 100) if delivered > 0 else 0,
            'click_rate': (clicked / delivered * 100) if delivered > 0 else 0,
            'conversion_impact': self._calculate_conversion_impact(whitepaper_id, emails)
        }
    
    def get_author_engagement_metrics(self, author_email: str) -> Dict[str, any]:
        """Get engagement metrics for author emails."""
        
        author_emails = self.db.query(EmailLog).filter(
            EmailLog.recipient_email == author_email,
            EmailLog.email_type.in_(['author_confirmation', 'publication_notice'])
        ).all()
        
        return {
            'total_notifications': len(author_emails),
            'confirmations_sent': len([e for e in author_emails if e.email_type == 'author_confirmation']),
            'publication_notices': len([e for e in author_emails if e.email_type == 'publication_notice']),
            'avg_open_rate': np.mean([1 if e.opened_at else 0 for e in author_emails]),
            'response_time': self._calculate_avg_response_time(author_emails)
        }
```

## Error Handling and Resilience

### Retry Logic and Error Recovery
```python
class EmailDeliveryService:
    """Robust email delivery with retry logic."""
    
    async def send_email_with_retry(
        self, 
        email_data: Dict[str, any], 
        max_retries: int = 3
    ) -> Dict[str, any]:
        """Send email with automatic retry on failure."""
        
        last_error = None
        
        for attempt in range(max_retries):
            try:
                # Attempt to send email
                result = await self.brevo_client.send_transactional_email(email_data)
                
                # Log successful delivery
                await self._log_email_success(email_data, result)
                
                return {
                    'success': True,
                    'message_id': result['messageId'],
                    'attempt': attempt + 1
                }
                
            except Exception as e:
                last_error = e
                
                # Log failed attempt
                await self._log_email_attempt(email_data, attempt + 1, str(e))
                
                if attempt < max_retries - 1:
                    # Wait before retry with exponential backoff
                    wait_time = 2 ** attempt
                    await asyncio.sleep(wait_time)
                    
                    self.logger.warning(
                        f"Email delivery attempt {attempt + 1} failed, retrying in {wait_time}s: {e}"
                    )
        
        # All retries failed
        await self._log_email_failure(email_data, str(last_error))
        
        return {
            'success': False,
            'error': str(last_error),
            'attempts': max_retries
        }
```

## Testing Strategy

### Email Testing Framework
```python
# tests/test_email_integration.py
class TestBrevoIntegration:
    
    @pytest.mark.asyncio
    async def test_whitepaper_download_email(self):
        """Test whitepaper download email delivery."""
        
        # Create test data
        lead = create_test_lead()
        whitepaper = create_test_whitepaper()
        token = "test_download_token"
        
        # Mock Brevo client
        with patch('services.brevo_client.BrevoClient.send_transactional_email') as mock_send:
            mock_send.return_value = {'messageId': 'test_message_id'}
            
            # Send email
            service = WhitepaperEmailService(mock_brevo_client)
            result = await service.send_download_email(lead, whitepaper, token)
            
            # Verify
            assert result['success'] == True
            assert result['message_id'] == 'test_message_id'
            mock_send.assert_called_once()
    
    @pytest.mark.asyncio
    async def test_author_notification_sequence(self):
        """Test author notification email sequence."""
        
        whitepaper = create_test_whitepaper()
        submission = create_test_submission()
        
        service = WhitepaperEmailService(mock_brevo_client)
        
        # Test confirmation email
        result1 = await service.send_author_confirmation(whitepaper, submission)
        assert result1['success'] == True
        
        # Test publication notice
        result2 = await service.send_publication_notice(whitepaper)
        assert result2['success'] == True
    
    def test_template_rendering(self):
        """Test email template rendering."""
        
        template_service = EmailTemplateService(mock_brevo_client)
        
        params = {
            'lead_name': 'John Doe',
            'whitepaper_title': 'AI Strategy Guide',
            'download_url': 'https://example.com/download'
        }
        
        rendered = template_service.render_template('whitepaper_download', params)
        
        assert 'John Doe' in rendered['html_content']
        assert 'AI Strategy Guide' in rendered['subject']
        assert 'https://example.com/download' in rendered['html_content']
```

## Cross-References and Integration Points

### Related Specifications
’ **Whitepaper Feature**: [Lead Capture System](../frontend/public/features/whitepapers.md#lead-capture-system)
’ **Admin Panel**: [Email Management Interface](../frontend/adminpanel/admin.md#email-management)
’ **Backend API**: [Email Service Endpoints](../backend/api.md#email-service-endpoints)
 **Database**: [Email Logs and Templates](../backend/database.md#email-logs)
” **CRM Integration**: [Lead Synchronization](odoo-crm.md#lead-export)

### Business Impact
- **Lead Nurturing**: Automated email sequences to convert leads into customers
- **Author Experience**: Professional communication for content contributors  
- **Brand Consistency**: Standardized email templates and messaging
- **Performance Tracking**: Complete analytics for email campaign optimization

This comprehensive SMTP-Brevo integration specification ensures professional, reliable email delivery for all whitepaper-related communications while providing the flexibility and monitoring capabilities needed for effective email marketing and automation.