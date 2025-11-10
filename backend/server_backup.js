require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');

// Debug: Check if environment variables are loaded
console.log('Environment variables:');
console.log('MONGO_URI:', process.env.MONGO_URI);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('PORT:', process.env.PORT);

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection with fallback
const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/talenttrek';
console.log('Connecting to MongoDB with URI:', mongoUri);

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.log('MongoDB connection error:', err));

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

// Resume upload configuration
const resumeUpload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
    }
  }
});

// Logo upload configuration
const logoUpload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for images
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed!'));
    }
  }
});

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String, // 'jobseeker', 'recruiter', 'employer'
  
  // Common profile fields
  profile: {
    // Basic Info
    firstName: String,
    lastName: String,
    phone: String,
    dateOfBirth: Date,
    gender: String,
    profilePicture: String, // Path to uploaded image
    
    // Address
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    },
    
    // Social Links
    socialLinks: {
      linkedin: String,
      github: String,
      portfolio: String,
      twitter: String
    },
    
    // Job Seeker Specific Fields
    jobSeekerProfile: {
      skills: [String],
      experience: [{
        company: String,
        position: String,
        startDate: Date,
        endDate: Date,
        current: Boolean,
        description: String,
        location: String
      }],
      education: [{
        institution: String,
        degree: String,
        fieldOfStudy: String,
        startDate: Date,
        endDate: Date,
        gpa: String,
        description: String
      }],
      certifications: [{
        name: String,
        issuer: String,
        issueDate: Date,
        expiryDate: Date,
        credentialId: String,
        url: String
      }],
      projects: [{
        name: String,
        description: String,
        technologies: [String],
        startDate: Date,
        endDate: Date,
        url: String,
        githubUrl: String
      }],
      resumePath: String,
      parsedResume: Object,
      preferredJobTypes: [String], // ['Full Time', 'Part Time', 'Contract', 'Internship']
      preferredLocations: [String],
      expectedSalary: {
        min: Number,
        max: Number,
        currency: String
      },
      availability: String, // 'Immediate', '2 weeks', '1 month', etc.
      workAuthorization: String, // 'Authorized', 'Requires Sponsorship', etc.
      bio: String
    },
    
    // Recruiter/Employer Specific Fields
    recruiterProfile: {
      companyName: String,
      companyWebsite: String,
      companyLogo: String,
      companySize: String, // '1-10', '11-50', '51-200', '201-500', '500+' 
      industry: String,
      companyDescription: String,
      position: String, // Job title at company
      department: String,
      yearsOfExperience: Number,
      specializations: [String], // Areas of recruitment expertise
      companyAddress: {
        street: String,
        city: String,
        state: String,
        country: String,
        zipCode: String
      },
      companyFoundedYear: Number,
      companyType: String, // 'Startup', 'Corporate', 'Agency', etc.
      bio: String
    }
  },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastLogin: Date,
  
  // Account Status
  isActive: { type: Boolean, default: true },
  isVerified: { type: Boolean, default: false },
  verificationToken: String
});
const User = mongoose.model('User', userSchema);

// Job schema
const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: {
    country: String,
    city: String
  },
  salary: {
    min: String,
    max: String
  },
  type: [String], // Array of job types
  experienceLevel: [String], // Array of experience levels
  category: [String], // Array of job categories
  description: String,
  requirements: String,
  companyWebsite: String,
  logo: String, // Path to uploaded logo file
  skills: [String],
  postedBy: String,
  postedAt: { type: Date, default: Date.now }
});
const Job = mongoose.model('Job', jobSchema);

// Resume schema
const resumeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  originalName: String,
  filePath: String,
  parsedData: {
    skills: [String],
    experience: [String],
    education: [String],
    summary: String
  },
  uploadedAt: { type: Date, default: Date.now }
});
const Resume = mongoose.model('Resume', resumeSchema);

// Application schema
const applicationSchema = new mongoose.Schema({
  jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job' },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  applicantName: String,
  applicantEmail: String,
  coverLetter: String,
  resumePath: String,
  resumeFileName: String,
  appliedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' },
  stage: { type: String, default: 'Resume Screening' }
});
const Application = mongoose.model('Application', applicationSchema);

