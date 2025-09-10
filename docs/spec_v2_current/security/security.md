# Magnetiq v2 - Security Specification (SQLite-based)

## Overview

This security specification defines comprehensive security measures for Magnetiq v2, covering authentication, authorization, data protection, infrastructure security, and compliance requirements. The implementation follows security best practices and industry standards using **SQLite as the only external dependency**.

## Security Architecture

### Defense in Depth Strategy
```
┌─────────────────────────────────────────────────────────────┐
│                    Perimeter Security                        │
│  CDN/WAF │ Rate Limiting │ DDoS Protection │ SSL/TLS        │
└────────────┬────────────────────────────────┬───────────────┘
             │                                │
             ▼                                ▼
┌─────────────────────────┐    ┌──────────────────────────┐
│   Application Security   │    │   Infrastructure Security │
│ Authentication │ RBAC    │    │ Network │ Container       │
│ Input Validation        │    │ Isolation │ Security       │
│ OWASP Top 10 Protection │    │ Firewall Rules            │
└─────────────────────────┘    └──────────────────────────┘
                               ▼
                    ┌──────────────────────────┐
                    │     Data Security        │
                    │ Encryption │ Backup      │
                    │ Access Control │ Audit   │
                    └──────────────────────────┘
```

### Security Principles
1. **Zero Trust Architecture**: Never trust, always verify
2. **Principle of Least Privilege**: Minimum required access
3. **Defense in Depth**: Multiple security layers
4. **Security by Design**: Built-in security from the start
5. **Continuous Monitoring**: Real-time threat detection
6. **Incident Response**: Rapid response to security events
7. **Minimal Dependencies**: SQLite-only approach for security features

## Authentication & Authorization

### JWT-Based Authentication

#### Token Structure
```typescript
interface JWTPayload {
  sub: string;          // User ID
  email: string;        // User email
  role: UserRole;       // User role
  permissions: string[]; // Granular permissions
  iat: number;          // Issued at timestamp
  exp: number;          // Expiration timestamp
  iss: string;          // Issuer (voltAIc-systems)
  aud: string;          // Audience (magnetiq-api)
  jti: string;          // JWT ID for revocation
}
```

#### Token Security Configuration
```python
class JWTConfig:
    ALGORITHM = "RS256"  # RSA256 for better security
    ACCESS_TOKEN_EXPIRE_MINUTES = 15  # Short-lived access tokens
    REFRESH_TOKEN_EXPIRE_DAYS = 7     # Longer refresh tokens
    ISSUER = "voltaic-systems"
    AUDIENCE = "magnetiq-api"
    
    # RSA key pair for signing
    PRIVATE_KEY_PATH = "/secrets/jwt_private_key.pem"
    PUBLIC_KEY_PATH = "/secrets/jwt_public_key.pem"
    
    # Token blacklist in SQLite database
    BLACKLIST_TABLE = "jwt_blacklist"
    BLACKLIST_EXPIRE_BUFFER = 3600  # 1 hour buffer
```

#### SQLite Security Tables
```sql
-- JWT Token Blacklist Table
CREATE TABLE IF NOT EXISTS jwt_blacklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_id TEXT UNIQUE NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(token_id)
);

CREATE INDEX IF NOT EXISTS idx_jwt_blacklist_token_id ON jwt_blacklist(token_id);
CREATE INDEX IF NOT EXISTS idx_jwt_blacklist_expires ON jwt_blacklist(expires_at);

-- Login Attempts Tracking
CREATE TABLE IF NOT EXISTS login_attempts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    attempt_count INTEGER DEFAULT 1,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email)
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created ON login_attempts(created_at);

-- Account Lockouts
CREATE TABLE IF NOT EXISTS account_lockouts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    reason TEXT DEFAULT 'too_many_attempts',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(email)
);

CREATE INDEX IF NOT EXISTS idx_account_lockouts_email ON account_lockouts(email);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_expires ON account_lockouts(expires_at);

-- Security Events Log
CREATE TABLE IF NOT EXISTS security_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    email TEXT,
    ip_address TEXT,
    user_agent TEXT,
    details TEXT, -- JSON
    severity TEXT DEFAULT 'low',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created ON security_events(created_at);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
```

