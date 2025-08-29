# Magnetiq v2 - Security Specification\n\n## Overview\n\nThis security specification defines comprehensive security measures for Magnetiq v2, covering authentication, authorization, data protection, infrastructure security, and compliance requirements. The implementation follows security best practices and industry standards.\n\n## Security Architecture\n\n### Defense in Depth Strategy\n```\n┌─────────────────────────────────────────────────────────────┐\n│                    Perimeter Security                        │\n│  CDN/WAF │ Rate Limiting │ DDoS Protection │ SSL/TLS        │\n└────────────┬────────────────────────────────┬───────────────┘\n             │                                │\n             ▼                                ▼\n┌─────────────────────────┐    ┌──────────────────────────┐\n│   Application Security   │    │   Infrastructure Security │\n│ Authentication │ RBAC    │    │ Network │ Container       │\n│ Input Validation        │    │ Isolation │ Security       │\n│ OWASP Top 10 Protection │    │ Firewall Rules            │\n└─────────────────────────┘    └──────────────────────────┘\n                               ▼\n                    ┌──────────────────────────┐\n                    │     Data Security        │\n                    │ Encryption │ Backup      │\n                    │ Access Control │ Audit   │\n                    └──────────────────────────┘\n```\n\n### Security Principles\n1. **Zero Trust Architecture**: Never trust, always verify\n2. **Principle of Least Privilege**: Minimum required access\n3. **Defense in Depth**: Multiple security layers\n4. **Security by Design**: Built-in security from the start\n5. **Continuous Monitoring**: Real-time threat detection\n6. **Incident Response**: Rapid response to security events\n\n## Authentication & Authorization\n\n### JWT-Based Authentication\n\n#### Token Structure\n```typescript\ninterface JWTPayload {\n  sub: string;          // User ID\n  email: string;        // User email\n  role: UserRole;       // User role\n  permissions: string[]; // Granular permissions\n  iat: number;          // Issued at timestamp\n  exp: number;          // Expiration timestamp\n  iss: string;          // Issuer (voltAIc-systems)\n  aud: string;          // Audience (magnetiq-api)\n  jti: string;          // JWT ID for revocation\n}\n```\n\n#### Token Security Configuration\n```python\nclass JWTConfig:\n    ALGORITHM = \"RS256\"  # RSA256 for better security\n    ACCESS_TOKEN_EXPIRE_MINUTES = 15  # Short-lived access tokens\n    REFRESH_TOKEN_EXPIRE_DAYS = 7     # Longer refresh tokens\n    ISSUER = \"voltaic-systems\"\n    AUDIENCE = \"magnetiq-api\"\n    \n    # RSA key pair for signing\n    PRIVATE_KEY_PATH = \"/secrets/jwt_private_key.pem\"\n    PUBLIC_KEY_PATH = \"/secrets/jwt_public_key.pem\"\n    \n    # Token blacklist in Redis\n    BLACKLIST_PREFIX = \"jwt_blacklist:\"\n    BLACKLIST_EXPIRE_BUFFER = 3600  # 1 hour buffer\n```\n\n#### Secure Token Generation\n```python\nimport jwt\nfrom cryptography.hazmat.primitives import serialization\nfrom cryptography.hazmat.primitives.asymmetric import rsa\nfrom datetime import datetime, timedelta\nimport secrets\n\nclass JWTService:\n    def __init__(self, private_key: bytes, public_key: bytes):\n        self.private_key = private_key\n        self.public_key = public_key\n    \n    async def create_access_token(\n        self, \n        user: AdminUser,\n        additional_claims: dict = None\n    ) -> str:\n        \"\"\"Create secure access token\"\"\"\n        \n        now = datetime.utcnow()\n        payload = {\n            \"sub\": str(user.id),\n            \"email\": user.email,\n            \"role\": user.role,\n            \"permissions\": user.get_permissions(),\n            \"iat\": now,\n            \"exp\": now + timedelta(minutes=15),\n            \"iss\": JWTConfig.ISSUER,\n            \"aud\": JWTConfig.AUDIENCE,\n            \"jti\": secrets.token_urlsafe(32)  # Unique token ID\n        }\n        \n        if additional_claims:\n            payload.update(additional_claims)\n        \n        return jwt.encode(\n            payload, \n            self.private_key, \n            algorithm=JWTConfig.ALGORITHM\n        )\n    \n    async def verify_token(self, token: str) -> dict:\n        \"\"\"Verify and decode JWT token\"\"\"\n        try:\n            # Check if token is blacklisted\n            if await self.is_token_blacklisted(token):\n                raise jwt.InvalidTokenError(\"Token has been revoked\")\n            \n            payload = jwt.decode(\n                token,\n                self.public_key,\n                algorithms=[JWTConfig.ALGORITHM],\n                issuer=JWTConfig.ISSUER,\n                audience=JWTConfig.AUDIENCE\n            )\n            \n            return payload\n            \n        except jwt.ExpiredSignatureError:\n            raise HTTPException(401, \"Token has expired\")\n        except jwt.InvalidTokenError as e:\n            raise HTTPException(401, f\"Invalid token: {str(e)}\")\n    \n    async def blacklist_token(self, token: str) -> None:\n        \"\"\"Add token to blacklist\"\"\"\n        try:\n            payload = jwt.decode(\n                token, \n                self.public_key, \n                algorithms=[JWTConfig.ALGORITHM],\n                verify=False  # Don't verify expiration for blacklisting\n            )\n            \n            jti = payload.get(\"jti\")\n            exp = payload.get(\"exp\")\n            \n            if jti and exp:\n                # Store in Redis until token would naturally expire\n                expire_time = exp - datetime.utcnow().timestamp()\n                if expire_time > 0:\n                    await redis.setex(\n                        f\"{JWTConfig.BLACKLIST_PREFIX}{jti}\",\n                        int(expire_time + JWTConfig.BLACKLIST_EXPIRE_BUFFER),\n                        \"1\"\n                    )\n        except jwt.DecodeError:\n            pass  # Invalid token, ignore\n```\n\n### Role-Based Access Control (RBAC)\n\n#### Permission System\n```python\nfrom enum import Enum\nfrom typing import List, Set\n\nclass Permission(str, Enum):\n    # Content Management\n    CONTENT_READ = \"content:read\"\n    CONTENT_WRITE = \"content:write\"\n    CONTENT_DELETE = \"content:delete\"\n    CONTENT_PUBLISH = \"content:publish\"\n    \n    # Business Operations\n    WEBINARS_READ = \"webinars:read\"\n    WEBINARS_WRITE = \"webinars:write\"\n    WEBINARS_MANAGE = \"webinars:manage\"\n    \n    BOOKINGS_READ = \"bookings:read\"\n    BOOKINGS_WRITE = \"bookings:write\"\n    BOOKINGS_MANAGE = \"bookings:manage\"\n    \n    WHITEPAPERS_READ = \"whitepapers:read\"\n    WHITEPAPERS_WRITE = \"whitepapers:write\"\n    WHITEPAPERS_MANAGE = \"whitepapers:manage\"\n    \n    # User Management\n    USERS_READ = \"users:read\"\n    USERS_WRITE = \"users:write\"\n    USERS_MANAGE = \"users:manage\"\n    \n    # System Administration\n    SYSTEM_ADMIN = \"system:admin\"\n    SYSTEM_MONITORING = \"system:monitoring\"\n    SYSTEM_BACKUP = \"system:backup\"\n    \n    # Communication Services\n    COMMUNICATION_READ = \"communication:read\"\n    COMMUNICATION_WRITE = \"communication:write\"\n    COMMUNICATION_MANAGE = \"communication:manage\"\n    \n    # Social Media Management\n    SOCIAL_ACCOUNTS_READ = \"social_accounts:read\"\n    SOCIAL_ACCOUNTS_WRITE = \"social_accounts:write\"\n    SOCIAL_ACCOUNTS_MANAGE = \"social_accounts:manage\"\n    \n    # Integration Management\n    INTEGRATIONS_READ = \"integrations:read\"\n    INTEGRATIONS_WRITE = \"integrations:write\"\n    INTEGRATIONS_MANAGE = \"integrations:manage\"\n\nclass UserRole(str, Enum):\n    SUPER_ADMIN = \"super_admin\"\n    ADMIN = \"admin\"\n    EDITOR = \"editor\"\n    VIEWER = \"viewer\"\n\n# Role-Permission mapping\nROLE_PERMISSIONS: Dict[UserRole, Set[Permission]] = {\n    UserRole.SUPER_ADMIN: {\n        # All permissions\n        *list(Permission)\n    },\n    \n    UserRole.ADMIN: {\n        Permission.CONTENT_READ,\n        Permission.CONTENT_WRITE,\n        Permission.CONTENT_DELETE,\n        Permission.CONTENT_PUBLISH,\n        Permission.WEBINARS_READ,\n        Permission.WEBINARS_WRITE,\n        Permission.WEBINARS_MANAGE,\n        Permission.BOOKINGS_READ,\n        Permission.BOOKINGS_WRITE,\n        Permission.BOOKINGS_MANAGE,\n        Permission.WHITEPAPERS_READ,\n        Permission.WHITEPAPERS_WRITE,\n        Permission.WHITEPAPERS_MANAGE,\n        Permission.USERS_READ,\n        Permission.INTEGRATIONS_READ,\n        Permission.INTEGRATIONS_WRITE,\n        Permission.SYSTEM_MONITORING\n    },\n    \n    UserRole.EDITOR: {\n        Permission.CONTENT_READ,\n        Permission.CONTENT_WRITE,\n        Permission.WEBINARS_READ,\n        Permission.WEBINARS_WRITE,\n        Permission.BOOKINGS_READ,\n        Permission.WHITEPAPERS_READ,\n        Permission.WHITEPAPERS_WRITE\n    },\n    \n    UserRole.VIEWER: {\n        Permission.CONTENT_READ,\n        Permission.WEBINARS_READ,\n        Permission.BOOKINGS_READ,\n        Permission.WHITEPAPERS_READ\n    }\n}\n```\n\n#### Permission Decorator\n```python\nfrom functools import wraps\nfrom fastapi import HTTPException, Depends\n\ndef require_permission(permission: Permission):\n    \"\"\"Decorator to require specific permission\"\"\"\n    def decorator(func):\n        @wraps(func)\n        async def wrapper(*args, **kwargs):\n            # Extract current user from dependency\n            current_user = None\n            for param_name, param_value in kwargs.items():\n                if isinstance(param_value, AdminUser):\n                    current_user = param_value\n                    break\n            \n            if not current_user:\n                raise HTTPException(401, \"Authentication required\")\n            \n            user_permissions = ROLE_PERMISSIONS.get(current_user.role, set())\n            \n            if permission not in user_permissions:\n                raise HTTPException(\n                    403, \n                    f\"Insufficient permissions. Required: {permission}\"\n                )\n            \n            return await func(*args, **kwargs)\n        return wrapper\n    return decorator\n\n# Usage example\n@router.delete(\"/api/v1/admin/webinars/{webinar_id}\")\n@require_permission(Permission.WEBINARS_MANAGE)\nasync def delete_webinar(\n    webinar_id: str,\n    current_user: AdminUser = Depends(get_current_admin_user)\n):\n    # Implementation\n    pass\n```\n\n### Password Security\n\n#### Password Hashing\n```python\nimport bcrypt\nimport secrets\nfrom passlib.context import CryptContext\n\nclass PasswordService:\n    def __init__(self):\n        self.pwd_context = CryptContext(\n            schemes=[\"bcrypt\"],\n            deprecated=\"auto\",\n            bcrypt__rounds=12  # High cost for better security\n        )\n    \n    def hash_password(self, password: str) -> str:\n        \"\"\"Hash password with salt\"\"\"\n        return self.pwd_context.hash(password)\n    \n    def verify_password(self, plain_password: str, hashed_password: str) -> bool:\n        \"\"\"Verify password against hash\"\"\"\n        return self.pwd_context.verify(plain_password, hashed_password)\n    \n    def generate_secure_password(self, length: int = 16) -> str:\n        \"\"\"Generate cryptographically secure random password\"\"\"\n        alphabet = \"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*\"\n        return ''.join(secrets.choice(alphabet) for _ in range(length))\n    \n    def validate_password_strength(self, password: str) -> dict:\n        \"\"\"Validate password strength\"\"\"\n        errors = []\n        \n        if len(password) < 8:\n            errors.append(\"Password must be at least 8 characters long\")\n        \n        if not any(c.islower() for c in password):\n            errors.append(\"Password must contain at least one lowercase letter\")\n        \n        if not any(c.isupper() for c in password):\n            errors.append(\"Password must contain at least one uppercase letter\")\n        \n        if not any(c.isdigit() for c in password):\n            errors.append(\"Password must contain at least one number\")\n        \n        if not any(c in \"!@#$%^&*()_+-=[]{}|;:,.<>?\" for c in password):\n            errors.append(\"Password must contain at least one special character\")\n        \n        # Check for common passwords\n        common_passwords = {\n            \"password\", \"123456\", \"password123\", \"admin\", \"qwerty\",\n            \"letmein\", \"welcome\", \"monkey\", \"dragon\", \"abc123\"\n        }\n        \n        if password.lower() in common_passwords:\n            errors.append(\"Password is too common\")\n        \n        return {\n            \"is_valid\": len(errors) == 0,\n            \"errors\": errors\n        }\n```\n\n#### Account Lockout Protection\n```python\nfrom datetime import datetime, timedelta\n\nclass AccountSecurityService:\n    def __init__(self, redis_client):\n        self.redis = redis_client\n        self.MAX_LOGIN_ATTEMPTS = 5\n        self.LOCKOUT_DURATION = 30  # minutes\n        self.LOCKOUT_KEY_PREFIX = \"lockout:\"\n        self.ATTEMPT_KEY_PREFIX = \"attempts:\"\n    \n    async def record_login_attempt(\n        self, \n        email: str, \n        success: bool,\n        ip_address: str = None\n    ) -> dict:\n        \"\"\"Record login attempt and check for lockout\"\"\"\n        \n        attempt_key = f\"{self.ATTEMPT_KEY_PREFIX}{email}\"\n        lockout_key = f\"{self.LOCKOUT_KEY_PREFIX}{email}\"\n        \n        # Check if account is currently locked\n        if await self.redis.exists(lockout_key):\n            lockout_expires = await self.redis.ttl(lockout_key)\n            return {\n                \"is_locked\": True,\n                \"attempts_remaining\": 0,\n                \"lockout_expires_in\": lockout_expires\n            }\n        \n        if success:\n            # Clear failed attempts on successful login\n            await self.redis.delete(attempt_key)\n            return {\n                \"is_locked\": False,\n                \"attempts_remaining\": self.MAX_LOGIN_ATTEMPTS\n            }\n        else:\n            # Increment failed attempts\n            attempts = await self.redis.incr(attempt_key)\n            await self.redis.expire(attempt_key, 3600)  # Reset after 1 hour\n            \n            remaining_attempts = self.MAX_LOGIN_ATTEMPTS - attempts\n            \n            if attempts >= self.MAX_LOGIN_ATTEMPTS:\n                # Lock account\n                await self.redis.setex(\n                    lockout_key,\n                    self.LOCKOUT_DURATION * 60,\n                    datetime.utcnow().isoformat()\n                )\n                \n                # Log security event\n                await self.log_security_event(\n                    \"account_locked\",\n                    email=email,\n                    ip_address=ip_address,\n                    attempts=attempts\n                )\n                \n                return {\n                    \"is_locked\": True,\n                    \"attempts_remaining\": 0,\n                    \"lockout_expires_in\": self.LOCKOUT_DURATION * 60\n                }\n            \n            return {\n                \"is_locked\": False,\n                \"attempts_remaining\": remaining_attempts\n            }\n    \n    async def manually_unlock_account(self, email: str, unlocked_by: str) -> bool:\n        \"\"\"Manually unlock account (admin function)\"\"\"\n        attempt_key = f\"{self.ATTEMPT_KEY_PREFIX}{email}\"\n        lockout_key = f\"{self.LOCKOUT_KEY_PREFIX}{email}\"\n        \n        await self.redis.delete(attempt_key)\n        await self.redis.delete(lockout_key)\n        \n        await self.log_security_event(\n            \"account_unlocked\",\n            email=email,\n            unlocked_by=unlocked_by\n        )\n        \n        return True\n```\n\n## Input Validation & Sanitization\n\n### Request Validation\n```python\nfrom pydantic import BaseModel, validator, EmailStr\nfrom typing import Optional\nimport re\nimport html\n\nclass SecureBaseModel(BaseModel):\n    \"\"\"Base model with security validations\"\"\"\n    \n    @validator('*', pre=True)\n    def sanitize_strings(cls, v):\n        \"\"\"Sanitize string inputs\"\"\"\n        if isinstance(v, str):\n            # Remove null bytes\n            v = v.replace('\\x00', '')\n            \n            # Limit string length\n            if len(v) > 10000:  # Configurable limit\n                raise ValueError(\"Input too long\")\n            \n            # HTML escape for safety\n            v = html.escape(v)\n        \n        return v\n\nclass WebinarRegistrationRequest(SecureBaseModel):\n    first_name: str\n    last_name: str\n    email: EmailStr\n    company: str\n    phone: Optional[str] = None\n    website: Optional[str] = None\n    \n    @validator('first_name', 'last_name')\n    def validate_names(cls, v):\n        if not re.match(r'^[a-zA-ZÀ-ÿ\\s\\-\\']{2,50}$', v):\n            raise ValueError('Invalid name format')\n        return v.strip()\n    \n    @validator('company')\n    def validate_company(cls, v):\n        if not re.match(r'^[a-zA-Z0-9À-ÿ\\s\\-\\&\\.\\']{2,200}$', v):\n            raise ValueError('Invalid company name format')\n        return v.strip()\n    \n    @validator('phone')\n    def validate_phone(cls, v):\n        if v and not re.match(r'^\\+?[1-9]\\d{1,14}$', re.sub(r'[\\s\\-\\(\\)]', '', v)):\n            raise ValueError('Invalid phone number format')\n        return v.strip() if v else None\n    \n    @validator('website')\n    def validate_website(cls, v):\n        if v:\n            # Simple URL validation\n            if not re.match(r'^https?://[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}.*$', v):\n                raise ValueError('Invalid website URL')\n        return v\n```\n\n### SQL Injection Prevention\n```python\nfrom sqlalchemy import text\nfrom sqlalchemy.orm import Session\n\nclass SecureQueryService:\n    def __init__(self, db: Session):\n        self.db = db\n    \n    async def search_webinars(self, search_term: str, limit: int = 10) -> List[dict]:\n        \"\"\"Secure search with parameterized queries\"\"\"\n        \n        # Validate and sanitize inputs\n        if not search_term or len(search_term) > 100:\n            raise ValueError(\"Invalid search term\")\n        \n        limit = max(1, min(limit, 100))  # Clamp limit\n        \n        # Use parameterized query to prevent SQL injection\n        query = text(\"\"\"\n            SELECT id, title, description, datetime\n            FROM webinar_sessions\n            WHERE status = 'published'\n            AND (title->'en' ILIKE :search_term OR description->'en' ILIKE :search_term)\n            AND deleted_at IS NULL\n            ORDER BY datetime DESC\n            LIMIT :limit\n        \"\"\")\n        \n        result = await self.db.execute(\n            query,\n            {\n                \"search_term\": f\"%{search_term}%\",\n                \"limit\": limit\n            }\n        )\n        \n        return [dict(row) for row in result.fetchall()]\n```\n\n## Data Protection\n\n### Encryption at Rest\n```python\nfrom cryptography.fernet import Fernet\nfrom cryptography.hazmat.primitives import hashes\nfrom cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC\nimport base64\nimport os\n\nclass EncryptionService:\n    def __init__(self, password: bytes, salt: bytes = None):\n        if salt is None:\n            salt = os.urandom(16)\n        \n        kdf = PBKDF2HMAC(\n            algorithm=hashes.SHA256(),\n            length=32,\n            salt=salt,\n            iterations=100000,  # High iteration count\n        )\n        key = base64.urlsafe_b64encode(kdf.derive(password))\n        self.cipher = Fernet(key)\n        self.salt = salt\n    \n    def encrypt(self, data: str) -> str:\n        \"\"\"Encrypt sensitive data\"\"\"\n        return self.cipher.encrypt(data.encode()).decode()\n    \n    def decrypt(self, encrypted_data: str) -> str:\n        \"\"\"Decrypt sensitive data\"\"\"\n        return self.cipher.decrypt(encrypted_data.encode()).decode()\n    \n    @staticmethod\n    def generate_key() -> bytes:\n        \"\"\"Generate new encryption key\"\"\"\n        return Fernet.generate_key()\n\n# Usage for sensitive fields\nclass SecureModel(BaseModel):\n    def __init__(self, **data):\n        # Encrypt sensitive fields before storage\n        encryption_service = EncryptionService(os.environ['ENCRYPTION_KEY'].encode())\n        \n        for field, value in data.items():\n            if field in ['api_key', 'password', 'secret', 'token']:\n                data[field] = encryption_service.encrypt(value)\n        \n        super().__init__(**data)\n```\n\n### Data Masking for Logs\n```python\nimport re\nimport json\nfrom typing import Any, Dict\n\nclass DataMaskingService:\n    \"\"\"Service to mask sensitive data in logs and responses\"\"\"\n    \n    SENSITIVE_PATTERNS = {\n        'email': r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',\n        'phone': r'(\\+?\\d{1,4}[\\s-]?)?(\\(?\\d{3}\\)?[\\s-]?)?\\d{3}[\\s-]?\\d{4}',\n        'credit_card': r'\\b\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}[\\s-]?\\d{4}\\b',\n        'ssn': r'\\b\\d{3}-\\d{2}-\\d{4}\\b',\n        'api_key': r'[a-zA-Z0-9]{32,}',\n        'password': r'\"password\"\\s*:\\s*\"[^\"]+\"'\n    }\n    \n    @classmethod\n    def mask_sensitive_data(cls, data: Any) -> Any:\n        \"\"\"Mask sensitive data in various data types\"\"\"\n        if isinstance(data, str):\n            return cls._mask_string(data)\n        elif isinstance(data, dict):\n            return cls._mask_dict(data)\n        elif isinstance(data, list):\n            return [cls.mask_sensitive_data(item) for item in data]\n        else:\n            return data\n    \n    @classmethod\n    def _mask_string(cls, text: str) -> str:\n        \"\"\"Mask sensitive patterns in string\"\"\"\n        for pattern_name, pattern in cls.SENSITIVE_PATTERNS.items():\n            if pattern_name == 'email':\n                text = re.sub(pattern, cls._mask_email, text)\n            elif pattern_name == 'phone':\n                text = re.sub(pattern, \"***-***-****\", text)\n            else:\n                text = re.sub(pattern, \"***MASKED***\", text)\n        return text\n    \n    @classmethod\n    def _mask_dict(cls, data: Dict[str, Any]) -> Dict[str, Any]:\n        \"\"\"Mask sensitive fields in dictionary\"\"\"\n        masked_data = {}\n        sensitive_fields = {\n            'password', 'api_key', 'secret', 'token', 'private_key',\n            'credit_card', 'ssn', 'bank_account'\n        }\n        \n        for key, value in data.items():\n            if key.lower() in sensitive_fields:\n                masked_data[key] = \"***MASKED***\"\n            else:\n                masked_data[key] = cls.mask_sensitive_data(value)\n        \n        return masked_data\n    \n    @staticmethod\n    def _mask_email(match) -> str:\n        \"\"\"Mask email preserving domain\"\"\"\n        email = match.group(0)\n        if '@' in email:\n            local, domain = email.split('@', 1)\n            masked_local = local[0] + '*' * (len(local) - 2) + local[-1] if len(local) > 2 else '***'\n            return f\"{masked_local}@{domain}\"\n        return \"***@***.***\"\n```\n\n## API Security\n\n### Rate Limiting\n```python\nfrom fastapi import Request, HTTPException\nfrom slowapi import Limiter, _rate_limit_exceeded_handler\nfrom slowapi.util import get_remote_address\nfrom slowapi.errors import RateLimitExceeded\nimport redis.asyncio as redis\n\nclass AdvancedRateLimiter:\n    def __init__(self, redis_client):\n        self.redis = redis_client\n        self.limits = {\n            'auth': {'requests': 5, 'window': 60},      # 5 per minute\n            'api': {'requests': 100, 'window': 60},     # 100 per minute\n            'download': {'requests': 10, 'window': 300}, # 10 per 5 minutes\n            'registration': {'requests': 3, 'window': 60}  # 3 per minute\n        }\n    \n    async def check_rate_limit(\n        self, \n        identifier: str, \n        limit_type: str = 'api'\n    ) -> bool:\n        \"\"\"Check if request is within rate limit\"\"\"\n        \n        if limit_type not in self.limits:\n            return True  # Unknown limit type, allow\n        \n        limit_config = self.limits[limit_type]\n        key = f\"rate_limit:{limit_type}:{identifier}\"\n        \n        # Get current count\n        current = await self.redis.get(key)\n        \n        if current is None:\n            # First request in window\n            await self.redis.setex(\n                key, \n                limit_config['window'], \n                1\n            )\n            return True\n        \n        current_count = int(current)\n        \n        if current_count >= limit_config['requests']:\n            # Rate limit exceeded\n            ttl = await self.redis.ttl(key)\n            raise HTTPException(\n                status_code=429,\n                detail={\n                    \"error\": \"Rate limit exceeded\",\n                    \"limit\": limit_config['requests'],\n                    \"window\": limit_config['window'],\n                    \"retry_after\": ttl\n                }\n            )\n        \n        # Increment counter\n        await self.redis.incr(key)\n        return True\n    \n    async def get_rate_limit_info(\n        self, \n        identifier: str, \n        limit_type: str = 'api'\n    ) -> dict:\n        \"\"\"Get current rate limit status\"\"\"\n        \n        if limit_type not in self.limits:\n            return {}\n        \n        limit_config = self.limits[limit_type]\n        key = f\"rate_limit:{limit_type}:{identifier}\"\n        \n        current = await self.redis.get(key)\n        ttl = await self.redis.ttl(key) if current else limit_config['window']\n        \n        return {\n            \"limit\": limit_config['requests'],\n            \"remaining\": limit_config['requests'] - int(current or 0),\n            \"reset_time\": ttl,\n            \"window\": limit_config['window']\n        }\n```\n\n### CORS Security\n```python\nfrom fastapi.middleware.cors import CORSMiddleware\nfrom typing import List\n\nclass SecureCORSConfig:\n    # Production domains only\n    ALLOWED_ORIGINS = [\n        \"https://voltAIc.systems\",\n        \"https://www.voltAIc.systems\",\n        \"https://admin.voltAIc.systems\"\n    ]\n    \n    # Development origins (only in dev environment)\n    DEV_ORIGINS = [\n        \"http://localhost:3000\",\n        \"http://localhost:8088\",\n        \"http://127.0.0.1:3000\"\n    ]\n    \n    ALLOWED_METHODS = [\"GET\", \"POST\", \"PUT\", \"DELETE\", \"OPTIONS\"]\n    ALLOWED_HEADERS = [\n        \"Authorization\",\n        \"Content-Type\",\n        \"X-Requested-With\",\n        \"Accept\",\n        \"Origin\"\n    ]\n    EXPOSE_HEADERS = [\"X-Request-ID\", \"X-Rate-Limit-Remaining\"]\n    \n    @classmethod\n    def get_origins(cls, environment: str) -> List[str]:\n        \"\"\"Get allowed origins based on environment\"\"\"\n        if environment == \"development\":\n            return cls.ALLOWED_ORIGINS + cls.DEV_ORIGINS\n        else:\n            return cls.ALLOWED_ORIGINS\n\n# Apply CORS middleware\ndef setup_cors(app, environment: str):\n    app.add_middleware(\n        CORSMiddleware,\n        allow_origins=SecureCORSConfig.get_origins(environment),\n        allow_credentials=True,\n        allow_methods=SecureCORSConfig.ALLOWED_METHODS,\n        allow_headers=SecureCORSConfig.ALLOWED_HEADERS,\n        expose_headers=SecureCORSConfig.EXPOSE_HEADERS,\n        max_age=3600  # Cache preflight for 1 hour\n    )\n```\n\n### Request Size Limits\n```python\nfrom fastapi import Request, HTTPException\nfrom starlette.middleware.base import BaseHTTPMiddleware\n\nclass RequestSizeLimitMiddleware(BaseHTTPMiddleware):\n    def __init__(self, app, max_size: int = 50 * 1024 * 1024):  # 50MB\n        super().__init__(app)\n        self.max_size = max_size\n    \n    async def dispatch(self, request: Request, call_next):\n        # Check Content-Length header\n        content_length = request.headers.get('content-length')\n        \n        if content_length:\n            content_length = int(content_length)\n            if content_length > self.max_size:\n                raise HTTPException(\n                    status_code=413,\n                    detail=f\"Request too large. Maximum size: {self.max_size} bytes\"\n                )\n        \n        # For streaming requests, check actual size\n        if hasattr(request, 'stream'):\n            body_size = 0\n            async for chunk in request.stream():\n                body_size += len(chunk)\n                if body_size > self.max_size:\n                    raise HTTPException(\n                        status_code=413,\n                        detail=\"Request body too large\"\n                    )\n        \n        response = await call_next(request)\n        return response\n```\n\n## Infrastructure Security\n\n### Container Security\n\n#### Secure Dockerfile Practices\n```dockerfile\n# Use specific version tags, not latest\nFROM python:3.11.7-slim AS base\n\n# Security updates\nRUN apt-get update && apt-get upgrade -y \\\n    && apt-get clean \\\n    && rm -rf /var/lib/apt/lists/*\n\n# Create non-root user\nRUN addgroup --system --gid 1001 app \\\n    && adduser --system --uid 1001 --gid 1001 app\n\n# Set secure permissions\nRUN mkdir -p /app /tmp/app \\\n    && chown -R app:app /app /tmp/app \\\n    && chmod 755 /app\n\n# Install dependencies as root, then switch to app user\nCOPY requirements.txt /tmp/\nRUN pip install --no-cache-dir --upgrade pip \\\n    && pip install --no-cache-dir -r /tmp/requirements.txt \\\n    && rm /tmp/requirements.txt\n\n# Switch to non-root user\nUSER app\nWORKDIR /app\n\n# Copy application code with proper ownership\nCOPY --chown=app:app . .\n\n# Security scanning\n# RUN safety check\n# RUN bandit -r .\n\n# Health check\nHEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \\\n    CMD curl -f http://localhost:8000/health || exit 1\n\n# Run as non-root\nEXPOSE 8000\nCMD [\"gunicorn\", \"main:app\", \"-w\", \"4\", \"-k\", \"uvicorn.workers.UvicornWorker\", \\\n     \"--bind\", \"0.0.0.0:8000\", \"--user\", \"app\", \"--group\", \"app\"]\n```\n\n#### Docker Security Configuration\n```yaml\n# docker-compose.yml security settings\nversion: '3.8'\n\nservices:\n  backend:\n    image: magnetiq-backend:latest\n    security_opt:\n      - no-new-privileges:true\n    cap_drop:\n      - ALL\n    cap_add:\n      - NET_BIND_SERVICE\n    read_only: true\n    tmpfs:\n      - /tmp:noexec,nosuid,size=100m\n    ulimits:\n      nproc: 65535\n      nofile:\n        soft: 65535\n        hard: 65535\n    sysctls:\n      - net.core.somaxconn=1024\n    healthcheck:\n      test: [\"CMD\", \"curl\", \"-f\", \"http://localhost:8000/health\"]\n      interval: 30s\n      timeout: 10s\n      retries: 3\n      start_period: 40s\n```\n\n### Network Security\n\n#### Firewall Configuration\n```bash\n#!/bin/bash\n# firewall-setup.sh\n\n# UFW (Uncomplicated Firewall) configuration\n\n# Reset UFW\nsudo ufw --force reset\n\n# Default policies\nsudo ufw default deny incoming\nsudo ufw default allow outgoing\n\n# SSH access (change port from default 22)\nsudo ufw allow 2222/tcp\n\n# HTTP/HTTPS\nsudo ufw allow 80/tcp\nsudo ufw allow 443/tcp\n\n# Database (only from application servers)\nsudo ufw allow from 10.0.1.0/24 to any port 5432\n\n# Redis (only from application servers)\nsudo ufw allow from 10.0.1.0/24 to any port 6379\n\n# Rate limiting for SSH\nsudo ufw limit 2222/tcp\n\n# Enable UFW\nsudo ufw --force enable\n\n# Show status\nsudo ufw status verbose\n```\n\n#### SSL/TLS Configuration\n```nginx\n# nginx/ssl.conf - Security-focused SSL configuration\n\n# SSL/TLS Configuration\nssl_protocols TLSv1.2 TLSv1.3;\nssl_prefer_server_ciphers off;\nssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;\n\n# SSL Security\nssl_session_cache shared:SSL:10m;\nssl_session_timeout 10m;\nssl_session_tickets off;\n\n# OCSP Stapling\nssl_stapling on;\nssl_stapling_verify on;\nssl_trusted_certificate /etc/letsencrypt/live/voltAIc.systems/chain.pem;\n\n# Security Headers\nadd_header Strict-Transport-Security \"max-age=31536000; includeSubDomains; preload\" always;\nadd_header X-Frame-Options DENY always;\nadd_header X-Content-Type-Options nosniff always;\nadd_header X-XSS-Protection \"1; mode=block\" always;\nadd_header Referrer-Policy \"strict-origin-when-cross-origin\" always;\nadd_header Content-Security-Policy \"default-src 'self'; script-src 'self' 'unsafe-inline' https://www.google-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';\" always;\n\n# Remove server signature\nserver_tokens off;\n```\n\n## Monitoring & Incident Response\n\n### Security Monitoring\n```python\nfrom enum import Enum\nfrom datetime import datetime\nfrom typing import Dict, Any, Optional\n\nclass SecurityEventType(str, Enum):\n    LOGIN_SUCCESS = \"login_success\"\n    LOGIN_FAILURE = \"login_failure\"\n    ACCOUNT_LOCKED = \"account_locked\"\n    PASSWORD_RESET = \"password_reset\"\n    PRIVILEGE_ESCALATION = \"privilege_escalation\"\n    SUSPICIOUS_ACTIVITY = \"suspicious_activity\"\n    DATA_ACCESS = \"data_access\"\n    SECURITY_VIOLATION = \"security_violation\"\n    RATE_LIMIT_EXCEEDED = \"rate_limit_exceeded\"\n\nclass SecurityMonitoringService:\n    def __init__(self, db: Session, logger):\n        self.db = db\n        self.logger = logger\n        self.alert_thresholds = {\n            SecurityEventType.LOGIN_FAILURE: 10,  # 10 failures in 5 minutes\n            SecurityEventType.RATE_LIMIT_EXCEEDED: 5,\n            SecurityEventType.SUSPICIOUS_ACTIVITY: 1\n        }\n    \n    async def log_security_event(\n        self,\n        event_type: SecurityEventType,\n        user_id: Optional[str] = None,\n        ip_address: Optional[str] = None,\n        user_agent: Optional[str] = None,\n        details: Dict[str, Any] = None\n    ) -> None:\n        \"\"\"Log security event and trigger alerts if necessary\"\"\"\n        \n        event = {\n            \"timestamp\": datetime.utcnow().isoformat(),\n            \"event_type\": event_type.value,\n            \"user_id\": user_id,\n            \"ip_address\": ip_address,\n            \"user_agent\": user_agent,\n            \"details\": details or {},\n            \"severity\": self._get_event_severity(event_type)\n        }\n        \n        # Log to structured logger\n        self.logger.warning(f\"Security event: {event_type.value}\", extra=event)\n        \n        # Store in database\n        security_log = SecurityLog(**event)\n        self.db.add(security_log)\n        await self.db.commit()\n        \n        # Check for alert conditions\n        await self._check_alert_conditions(event_type, ip_address, user_id)\n    \n    def _get_event_severity(self, event_type: SecurityEventType) -> str:\n        \"\"\"Get severity level for event type\"\"\"\n        high_severity = {\n            SecurityEventType.ACCOUNT_LOCKED,\n            SecurityEventType.PRIVILEGE_ESCALATION,\n            SecurityEventType.SECURITY_VIOLATION\n        }\n        \n        if event_type in high_severity:\n            return \"high\"\n        elif event_type == SecurityEventType.LOGIN_FAILURE:\n            return \"medium\"\n        else:\n            return \"low\"\n    \n    async def _check_alert_conditions(\n        self, \n        event_type: SecurityEventType, \n        ip_address: str, \n        user_id: str\n    ) -> None:\n        \"\"\"Check if alert conditions are met\"\"\"\n        \n        if event_type not in self.alert_thresholds:\n            return\n        \n        # Count recent events of the same type\n        threshold = self.alert_thresholds[event_type]\n        recent_count = await self._count_recent_events(\n            event_type, ip_address, user_id, minutes=5\n        )\n        \n        if recent_count >= threshold:\n            await self._trigger_security_alert(\n                event_type, ip_address, user_id, recent_count\n            )\n    \n    async def _trigger_security_alert(\n        self,\n        event_type: SecurityEventType,\n        ip_address: str,\n        user_id: str,\n        event_count: int\n    ) -> None:\n        \"\"\"Trigger security alert\"\"\"\n        \n        alert = {\n            \"timestamp\": datetime.utcnow().isoformat(),\n            \"alert_type\": f\"{event_type.value}_threshold_exceeded\",\n            \"ip_address\": ip_address,\n            \"user_id\": user_id,\n            \"event_count\": event_count,\n            \"severity\": \"high\"\n        }\n        \n        # Send to monitoring system (Sentry, PagerDuty, etc.)\n        self.logger.error(\"Security alert triggered\", extra=alert)\n        \n        # Send email notification\n        await self._send_security_alert_email(alert)\n    \n    async def generate_security_report(\n        self, \n        start_date: datetime, \n        end_date: datetime\n    ) -> Dict[str, Any]:\n        \"\"\"Generate security report for time period\"\"\"\n        \n        query = \"\"\"\n            SELECT \n                event_type,\n                COUNT(*) as count,\n                COUNT(DISTINCT ip_address) as unique_ips,\n                COUNT(DISTINCT user_id) as unique_users\n            FROM security_logs \n            WHERE timestamp BETWEEN :start_date AND :end_date\n            GROUP BY event_type\n            ORDER BY count DESC\n        \"\"\"\n        \n        result = await self.db.execute(\n            text(query),\n            {\"start_date\": start_date, \"end_date\": end_date}\n        )\n        \n        events = [dict(row) for row in result.fetchall()]\n        \n        return {\n            \"period\": {\n                \"start\": start_date.isoformat(),\n                \"end\": end_date.isoformat()\n            },\n            \"events\": events,\n            \"summary\": {\n                \"total_events\": sum(e[\"count\"] for e in events),\n                \"high_risk_events\": sum(\n                    e[\"count\"] for e in events \n                    if e[\"event_type\"] in [\"account_locked\", \"security_violation\"]\n                ),\n                \"unique_ips\": len(set(e[\"unique_ips\"] for e in events)),\n                \"affected_users\": len(set(e[\"unique_users\"] for e in events))\n            }\n        }\n```\n\n### Incident Response Procedures\n\n#### Automated Response Actions\n```python\nclass IncidentResponseService:\n    def __init__(self):\n        self.response_actions = {\n            \"brute_force_attack\": self._handle_brute_force,\n            \"sql_injection_attempt\": self._handle_sql_injection,\n            \"data_breach_suspected\": self._handle_data_breach,\n            \"ddos_attack\": self._handle_ddos\n        }\n    \n    async def handle_security_incident(\n        self, \n        incident_type: str, \n        context: Dict[str, Any]\n    ) -> Dict[str, Any]:\n        \"\"\"Handle security incident with automated response\"\"\"\n        \n        if incident_type in self.response_actions:\n            response = await self.response_actions[incident_type](context)\n        else:\n            response = await self._default_incident_response(context)\n        \n        # Log incident response\n        await self._log_incident_response(incident_type, context, response)\n        \n        return response\n    \n    async def _handle_brute_force(self, context: Dict[str, Any]) -> Dict[str, Any]:\n        \"\"\"Handle brute force attack\"\"\"\n        ip_address = context.get(\"ip_address\")\n        user_email = context.get(\"user_email\")\n        \n        actions_taken = []\n        \n        # Block IP address\n        if ip_address:\n            await self._block_ip_address(ip_address, duration=3600)  # 1 hour\n            actions_taken.append(f\"Blocked IP {ip_address} for 1 hour\")\n        \n        # Lock user account\n        if user_email:\n            await self._lock_user_account(user_email)\n            actions_taken.append(f\"Locked account {user_email}\")\n        \n        # Send alert\n        await self._send_emergency_alert(\n            f\"Brute force attack detected from {ip_address}\",\n            context\n        )\n        actions_taken.append(\"Sent emergency alert\")\n        \n        return {\n            \"incident_type\": \"brute_force_attack\",\n            \"actions_taken\": actions_taken,\n            \"status\": \"contained\"\n        }\n    \n    async def _handle_sql_injection(self, context: Dict[str, Any]) -> Dict[str, Any]:\n        \"\"\"Handle SQL injection attempt\"\"\"\n        ip_address = context.get(\"ip_address\")\n        request_path = context.get(\"request_path\")\n        \n        actions_taken = []\n        \n        # Immediately block IP\n        if ip_address:\n            await self._block_ip_address(ip_address, duration=86400)  # 24 hours\n            actions_taken.append(f\"Blocked IP {ip_address} for 24 hours\")\n        \n        # Log full request for forensic analysis\n        await self._log_forensic_data(context)\n        actions_taken.append(\"Logged request for forensic analysis\")\n        \n        # Send critical alert\n        await self._send_critical_alert(\n            f\"SQL injection attempt detected from {ip_address} on {request_path}\",\n            context\n        )\n        actions_taken.append(\"Sent critical alert\")\n        \n        return {\n            \"incident_type\": \"sql_injection_attempt\",\n            \"actions_taken\": actions_taken,\n            \"status\": \"blocked\"\n        }\n```\n\n## Compliance & Auditing\n\n### GDPR Compliance\n```python\nclass GDPRComplianceService:\n    def __init__(self, db: Session):\n        self.db = db\n    \n    async def process_data_subject_request(\n        self, \n        request_type: str, \n        email: str,\n        requester_verification: dict\n    ) -> Dict[str, Any]:\n        \"\"\"Process GDPR data subject requests\"\"\"\n        \n        # Verify request authenticity\n        if not await self._verify_data_subject(email, requester_verification):\n            raise HTTPException(401, \"Request verification failed\")\n        \n        if request_type == \"access\":\n            return await self._handle_data_access_request(email)\n        elif request_type == \"portability\":\n            return await self._handle_data_portability_request(email)\n        elif request_type == \"rectification\":\n            return await self._handle_data_rectification_request(email)\n        elif request_type == \"erasure\":\n            return await self._handle_data_erasure_request(email)\n        else:\n            raise ValueError(f\"Unknown request type: {request_type}\")\n    \n    async def _handle_data_erasure_request(self, email: str) -> Dict[str, Any]:\n        \"\"\"Handle right to be forgotten request\"\"\"\n        \n        # Find all personal data\n        data_sources = [\n            \"webinar_registrations\",\n            \"whitepaper_downloads\", \n            \"bookings\",\n            \"admin_users\"\n        ]\n        \n        erasure_report = []\n        \n        for source in data_sources:\n            count = await self._anonymize_personal_data(source, email)\n            erasure_report.append({\n                \"source\": source,\n                \"records_anonymized\": count\n            })\n        \n        # Log erasure for compliance\n        await self._log_gdpr_action(\"data_erasure\", email, erasure_report)\n        \n        return {\n            \"request_type\": \"erasure\",\n            \"email\": email,\n            \"status\": \"completed\",\n            \"erasure_report\": erasure_report,\n            \"completion_date\": datetime.utcnow().isoformat()\n        }\n    \n    async def _anonymize_personal_data(self, table: str, email: str) -> int:\n        \"\"\"Anonymize personal data while preserving analytics\"\"\"\n        \n        # Different anonymization strategies per table\n        if table == \"webinar_registrations\":\n            query = \"\"\"\n                UPDATE webinar_registrations \n                SET \n                    first_name = 'Anonymous',\n                    last_name = 'User',\n                    email = :anon_email,\n                    phone = NULL,\n                    company = 'Anonymized',\n                    gdpr_anonymized = true,\n                    gdpr_anonymized_at = NOW()\n                WHERE email = :email\n            \"\"\"\n        elif table == \"bookings\":\n            query = \"\"\"\n                UPDATE bookings \n                SET \n                    client_first_name = 'Anonymous',\n                    client_last_name = 'User',\n                    client_email = :anon_email,\n                    client_phone = NULL,\n                    client_company = 'Anonymized',\n                    message = '[Anonymized]',\n                    gdpr_anonymized = true,\n                    gdpr_anonymized_at = NOW()\n                WHERE client_email = :email\n            \"\"\"\n        else:\n            return 0\n        \n        # Generate consistent anonymous email\n        anon_email = f\"anonymous_{hash(email) % 100000}@anonymized.local\"\n        \n        result = await self.db.execute(\n            text(query),\n            {\"email\": email, \"anon_email\": anon_email}\n        )\n        \n        return result.rowcount\n```\n\n### Audit Logging\n```python\nclass AuditService:\n    def __init__(self, db: Session):\n        self.db = db\n    \n    async def log_audit_event(\n        self,\n        action: str,\n        resource_type: str,\n        resource_id: str,\n        user_id: str,\n        old_values: Dict[str, Any] = None,\n        new_values: Dict[str, Any] = None,\n        ip_address: str = None\n    ) -> None:\n        \"\"\"Log audit event\"\"\"\n        \n        # Mask sensitive data\n        if old_values:\n            old_values = DataMaskingService.mask_sensitive_data(old_values)\n        if new_values:\n            new_values = DataMaskingService.mask_sensitive_data(new_values)\n        \n        audit_entry = AuditLog(\n            action=action,\n            resource_type=resource_type,\n            resource_id=resource_id,\n            user_id=user_id,\n            old_values=old_values,\n            new_values=new_values,\n            ip_address=ip_address,\n            timestamp=datetime.utcnow()\n        )\n        \n        self.db.add(audit_entry)\n        await self.db.commit()\n    \n    async def generate_compliance_report(\n        self, \n        start_date: datetime, \n        end_date: datetime\n    ) -> Dict[str, Any]:\n        \"\"\"Generate compliance audit report\"\"\"\n        \n        query = \"\"\"\n            SELECT \n                action,\n                resource_type,\n                COUNT(*) as count,\n                COUNT(DISTINCT user_id) as unique_users\n            FROM audit_logs \n            WHERE timestamp BETWEEN :start_date AND :end_date\n            GROUP BY action, resource_type\n            ORDER BY count DESC\n        \"\"\"\n        \n        result = await self.db.execute(\n            text(query),\n            {\"start_date\": start_date, \"end_date\": end_date}\n        )\n        \n        activities = [dict(row) for row in result.fetchall()]\n        \n        return {\n            \"period\": {\n                \"start\": start_date.isoformat(),\n                \"end\": end_date.isoformat()\n            },\n            \"activities\": activities,\n            \"total_events\": sum(a[\"count\"] for a in activities)\n        }\n```\n\n## Security Testing\n\n### Automated Security Tests\n```python\nimport pytest\nfrom httpx import AsyncClient\n\nclass TestSecurityFeatures:\n    \n    @pytest.mark.asyncio\n    async def test_sql_injection_protection(self, client: AsyncClient):\n        \"\"\"Test SQL injection protection\"\"\"\n        malicious_inputs = [\n            \"'; DROP TABLE users; --\",\n            \"' OR '1'='1\",\n            \"'; UNION SELECT * FROM admin_users; --\",\n            \"<script>alert('xss')</script>\"\n        ]\n        \n        for payload in malicious_inputs:\n            response = await client.get(\n                \"/api/v1/public/webinars\",\n                params={\"search\": payload}\n            )\n            \n            # Should not return 500 error or expose data\n            assert response.status_code in [200, 400]\n            \n            # Response should not contain malicious content\n            content = response.text.lower()\n            assert \"drop table\" not in content\n            assert \"union select\" not in content\n            assert \"<script>\" not in content\n    \n    @pytest.mark.asyncio\n    async def test_authentication_required(self, client: AsyncClient):\n        \"\"\"Test that protected endpoints require authentication\"\"\"\n        protected_endpoints = [\n            \"/api/v1/admin/webinars\",\n            \"/api/v1/admin/users\",\n            \"/api/v1/admin/settings\"\n        ]\n        \n        for endpoint in protected_endpoints:\n            response = await client.get(endpoint)\n            assert response.status_code == 401\n    \n    @pytest.mark.asyncio\n    async def test_rate_limiting(self, client: AsyncClient):\n        \"\"\"Test rate limiting works\"\"\"\n        # Make multiple requests quickly\n        for i in range(15):  # Exceed limit of 10\n            response = await client.post(\n                \"/api/v1/auth/login\",\n                json={\"email\": \"test@example.com\", \"password\": \"wrong\"}\n            )\n        \n        # Should be rate limited\n        assert response.status_code == 429\n        assert \"rate limit\" in response.json()[\"detail\"][\"error\"].lower()\n    \n    @pytest.mark.asyncio\n    async def test_xss_protection(self, client: AsyncClient):\n        \"\"\"Test XSS protection\"\"\"\n        xss_payloads = [\n            \"<script>alert('xss')</script>\",\n            \"javascript:alert('xss')\",\n            \"<img src=x onerror=alert('xss')>\",\n            \"<svg onload=alert('xss')>\"\n        ]\n        \n        for payload in xss_payloads:\n            # Try to inject in form submission\n            response = await client.post(\n                \"/api/v1/public/webinars/test-webinar/register\",\n                json={\n                    \"attendee\": {\n                        \"first_name\": payload,\n                        \"last_name\": \"Test\",\n                        \"email\": \"test@example.com\"\n                    },\n                    \"terms_accepted\": True\n                }\n            )\n            \n            # Should either reject or sanitize\n            if response.status_code == 201:\n                # If accepted, should be sanitized\n                content = response.text\n                assert \"<script>\" not in content\n                assert \"javascript:\" not in content\n                assert \"onerror=\" not in content\n    \n    @pytest.mark.asyncio\n    async def test_csrf_protection(self, client: AsyncClient):\n        \"\"\"Test CSRF protection for state-changing operations\"\"\"\n        # Attempt state-changing operation without proper headers\n        response = await client.post(\n            \"/api/v1/admin/webinars\",\n            json={\"title\": \"Test Webinar\"},\n            headers={\"Origin\": \"https://evil.com\"}\n        )\n        \n        # Should be blocked\n        assert response.status_code in [401, 403]\n    \n    @pytest.mark.asyncio\n    async def test_sensitive_data_not_exposed(self, client: AsyncClient):\n        \"\"\"Test that sensitive data is not exposed in responses\"\"\"\n        \n        # Login to get admin access\n        login_response = await client.post(\n            \"/api/v1/auth/login\",\n            json={\"email\": \"admin@voltAIc.systems\", \"password\": \"test-password\"}\n        )\n        \n        token = login_response.json()[\"data\"][\"access_token\"]\n        headers = {\"Authorization\": f\"Bearer {token}\"}\n        \n        # Get user data\n        response = await client.get(\"/api/v1/admin/users\", headers=headers)\n        \n        assert response.status_code == 200\n        users = response.json()[\"data\"][\"users\"]\n        \n        # Check that sensitive fields are not exposed\n        for user in users:\n            assert \"hashed_password\" not in user\n            assert \"password\" not in user\n            assert \"api_key\" not in user\n```\n\n## OAuth2 & Social Media Security

