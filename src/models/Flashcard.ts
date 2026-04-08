import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * A single discussion note (message) on a flashcard.
 */
export interface INote {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

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
  notes: INote[];
  createdAt: Date;
  updatedAt: Date;
}

const NoteSchema = new Schema<INote>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: [5000, "Note cannot exceed 5000 characters"],
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

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
    notes: {
      type: [NoteSchema],
      default: [],
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