// Signup route
app.post('/api/signup', async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: 'Email already exists' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    // Create JWT token for auto-login
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({
      success: true,
      token,
      user: { name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ success: false, message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ success: true, token, user: { name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// JWT middleware
const authenticateToken = require('./middleware/auth');

// Profile picture upload configuration
const profileUpload = multer({ 
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for profile pictures
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed for profile pictures!'));
    }
  }
});

// Resume upload route
app.post('/api/upload-resume', authenticateToken, resumeUpload.single('resume'), async (req, res) => {
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

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
    }
    return res.status(400).json({ success: false, message: 'File upload error: ' + error.message });
  }
  if (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
  next();
});

// Logo upload route
app.post('/api/upload-logo', authenticateToken, logoUpload.single('logo'), async (req, res) => {
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
app.post('/api/jobs', authenticateToken, logoUpload.single('logo'), async (req, res) => {
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
app.get('/api/jobs', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ postedAt: -1 });
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching jobs' });
  }
});

// Get job recommendations based on user's resume
app.get('/api/job-recommendations', authenticateToken, async (req, res) => {
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

// Get job details by ID
app.get('/api/jobs/:id', async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: 'Job not found' });
    res.json({ success: true, job });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching job' });
  }
});

// Apply to a job
app.post('/api/apply', authenticateToken, async (req, res) => {
  try {
    const { jobId, name, email, message, resumePath, resumeFileName } = req.body;
    
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
      applicantName: name || '',
      applicantEmail: email || '',
      coverLetter: message || '',
      resumePath: resumePath || '',
      resumeFileName: resumeFileName || ''
    });
    await application.save();
    res.json({ success: true, message: 'Application submitted!' });
  } catch (error) {
    console.error('Application error:', error);
    res.status(500).json({ success: false, message: 'Error applying to job' });
  }
});

// Get jobs posted by the authenticated recruiter
app.get('/api/my-jobs', authenticateToken, async (req, res) => {
  try {
    const jobs = await Job.find({ postedBy: req.user.email }).sort({ postedAt: -1 });
    res.json({ success: true, jobs });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching recruiter jobs' });
  }
});

// Get applications for a specific job (with candidate info)
app.get('/api/jobs/:jobId/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await Application.find({ jobId: req.params.jobId })
      .populate('userId', 'name email profile');
    res.json({ success: true, applications });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching applications' });
  }
});

// ============ PROFILE MANAGEMENT ROUTES ============

