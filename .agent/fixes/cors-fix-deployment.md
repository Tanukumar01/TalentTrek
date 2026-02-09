# CORS Error Fix - Deployment Guide

## 🔴 Problem
You're getting CORS errors when your local frontend tries to connect to the deployed backend on Vercel.

## ✅ Solution Applied

### 1. Fixed `backend/vercel.json`
**Problem**: Had conflicting CORS headers (`Access-Control-Allow-Credentials: true` with `Access-Control-Allow-Origin: *`)

**Fix**: Removed the credentials header from vercel.json, letting server.js handle CORS properly.

### 2. Updated `backend/server.js`
**Problem**: CORS was only allowing specific localhost origins, which doesn't work in production.

**Fix**: Updated CORS configuration to:
- **Production**: Allow all origins (`origin: true`)
- **Development**: Allow specific localhost origins

```javascript
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? true // Allow all origins in production
    : ['http://localhost:3000', 'http://localhost:5173', ...],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', ...]
};
```

## 🚀 Deploy to Vercel

You need to push these changes to Vercel for the CORS fix to work:

### Option 1: Using Git (Recommended)

```bash
# Navigate to backend directory
cd backend

# Check git status
git status

# Add the changes
git add vercel.json server.js

# Commit the changes
git commit -m "Fix CORS configuration for production"

# Push to your repository
git push origin main
```

Vercel will automatically deploy the changes.

### Option 2: Using Vercel CLI

```bash
# Install Vercel CLI if you haven't
npm i -g vercel

# Navigate to backend directory
cd backend

# Deploy
vercel --prod
```

### Option 3: Manual Deployment via Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Find your `talenttrek-api` project
3. Go to Settings → Git
4. Trigger a new deployment or push your changes to GitHub

## 🧪 Test After Deployment

### 1. Check Backend Health
Visit: https://talenttrek-api.vercel.app/api/health

Should return:
```json
{
  "success": true,
  "message": "TalentTrek API is running",
  "timestamp": "...",
  "environment": "production"
}
```

### 2. Test CORS Headers
Open browser console and run:
```javascript
fetch('https://talenttrek-api.vercel.app/api/health')
  .then(r => r.json())
  .then(console.log)
```

Should work without CORS errors.

### 3. Test Your Frontend
```bash
npm run dev
```

Try logging in or making any API call. CORS errors should be gone! ✅

## 📝 What Changed

### Before:
- ❌ CORS only allowed specific localhost origins
- ❌ Conflicting credentials + wildcard origin
- ❌ Frontend couldn't connect to deployed backend

### After:
- ✅ Production allows all origins
- ✅ Development allows specific localhost origins
- ✅ No conflicting CORS headers
- ✅ Frontend can connect to deployed backend

## 🔍 Verify Deployment

After deploying, check the Vercel deployment logs:
1. Go to Vercel Dashboard
2. Click on your deployment
3. Check the "Functions" tab
4. Look for any errors

## ⚠️ Important Notes

1. **Environment Variable**: Make sure `NODE_ENV=production` is set in Vercel environment variables
   - Go to Vercel Dashboard → Settings → Environment Variables
   - Should already be set by default

2. **Redeploy if needed**: If CORS errors persist after deployment:
   ```bash
   # Force redeploy
   vercel --prod --force
   ```

3. **Cache**: Clear browser cache or use incognito mode to test

## 🎯 Summary

**Files Changed:**
- ✅ `backend/vercel.json` - Removed conflicting CORS header
- ✅ `backend/server.js` - Updated CORS to allow all origins in production

**Next Steps:**
1. Commit and push changes to GitHub
2. Wait for Vercel to auto-deploy (or deploy manually)
3. Test your frontend - CORS errors should be gone!

**Your CORS issue will be fixed once you deploy these changes to Vercel! 🎉**
