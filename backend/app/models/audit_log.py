"""
Audit Log Model for tracking administrative actions
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.sql import func
from datetime import datetime

from app.database import Base


class AuditLog(Base):
    """
    Audit log for tracking administrative actions and changes
    """
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    
    # Action Information
    action = Column(String(100), nullable=False, index=True)  # CREATE, UPDATE, DELETE, etc.
    resource_type = Column(String(50), nullable=False, index=True)  # USER, ROLE, etc.
    resource_id = Column(Integer, index=True)  # ID of affected resource
    
    # User Information
    performed_by = Column(Integer, nullable=False, index=True)  # AdminUser ID
    performed_by_email = Column(String(255))  # Cached email for easier querying
    
    # Request Information
    ip_address = Column(String(45))  # IPv4/IPv6
    user_agent = Column(Text)
    endpoint = Column(String(255))  # API endpoint used
    
    # Change Details
    old_values = Column(JSON)  # Previous state (for updates)
    new_values = Column(JSON)  # New state (for creates/updates)
    reason = Column(Text)  # Optional reason/notes
    
    # Metadata
    timestamp = Column(
        DateTime(timezone=True), 
        server_default=func.now(), 
        nullable=False,
        index=True
    )
    session_id = Column(String(100))  # Optional session tracking
    request_id = Column(String(100))  # Optional request tracking
    
    def __repr__(self):
        return f"<AuditLog(action={self.action}, resource={self.resource_type}:{self.resource_id}, by={self.performed_by})>"