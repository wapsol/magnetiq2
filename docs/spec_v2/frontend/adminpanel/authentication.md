# Magnetiq v2 - Admin Panel Authentication Specification

## Overview

The Admin Panel Authentication feature provides secure login, session management, and access control specifically for administrative users of the Magnetiq v2 platform. This feature protects the admin panel and ensures only authorized administrators can access content management, user administration, and system configuration features.

**Business Value**: Secures administrative access to sensitive platform operations, prevents unauthorized access to admin functionality, and maintains audit trails for administrative actions.

## Core Entities

### Admin Authentication Data Models

```typescript
// Frontend TypeScript Interfaces
interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'content_editor';
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  permissions: AdminPermission[];
}

interface AdminPermission {
  id: string;
  name: string;
  description: string;
  module: 'users' | 'content' | 'business' | 'system';
}

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

// Note: Admin registration is handled via backend admin creation scripts only
// No public admin registration is allowed

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

interface AdminAuthState {
  admin: AdminUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  permissions: string[];
}
```

### Backend Data Models

```python
# Python Pydantic Models (backend/schemas)
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime

class AdminLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: Optional[bool] = False

class AdminResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    last_login_at: Optional[datetime]
    created_at: datetime
    permissions: List[str]

class AdminCreateRequest(BaseModel):
    """Used only by super admin via backend scripts"""
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    role: str
    permissions: List[str]

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
```

## Admin Workflows

### 1. Admin Login Flow

1. **Admin Access**: Admin navigates to `/admin/login`
2. **Credential Validation**: Backend verifies admin credentials against admin_users table
3. **Permission Loading**: Load admin permissions for role-based access
4. **Token Generation**: Create JWT access and refresh tokens with admin claims
5. **Session Creation**: Store admin session information in Redis
6. **Client Storage**: Store tokens in secure HTTP-only cookies
7. **Admin Dashboard**: Redirect to admin dashboard with appropriate permissions

### 2. Admin Password Reset Flow

1. **Reset Request**: Admin requests password reset via admin email
2. **Super Admin Approval**: Super admin must approve password reset requests
3. **Secure Reset**: Password reset handled via backend admin scripts
4. **Notification**: Admin notified of password change
5. **Session Invalidation**: All admin sessions invalidated
6. **Re-authentication Required**: Admin must login with new credentials

## API Endpoints

### Admin Authentication Endpoints

```python
# POST /api/v1/admin/auth/login
@router.post("/login", response_model=TokenResponse)
async def login_admin(
    credentials: AdminLogin,
    db: Session = Depends(get_db)
) -> TokenResponse:
    """Authenticate admin and return tokens with permissions"""
    pass

# POST /api/v1/admin/auth/refresh
@router.post("/refresh", response_model=TokenResponse)
async def refresh_admin_token(
    refresh_token: str = Cookie(None),
    db: Session = Depends(get_db)
) -> TokenResponse:
    """Refresh admin access token"""
    pass

# POST /api/v1/admin/auth/logout
@router.post("/logout")
async def logout_admin(
    current_admin: AdminUser = Depends(get_current_admin)
) -> dict:
    """Logout admin and invalidate tokens"""
    pass

# GET /api/v1/admin/auth/me
@router.get("/me", response_model=AdminResponse)
async def get_current_admin(
    current_admin: AdminUser = Depends(get_current_admin)
) -> AdminResponse:
    """Get current admin user profile and permissions"""
    pass

# POST /api/v1/admin/auth/change-password
@router.post("/change-password")
async def change_admin_password(
    current_password: str,
    new_password: str,
    current_admin: AdminUser = Depends(get_current_admin),
    db: Session = Depends(get_db)
) -> dict:
    """Change admin password (self-service)"""
    pass
```

## Frontend Components

### React Component Structure

```typescript
// Admin Authentication Components
components/
├── admin/
│   ├── auth/
│   │   ├── AdminLoginForm.tsx        # Admin login form component
│   │   ├── AdminPasswordChange.tsx   # Admin password change form
│   │   ├── AdminAuthGuard.tsx        # Admin route protection wrapper
│   │   ├── AdminPermissionGuard.tsx  # Permission-based access control
│   │   └── AdminSessionTimeout.tsx   # Session timeout handler
│   ├── layout/
│   │   ├── AdminHeader.tsx           # Admin panel header with logout
│   │   └── AdminNavigation.tsx       # Admin navigation with permissions

// Admin Authentication Pages
pages/
├── admin/
│   ├── auth/
│   │   ├── AdminLoginPage.tsx        # Admin login page layout
│   │   ├── AdminUnauthorized.tsx     # Unauthorized access page
│   │   └── AdminSessionExpired.tsx   # Session expired page
│   └── dashboard/
│       └── AdminDashboard.tsx        # Main admin dashboard

// Admin Authentication Services
services/
├── adminAuthService.ts               # API calls for admin authentication
├── adminTokenService.ts              # Admin token management utilities
├── adminPermissionService.ts         # Permission checking utilities
└── adminSecureStorage.ts             # Secure admin token storage
```