### Secure OAuth2 Implementation for Social Platforms

#### OAuth2 State Management
```python
import secrets
import hashlib
import base64
from urllib.parse import urlencode
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

class SecureOAuth2Service:
    """Secure OAuth2 implementation for social media integrations"""
    
    def __init__(self, redis_client):
        self.redis = redis_client
        self.state_ttl = 600  # 10 minutes
        self.encryption_key = os.getenv('OAUTH_ENCRYPTION_KEY').encode()
        
        # Platform configurations
        self.platform_configs = {
            'linkedin': {
                'auth_url': 'https://www.linkedin.com/oauth/v2/authorization',
                'token_url': 'https://www.linkedin.com/oauth/v2/accessToken',
                'scopes': [
                    'r_liteprofile',
                    'r_emailaddress',
                    'w_member_social',
                    'r_organization_social',
                    'w_organization_social'
                ],
                'pkce_required': False
            },
            'twitter': {
                'auth_url': 'https://twitter.com/i/oauth2/authorize',
                'token_url': 'https://api.twitter.com/2/oauth2/token',
                'scopes': [
                    'tweet.read',
                    'tweet.write',
                    'users.read',
                    'tweet.moderate.write',
                    'offline.access'
                ],
                'pkce_required': True
            }
        }
    
    async def initiate_oauth_flow(
        self,
        platform: str,
        user_id: str,
        redirect_uri: str
    ) -> Dict[str, str]:
        """Initiate secure OAuth2 flow with CSRF protection"""
        
        if platform not in self.platform_configs:
            raise ValueError(f"Unsupported platform: {platform}")
        
        config = self.platform_configs[platform]
        
        # Generate cryptographically secure state
        state = self._generate_secure_state()
        
        # Store state with user context for CSRF protection
        await self._store_oauth_state(state, {
            'user_id': user_id,
            'platform': platform,
            'redirect_uri': redirect_uri,
            'timestamp': datetime.utcnow().isoformat()
        })
        
        # Build authorization URL
        auth_params = {
            'response_type': 'code',
            'client_id': self._get_client_id(platform),
            'redirect_uri': redirect_uri,
            'scope': ' '.join(config['scopes']),
            'state': state
        }
        
        # Add PKCE for Twitter
        if config['pkce_required']:
            code_verifier = self._generate_code_verifier()
            code_challenge = self._generate_code_challenge(code_verifier)
            
            auth_params.update({
                'code_challenge': code_challenge,
                'code_challenge_method': 'S256'
            })
            
            # Store code verifier for later use
            await self._store_code_verifier(state, code_verifier)
        
        auth_url = f"{config['auth_url']}?{urlencode(auth_params)}"
        
        # Log OAuth initiation
        await self._log_oauth_event(
            'oauth_initiated',
            user_id=user_id,
            platform=platform
        )
        
        return {
            'auth_url': auth_url,
            'state': state
        }
    
    def _generate_secure_state(self) -> str:
        """Generate cryptographically secure state parameter"""
        return secrets.token_urlsafe(32)
    
    def _generate_code_verifier(self) -> str:
        """Generate PKCE code verifier"""
        return base64.urlsafe_b64encode(secrets.token_bytes(32)).decode('utf-8').rstrip('=')
    
    def _generate_code_challenge(self, verifier: str) -> str:
        """Generate PKCE code challenge"""
        digest = hashlib.sha256(verifier.encode('utf-8')).digest()
        return base64.urlsafe_b64encode(digest).decode('utf-8').rstrip('=')
```

