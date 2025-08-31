from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks, status
from typing import List
import logging

from app.schemas.email import (
    EmailRequest,
    EmailResponse,
    BookingConfirmationEmailRequest,
    InternalNotificationEmailRequest,
    AdminWelcomeEmailRequest,
    WebinarRegistrationEmailRequest,
    WhitepaperDownloadEmailRequest,
    NewsletterSubscriptionEmailRequest,
    ContactFormEmailRequest,
    EmailTemplateRequest,
    EmailTemplateResponse,
    SMTPConfigResponse
)
from app.services.email_service import email_service
from app.dependencies import require_admin
from app.models.user import AdminUser
from app.config import settings

logger = logging.getLogger(__name__)

router = APIRouter(tags=["Email"])


@router.post("/send", response_model=EmailResponse)
async def send_email(
    email_request: EmailRequest,
    background_tasks: BackgroundTasks,
    current_user: AdminUser = Depends(require_admin())
):
    """
    Send a custom email (Admin only)
    """
    try:
        # Send email in background to avoid blocking
        background_tasks.add_task(
            email_service.send_email,
            to=email_request.to,
            subject=email_request.subject,
            html_content=email_request.html_content,
            text_content=email_request.text_content,
            attachments=email_request.attachments
        )
        
        return EmailResponse(
            success=True,
            message=f"Email queued for delivery to {len(email_request.to)} recipient(s)"
        )
        
    except Exception as e:
        logger.error(f"Failed to queue email: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to queue email for delivery"
        )


@router.post("/booking-confirmation", response_model=EmailResponse)
async def send_booking_confirmation(
    booking_request: BookingConfirmationEmailRequest,
    background_tasks: BackgroundTasks
):
    """
    Send booking confirmation email to customer
    """
    try:
        # Send email in background
        background_tasks.add_task(
            email_service.send_booking_confirmation_email,
            customer_email=booking_request.customer_email,
            customer_name=booking_request.customer_name,
            customer_title=booking_request.customer_title,
            consultant_name=booking_request.consultant_name,
            consultant_email=booking_request.consultant_email,
            consultant_role=booking_request.consultant_role,
            booking_date=booking_request.booking_date,
            start_time=booking_request.start_time,
            end_time=booking_request.end_time,
            booking_reference=booking_request.booking_reference,
            language=booking_request.language
        )
        
        return EmailResponse(
            success=True,
            message=f"Booking confirmation email queued for {booking_request.customer_email}"
        )
        
    except Exception as e:
        logger.error(f"Failed to queue booking confirmation email: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to queue booking confirmation email"
        )


@router.post("/internal-notification", response_model=EmailResponse)
async def send_internal_notification(
    notification_request: InternalNotificationEmailRequest,
    background_tasks: BackgroundTasks
):
    """
    Send internal booking notification email to admin/staff
    """
    try:
        # Send email in background
        background_tasks.add_task(
            email_service.send_internal_booking_notification,
            internal_emails=notification_request.internal_emails,
            customer_name=notification_request.customer_name,
            customer_title=notification_request.customer_title,
            customer_email=notification_request.customer_email,
            customer_phone=notification_request.customer_phone,
            customer_company=notification_request.customer_company,
            consultant_name=notification_request.consultant_name,
            consultant_email=notification_request.consultant_email,
            booking_date=notification_request.booking_date,
            start_time=notification_request.start_time,
            end_time=notification_request.end_time,
            booking_reference=notification_request.booking_reference,
            calendar_status=notification_request.calendar_status
        )
        
        return EmailResponse(
            success=True,
            message=f"Internal notification queued for {len(notification_request.internal_emails)} recipient(s)"
        )
        
    except Exception as e:
        logger.error(f"Failed to queue internal notification: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to queue internal notification email"
        )


@router.post("/admin-welcome", response_model=EmailResponse)
async def send_admin_welcome_email(
    welcome_request: AdminWelcomeEmailRequest,
    background_tasks: BackgroundTasks,
    current_user: AdminUser = Depends(require_admin())
):
    """
    Send welcome email to new admin user (Admin only)
    """
    try:
        # Send email in background
        background_tasks.add_task(
            email_service.send_admin_user_welcome_email,
            user_email=welcome_request.user_email,
            full_name=welcome_request.full_name,
            password=welcome_request.password,
            admin_panel_url=welcome_request.admin_panel_url,
            created_by_name=welcome_request.created_by_name
        )
        
        return EmailResponse(
            success=True,
            message=f"Admin welcome email queued for {welcome_request.user_email}"
        )
        
    except Exception as e:
        logger.error(f"Failed to queue admin welcome email: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to queue admin welcome email"
        )


