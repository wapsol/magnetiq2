import asyncio
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email.mime.base import MIMEBase
from email import encoders
from typing import List, Optional, Dict, Any
from jinja2 import Template
from datetime import datetime
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class SMTPEmailService:
    """SMTP email service for sending booking confirmations and notifications via Brevo"""
    
    def __init__(self):
        self.smtp_host = settings.smtp_host
        self.smtp_port = settings.smtp_port
        self.smtp_username = settings.smtp_username
        self.smtp_password = settings.smtp_password
        self.from_email = settings.smtp_from_email
        self.from_name = settings.smtp_from_name
        self.smtp_use_tls = settings.smtp_use_tls
        self.smtp_use_starttls = settings.smtp_use_starttls
        
    async def send_email(
        self,
        to: List[str],
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None
    ) -> bool:
        """Send email via SMTP"""
        
        if not settings.is_smtp_configured():
            logger.debug(f"Skipping email send to {', '.join(to)} - SMTP not configured")
            
            # Still log the email content that would have been sent
            logger.info("=" * 80)
            logger.info(f"EMAIL CONTENT (NOT SENT - SMTP NOT CONFIGURED)")
            logger.info(f"EMAIL CONTENT - TO: {', '.join(to)}")
            logger.info(f"EMAIL CONTENT - SUBJECT: {subject}")
            logger.info(f"EMAIL CONTENT - FROM: {self.from_name} <{self.from_email}>")
            if text_content:
                logger.info("EMAIL CONTENT - TEXT VERSION:")
                logger.info("-" * 40)
                logger.info(text_content)
                logger.info("-" * 40)
            logger.info("EMAIL CONTENT - HTML VERSION:")
            logger.info("-" * 40)
            logger.info(html_content)
            logger.info("-" * 40)
            if attachments:
                logger.info(f"EMAIL CONTENT - ATTACHMENTS: {len(attachments)} file(s)")
                for i, attachment in enumerate(attachments):
                    logger.info(f"  Attachment {i+1}: {attachment.get('filename', 'unnamed')} ({len(attachment.get('content', b''))} bytes)")
            logger.info("=" * 80)
            return False
        
        logger.info(f"Attempting to send email to: {', '.join(to)}, Subject: {subject}")
        
        # Log SMTP connection details
        tls_mode = "STARTTLS" if self.smtp_use_starttls else ("TLS" if self.smtp_use_tls else "Plain")
        logger.info(f"SMTP Connection: {self.smtp_host}:{self.smtp_port} ({tls_mode})")
        
        # Log email content for debugging and audit purposes
        logger.info("=" * 80)
        logger.info(f"EMAIL CONTENT - TO: {', '.join(to)}")
        logger.info(f"EMAIL CONTENT - SUBJECT: {subject}")
        logger.info(f"EMAIL CONTENT - FROM: {self.from_name} <{self.from_email}>")
        if text_content:
            logger.info("EMAIL CONTENT - TEXT VERSION:")
            logger.info("-" * 40)
            logger.info(text_content)
            logger.info("-" * 40)
        logger.info("EMAIL CONTENT - HTML VERSION:")
        logger.info("-" * 40)
        logger.info(html_content)
        logger.info("-" * 40)
        if attachments:
            logger.info(f"EMAIL CONTENT - ATTACHMENTS: {len(attachments)} file(s)")
            for i, attachment in enumerate(attachments):
                logger.info(f"  Attachment {i+1}: {attachment.get('filename', 'unnamed')} ({len(attachment.get('content', b''))} bytes)")
        logger.info("=" * 80)
        
        try:
            # Create message
            message = MIMEMultipart('alternative')
            message['From'] = f"{self.from_name} <{self.from_email}>"
            message['To'] = ", ".join(to)
            message['Subject'] = subject
            
            # Add text content
            if text_content:
                text_part = MIMEText(text_content, 'plain', 'utf-8')
                message.attach(text_part)
            
            # Add HTML content
            html_part = MIMEText(html_content, 'html', 'utf-8')
            message.attach(html_part)
            
            # Add attachments
            if attachments:
                for attachment in attachments:
                    if 'content' in attachment and 'filename' in attachment:
                        part = MIMEBase('application', 'octet-stream')
                        part.set_payload(attachment['content'])
                        encoders.encode_base64(part)
                        part.add_header(
                            'Content-Disposition',
                            f'attachment; filename= {attachment["filename"]}'
                        )
                        message.attach(part)
            
            # Send email
            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_username,
                password=self.smtp_password,
                start_tls=self.smtp_use_starttls,
                use_tls=self.smtp_use_tls,
                timeout=30
            )
            
            logger.info("=" * 80)
            logger.info(f"EMAIL DELIVERY SUCCESS - Email sent to: {', '.join(to)}")
            logger.info(f"EMAIL DELIVERY SUCCESS - Subject: {subject}")
            logger.info("=" * 80)
            return True
            
        except Exception as e:
            logger.info("=" * 80)
            logger.info(f"EMAIL DELIVERY FAILED - Recipients: {', '.join(to)}")
            logger.info(f"EMAIL DELIVERY FAILED - Subject: {subject}")
            logger.info(f"EMAIL DELIVERY FAILED - Error: {type(e).__name__}: {str(e)}")
            logger.info(f"EMAIL DELIVERY FAILED - SMTP: {self.smtp_host}:{self.smtp_port}")
            logger.info("=" * 80)
            
            logger.error(f"Failed to send email to {', '.join(to)}")
            logger.error(f"Email error details: {type(e).__name__}: {str(e)}")
            logger.error(f"SMTP Configuration - Host: {self.smtp_host}, Port: {self.smtp_port}")
            logger.error(f"Subject: {subject}")
            return False
    
    def generate_customer_email_template(
        self,
        customer_name: str,
        customer_title: Optional[str],
        consultant_name: str,
        consultant_email: str,
        consultant_role: str,
        booking_date: datetime,
        start_time: str,
        end_time: str,
        booking_reference: str,
        language: str = "en"
    ) -> Dict[str, str]:
        """Generate customer confirmation email template"""
        
        # Date formatting
        if language == "de":
            date_formatted = booking_date.strftime("%A, %d. %B %Y")
        else:
            date_formatted = booking_date.strftime("%A, %B %d, %Y")
        
        # Customer name with title
        full_customer_name = f"{customer_title} {customer_name}" if customer_title else customer_name
        
        # Templates
        if language == "de":
            subject = "Bestätigung Ihrer Beratung bei voltAIc Systems"
            html_template = """
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Beratungstermin Bestätigung</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; font-size: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 29px; }
        .header p { margin: 10px 0 0; font-size: 17px; opacity: 0.9; }
        .content { padding: 40px 20px; max-width: 600px; margin: 0 auto; }
        .content p { font-size: 20px; }
        .greeting { font-size: 20px; margin-bottom: 25px; }
        .booking-details { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea; }
        .booking-details h3 { margin: 0 0 15px; color: #667eea; font-size: 21px; }
        .detail-row { display: flex; margin-bottom: 10px; }
        .detail-label { font-weight: bold; min-width: 120px; color: #555; font-size: 20px; }
        .detail-value { color: #333; font-size: 20px; }
        .consultant-info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .consultant-info h4 { margin: 0 0 10px; color: #1976d2; font-size: 20px; }
        .consultant-info p { font-size: 20px; margin: 5px 0; }
        .next-steps { background: #fff3e0; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .next-steps h4 { margin: 0 0 15px; color: #f57c00; font-size: 20px; }
        .next-steps ul { margin: 0; padding-left: 20px; }
        .next-steps li { font-size: 20px; margin-bottom: 8px; }
        .footer { background: #f8f9fa; padding: 25px 20px; text-align: center; border-top: 1px solid #e0e0e0; }
        .footer p { margin: 5px 0; font-size: 15px; color: #666; }
        .reference { font-family: monospace; background: #f5f5f5; padding: 5px 10px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>voltAIc Systems</h1>
        <p>Beratungstermin Bestätigung</p>
    </div>
    
    <div class="content">
        <p class="greeting">Lieber {{ customer_name }},</p>
        
        <p>vielen Dank für Ihr Interesse an voltAIc Systems! Wir freuen uns, Ihnen die Bestätigung Ihres Beratungstermins zu senden.</p>
        
        <div class="booking-details">
            <h3>📅 Termindetails</h3>
            <div class="detail-row">
                <span class="detail-label">Datum:</span>
                <span class="detail-value">{{ booking_date }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Uhrzeit:</span>
                <span class="detail-value">{{ start_time }} - {{ end_time }} ({{ timezone }})</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Referenz:</span>
                <span class="detail-value reference">{{ booking_reference }}</span>
            </div>
        </div>
        
        <div class="consultant-info">
            <h4>👨‍💼 Ihr Berater</h4>
            <p><strong>{{ consultant_name }}</strong></p>
            <p>{{ consultant_role }}</p>
            <p>📧 {{ consultant_email }}</p>
        </div>
        
        <div class="next-steps">
            <h4>🚀 Nächste Schritte</h4>
            <ul>
                <li>Sie erhalten eine separate Kalendereinladung per E-Mail</li>
                <li>Eine Erinnerungs-E-Mail wird 24 Stunden vor dem Termin gesendet</li>
                <li>Der Termin findet online oder telefonisch statt - Details folgen</li>
                <li>Bei Fragen kontaktieren Sie uns unter {{ business_email }}</li>
            </ul>
        </div>
        
        <p>Wir freuen uns auf unser Gespräch und darauf, Ihnen zu zeigen, wie voltAIc Systems Ihr Unternehmen mit KI-Lösungen transformieren kann.</p>
        
        <p>Mit freundlichen Grüßen,<br>
        Das voltAIc Systems Team</p>
    </div>
    
    <div class="footer">
        <p>© 2025 voltAIc Systems. All rights reserved.</p>
        <p>Diese E-Mail wurde automatisch generiert. Bitte antworten Sie nicht direkt auf diese Nachricht.</p>
    </div>
</body>
</html>
"""
            text_content = f"""
voltAIc Systems - Beratungstermin Bestätigung

Lieber {full_customer_name},

vielen Dank für Ihr Interesse an voltAIc Systems! 

Termindetails:
- Datum: {date_formatted}
- Uhrzeit: {start_time} - {end_time} (Europe/Berlin)
- Referenz: {booking_reference}

Ihr Berater:
{consultant_name}
{consultant_role}
{consultant_email}

Nächste Schritte:
- Sie erhalten eine separate Kalendereinladung per E-Mail
- Eine Erinnerungs-E-Mail wird 24 Stunden vor dem Termin gesendet
- Bei Fragen kontaktieren Sie uns unter {settings.business_email_crm}

Mit freundlichen Grüßen,
Das voltAIc Systems Team

© 2025 voltAIc Systems. All rights reserved.
"""
        else:
            subject = "Consultation Confirmation - voltAIc Systems"
            html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Consultation Confirmation</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; font-size: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 29px; }
        .header p { margin: 10px 0 0; font-size: 17px; opacity: 0.9; }
        .content { padding: 40px 20px; max-width: 600px; margin: 0 auto; }
        .content p { font-size: 20px; }
        .greeting { font-size: 20px; margin-bottom: 25px; }
        .booking-details { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea; }
        .booking-details h3 { margin: 0 0 15px; color: #667eea; font-size: 21px; }
        .detail-row { display: flex; margin-bottom: 10px; }
        .detail-label { font-weight: bold; min-width: 120px; color: #555; font-size: 20px; }
        .detail-value { color: #333; font-size: 20px; }
        .consultant-info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .consultant-info h4 { margin: 0 0 10px; color: #1976d2; font-size: 20px; }
        .consultant-info p { font-size: 20px; margin: 5px 0; }
        .next-steps { background: #fff3e0; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .next-steps h4 { margin: 0 0 15px; color: #f57c00; font-size: 20px; }
        .next-steps ul { margin: 0; padding-left: 20px; }
        .next-steps li { font-size: 20px; margin-bottom: 8px; }
        .footer { background: #f8f9fa; padding: 25px 20px; text-align: center; border-top: 1px solid #e0e0e0; }
        .footer p { margin: 5px 0; font-size: 15px; color: #666; }
        .reference { font-family: monospace; background: #f5f5f5; padding: 5px 10px; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>voltAIc Systems</h1>
        <p>Consultation Confirmation</p>
    </div>
    
    <div class="content">
        <p class="greeting">Dear {{ customer_name }},</p>
        
        <p>Thank you for your interest in voltAIc Systems! We're pleased to confirm your consultation appointment.</p>
        
        <div class="booking-details">
            <h3>📅 Appointment Details</h3>
            <div class="detail-row">
                <span class="detail-label">Date:</span>
                <span class="detail-value">{{ booking_date }}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time:</span>
                <span class="detail-value">{{ start_time }} - {{ end_time }} ({{ timezone }})</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Reference:</span>
                <span class="detail-value reference">{{ booking_reference }}</span>
            </div>
        </div>
        
        <div class="consultant-info">
            <h4>👨‍💼 Your Consultant</h4>
            <p><strong>{{ consultant_name }}</strong></p>
            <p>{{ consultant_role }}</p>
            <p>📧 {{ consultant_email }}</p>
        </div>
        
        <div class="next-steps">
            <h4>🚀 Next Steps</h4>
            <ul>
                <li>You'll receive a separate calendar invitation via email</li>
                <li>A reminder email will be sent 24 hours before the appointment</li>
                <li>The meeting will be conducted online or by phone - details to follow</li>
                <li>For any questions, contact us at {{ business_email }}</li>
            </ul>
        </div>
        
        <p>We look forward to our conversation and showing you how voltAIc Systems can transform your business with AI solutions.</p>
        
        <p>Best regards,<br>
        The voltAIc Systems Team</p>
    </div>
    
    <div class="footer">
        <p>© 2025 voltAIc Systems. All rights reserved.</p>
        <p>This email was automatically generated. Please do not reply directly to this message.</p>
    </div>
</body>
</html>
"""
            text_content = f"""
voltAIc Systems - Consultation Confirmation

Dear {full_customer_name},

Thank you for your interest in voltAIc Systems!

Appointment Details:
- Date: {date_formatted}
- Time: {start_time} - {end_time} (Europe/Berlin)
- Reference: {booking_reference}

Your Consultant:
{consultant_name}
{consultant_role}
{consultant_email}

Next Steps:
- You'll receive a separate calendar invitation via email
- A reminder email will be sent 24 hours before the appointment
- For any questions, contact us at {settings.business_email_crm}

Best regards,
The voltAIc Systems Team

© 2025 voltAIc Systems. All rights reserved.
"""
        
        # Render template
        template = Template(html_template)
        html_content = template.render(
            customer_name=full_customer_name,
            consultant_name=consultant_name,
            consultant_email=consultant_email,
            consultant_role=consultant_role,
            booking_date=date_formatted,
            start_time=start_time,
            end_time=end_time,
            timezone="Europe/Berlin",
            booking_reference=booking_reference,
            business_email=settings.business_email_crm
        )
        
        return {
            "subject": subject,
            "html_content": html_content,
            "text_content": text_content
        }
    
    def generate_internal_email_template(
        self,
        customer_name: str,
        customer_title: Optional[str],
        customer_email: str,
        customer_phone: str,
        customer_company: str,
        consultant_name: str,
        consultant_email: str,
        booking_date: datetime,
        start_time: str,
        end_time: str,
        booking_reference: str,
        calendar_status: str = 'unknown'
    ) -> Dict[str, str]:
        """Generate internal notification email template"""
        
        date_formatted = booking_date.strftime("%A, %B %d, %Y")
        full_customer_name = f"{customer_title} {customer_name}" if customer_title else customer_name
        
        # Create calendar status alert
        calendar_alert_html = ""
        calendar_alert_text = ""
        
        if calendar_status in ['not_configured', 'credentials_invalid', 'api_error', 'error']:
            calendar_alert_html = """
        <div class="calendar-alert" style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 15px 0; border-left: 4px solid #ffc107;">
            <h3>⚠️ CALENDAR ALERT</h3>
            <p><strong>Calendar lookup was not possible for this booking.</strong></p>
            <p>There is a small chance of scheduling conflict. Please confirm this meeting with the customer personally by phone or email to avoid conflicts.</p>
            <p>Calendar status: """ + calendar_status.replace('_', ' ').title() + """</p>
        </div>"""
            
            calendar_alert_text = f"""
⚠️ CALENDAR ALERT ⚠️
Calendar lookup was not possible for this booking.
There is a small chance of scheduling conflict. Please confirm this meeting with the customer personally by phone or email to avoid conflicts.
Calendar status: {calendar_status.replace('_', ' ').title()}
"""

        subject = f"New Consultation Booking - {full_customer_name} with {consultant_name}"
        if calendar_status in ['not_configured', 'credentials_invalid', 'api_error', 'error']:
            subject = f"⚠️ " + subject + " (Calendar Alert)"
        
        html_content = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; font-size: 18px; }}
        .header {{ background: #f8f9fa; padding: 20px; border-bottom: 3px solid #667eea; }}
        .content {{ padding: 20px; }}
        .booking-info {{ background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0; }}
        .customer-info {{ background: #e3f2fd; padding: 15px; border-radius: 5px; margin: 15px 0; }}
        .reference {{ font-family: monospace; background: #fff; padding: 5px 10px; border-radius: 4px; }}
    </style>
</head>
<body>
    <div class="header">
        <h2>🆕 New Consultation Booking</h2>
        <p>A new consultation has been booked through the website.</p>
    </div>
    
    <div class="content">
        {calendar_alert_html}
        
        <div class="booking-info">
            <h3>📅 Booking Details</h3>
            <p><strong>Reference:</strong> <span class="reference">{booking_reference}</span></p>
            <p><strong>Consultant:</strong> {consultant_name}</p>
            <p><strong>Date:</strong> {date_formatted}</p>
            <p><strong>Time:</strong> {start_time} - {end_time} (Europe/Berlin)</p>
            <p><strong>Duration:</strong> 60 minutes</p>
        </div>
        
        <div class="customer-info">
            <h3>👤 Customer Information</h3>
            <p><strong>Name:</strong> {full_customer_name}</p>
            <p><strong>Email:</strong> {customer_email}</p>
            <p><strong>Phone:</strong> {customer_phone}</p>
            <p><strong>Company:</strong> {customer_company}</p>
        </div>
        
        <h4>✅ Next Steps:</h4>
        <ul>
            <li>Calendar event will be created automatically</li>
            <li>Customer confirmation email has been sent</li>
            <li>Calendar invitation will be sent to customer</li>
            <li>Consider updating CRM with customer details</li>
            <li>Prepare consultation materials based on customer profile</li>
        </ul>
        
        <p><em>This notification was generated automatically by the booking system.</em></p>
    </div>
</body>
</html>
"""
        
        text_content = f"""
New Consultation Booking
{calendar_alert_text}
Booking Details:
Reference: {booking_reference}
Consultant: {consultant_name}
Date: {date_formatted}
Time: {start_time} - {end_time} (Europe/Berlin)
Duration: 60 minutes

Customer Information:
Name: {full_customer_name}
Email: {customer_email}
Phone: {customer_phone}
Company: {customer_company}

Next Steps:
- Calendar event will be created automatically
- Customer confirmation email has been sent
- Calendar invitation will be sent to customer
- Consider updating CRM with customer details
- Prepare consultation materials based on customer profile
"""
        
        return {
            "subject": subject,
            "html_content": html_content,
            "text_content": text_content
        }
    
    def generate_admin_user_welcome_template(
        self,
        full_name: str,
        email: str,
        password: str,
        admin_panel_url: str = "http://localhost:8036/admin",
        created_by_name: str = "System Administrator"
    ) -> Dict[str, str]:
        """Generate welcome email template for new admin users"""
        
        subject = "Welcome to voltAIc Systems Admin Panel - Account Created"
        
        html_template = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to voltAIc Systems Admin Panel</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; font-size: 16px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0; font-size: 16px; opacity: 0.9; }
        .content { padding: 40px 20px; max-width: 600px; margin: 0 auto; }
        .welcome { font-size: 18px; margin-bottom: 25px; color: #333; }
        .credentials-box { background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #667eea; }
        .credentials-box h3 { margin: 0 0 15px; color: #667eea; font-size: 20px; }
        .credential-row { display: flex; margin-bottom: 12px; align-items: center; }
        .credential-label { font-weight: bold; min-width: 100px; color: #555; }
        .credential-value { color: #333; font-family: monospace; background: #fff; padding: 8px 12px; border-radius: 4px; border: 1px solid #ddd; flex: 1; margin-left: 10px; }
        .login-info { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 25px 0; }
        .login-info h4 { margin: 0 0 15px; color: #1976d2; font-size: 18px; }
        .login-button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 15px 0; }
        .security-notice { background: #fff3e0; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ff9800; }
        .security-notice h4 { margin: 0 0 15px; color: #f57c00; font-size: 18px; }
        .security-notice ul { margin: 0; padding-left: 20px; }
        .security-notice li { margin-bottom: 8px; }
        .footer { background: #f8f9fa; padding: 25px 20px; text-align: center; border-top: 1px solid #e0e0e0; }
        .footer p { margin: 5px 0; font-size: 14px; color: #666; }
        .support-info { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="header">
        <h1>voltAIc Systems</h1>
        <p>Admin Panel Access</p>
    </div>
    
    <div class="content">
        <p class="welcome">Hello {{ full_name }},</p>
        
        <p>Welcome to the voltAIc Systems Admin Panel! Your administrator account has been created by {{ created_by_name }}. You now have access to manage the voltAIc Systems platform.</p>
        
        <div class="credentials-box">
            <h3>🔐 Your Login Credentials</h3>
            <div class="credential-row">
                <span class="credential-label">Email:</span>
                <span class="credential-value">{{ email }}</span>
            </div>
            <div class="credential-row">
                <span class="credential-label">Password:</span>
                <span class="credential-value">{{ password }}</span>
            </div>
        </div>
        
        <div class="login-info">
            <h4>🚀 Getting Started</h4>
            <p>You can access the admin panel using the button below:</p>
            <a href="{{ admin_panel_url }}" class="login-button">Access Admin Panel</a>
            <p><strong>Admin Panel URL:</strong> {{ admin_panel_url }}</p>
        </div>
        
        <div class="security-notice">
            <h4>🔒 Important Security Information</h4>
            <ul>
                <li><strong>Change your password immediately</strong> after your first login</li>
                <li>Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters</li>
                <li>Never share your login credentials with anyone</li>
                <li>Always log out when finished using the admin panel</li>
                <li>Report any suspicious activity to the system administrators</li>
            </ul>
        </div>
        
        <div class="support-info">
            <h4>📞 Need Help?</h4>
            <p>If you have any questions or need assistance with your admin account, please contact our support team at <strong>{{ business_email }}</strong></p>
        </div>
        
        <p>We're excited to have you as part of the voltAIc Systems admin team!</p>
        
        <p>Best regards,<br>
        The voltAIc Systems Team</p>
    </div>
    
    <div class="footer">
        <p>© 2025 voltAIc Systems. All rights reserved.</p>
        <p>This email contains sensitive information. Please handle with care and do not forward.</p>
    </div>
</body>
</html>
"""
        
        text_content = f"""
voltAIc Systems - Admin Panel Access

Hello {full_name},

Welcome to the voltAIc Systems Admin Panel! Your administrator account has been created by {created_by_name}. You now have access to manage the voltAIc Systems platform.

YOUR LOGIN CREDENTIALS:
Email: {email}
Password: {password}

GETTING STARTED:
You can access the admin panel at: {admin_panel_url}

IMPORTANT SECURITY INFORMATION:
- Change your password immediately after your first login
- Use a strong password with at least 8 characters, including uppercase, lowercase, numbers, and special characters
- Never share your login credentials with anyone
- Always log out when finished using the admin panel
- Report any suspicious activity to the system administrators

NEED HELP?
If you have any questions or need assistance with your admin account, please contact our support team at {settings.business_email_crm}

We're excited to have you as part of the voltAIc Systems admin team!

Best regards,
The voltAIc Systems Team

© 2025 voltAIc Systems. All rights reserved.
This email contains sensitive information. Please handle with care and do not forward.
"""
        
        # Render HTML template
        template = Template(html_template)
        html_content = template.render(
            full_name=full_name,
            email=email,
            password=password,
            admin_panel_url=admin_panel_url,
            created_by_name=created_by_name,
            business_email=settings.business_email_crm
        )
        
        return {
            "subject": subject,
            "html_content": html_content,
            "text_content": text_content
        }
    
    async def send_admin_user_welcome_email(
        self,
        user_email: str,
        full_name: str,
        password: str,
        admin_panel_url: str = "http://localhost:8036/admin",
        created_by_name: str = "System Administrator"
    ) -> bool:
        """Send welcome email to new admin user with credentials"""
        try:
            # Generate email template
            email_template = self.generate_admin_user_welcome_template(
                full_name=full_name,
                email=user_email,
                password=password,
                admin_panel_url=admin_panel_url,
                created_by_name=created_by_name
            )
            
            # Send email
            success = await self.send_email(
                to=[user_email],
                subject=email_template["subject"],
                html_content=email_template["html_content"],
                text_content=email_template["text_content"]
            )
            
            if success:
                logger.info(f"Admin welcome email sent successfully to: {user_email}")
            else:
                logger.warning(f"Failed to send admin welcome email to: {user_email}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error sending admin welcome email to {user_email}: {type(e).__name__}: {str(e)}")
            return False

    async def send_booking_confirmation_email(
        self,
        customer_email: str,
        customer_name: str,
        customer_title: Optional[str],
        consultant_name: str,
        consultant_email: str,
        consultant_role: str,
        booking_date: datetime,
        start_time: str,
        end_time: str,
        booking_reference: str,
        language: str = "en"
    ) -> bool:
        """Send booking confirmation email to customer"""
        try:
            # Generate email template
            email_template = self.generate_customer_email_template(
                customer_name=customer_name,
                customer_title=customer_title,
                consultant_name=consultant_name,
                consultant_email=consultant_email,
                consultant_role=consultant_role,
                booking_date=booking_date,
                start_time=start_time,
                end_time=end_time,
                booking_reference=booking_reference,
                language=language
            )
            
            # Send email
            success = await self.send_email(
                to=[customer_email],
                subject=email_template["subject"],
                html_content=email_template["html_content"],
                text_content=email_template["text_content"]
            )
            
            if success:
                logger.info(f"Booking confirmation email sent successfully to: {customer_email}")
            else:
                logger.warning(f"Failed to send booking confirmation email to: {customer_email}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error sending booking confirmation email to {customer_email}: {type(e).__name__}: {str(e)}")
            return False

    async def send_internal_booking_notification(
        self,
        internal_emails: List[str],
        customer_name: str,
        customer_title: Optional[str],
        customer_email: str,
        customer_phone: str,
        customer_company: str,
        consultant_name: str,
        consultant_email: str,
        booking_date: datetime,
        start_time: str,
        end_time: str,
        booking_reference: str,
        calendar_status: str = 'unknown'
    ) -> bool:
        """Send internal notification email about new booking"""
        try:
            # Generate email template
            email_template = self.generate_internal_email_template(
                customer_name=customer_name,
                customer_title=customer_title,
                customer_email=customer_email,
                customer_phone=customer_phone,
                customer_company=customer_company,
                consultant_name=consultant_name,
                consultant_email=consultant_email,
                booking_date=booking_date,
                start_time=start_time,
                end_time=end_time,
                booking_reference=booking_reference,
                calendar_status=calendar_status
            )
            
            # Send email
            success = await self.send_email(
                to=internal_emails,
                subject=email_template["subject"],
                html_content=email_template["html_content"],
                text_content=email_template["text_content"]
            )
            
            if success:
                logger.info(f"Internal booking notification sent successfully to: {', '.join(internal_emails)}")
            else:
                logger.warning(f"Failed to send internal booking notification to: {', '.join(internal_emails)}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error sending internal booking notification: {type(e).__name__}: {str(e)}")
            return False


# Global service instance
email_service = SMTPEmailService()