#### Social Media API Key Management
```python
class SocialMediaCredentialManager:
    """Secure management of social media API credentials"""
    
    def __init__(self, encryption_service: EncryptionService):
        self.encryption = encryption_service
        self.credential_cache = {}
        self.cache_ttl = 300  # 5 minutes
        
    async def store_platform_credentials(
        self,
        user_id: str,
        platform: str,
        credentials: Dict[str, Any]
    ) -> str:
        """Store encrypted platform credentials"""
        
        # Validate credentials structure
        required_fields = self._get_required_fields(platform)
        if not all(field in credentials for field in required_fields):
            raise ValueError(f"Missing required fields: {required_fields}")
        
        # Encrypt sensitive credentials
        encrypted_creds = {}
        for key, value in credentials.items():
            if key in ['access_token', 'refresh_token', 'client_secret']:
                encrypted_creds[key] = self.encryption.encrypt(str(value))
            else:
                encrypted_creds[key] = value
        
        # Store in database with audit trail
        credential_record = SocialCredential(**encrypted_creds)
        db.add(credential_record)
        await db.commit()
        
        # Log credential storage
        await self._log_oauth_event(
            'credentials_stored',
            user_id=user_id,
            platform=platform
        )
        
        return credential_record.id
    
    async def revoke_platform_access(
        self,
        user_id: str,
        platform: str
    ) -> bool:
        """Revoke platform access and clean up credentials"""
        
        credentials = await self.get_platform_credentials(user_id, platform)
        if not credentials:
            return False
        
        # Revoke tokens with platform
        try:
            if platform == 'linkedin':
                await self._revoke_linkedin_access(credentials['access_token'])
            elif platform == 'twitter':
                await self._revoke_twitter_access(credentials['access_token'])
        except Exception as e:
            logger.warning(f"Failed to revoke {platform} access remotely: {e}")
        
        # Mark credentials as deleted (soft delete)
        await db.query(SocialCredential).filter(
            SocialCredential.user_id == user_id,
            SocialCredential.platform == platform
        ).update({
            'deleted_at': datetime.utcnow(),
            'access_token': None,
            'refresh_token': None
        })
        
        # Log revocation
        await self._log_oauth_event(
            'access_revoked',
            user_id=user_id,
            platform=platform
        )
        
        return True
```

