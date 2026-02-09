const express = require('express');
const { User, Job } = require('../models');
const authenticateToken = require('../middleware/auth');
const router = express.Router();

// Get job recommendations based on user's resume
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.profile?.jobSeekerProfile?.parsedResume && !user.profile?.jobSeekerProfile?.skills) {
      return res.json({ success: true, recommendations: [], message: 'No resume or skills added yet' });
    }

    const userSkills = user.profile?.jobSeekerProfile?.skills || user.profile?.jobSeekerProfile?.parsedResume?.skills || [];
    
    // Get all jobs sorted by posted date (newest first)
    const allJobs = await Job.find().sort({ postedAt: -1 }).limit(10);

    // Convert to plain objects
    const recommendations = allJobs.map(job => job.toObject());

    res.json({ 
      success: true, 
      recommendations: recommendations,
      userSkills: userSkills
    });
  } catch (error) {
    console.error('Job recommendations error:', error);
    res.status(500).json({ success: false, message: 'Error getting recommendations' });
  }
});

module.exports = router;
