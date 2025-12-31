// config/constants.js

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'Customer',
  AGENT: 'Agent',
  ADMIN: 'Admin'
};

// OTP Types
export const OTP_TYPES = {
  SIGNIN: 'signin',
  SIGNUP: 'signup',
  VERIFICATION: 'verification'
};

// Token Types
export const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh'
};

// HTTP Status Codes
export const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500
};

// Error Messages
export const ERROR_MESSAGES = {
  // Auth Errors
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_NOT_FOUND: 'User not found',
  USER_EXISTS: 'User already exists',
  EMAIL_EXISTS: 'Email already registered',
  PHONE_EXISTS: 'Phone number already registered',
  UNAUTHORIZED: 'You are not authorized to access this resource',
  TOKEN_EXPIRED: 'Token has expired',
  INVALID_TOKEN: 'Invalid token',
  
  // OTP Errors
  OTP_EXPIRED: 'OTP has expired',
  OTP_INVALID: 'Invalid OTP',
  OTP_MAX_ATTEMPTS: 'Maximum OTP verification attempts exceeded',
  OTP_RATE_LIMIT: 'Too many OTP requests. Please try after 15 minutes',
  
  // Validation Errors
  INVALID_INPUT: 'Invalid input data',
  REQUIRED_FIELDS: 'Please provide all required fields',
  INVALID_EMAIL: 'Please provide a valid email address',
  INVALID_PHONE: 'Please provide a valid phone number',
  
  // Server Errors
  INTERNAL_ERROR: 'Something went wrong',
  SERVICE_UNAVAILABLE: 'Service temporarily unavailable'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  SIGNUP_SUCCESS: 'Account created successfully',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logged out successfully',
  OTP_SENT: 'OTP sent successfully',
  OTP_VERIFIED: 'OTP verified successfully',
  PHONE_VERIFIED: 'Phone number verified successfully',
  EMAIL_VERIFIED: 'Email verified successfully'
};

// Validation Patterns
export const VALIDATION_PATTERNS = {
  PHONE: /^[6-9]\d{9}$/,
  EMAIL: /^\S+@\S+\.\S+$/,
  NAME: /^[a-zA-Z\s]+$/
};

// Validation Limits
export const VALIDATION_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 50,
  OTP_LENGTH: 6,
  PASSWORD_MIN: 8
};

// Time Constants (in milliseconds)
export const TIME = {
  OTP_EXPIRY: 10 * 60 * 1000,        // 10 minutes
  RATE_LIMIT_WINDOW: 15 * 60 * 1000, // 15 minutes
  TOKEN_EXPIRY: 15 * 60 * 1000,      // 15 minutes
  REFRESH_EXPIRY: 7 * 24 * 60 * 60 * 1000  // 7 days
};