### Social Media Content Security

#### Content Validation and Sanitization
```python
class SocialContentSecurityService:
    """Security validation for social media content"""
    
    def __init__(self):
        # Dangerous content patterns
        self.security_patterns = [
            r'<script[^>]*>.*?</script>',  # Script tags
            r'javascript:',                # JavaScript URLs
            r'on\w+\s*=',                 # Event handlers
            r'<iframe[^>]*>',             # Iframes
        ]
    
    async def validate_social_content(
        self,
        platform: str,
        content: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Validate social media content for security and platform compliance"""
        
        validation_result = {
            'is_valid': True,
            'errors': [],
            'warnings': [],
            'sanitized_content': content.copy()
        }
        
        # Validate text content
        if 'text' in content:
            text_validation = self._validate_text_content(content['text'])
            validation_result['sanitized_content']['text'] = text_validation['sanitized']
            validation_result['errors'].extend(text_validation['errors'])
        
        # Check for spam indicators
        spam_score = self._calculate_spam_score(content)
        if spam_score > 0.8:
            validation_result['errors'].append("Content flagged as potential spam")
        
        validation_result['is_valid'] = len(validation_result['errors']) == 0
        
        return validation_result
    
    def _validate_text_content(self, text: str) -> Dict[str, Any]:
        """Validate and sanitize text content"""
        
        result = {
            'sanitized': text,
            'errors': []
        }
        
        # Security pattern detection
        for pattern in self.security_patterns:
            if re.search(pattern, text, re.IGNORECASE):
                result['errors'].append("Potentially malicious content detected")
                # Remove dangerous patterns
                result['sanitized'] = re.sub(pattern, '', result['sanitized'], flags=re.IGNORECASE)
        
        # HTML entity encoding for safety
        result['sanitized'] = html.escape(result['sanitized'])
        
        return result
```

