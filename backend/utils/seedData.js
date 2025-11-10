const { Job } = require('../models');

// No sample jobs - database will start empty for real job postings
const sampleJobs = [];

const seedJobs = async () => {
  try {
    console.log('Seeding sample jobs...');
    
    // Clear existing jobs
    await Job.deleteMany({});
    
    // Insert sample jobs
    const insertedJobs = await Job.insertMany(sampleJobs);
    
    console.log(`✅ Successfully seeded ${insertedJobs.length} jobs`);
    return insertedJobs;
  } catch (error) {
    console.error('❌ Error seeding jobs:', error);
    throw error;
  }
};

module.exports = {
  seedJobs,
  sampleJobs
};
