const express = require('express');
const { Job, Application } = require('../models');
const authenticateToken = require('../middleware/auth');
const { logoUpload } = require('../config/cloudinary');
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

// Post job route - handles both JSON and form-data with logo
router.post('/', authenticateToken, (req, res, next) => {
  // Only apply multer if content-type is multipart/form-data
  const contentType = req.headers['content-type'] || '';
  if (contentType.includes('multipart/form-data')) {
    logoUpload.single('logo')(req, res, next);
  } else {
    next();
  }
}, async (req, res) => {
  try {
    console.log(' Received job posting request');
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body:', JSON.stringify(req.body, null, 2));
    
    const { 
      title, 
      company, 
      description, 
      requirements, 
      companyWebsite,
      skills: providedSkills,
      location: bodyLocation,
      salary: bodySalary,
      type: bodyType,
      experienceLevel: bodyExperienceLevel,
      category: bodyCategory
    } = req.body;
    
    // Validate required fields
    if (!title || !company || !description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Missing required fields: title, company, and description are required' 
      });
    }
    
    // Handle both JSON body and form-data
    let location, salary, type, experienceLevel, category;
    
    try {
      // If location is already an object (JSON body), use it directly
      // If it's a string (form-data), parse it
      location = typeof bodyLocation === 'string' 
        ? JSON.parse(bodyLocation) 
        : bodyLocation || { country: 'India', city: 'Bangalore' };
      
      salary = typeof bodySalary === 'string'
        ? JSON.parse(bodySalary)
        : bodySalary || { min: '', max: '' };
      
      type = typeof bodyType === 'string'
        ? JSON.parse(bodyType)
        : bodyType || ['Full Time'];
      
      experienceLevel = typeof bodyExperienceLevel === 'string'
        ? JSON.parse(bodyExperienceLevel)
        : bodyExperienceLevel || ['Freshers'];
      
      category = typeof bodyCategory === 'string'
        ? JSON.parse(bodyCategory)
        : bodyCategory || ['Development'];
    } catch (parseError) {
      console.error('❌ JSON parsing error:', parseError);
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid data format: ' + parseError.message 
      });
    }
    
    // Use provided skills or extract from requirements and description
    let skills;
    if (providedSkills && Array.isArray(providedSkills)) {
      skills = providedSkills;
    } else if (typeof providedSkills === 'string') {
      try {
        skills = JSON.parse(providedSkills);
      } catch {
        skills = extractSkillsFromText((requirements || '') + ' ' + (description || ''));
      }
    } else {
      skills = extractSkillsFromText((requirements || '') + ' ' + (description || ''));
    }
    
    // Create job object
    const job = new Job({
      title,
      company,
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
      description,
      requirements: requirements || '',
      companyWebsite: companyWebsite || '',
      logo: req.file ? req.file.path : null,
      skills,
      postedBy: req.user.email
    });
    
    await job.save();
    console.log('✅ Job posted successfully:', job.title);
    res.status(201).json({ success: true, message: 'Job posted successfully', job });
  } catch (error) {
    console.error('❌ Job posting error:', error);
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

// Update job by ID (recruiter only - must be job owner)
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Updating job with ID:', id);
    
    // Check if ID is a valid MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID format' });
    }
    
    // Find the job first
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    // Check if the user is the owner of the job
    if (job.postedBy !== req.user.email) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only update jobs you posted.' 
      });
    }
    
    const { 
      title, 
      company, 
      description, 
      requirements, 
      companyWebsite,
      skills,
      location,
      salary,
      type,
      experienceLevel,
      category
    } = req.body;
    
    // Update fields (only update fields that are provided)
    const updateData = {};
    
    if (title !== undefined) updateData.title = title;
    if (company !== undefined) updateData.company = company;
    if (description !== undefined) updateData.description = description;
    if (requirements !== undefined) updateData.requirements = requirements;
    if (companyWebsite !== undefined) updateData.companyWebsite = companyWebsite;
    if (skills !== undefined) updateData.skills = skills;
    if (location !== undefined) updateData.location = location;
    if (salary !== undefined) updateData.salary = salary;
    if (type !== undefined) updateData.type = type;
    if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel;
    if (category !== undefined) updateData.category = category;
    
    // Update the job
    const updatedJob = await Job.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );
    
    console.log('✅ Job updated successfully:', updatedJob.title);
    res.json({ 
      success: true, 
      message: 'Job updated successfully', 
      job: updatedJob 
    });
  } catch (error) {
    console.error('❌ Error updating job:', error);
    res.status(500).json({ success: false, message: 'Error updating job: ' + error.message });
  }
});

// Delete job by ID (recruiter only - must be job owner)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🗑️ Deleting job with ID:', id);
    
    // Check if ID is a valid MongoDB ObjectId format
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID format' });
    }
    
    // Find the job first
    const job = await Job.findById(id);
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    
    // Check if the user is the owner of the job
    if (job.postedBy !== req.user.email) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only delete jobs you posted.' 
      });
    }
    
    // Delete the job
    await Job.findByIdAndDelete(id);
    
    console.log('✅ Job deleted successfully:', job.title);
    res.json({ 
      success: true, 
      message: 'Job deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Error deleting job:', error);
    res.status(500).json({ success: false, message: 'Error deleting job: ' + error.message });
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
