const express = require('express');
const { User, Resume } = require('../models');
const authenticateToken = require('../middleware/auth');
const { resumeUpload } = require('../config/multer');
const { calculateMatchScore } = require('../utils/helpers');
const router = express.Router();

// Resume upload route
router.post('/resume', authenticateToken, resumeUpload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    console.log('File uploaded:', req.file.originalname, 'Size:', req.file.size, 'bytes');

    // Simple resume parsing (in a real app, you'd use a proper PDF parser)
    const parsedData = {
      skills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'], // Mock data
      experience: ['Software Engineer at TechCorp', 'Frontend Developer at Startup'],
      education: ['Bachelor of Computer Science'],
      summary: 'Experienced software developer with expertise in modern web technologies.'
    };

    // Save resume info to database
    const resume = new Resume({
      userId: req.user.id,
      originalName: req.file.originalname,
      filePath: req.file.path,
      parsedData: parsedData
    });
    await resume.save();

    // Update user profile with parsed data
    await User.findByIdAndUpdate(req.user.id, {
      'profile.jobSeekerProfile.resumePath': req.file.path,
      'profile.jobSeekerProfile.parsedResume': parsedData,
      'profile.jobSeekerProfile.skills': parsedData.skills,
      updatedAt: new Date()
    });

    res.json({ 
      success: true, 
      message: 'Resume uploaded successfully',
      parsedData: parsedData
    });
  } catch (error) {
    console.error('Resume upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading resume: ' + error.message });
  }
});

module.exports = router;
