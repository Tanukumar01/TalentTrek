// Simple script to seed sample jobs
// Run this in the browser console or use a tool like Postman

const API_BASE_URL = 'https://talenttrek-backend-89nq.onrender.com';

const seedJobs = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/seed-jobs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    console.log('Seed result:', data);
  } catch (error) {
    console.error('Error seeding jobs:', error);
  }
};

// Run this function to seed the jobs
// seedJobs(); 