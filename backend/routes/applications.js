const express = require('express');
const { Application } = require('../models');
const authenticateToken = require('../middleware/auth');
const { resumeUpload } = require('../config/multer');
const router = express.Router();

// Apply to a job (with optional resume upload)
router.post('/', authenticateToken, resumeUpload.single('resume'), async (req, res) => {
  try {
    const { jobId, name, email, message } = req.body;
    
    // Handle resume file if uploaded
    let resumePath = '';
    let resumeFileName = '';
    
    if (req.file) {
      resumePath = req.file.path;
      resumeFileName = req.file.originalname;
      console.log('Resume uploaded for application:', resumeFileName);
    }
    
    // Validate required fields
    if (!jobId) {
      return res.status(400).json({ success: false, message: 'Job ID is required' });
    }
    
    // Prevent duplicate applications
    const existing = await Application.findOne({ jobId, userId: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Already applied to this job.' });
    }
    
    const application = new Application({
      jobId,
      userId: req.user.id,
      applicantName: name || req.user.name || '',
      applicantEmail: email || req.user.email || '',
      coverLetter: message || '',
      resumePath: resumePath,
      resumeFileName: resumeFileName
    });
    await application.save();
    res.json({ success: true, message: 'Application submitted!' });
  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ success: false, message: 'Error applying to job' });
  }
});

// Get user's applications
router.get('/my-applications', authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user.id })
      .populate('jobId', 'title company location salary type')
      .sort({ appliedAt: -1 });
    res.json({ success: true, applications });
  } catch (error) {
    console.error('Error fetching user applications:', error);
    res.status(500).json({ success: false, message: 'Error fetching applications' });
  }
});

// Check if user has already applied to a specific job
router.get('/check/:jobId', authenticateToken, async (req, res) => {
  try {
    const existing = await Application.findOne({ 
      jobId: req.params.jobId, 
      userId: req.user.id 
    });
    res.json({ success: true, hasApplied: !!existing });
  } catch (error) {
    console.error('Error checking application status:', error);
    res.status(500).json({ success: false, message: 'Error checking application status' });
  }
});

module.exports = router;