### State Management (Redux)

```typescript
// Admin Redux Store Structure
interface AdminRootState {
  adminAuth: AdminAuthState;
  adminPermissions: AdminPermissionState;
}

interface AdminPermissionState {
  permissions: string[];
  rolePermissions: Record<string, string[]>;
  isLoading: boolean;
}

// Admin Auth Slice Actions
const adminAuthSlice = createSlice({
  name: 'adminAuth',
  initialState: {
    admin: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    permissions: [],
    sessionTimeoutWarning: false
  },
  reducers: {
    adminLoginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    adminLoginSuccess: (state, action) => {
      state.admin = action.payload.admin;
      state.tokens = action.payload.tokens;
      state.permissions = action.payload.permissions;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    adminLoginFailure: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    adminLogout: (state) => {
      state.admin = null;
      state.tokens = null;
      state.permissions = [];
      state.isAuthenticated = false;
      state.sessionTimeoutWarning = false;
    },
    setSessionTimeoutWarning: (state, action) => {
      state.sessionTimeoutWarning = action.payload;
    }
  }
});

// Admin RTK Query API
const adminAuthApi = createApi({
  reducerPath: 'adminAuthApi',
  tagTypes: ['AdminAuth', 'AdminPermissions'],
  endpoints: (builder) => ({
    adminLogin: builder.mutation<TokenResponse, AdminLogin>({
      query: (credentials) => ({
        url: '/admin/auth/login',
        method: 'POST',
        body: credentials
      })
    }),
    adminRefreshToken: builder.mutation<TokenResponse, void>({
      query: () => ({
        url: '/admin/auth/refresh',
        method: 'POST'
      })
    }),
    adminLogout: builder.mutation<void, void>({
      query: () => ({
        url: '/admin/auth/logout',
        method: 'POST'
      })
    }),
    getCurrentAdmin: builder.query<AdminResponse, void>({
      query: () => '/admin/auth/me',
      providesTags: ['AdminAuth']
    }),
    changeAdminPassword: builder.mutation<void, {currentPassword: string, newPassword: string}>({
      query: (passwords) => ({
        url: '/admin/auth/change-password',
        method: 'POST',
        body: passwords
      })
    })
  })
});
```

## Business Logic

### Admin Authentication Service

```python
# Backend Admin Authentication Service
class AdminAuthenticationService:
    def __init__(self, db: Session, redis_client):
        self.db = db
        self.redis = redis_client
        self.password_service = PasswordService()
        self.jwt_service = AdminJWTService()
        self.audit_service = AdminAuditService()
        self.security_service = AdminSecurityService()
    
    async def authenticate_admin(self, credentials: AdminLogin, request_ip: str) -> tuple[AdminUser, AuthTokens]:
        """Authenticate admin with enhanced security checks"""
        # Check rate limiting
        await self.security_service.check_login_rate_limit(credentials.email, request_ip)
        
        # Get admin user
        admin = await self.get_admin_by_email(credentials.email)
        if not admin:
            # Log failed attempt
            await self.audit_service.log_failed_login_attempt(credentials.email, request_ip, "Admin not found")
            raise HTTPException(401, "Invalid credentials")
        
        # Verify password
        if not self.password_service.verify_password(
            credentials.password, 
            admin.hashed_password
        ):
            await self.audit_service.log_failed_login_attempt(credentials.email, request_ip, "Invalid password")
            await self.security_service.increment_failed_attempts(credentials.email, request_ip)
            raise HTTPException(401, "Invalid credentials")
        
        # Check if admin account is active
        if not admin.is_active:
            await self.audit_service.log_failed_login_attempt(credentials.email, request_ip, "Inactive account")
            raise HTTPException(401, "Account deactivated")
        
        # Check concurrent session limits
        await self.security_service.check_concurrent_sessions(admin.id)
        
        # Generate admin tokens with enhanced claims
        tokens = await self.jwt_service.create_admin_token_pair(admin)
        
        # Create admin session in Redis
        session_data = {
            'admin_id': admin.id,
            'email': admin.email,
            'role': admin.role,
            'permissions': [p.name for p in admin.permissions],
            'login_time': datetime.utcnow().isoformat(),
            'ip_address': request_ip
        }
        await self.redis.setex(
            f"admin_session:{tokens.access_token}",
            3600,  # 1 hour
            json.dumps(session_data)
        )
        
        # Update last login and reset failed attempts
        admin.last_login_at = datetime.utcnow()
        await self.security_service.reset_failed_attempts(credentials.email, request_ip)
        await self.db.commit()
        
        # Log successful login
        await self.audit_service.log_admin_login(admin.id, request_ip)
        
        return admin, tokens
    
    async def validate_admin_session(self, access_token: str) -> AdminUser:
        """Validate admin session and return admin user"""
        # Verify JWT token
        payload = await self.jwt_service.verify_admin_token(access_token)
        
        # Check session exists in Redis
        session_data = await self.redis.get(f"admin_session:{access_token}")
        if not session_data:
            raise HTTPException(401, "Session expired")
        
        # Get current admin
        admin = await self.get_admin_by_id(payload['sub'])
        if not admin or not admin.is_active:
            raise HTTPException(401, "Invalid admin session")
        
        return admin
    
    async def change_admin_password(self, admin_id: str, current_password: str, new_password: str) -> None:
        """Change admin password with security validation"""
        admin = await self.get_admin_by_id(admin_id)
        
        # Verify current password
        if not self.password_service.verify_password(current_password, admin.hashed_password):
            raise HTTPException(400, "Current password is incorrect")
        
        # Validate new password strength (stricter for admins)
        await self.security_service.validate_admin_password_strength(new_password)
        
        # Check password history
        await self.security_service.check_password_history(admin_id, new_password)
        
        # Hash new password
        hashed_password = self.password_service.hash_password(new_password)
        
        # Update password
        admin.hashed_password = hashed_password
        admin.password_changed_at = datetime.utcnow()
        
        # Add to password history
        await self.security_service.add_password_to_history(admin_id, hashed_password)
        
        # Invalidate all existing sessions
        await self.invalidate_all_admin_sessions(admin_id)
        
        await self.db.commit()
        
        # Log password change
        await self.audit_service.log_admin_password_change(admin_id)
```

