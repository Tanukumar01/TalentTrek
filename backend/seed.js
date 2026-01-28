require('dotenv').config();
const connectDatabase = require('./config/database');
const { seedJobs } = require('./utils/seedData');

const runSeed = async () => {
  try {
    console.log('🌱 Starting database seeding...\n');
    
    // Connect to database
    await connectDatabase();
    
    // Seed jobs
    await seedJobs();
    
    console.log('\n✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
};

runSeed();
