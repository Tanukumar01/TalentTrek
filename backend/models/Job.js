const mongoose = require('mongoose');

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

module.exports = mongoose.model('Job', jobSchema);
