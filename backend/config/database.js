const mongoose = require('mongoose');

const connectDatabase = async () => {
  try {
    // MongoDB connection with fallback
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/talenttrek';
    console.log('Connecting to MongoDB with URI:', mongoUri);

    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.log('MongoDB connection error:', err);
    process.exit(1);
  }
};

module.exports = connectDatabase;
