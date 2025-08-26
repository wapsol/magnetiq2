# Testing the Enhanced Frontend with Backend Integration

## 🚀 Quick Setup & Test

### Step 1: Start the Backend
```bash
cd backend
python main.py
```

**Expected output:**
```
Starting voltAIc Systems Booking Backend...
Database initialized successfully
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Step 2: Start the Frontend
```bash
# In a new terminal
npm run dev
# or
yarn dev
```

### Step 3: Test the Enhanced Features

1. **Navigate to booking section**
2. **Select consultant first** → Now required for time slot loading
3. **Select date** → Shows loading spinner while checking availability  
4. **See real-time availability** → Time slots now come from backend API
5. **Submit booking** → Should work without "Failed to fetch" error

## 🎯 What's Been Enhanced

### ✅ CalendarPicker Component (Updated)
- **Real-time availability checking** via backend API
- **Loading states** with spinners
- **Error handling** with user-friendly messages
- **Consultant-specific availability** - must select consultant first
- **Backend integration** - no more static time slots

### ✅ BookingService (Enhanced)
- **CORS headers** added to all requests
- **Backend health checking** before making booking requests
- **New 4-week calendar API** method added
- **Better error messages** for connection issues
- **Enhanced availability checking** with Google Calendar integration

### ✅ Error Prevention
- **Backend availability check** before booking submission
- **Clear error messages** when backend is unavailable
- **Graceful fallbacks** when API calls fail
- **User guidance** for setup issues

## 🔍 Testing Scenarios

### 1. Backend Running - Normal Flow
- ✅ **Consultant selection** → Loads from backend
- ✅ **Date selection** → Shows real availability 
- ✅ **Time slot loading** → Dynamic from Google Calendar
- ✅ **Booking submission** → Creates database record
- ✅ **Confirmation display** → Shows booking reference

### 2. Backend Not Running - Error Handling
- ❌ **Clear error message**: "Backend service is not running. Please start the backend server on port 8000."
- ❌ **No confusing errors** or crashes
- ❌ **Guidance provided** on how to fix

### 3. Backend Running but Google Calendar Not Configured
- ⚠️ **Fallback availability** → Shows standard working hours
- ⚠️ **Warning logged** → "Google Calendar not configured - assuming availability"
- ✅ **Booking still works** → Uses database-only checking

## 🎨 UI/UX Improvements

### Loading States
```
📅 Select Date → ⏳ Loading available times... → ✅ Available slots shown
```

### Error States
```
❌ No available time slots for Monday, Jan 15
   Please select a different date
```

### Guidance Messages
```
💡 Please select a consultant first to see available times
💡 Times shown are based on Pascal Köth's real availability
```

## 🧪 API Testing Commands

Test backend APIs directly:

```bash
# Health check
curl http://localhost:8000/health

# Consultants list
curl http://localhost:8000/api/v1/bookings/consultants/list

# Single day availability
curl "http://localhost:8000/api/v1/bookings/availability?consultant_id=pascal&date=2024-01-15"

# 4-week calendar
curl "http://localhost:8000/api/v1/bookings/calendar?weeks=4"

# Create booking (example)
curl -X POST http://localhost:8000/api/v1/bookings/ \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2024-01-15",
    "time_slot": {"start": "10:00", "end": "11:00"},
    "consultant_id": "pascal",
    "full_name": "Test User",
    "phone": "+1234567890",
    "email": "test@example.com",
    "captcha_verified": true,
    "language": "en"
  }'
```

## 🐛 Common Issues & Solutions

### Issue: "Failed to fetch"
**Cause:** Backend not running
**Solution:** `cd backend && python main.py`

### Issue: "Loading available times..." forever
**Cause:** CORS or network issue
**Solution:** Check browser console for errors, restart both servers

### Issue: "No available time slots"
**Cause:** Google Calendar shows consultant as busy
**Solution:** Normal behavior - consultant actually has no availability

### Issue: Booking submission fails with 409 error
**Cause:** Time slot conflict (someone else booked it, or calendar conflict)
**Solution:** Normal behavior - select different time slot

## 📊 Expected Behavior Changes

### Before (Static):
- Fixed time slots (9 AM - 5 PM always available)
- No real availability checking
- No calendar integration
- Generic error messages

### After (Dynamic):
- Real-time availability from Google Calendar
- Database conflict checking
- Consultant-specific time slots
- Clear, helpful error messages
- Loading states and user feedback

## ✅ Success Indicators

When working correctly, you should see:

1. **Consultant selection** loads dynamically from backend
2. **Time slots load** with spinner when date/consultant changes  
3. **Real availability** - some slots might be unavailable
4. **Clear feedback** - "Times shown are based on Pascal's real availability"
5. **Successful booking** - No "Failed to fetch" errors
6. **Booking reference** displayed after successful submission

## 🚀 Next Steps

Once this is working:
- [ ] Add 4-week calendar view component
- [ ] Enhance UI with consultant availability indicators
- [ ] Add real-time booking conflict warnings
- [ ] Implement booking management interface

The enhanced frontend now provides enterprise-grade booking with real calendar integration! 🎉