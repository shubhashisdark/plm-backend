import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/User.model.js";
import { generateTokens } from "../utils/jwt.utils.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // ✅ FIX: callback URL MUST be absolute and NEVER undefined
      callbackURL:
        process.env.GOOGLE_CALLBACK_URL ||
        "https://plm-backend-jcby.onrender.com/api/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value;

        const fullName =
          profile.displayName ||
          `${profile.name?.givenName || ""} ${profile.name?.familyName || ""}`.trim() ||
          "Google User";

        if (!email) {
          return done(new Error("Google account has no email"), null);
        }

        // 1️⃣ Find user by email
        let user = await User.findOne({ email });

        // 2️⃣ Auto-create if not exists
        if (!user) {
          user = await User.create({
            fullName,
            email,
            googleId: profile.id,
            isEmailVerified: true,
            phone: null,
            isPhoneVerified: false,
          });
        }

        // 3️⃣ Attach googleId if missing
        if (!user.googleId) {
          user.googleId = profile.id;
          user.isEmailVerified = true;
          await user.save();
        }

        // 4️⃣ 🔑 GENERATE JWT TOKENS (THIS WAS MISSING)
        const { accessToken: jwtAccessToken } = generateTokens(
          user._id,
          user.role
        );

        // 5️⃣ Pass token to route
        return done(null, {
          user,
          accessToken: jwtAccessToken,
        });
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

export default passport;
