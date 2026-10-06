import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'admin'], default: 'student', index: true },
    avatarUrl: { type: String },
    bio: { type: String, maxLength: 500 },
    socials: {
      linkedin: { type: String },
      github: { type: String },
      twitter: { type: String },
      instagram: { type: String }
    },
    preferences: {
      theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
      notifications: { type: Boolean, default: true },
      language: { type: String, default: 'en' }
    },
    security: {
      twoFactorEnabled: { type: Boolean, default: false },
      lastLogin: { type: Date }
    },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model('User', userSchema);
