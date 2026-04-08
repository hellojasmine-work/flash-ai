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
        <div className="card-front absolute inset-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft hover:shadow-card-hover transition-all duration-300 p-5 flex flex-col">
          {/* Top badges */}
          <div className="flex items-center justify-between mb-3">
            <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${difficultyClass}`}>
              {card.difficulty}
            </span>
            <div className="flex items-center gap-1.5">
              {card.isAIGenerated && (
                <span className="text-[11px] text-brand-500 dark:text-brand-400 flex items-center gap-0.5 font-medium">
                  <Sparkles className="w-3 h-3" />
                  AI
                </span>
              )}
              <span className="text-[11px] text-slate-500 dark:text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full truncate max-w-[100px] font-medium">
                {card.category}
              </span>
            </div>
          </div>

          {/* Question */}
          <div className="flex-1 flex items-center justify-center px-2">
            <p className="text-center text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
              {card.question}
            </p>
          </div>

          {/* Hint */}
          <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-3 font-medium">
            Click to reveal answer
          </p>

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(card);
              }}
              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-brand-600 hover:border-brand-300 dark:hover:text-brand-400 dark:hover:border-brand-600 transition-all shadow-sm"
              aria-label="Edit flashcard"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card._id);
              }}
              className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 hover:text-rose-500 hover:border-rose-300 dark:hover:text-rose-400 dark:hover:border-rose-600 transition-all shadow-sm"
              aria-label="Delete flashcard"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Back - Answer */}
        <div className="card-back absolute inset-0 rounded-2xl bg-brand-600 dark:bg-brand-700 shadow-soft hover:shadow-glow transition-all duration-300 p-5 flex flex-col text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm">
              Answer
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center px-2">
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
                className="w-full flex items-center justify-center gap-1 text-[11px] text-white/70 hover:text-white transition-colors font-medium"
              >
                {showExplanation ? "Hide" : "Show"} explanation
                {showExplanation ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
              {showExplanation && (
                <div className="mt-2 p-3 bg-white/10 backdrop-blur-sm rounded-xl text-xs leading-relaxed animate-slide-down">
                  {card.explanation}
                </div>
              )}
            </div>
          )}

          <p className="text-center text-[11px] text-white/40 mt-2 font-medium">
            Click to see question
          </p>
        </div>
      </div>
    </div>
  );
}
