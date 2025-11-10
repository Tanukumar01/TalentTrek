const express = require('express');
const { User } = require('../models');
const { authenticateUser, ensureOwnData } = require('../middleware/userAuth');
const router = express.Router();

// Get user's own profile
router.get('/profile', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Update user's own profile
router.put('/profile', authenticateUser, async (req, res) => {
  try {
    console.log('📥 Received profile update request for user:', req.user.id);
    console.log('📋 Profile data received:', JSON.stringify(req.body, null, 2));
    
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.password;
    delete updates.email;
    delete updates.userId;
    delete updates._id;
    
    // Validate required fields for job seekers
    if (req.user.role === 'jobseeker') {
      const profile = updates.profile;
      if (profile && profile.jobSeekerProfile) {
        console.log('✅ Job seeker profile data found:', profile.jobSeekerProfile);
        
        // Ensure arrays are properly formatted
        if (profile.jobSeekerProfile.experience) {
          console.log('📝 Experience entries:', profile.jobSeekerProfile.experience.length);
        }
        if (profile.jobSeekerProfile.education) {
          console.log('🎓 Education entries:', profile.jobSeekerProfile.education.length);
        }
        if (profile.jobSeekerProfile.skills) {
          console.log('💪 Skills:', profile.jobSeekerProfile.skills.length);
        }
      }
    }
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        ...updates,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      console.error('❌ User not found for ID:', req.user.id);
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    console.log('✅ Profile updated successfully for user:', req.user.id);
    console.log('💾 Updated profile data:', JSON.stringify(user.profile, null, 2));
    
    res.json({ success: true, user, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error: ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Get user's dashboard data (role-specific)
router.get('/dashboard', authenticateUser, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    let dashboardData = {
      user: {
        id: user._id,
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role
      },
      profile: user.profile
    };
    
    // Add role-specific statistics
    if (user.role === 'jobseeker') {
      const { Application } = require('../models');
      
      // Get application statistics
      const totalApplications = await Application.countDocuments({ userId: req.user.id });
      const interviewApplications = await Application.countDocuments({ 
        userId: req.user.id, 
        status: 'interview' 
      });
      const pendingApplications = await Application.countDocuments({ 
        userId: req.user.id, 
        status: 'pending' 
      });
      const rejectedApplications = await Application.countDocuments({ 
        userId: req.user.id, 
        status: 'rejected' 
      });
      
      dashboardData.statistics = {
        totalApplications,
        upcomingInterviews: interviewApplications,
        shortlisted: pendingApplications,
        jobOffersReceived: 0, // TODO: Implement job offers
        applicationReview: totalApplications - interviewApplications - rejectedApplications
      };
    }
    
    res.json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's applications (job seekers only)
router.get('/applications', authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== 'jobseeker') {
      return res.status(403).json({ success: false, message: 'Access denied. Job seekers only.' });
    }
    
    const { Application } = require('../models');
    const { Job } = require('../models');
    
    // Fetch user's applications with job details
    const applications = await Application.find({ userId: req.user.id })
      .populate('jobId', 'title company location type')
      .sort({ appliedAt: -1 });
    
    // Format applications for frontend
    const formattedApplications = applications.map(app => ({
      id: app._id,
      company: app.jobId?.company || 'Unknown Company',
      jobTitle: app.jobId?.title || 'Unknown Position',
      type: app.jobId?.type || 'Full-time',
      stage: app.status === 'pending' ? 'Applied' : 
             app.status === 'reviewed' ? 'Under Review' :
             app.status === 'interview' ? 'Interview' :
             app.status === 'rejected' ? 'Rejected' : 'Applied',
      stageColor: app.status === 'pending' ? 'text-blue-600 bg-blue-100' :
                  app.status === 'reviewed' ? 'text-orange-600 bg-orange-100' :
                  app.status === 'interview' ? 'text-purple-600 bg-purple-100' :
                  app.status === 'rejected' ? 'text-red-600 bg-red-100' : 'text-blue-600 bg-blue-100',
      appliedDate: app.appliedAt.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      interview: app.status === 'interview' ? 'Scheduled' : null
    }));
    
    res.json({ success: true, applications: formattedApplications });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Get user's posted jobs (recruiters only)
router.get('/jobs', authenticateUser, async (req, res) => {
  try {
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ success: false, message: 'Access denied. Recruiters only.' });
    }
    
    // TODO: Implement job fetching logic for specific recruiter
    // For now, return empty array
    res.json({ success: true, jobs: [] });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
