import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['admin', 'member'],
      default: 'member',
    },
    memberCode: {
      type: String,
      unique: true,
      sparse: true, // allows null values without violating uniqueness
    },
    phone: { type: String, trim: true },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    dateOfBirth: { type: Date },
    address: { type: String, trim: true },
    profileImage: { type: String, default: '' },
    currentPlan: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MembershipPlan',
      default: null,
    },
    planExpiresAt: {
      type: Date,
      default: null,
    },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

// Hash password before saving, only if it was changed
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Instance method to compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;