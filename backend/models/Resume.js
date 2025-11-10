const mongoose = require('mongoose');

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

module.exports = mongoose.model('Resume', resumeSchema);