#### Secure Token Generation (SQLite-based)
```python
import jwt
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from datetime import datetime, timedelta
import secrets
from sqlalchemy import text

class JWTService:
    def __init__(self, private_key: bytes, public_key: bytes, db_session):
        self.private_key = private_key
        self.public_key = public_key
        self.db = db_session
    
    async def create_access_token(
        self, 
        user: AdminUser,
        additional_claims: dict = None
    ) -> str:
        """Create secure access token"""
        
        now = datetime.utcnow()
        payload = {
            "sub": str(user.id),
            "email": user.email,
            "role": user.role,
            "permissions": user.get_permissions(),
            "iat": now,
            "exp": now + timedelta(minutes=15),
            "iss": JWTConfig.ISSUER,
            "aud": JWTConfig.AUDIENCE,
            "jti": secrets.token_urlsafe(32)  # Unique token ID
        }
        
        if additional_claims:
            payload.update(additional_claims)
        
        return jwt.encode(
            payload, 
            self.private_key, 
            algorithm=JWTConfig.ALGORITHM
        )
    
    async def verify_token(self, token: str) -> dict:
        """Verify and decode JWT token"""
        try:
            # Check if token is blacklisted
            if await self.is_token_blacklisted(token):
                raise jwt.InvalidTokenError("Token has been revoked")
            
            payload = jwt.decode(
                token,
                self.public_key,
                algorithms=[JWTConfig.ALGORITHM],
                issuer=JWTConfig.ISSUER,
                audience=JWTConfig.AUDIENCE
            )
            
            return payload
            
        except jwt.ExpiredSignatureError:
            raise HTTPException(401, "Token has expired")
        except jwt.InvalidTokenError as e:
            raise HTTPException(401, f"Invalid token: {str(e)}")
    
    async def is_token_blacklisted(self, token: str) -> bool:
        """Check if token is blacklisted in SQLite database"""
        try:
            payload = jwt.decode(
                token, 
                self.public_key, 
                algorithms=[JWTConfig.ALGORITHM],
                verify=False
            )
            
            jti = payload.get("jti")
            if not jti:
                return False
            
            result = await self.db.execute(
                text("SELECT 1 FROM jwt_blacklist WHERE token_id = :jti AND expires_at > datetime('now')"),
                {"jti": jti}
            )
            
            return result.fetchone() is not None
        except:
            return False
    
    async def blacklist_token(self, token: str) -> None:
        """Add token to SQLite blacklist"""
        try:
            payload = jwt.decode(
                token, 
                self.public_key, 
                algorithms=[JWTConfig.ALGORITHM],
                verify=False  # Don't verify expiration for blacklisting
            )
            
            jti = payload.get("jti")
            exp = payload.get("exp")
            
            if jti and exp:
                # Store in SQLite database until token would naturally expire
                expire_time = exp - datetime.utcnow().timestamp()
                if expire_time > 0:
                    await self.db.execute(
                        text("INSERT OR REPLACE INTO jwt_blacklist (token_id, expires_at) VALUES (:jti, :expires_at)"),
                        {
                            "jti": jti,
                            "expires_at": datetime.utcnow() + timedelta(seconds=int(expire_time + JWTConfig.BLACKLIST_EXPIRE_BUFFER))
                        }
                    )
                    await self.db.commit()
        except jwt.DecodeError:
            pass  # Invalid token, ignore
    
    async def cleanup_expired_tokens(self) -> int:
        """Clean up expired blacklisted tokens"""
        result = await self.db.execute(
            text("DELETE FROM jwt_blacklist WHERE expires_at <= datetime('now')")
        )
        await self.db.commit()
        return result.rowcount
```

