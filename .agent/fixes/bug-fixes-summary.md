# TalentTrek - Bug Fixes & Setup Guide

## ✅ Fixed Issues

### 1. **Missing npm scripts in root directory**
   - **Problem**: Running `npm run dev` from root directory failed
   - **Fix**: Added the following scripts to root `package.json`:
     - `npm run dev` - Start both frontend and backend
     - `npm start` - Same as dev (alias)
     - `npm run frontend` - Start only frontend
     - `npm run backend` - Start only backend
     - `npm run start:all` - Start both (legacy)

### 2. **Frontend .env file created**
   - **Location**: `frontend/.env`
   - **Contents**:
     ```env
     VITE_API_BASE_URL=http://localhost:5000
     VITE_APP_ENV=development
     VITE_DEBUG=true
     ```
   - Also created `frontend/.env.example` as a template

### 3. **Backend .env file verified**
   - **Location**: `backend/.env`
   - Already exists with proper configuration:
     - MongoDB URI (Atlas connection)
     - JWT Secret
     - Cloudinary credentials
     - Port and environment settings

### 4. **Updated .gitignore files**
   - **Frontend**: Added `.env` to gitignore
   - **Backend**: Created `.gitignore` with `.env` exclusion

## 🚀 How to Run the Application

### Option 1: Run Everything (Recommended)
```bash
# From the root directory
npm run dev
```
This will start both backend (port 5000) and frontend (port 5173) concurrently.

### Option 2: Run Frontend Only
```bash
# From root directory
npm run frontend

# OR from frontend directory
cd frontend
npm run dev
```

### Option 3: Run Backend Only
```bash
# From root directory
npm run backend

# OR from backend directory
cd backend
npm start
```

## 📝 Environment Variables Summary

### Frontend (.env)
- `VITE_API_BASE_URL` - Backend API URL
- `VITE_APP_ENV` - Application environment
- `VITE_DEBUG` - Debug mode flag

### Backend (.env)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Node environment
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

## 🔧 Troubleshooting

### Login Failed Error
If you see "Login failed. Please try again" in the browser:
1. Ensure backend is running on port 5000
2. Check MongoDB connection is successful
3. Verify the API URL in frontend matches backend URL
4. Check browser console for CORS errors

### MongoDB Connection Issues
- Ensure MongoDB is running (if using local MongoDB)
- For Atlas: Check your IP is whitelisted
- Verify the MONGO_URI in backend/.env is correct

### Port Already in Use
If port 5000 or 5173 is already in use:
- Backend: Change `PORT` in `backend/.env`
- Frontend: Vite will automatically try the next available port

## 📂 Project Structure
```
TalentTrek/
├── frontend/
│   ├── .env (environment variables)
│   ├── .env.example (template)
│   ├── src/
│   └── package.json
├── backend/
│   ├── .env (environment variables)
│   ├── .gitignore
│   ├── server.js
│   └── package.json
└── package.json (root - with convenience scripts)
```

## ✨ Next Steps
1. Run `npm run dev` from the root directory
2. Frontend should open at http://localhost:5173
3. Backend API runs at http://localhost:5000
4. Test the login functionality
5. Check that both services are communicating properly
