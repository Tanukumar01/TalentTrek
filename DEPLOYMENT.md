# TalentTrek - Vercel Deployment Guide

This guide will help you deploy both the frontend and backend of TalentTrek to Vercel.

## 📋 Prerequisites

- GitHub account with TalentTrek repository
- Vercel account (sign up at https://vercel.com)
- MongoDB Atlas database (for production)
- Cloudinary account (for file uploads)

---

## 🚀 Backend Deployment

### Step 1: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select the **`backend`** folder as the root directory
4. Framework Preset: **Other**
5. Click **Deploy**

### Step 2: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```env
# Database
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/talenttrek?retryWrites=true&w=majority

# JWT
JWT_SECRET=your_super_secret_jwt_key_here

# Server
PORT=5000
NODE_ENV=production

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Step 3: Get Your Backend URL

After deployment, you'll get a URL like:
```
https://talenttrek-api.vercel.app
```

**Save this URL** - you'll need it for the frontend!

---

## 🎨 Frontend Deployment

### Step 1: Update API URL

Before deploying frontend, update your API configuration:

**File:** `frontend/src/config/api.js` (or wherever you configure axios)

```javascript
const API_URL = import.meta.env.VITE_API_URL || 'https://talenttrek-api.vercel.app';

export default axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json'
  }
});
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository (same repo)
3. Select the **`frontend`** folder as the root directory
4. Framework Preset: **Vite**
5. Click **Deploy**

### Step 3: Configure Environment Variables

In Vercel Dashboard → Settings → Environment Variables, add:

```env
VITE_API_URL=https://talenttrek-api.vercel.app
```

### Step 4: Get Your Frontend URL

After deployment, you'll get a URL like:
```
https://talenttrek.vercel.app
```

---

## 🔧 Update CORS Settings

After deploying frontend, update backend CORS to allow your frontend domain:

**File:** `backend/server.js`

```javascript
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://talenttrek.vercel.app',  // Add your frontend URL
    'https://your-custom-domain.com'   // If you have a custom domain
  ],
  credentials: true
}));
```

**Commit and push** this change - Vercel will auto-deploy!

---

## 📝 Important Notes

### Backend Considerations:

1. **File Uploads**: Use Cloudinary (already configured) - Vercel doesn't support persistent file storage
2. **Serverless Functions**: Each API route runs as a serverless function
3. **Cold Starts**: First request might be slower (serverless nature)
4. **Timeouts**: Vercel has a 10-second timeout for serverless functions (Hobby plan)

### Frontend Considerations:

1. **Environment Variables**: Must start with `VITE_` to be exposed to the client
2. **SPA Routing**: Already configured in `vercel.json` for React Router
3. **Build Output**: Vite builds to `dist/` folder (already configured)

---

## 🔄 Automatic Deployments

Vercel automatically deploys when you push to GitHub:

- **Push to `main` branch** → Production deployment
- **Push to other branches** → Preview deployment
- **Pull requests** → Preview deployment with unique URL

---

## 🌐 Custom Domain (Optional)

### Add Custom Domain to Frontend:

1. Go to Vercel Dashboard → Your Frontend Project
2. Settings → Domains
3. Add your domain (e.g., `talenttrek.com`)
4. Follow DNS configuration instructions

### Add Custom Domain to Backend:

1. Go to Vercel Dashboard → Your Backend Project
2. Settings → Domains
3. Add your domain (e.g., `api.talenttrek.com`)
4. Update frontend `VITE_API_URL` to use new domain

---

## ✅ Deployment Checklist

### Before Deploying:

- [ ] MongoDB Atlas database created and accessible
- [ ] Cloudinary account set up
- [ ] All environment variables ready
- [ ] Code pushed to GitHub

### Backend Deployment:

- [ ] Backend deployed to Vercel
- [ ] Environment variables configured
- [ ] Backend URL noted
- [ ] Test API health endpoint: `https://your-backend.vercel.app/api/health`

### Frontend Deployment:

- [ ] API URL updated in frontend code
- [ ] Frontend deployed to Vercel
- [ ] Environment variables configured
- [ ] CORS updated in backend
- [ ] Test frontend application

### Post-Deployment:

- [ ] Test user registration
- [ ] Test user login
- [ ] Test job posting (recruiter)
- [ ] Test job application (job seeker)
- [ ] Test file uploads (profile picture, resume)
- [ ] Test job recommendations

---

## 🐛 Troubleshooting

### Backend Issues:

**Problem:** API returns 500 errors
- **Solution:** Check Vercel logs (Dashboard → Your Project → Deployments → Click deployment → View Function Logs)

**Problem:** Database connection fails
- **Solution:** Verify MongoDB Atlas allows connections from anywhere (0.0.0.0/0) or add Vercel IPs

**Problem:** File uploads fail
- **Solution:** Ensure Cloudinary credentials are correct in environment variables

### Frontend Issues:

**Problem:** API calls fail with CORS error
- **Solution:** Add frontend URL to backend CORS configuration

**Problem:** 404 on page refresh
- **Solution:** Verify `vercel.json` has correct rewrites configuration

**Problem:** Environment variables not working
- **Solution:** Ensure variables start with `VITE_` and redeploy

---

## 📊 Monitoring

### View Logs:

1. Go to Vercel Dashboard
2. Select your project
3. Click on a deployment
4. Click **View Function Logs**

### Analytics:

Vercel provides built-in analytics:
- Page views
- Performance metrics
- Error tracking

---

## 🎉 Success!

Your TalentTrek application should now be live!

**Frontend:** https://talenttrek.vercel.app  
**Backend API:** https://talenttrek-api.vercel.app

Share your live application with the world! 🚀

---

## 📞 Support

If you encounter issues:
1. Check Vercel documentation: https://vercel.com/docs
2. Review deployment logs
3. Verify environment variables
4. Test API endpoints individually

Good luck with your deployment! 🎊
