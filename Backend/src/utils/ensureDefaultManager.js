import bcrypt from "bcrypt";
import User from "../models/User.js";

export const ensureDefaultManager = async () => {
  const username = process.env.DEFAULT_MANAGER_USERNAME || "manager";
  const email = process.env.DEFAULT_MANAGER_EMAIL || "manager@stutech.local";
  const password = process.env.DEFAULT_MANAGER_PASSWORD || "Manager@123";
  const displayName = process.env.DEFAULT_MANAGER_DISPLAYNAME || "Quản lý Đoàn Hội";

  const existing = await User.findOne({ username });
  if (existing) {
    if (existing.role !== "manager") {
      existing.role = "manager";
      await existing.save();
    }
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.create({
    username,
    email,
    hashedPassword,
    displayName,
    role: "manager",
    status: "active",
  });

  console.log("Default manager account ready:");
  console.log(`  Username: ${username}`);
  console.log(`  Email   : ${email}`);
  console.log(`  Password: ${password}`);
};

