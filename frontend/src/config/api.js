// API Configuration
// Use local server for development, remote server for production
export const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:5000' 
  : 'https://talenttrek-backend-89nq.onrender.com';

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/login`,
  SIGNUP: `${API_BASE_URL}/api/signup`,
  JOBS: `${API_BASE_URL}/api/jobs`,
  JOB_RECOMMENDATIONS: `${API_BASE_URL}/api/job-recommendations`,
  UPLOAD_RESUME: `${API_BASE_URL}/api/upload-resume`,
  SEED_JOBS: `${API_BASE_URL}/api/seed-jobs`,
  APPLY: `${API_BASE_URL}/api/apply`,
  MY_JOBS: `${API_BASE_URL}/api/my-jobs`,
};

export default API_BASE_URL; 