// Get user profile
app.get('/api/profile', authenticateToken, async (req, res) => {
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
app.put('/api/profile/basic', authenticateToken, async (req, res) => {
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
app.post('/api/profile/picture', authenticateToken, profileUpload.single('profilePicture'), async (req, res) => {
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
app.put('/api/profile/jobseeker', authenticateToken, async (req, res) => {
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
app.put('/api/profile/recruiter', authenticateToken, async (req, res) => {
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
app.post('/api/profile/company-logo', authenticateToken, logoUpload.single('companyLogo'), async (req, res) => {
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
app.post('/api/profile/experience', authenticateToken, async (req, res) => {
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
app.put('/api/profile/experience/:experienceId', authenticateToken, async (req, res) => {
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
app.delete('/api/profile/experience/:experienceId', authenticateToken, async (req, res) => {
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

// Similar routes for education, certifications, and projects
app.post('/api/profile/education', authenticateToken, async (req, res) => {
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

// Helper function to extract skills from text
function extractSkillsFromText(text) {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'MongoDB', 'SQL',
    'AWS', 'Docker', 'Kubernetes', 'Git', 'HTML', 'CSS', 'TypeScript',
    'Angular', 'Vue.js', 'Express', 'Django', 'Flask', 'Spring Boot',
    'PostgreSQL', 'MySQL', 'Redis', 'GraphQL', 'REST API', 'Machine Learning',
    'Data Science', 'DevOps', 'CI/CD', 'Agile', 'Scrum', 'Project Management'
  ];
  
  const foundSkills = commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  );
  
  return foundSkills;
}

// Helper function to calculate match score between user skills and job skills
function calculateMatchScore(userSkills, jobSkills) {
  if (!userSkills.length || !jobSkills.length) return 0;
  
  const userSkillsLower = userSkills.map(skill => skill.toLowerCase());
  const jobSkillsLower = jobSkills.map(skill => skill.toLowerCase());
  
  const matchingSkills = userSkillsLower.filter(skill => 
    jobSkillsLower.includes(skill)
  );
  
  return matchingSkills.length / Math.max(userSkills.length, jobSkills.length);
}

// Sample protected route
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});
app.post('/api/seed-jobs', async (req, res) => {
  try {
    const sampleJobs = [
      {
        title: 'Frontend Developer',
        company: 'TechCorp Inc.',
        location: {
          country: 'USA',
          city: 'Remote'
        },
        salary: {
          min: '80000',
          max: '120000'
        },
        type: ['Full Time'],
        experienceLevel: ['3-5 years'],
        category: ['Development'],
        description: 'We are looking for a skilled Frontend Developer to join our team. You will be responsible for building user-friendly web applications using modern technologies.',
        requirements: 'Experience with React, JavaScript, HTML, CSS. Knowledge of TypeScript and modern build tools is a plus.',
        companyWebsite: 'https://techcorp.com',
        skills: ['React', 'JavaScript', 'HTML', 'CSS', 'TypeScript']
      },
      {
        title: 'Backend Developer',
        company: 'StartupXYZ',
        location: 'San Francisco, CA',
        salary: '$90,000 - $130,000',
        type: 'Full Time',
        description: 'Join our fast-growing startup as a Backend Developer. You will work on scalable server-side applications and APIs.',
        requirements: 'Strong experience with Node.js, MongoDB, Express. Knowledge of AWS and Docker is preferred.',
        skills: ['Node.js', 'MongoDB', 'Express', 'AWS', 'Docker']
      },
      {
        title: 'Full Stack Developer',
        company: 'Digital Solutions',
        location: 'New York, NY',
        salary: '$100,000 - $150,000',
        type: 'Full Time',
        description: 'We need a Full Stack Developer who can work on both frontend and backend development. Experience with modern web technologies required.',
        requirements: 'Proficient in React, Node.js, MongoDB, Express. Experience with Git and agile methodologies.',
        skills: ['React', 'Node.js', 'MongoDB', 'Express', 'Git']
      },
      {
        title: 'DevOps Engineer',
        company: 'CloudTech',
        location: 'Austin, TX',
        salary: '$110,000 - $160,000',
        type: 'Full Time',
        description: 'Join our DevOps team to help build and maintain our cloud infrastructure. Experience with CI/CD pipelines required.',
        requirements: 'Experience with AWS, Docker, Kubernetes, CI/CD. Knowledge of monitoring and logging tools.',
        skills: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'DevOps']
      },
      {
        title: 'Data Scientist',
        company: 'Analytics Pro',
        location: 'Boston, MA',
        salary: '$120,000 - $180,000',
        type: 'Full Time',
        description: 'We are seeking a Data Scientist to help us extract insights from large datasets and build machine learning models.',
        requirements: 'Experience with Python, Machine Learning, SQL. Knowledge of statistical analysis and data visualization.',
        skills: ['Python', 'Machine Learning', 'SQL', 'Data Science']
      },
      {
        title: 'UI/UX Designer',
        company: 'Creative Studio',
        location: 'Los Angeles, CA',
        salary: '$70,000 - $110,000',
        type: 'Full Time',
        description: 'Join our creative team as a UI/UX Designer. You will be responsible for creating beautiful and functional user interfaces.',
        requirements: 'Experience with design tools like Figma, Sketch. Knowledge of user research and prototyping.',
        skills: ['Figma', 'UI/UX', 'Design', 'Prototyping']
      }
    ];

    // Clear existing jobs and insert sample jobs
    await Job.deleteMany({});
    const insertedJobs = await Job.insertMany(sampleJobs);

    res.json({ 
      success: true, 
      message: 'Sample jobs seeded successfully',
      count: insertedJobs.length
    });
  } catch (error) {
    console.error('Error seeding jobs:', error);
    res.status(500).json({ success: false, message: 'Error seeding jobs' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 