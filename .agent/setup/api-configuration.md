# API Configuration - Environment Variable Setup

## ✅ What Was Fixed

The `api.js` file was hardcoded with the deployed URL. Now it properly uses the `.env` file!

### Before (Hardcoded):
```javascript
export const API_BASE_URL = import.meta.env.DEV 
  ? 'https://talenttrek-api.vercel.app' 
  : 'https://talenttrek-api.vercel.app';
```

### After (Environment Variable):
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://talenttrek-api.vercel.app';
```

## 🎯 How It Works Now

1. **Reads from `.env` file first**
   - Uses `VITE_API_BASE_URL` from `frontend/.env`
   
2. **Fallback to deployed URL**
   - If `.env` is missing, defaults to `https://talenttrek-api.vercel.app`

## 🔧 How to Switch Between Backends

### Use Deployed Backend (Current Setup)
**File: `frontend/.env`**
```env
VITE_API_BASE_URL=https://talenttrek-api.vercel.app
```

### Use Local Backend
**File: `frontend/.env`**
```env
VITE_API_BASE_URL=http://localhost:5000
```

### Use Custom Backend
**File: `frontend/.env`**
```env
VITE_API_BASE_URL=https://your-custom-backend.com
```

## 🚀 Benefits

✅ **Flexible** - Easy to switch between local/deployed backend  
✅ **No code changes** - Just update `.env` file  
✅ **Team-friendly** - Each developer can use their own backend  
✅ **Safe fallback** - Always has a working default URL  
✅ **Git-safe** - `.env` is gitignored, so no conflicts  

## 📝 Important Notes

1. **Restart required**: After changing `.env`, restart the dev server:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

2. **Vite prefix**: Environment variables must start with `VITE_` to be accessible in the frontend

3. **No quotes needed**: In `.env` file, don't use quotes:
   ```env
   # ✅ Correct
   VITE_API_BASE_URL=https://talenttrek-api.vercel.app
   
   # ❌ Wrong
   VITE_API_BASE_URL="https://talenttrek-api.vercel.app"
   ```

## 🔍 Verify Configuration

To check which backend your app is using, open browser console and run:
```javascript
console.log(import.meta.env.VITE_API_BASE_URL);
```

Or check the Network tab in DevTools to see API request URLs.

## 📂 File Structure

```
frontend/
├── .env                    # Your environment config (gitignored)
├── .env.example           # Template for other developers
└── src/
    └── config/
        └── api.js         # Now reads from .env! ✅
```

## ✨ Summary

Your API configuration is now **fully flexible and environment-based**! 🎉

- Change backend URL in one place: `frontend/.env`
- No need to modify code
- Easy to switch between local/deployed/custom backends
