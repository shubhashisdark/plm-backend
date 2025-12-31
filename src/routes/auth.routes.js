// routes/auth.routes.js
import express from 'express';
import * as authController from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateSignup, validateOTP, validatePhone } from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.post('/signup', validateSignup, authController.signup);
router.post('/send-otp', validatePhone, authController.sendOTPHandler);
router.post('/verify-otp', validateOTP, authController.verifyOTPHandler);
router.post('/google', authController.googleAuth);
router.post('/refresh-token', authController.refreshTokenHandler);

// Protected routes
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getCurrentUser);

export default router;