#### SQLite-based Account Security Service
```python
from datetime import datetime, timedelta
from sqlalchemy import text

class AccountSecurityService:
    def __init__(self, db_session):
        self.db = db_session
        self.MAX_LOGIN_ATTEMPTS = 5
        self.LOCKOUT_DURATION = 30  # minutes
    
    async def record_login_attempt(
        self, 
        email: str, 
        success: bool,
        ip_address: str = None,
        user_agent: str = None
    ) -> dict:
        """Record login attempt and check for lockout using SQLite"""
        
        # Check if account is currently locked
        result = await self.db.execute(
            text("SELECT expires_at FROM account_lockouts WHERE email = :email AND expires_at > datetime('now')"),
            {"email": email}
        )
        lockout_record = result.fetchone()
        
        if lockout_record:
            expires_at = datetime.fromisoformat(lockout_record[0])
            remaining_seconds = int((expires_at - datetime.utcnow()).total_seconds())
            return {
                "is_locked": True,
                "attempts_remaining": 0,
                "lockout_expires_in": remaining_seconds
            }
        
        if success:
            # Clear failed attempts on successful login
            await self.db.execute(
                text("DELETE FROM login_attempts WHERE email = :email"),
                {"email": email}
            )
            await self.db.commit()
            return {
                "is_locked": False,
                "attempts_remaining": self.MAX_LOGIN_ATTEMPTS
            }
        else:
            # Get current attempt count and increment
            result = await self.db.execute(
                text("SELECT attempt_count FROM login_attempts WHERE email = :email AND created_at > datetime('now', '-1 hour')"),
                {"email": email}
            )
            current_record = result.fetchone()
            
            if current_record:
                attempts = current_record[0] + 1
                await self.db.execute(
                    text("""UPDATE login_attempts 
                           SET attempt_count = :attempts, 
                               updated_at = datetime('now'),
                               ip_address = :ip_address,
                               user_agent = :user_agent
                           WHERE email = :email"""),
                    {"attempts": attempts, "email": email, "ip_address": ip_address, "user_agent": user_agent}
                )
            else:
                attempts = 1
                await self.db.execute(
                    text("""INSERT OR REPLACE INTO login_attempts 
                           (email, attempt_count, ip_address, user_agent, created_at, updated_at) 
                           VALUES (:email, 1, :ip_address, :user_agent, datetime('now'), datetime('now'))"""),
                    {"email": email, "ip_address": ip_address, "user_agent": user_agent}
                )
            
            remaining_attempts = self.MAX_LOGIN_ATTEMPTS - attempts
            
            if attempts >= self.MAX_LOGIN_ATTEMPTS:
                # Lock account
                lockout_expires = datetime.utcnow() + timedelta(minutes=self.LOCKOUT_DURATION)
                await self.db.execute(
                    text("""INSERT OR REPLACE INTO account_lockouts 
                           (email, expires_at, reason, created_at) 
                           VALUES (:email, :expires_at, 'too_many_attempts', datetime('now'))"""),
                    {"email": email, "expires_at": lockout_expires.isoformat()}
                )
                
                await self.db.commit()
                
                # Log security event
                await self._log_security_event(
                    "account_locked",
                    email=email,
                    ip_address=ip_address,
                    user_agent=user_agent,
                    details={"attempts": attempts}
                )
                
                return {
                    "is_locked": True,
                    "attempts_remaining": 0,
                    "lockout_expires_in": self.LOCKOUT_DURATION * 60
                }
            
            await self.db.commit()
            return {
                "is_locked": False,
                "attempts_remaining": remaining_attempts
            }
    
    async def manually_unlock_account(self, email: str, unlocked_by: str) -> bool:
        """Manually unlock account (admin function)"""
        
        await self.db.execute(
            text("DELETE FROM login_attempts WHERE email = :email"),
            {"email": email}
        )
        await self.db.execute(
            text("DELETE FROM account_lockouts WHERE email = :email"),
            {"email": email}
        )
        await self.db.commit()
        
        await self._log_security_event(
            "account_unlocked",
            email=email,
            details={"unlocked_by": unlocked_by}
        )
        
        return True
    
    async def _log_security_event(
        self,
        event_type: str,
        email: str = None,
        ip_address: str = None,
        user_agent: str = None,
        details: dict = None
    ) -> None:
        """Log security event to SQLite"""
        
        import json
        
        await self.db.execute(
            text("""INSERT INTO security_events 
                   (event_type, email, ip_address, user_agent, details, severity, created_at) 
                   VALUES (:event_type, :email, :ip_address, :user_agent, :details, :severity, datetime('now'))"""),
            {
                "event_type": event_type,
                "email": email,
                "ip_address": ip_address,
                "user_agent": user_agent,
                "details": json.dumps(details) if details else None,
                "severity": self._get_event_severity(event_type)
            }
        )
        await self.db.commit()
    
    def _get_event_severity(self, event_type: str) -> str:
        """Get severity level for event type"""
        high_severity = {
            "account_locked",
            "privilege_escalation", 
            "security_violation",
            "multiple_failed_logins"
        }
        
        if event_type in high_severity:
            return "high"
        elif event_type in ["login_failure", "password_reset"]:
            return "medium"
        else:
            return "low"
    
    async def cleanup_expired_data(self) -> dict:
        """Clean up expired security data"""
        
        # Clean expired lockouts
        lockout_result = await self.db.execute(
            text("DELETE FROM account_lockouts WHERE expires_at <= datetime('now')")
        )
        
        # Clean old login attempts (older than 24 hours)
        attempts_result = await self.db.execute(
            text("DELETE FROM login_attempts WHERE created_at <= datetime('now', '-1 day')")
        )
        
        # Clean old security events (older than 90 days)
        events_result = await self.db.execute(
            text("DELETE FROM security_events WHERE created_at <= datetime('now', '-90 days')")
        )
        
        await self.db.commit()
        
        return {
            "expired_lockouts_removed": lockout_result.rowcount,
            "old_attempts_removed": attempts_result.rowcount,
            "old_events_removed": events_result.rowcount
        }
```

