// utils/otp.utils.js
import crypto from 'crypto';
import axios from 'axios';
import config from '../config/env.config.js';

// Generate 6-digit OTP
export const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Send OTP via SMS
export const sendOTP = async (phone, otp) => {
  try {
    const provider = config.sms.provider;

    // MSG91 (Recommended for India)
    if (provider === 'msg91') {
      await axios.get('https://api.msg91.com/api/v5/otp', {
        params: {
          authkey: config.sms.msg91.authKey,
          mobile: phone,
          otp: otp,
          template_id: config.sms.msg91.templateId
        }
      });
      
      console.log(`📱 OTP sent via MSG91 to ${phone}`);
    }
    
    // Twilio (International)
    else if (provider === 'twilio') {
      const twilio = await import('twilio');
      const client = twilio.default(
        config.sms.twilio.accountSid,
        config.sms.twilio.authToken
      );

      await client.messages.create({
        body: `Your Zestate verification code is: ${otp}. Valid for ${config.otp.expiryMinutes} minutes.`,
        from: config.sms.twilio.phoneNumber,
        to: `+91${phone}`
      });
      
      console.log(`📱 OTP sent via Twilio to ${phone}`);
    }
    
    // Development mode - log to console
    else {
      console.log(`
╔════════════════════════════════════╗
║         OTP GENERATED              ║
╠════════════════════════════════════╣
║  Phone: ${phone.padEnd(24)} ║
║  OTP:   ${otp.padEnd(24)} ║
║  Valid: ${config.otp.expiryMinutes} minutes${' '.repeat(16)} ║
╚════════════════════════════════════╝
      `);
    }

    return true;
  } catch (error) {
    console.error('❌ Error sending OTP:', error.message);
    throw new Error('Failed to send OTP. Please try again.');
  }
};