## Security Requirements

### Enhanced Admin Authentication Security

1. **Admin Password Security**
   - Minimum 12 characters with strict complexity requirements
   - Must include uppercase, lowercase, numbers, and special characters
   - Bcrypt hashing with salt rounds = 15 (higher than regular users)
   - Password history tracking (last 12 passwords)
   - Mandatory password change every 90 days
   - Account lockout after 3 failed attempts

2. **Admin Token Security**
   - JWT with RS256 algorithm and rotating keys
   - 30-minute access token lifetime (shorter than regular users)
   - 2-hour refresh token lifetime (much shorter than regular users)
   - Secure HTTP-only cookies with SameSite=Strict
   - Token binding to IP address and User-Agent
   - Automatic token revocation on suspicious activity

3. **Admin Session Security**
   - Redis-based session storage with encryption
   - Automatic session cleanup every 15 minutes
   - Maximum 2 concurrent sessions per admin
   - Session timeout after 30 minutes of inactivity
   - Geolocation tracking and alerts for unusual locations
   - Device fingerprinting for session validation

4. **Enhanced Rate Limiting**
   - Login attempts: 3 per minute per IP (stricter than regular users)
   - Account lockout: 1 hour after 3 failed attempts
   - Progressive delays: 1s, 5s, 30s for successive failures
   - IP-based temporary blocks for repeated violations

5. **Multi-Factor Authentication (Future)**
   - TOTP integration for super admins
   - SMS/Email backup codes
   - Hardware security key support

### Admin Data Protection

1. **Enhanced Input Validation**
   - Strict email domain validation (only corporate domains)
   - Advanced password strength validation with entropy checking
   - SQL injection prevention with parameterized queries
   - XSS protection with Content Security Policy
   - CSRF protection with double-submit cookies

2. **Admin Privacy Protection**
   - Comprehensive audit logging for all admin actions
   - No admin credentials in application logs
   - Encrypted storage of admin session data
   - Secure deletion of admin data
   - SOC 2 Type II compliance for admin access

3. **Network Security**
   - Admin panel accessible only via HTTPS
   - IP whitelisting for admin access (optional)
   - VPN requirement for remote admin access
   - Admin-specific security headers

## Integration Points

### Admin-Specific Service Dependencies

1. **Admin Email Service (SMTP)**
   - Admin password reset notifications (super admin approval required)
   - Suspicious login alerts and security notifications
   - Admin account lockout notifications
   - New admin account creation notifications
   - **Dependency**: `/integrations/smtp-brevo.md`

2. **Admin Redis Cache**
   - Encrypted admin session storage
   - Admin-specific rate limiting counters
   - Admin token blacklisting and revocation
   - Failed login attempt tracking
   - **Dependency**: Backend infrastructure with encryption

3. **Admin Database**
   - Admin user account storage (separate from regular users)
   - Comprehensive admin audit logging
   - Admin permission and role management
   - Admin password history tracking
   - **Dependency**: `/backend/database.md`

