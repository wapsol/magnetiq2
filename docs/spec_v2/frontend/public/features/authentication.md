# Magnetiq v2 - User Authentication Feature Specification

## Overview

The User Authentication feature provides secure user registration, login, password management, and session handling for the Magnetiq v2 platform. This feature serves as the foundation for all user-specific functionality and access control throughout the system.

**Business Value**: Enables secure user access management, protects sensitive data, and provides the foundation for personalized user experiences and role-based access control.

## Core Entities

### User Authentication Data Models

```typescript
// Frontend TypeScript Interfaces
interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'admin' | 'editor' | 'viewer';
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  emailVerified: boolean;
}

interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  termsAccepted: boolean;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
}

interface AuthState {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
```

### Backend Data Models

```python
# Python Pydantic Models (backend/schemas)
from pydantic import BaseModel, EmailStr, validator
from typing import Optional
from datetime import datetime

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    first_name: str
    last_name: str
    terms_accepted: bool
    
    @validator('password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: Optional[bool] = False

class UserResponse(BaseModel):
    id: str
    email: str
    first_name: str
    last_name: str
    role: str
    is_active: bool
    last_login_at: Optional[datetime]
    created_at: datetime
    email_verified: bool

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
```

## User Workflows

### 1. User Registration Flow

1. **User Access**: User navigates to registration page
2. **Form Validation**: Client-side validation for email format, password strength
3. **Registration Request**: Submit registration data to backend API
4. **Server Validation**: Backend validates data and checks for existing users
5. **Account Creation**: Create new user account with hashed password
6. **Email Verification**: Send verification email to user
7. **Account Activation**: User clicks verification link to activate account
8. **Login Redirect**: Redirect to login page with success message

### 2. User Login Flow

1. **Login Form**: User enters email and password
2. **Credential Validation**: Backend verifies credentials against stored hash
3. **Token Generation**: Create JWT access and refresh tokens
4. **Session Creation**: Store session information in Redis
5. **Client Storage**: Store tokens in secure HTTP-only cookies
6. **Dashboard Redirect**: Redirect authenticated user to appropriate dashboard

### 3. Password Reset Flow

1. **Reset Request**: User requests password reset via email
2. **Token Generation**: Create secure password reset token
3. **Email Notification**: Send reset link to user's email
4. **Reset Form**: User clicks link and enters new password
5. **Password Update**: Update password hash in database
6. **Session Invalidation**: Invalidate all existing user sessions
7. **Login Required**: Redirect to login page

## API Endpoints

### Authentication Endpoints

```python
# POST /api/v1/auth/register
@router.post("/register", response_model=UserResponse)
async def register_user(
    user_data: UserCreate,
    db: Session = Depends(get_db)
) -> UserResponse:
    """Register new user account"""
    pass

# POST /api/v1/auth/login
@router.post("/login", response_model=TokenResponse)
async def login_user(
    credentials: UserLogin,
    db: Session = Depends(get_db)
) -> TokenResponse:
    """Authenticate user and return tokens"""
    pass

# POST /api/v1/auth/refresh
@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str = Cookie(None),
    db: Session = Depends(get_db)
) -> TokenResponse:
    """Refresh access token using refresh token"""
    pass

# POST /api/v1/auth/logout
@router.post("/logout")
async def logout_user(
    current_user: AuthUser = Depends(get_current_user)
) -> dict:
    """Logout user and invalidate tokens"""
    pass

# POST /api/v1/auth/forgot-password
@router.post("/forgot-password")
async def forgot_password(
    email: EmailStr,
    db: Session = Depends(get_db)
) -> dict:
    """Request password reset"""
    pass

# POST /api/v1/auth/reset-password
@router.post("/reset-password")
async def reset_password(
    token: str,
    new_password: str,
    db: Session = Depends(get_db)
) -> dict:
    """Reset password with token"""
    pass
```

## Frontend Components

### React Component Structure

```typescript
// Authentication Components
components/
├── auth/
│   ├── LoginForm.tsx           # Login form component
│   ├── RegisterForm.tsx        # Registration form component
│   ├── ForgotPasswordForm.tsx  # Password reset form
│   ├── ResetPasswordForm.tsx   # New password form
│   ├── EmailVerification.tsx   # Email verification handler
│   └── AuthGuard.tsx          # Route protection wrapper

// Authentication Pages
pages/
├── auth/
│   ├── LoginPage.tsx          # Login page layout
│   ├── RegisterPage.tsx       # Registration page layout
│   ├── ForgotPasswordPage.tsx # Password reset page
│   └── VerifyEmailPage.tsx    # Email verification page

// Authentication Services
services/
├── authService.ts             # API calls for authentication
├── tokenService.ts            # Token management utilities
└── authStorage.ts             # Secure token storage
```

### State Management (Redux)

