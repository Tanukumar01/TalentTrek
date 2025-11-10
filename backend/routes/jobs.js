const express = require('express');
const { Job, Application } = require('../models');
const authenticateToken = require('../middleware/auth');
const { logoUpload } = require('../config/multer');
const { extractSkillsFromText, calculateMatchScore } = require('../utils/helpers');
const { seedJobs } = require('../utils/seedData');
const router = express.Router();

// Logo upload route
router.post('/upload-logo', authenticateToken, logoUpload.single('logo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No logo file uploaded' });
    }

    console.log('Logo uploaded:', req.file.originalname, 'Size:', req.file.size, 'bytes');

    res.json({ 
      success: true, 
      message: 'Logo uploaded successfully',
      logoPath: req.file.path,
      logoFilename: req.file.filename
    });
  } catch (error) {
    console.error('Logo upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading logo: ' + error.message });
  }
});

// Post job route (with optional logo support)
router.post('/', authenticateToken, logoUpload.single('logo'), async (req, res) => {
  try {
    const { 
      title, 
      company, 
      description, 
      requirements, 
      companyWebsite
    } = req.body;
    
    // Parse JSON strings for nested objects and arrays
    let location, salary, type, experienceLevel, category;
    
    try {
      location = req.body.location ? JSON.parse(req.body.location) : { country: 'India', city: 'Bangalore' };
      salary = req.body.salary ? JSON.parse(req.body.salary) : { min: '', max: '' };
      type = req.body.type ? JSON.parse(req.body.type) : ['Full Time'];
      experienceLevel = req.body.experienceLevel ? JSON.parse(req.body.experienceLevel) : ['Freshers'];
      category = req.body.category ? JSON.parse(req.body.category) : ['Development'];
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      return res.status(400).json({ success: false, message: 'Invalid data format' });
    }
    
    // Extract skills from requirements and description (simple keyword extraction)
    const skills = extractSkillsFromText((requirements || '') + ' ' + (description || ''));
    
    // Create job object with new structure
    const job = new Job({
      title: title || '',
      company: company || '',
      location: {
        country: location?.country || 'India',
        city: location?.city || 'Bangalore'
      },
      salary: {
        min: salary?.min || '',
        max: salary?.max || ''
      },
      type: Array.isArray(type) ? type : [type || 'Full Time'],
      experienceLevel: Array.isArray(experienceLevel) ? experienceLevel : [experienceLevel || 'Freshers'],
      category: Array.isArray(category) ? category : [category || 'Development'],
      description: description || '',
      requirements: requirements || '',
      companyWebsite: companyWebsite || '',
      logo: req.file ? req.file.path : null, // Use uploaded file path
      skills,
      postedBy: req.user.email
    });
    
    await job.save();
    res.json({ success: true, message: 'Job posted successfully', job });
  } catch (error) {
    console.error('Job posting error:', error);
    res.status(500).json({ success: false, message: 'Error posting job: ' + error.message });
  }
});

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching jobs' });
  }
});

// Get job details by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching job with ID:', id);
    
    // Check if ID is a valid MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID format' });
    }
    
    const job = await Job.findById(id);
    if (!job) {
      console.log('Job not found for ID:', id);
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    console.log('Job found:', job.title);
    res.json({ success: true, job });
  } catch (error) {
    console.error('Error fetching job:', error);
    res.status(500).json({ success: false, message: 'Error fetching job: ' + error.message });
  }
});

// Get jobs posted by the authenticated recruiter
router.get('/my/jobs', authenticateToken, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.email }).sort({ postedAt: -1 });
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching recruiter jobs' });
  }
});

// Get applications for a specific job (with candidate info)
router.get('/:jobId/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('userId', 'name email profile');
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching applications' });
  }
});

// Clear all jobs (development only)
router.delete('/clear', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Clearing jobs not allowed in production' });
    }
    
    const result = await Job.deleteMany({});
    res.json({ 
      success: true, 
      message: 'All jobs cleared successfully',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error clearing jobs:', error);
    res.status(500).json({ success: false, message: 'Error clearing jobs' });
  }
});

// Seed sample jobs (development only)
router.post('/seed', async (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ success: false, message: 'Seeding not allowed in production' });
    }
    
    const jobs = await seedJobs();
    res.json({ 
      success: true, 
      message: 'Sample jobs seeded successfully',
      count: jobs.length
    });
  } catch (error) {
    console.error('Error seeding jobs:', error);
    res.status(500).json({ success: false, message: 'Error seeding jobs' });
  }
});

module.exports = router;
