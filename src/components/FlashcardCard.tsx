"use client";

import { useState } from "react";
import { Pencil, Trash2, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import type { Flashcard } from "@/hooks/useFlashcards";

interface FlashcardCardProps {
  card: Flashcard;
  onEdit: (card: Flashcard) => void;
  onDelete: (id: string) => void;
}

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
        className={`card-flip relative w-full min-h-[240px] cursor-pointer ${
          isFlipped ? "flipped" : ""
        }`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front - Question */}
        <div className="card-front absolute inset-0 rounded-2xl bg-white dark:bg-ink-900 border border-surface-200/80 dark:border-ink-800/80 shadow-card dark:shadow-dark-card hover:shadow-card-hover dark:hover:shadow-dark-card-hover transition-all duration-300 p-5 flex flex-col">
          {/* Top badges */}
          <div className="flex items-center justify-between mb-4">
            <span className={`text-[10px] tracking-wide uppercase px-2.5 py-1 rounded-full ${difficultyClass}`}>
              {card.difficulty}
            </span>
            <div className="flex items-center gap-1.5">
              {card.isAIGenerated && (
                <span className="text-[10px] text-accent-500 dark:text-accent-400 flex items-center gap-0.5 font-semibold tracking-wide uppercase">
                  <Sparkles className="w-3 h-3" />
                  AI
                </span>
              )}
              <span className="text-[10px] text-surface-500 dark:text-ink-400 px-2 py-0.5 bg-surface-100 dark:bg-ink-800 rounded-full truncate max-w-[100px] font-medium">
                {card.category}
              </span>
            </div>
          </div>

          {/* Question */}
          <div className="flex-1 flex items-center justify-center px-2">
            <p className="text-center text-ink-800 dark:text-surface-200 font-semibold leading-relaxed text-[15px]">
              {card.question}
            </p>
          </div>

          {/* Hint */}
          <p className="text-center text-[11px] text-surface-400 dark:text-ink-500 mt-3 font-medium tracking-wide">
            tap to flip
          </p>

          {/* Action buttons */}
          <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(card);
              }}
              className="w-8 h-8 rounded-full bg-surface-50 dark:bg-ink-800 border border-surface-200 dark:border-ink-700 flex items-center justify-center text-surface-400 hover:text-ink-700 dark:hover:text-surface-200 hover:border-surface-300 dark:hover:border-ink-600 transition-all cursor-pointer"
              aria-label="Edit flashcard"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(card._id);
              }}
              className="w-8 h-8 rounded-full bg-surface-50 dark:bg-ink-800 border border-surface-200 dark:border-ink-700 flex items-center justify-center text-surface-400 hover:text-accent-600 dark:hover:text-accent-400 hover:border-accent-300 dark:hover:border-accent-700 transition-all cursor-pointer"
              aria-label="Delete flashcard"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Back - Answer */}
        <div className="card-back absolute inset-0 rounded-2xl bg-ink-950 dark:bg-surface-100 shadow-card dark:shadow-dark-card hover:shadow-card-hover dark:hover:shadow-dark-card-hover transition-all duration-300 p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-white/10 dark:bg-ink-950/10 text-white/80 dark:text-ink-800">
              Answer
            </span>
          </div>

          <div className="flex-1 flex items-center justify-center px-2">
            <p className="text-center font-semibold leading-relaxed text-[15px] text-surface-100 dark:text-ink-900">
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
                className="w-full flex items-center justify-center gap-1 text-[11px] text-white/50 dark:text-ink-500 hover:text-white/80 dark:hover:text-ink-700 transition-colors font-medium cursor-pointer"
              >
                {showExplanation ? "Hide" : "Show"} explanation
                {showExplanation ? (
                  <ChevronUp className="w-3 h-3" />
                ) : (
                  <ChevronDown className="w-3 h-3" />
                )}
              </button>
              {showExplanation && (
                <div className="mt-2 p-3 bg-white/8 dark:bg-ink-950/8 rounded-xl text-xs leading-relaxed animate-slide-down text-white/80 dark:text-ink-700">
                  {card.explanation}
                </div>
              )}
            </div>
          )}

          <p className="text-center text-[11px] text-white/30 dark:text-ink-400 mt-2 font-medium tracking-wide">
            tap to flip back
          </p>
        </div>
      </div>
    </div>
  );
}