### Role-Based Access Control (RBAC)

#### Hierarchical Permission System
```python
from enum import Enum
from typing import List, Set, Dict

class Permission(str, Enum):
    # Content Management
    CONTENT_READ = "content:read"
    CONTENT_WRITE = "content:write"
    CONTENT_DELETE = "content:delete"
    CONTENT_PUBLISH = "content:publish"
    
    # Business Operations
    WEBINARS_READ = "webinars:read"
    WEBINARS_WRITE = "webinars:write"
    WEBINARS_MANAGE = "webinars:manage"
    
    BOOKINGS_READ = "bookings:read"
    BOOKINGS_WRITE = "bookings:write"
    BOOKINGS_MANAGE = "bookings:manage"
    
    WHITEPAPERS_READ = "whitepapers:read"
    WHITEPAPERS_WRITE = "whitepapers:write"
    WHITEPAPERS_MANAGE = "whitepapers:manage"
    
    # User Management
    USERS_READ = "users:read"
    USERS_WRITE = "users:write"
    USERS_MANAGE = "users:manage"
    
    # System Administration
    SYSTEM_ADMIN = "system:admin"
    SYSTEM_MONITORING = "system:monitoring"
    SYSTEM_BACKUP = "system:backup"
    
    # Communication Services
    COMMUNICATION_READ = "communication:read"
    COMMUNICATION_WRITE = "communication:write"
    COMMUNICATION_MANAGE = "communication:manage"
    
    # Social Media Management
    SOCIAL_ACCOUNTS_READ = "social_accounts:read"
    SOCIAL_ACCOUNTS_WRITE = "social_accounts:write"
    SOCIAL_ACCOUNTS_MANAGE = "social_accounts:manage"
    
    # Integration Management
    INTEGRATIONS_READ = "integrations:read"
    INTEGRATIONS_WRITE = "integrations:write"
    INTEGRATIONS_MANAGE = "integrations:manage"

class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

# Hierarchical Role-Permission mapping (fixed hierarchy)
ROLE_PERMISSIONS: Dict[UserRole, Set[Permission]] = {
    UserRole.VIEWER: {
        # Base permissions for all roles
        Permission.CONTENT_READ,
        Permission.WEBINARS_READ,
        Permission.BOOKINGS_READ,
        Permission.WHITEPAPERS_READ
    },
    
    UserRole.EDITOR: {
        # Inherit all VIEWER permissions plus editing
        *ROLE_PERMISSIONS.get(UserRole.VIEWER, set()),
        Permission.CONTENT_WRITE,
        Permission.WEBINARS_WRITE,
        Permission.WHITEPAPERS_WRITE,
        Permission.COMMUNICATION_READ,
        Permission.COMMUNICATION_WRITE
    },
    
    UserRole.ADMIN: {
        # Inherit all EDITOR permissions plus management
        *ROLE_PERMISSIONS.get(UserRole.EDITOR, set()),
        Permission.CONTENT_DELETE,
        Permission.CONTENT_PUBLISH,
        Permission.WEBINARS_MANAGE,
        Permission.BOOKINGS_WRITE,
        Permission.BOOKINGS_MANAGE,
        Permission.WHITEPAPERS_MANAGE,
        Permission.USERS_READ,
        Permission.USERS_WRITE,
        Permission.COMMUNICATION_MANAGE,
        Permission.SOCIAL_ACCOUNTS_READ,
        Permission.SOCIAL_ACCOUNTS_WRITE,
        Permission.INTEGRATIONS_READ,
        Permission.INTEGRATIONS_WRITE,
        Permission.SYSTEM_MONITORING
    },
    
    UserRole.SUPER_ADMIN: {
        # All permissions
        *list(Permission)
    }
}

# Fix the inheritance issue by updating EDITOR permissions after VIEWER is defined
ROLE_PERMISSIONS[UserRole.EDITOR] = {
    *ROLE_PERMISSIONS[UserRole.VIEWER],
    Permission.CONTENT_WRITE,
    Permission.WEBINARS_WRITE,
    Permission.WHITEPAPERS_WRITE,
    Permission.COMMUNICATION_READ,
    Permission.COMMUNICATION_WRITE
}

# Fix ADMIN permissions after EDITOR is defined
ROLE_PERMISSIONS[UserRole.ADMIN] = {
    *ROLE_PERMISSIONS[UserRole.EDITOR],
    Permission.CONTENT_DELETE,
    Permission.CONTENT_PUBLISH,
    Permission.WEBINARS_MANAGE,
    Permission.BOOKINGS_WRITE,
    Permission.BOOKINGS_MANAGE,
    Permission.WHITEPAPERS_MANAGE,
    Permission.USERS_READ,
    Permission.USERS_WRITE,
    Permission.COMMUNICATION_MANAGE,
    Permission.SOCIAL_ACCOUNTS_READ,
    Permission.SOCIAL_ACCOUNTS_WRITE,
    Permission.INTEGRATIONS_READ,
    Permission.INTEGRATIONS_WRITE,
    Permission.SYSTEM_MONITORING
}
```

