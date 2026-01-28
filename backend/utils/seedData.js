const { Job } = require('../models');

// Sample jobs for testing and demonstration
const sampleJobs = [
  {
    title: 'Senior React Developer',
    company: 'Tech Innovations Inc',
    location: { country: 'USA', city: 'San Francisco' },
    salary: { min: '$120,000', max: '$160,000' },
    type: ['Full Time', 'Remote'],
    experienceLevel: ['Senior'],
    category: ['Technology', 'Software Development'],
    description: 'We are looking for an experienced React developer to join our team. You will be responsible for building scalable web applications using React and modern JavaScript.',
    requirements: '5+ years of professional React development experience. Strong proficiency in TypeScript. Experience with Node.js and Express.',
    skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'MongoDB'],
    companyWebsite: 'https://techinnovations.com',
    postedBy: 'recruiter@techinnovations.com'
  },
  {
    title: 'Full Stack JavaScript Developer',
    company: 'StartupHub',
    location: { country: 'USA', city: 'New York' },
    salary: { min: '$90,000', max: '$130,000' },
    type: ['Full Time'],
    experienceLevel: ['Mid-level'],
    category: ['Technology'],
    description: 'Join our fast-paced startup as a Full Stack Developer. Work with modern JavaScript technologies on both frontend and backend.',
    requirements: '3+ years of JavaScript development. Experience with React and Node.js required.',
    skills: ['JavaScript', 'React', 'Node.js', 'Express', 'PostgreSQL'],
    companyWebsite: 'https://startuphub.com',
    postedBy: 'hr@startuphub.com'
  },
  {
    title: 'Frontend Developer',
    company: 'Digital Solutions Ltd',
    location: { country: 'UK', city: 'London' },
    salary: { min: '£50,000', max: '£70,000' },
    type: ['Full Time', 'Hybrid'],
    experienceLevel: ['Mid-level'],
    category: ['Technology', 'Web Development'],
    description: 'Looking for a talented Frontend Developer to create amazing user experiences.',
    requirements: '2+ years of frontend development. Strong React skills required.',
    skills: ['JavaScript', 'React', 'CSS', 'HTML', 'Redux'],
    companyWebsite: 'https://digitalsolutions.co.uk',
    postedBy: 'jobs@digitalsolutions.co.uk'
  },
  {
    title: 'Backend Node.js Developer',
    company: 'CloudTech Systems',
    location: { country: 'India', city: 'Bangalore' },
    salary: { min: '₹12,00,000', max: '₹18,00,000' },
    type: ['Full Time', 'Remote'],
    experienceLevel: ['Senior'],
    category: ['Technology', 'Backend Development'],
    description: 'Build scalable backend systems using Node.js and microservices architecture.',
    requirements: '4+ years of Node.js development. Experience with MongoDB and Redis.',
    skills: ['Node.js', 'JavaScript', 'MongoDB', 'Redis', 'Docker'],
    companyWebsite: 'https://cloudtech.in',
    postedBy: 'careers@cloudtech.in'
  },
  {
    title: 'Python Django Developer',
    company: 'DataCorp Analytics',
    location: { country: 'USA', city: 'Austin' },
    salary: { min: '$100,000', max: '$140,000' },
    type: ['Full Time'],
    experienceLevel: ['Mid-level'],
    category: ['Technology', 'Data Science'],
    description: 'Work on data-driven applications using Python and Django framework.',
    requirements: '3+ years of Python development. Django and PostgreSQL experience required.',
    skills: ['Python', 'Django', 'PostgreSQL', 'REST APIs', 'Docker'],
    companyWebsite: 'https://datacorp.com',
    postedBy: 'hiring@datacorp.com'
  },
  {
    title: 'MERN Stack Developer',
    company: 'WebWorks Agency',
    location: { country: 'Canada', city: 'Toronto' },
    salary: { min: 'CAD 80,000', max: 'CAD 110,000' },
    type: ['Full Time', 'Remote'],
    experienceLevel: ['Mid-level', 'Senior'],
    category: ['Technology', 'Full Stack'],
    description: 'Join our team to build modern web applications using the MERN stack.',
    requirements: 'Strong experience with MongoDB, Express, React, and Node.js.',
    skills: ['MongoDB', 'Express', 'React', 'Node.js', 'JavaScript'],
    companyWebsite: 'https://webworks.ca',
    postedBy: 'jobs@webworks.ca'
  }
];

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