@router.post("/webinar-registration", response_model=EmailResponse)
async def send_webinar_registration_confirmation(
    webinar_request: WebinarRegistrationEmailRequest,
    background_tasks: BackgroundTasks
):
    """
    Send webinar registration confirmation email
    """
    try:
        # For now, use the generic email method
        # This would be expanded with a dedicated webinar template in the future
        subject = f"Webinar Registration Confirmation - {webinar_request.webinar_title}"
        html_content = f"""
        <h2>Webinar Registration Confirmed</h2>
        <p>Dear {webinar_request.first_name} {webinar_request.last_name},</p>
        <p>Your registration for the webinar "<strong>{webinar_request.webinar_title}</strong>" has been confirmed.</p>
        <p><strong>Date & Time:</strong> {webinar_request.webinar_date.strftime('%A, %B %d, %Y at %H:%M')}</p>
        <p><strong>Duration:</strong> {webinar_request.webinar_duration} minutes</p>
        {f'<p><strong>Join URL:</strong> <a href="{webinar_request.meeting_url}">{webinar_request.meeting_url}</a></p>' if webinar_request.meeting_url else ''}
        {f'<p><strong>Presenter:</strong> {webinar_request.presenter_name}</p>' if webinar_request.presenter_name else ''}
        <p>We look forward to seeing you at the webinar!</p>
        <p>Best regards,<br>The voltAIc Systems Team</p>
        """
        
        background_tasks.add_task(
            email_service.send_email,
            to=[webinar_request.participant_email],
            subject=subject,
            html_content=html_content
        )
        
        return EmailResponse(
            success=True,
            message=f"Webinar registration confirmation queued for {webinar_request.participant_email}"
        )
        
    except Exception as e:
        logger.error(f"Failed to queue webinar registration email: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to queue webinar registration confirmation"
        )


@router.post("/whitepaper-download", response_model=EmailResponse)
async def send_whitepaper_download_confirmation(
    whitepaper_request: WhitepaperDownloadEmailRequest,
    background_tasks: BackgroundTasks
):
    """
    Send whitepaper download confirmation email
    """
    try:
        # For now, use the generic email method
        # This would be expanded with a dedicated whitepaper template in the future
        subject = f"Download Confirmation - {whitepaper_request.whitepaper_title}"
        html_content = f"""
        <h2>Whitepaper Download Confirmation</h2>
        <p>Dear {whitepaper_request.first_name} {whitepaper_request.last_name},</p>
        <p>Thank you for downloading "<strong>{whitepaper_request.whitepaper_title}</strong>".</p>
        <p><strong>Download Link:</strong> <a href="{whitepaper_request.download_url}">Download PDF</a></p>
        <p>We hope you find this resource valuable for your business.</p>
        <p>Best regards,<br>The voltAIc Systems Team</p>
        """
        
        background_tasks.add_task(
            email_service.send_email,
            to=[whitepaper_request.user_email],
            subject=subject,
            html_content=html_content
        )
        
        return EmailResponse(
            success=True,
            message=f"Whitepaper download confirmation queued for {whitepaper_request.user_email}"
        )
        
    except Exception as e:
        logger.error(f"Failed to queue whitepaper download email: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to queue whitepaper download confirmation"
        )


@router.post("/newsletter-subscription", response_model=EmailResponse)
async def send_newsletter_subscription_confirmation(
    subscription_request: NewsletterSubscriptionEmailRequest,
    background_tasks: BackgroundTasks
):
    """
    Send newsletter subscription confirmation email
    """
    try:
        # For now, use the generic email method
        subject = "Subscription Confirmed - voltAIc Systems Updates"
        html_content = f"""
        <h2>Subscription Confirmed</h2>
        <p>Dear {subscription_request.first_name or 'Subscriber'},</p>
        <p>Thank you for subscribing to voltAIc Systems updates!</p>
        <p>You'll receive notifications about:</p>
        <ul>
            <li>New insights and announcements</li>
            <li>Upcoming webinars and events</li>
            <li>Latest whitepapers and resources</li>
            <li>Product updates and features</li>
        </ul>
        <p>We're excited to keep you informed about the latest in AI and business transformation.</p>
        <p>Best regards,<br>The voltAIc Systems Team</p>
        """
        
        background_tasks.add_task(
            email_service.send_email,
            to=[subscription_request.subscriber_email],
            subject=subject,
            html_content=html_content
        )
        
        return EmailResponse(
            success=True,
            message=f"Newsletter subscription confirmation queued for {subscription_request.subscriber_email}"
        )
        
    except Exception as e:
        logger.error(f"Failed to queue newsletter subscription email: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to queue newsletter subscription confirmation"
        )