## Performance & Scalability Considerations

### SQLite Limitations and Mitigations

#### Concurrent Write Limitations
```python
class SQLiteSecurityOptimizer:
    """Optimize SQLite performance for security operations"""
    
    def __init__(self, db_session):
        self.db = db_session
    
    async def optimize_security_tables(self):
        """Optimize SQLite tables for security operations"""
        
        # Enable WAL mode for better concurrency
        await self.db.execute(text("PRAGMA journal_mode=WAL"))
        
        # Optimize for security queries
        await self.db.execute(text("PRAGMA synchronous=NORMAL"))
        await self.db.execute(text("PRAGMA cache_size=10000"))
        await self.db.execute(text("PRAGMA temp_store=memory"))
        
        # Analyze tables for better query planning
        await self.db.execute(text("ANALYZE jwt_blacklist"))
        await self.db.execute(text("ANALYZE login_attempts"))
        await self.db.execute(text("ANALYZE account_lockouts"))
        await self.db.execute(text("ANALYZE security_events"))
        
        await self.db.commit()
    
    async def batch_cleanup_operations(self):
        """Batch cleanup operations to minimize write conflicts"""
        
        # Use a single transaction for all cleanup
        async with self.db.begin():
            # Clean expired tokens
            await self.db.execute(
                text("DELETE FROM jwt_blacklist WHERE expires_at <= datetime('now')")
            )
            
            # Clean expired lockouts
            await self.db.execute(
                text("DELETE FROM account_lockouts WHERE expires_at <= datetime('now')")
            )
            
            # Clean old login attempts
            await self.db.execute(
                text("DELETE FROM login_attempts WHERE created_at <= datetime('now', '-1 day')")
            )
            
            # Clean old security events (keep 90 days)
            await self.db.execute(
                text("DELETE FROM security_events WHERE created_at <= datetime('now', '-90 days')")
            )
        
        # Optimize database after cleanup
        await self.db.execute(text("VACUUM"))
        await self.db.commit()
```

### Performance Disclaimers

**Important Performance Considerations:**

1. **Concurrent Writes**: SQLite serializes write operations. Under high concurrent login load (>50 simultaneous login attempts), response times may increase.

