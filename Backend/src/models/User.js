import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    displayName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      sparse: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    studentCode: {
      type: String,
      sparse: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    class: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    avatar: {
      type: String,
    },
    avatarUrl: {
      type: String,
    },
    avatarId: {
      type: String,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    emailVerifyToken: {
      type: String,
    },
    emailVerifyTokenExpiresAt: {
      type: Date,
    },
    unverifiedExpiresAt: {
      type: Date,
    },
    passwordResetToken: {
      type: String,
    },
    passwordResetTokenExpiresAt: {
      type: Date,
    },
    role: {
      type: String,
      enum: ["student", "manager", "admin", "guest"],
      default: "guest",
    },
    lastLoginAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["active", "locked"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

userSchema.index(
  { unverifiedExpiresAt: 1 },
  {
    expireAfterSeconds: 0,
    partialFilterExpression: { emailVerified: false },
  }
);

const User = mongoose.model("User", userSchema);
export default User;