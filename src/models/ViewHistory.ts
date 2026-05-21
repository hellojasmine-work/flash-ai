import mongoose, { Schema, Document, Model } from "mongoose";

export type HistoryAction = "view" | "study" | "discuss";

export interface IViewHistory extends Document {
  userId: mongoose.Types.ObjectId;
  flashcardId: mongoose.Types.ObjectId;
  flashcardQuestion: string;
  flashcardCategory: string;
  action: HistoryAction;
  createdAt: Date;
}

const ViewHistorySchema = new Schema<IViewHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    flashcardId: {
      type: Schema.Types.ObjectId,
      ref: "Flashcard",
      required: true,
    },
    flashcardQuestion: { type: String, required: true, maxlength: 500 },
    flashcardCategory: { type: String, required: true, maxlength: 50 },
    action: {
      type: String,
      enum: ["view", "study", "discuss"],
      required: true,
    },
  },
  { timestamps: true }
);

ViewHistorySchema.index({ userId: 1, createdAt: -1 });

const ViewHistory: Model<IViewHistory> =
  mongoose.models.ViewHistory ||
  mongoose.model<IViewHistory>("ViewHistory", ViewHistorySchema);

export default ViewHistory;
