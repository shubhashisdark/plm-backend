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
  passport.authenticate("google", {
    scope: ["profile", "email"],
  })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/signin",
  }),
  (req, res) => {
    const token = req.user.accessToken;
    res.redirect(
      `http://localhost:5173/oauth-success?token=${token}`
    );
  }
);

// ================= PROTECTED ROUTES =================
router.post("/logout", protect, authController.logout);
router.get("/me", protect, authController.getCurrentUser);

export default router;
