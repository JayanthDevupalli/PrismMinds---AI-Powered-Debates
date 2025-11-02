# 🔧 PrismMinds API Troubleshooting Guide

## Issues Fixed

### 1. ✅ Environment Variable Issue
**Problem:** GEMINI_API_KEY had extra quotes and spaces
**Fixed:** Removed quotes from `.env` file

### 2. ✅ CORS Configuration
**Problem:** Missing proper CORS headers for preflight requests
**Fixed:** Enhanced CORS configuration with credentials and proper headers

### 3. ✅ API Data Structure Mismatch
**Problem:** Dashboard was sending string duration, API expected number
**Fixed:** Convert duration to number before sending

### 4. ✅ Error Handling
**Problem:** Poor error messages and no logging
**Fixed:** Added comprehensive logging and better error messages

## How to Test the Fix

### Step 1: Start the Server
```powershell
cd prismminds-server
npm start
```

You should see:
```
✅ Server running on port 5000
```

### Step 2: Start the Client
```powershell
cd prismmindsclient
npm run dev
```

You should see:
```
✓ Ready in X ms
```

### Step 3: Test Server Health
Open browser console and run:
```javascript
fetch('http://localhost:5000/api/health')
  .then(r => r.json())
  .then(console.log)
```

Expected output:
```json
{
  "status": "ok",
  "timestamp": "2025-01-XX...",
  "env": {
    "hasGeminiKey": true,
    "nodeEnv": "development"
  }
}
```

### Step 4: Test Database Connection
```javascript
fetch('http://localhost:5000/api/test/test-db')
  .then(r => r.json())
  .then(console.log)
```

### Step 5: Test Authenticated Endpoint
1. Log in to the app
2. Open browser console
3. Check for logs like:
   - `✅ Got auth token for user: xxx`
   - `🔍 Fetching recent debates from: ...`
   - `✅ Fetched debates: ...`

## Common Issues & Solutions

### Issue: "No token provided" (401)
**Cause:** User not logged in or token not being sent
**Solution:** 
- Ensure user is logged in
- Check browser console for auth errors
- Try logging out and back in

### Issue: "Invalid or expired token" (403)
**Cause:** Firebase token expired or invalid
**Solution:**
- The API now forces token refresh
- Log out and log back in
- Check Firebase console for auth issues

### Issue: "Failed to fetch debates"
**Cause:** Server not running or CORS issue
**Solution:**
- Ensure server is running on port 5000
- Check server console for errors
- Verify CORS settings allow localhost:3000

### Issue: "Failed to create debate" (500 error)
**Cause:** Invalid or missing GEMINI_API_KEY
**Solution:**
- **CURRENT STATUS**: Your API key is invalid/doesn't work with Gemini models
- **TEMPORARY FIX**: App now uses mock debates automatically
- **PERMANENT FIX**: Get a new API key from https://makersuite.google.com/app/apikey
- Update `.env` file: `GEMINI_API_KEY=your_new_key` (no quotes)
- Test with: `cd prismminds-server ; node test-gemini.js`
- Restart server after updating

**Mock Debate Mode:**
- ✅ App works normally
- ✅ Creates realistic debates
- ⚠️ Uses pre-written templates (not AI-generated)

## Debugging Tips

### Enable Detailed Logging
All API calls now log to browser console:
- 🔍 = Request being made
- ✅ = Success
- ❌ = Error

### Check Server Logs
Server now logs all requests:
```
2025-01-XX... - POST /api/debate/create
```

### Verify Firebase Auth
In browser console:
```javascript
import { getAuth } from 'firebase/auth';
const auth = getAuth();
console.log('Current user:', auth.currentUser);
```

### Test API Directly
Use browser console or Postman:
```javascript
// Get your token
const auth = getAuth();
const token = await auth.currentUser.getIdToken();

// Test create debate
fetch('http://localhost:5000/api/debate/create', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    topic: "Test Topic",
    personaA: "Pro",
    personaB: "Con",
    duration: 5
  })
}).then(r => r.json()).then(console.log);
```

## Environment Checklist

- [ ] Node.js installed (v18+)
- [ ] Both servers running (client on 3000, server on 5000)
- [ ] `.env` file has GEMINI_API_KEY without quotes
- [ ] Firebase config correct in both client and server
- [ ] `serviceAccountKey.json` present in server/config
- [ ] User logged in before making API calls
- [ ] No firewall blocking localhost:5000

## Next Steps

If issues persist:
1. Check browser Network tab for failed requests
2. Check server console for error stack traces
3. Verify Firebase project settings
4. Test with a fresh login
5. Clear browser cache and cookies