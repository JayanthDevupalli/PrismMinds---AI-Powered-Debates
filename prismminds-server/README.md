# PrismMinds Server

## 🔧 Gemini API Setup

### Current Status
⚠️ **The current Gemini API key is invalid or doesn't have access to Gemini models.**

The app will work with **mock debates** until you provide a valid API key.

### How to Get a Valid API Key

1. **Visit Google AI Studio**: https://makersuite.google.com/app/apikey
2. **Create a new API key** or use an existing one
3. **Make sure the key has access to Gemini API**
4. **Update the `.env` file**:
   ```
   GEMINI_API_KEY=your_new_api_key_here
   ```
5. **Restart the server**

### Testing Your API Key

Run this command to test if your API key works:
```bash
node test-gemini.js
```

You should see:
```
✅ gemini-1.5-flash-latest WORKS! Response: OK
```

### Mock Debate Mode

Until you provide a valid API key, the app will:
- ✅ Still work normally
- ✅ Generate realistic mock debates
- ⚠️ Use pre-written debate templates
- ⚠️ Not use actual AI generation

### Troubleshooting

**All models fail with 404 errors:**
- Your API key is invalid
- Your API key doesn't have Gemini API access
- There might be billing/quota issues

**Solution:**
1. Get a new API key from Google AI Studio
2. Make sure you enable Gemini API access
3. Check your Google Cloud billing settings

## Running the Server

```bash
npm install
npm start
```

Server will run on http://localhost:5000