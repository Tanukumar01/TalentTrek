const express = require('express');
const { Application } = require('../models');
const authenticateToken = require('../middleware/auth');
const { resumeUpload } = require('../config/multer');
const router = express.Router();

// Apply to a job (with optional resume upload)
router.post('/', authenticateToken, resumeUpload.single('resume'), async (req, res) => {
  try {
    const { jobId, name, email, message } = req.body;
    
    // Handle resume file if uploaded during application
    let resumePath = '';
    let resumeFileName = '';
    
    if (req.file) {
      // Resume uploaded with this application
      resumePath = req.file.path;
      resumeFileName = req.file.originalname;
      console.log('Resume uploaded for application:', resumeFileName);
    } else {
      // No resume uploaded - try to get from user's profile
      const { User } = require('../models');
      const user = await User.findById(req.user.id);
      
      if (user?.profile?.jobSeekerProfile?.resumePath) {
        resumePath = user.profile.jobSeekerProfile.resumePath;
        resumeFileName = user.profile.jobSeekerProfile.resumePath.split('/').pop();
        console.log('Using resume from user profile:', resumeFileName);
      } else {
        console.log('No resume found - user should upload one');
      }
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
    
    console.log('✅ Application submitted:', {
      jobId,
      userId: req.user.id,
      hasResume: !!resumePath
    });
    
    res.json({ 
      success: true, 
      message: 'Application submitted!',
      hasResume: !!resumePath
    });
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

// ==================== RECRUITER ENDPOINTS ====================

// Get all applications for a specific job (Recruiter only)
router.get('/job/:jobId', authenticateToken, async (req, res) => {
  try {
    const { Job, User } = require('../models');
    const { jobId } = req.params;
    
    // Verify the job exists and belongs to this recruiter
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ 
        success: false, 
        message: 'Job not found' 
      });
    }
    
    // Check if the recruiter owns this job
    if (job.postedBy !== req.user.email) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only view applications for jobs you posted.' 
      });
    }
    
    // Get all applications for this job with applicant details
    const applications = await Application.find({ jobId })
      .populate('userId', 'email profile')
      .sort({ appliedAt: -1 });
    
    // Format the response with detailed applicant info
    const formattedApplications = applications.map(app => ({
      _id: app._id,
      applicantName: app.applicantName,
      applicantEmail: app.applicantEmail,
      coverLetter: app.coverLetter,
      resumePath: app.resumePath,
      resumeFileName: app.resumeFileName,
      appliedAt: app.appliedAt,
      status: app.status || 'pending',
      // Additional applicant details from profile
      applicantProfile: {
        skills: app.userId?.profile?.jobSeekerProfile?.skills || [],
        experience: app.userId?.profile?.jobSeekerProfile?.experience || [],
        education: app.userId?.profile?.jobSeekerProfile?.education || []
      }
    }));
    
    res.json({ 
      success: true, 
      job: {
        id: job._id,
        title: job.title,
        company: job.company
      },
      totalApplications: formattedApplications.length,
      applications: formattedApplications 
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching applications: ' + error.message 
    });
  }
});

// Get all applications for all jobs posted by this recruiter
router.get('/recruiter/all', authenticateToken, async (req, res) => {
  try {
    const { Job } = require('../models');
    
    // Get all jobs posted by this recruiter
    const recruiterJobs = await Job.find({ postedBy: req.user.email });
    const jobIds = recruiterJobs.map(job => job._id);
    
    if (jobIds.length === 0) {
      return res.json({ 
        success: true, 
        message: 'No jobs posted yet',
        totalApplications: 0,
        applications: [] 
      });
    }
    
    // Get all applications for these jobs
    const applications = await Application.find({ jobId: { $in: jobIds } })
      .populate('jobId', 'title company location salary type')
      .populate('userId', 'email profile')
      .sort({ appliedAt: -1 });
    
    // Format the response
    const formattedApplications = applications.map(app => ({
      _id: app._id,
      job: {
        id: app.jobId?._id,
        title: app.jobId?.title,
        company: app.jobId?.company
      },
      applicantName: app.applicantName,
      applicantEmail: app.applicantEmail,
      coverLetter: app.coverLetter,
      resumePath: app.resumePath,
      resumeFileName: app.resumeFileName,
      appliedAt: app.appliedAt,
      status: app.status || 'pending',
      applicantSkills: app.userId?.profile?.jobSeekerProfile?.skills || []
    }));
    
    res.json({ 
      success: true,
      totalJobs: recruiterJobs.length,
      totalApplications: formattedApplications.length,
      applications: formattedApplications 
    });
  } catch (error) {
    console.error('Error fetching recruiter applications:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching applications: ' + error.message 
    });
  }
});

// Get application statistics for recruiter
router.get('/recruiter/stats', authenticateToken, async (req, res) => {
  try {
    const { Job } = require('../models');
    
    // Get all jobs posted by this recruiter
    const recruiterJobs = await Job.find({ postedBy: req.user.email });
    const jobIds = recruiterJobs.map(job => job._id);
    
    if (jobIds.length === 0) {
      return res.json({ 
        success: true,
        stats: {
          totalJobs: 0,
          totalApplications: 0,
          pendingApplications: 0,
          jobsWithApplications: []
        }
      });
    }
    
    // Get all applications
    const applications = await Application.find({ jobId: { $in: jobIds } });
    
    // Calculate stats per job
    const jobStats = recruiterJobs.map(job => {
      const jobApplications = applications.filter(
        app => app.jobId.toString() === job._id.toString()
      );
      
      return {
        jobId: job._id,
        title: job.title,
        company: job.company,
        applicationCount: jobApplications.length,
        postedAt: job.postedAt
      };
    });
    
    res.json({ 
      success: true,
      stats: {
        totalJobs: recruiterJobs.length,
        totalApplications: applications.length,
        pendingApplications: applications.filter(app => 
          (app.status || 'pending') === 'pending'
        ).length,
        jobsWithApplications: jobStats.sort((a, b) => 
          b.applicationCount - a.applicationCount
        )
      }
    });
  } catch (error) {
    console.error('Error fetching recruiter stats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching statistics: ' + error.message 
    });
  }
});

module.exports = router;
