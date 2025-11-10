const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

// User schema
const userSchema = new mongoose.Schema({
  userId: { 
    type: String, 
    unique: true, 
    default: () => uuidv4(),
    index: true 
  },
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

module.exports = mongoose.model('User', userSchema);
