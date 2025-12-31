// controllers/auth.controller.js
import User from '../models/User.model.js';
import OTP from '../models/OTP.model.js';
import { generateOTP, sendOTP } from '../utils/otp.utils.js';
import { generateTokens, verifyRefreshToken } from '../utils/jwt.utils.js';
import AppError from '../utils/appError.js';
import catchAsync from '../utils/catchAsync.js';
import { OAuth2Client } from 'google-auth-library';

// ================= SEND OTP =================
export const sendOTPHandler = catchAsync(async (req, res, next) => {
  const { phone, type = 'signin' } = req.body;

  // Validate phone
  if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
    return next(new AppError('Invalid phone number', 400));
  }

  // Check if user exists for signin
  if (type === 'signin') {
    const user = await User.findActiveUser({ phone });
    if (!user) {
      return next(new AppError('User not found. Please sign up first.', 404));
    }
  }

  // Cleanup old OTPs
  await OTP.cleanupOldOTPs(phone);

  // Check rate limiting (max 3 OTPs per 15 minutes)
  const recentOTPs = await OTP.countDocuments({
    phone,
    createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
  });

  if (recentOTPs >= 3) {
    return next(new AppError('Too many OTP requests. Please try after 15 minutes.', 429));
  }

  // Generate and save OTP
  const otpCode = generateOTP();
  await OTP.create({
    phone,
    otp: otpCode,
    type
  });

  // Send OTP via SMS
  await sendOTP(phone, otpCode);

  res.status(200).json({
    success: true,
    message: 'OTP sent successfully',
    expiresIn: 600 // 10 minutes in seconds
  });
});

// ================= VERIFY OTP & SIGNIN =================
export const verifyOTPHandler = catchAsync(async (req, res, next) => {
  const { phone, otp } = req.body;

  // Validate input
  if (!phone || !otp) {
    return next(new AppError('Phone and OTP are required', 400));
  }

  // Find the most recent OTP
  const otpDoc = await OTP.findOne({
    phone,
    isUsed: false,
    expiresAt: { $gt: Date.now() }
  }).sort({ createdAt: -1 });

  if (!otpDoc) {
    return next(new AppError('OTP expired or invalid', 400));
  }

  // Check max attempts
  if (otpDoc.attempts >= 3) {
    return next(new AppError('Maximum verification attempts exceeded', 400));
  }

  // Verify OTP
  const isValid = await otpDoc.verifyOTP(otp);
  
  if (!isValid) {
    await otpDoc.incrementAttempts();
    return next(new AppError('Invalid OTP', 400));
  }

  // Mark OTP as used
  otpDoc.isUsed = true;
  await otpDoc.save();

  // Find or create user
  let user = await User.findActiveUser({ phone });
  
  if (!user) {
    return next(new AppError('User not found. Please sign up first.', 404));
  }

  // Update phone verification status
  user.isPhoneVerified = true;
  await user.updateLastLogin();

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);

  // Save refresh token to user
  user.refreshToken = refreshToken;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: user.toJSON(),
      accessToken,
      refreshToken
    }
  });
});

// ================= SIGNUP =================
export const signup = catchAsync(async (req, res, next) => {
  const { fullName, email, phone, role = 'Customer' } = req.body;

  // Validate required fields
  if (!fullName || !email || !phone) {
    return next(new AppError('Please provide all required fields', 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { phone }]
  });

  if (existingUser) {
    if (existingUser.email === email) {
      return next(new AppError('Email already registered', 400));
    }
    if (existingUser.phone === phone) {
      return next(new AppError('Phone number already registered', 400));
    }
  }

  // Create user
  const user = await User.create({
    fullName,
    email,
    phone,
    role
  });

  // Send OTP for phone verification
  const otpCode = generateOTP();
  await OTP.create({
    phone,
    otp: otpCode,
    type: 'signup'
  });

  await sendOTP(phone, otpCode);

  res.status(201).json({
    success: true,
    message: 'Account created successfully. Please verify your phone.',
    data: {
      userId: user._id,
      requiresOTP: true
    }
  });
});

// ================= GOOGLE AUTH =================
export const googleAuth = catchAsync(async (req, res, next) => {
  const { idToken, role = 'Customer' } = req.body;

  // Verify Google token
  const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

  let payload;
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    payload = ticket.getPayload();
  } catch (error) {
    return next(new AppError('Invalid Google token', 401));
  }

  const { sub: googleId, email, name } = payload;

  // Find or create user
  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (!user) {
    user = await User.create({
      fullName: name,
      email,
      googleId,
      phone: '', // Will be added later
      role,
      isEmailVerified: true
    });
  } else {
    if (!user.googleId) {
      user.googleId = googleId;
    }
    user.isEmailVerified = true;
    await user.updateLastLogin();
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokens(user._id, user.role);
  user.refreshToken = refreshToken;
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Google authentication successful',
    data: {
      user: user.toJSON(),
      accessToken,
      refreshToken,
      requiresPhone: !user.phone
    }
  });
});

// ================= REFRESH TOKEN =================
export const refreshTokenHandler = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new AppError('Refresh token required', 400));
  }

  // Verify refresh token
  const decoded = verifyRefreshToken(refreshToken);

  // Find user
  const user = await User.findById(decoded.userId);
  if (!user || user.refreshToken !== refreshToken) {
    return next(new AppError('Invalid refresh token', 401));
  }

  // Generate new tokens
  const tokens = generateTokens(user._id, user.role);

  // Update refresh token
  user.refreshToken = tokens.refreshToken;
  await user.save();

  res.status(200).json({
    success: true,
    data: tokens
  });
});

// ================= LOGOUT =================
export const logout = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.userId);
  
  if (user) {
    user.refreshToken = undefined;
    await user.save();
  }

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ================= GET CURRENT USER =================
export const getCurrentUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.userId);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { user: user.toJSON() }
  });
});