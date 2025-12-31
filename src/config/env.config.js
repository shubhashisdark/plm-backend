// config/env.config.js
import 'dotenv/config';

const config = {
  // Server Configuration
  server: {
    port: process.env.PORT || 5000,
    env: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173'
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/zestate'
  },

  // JWT Configuration
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },

  // Google OAuth Configuration
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET
  },

  // SMS Configuration
  sms: {
    provider: process.env.SMS_PROVIDER || 'console',
    msg91: {
      authKey: process.env.MSG91_AUTH_KEY,
      templateId: process.env.MSG91_TEMPLATE_ID
    },
    twilio: {
      accountSid: process.env.TWILIO_ACCOUNT_SID,
      authToken: process.env.TWILIO_AUTH_TOKEN,
      phoneNumber: process.env.TWILIO_PHONE_NUMBER
    }
  },

  // Security Configuration
  security: {
    rateLimitWindow: 15 * 60 * 1000, // 15 minutes
    rateLimitMax: 100,
    bcryptSaltRounds: 12
  },

  // OTP Configuration
  otp: {
    expiryMinutes: 10,
    maxAttempts: 3,
    maxRequestsPer15Min: 3
  }
};

// Validate required environment variables
const validateConfig = () => {
  const required = [
    'JWT_ACCESS_SECRET',
    'JWT_REFRESH_SECRET',
    'MONGODB_URI'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(key => console.error(`   - ${key}`));
    process.exit(1);
  }

  // Validate JWT secrets length
  if (process.env.JWT_ACCESS_SECRET.length < 32) {
    console.error('❌ JWT_ACCESS_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  if (process.env.JWT_REFRESH_SECRET.length < 32) {
    console.error('❌ JWT_REFRESH_SECRET must be at least 32 characters long');
    process.exit(1);
  }

  console.log('✅ Environment configuration validated');
};

// Run validation in production
if (config.server.env === 'production') {
  validateConfig();
}

export default config;