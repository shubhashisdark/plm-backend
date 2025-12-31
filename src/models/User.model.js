// src/models/User.model.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,  // ← This creates an index automatically
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    unique: true,  // ← This creates an index automatically
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
  
  lastLogin: {
    type: Date
  },
  
  agentProfile: {
    licenseNumber: String,
    experience: Number,
    rating: { type: Number, default: 0 },
    totalDeals: { type: Number, default: 0 }
  },
  
  refreshToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  
}, {
  timestamps: true
});

// REMOVE THESE DUPLICATE INDEXES (commented out)
// userSchema.index({ email: 1 });   ← Remove this
// userSchema.index({ phone: 1 });   ← Remove this

// Keep only these indexes
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

userSchema.methods.isPhoneVerifiedUser = function() {
  return this.isPhoneVerified;
};

userSchema.methods.updateLastLogin = function() {
  this.lastLogin = Date.now();
  return this.save();
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.refreshToken;
  delete user.passwordResetToken;
  delete user.passwordResetExpires;
  delete user.__v;
  return user;
};

userSchema.statics.findActiveUser = function(query) {
  return this.findOne({ ...query, isActive: true });
};

export default mongoose.model('User', userSchema);