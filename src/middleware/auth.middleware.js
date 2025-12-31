// middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import config from '../config/env.config.js';

// Protect routes - verify JWT token
export const protect = catchAsync(async (req, res, next) => {
  // Get token from header
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to access this route.', 401));
  }

  // Verify token
  let decoded;
  try {
    decoded = jwt.verify(token, config.jwt.accessSecret);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    return next(new AppError('Invalid token. Please log in again.', 401));
  }

  // Check if user still exists
  const user = await User.findById(decoded.userId);
  if (!user || !user.isActive) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  // Grant access to protected route
  req.user = {
    userId: user._id,
    role: user.role,
    email: user.email
  };
  
  next();
});

// Restrict to specific roles
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};

// Check if phone is verified
export const requirePhoneVerification = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.userId);
  
  if (!user.isPhoneVerified) {
    return next(new AppError('Please verify your phone number first', 403));
  }
  
  next();
});