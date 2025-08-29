# Fixing "Booking failed: Failed to fetch" Error

## 🚨 Quick Fix: Start the Backend Server

The "Failed to fetch" error occurs because the frontend is trying to connect to the backend API at `http://localhost:8000`, but the backend server is not running.

### Step 1: Start the Backend Server

```bash
# Open a new terminal and navigate to the backend directory
cd /Users/ashant/voltaic-recharge-hub/backend

# Install Python dependencies (if not already installed)
pip install -r requirements.txt

# Start the FastAPI backend server
python main.py
```

**Expected output:**
```
Starting voltAIc Systems Booking Backend...
Database initialized successfully
Backend startup completed
INFO:     Started server process [12345]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

### Step 2: Verify Backend is Running

Open another terminal and test:
```bash
# Test health endpoint
curl http://localhost:8000/health

# Expected response:
{"status":"healthy","timestamp":"2024-01-15T10:00:00.000Z","version":"1.0.0","environment":"development"}
```

### Step 3: Test Frontend Connection

1. **Start your frontend development server:**
   ```bash
   cd /Users/ashant/voltaic-recharge-hub
   npm run dev
   # or
   yarn dev
   ```

2. **Open the website** and try to book a consultation

3. **The booking should now work** without the "Failed to fetch" error

## 🔧 Enhanced Frontend Features

### ✅ What's Been Fixed:

1. **CORS Headers Added** - All API calls now include proper CORS headers
2. **Backend Health Check** - Automatically checks if backend is running
3. **Better Error Messages** - Clearer error messages when backend is unavailable
4. **Enhanced Availability API** - Now uses Google Calendar integration
5. **4-Week Calendar Support** - New method to get multi-week availability

### 🆕 New Frontend Methods Available:

```typescript
import { bookingService } from '@/services/booking';

// Get 4-week availability for both consultants
const calendar = await bookingService.getCalendarAvailability(4);

// Get availability for specific consultant
const pascalCalendar = await bookingService.getCalendarAvailability(4, new Date(), 'pascal');

// Enhanced single-day availability (now with Google Calendar integration)
const availability = await bookingService.checkAvailability('pascal', new Date('2024-01-15'));
```

## 🐛 Troubleshooting Common Issues

### Issue 1: Backend Not Starting

**Error:** `ModuleNotFoundError: No module named 'fastapi'`

**Solution:**
```bash
cd backend
pip install -r requirements.txt
```

### Issue 2: Port 8000 Already in Use

**Error:** `OSError: [Errno 48] Address already in use`

**Solution:**
```bash
# Find what's using port 8000
lsof -i :8000

# Kill the process (replace PID with actual process ID)
kill -9 <PID>

# Or use a different port
uvicorn main:app --port 8001
```

Then update frontend API URL:
```typescript
// In src/services/booking.ts
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://voltAIc.systems' 
  : 'http://localhost:8001'; // Changed port
```

### Issue 3: CORS Errors

**Error:** `Access to fetch at 'http://localhost:8000' from origin 'http://localhost:3000' has been blocked by CORS policy`

**Solution:** The backend already includes CORS configuration, but if you see this error:

1. **Check backend logs** - CORS errors are logged
2. **Verify frontend origin** - Should be `http://localhost:3000` or `http://localhost:5173`
3. **Restart both servers** - Frontend and backend

### Issue 4: Google Calendar Not Configured

**Warning:** `Google Calendar not configured - assuming availability`

**This is normal for initial setup.** The system works without Google Calendar but won't have real calendar integration.

**To enable Google Calendar:**
1. Get Google Calendar API credentials
2. Set environment variables in backend/.env
3. Run authorization flow via `/api/v1/auth/google/url`

## 🎯 Testing the Enhanced Features

### 1. Test Backend API Directly:

```bash
# Test health
curl http://localhost:8000/health

# Test consultants list
curl http://localhost:8000/api/v1/bookings/consultants/list

# Test availability
curl "http://localhost:8000/api/v1/bookings/availability?consultant_id=pascal&date=2024-01-15"

# Test 4-week calendar
curl http://localhost:8000/api/v1/bookings/calendar?weeks=4
```

### 2. Test Frontend Booking Flow:

1. **Open website** → Navigate to booking section
2. **Select consultant** → Should load from backend API
3. **Select date** → Should show real availability
4. **Fill form** → Should submit to backend
5. **Get confirmation** → Should show booking reference

### 3. Expected Behavior:

- ✅ **No "Failed to fetch" errors**
- ✅ **Booking creates database record**
- ✅ **Email confirmations sent**
- ✅ **Calendar events created** (if Google Calendar configured)
- ✅ **Booking reference displayed**

## 🚀 Production Deployment Notes

### Environment Variables:
Create `/backend/.env`:
```bash
# Database
DATABASE_URL=sqlite:///./booking.db

# Google Calendar (Optional)
GOOGLE_CALENDAR_CLIENT_ID=your_client_id
GOOGLE_CALENDAR_CLIENT_SECRET=your_client_secret

# SMTP Email (Optional)
SMTP_USERNAME=your_smtp_user
SMTP_PASSWORD=your_smtp_password

# Production Settings
ENVIRONMENT=production
SECRET_KEY=your-secure-secret-key
```

### Frontend Build:
```bash
npm run build
# or
yarn build
```

### Backend Production:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000
```

## 📊 API Response Examples

### Successful Booking Response:
```json
{
  "success": true,
  "message": "Booking created successfully",
  "data": {
    "id": 1,
    "reference": "VLT-20240115-ABC123",
    "consultant": {
      "id": "pascal",
      "name": "Pascal Köth, Dipl. Ök.",
      "email": "pko@voltAIc.systems"
    },
    "status": "confirmed",
    "calendar_event_created": true,
    "email_sent": true
  }
}
```

### Error Response:
```json
{
  "success": false,
  "message": "Time slot is not available - consultant has a calendar conflict",
  "error_code": "HTTP_409"
}
```

## ✅ Summary

The frontend has been enhanced with:
- ✅ **CORS headers** for proper API communication
- ✅ **Backend health checking** to detect connection issues  
- ✅ **Enhanced availability checking** with Google Calendar integration
- ✅ **4-week calendar API** for multi-week planning
- ✅ **Better error handling** with descriptive messages
- ✅ **Conflict prevention** at the API level

**To fix the "Failed to fetch" error: Simply start the backend server with `python main.py` from the backend directory.**