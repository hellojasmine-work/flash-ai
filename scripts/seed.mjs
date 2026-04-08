/**
 * Database seed script.
 * Run with: npm run seed
 *
 * Requires MONGODB_URI in .env.local
 */

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import mongoose from "mongoose";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI not found. Create a .env.local file.");
  process.exit(1);
}

// Define schema inline for the seed script
const FlashcardSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    explanation: { type: String, default: "" },
    category: { type: String, required: true },
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    isAIGenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Flashcard = mongoose.model("Flashcard", FlashcardSchema);

async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected!");

    // Load sample data
    const dataPath = join(__dirname, "..", "data", "flashcards_export.json");
    const data = JSON.parse(readFileSync(dataPath, "utf-8"));

    // Clear existing data
    await Flashcard.deleteMany({});
    console.log("Cleared existing flashcards.");

    // Insert seed data
    const result = await Flashcard.insertMany(data);
    console.log(`Seeded ${result.length} flashcards successfully!`);

    await mongoose.disconnect();
    console.log("Done.");
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
