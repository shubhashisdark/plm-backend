// middleware/validation.middleware.js
import { body, validationResult } from 'express-validator';

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  next();
};

export const validateSignup = [
  body('fullName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters')
    .matches(/^[a-zA-Z\s]+$/)
    .withMessage('Full name can only contain letters and spaces'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),
  
  body('phone')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number'),
  
  body('role')
    .optional()
    .isIn(['Customer', 'Agent', 'Admin'])
    .withMessage('Invalid role selected'),
  
  validate
];

export const validatePhone = [
  body('phone')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number'),
  
  body('type')
    .optional()
    .isIn(['signin', 'signup', 'verification'])
    .withMessage('Invalid OTP type'),
  
  validate
];

export const validateOTP = [
  body('phone')
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid phone number'),
  
  body('otp')
    .trim()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits')
    .isNumeric()
    .withMessage('OTP must contain only numbers'),
  
  validate
];