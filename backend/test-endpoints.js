// Backend API Test Script
// Run this to test if all endpoints are working properly

const API_BASE = 'http://localhost:5000';

async function testEndpoints() {
  console.log('🧪 Testing TalentTrek Backend Endpoints...\n');

  // Test health check
  try {
    const response = await fetch(`${API_BASE}/api/health`);
    const data = await response.json();
    console.log('✅ Health Check:', data.message);
  } catch (error) {
    console.log('❌ Health Check Failed:', error.message);
  }

  // Test get all jobs
  try {
    const response = await fetch(`${API_BASE}/api/jobs`);
    const data = await response.json();
    console.log(`✅ Get Jobs: Found ${data.jobs?.length || 0} jobs`);
  } catch (error) {
    console.log('❌ Get Jobs Failed:', error.message);
  }

  // Test get specific job (if jobs exist)
  try {
    const jobsResponse = await fetch(`${API_BASE}/api/jobs`);
    const jobsData = await jobsResponse.json();
    
    if (jobsData.jobs && jobsData.jobs.length > 0) {
      const firstJobId = jobsData.jobs[0]._id;
      const response = await fetch(`${API_BASE}/api/jobs/${firstJobId}`);
      const data = await response.json();
      console.log('✅ Get Job Details:', data.job?.title || 'Job found');
    } else {
      console.log('⚠️  No jobs available to test job details endpoint');
    }
  } catch (error) {
    console.log('❌ Get Job Details Failed:', error.message);
  }

  console.log('\n📋 Backend Endpoints Summary:');
  console.log('- GET  /api/health - Health check');
  console.log('- GET  /api/jobs - Get all jobs');
  console.log('- GET  /api/jobs/:id - Get job details');
  console.log('- POST /api/apply - Submit application (requires auth)');
  console.log('- GET  /api/apply/my-applications - Get user applications (requires auth)');
  console.log('- GET  /api/apply/check/:jobId - Check if applied (requires auth)');
  console.log('- POST /api/upload/resume - Upload resume (requires auth)');
  console.log('\n🔐 Auth required endpoints need JWT token in Authorization header');
}

// Run tests if this file is executed directly
if (require.main === module) {
  testEndpoints().catch(console.error);
}

module.exports = { testEndpoints };