@router.post("/contact-form", response_model=EmailResponse)
async def send_contact_form_notification(
    contact_request: ContactFormEmailRequest,
    background_tasks: BackgroundTasks
):
    """
    Send contact form submission notification
    """
    try:
        # Send notification to internal recipients
        subject = f"New Contact Form Submission - {contact_request.subject}"
        html_content = f"""
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> {contact_request.sender_name} &lt;{contact_request.sender_email}&gt;</p>
        {f'<p><strong>Company:</strong> {contact_request.company}</p>' if contact_request.company else ''}
        {f'<p><strong>Phone:</strong> {contact_request.phone}</p>' if contact_request.phone else ''}
        <p><strong>Subject:</strong> {contact_request.subject}</p>
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0; border-radius: 5px;">
            <h3>Message:</h3>
            <p>{contact_request.message.replace(chr(10), '<br>')}</p>
        </div>
        <p>Please respond to the customer directly at: <a href="mailto:{contact_request.sender_email}">{contact_request.sender_email}</a></p>
        """
        
        background_tasks.add_task(
            email_service.send_email,
            to=contact_request.internal_recipients,
            subject=subject,
            html_content=html_content
        )
        
        return EmailResponse(
            success=True,
            message=f"Contact form notification queued for {len(contact_request.internal_recipients)} recipient(s)"
        )
        
    except Exception as e:
        logger.error(f"Failed to queue contact form notification: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to queue contact form notification"
        )


@router.post("/template", response_model=EmailTemplateResponse)
async def generate_email_template(
    template_request: EmailTemplateRequest,
    current_user: AdminUser = Depends(require_admin())
):
    """
    Generate email template without sending (Admin only)
    """
    try:
        template_type = template_request.template_type
        template_data = template_request.template_data
        language = template_request.language
        
        if template_type == "booking_confirmation":
            template = email_service.generate_customer_email_template(
                customer_name=template_data.get("customer_name", ""),
                customer_title=template_data.get("customer_title"),
                consultant_name=template_data.get("consultant_name", ""),
                consultant_email=template_data.get("consultant_email", ""),
                consultant_role=template_data.get("consultant_role", ""),
                booking_date=template_data.get("booking_date"),
                start_time=template_data.get("start_time", ""),
                end_time=template_data.get("end_time", ""),
                booking_reference=template_data.get("booking_reference", ""),
                language=language
            )
        elif template_type == "internal_notification":
            template = email_service.generate_internal_email_template(
                customer_name=template_data.get("customer_name", ""),
                customer_title=template_data.get("customer_title"),
                customer_email=template_data.get("customer_email", ""),
                customer_phone=template_data.get("customer_phone", ""),
                customer_company=template_data.get("customer_company", ""),
                consultant_name=template_data.get("consultant_name", ""),
                consultant_email=template_data.get("consultant_email", ""),
                booking_date=template_data.get("booking_date"),
                start_time=template_data.get("start_time", ""),
                end_time=template_data.get("end_time", ""),
                booking_reference=template_data.get("booking_reference", ""),
                calendar_status=template_data.get("calendar_status", "unknown")
            )
        elif template_type == "admin_welcome":
            template = email_service.generate_admin_user_welcome_template(
                full_name=template_data.get("full_name", ""),
                email=template_data.get("email", ""),
                password=template_data.get("password", ""),
                admin_panel_url=template_data.get("admin_panel_url", "http://localhost:8036/admin"),
                created_by_name=template_data.get("created_by_name", "System Administrator")
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Template type '{template_type}' not yet implemented"
            )
        
        return EmailTemplateResponse(**template)
        
    except Exception as e:
        logger.error(f"Failed to generate email template: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate email template"
        )


@router.get("/config", response_model=SMTPConfigResponse)
async def get_smtp_configuration(
    current_user: AdminUser = Depends(require_admin())
):
    """
    Get SMTP configuration status (Admin only)
    """
    try:
        return SMTPConfigResponse(
            configured=settings.is_smtp_configured(),
            smtp_host=settings.smtp_host,
            smtp_port=settings.smtp_port,
            smtp_username=settings.smtp_username,
            from_email=settings.smtp_from_email,
            from_name=settings.smtp_from_name,
            use_tls=settings.smtp_use_tls,
            use_starttls=settings.smtp_use_starttls
        )
        
    except Exception as e:
        logger.error(f"Failed to get SMTP config: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve SMTP configuration"
        )


@router.post("/test", response_model=EmailResponse)
async def test_smtp_connection(
    current_user: AdminUser = Depends(require_admin())
):
    """
    Test SMTP connection by sending a test email (Admin only)
    """
    try:
        if not settings.is_smtp_configured():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="SMTP is not configured"
            )
        
        # Send test email
        test_subject = "SMTP Test Email - voltAIc Systems"
        test_html = """
        <h2>SMTP Test Email</h2>
        <p>This is a test email to verify SMTP configuration.</p>
        <p>If you received this email, your SMTP settings are working correctly.</p>
        <p>Sent from: voltAIc Systems Email Service</p>
        """
        
        success = await email_service.send_email(
            to=[current_user.email],
            subject=test_subject,
            html_content=test_html,
            text_content="SMTP Test Email - If you received this email, your SMTP settings are working correctly."
        )
        
        if success:
            return EmailResponse(
                success=True,
                message=f"Test email sent successfully to {current_user.email}"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Test email failed to send"
            )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"SMTP test failed: {type(e).__name__}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"SMTP test failed: {str(e)}"
        )