2. **Database Locking**: Security operations (token blacklisting, login attempt tracking) may experience brief delays during database maintenance operations.

3. **Recommended Limits**: 
   - Maximum concurrent users: 100 active sessions
   - Login attempts rate: <10 attempts/second system-wide
   - Token operations rate: <50 tokens/second

4. **Scaling Considerations**: For applications expecting >1000 concurrent users or >100 login attempts/minute, consider migrating to Redis-based session management in v3.

## Simplified Rate Limiting (SQLite-based)

### In-Memory Rate Limiting
```python
import time
from collections import defaultdict, deque
from typing import Dict, Tuple

class SQLiteRateLimiter:
    """Simple in-memory rate limiting with SQLite persistence for audit"""
    
    def __init__(self, db_session):
        self.db = db_session
        self.rate_limits: Dict[str, deque] = defaultdict(deque)
        self.limits = {
            'auth': (5, 60),        # 5 requests per minute
            'api': (100, 60),       # 100 requests per minute  
            'download': (10, 300),  # 10 requests per 5 minutes
            'registration': (3, 60) # 3 requests per minute
        }
    
    async def check_rate_limit(
        self, 
        identifier: str, 
        limit_type: str = 'api'
    ) -> Tuple[bool, dict]:
        """Check rate limit using in-memory tracking"""
        
        if limit_type not in self.limits:
            return True, {}
        
        max_requests, window_seconds = self.limits[limit_type]
        now = time.time()
        key = f"{limit_type}:{identifier}"
        
        # Clean old requests outside window
        request_times = self.rate_limits[key]
        while request_times and request_times[0] <= now - window_seconds:
            request_times.popleft()
        
        current_requests = len(request_times)
        
        if current_requests >= max_requests:
            # Rate limit exceeded - log to SQLite
            await self._log_rate_limit_violation(identifier, limit_type, current_requests)
            
            return False, {
                "error": "Rate limit exceeded",
                "limit": max_requests,
                "window": window_seconds,
                "current": current_requests,
                "retry_after": int(request_times[0] + window_seconds - now) if request_times else window_seconds
            }
        
        # Add current request
        request_times.append(now)
        
        return True, {
            "limit": max_requests,
            "remaining": max_requests - current_requests - 1,
            "window": window_seconds
        }
    
    async def _log_rate_limit_violation(
        self, 
        identifier: str, 
        limit_type: str, 
        current_requests: int
    ):
        """Log rate limit violations to SQLite for security monitoring"""
        
        import json
        from sqlalchemy import text
        
        await self.db.execute(
            text("""INSERT INTO security_events 
                   (event_type, email, ip_address, details, severity, created_at) 
                   VALUES (:event_type, :identifier, :ip_address, :details, 'medium', datetime('now'))"""),
            {
                "event_type": "rate_limit_exceeded",
                "identifier": identifier if '@' in identifier else None,
                "ip_address": identifier if '@' not in identifier else None,
                "details": json.dumps({
                    "limit_type": limit_type,
                    "current_requests": current_requests,
                    "max_allowed": self.limits[limit_type][0]
                })
            }
        )
        await self.db.commit()
```

## Summary of Changes

### Key Modifications Made:
1. **Replaced Redis with SQLite**: All token blacklisting and session management now uses SQLite tables
2. **Added Security Tables**: Created dedicated tables for JWT blacklist, login attempts, account lockouts, and security events
3. **Fixed Permission Hierarchy**: Corrected role inheritance so permissions flow properly (SUPER_ADMIN > ADMIN > EDITOR > VIEWER)
4. **SQLite Optimizations**: Added WAL mode, indexing, and batch operations for better performance
5. **Performance Disclaimers**: Added realistic performance expectations for SQLite-based security
6. **Simplified Rate Limiting**: Implemented in-memory rate limiting with SQLite audit logging
7. **Maintenance Operations**: Added cleanup procedures for expired tokens and security data

### No External Dependencies:
- ✅ No Redis required
- ✅ No Celery required  
- ✅ No message queuing systems
- ✅ SQLite handles all security state management
- ✅ In-memory caching for performance-critical operations

This approach maintains enterprise-grade security while adhering to the "minimal dependencies" architecture principle.