4. **Admin Security Services**
   - IP geolocation service for login monitoring
   - Device fingerprinting service
   - Security event logging and alerting
   - **Dependency**: External security service integrations

5. **Admin Monitoring Integration**
   - Security Information and Event Management (SIEM)
   - Admin activity dashboards
   - Real-time security alerting
   - **Dependency**: Monitoring infrastructure

## Performance Considerations

### Admin-Optimized Performance Strategies

1. **Admin Database Optimization**
   - Dedicated admin database indexes (email, role, permissions)
   - Admin connection pool separation from regular users
   - Query optimization for complex permission checks
   - Audit log table partitioning by date

2. **Admin Caching Strategy**
   - Encrypted Redis session caching for admin sessions
   - Admin permission caching with immediate invalidation
   - Admin JWT token validation caching
   - Rate limiting counters in Redis with sliding windows

3. **Admin Security Performance**
   - Async password hashing with higher rounds (bcrypt 15)
   - Optimized permission checking with cached roles
   - Concurrent admin request handling with stricter limits
   - Background audit log processing

4. **Admin-Specific Optimizations**
   - Admin session preloading for frequent operations
   - Permission matrix caching for complex admin workflows
   - Lazy loading of admin dashboard components
   - Optimized admin audit trail queries

## Testing Strategy

### Admin Authentication Test Coverage Requirements

1. **Admin Unit Tests**
   - Admin password hashing/verification with enhanced security
   - Admin JWT token generation/validation with role claims
   - Admin permission validation logic
   - Admin session timeout handling
   - Admin rate limiting logic

2. **Admin Integration Tests**
   - Admin authentication API endpoints
   - Admin database operations with audit logging
   - Admin Redis session management with encryption
   - Admin permission checking across modules
   - Admin concurrent session limits

3. **Admin Security Tests**
   - Admin brute force protection (3 attempts vs 5 for regular users)
   - Admin token security validation with IP binding
   - Admin input sanitization and CSRF protection
   - Admin session hijacking prevention
   - Admin privilege escalation prevention
   - Admin SQL injection and XSS protection

4. **Admin E2E Tests**
   - Complete admin login flow with MFA (when implemented)
   - Admin logout and session cleanup
   - Admin password change workflow
   - Admin permission-based access control
   - Admin session timeout and renewal
   - Admin account lockout and recovery

5. **Admin Load Testing**
   - Concurrent admin login performance
   - Admin session storage scalability
   - Admin audit logging performance under load
   - Admin rate limiting effectiveness

## Monitoring & Analytics

### Admin Security Metrics

1. **Admin Authentication Metrics**
   - Admin login success/failure rates
   - Admin session duration analytics
   - Admin password change frequency
   - Admin account lockout incidents
   - Admin concurrent session usage

2. **Admin Security Metrics**
   - Failed admin login attempts by IP and timestamp
   - Suspicious admin activity patterns (unusual times, locations)
   - Admin token validation errors and revocations
   - Admin rate limiting triggers and violations
   - Admin permission escalation attempts
   - Admin session hijacking detection

3. **Admin Operational Metrics**
   - Admin response times for authentication operations
   - Admin session storage utilization
   - Admin audit log generation rates
   - Admin permission check performance
   - Admin dashboard load times

4. **Admin Compliance Metrics**
   - Admin access audit trail completeness
   - Admin password policy compliance rates
   - Admin session security score
   - SOC 2 compliance metrics for admin access

### Admin Alerting

1. **Security Alerts**
   - Multiple failed admin login attempts
   - Admin login from unusual locations
   - Admin account lockouts
   - Admin session anomalies
   - Admin permission violations

2. **Operational Alerts**
   - Admin authentication service downtime
   - Admin session storage issues
   - Admin audit logging failures
   - Admin performance degradation

## Related Components

This Admin Panel Authentication feature has dependencies on and relationships with:

- **Backend API**: `/backend/api.md` - Admin authentication endpoints
- **Admin Database**: `/backend/database.md` - Admin user and audit tables
- **Admin Security**: `/security.md` - Enhanced JWT, encryption, admin rate limiting
- **Admin Email Integration**: `/integrations/smtp-brevo.md` - Admin security notifications
- **Admin Dashboard**: `/frontend/adminpanel/dashboard.md` - Main admin interface
- **Admin User Management**: `/frontend/adminpanel/user_management.md` - Admin user administration
- **Admin Content Management**: `/frontend/adminpanel/content_management.md` - Content administration
- **Admin Business Management**: `/frontend/adminpanel/business_management.md` - Business administration
- **Admin System Settings**: `/frontend/adminpanel/system_settings.md` - System configuration
- **Admin Audit Logging**: `/backend/audit_logging.md` - Comprehensive admin activity tracking
- **Admin Monitoring**: `/monitoring/admin_monitoring.md` - Admin-specific monitoring and alerting