### Social Media Rate Limiting

#### Platform-Specific Rate Limiting
```python
class SocialMediaRateLimiter:
    """Platform-specific rate limiting for social media APIs"""
    
    def __init__(self, redis_client):
        self.redis = redis_client
        
        # Platform-specific rate limits (per user per platform)
        self.rate_limits = {
            'linkedin': {
                'posts': {'limit': 25, 'window': 86400},  # 25 posts per day
                'api_calls': {'limit': 500, 'window': 3600}  # 500 API calls per hour
            },
            'twitter': {
                'tweets': {'limit': 300, 'window': 900},  # 300 tweets per 15 minutes
                'api_calls': {'limit': 75, 'window': 900}   # 75 API calls per 15 minutes
            }
        }
    
    async def check_posting_limit(
        self,
        user_id: str,
        platform: str,
        action: str = 'posts'
    ) -> Dict[str, Any]:
        """Check if user can perform posting action"""
        
        if platform not in self.rate_limits:
            return {'allowed': True, 'remaining': float('inf')}
        
        limit_config = self.rate_limits[platform].get(action, {})
        if not limit_config:
            return {'allowed': True, 'remaining': float('inf')}
        
        key = f"social_rate_limit:{platform}:{action}:{user_id}"
        current_count = await self.redis.get(key)
        
        if current_count is None:
            current_count = 0
        else:
            current_count = int(current_count)
        
        limit = limit_config['limit']
        
        if current_count >= limit:
            ttl = await self.redis.ttl(key)
            return {
                'allowed': False,
                'remaining': 0,
                'reset_in': ttl,
                'limit': limit
            }
        
        return {
            'allowed': True,
            'remaining': limit - current_count,
            'limit': limit
        }
    
    async def record_action(
        self,
        user_id: str,
        platform: str,
        action: str = 'posts'
    ) -> None:
        """Record action for rate limiting"""
        
        if platform not in self.rate_limits:
            return
        
        limit_config = self.rate_limits[platform].get(action, {})
        if not limit_config:
            return
        
        key = f"social_rate_limit:{platform}:{action}:{user_id}"
        window = limit_config['window']
        
        # Increment counter
        current = await self.redis.incr(key)
        
        # Set expiration on first increment
        if current == 1:
            await self.redis.expire(key, window)
```

