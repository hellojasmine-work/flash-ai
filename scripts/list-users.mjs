/**
 * Diagnostic: list every user in the database with their role.
 * Run with: npm run list-users
 *
 * Requires MONGODB_URI in .env.local
 */

import mongoose from "mongoose";
import { config } from "dotenv";
config({ path: ".env.local" });

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI not found. Create a .env.local file.");
  process.exit(1);
}

const UserSchema = new mongoose.Schema(
  {
    username: String,
    email: String,
    password: String,
    role: String,
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function listUsers() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);

    // Show which database we're actually connected to
    const dbName = mongoose.connection.db.databaseName;
    console.log(`Connected to database: ${dbName}\n`);

    const users = await User.find().select("-password").lean();

    if (users.length === 0) {
      console.log("(no users in this database)");
    } else {
      console.log(`Found ${users.length} user(s):\n`);
      users.forEach((u, i) => {
        console.log(`${i + 1}. ${u.email}`);
        console.log(`   username: ${u.username}`);
        console.log(`   role:     ${u.role}`);
        console.log(`   created:  ${u.createdAt}`);
        console.log();
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

listUsers();
