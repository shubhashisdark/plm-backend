import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: 2,
    maxlength: 50
  },

  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },

  phone: {
    type: String,
    unique: true,
    sparse: true,
    required: function () {
      return !this.googleId;
    },
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
  },

  role: {
    type: String,
    enum: ['Customer', 'Agent', 'Admin'],
    default: 'Customer'
  },

  googleId: {
    type: String,
    sparse: true
  },

  isEmailVerified: {
    type: Boolean,
    default: false
  },

  isPhoneVerified: {
    type: Boolean,
    default: false
  },

  isActive: {
    type: Boolean,
    default: true
  },

  lastLogin: Date,

  agentProfile: {
    licenseNumber: String,
    experience: Number,
    rating: { type: Number, default: 0 },
    totalDeals: { type: Number, default: 0 }
  },

  refreshToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,

}, { timestamps: true });

// 🔹 Indexes
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// 🔹 Static method
userSchema.statics.findActiveUser = function (query) {
  return this.findOne({ ...query, isActive: true });
};

// 🔹 Instance method (FIXES YOUR ERROR)
userSchema.methods.updateLastLogin = function () {
  this.lastLogin = new Date();
  return this.save();
};

export default mongoose.model('User', userSchema);
