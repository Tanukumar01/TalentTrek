const mongoose = require('mongoose');

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

module.exports = mongoose.model('Application', applicationSchema);
