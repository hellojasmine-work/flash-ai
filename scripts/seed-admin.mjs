/**
 * Creates a default admin user.
 * Run with: node scripts/seed-admin.mjs
 *
 * Requires MONGODB_URI in .env.local
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI not found. Create a .env.local file.");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function seedAdmin() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected!");

    const adminEmail = "admin@flashmind.com";
    const adminPassword = "admin123";

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log(`Admin user already exists (${adminEmail}). Skipping.`);
    } else {
      const hashed = await bcrypt.hash(adminPassword, 12);
      await User.create({
        username: "admin",
        email: adminEmail,
        password: hashed,
        role: "admin",
      });
      console.log("Admin user created:");
      console.log(`  Email:    ${adminEmail}`);
      console.log(`  Password: ${adminPassword}`);
      console.log("  Role:     admin");
    }

    await mongoose.disconnect();
    console.log("Done.");
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

seedAdmin();
