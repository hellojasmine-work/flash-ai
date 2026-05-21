import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ViewHistory from "@/models/ViewHistory";
import { getSessionFromRequest } from "@/lib/auth";

/**
 * GET /api/view-history
 * User: returns their own history (paginated).
 * Admin: returns all users' history with username populated.
 */
export async function GET(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const limit = Math.min(50, Number(searchParams.get("limit") || "20"));
    const skip = (page - 1) * limit;

    let query: Record<string, unknown> = {};
    if (session.role !== "admin") {
      query = { userId: session.userId };
    }

    const [items, total] = await Promise.all([
      ViewHistory.find(query)
        .populate("userId", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      ViewHistory.countDocuments(query),
    ]);

    return NextResponse.json({ success: true, data: items, total, page, limit });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

/**
 * POST /api/view-history
 * Log a view/study/discuss action for a flashcard.
 */
export async function POST(request: NextRequest) {
  try {
    const session = getSessionFromRequest(request);
    if (!session) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { flashcardId, flashcardQuestion, flashcardCategory, action } = body;

    if (!flashcardId || !flashcardQuestion || !flashcardCategory || !action) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const entry = await ViewHistory.create({
      userId: session.userId,
      flashcardId,
      flashcardQuestion,
      flashcardCategory,
      action,
    });

    return NextResponse.json({ success: true, data: entry }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
