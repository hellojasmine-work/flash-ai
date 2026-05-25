import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Flashcard from "@/models/Flashcard";
import mongoose from "mongoose";

/**
 * GET /api/flashcards/:id
 * Retrieve a single flashcard by ID.
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    // Validate ObjectId format
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid flashcard ID" },
        { status: 400 }
      );
    }

    const flashcard = await Flashcard.findById(params.id);

    if (!flashcard) {
      return NextResponse.json(
        { success: false, error: "Flashcard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: flashcard }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("GET /api/flashcards/:id error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to fetch flashcard" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/flashcards/:id
 * Update an existing flashcard.
 * Body: { question?, answer?, explanation?, category?, difficulty? }
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid flashcard ID" },
        { status: 400 }
      );
    }

    const body = await request.json();

    const flashcard = await Flashcard.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    );

    if (!flashcard) {
      return NextResponse.json(
        { success: false, error: "Flashcard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: flashcard }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("PUT /api/flashcards/:id error:", message);

    if (error instanceof Error && error.name === "ValidationError") {
      return NextResponse.json(
        { success: false, error: message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to update flashcard" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/flashcards/:id
 * Delete a flashcard by ID.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid flashcard ID" },
        { status: 400 }
      );
    }

    const flashcard = await Flashcard.findByIdAndDelete(params.id);

    if (!flashcard) {
      return NextResponse.json(
        { success: false, error: "Flashcard not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, message: "Flashcard deleted successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("DELETE /api/flashcards/:id error:", message);
    return NextResponse.json(
      { success: false, error: "Failed to delete flashcard" },
      { status: 500 }
    );
  }
}
