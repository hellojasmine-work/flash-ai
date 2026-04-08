import { NextRequest, NextResponse } from "next/server";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import connectDB from "@/lib/mongodb";
import Flashcard from "@/models/Flashcard";

/**
 * POST /api/ai/generate
 * Use AI to generate flashcards from a given topic.
 * Body: { topic: string, count?: number, difficulty?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "AI features require an OpenAI API key. Please configure OPENAI_API_KEY in your environment variables.",
        },
        { status: 503 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { topic, count = 5, difficulty = "medium" } = body;

    if (!topic) {
      return NextResponse.json(
        { success: false, error: "Topic is required" },
        { status: 400 }
      );
    }

    // Clamp count between 1 and 10
    const cardCount = Math.min(Math.max(Number(count), 1), 10);

    // Generate flashcards using AI
    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt: `Generate ${cardCount} flashcard(s) about "${topic}" at ${difficulty} difficulty level.

Each flashcard must have:
- A clear, specific question
- A concise but complete answer
- A detailed explanation that helps the learner understand the concept deeply

Return ONLY a valid JSON array (no markdown, no code fences) with objects in this exact format:
[
  {
    "question": "...",
    "answer": "...",
    "explanation": "..."
  }
]

Make questions progressively more challenging. Ensure variety in question types (definition, application, comparison, analysis).`,
      temperature: 0.7,
    });

    // Parse the AI response
    let cards;
    try {
      // Strip potential markdown code fences
      const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      cards = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", text);
      return NextResponse.json(
        { success: false, error: "AI returned invalid format. Please try again." },
        { status: 500 }
      );
    }

    // Validate and save each card to the database
    const savedCards = await Promise.all(
      cards.map(
        async (card: { question: string; answer: string; explanation?: string }) => {
          return Flashcard.create({
            question: card.question,
            answer: card.answer,
            explanation: card.explanation || "",
            category: topic,
            difficulty,
            isAIGenerated: true,
          });
        }
      )
    );

    return NextResponse.json(
      { success: true, data: savedCards },
      { status: 201 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error";
    console.error("POST /api/ai/generate error:", message);
    return NextResponse.json(
      { success: false, error: "AI generation failed. Please try again." },
      { status: 500 }
    );
  }
}