## Consultant System Security Requirements

### Consultant Profile Security

#### Multi-Factor Authentication for Consultant Accounts
→ **Implementation Details**: [RBAC System](../backend/api.md#consultant-permissions)
← **User Permissions**: [Consultant Persona](../users/knowhow-bearer.md#access-control-permissions)
🔗 **Database Schema**: [Consultant Tables](../backend/database.md#consultant-tables)

```python
from app.core.security import MFAService, SecurityEventType
from app.integrations.sms import SMSService
from app.integrations.email import EmailService

class ConsultantMFAService(MFAService):
    """Enhanced MFA service specifically for consultant accounts."""
    
    def __init__(self, db_session, sms_service: SMSService, email_service: EmailService):
        super().__init__(db_session)
        self.sms_service = sms_service
        self.email_service = email_service
        self.consultant_mfa_requirements = {
            'payment_enabled_consultants': True,  # Mandatory for consultants with payment access
            'high_earning_consultants': True,     # Mandatory for consultants earning >€1000/month
            'content_creators': False,            # Optional for content-only consultants
        }
    
    async def enforce_consultant_mfa(
        self, 
        consultant_id: str, 
        consultant_earnings: float,
        has_payment_access: bool
    ) -> Dict[str, Any]:
        """Enforce MFA requirements based on consultant profile and activities."""
        try:
            # Determine MFA requirement level
            mfa_required = (
                has_payment_access or 
                consultant_earnings > 1000.00 or
                await self._has_high_risk_activities(consultant_id)
            )
            
            if not mfa_required:
                return {'mfa_required': False, 'reason': 'below_risk_threshold'}
            
            # Check current MFA status
            mfa_status = await self._get_consultant_mfa_status(consultant_id)
            
            if not mfa_status['enabled']:
                # Initiate mandatory MFA setup
                setup_result = await self._initiate_mfa_setup(
                    consultant_id,
                    mandatory=True,
                    reason='consultant_security_policy'
                )
                
                # Log security event
                await self.security_monitor.log_security_event(
                    SecurityEventType.SECURITY_VIOLATION,
                    user_id=consultant_id,
                    details={
                        'event': 'mfa_enforcement_triggered',
                        'consultant_earnings': consultant_earnings,
                        'has_payment_access': has_payment_access
                    }
                )
                
                return {
                    'mfa_required': True,
                    'setup_initiated': True,
                    'setup_url': setup_result['setup_url'],
                    'deadline': setup_result['setup_deadline']
                }
            
            return {'mfa_required': True, 'status': 'compliant'}
            
        except Exception as e:
            await self.security_monitor.log_security_event(
                SecurityEventType.SECURITY_VIOLATION,
                user_id=consultant_id,
                details={'error': str(e), 'component': 'consultant_mfa'}
            )
            raise
```

#### Role-Based Access Control for Consultant Data
```python
class ConsultantRolePermissions(str, Enum):
    # Consultant profile management
    CONSULTANT_PROFILE_READ = "consultant_profile:read"
    CONSULTANT_PROFILE_WRITE = "consultant_profile:write"
    CONSULTANT_PROFILE_DELETE = "consultant_profile:delete"
    
    # Content creation and management
    CONSULTANT_CONTENT_CREATE = "consultant_content:create"
    CONSULTANT_CONTENT_PUBLISH = "consultant_content:publish"
    CONSULTANT_CONTENT_COLLABORATE = "consultant_content:collaborate"
    
    # Consultation booking management
    CONSULTANT_BOOKINGS_READ = "consultant_bookings:read"
    CONSULTANT_BOOKINGS_MANAGE = "consultant_bookings:manage"
    CONSULTANT_CALENDAR_SYNC = "consultant_calendar:sync"
    
    # Financial and payment access
    CONSULTANT_EARNINGS_READ = "consultant_earnings:read"
    CONSULTANT_PAYOUT_MANAGE = "consultant_payout:manage"
    CONSULTANT_TAX_DOCUMENTS = "consultant_tax:documents"
    
    # Client interaction permissions
    CONSULTANT_CLIENT_COMMUNICATION = "consultant_client:communication"
    CONSULTANT_CLIENT_DATA_LIMITED = "consultant_client:data_limited"
    
    # Analytics and performance data
    CONSULTANT_ANALYTICS_PERSONAL = "consultant_analytics:personal"
    CONSULTANT_ANALYTICS_BENCHMARKS = "consultant_analytics:benchmarks"

class ConsultantSecurityLevel(str, Enum):
    BASIC = "basic"                    # Content-only consultants
    VERIFIED = "verified"              # KYC-verified consultants
    PAYMENT_ENABLED = "payment_enabled" # Full payment access
    HIGH_EARNER = "high_earner"        # >€1000/month earnings

# Enhanced RBAC for consultant-specific permissions
CONSULTANT_ROLE_PERMISSIONS: Dict[ConsultantSecurityLevel, Set[ConsultantRolePermissions]] = {
    ConsultantSecurityLevel.BASIC: {
        ConsultantRolePermissions.CONSULTANT_PROFILE_READ,
        ConsultantRolePermissions.CONSULTANT_PROFILE_WRITE,
        ConsultantRolePermissions.CONSULTANT_CONTENT_CREATE,
        ConsultantRolePermissions.CONSULTANT_ANALYTICS_PERSONAL
    },
    
    ConsultantSecurityLevel.VERIFIED: {
        # All BASIC permissions plus:
        ConsultantRolePermissions.CONSULTANT_CONTENT_PUBLISH,
        ConsultantRolePermissions.CONSULTANT_CONTENT_COLLABORATE,
        ConsultantRolePermissions.CONSULTANT_BOOKINGS_READ,
        ConsultantRolePermissions.CONSULTANT_CALENDAR_SYNC,
        ConsultantRolePermissions.CONSULTANT_ANALYTICS_BENCHMARKS
    },
    
    ConsultantSecurityLevel.PAYMENT_ENABLED: {
        # All VERIFIED permissions plus:
        ConsultantRolePermissions.CONSULTANT_BOOKINGS_MANAGE,
        ConsultantRolePermissions.CONSULTANT_EARNINGS_READ,
        ConsultantRolePermissions.CONSULTANT_PAYOUT_MANAGE,
        ConsultantRolePermissions.CONSULTANT_CLIENT_COMMUNICATION,
        ConsultantRolePermissions.CONSULTANT_CLIENT_DATA_LIMITED,
        ConsultantRolePermissions.CONSULTANT_TAX_DOCUMENTS
    },
    
    ConsultantSecurityLevel.HIGH_EARNER: {
        # All PAYMENT_ENABLED permissions plus enhanced security requirements
        # (same permissions but with additional security validation)
    }
}
```

#### Profile Data Encryption and Secure Storage
→ **Encryption Service**: [Data Protection System](../backend/api.md#encryption-service)
🔗 **Privacy Compliance**: [GDPR Implementation](../privacy-compliance.md#consultant-data-protection)
⚡ **Secure Storage**: [Database Encryption](../backend/database.md#data-encryption)

#### LinkedIn API Security Measures and Rate Limiting
→ **LinkedIn Integration**: [Professional Platform Integration](../integrations/linkedin.md#consultant-integration)
⚡ **API Security**: [Third-party API Protection](../integrations/integrations.md#api-security)
🔗 **Rate Limiting**: [Platform Rate Limiting](../architecture.md#rate-limiting-strategy)

#### Identity Verification and Credential Authentication
→ **KYC Process**: [Identity Verification System](../integrations/payment-processing.md#kyc-compliance)
🔗 **Document Security**: [Secure Document Handling](../backend/database.md#document-encryption)
← **Consultant Onboarding**: [Verification Workflow](../users/knowhow-bearer.md#kyc-compliance)

### Payment Processing Security

#### PCI DSS Level 1 Compliance Implementation
→ **Payment Integration**: [Stripe Connect Security](../integrations/payment-processing.md#stripe-connect-security)
🔗 **Financial Compliance**: [Payment Security Framework](../integrations/payment-processing.md#security-compliance)
⚡ **Consultant Payments**: [Payout Security](../integrations/payment-processing.md#payout-security)

#### Secure Payment Data Tokenization
→ **Data Tokenization**: [Payment Data Protection](../integrations/payment-processing.md#data-tokenization)
🔗 **Consultant Financial Data**: [Financial Data Encryption](../backend/database.md#financial-encryption)
⚡ **Token Management**: [Secure Token Lifecycle](../security.md#token-management)

#### Fraud Detection and Prevention Systems
→ **Risk Assessment**: [Payment Risk Analysis](../integrations/payment-processing.md#fraud-detection)
🔗 **Consultant Monitoring**: [Payout Risk Management](../integrations/payment-processing.md#payout-monitoring)
⚡ **Automated Controls**: [Fraud Prevention Automation](../backend/api.md#fraud-prevention)

#### Transaction Monitoring and Anomaly Detection
→ **Transaction Analysis**: [Payment Transaction Monitoring](../integrations/payment-processing.md#transaction-monitoring)
🔗 **Anomaly Detection**: [Suspicious Activity Detection](../backend/analytics.md#anomaly-detection)
⚡ **Alert System**: [Financial Security Alerts](../backend/api.md#security-alerts)

#### Secure API Endpoints for Payment Processing
→ **API Security**: [Payment API Protection](../backend/api.md#payment-security)
🔗 **Endpoint Validation**: [Payment Endpoint Validation](../integrations/payment-processing.md#api-validation)
⚡ **Authentication**: [Payment Authentication](../security.md#payment-authentication)

### Financial Data Security

#### Bank Account Information Encryption
→ **Encryption Standards**: [Financial Data Encryption](../backend/database.md#financial-data-encryption)
🔗 **Compliance Requirements**: [Banking Security Standards](../integrations/payment-processing.md#bank-account-security)
⚡ **Access Controls**: [Financial Data Access](../security.md#financial-access-controls)

#### KYC Document Secure Storage and Access Control
→ **Document Management**: [Secure Document Storage](../backend/database.md#kyc-document-storage)
← **Compliance Framework**: [KYC Compliance System](../integrations/payment-processing.md#kyc-compliance)
🔗 **Privacy Protection**: [Document Privacy Controls](../privacy-compliance.md#kyc-document-protection)

#### Tax Document Protection and Audit Trails
→ **Tax Compliance**: [Tax Document Management](../integrations/payment-processing.md#tax-compliance)
🔗 **Audit System**: [Financial Document Auditing](../security.md#financial-audit-trails)
⚡ **Privacy Controls**: [Tax Information Protection](../privacy-compliance.md#tax-data-protection)

#### Revenue Data Integrity and Validation
→ **Financial Reporting**: [Consultant Earnings Analytics](../backend/analytics.md#consultant-earnings)
🔗 **Data Validation**: [Revenue Data Validation](../backend/api.md#financial-data-validation)
⚡ **Audit Controls**: [Financial Audit Trail](../security.md#financial-audit-logging)

#### Payout Security and Authorization Controls
→ **Payout System**: [Secure Payout Processing](../integrations/payment-processing.md#payout-security)
🔗 **Authorization Framework**: [Multi-level Payout Approval](../security.md#payout-authorization)
⚡ **Monitoring System**: [Payout Monitoring and Alerts](../backend/analytics.md#payout-monitoring)

### Web Scraping Security

#### Secure Scoopp Integration and API Protection
→ **Scraping Integration**: [Scoopp Web Crawling](../integrations/scoopp-webcrawling.md#security-measures)
🔗 **API Security**: [Third-party API Protection](../integrations/integrations.md#api-security)
⚡ **Data Validation**: [Scraped Data Security](../integrations/scoopp-webcrawling.md#data-validation)

#### LinkedIn Scraping Rate Limiting and IP Rotation
← **LinkedIn Security**: [Professional Platform Security](#linkedin-api-security-measures-and-rate-limiting)
→ **Rate Limiting**: [Scraping Rate Controls](../integrations/linkedin.md#rate-limiting)
🔗 **IP Management**: [IP Rotation Security](../integrations/scoopp-webcrawling.md#ip-rotation)

#### Scraped Data Validation and Sanitization
→ **Data Processing**: [Scraping Data Validation](../integrations/scoopp-webcrawling.md#data-sanitization)
🔗 **Security Controls**: [Input Sanitization](../security.md#input-validation-sanitization)
⚡ **Quality Assurance**: [Data Quality Controls](../backend/api.md#data-quality)

#### Job Queue Security and Access Control
→ **Queue Management**: [Secure Job Processing](../integrations/scoopp-webcrawling.md#queue-security)
🔗 **Access Controls**: [Queue Operation Permissions](../security.md#queue-access-control)
⚡ **Monitoring**: [Queue Security Monitoring](../backend/analytics.md#queue-monitoring)

#### Error Handling Without Data Exposure
→ **Error Management**: [Secure Error Handling](../integrations/scoopp-webcrawling.md#error-handling)
🔗 **Data Protection**: [Error Log Sanitization](../security.md#error-log-security)
⚡ **Privacy Controls**: [Sensitive Data Masking](../privacy-compliance.md#error-data-protection)

### Consultant-Specific Permissions

#### Granular Access Control for Consultant Profiles
→ **RBAC Implementation**: [Consultant Role Definitions](#role-based-access-control-for-consultant-data)
🔗 **Profile Management**: [Consultant Profile Security](../users/knowhow-bearer.md#access-control-permissions)
⚡ **Data Minimization**: [Limited Data Access](../privacy-compliance.md#consultant-data-minimization)

#### Content Authorship Verification and Attribution
→ **Content Security**: [Whitepaper Authorship](../frontend/public/features/whitepapers.md#consultant-authorship)
🔗 **Attribution System**: [Author Verification](../backend/api.md#content-attribution)
← **Intellectual Property**: [Content Rights Management](../privacy-compliance.md#intellectual-property)

#### Booking System Security and Calendar Integration
→ **Booking Security**: [Consultation Booking Protection](../frontend/public/features/book-a-meeting.md#security-measures)
🔗 **Calendar Security**: [Calendar Integration Security](../integrations/calendar.md#security-controls)
⚡ **Client Data Protection**: [Booking Data Privacy](../privacy-compliance.md#booking-data-protection)

#### Performance Analytics Access Control
→ **Analytics Security**: [Consultant Analytics Access](../backend/analytics.md#consultant-analytics)
🔗 **Data Segregation**: [Performance Data Isolation](../backend/database.md#analytics-data-security)
⚡ **Privacy Controls**: [Analytics Privacy Protection](../privacy-compliance.md#analytics-privacy)

#### Financial Dashboard Security Measures
→ **Dashboard Security**: [Financial Dashboard Protection](../frontend/adminpanel/admin.md#financial-security)
🔗 **Data Encryption**: [Financial Display Security](../frontend/public.md#financial-data-display)
⚡ **Session Security**: [Dashboard Session Management](../security.md#dashboard-session-security)

### API Security Enhancements

#### Enhanced Authentication for Consultant Endpoints
→ **Consultant API Security**: [Enhanced Authentication System](#multi-factor-authentication-for-consultant-accounts)
🔗 **Endpoint Protection**: [API Security Framework](../backend/api.md#consultant-endpoints)
⚡ **Session Management**: [Consultant Session Security](#consultant-session-security-validation)

#### Rate Limiting for Consultant-Specific Operations
→ **Rate Limiting Implementation**: [Consultant Rate Controls](#linkedin-api-security-measures-and-rate-limiting)
🔗 **Operation Classification**: [Consultant API Operations](../backend/api.md#consultant-rate-limiting)
⚡ **Usage Monitoring**: [API Usage Analytics](../backend/analytics.md#consultant-api-usage)

#### Input Validation for Consultant Data
→ **Data Validation**: [Consultant Input Validation](../backend/api.md#consultant-data-validation)
🔗 **Security Controls**: [Input Sanitization Framework](../security.md#input-validation-sanitization)
⚡ **Type Safety**: [Consultant Data Types](../backend/database.md#consultant-data-types)

#### Output Sanitization for Public Profiles
→ **Output Security**: [Profile Output Sanitization](../frontend/public.md#consultant-profile-security)
🔗 **XSS Protection**: [Cross-site Scripting Prevention](../security.md#xss-protection)
⚡ **Data Masking**: [Sensitive Information Masking](../privacy-compliance.md#profile-data-masking)

#### Audit Logging for All Consultant Activities
→ **Audit System**: [Comprehensive Audit Logging](../security.md#audit-logging)
🔗 **Activity Tracking**: [Consultant Activity Monitoring](../backend/analytics.md#consultant-activity)
⚡ **Compliance Logging**: [Regulatory Audit Trails](../privacy-compliance.md#audit-compliance)

### Integration Security

#### Secure LinkedIn API Integration
→ **LinkedIn Security Framework**: [Professional Platform Integration](#linkedin-api-security-measures-and-rate-limiting)
🔗 **OAuth2 Security**: [Social Authentication Security](#secure-oauth2-implementation-for-social-platforms)
⚡ **Data Protection**: [LinkedIn Data Security](../integrations/linkedin.md#data-protection)

#### Payment Gateway Security Protocols
→ **Stripe Security**: [Payment Gateway Integration](../integrations/payment-processing.md#stripe-connect-security)
🔗 **Transaction Security**: [Payment Transaction Protection](#pci-dss-level-1-compliance-implementation)
← **Compliance Standards**: [Payment Security Compliance](../privacy-compliance.md#payment-processing-compliance)

#### Third-Party Service Authentication
→ **Service Authentication**: [Third-party Authentication Framework](../integrations/integrations.md#authentication-security)
🔗 **API Key Management**: [Secure API Key Handling](../security.md#api-key-management)
⚡ **Service Monitoring**: [Third-party Service Monitoring](../backend/analytics.md#integration-monitoring)

#### Webhook Security and Verification
→ **Webhook Security**: [Secure Webhook Processing](../integrations/integrations.md#webhook-security)
🔗 **Signature Verification**: [Webhook Signature Validation](../security.md#webhook-verification)
⚡ **Event Processing**: [Secure Event Handling](../backend/api.md#webhook-processing)

#### Cross-System Data Validation
→ **Data Consistency**: [Inter-system Data Validation](../integrations/integrations.md#data-consistency)
🔗 **Validation Framework**: [Cross-platform Data Validation](../backend/api.md#cross-system-validation)
⚡ **Error Handling**: [Integration Error Management](../integrations/integrations.md#error-handling)

## Security Checklist\n\n### Pre-Production Security Checklist\n```markdown\n## Authentication & Authorization\n- [ ] JWT tokens use RS256 algorithm with proper key rotation\n- [ ] Access tokens expire within 15 minutes\n- [ ] Refresh tokens expire within 7 days\n- [ ] Token blacklisting implemented for logout\n- [ ] Account lockout after 5 failed login attempts\n- [ ] Password complexity requirements enforced\n- [ ] Role-based access control (RBAC) implemented\n- [ ] Principle of least privilege followed\n\n## Input Validation & Output Encoding\n- [ ] All user inputs validated with Pydantic schemas\n- [ ] SQL injection protection with parameterized queries\n- [ ] XSS protection with proper output encoding\n- [ ] CSRF protection implemented\n- [ ] File upload validation and size limits\n- [ ] Request size limits enforced\n\n## Data Protection\n- [ ] Sensitive data encrypted at rest\n- [ ] TLS 1.2+ for all communications\n- [ ] Database connections encrypted\n- [ ] API keys and secrets stored securely\n- [ ] Personal data anonymization for GDPR compliance\n- [ ] Backup encryption implemented\n\n## Infrastructure Security\n- [ ] Containers run as non-root users\n- [ ] Security updates applied\n- [ ] Firewall rules configured (minimal access)\n- [ ] SSL/TLS certificates configured properly\n- [ ] Security headers implemented\n- [ ] Rate limiting configured\n- [ ] CORS policy restrictive\n\n## Monitoring & Logging\n- [ ] Security event logging implemented\n- [ ] Failed login attempt monitoring\n- [ ] Suspicious activity detection\n- [ ] Audit trails for all admin actions\n- [ ] Security incident response procedures\n- [ ] Log retention policy defined\n\n## Compliance\n- [ ] GDPR compliance measures implemented\n- [ ] Data subject rights procedures\n- [ ] Privacy policy updated\n- [ ] Cookie consent mechanism\n- [ ] Data processing records maintained\n\n## Testing\n- [ ] Security test suite implemented\n- [ ] Penetration testing completed\n- [ ] Vulnerability scanning performed\n- [ ] Code security analysis (SAST) completed\n- [ ] Dependency vulnerability check passed\n```\n\n## Success Metrics\n\n### Security KPIs\n- **Zero Critical Vulnerabilities**: No high/critical security issues in production\n- **Authentication Success Rate**: >99% legitimate login success\n- **False Positive Rate**: <5% for security controls\n- **Incident Response Time**: <30 minutes for critical issues\n- **Security Test Coverage**: >95% for security-critical code paths\n- **Compliance Score**: 100% compliance with GDPR requirements\n- **Security Training**: 100% team completion of security awareness\n\n### Consultant Security Success Metrics
- **Consultant MFA Adoption Rate**: >95% for payment-enabled consultants
- **KYC Verification Success Rate**: >99% automated verification completion
- **Payment Security Incidents**: Zero critical payment security breaches
- **LinkedIn Integration Security Score**: 100% compliance with LinkedIn security policies
- **Financial Data Protection**: Zero unauthorized access to consultant financial data
- **Consultant Privacy Compliance**: 100% GDPR compliance for consultant data
- **Identity Verification Accuracy**: >99.5% accurate consultant identity verification
- **Payout Security Success Rate**: >99.9% secure payout processing
- **Consultant Content Attribution**: 100% accurate content authorship verification
- **Web Scraping Compliance**: Zero violations of platform scraping policies

### Consultant Security Training Requirements
- **Consultant Security Awareness**: 100% completion of security training for all consultants
- **Payment Security Training**: Mandatory training for all payment-enabled consultants
- **Data Protection Training**: GDPR compliance training for consultants handling client data
- **LinkedIn Integration Security**: Training on secure professional platform usage
- **Financial Security Best Practices**: Training on secure banking and tax information handling

### Consultant Security Audit Requirements
- **Monthly Security Audits**: Comprehensive review of consultant security controls
- **Payment Processing Audits**: PCI DSS compliance audits for payment systems
- **KYC Document Audits**: Regular review of identity verification processes
- **Financial Data Access Audits**: Quarterly review of consultant financial data access
- **Integration Security Audits**: Regular assessment of third-party integration security
- **Consultant Permission Audits**: Semi-annual review of consultant access permissions

This comprehensive security specification ensures Magnetiq v2 maintains the highest security standards while providing excellent user experience and meeting all compliance requirements, with specialized security measures for the consultant ecosystem."}]