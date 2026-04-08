import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Flashcard document interface
 */
export interface IFlashcard extends Document {
  question: string;
  answer: string;
  explanation: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  isAIGenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Flashcard documents.
 * Stores question-answer pairs with metadata for the learning app.
 */
const FlashcardSchema = new Schema<IFlashcard>(
  {
    question: {
      type: String,
      required: [true, "Question is required"],
      trim: true,
      maxlength: [500, "Question cannot exceed 500 characters"],
    },
    answer: {
      type: String,
      required: [true, "Answer is required"],
      trim: true,
      maxlength: [2000, "Answer cannot exceed 2000 characters"],
    },
    explanation: {
      type: String,
      default: "",
      trim: true,
      maxlength: [3000, "Explanation cannot exceed 3000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
      maxlength: [50, "Category cannot exceed 50 characters"],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add index for efficient category-based queries
FlashcardSchema.index({ category: 1 });
FlashcardSchema.index({ createdAt: -1 });

// Prevent model recompilation in development (hot reload)
const Flashcard: Model<IFlashcard> =
  mongoose.models.Flashcard ||
  mongoose.model<IFlashcard>("Flashcard", FlashcardSchema);

export default Flashcard;
