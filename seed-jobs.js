// Simple script to seed sample jobs
// Run this in the browser console or use a tool like Postman

const seedJobs = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/seed-jobs', {
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