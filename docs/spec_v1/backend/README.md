# voltAIc Systems Booking Backend

A Python FastAPI backend for handling consultation booking requests with Google Calendar integration and SMTP email notifications.

## Features

- **Booking Management**: Create, update, and track consultation bookings
- **Google Calendar Integration**: Automatic calendar event creation with meeting invites
- **Email Notifications**: Multilingual customer confirmations and internal notifications
- **Database Security**: SQLite with file-level and application-level protection
- **API Documentation**: Interactive API docs with Swagger UI
- **Audit Logging**: Complete audit trail of all booking operations

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the backend directory:

```bash
# Database
DATABASE_URL=sqlite:///./booking.db

# Google Calendar (Optional - for calendar integration)
GOOGLE_CALENDAR_CLIENT_ID=your_google_client_id
GOOGLE_CALENDAR_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALENDAR_CREDENTIALS_FILE=./credentials/google_calendar.json
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:8000/api/v1/auth/google/callback

# SMTP Email Configuration (Optional - for email notifications)
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USERNAME=your_smtp_username
SMTP_PASSWORD=your_smtp_password
SMTP_FROM_EMAIL=noreply@voltaic.systems
SMTP_FROM_NAME=voltAIc Systems

# Business Configuration
BUSINESS_EMAIL_CRM=steam@voltaic.systems

# Application
ENVIRONMENT=development
HOST=0.0.0.0
PORT=8000
SECRET_KEY=your-secret-key-change-in-production
```

### 3. Run the Application

**Development Mode:**
```bash
python main.py
```

**Production Mode:**
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

### 4. Access the API

- **API Base URL**: http://localhost:8000
- **Interactive Docs**: http://localhost:8000/docs (development only)
- **Health Check**: http://localhost:8000/health

## API Endpoints

### Booking Management

- `POST /api/v1/bookings/` - Create new booking
- `GET /api/v1/bookings/` - List bookings with pagination
- `GET /api/v1/bookings/{reference}` - Get booking by reference
- `PUT /api/v1/bookings/{reference}` - Update booking
- `GET /api/v1/bookings/availability` - Check consultant availability

### Consultant Management

- `GET /api/v1/bookings/consultants/list` - List available consultants

### System

- `GET /health` - Basic health check
- `GET /health/detailed` - Detailed health check with service status

## Google Calendar Setup

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google Calendar API

### 2. Create OAuth 2.0 Credentials

1. Go to "Credentials" in Google Cloud Console
2. Create "OAuth 2.0 Client ID" for web application
3. Add redirect URI: `http://localhost:8000/api/v1/auth/google/callback`
4. Download credentials JSON (not needed, just note client ID and secret)

### 3. Authorization Flow

1. Get authorization URL:
   ```bash
   curl http://localhost:8000/api/v1/auth/google/url
   ```

2. Visit the URL and authorize the application

3. Exchange the authorization code:
   ```bash
   curl -X POST "http://localhost:8000/api/v1/auth/google/callback" \
        -H "Content-Type: application/json" \
        -d '{"auth_code": "your_auth_code_here"}'
   ```

## Database Management

### SQLite Security Features

- **File-level security**: Database file permissions set to 600 (owner read/write only)
- **Application-level security**: Input validation, parameterized queries, audit logging
- **Automated backups**: Regular database backups with optional GPG encryption

### Database Backup

Automated backup script is configured in the main application README.

### Manual Backup

```bash
# Simple backup
cp booking.db booking_backup_$(date +%Y%m%d_%H%M%S).db

# Encrypted backup (requires GPG key setup)
sqlite3 booking.db ".backup backup_$(date +%Y%m%d_%H%M%S).db" && \
gpg --encrypt -r your_key_id backup_*.db && \
rm backup_*.db
```

## Email Configuration

### Brevo (Sendinblue) Setup

1. Create account at [Brevo](https://www.brevo.com)
2. Get SMTP credentials from account settings
3. Use the credentials in `.env` file

### Email Templates

The backend includes multilingual email templates:
- **Customer confirmation**: Professional booking confirmation with calendar details
- **Internal notification**: Booking notification for consultants and CRM team
- **Languages**: English and German support

## Development

### Project Structure

```
backend/
├── main.py              # FastAPI application entry point
├── config.py            # Application configuration
├── database.py          # Database setup and connection
├── requirements.txt     # Python dependencies
├── models/              # Database models
│   └── booking.py       # Booking and audit log models
├── schemas/             # Pydantic schemas for API validation
│   └── booking.py       # Request/response schemas
├── services/            # Business logic services
│   ├── calendar_service.py  # Google Calendar integration
│   └── email_service.py     # SMTP email service
└── routers/             # API route handlers
    └── booking.py       # Booking API endpoints
```

### Running Tests

```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run tests
pytest
```

### Code Style

```bash
# Install development dependencies
pip install black isort flake8

# Format code
black .
isort .

# Lint code
flake8 .
```

## Production Deployment

### Environment Variables

Set `ENVIRONMENT=production` and configure:
- Strong secret key
- Production database URL
- SMTP credentials
- Google Calendar credentials
- Trusted hosts for security

### Security Checklist

- [ ] Change default secret key
- [ ] Set up HTTPS/TLS termination
- [ ] Configure firewall rules
- [ ] Set up database backups
- [ ] Configure log rotation
- [ ] Set up monitoring and alerting

### Docker Deployment

```dockerfile
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```


## Monitoring

### Health Checks

- Basic: `GET /health`
- Detailed: `GET /health/detailed` (includes service status)

### Logs

Application logs are written to:
- Console (development)
- `backend.log` file (production)

Log levels: INFO, WARNING, ERROR with structured formatting.

## Support

For technical support or questions:
- Email: steam@voltaic.systems
- Documentation: This README and API docs at `/docs`

## License

Proprietary - voltAIc Systems