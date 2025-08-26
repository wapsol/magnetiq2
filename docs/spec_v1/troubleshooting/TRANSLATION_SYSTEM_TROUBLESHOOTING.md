# Translation System Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Connection error" and "Retrieved content for page" error

**Symptoms:**
- Red "Connection error" indicator in the Multi-Language Content Editor
- Error message: "Retrieved content for page [page-name]"
- Unable to load or edit translations

**Root Cause:**
This is typically an authentication issue where the frontend cannot authenticate with the backend API.

**Diagnosis Steps:**

1. **Check if backend is running:**
   ```bash
   curl http://localhost:3000/health
   ```
   Should return: `{"status":"healthy",...}`

2. **Check authentication token:**
   - Open browser developer tools (F12)
   - Go to Application/Storage tab → Local Storage
   - Look for `admin_token` key
   - If missing or empty, this is the issue

3. **Test API directly:**
   ```bash
   # Without auth (should fail)
   curl http://localhost:3000/api/v1/admin/multi-language-content/pages/food-beverage
   # Result: {"success":false,"message":"Not authenticated","error_code":"HTTP_403"}
   
   # With auth (get token from login)
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/v1/admin/multi-language-content/pages/food-beverage
   # Should return content data
   ```

**Solutions:**

### Solution 1: Re-authenticate
1. Navigate to `/admin/login`
2. Log in with admin credentials
3. Return to the translation editor

### Solution 2: Clear browser storage
1. Open developer tools (F12)
2. Go to Application/Storage → Local Storage
3. Clear all entries for your localhost domain
4. Log in again

### Solution 3: Verify service configuration
1. **Frontend should be on:** http://localhost:8090
2. **Backend should be on:** http://localhost:3000
3. **CORS is configured** to allow cross-origin requests

## Service Status Check

### Check if services are running:
```bash
# Check backend (port 3000)
lsof -i :3000

# Check frontend (port 8090) 
lsof -i :8090

# Test connectivity
curl http://localhost:3000/health
```

### Start services:
```bash
# Start backend (from project root)
cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 3000 --reload

# Start frontend (from project root)
npm run dev
```

## Authentication Flow

1. User logs into `/admin/login`
2. Backend returns JWT token
3. Frontend stores token in `localStorage` as `admin_token`
4. All API requests include `Authorization: Bearer <token>` header
5. Backend validates token for protected endpoints

## Error Messages Explained

- **"Connection error"** → Cannot reach backend or authentication failed
- **"Authentication error"** → Invalid or expired token
- **"Retrieved content for page X"** → Specific page content couldn't be loaded (usually auth issue)
- **"Network error"** → Backend service not running or network connectivity issue

## Prevention

1. **Keep session active:** Tokens expire after 24 hours
2. **Don't clear browser storage** unless troubleshooting
3. **Ensure both services are running** before accessing admin panel
4. **Check browser console** for detailed error messages

## Advanced Debugging

1. **Enable detailed logging:**
   - Open browser developer tools
   - Check Console tab for authentication-related messages
   - Look for API request/response details

2. **Backend logs:**
   ```bash
   tail -f backend/logs/application.log
   ```

3. **Network tab analysis:**
   - Check if API requests are being made
   - Verify request headers include Authorization
   - Check response status codes

## Default Admin Credentials

For development/testing:
- **Email:** admin@voltaic.systems
- **Password:** admin123

**Note:** Change these credentials in production!