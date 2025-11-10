const express = require('express');
const { User, Job } = require('../models');
const authenticateToken = require('../middleware/auth');
const { calculateMatchScore } = require('../utils/helpers');
const router = express.Router();

// Get job recommendations based on user's resume
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user.profile?.jobSeekerProfile?.parsedResume && !user.profile?.jobSeekerProfile?.skills) {
      return res.json({ success: true, recommendations: [], message: 'No resume or skills added yet' });
    }

    const userSkills = user.profile?.jobSeekerProfile?.skills || user.profile?.jobSeekerProfile?.parsedResume?.skills || [];
    const allJobs = await Job.find();

    // Calculate job matches based on skills
    const recommendations = allJobs.map(job => {
      const matchScore = calculateMatchScore(userSkills, job.skills);
      return {
        ...job.toObject(),
        matchScore,
        matchPercentage: Math.round(matchScore * 100)
      };
    });

    // Sort by match score and return top 10
    const topRecommendations = recommendations
      .filter(job => job.matchScore > 0.1) // Only jobs with at least 10% match
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 10);

    res.json({ 
      success: true, 
      recommendations: topRecommendations,
      userSkills: userSkills
    });
  } catch (error) {
    console.error('Job recommendations error:', error);
    res.status(500).json({ success: false, message: 'Error getting recommendations' });
  }
});

module.exports = router;
