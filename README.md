# TalentTrek - Job Recommendation System

A full-stack job platform with AI-powered job recommendations based on resume uploads.

## Features

### 🎯 Job Recommendations
- **Resume Upload**: Upload PDF, DOC, or DOCX resumes
- **Skill Extraction**: Automatically extract skills from resume content
- **Smart Matching**: AI-powered job matching based on skills and requirements
- **Match Scoring**: Percentage-based match scores for each job recommendation
- **Personalized Results**: Tailored job suggestions based on your profile

### 👤 User Management
- **Authentication**: Secure login/signup with JWT tokens
- **Role-based Access**: Separate interfaces for job seekers and recruiters
- **Profile Management**: Comprehensive user profiles with skills and experience

### 💼 Job Management
- **Job Posting**: Recruiters can post new job opportunities
- **Job Browsing**: Browse all available jobs
- **Skill-based Matching**: Jobs are tagged with required skills for better matching

## Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Frontend
- **React** with Vite
- **React Router** for navigation
- **React Icons** for UI icons
- **React Hot Toast** for notifications
- **Tailwind CSS** for styling

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)

### Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
MONGO_URI=mongodb://localhost:27017/talenttrek
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
```

### Frontend Setup
```bash
cd landing-page
npm install
```

## Running the Application

### 1. Start MongoDB
Make sure MongoDB is running on your system or use MongoDB Atlas.

### 2. Start Backend Server
```bash
cd backend
npm start
```
Server will run on `http://localhost:5000`

### 3. Start Frontend Development Server
```bash
cd landing-page
npm run dev
```
Frontend will run on `http://localhost:5173`

## How to Use Job Recommendations

### For Job Seekers

1. **Sign Up/Login**: Create an account or log in to your existing account
2. **Upload Resume**: 
   - Go to "Job Recommendations" from the navbar dropdown
   - Click "Choose Resume" to upload your PDF, DOC, or DOCX file
   - The system will automatically extract skills from your resume
3. **View Recommendations**: 
   - See personalized job matches with match percentages
   - View required skills for each job
   - Skills that match your resume are highlighted in green
4. **Apply or Save**: Click "Apply Now" or "Save Job" for jobs you're interested in

### For Recruiters

1. **Post Jobs**:
   - Sign up as a "recruiter" role
   - Go to "Post a Job" from the navbar
   - Fill in job details including requirements
   - The system automatically extracts skills from your job description
2. **Manage Jobs**: View and manage posted jobs

## API Endpoints

### Authentication
- `POST /api/signup` - User registration
- `POST /api/login` - User login

### Resume Management
- `POST /api/upload-resume` - Upload and parse resume
- `GET /api/job-recommendations` - Get personalized job recommendations

### Job Management
- `POST /api/jobs` - Post a new job (recruiters only)
- `GET /api/jobs` - Get all jobs
- `POST /api/seed-jobs` - Seed sample jobs (for testing)

## Job Recommendation Algorithm

The system uses a skill-based matching algorithm:

1. **Resume Parsing**: Extracts skills from uploaded resume
2. **Job Skill Extraction**: Identifies required skills from job descriptions
3. **Match Calculation**: 
   - Compares user skills with job requirements
   - Calculates match percentage based on skill overlap
   - Returns jobs sorted by match score
4. **Filtering**: Only shows jobs with at least 10% match

### Match Score Formula
```
Match Score = (Matching Skills) / (Max of User Skills or Job Skills)
Match Percentage = Match Score × 100
```

## Sample Data

To test the system with sample jobs, you can seed the database:

1. Open browser console on the frontend
2. Run the seed function:
```javascript
const seedJobs = async () => {
  const response = await fetch('http://localhost:5000/api/seed-jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const data = await response.json();
  console.log('Seed result:', data);
};
seedJobs();
```

This will create 6 sample jobs with different skill requirements.

## File Structure

```
TalentTrek/
├── backend/
│   ├── server.js          # Main server file
│   ├── middleware/
│   │   └── auth.js        # JWT authentication middleware
│   ├── uploads/           # Resume upload directory
│   └── package.json
├── landing-page/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── jobs/
│   │   │   │   ├── JobRecommendations.jsx    # Job recommendations page
│   │   │   │   ├── JobRecommendations.css
│   │   │   │   ├── PostJob.jsx               # Job posting page
│   │   │   │   └── PostJob.css
│   │   │   └── ...
│   │   ├── components/
│   │   ├── context/
│   │   └── ...
│   └── package.json
└── README.md
```

## Future Enhancements

- **Advanced Resume Parsing**: Integration with professional resume parsing APIs
- **Machine Learning**: More sophisticated matching algorithms
- **Job Alerts**: Email notifications for new matching jobs
- **Application Tracking**: Track job applications and status
- **Company Profiles**: Detailed company information and reviews
- **Interview Scheduling**: Built-in interview scheduling system

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License. 