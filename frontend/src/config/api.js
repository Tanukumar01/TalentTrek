// API Configuration
// In development: use empty string for Vite proxy (avoids CORS)
// In production: use full Vercel URL
const isDevelopment = import.meta.env.DEV;
export const API_BASE_URL = isDevelopment 
  ? '' // Empty string uses Vite proxy in development
  : (import.meta.env.VITE_API_BASE_URL || 'https://talenttrek-api.vercel.app');

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  LOGIN: `${API_BASE_URL}/api/login`,
  SIGNUP: `${API_BASE_URL}/api/signup`,
  PROTECTED: `${API_BASE_URL}/api/protected`,
  
  // Jobs
  JOBS: `${API_BASE_URL}/api/jobs`,
  POST_JOB: `${API_BASE_URL}/api/jobs`,
  SEED_JOBS: `${API_BASE_URL}/api/jobs/seed`,
  MY_JOBS: `${API_BASE_URL}/api/jobs/my/jobs`,
  JOB_APPLICATIONS: (jobId) => `${API_BASE_URL}/api/jobs/${jobId}/applications`,
  
  // File Uploads
  UPLOAD_LOGO: `${API_BASE_URL}/api/upload-logo`,
  UPLOAD_RESUME: `${API_BASE_URL}/api/upload/resume`,
  
  // Profile Management
  PROFILE: `${API_BASE_URL}/api/profile`,
  PROFILE_BASIC: `${API_BASE_URL}/api/profile/basic`,
  PROFILE_PICTURE: `${API_BASE_URL}/api/profile/picture`,
  PROFILE_JOBSEEKER: `${API_BASE_URL}/api/profile/jobseeker`,
  PROFILE_RECRUITER: `${API_BASE_URL}/api/profile/recruiter`,
  PROFILE_COMPANY_LOGO: `${API_BASE_URL}/api/profile/company-logo`,
  
  // User-specific endpoints (protected)
  USER_PROFILE: `${API_BASE_URL}/api/user/profile`,
  USER_DASHBOARD: `${API_BASE_URL}/api/user/dashboard`,
  USER_APPLICATIONS: `${API_BASE_URL}/api/user/applications`,
  USER_JOBS: `${API_BASE_URL}/api/user/jobs`,
  
  // Experience Management
  PROFILE_EXPERIENCE: `${API_BASE_URL}/api/profile/experience`,
  PROFILE_EXPERIENCE_BY_ID: (experienceId) => `${API_BASE_URL}/api/profile/experience/${experienceId}`,
  
  // Education Management
  PROFILE_EDUCATION: `${API_BASE_URL}/api/profile/education`,
  
  // Applications
  APPLY: `${API_BASE_URL}/api/apply`,
  MY_APPLICATIONS: `${API_BASE_URL}/api/apply/my-applications`,
  CHECK_APPLICATION: (jobId) => `${API_BASE_URL}/api/apply/check/${jobId}`,
  
  // Job Recommendations
  JOB_RECOMMENDATIONS: `${API_BASE_URL}/api/job-recommendations`,
  
  // Utilities
  HEALTH_CHECK: `${API_BASE_URL}/api/health`,
};

export default API_BASE_URL;