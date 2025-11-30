import bcrypt from "bcrypt";
import User from "../models/User.js";

export const ensureDefaultAdmin = async () => {
  const username = process.env.DEFAULT_ADMIN_USERNAME || "admin";
  const email = process.env.DEFAULT_ADMIN_EMAIL || "admin@stutech.local";
  const password = process.env.DEFAULT_ADMIN_PASSWORD || "Admin@123";
  const displayName = process.env.DEFAULT_ADMIN_DISPLAYNAME || "Super Admin";

  const existing = await User.findOne({ username });
  if (existing) {
    if (existing.role !== "admin") {
      existing.role = "admin";
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
    role: "admin",
    status: "active",
  });

  console.log("Default admin account ready:");
  console.log(`  Username: ${username}`);
  console.log(`  Email   : ${email}`);
  console.log(`  Password: ${password}`);
};

