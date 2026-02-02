import express from "express";
import passport from "passport";
import * as authController from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import {
  validateSignup,
  validateOTP,
  validatePhone,
} from "../middleware/validation.middleware.js";

const router = express.Router();

// ================= PUBLIC ROUTES =================
router.post("/signup", validateSignup, authController.signup);
router.post("/send-otp", validatePhone, authController.sendOTPHandler);
router.post("/verify-otp", validateOTP, authController.verifyOTPHandler);
router.post("/refresh-token", authController.refreshTokenHandler);

// ================= GOOGLE OAUTH (REDIRECT BASED) =================
router.get(
  "/google",
  (req, res, next) => {
    // 🔥 FIX: Capture frontend URL from query param to pass through OAuth flow
    const frontendUrl = req.query.frontend || 'http://localhost:5173';
    
    // Enhanced strategy to pass frontend URL through the flow
    passport.authenticate("google", {
      scope: ["profile", "email"],
      state: Buffer.from(JSON.stringify({ frontendUrl })).toString('base64'),
    })(req, res, next);
  }
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/signin",
  }),
  (req, res) => {
    const token = req.user.accessToken;

    // 🔥 FIX: Extract frontend URL from the state parameter (if available)
    let frontendURL = process.env.FRONTEND_URL || "https://plm-frontend-prod-cqxect6wb-allinonetech.vercel.app";
    
    try {
      if (req.query.state) {
        const decodedState = JSON.parse(Buffer.from(req.query.state, 'base64').toString());
        if (decodedState.frontendUrl) {
          frontendURL = decodedState.frontendUrl;
        }
      }
    } catch (error) {
      console.error('❌ [OAuth Callback] Failed to parse state:', error);
    }

    console.log('🔍 [OAuth Callback] State:', req.query.state);
    console.log('🔍 [OAuth Callback] Redirecting to:', `${frontendURL}/oauth-success?token=${token}`);

    res.redirect(`${frontendURL}/oauth-success?token=${token}`);
  }
);

// ================= PROTECTED ROUTES =================
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getCurrentUser);

export default router;
