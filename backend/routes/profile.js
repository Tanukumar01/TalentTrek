const express = require('express');
const { User } = require('../models');
const authenticateToken = require('../middleware/auth');
const { profileUpload, logoUpload } = require('../config/multer');
const router = express.Router();

// Get user profile
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ success: false, message: 'Error fetching profile' });
  }
});

// Update basic profile information
router.put('/basic', authenticateToken, async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      dateOfBirth,
      gender,
      address,
      socialLinks
    } = req.body;

    const updateData = {
      'profile.firstName': firstName,
      'profile.lastName': lastName,
      'profile.phone': phone,
      'profile.dateOfBirth': dateOfBirth,
      'profile.gender': gender,
      'profile.address': address,
      'profile.socialLinks': socialLinks,
      updatedAt: new Date()
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, message: 'Basic profile updated successfully', user });
  } catch (error) {
    console.error('Update basic profile error:', error);
    res.status(500).json({ success: false, message: 'Error updating profile' });
  }
});

// Upload profile picture
router.post('/picture', authenticateToken, profileUpload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No profile picture uploaded' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        'profile.profilePicture': req.file.path,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      message: 'Profile picture updated successfully',
      profilePicture: req.file.path,
      user 
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading profile picture' });
  }
});

// Update job seeker profile
router.put('/jobseeker', authenticateToken, async (req, res) => {
  try {
    const {
      skills,
      experience,
      education,
      certifications,
      projects,
      preferredJobTypes,
      preferredLocations,
      expectedSalary,
      availability,
      workAuthorization,
      bio
    } = req.body;

    const updateData = {
      'profile.jobSeekerProfile': {
        skills: skills || [],
        experience: experience || [],
        education: education || [],
        certifications: certifications || [],
        projects: projects || [],
        preferredJobTypes: preferredJobTypes || [],
        preferredLocations: preferredLocations || [],
        expectedSalary: expectedSalary || {},
        availability: availability || '',
        workAuthorization: workAuthorization || '',
        bio: bio || ''
      },
      updatedAt: new Date()
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, message: 'Job seeker profile updated successfully', user });
  } catch (error) {
    console.error('Update job seeker profile error:', error);
    res.status(500).json({ success: false, message: 'Error updating job seeker profile' });
  }
});

// Update recruiter profile
router.put('/recruiter', authenticateToken, async (req, res) => {
  try {
    const {
      companyName,
      companyWebsite,
      companySize,
      industry,
      companyDescription,
      position,
      department,
      yearsOfExperience,
      specializations,
      companyAddress,
      companyFoundedYear,
      companyType,
      bio
    } = req.body;

    const updateData = {
      'profile.recruiterProfile': {
        companyName: companyName || '',
        companyWebsite: companyWebsite || '',
        companySize: companySize || '',
        industry: industry || '',
        companyDescription: companyDescription || '',
        position: position || '',
        department: department || '',
        yearsOfExperience: yearsOfExperience || 0,
        specializations: specializations || [],
        companyAddress: companyAddress || {},
        companyFoundedYear: companyFoundedYear || null,
        companyType: companyType || '',
        bio: bio || ''
      },
      updatedAt: new Date()
    };

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ success: true, message: 'Recruiter profile updated successfully', user });
  } catch (error) {
    console.error('Update recruiter profile error:', error);
    res.status(500).json({ success: false, message: 'Error updating recruiter profile' });
  }
});

// Upload company logo for recruiter
router.post('/company-logo', authenticateToken, logoUpload.single('companyLogo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No company logo uploaded' });
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        'profile.recruiterProfile.companyLogo': req.file.path,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');

    res.json({ 
      success: true, 
      message: 'Company logo updated successfully',
      companyLogo: req.file.path,
      user 
    });
  } catch (error) {
    console.error('Company logo upload error:', error);
    res.status(500).json({ success: false, message: 'Error uploading company logo' });
  }
});

// Add work experience
router.post('/experience', authenticateToken, async (req, res) => {
  try {
    const experienceData = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $push: { 'profile.jobSeekerProfile.experience': experienceData },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Experience added successfully', user });
  } catch (error) {
    console.error('Add experience error:', error);
    res.status(500).json({ success: false, message: 'Error adding experience' });
  }
});

// Update work experience
router.put('/experience/:experienceId', authenticateToken, async (req, res) => {
  try {
    const { experienceId } = req.params;
    const updateData = req.body;
    
    const user = await User.findOneAndUpdate(
      { 
        _id: req.user.id,
        'profile.jobSeekerProfile.experience._id': experienceId
      },
      { 
        $set: {
          'profile.jobSeekerProfile.experience.$': updateData,
          updatedAt: new Date()
        }
      },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Experience updated successfully', user });
  } catch (error) {
    console.error('Update experience error:', error);
    res.status(500).json({ success: false, message: 'Error updating experience' });
  }
});

// Delete work experience
router.delete('/experience/:experienceId', authenticateToken, async (req, res) => {
  try {
    const { experienceId } = req.params;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $pull: { 'profile.jobSeekerProfile.experience': { _id: experienceId } },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Experience deleted successfully', user });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({ success: false, message: 'Error deleting experience' });
  }
});

// Add education
router.post('/education', authenticateToken, async (req, res) => {
  try {
    const educationData = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        $push: { 'profile.jobSeekerProfile.education': educationData },
        $set: { updatedAt: new Date() }
      },
      { new: true }
    ).select('-password');

    res.json({ success: true, message: 'Education added successfully', user });
  } catch (error) {
    console.error('Add education error:', error);
    res.status(500).json({ success: false, message: 'Error adding education' });
  }
});

module.exports = router;
