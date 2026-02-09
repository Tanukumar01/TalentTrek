# TalentTrek - Using Deployed Backend

## 🌐 Configuration

Your frontend is now configured to use the **deployed backend** on Vercel instead of running a local backend server.

### Current Setup:
- **Frontend**: Runs locally on http://localhost:5173
- **Backend**: Uses deployed API at https://talenttrek-api.vercel.app

## 🚀 How to Run

### Quick Start (Frontend Only)
```bash
npm run dev
```
This will start only the frontend, which connects to your deployed backend.

### Alternative Commands

```bash
# Frontend only (same as npm run dev)
npm run frontend

# Backend only (if you need to test locally)
npm run backend

# Both frontend AND backend locally
npm run dev:all
# or
npm run start:all
```

## 📝 Environment Configuration

### Frontend (.env)
```env
VITE_API_BASE_URL=https://talenttrek-api.vercel.app
VITE_APP_ENV=production
VITE_DEBUG=false
```

**To switch back to local backend:**
```env
VITE_API_BASE_URL=http://localhost:5000
VITE_APP_ENV=development
VITE_DEBUG=true
```

## ✅ Benefits of Using Deployed Backend

1. **No local backend needed** - Just run the frontend
2. **Faster startup** - Only one service to start
3. **Production data** - Access real production database
4. **Same as production** - Test against actual deployed API
5. **Team collaboration** - Everyone uses the same backend

## 🔧 Troubleshooting

### CORS Errors
If you see CORS errors, ensure your deployed backend allows `localhost:5173` in CORS settings.

Check `backend/server.js`:
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
```

### API Not Responding
1. Check if the deployed backend is online: https://talenttrek-api.vercel.app/api/health
2. Verify the URL in `frontend/.env` is correct
3. Check browser console for network errors

### Need to Test Backend Changes Locally
If you're making backend changes and need to test them:
```bash
# Run both locally
npm run dev:all
```

Then temporarily change `frontend/.env`:
```env
VITE_API_BASE_URL=http://localhost:5000
```

## 📊 Quick Reference

| Command | What it does |
|---------|-------------|
| `npm run dev` | Frontend only (uses deployed backend) |
| `npm run frontend` | Frontend only (uses deployed backend) |
| `npm run backend` | Backend only (local) |
| `npm run dev:all` | Both frontend + backend locally |
| `npm run start:all` | Both frontend + backend locally |

## 🎯 Current Status

✅ Frontend `.env` configured for deployed backend  
✅ Root `package.json` updated with new scripts  
✅ Ready to run with `npm run dev`  

**You're all set! Just run `npm run dev` and start developing! 🚀**
