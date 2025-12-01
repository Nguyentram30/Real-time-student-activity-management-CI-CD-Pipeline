import dotenv from "dotenv";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDB } from "../libs/db.js";
import User from "../models/User.js";

dotenv.config();

const [, , username, email, password, displayNameArg, roleArg] = process.argv;

if (!username || !email || !password) {
  console.error("Usage: node src/scripts/createAdmin.js <username> <email> <password> [displayName] [role]");
  process.exit(1);
}

const displayName = displayNameArg || username;
const role = roleArg || "admin";

const run = async () => {
  try {
    await connectDB();

    const existing = await User.findOne({ username });
    const hashedPassword = await bcrypt.hash(password, 10);

    if (existing) {
      existing.email = email;
      existing.displayName = displayName;
      existing.role = role;
      existing.hashedPassword = hashedPassword;
      existing.emailVerified = true;
      existing.isActive = true;
      existing.status = "active";
      await existing.save();
      console.log(`Updated user ${username} with role ${role}.`);
    } else {
      await User.create({
        username,
        email,
        hashedPassword,
        displayName,
        role,
        emailVerified: true,
        isActive: true,
        status: "active",
      });
      console.log(`Created user ${username} with role ${role}.`);
    }
  } catch (error) {
    console.error("Failed to create admin user:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();

