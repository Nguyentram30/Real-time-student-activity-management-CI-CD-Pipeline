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
    role: {
      type: String,
      enum: ["student", "manager", "admin"],
      default: "student",
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

const User = mongoose.model("User", userSchema);
export default User;