import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Flashcard from "@/models/Flashcard";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET /api/flashcards
 * Retrieve all flashcards, optionally filtered by category or difficulty.
 * Supports query params: ?category=X&difficulty=Y&search=Z
 */
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const search = searchParams.get("search");

    // Build dynamic filter
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filter: any = {};
    if (category && category !== "all") filter.category = category;
    if (difficulty && difficulty !== "all") filter.difficulty = difficulty;
    if (search) {
      filter.$or = [
        { question: { $regex: search, $options: "i" } },
        { answer: { $regex: search, $options: "i" } },
      ];
    }

    const flashcards = await Flashcard.find(filter).sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: flashcards }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("GET /api/flashcards error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch flashcards" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/flashcards
 * Create a new flashcard.
 * Body: { question, answer, explanation?, category, difficulty?, isAIGenerated? }
 */
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();

    // Validate required fields
    if (!body.question || !body.answer || !body.category) {
      return NextResponse.json(
        { success: false, error: "Question, answer, and category are required" },
        { status: 400 }
      );
    }

    // Tag the card with the logged-in creator, if any.
    const session = getSessionFromRequest(request);

    const flashcard = await Flashcard.create({
      question: body.question,
      answer: body.answer,
      explanation: body.explanation || "",
      category: body.category,
      difficulty: body.difficulty || "medium",
      isAIGenerated: body.isAIGenerated || false,
      createdBy: session?.userId || null,
    });

    return NextResponse.json({ success: true, data: flashcard }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("POST /api/flashcards error:", message);

    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to create flashcard" },
      { status: 500 }
    );
  }
}
