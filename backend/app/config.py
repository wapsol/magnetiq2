from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List, Optional
import os


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
    
    # Database
    database_url: str = "sqlite+aiosqlite:///./magnetiq.db"
    
    # Security
    secret_key: str = "dev-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7
    
    # CORS
    allowed_origins: List[str] = ["http://localhost:8036", "http://localhost:3000"]
    allowed_methods: List[str] = ["GET", "POST", "PUT", "PATCH", "DELETE"]
    allowed_headers: List[str] = ["*"]
    
    # Email Settings
    smtp_host: str = "localhost"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    smtp_from_email: str = "noreply@magnetiq.local"
    smtp_from_name: str = "Magnetiq System"
    
    # File Upload
    max_file_size: int = 10485760  # 10MB
    allowed_file_types: List[str] = ["jpg", "jpeg", "png", "gif", "pdf", "docx"]
    upload_dir: str = "./media"
    
    # External APIs (placeholders)
    linkedin_client_id: Optional[str] = None
    linkedin_client_secret: Optional[str] = None
    twitter_api_key: Optional[str] = None
    twitter_api_secret: Optional[str] = None
    twitter_access_token: Optional[str] = None
    twitter_access_secret: Optional[str] = None


settings = Settings()