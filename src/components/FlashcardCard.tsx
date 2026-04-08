"use client";

import { useState } from "react";
import { Pencil, Trash2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import type { Flashcard } from "@/hooks/useFlashcards";

interface FlashcardCardProps {
  card: Flashcard;
  onEdit: (card: Flashcard) => void;
  onDelete: (id: string) => void;
}

/**
 * Individual flashcard component with flip animation.
 * Click to flip between question and answer sides.
 */
export default function FlashcardCard({ card, onEdit, onDelete }: FlashcardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  const difficultyClass =
    card.difficulty === "easy"
      ? "badge-easy"
      : card.difficulty === "hard"
      ? "badge-hard"
      : "badge-medium";

  return (
    <div className="perspective group animate-fade-in">
      <div
        className={`card-flip relative w-full min-h-[220px] cursor-pointer ${
          isFlipped ? "flipped" : ""
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front - Question */}
        <div className="card-front absolute inset-0 rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300 p-5 flex flex-col">
          {/* Top badges */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${difficultyClass}`}>
              {card.difficulty}
            </span>
            <div className="flex items-center gap-1">
              {card.isAIGenerated && (
                <span className="text-[11px] text-violet-500 dark:text-violet-400 flex items-center gap-0.5">
                  <Sparkles className="w-3 h-3" />
                  AI
                </span>
              )}
              <span className="text-[11px] text-gray-400 dark:text-gray-500 px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full truncate max-w-[100px]">
                {card.category}
              </span>
            </div>
          </div>

          {/* Question */}
          <div className="flex-1 flex items-center justify-center">
            <p className="text-center text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
              {card.question}
            </p>
          </div>

          {/* Hint */}
          <p className="text-center text-[11px] text-gray-400 dark:text-gray-500 mt-3">
            Click to reveal answer
          </p>

          {/* Action buttons (stop propagation to prevent flip) */}
          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(card);
              }}
              className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-all"
              aria-label="Edit flashcard"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card._id);
              }}
              className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all"
              aria-label="Delete flashcard"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Back - Answer */}
        <div className="card-back absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-sm hover:shadow-md transition-shadow duration-300 p-5 flex flex-col text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-white/20">
              Answer
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <p className="text-center font-medium leading-relaxed">
              {card.answer}
            </p>
          </div>

          {/* Explanation toggle */}
          {card.explanation && (
            <div className="mt-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowExplanation(!showExplanation);
                }}
                className="w-full flex items-center justify-center gap-1 text-[11px] text-white/70 hover:text-white transition-colors"
              >
                {showExplanation ? "Hide" : "Show"} explanation
                {showExplanation ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
              {showExplanation && (
                <div className="mt-2 p-3 bg-white/10 rounded-xl text-xs leading-relaxed animate-slide-down">
                  {card.explanation}
                </div>
              )}
            </div>
          )}

          <p className="text-center text-[11px] text-white/50 mt-2">
            Click to see question
          </p>
        </div>
      </div>
    </div>
  );
}