```typescript
// Redux Store Structure
interface RootState {
  auth: AuthState;
}

// Auth Slice Actions
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    tokens: null,
    isAuthenticated: false,
    isLoading: false,
    error: null
  },
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.tokens = action.payload.tokens;
      state.isAuthenticated = true;
      state.isLoading = false;
    },
    loginFailure: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logout: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;
    }
  }
});

// RTK Query API
const authApi = createApi({
  reducerPath: 'authApi',
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    login: builder.mutation<TokenResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials
      })
    }),
    register: builder.mutation<UserResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData
      })
    })
  })
});
```

## Business Logic

### Authentication Service

```python
# Backend Authentication Service
class AuthenticationService:
    def __init__(self, db: Session, redis_client):
        self.db = db
        self.redis = redis_client
        self.password_service = PasswordService()
        self.jwt_service = JWTService()
    
    async def register_user(self, user_data: UserCreate) -> User:
        """Register new user with email verification"""
        # Check if user exists
        existing_user = await self.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(400, "User already exists")
        
        # Hash password
        hashed_password = self.password_service.hash_password(user_data.password)
        
        # Create user
        user = User(
            email=user_data.email,
            hashed_password=hashed_password,
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            role='viewer',  # Default role
            is_active=False,  # Require email verification
            email_verified=False
        )
        
        self.db.add(user)
        await self.db.commit()
        
        # Send verification email
        await self.send_verification_email(user)
        
        return user
    
    async def authenticate_user(self, credentials: UserLogin) -> tuple[User, AuthTokens]:
        """Authenticate user and return tokens"""
        # Get user
        user = await self.get_user_by_email(credentials.email)
        if not user:
            raise HTTPException(401, "Invalid credentials")
        
        # Verify password
        if not self.password_service.verify_password(
            credentials.password, 
            user.hashed_password
        ):
            raise HTTPException(401, "Invalid credentials")
        
        # Check if account is active
        if not user.is_active:
            raise HTTPException(401, "Account not activated")
        
        # Generate tokens
        tokens = await self.jwt_service.create_token_pair(user)
        
        # Update last login
        user.last_login_at = datetime.utcnow()
        await self.db.commit()
        
        return user, tokens
```

## Security Requirements

### Authentication Security

1. **Password Security**
   - Minimum 8 characters with complexity requirements
   - Bcrypt hashing with salt rounds = 12
   - Password history to prevent reuse

2. **Token Security**
   - JWT with RS256 algorithm
   - 15-minute access token lifetime
   - 7-day refresh token lifetime
   - Secure HTTP-only cookies for token storage

3. **Session Security**
   - Redis-based session storage
   - Automatic session cleanup
   - Concurrent session limits

4. **Rate Limiting**
   - Login attempts: 5 per minute per IP
   - Registration: 3 per minute per IP
   - Password reset: 1 per 5 minutes per email

### Data Protection

1. **Input Validation**
   - Email format validation
   - Password strength validation
   - SQL injection prevention
   - XSS protection

2. **Privacy Protection**
   - No sensitive data in logs
   - GDPR compliance for user data
   - Secure password reset tokens

## Integration Points

### External Service Dependencies

1. **Email Service (SMTP)**
   - Account verification emails
   - Password reset notifications
   - Login alerts
   - **Dependency**: `/integrations/smtp-brevo.md`

2. **Redis Cache**
   - Session storage
   - Rate limiting counters
   - Token blacklisting
   - **Dependency**: Backend infrastructure

3. **Database**
   - User account storage
   - Audit logging
   - **Dependency**: `/backend/database.md`

## Performance Considerations

### Optimization Strategies

1. **Database Optimization**
   - Indexed email lookups
   - Connection pooling
   - Query optimization

2. **Caching Strategy**
   - Redis session caching
   - JWT token validation caching
   - Rate limiting in Redis

3. **Security Performance**
   - Async password hashing
   - Token verification optimization
   - Concurrent request handling

## Testing Strategy

### Test Coverage Requirements

1. **Unit Tests**
   - Password hashing/verification
   - JWT token generation/validation
   - Input validation logic

2. **Integration Tests**
   - Authentication API endpoints
   - Database operations
   - Redis session management

3. **Security Tests**
   - Brute force protection
   - Token security validation
   - Input sanitization

4. **E2E Tests**
   - Complete registration flow
   - Login/logout workflows
   - Password reset process

## Monitoring & Analytics

### Key Metrics

1. **Authentication Metrics**
   - Login success/failure rates
   - Registration completion rates
   - Password reset requests
   - Session duration analytics

2. **Security Metrics**
   - Failed login attempts
   - Suspicious activity patterns
   - Token validation errors
   - Rate limiting triggers

## Related Components

This User Authentication feature has dependencies on and relationships with:

- **Backend API**: `/backend/api.md` - Authentication endpoints
- **Database**: `/backend/database.md` - User and session tables
- **Security**: `/security.md` - JWT, encryption, rate limiting
- **Email Integration**: `/integrations/smtp-brevo.md` - Verification emails
- **Admin Panel**: `/frontend/adminpanel/admin.md` - User management
- **All Feature Modules**: Authentication required for protected features