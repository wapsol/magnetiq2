# Backend Configuration Guide

## Environment Setup

The backend uses environment variables for configuration. Copy the example file and customize:

```bash
cd backend
cp .env.example .env
```

## Required Configuration

### Database
```bash
DATABASE_URL=sqlite:///./data/booking.db
```

## Optional Services

The application will work without these services, but with limited functionality:

### Google Calendar Integration (Optional)
If not configured, bookings will be created without calendar events.

```bash
GOOGLE_CALENDAR_CLIENT_ID=your-google-client-id
GOOGLE_CALENDAR_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALENDAR_REDIRECT_URI=http://localhost:8000/auth/google/callback
GOOGLE_CALENDAR_CREDENTIALS_FILE=./data/google_credentials.json
```

**Setup Steps:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add redirect URI: `http://localhost:8000/auth/google/callback`
6. Copy Client ID and Secret to your `.env` file

### Email Notifications (Optional)
If not configured, booking confirmations will not be sent via email.

```bash
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password
SMTP_FROM_EMAIL=noreply@voltaic.systems
SMTP_FROM_NAME=voltAIc Systems
```

**Brevo (Sendinblue) Setup:**
1. Sign up at [Brevo](https://www.brevo.com)
2. Go to SMTP & API settings
3. Create SMTP credentials
4. Use the provided username and password in your `.env`

## Configuration Validation

On startup, the application will:
- ✅ **Log INFO** messages about which services are configured
- ⚠️ **Log WARNINGS** for missing optional services
- 🔧 **Provide setup instructions** in the logs

## Graceful Degradation

The application handles missing configuration gracefully:

- **No Google Calendar**: Bookings work, but no calendar events created
- **No SMTP Email**: Bookings work, but no email confirmations sent
- **Both Missing**: Core booking functionality still works

## Troubleshooting

### Google Calendar Issues
```
2025-07-21 18:15:32,380 - services.calendar_service - WARNING - Google Calendar not configured or credentials invalid
```
**Fix**: Set `GOOGLE_CALENDAR_CLIENT_ID` and `GOOGLE_CALENDAR_CLIENT_SECRET` in `.env`

### Email Issues
```
2025-07-21 18:15:32,384 - services.email_service - ERROR - SMTP credentials not configured
```
**Fix**: Set `SMTP_USERNAME` and `SMTP_PASSWORD` in `.env`

## Production Considerations

- Use strong `SECRET_KEY`
- Set `ENVIRONMENT=production`
- Configure proper email service (not development SMTP)
- Use environment-specific Google OAuth redirect URIs
- Enable SSL/TLS for database connections if using external DB