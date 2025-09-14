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

const upload = multer({ 
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

// User schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  profile: {
    skills: [String],
    experience: [String],
    education: [String],
    resumePath: String,
    parsedResume: Object
  }
});
const User = mongoose.model('User', userSchema);

// Job schema
const jobSchema = new mongoose.Schema({
  title: String,
  company: String,
  location: String,
  salary: String,
  type: String,
  description: String,
  requirements: String,
  companyWebsite: String,
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

// Resume upload route
app.post('/api/upload-resume', authenticateToken, upload.single('resume'), async (req, res) => {
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
      'profile.resumePath': req.file.path,
      'profile.parsedResume': parsedData,
      'profile.skills': parsedData.skills
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

// Post job route
app.post('/api/jobs', authenticateToken, async (req, res) => {
  try {
    const { title, company, location, salary, type, description, requirements, companyWebsite } = req.body;
    
    // Extract skills from requirements (simple keyword extraction)
    const skills = extractSkillsFromText(requirements + ' ' + description);
    
    const job = new Job({
      title,
      company,
      location,
      salary,
      type,
      description,
      requirements,
      companyWebsite,
      skills,
      postedBy: req.user.email
    });
    
    await job.save();
    res.json({ success: true, message: 'Job posted successfully', job });
  } catch (error) {
    console.error('Job posting error:', error);
    res.status(500).json({ success: false, message: 'Error posting job' });
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
    if (!user.profile.parsedResume) {
      return res.json({ success: true, recommendations: [], message: 'No resume uploaded yet' });
    }

    const userSkills = user.profile.parsedResume.skills || [];
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

// Seed sample jobs route (for testing)
app.post('/api/seed-jobs', async (req, res) => {
  try {
    const sampleJobs = [
      {
        title: 'Frontend Developer',
        company: 'TechCorp Inc.',
        location: 'Remote',
        salary: '$80,000 - $120,000',
        type: 'Full Time',
        description: 'We are looking for a skilled Frontend Developer to join our team. You will be responsible for building user-friendly web applications using modern technologies.',
        requirements: 'Experience with React, JavaScript, HTML, CSS. Knowledge of TypeScript and modern build tools is a plus.',
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