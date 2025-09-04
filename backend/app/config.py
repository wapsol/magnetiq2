from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
import os
import logging

logger = logging.getLogger(__name__)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")
    
    # Application
    app_name: str = "Magnetiq v2"
    version: str = "2.0.0"
    environment: str = "development"
    debug: bool = True
    
    # Server
    host: str = "0.0.0.0"
    port: int = 3036
    frontend_url: str = "http://localhost:8036"
    
    # Database
    database_url: str = "sqlite+aiosqlite:////Users/ashant/magnetiq2/data/magnetiq.db"
    
    # Data Storage Paths
    data_dir: str = "./data"
    uploads_dir: str = "./data/uploads"
    exports_dir: str = "./data/exports"
    backups_dir: str = "./data/backups"
    logs_dir: str = "./data/logs"
    cache_dir: str = "./data/cache"
    temp_dir: str = "./data/temp"
    
    # Security
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    
    # CORS
    allowed_origins: List[str] = ["http://localhost:8036", "http://localhost:3000", "http://localhost:8038", "http://localhost:8039"]
    allowed_methods: List[str] = ["GET", "POST", "PUT", "PATCH", "DELETE"]
    allowed_headers: List[str] = ["*"]
    
    # SMTP Email Settings (Brevo Configuration)
    smtp_host: str = "smtp-relay.brevo.com"
    smtp_port: int = 587
    smtp_username: Optional[str] = None
    smtp_password: Optional[str] = None
    smtp_from_email: str = "noreply@voltaic.systems"
    smtp_from_name: str = "voltAIc Systems"
    smtp_use_tls: bool = False  # Direct TLS connection (port 465)
    smtp_use_starttls: bool = True  # STARTTLS (port 587)
    
    # Business Email Settings
    business_email_crm: str = "hello@voltaic.systems"
    business_email_support: str = "support@voltaic.systems"
    
    # File Upload
    max_file_size: int = 10485760  # 10MB
    allowed_file_types: List[str] = ["jpg", "jpeg", "png", "gif", "pdf", "docx"]
    upload_dir: str = "./data/uploads"  # Updated to use data directory
    
    # Media Processing
    media_cache_dir: str = "./data/cache/media"
    temp_processing_dir: str = "./data/temp/processing"
    
    # LinkedIn OAuth
    linkedin_client_id: Optional[str] = None
    linkedin_client_secret: Optional[str] = None
    linkedin_redirect_uri: str = "http://localhost:8037/auth/linkedin/callback"
    
    # OpenAI API
    openai_api_key: Optional[str] = None
    
    # Consultant Settings
    kyc_upload_dir: str = "./data/kyc_documents"
    
    # Scoopp LinkedIn Scraping API
    scoopp_api_key: Optional[str] = None
    scoopp_base_url: str = "https://api.scoopp.ai"
    
    # External APIs (placeholders)
    twitter_api_key: Optional[str] = None
    twitter_api_secret: Optional[str] = None
    twitter_access_token: Optional[str] = None
    twitter_access_secret: Optional[str] = None

    def is_smtp_configured(self) -> bool:
        """Check if SMTP email is properly configured"""
        return bool(
            self.smtp_username and 
            self.smtp_password and 
            self.smtp_host and 
            self.smtp_from_email
        )
    
    def validate_configuration(self):
        """Validate configuration and log warnings for missing services"""
        if not self.is_smtp_configured():
            logger.warning("SMTP email not configured - email notifications will be disabled")  
            logger.info("To enable email: Set SMTP_USERNAME and SMTP_PASSWORD")
        else:
            logger.info(f"SMTP configured: {self.smtp_host}:{self.smtp_port} (user: {self.smtp_username})")
            
            # Provide helpful configuration tips for common providers
            if "brevo.com" in self.smtp_host or "sendinblue.com" in self.smtp_host:
                if self.smtp_port != 587:
                    logger.warning(f"Brevo SMTP typically uses port 587, you have: {self.smtp_port}")
            elif "gmail.com" in self.smtp_host:
                if self.smtp_port not in [587, 465]:
                    logger.warning(f"Gmail SMTP typically uses port 587 or 465, you have: {self.smtp_port}")


settings = Settings()