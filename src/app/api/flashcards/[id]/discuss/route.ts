import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import connectDB from "@/lib/mongodb";
import Flashcard from "@/models/Flashcard";
import mongoose from "mongoose";

/**
 * POST /api/flashcards/:id/discuss
 * Send a message to discuss a flashcard with AI.
 * The user message and AI response are saved as notes on the card.
 * Body: { message: string }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: "AI features require an OpenAI API key." },
        { status: 503 }
      );
    }

    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { success: false, error: "Invalid flashcard ID" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { message } = body;

    if (!message || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "Message is required" },
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

    // Build conversation history for AI context
    const conversationHistory = flashcard.notes
      .map((n) => `${n.role === "user" ? "Student" : "Tutor"}: ${n.content}`)
      .join("\n");

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `You are a helpful tutor discussing a flashcard with a student. Be concise but thorough. Keep responses under 200 words.

Flashcard context:
- Question: ${flashcard.question}
- Answer: ${flashcard.answer}
- Category: ${flashcard.category}
- Difficulty: ${flashcard.difficulty}
${flashcard.explanation ? `- Explanation: ${flashcard.explanation}` : ""}

${conversationHistory ? `Previous discussion:\n${conversationHistory}\n` : ""}
Student: ${message.trim()}

Respond helpfully as the tutor:`,
      temperature: 0.7,
    });

    // Save both messages as notes
    const userNote = { role: "user" as const, content: message.trim(), createdAt: new Date() };
    const aiNote = { role: "assistant" as const, content: text.trim(), createdAt: new Date() };

    flashcard.notes.push(userNote, aiNote);
    await flashcard.save();

    return NextResponse.json({ success: true, data: flashcard }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("POST /api/flashcards/:id/discuss error:", message);
    return NextResponse.json(
      { success: false, error: "Discussion failed. Please try again." },
      { status: 500 }
    );
  }
}
