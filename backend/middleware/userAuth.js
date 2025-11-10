const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware to verify JWT token and extract user info
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ success: false, message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user and attach to request
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid token. User not found.' });
    }

    req.user = {
      id: user._id,
      userId: user.userId,
      email: user.email,
      role: user.role,
      name: user.name
    };
    
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token.' });
  }
};

// Middleware to ensure user can only access their own data
const ensureOwnData = (req, res, next) => {
  const requestedUserId = req.params.userId || req.body.userId || req.query.userId;
  
  // If no userId is specified in the request, allow (for general endpoints)
  if (!requestedUserId) {
    return next();
  }
  
  // Check if the requested userId matches the authenticated user's userId
  if (requestedUserId !== req.user.userId) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. You can only access your own data.' 
    });
  }
  
  next();
};

// Middleware to ensure only specific roles can access certain endpoints
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}` 
      });
    }
    next();
  };
};

module.exports = {
  authenticateUser,
  ensureOwnData,
  requireRole
};
