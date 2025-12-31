// models/OTP.model.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const otpSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    match: [/^[6-9]\d{9}$/, 'Invalid phone number']
  },
  
  otp: {
    type: String,
    required: true
  },
  
  type: {
    type: String,
    enum: ['signin', 'signup', 'verification'],
    default: 'signin'
  },
  
  attempts: {
    type: Number,
    default: 0
  },
  
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
  },
  
  isUsed: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for automatic document deletion
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Hash OTP before saving
otpSchema.pre('save', async function(next) {
  if (!this.isModified('otp')) return next();
  
  this.otp = await bcrypt.hash(this.otp, 12);
  next();
});

// Method to verify OTP
otpSchema.methods.verifyOTP = async function(candidateOTP) {
  return await bcrypt.compare(candidateOTP, this.otp);
};

// Method to check if OTP is expired
otpSchema.methods.isExpired = function() {
  return Date.now() > this.expiresAt;
};

// Increment attempt counter
otpSchema.methods.incrementAttempts = async function() {
  this.attempts += 1;
  await this.save();
};

// Static method to cleanup old OTPs
otpSchema.statics.cleanupOldOTPs = async function(phone) {
  await this.deleteMany({
    phone,
    $or: [
      { isUsed: true },
      { expiresAt: { $lt: new Date() } }
    ]
  });
};

export default mongoose.model('OTP', otpSchema);