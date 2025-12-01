import dotenv from "dotenv";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import { connectDB } from "../libs/db.js";
import User from "../models/User.js";

dotenv.config();

const [, , username, email, password, displayNameArg] = process.argv;

if (!username || !email || !password) {
  console.error("Usage: node src/scripts/createManager.js <username> <email> <password> [displayName]");
  console.error("Example: node src/scripts/createManager.js manager manager@stutech.local Manager@123 \"Quản lý Đoàn Hội\"");
  process.exit(1);
}

const displayName = displayNameArg || username;
const role = "manager";

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
      existing.status = "active";
      existing.emailVerified = true;
      existing.isActive = true;
      await existing.save();
      console.log(`✅ Updated user ${username} with role ${role}.`);
    } else {
      await User.create({
        username,
        email,
        hashedPassword,
        displayName,
        role,
        status: "active",
        emailVerified: true,
        isActive: true,
      });
      console.log(`✅ Created manager user ${username} successfully.`);
    }

    console.log("\n📋 Manager Account Details:");
    console.log(`   Username: ${username}`);
    console.log(`   Email   : ${email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Role    : ${role}`);
    console.log(`   Name    : ${displayName}`);
  } catch (error) {
    console.error("❌ Failed to create manager user:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

run();

