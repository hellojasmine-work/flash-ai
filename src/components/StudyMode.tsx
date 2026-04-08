"use client";

import { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Inbox,
  Trophy,
} from "lucide-react";
import type { Flashcard } from "@/hooks/useFlashcards";

interface StudyModeProps {
  flashcards: Flashcard[];
}

/**
 * Study mode: go through flashcards one by one.
 * Track progress and mark cards as studied (they disappear from the study queue).
 */
export default function StudyMode({ flashcards }: StudyModeProps) {
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([...flashcards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);

  const currentCard = studyQueue[currentIndex];
  const totalCards = flashcards.length;
  const progress = totalCards > 0 ? (completed.length / totalCards) * 100 : 0;

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
    setShowExplanation(false);
  }, []);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    setShowExplanation(false);
    if (currentIndex < studyQueue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, studyQueue.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    setShowExplanation(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  // Mark current card as studied and remove from queue
  const handleMarkStudied = useCallback(() => {
    if (!currentCard) return;
    setCompleted((prev) => [...prev, currentCard._id]);
    const newQueue = studyQueue.filter((_, i) => i !== currentIndex);
    setStudyQueue(newQueue);
    setIsFlipped(false);
    setShowExplanation(false);
    if (currentIndex >= newQueue.length && newQueue.length > 0) {
      setCurrentIndex(newQueue.length - 1);
    }
  }, [currentCard, currentIndex, studyQueue]);

  // Reset study session
  const handleReset = useCallback(() => {
    setStudyQueue([...flashcards]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setShowExplanation(false);
    setCompleted([]);
  }, [flashcards]);

  // No cards available
  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
          <Inbox className="w-8 h-8 text-slate-400 dark:text-slate-500" />
        </div>
        <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
          No flashcards yet
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm">
          Create some flashcards first, then come back to study them!
        </p>
      </div>
    );
  }

  // All cards studied
  if (studyQueue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-5 shadow-sm">
          <Trophy className="w-10 h-10 text-emerald-500" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">
          Session Complete!
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          You&apos;ve studied all {totalCards} flashcard{totalCards !== 1 ? "s" : ""}. Great work!
        </p>
        <button
          onClick={handleReset}
          className="btn-primary flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Study Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {completed.length} of {totalCards} studied
          </span>
          <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-600 dark:bg-brand-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card counter */}
      <div className="text-center mb-4">
        <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Card {currentIndex + 1} of {studyQueue.length} remaining
        </span>
      </div>

      {/* Study card */}
      <div className="perspective mb-6">
        <div
          className={`card-flip relative w-full min-h-[320px] cursor-pointer ${
            isFlipped ? "flipped" : ""
          }`}
          onClick={handleFlip}
        >
          {/* Front - Question */}
          <div className="card-front absolute inset-0 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-soft-lg p-8 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  currentCard.difficulty === "easy"
                    ? "badge-easy"
                    : currentCard.difficulty === "hard"
                    ? "badge-hard"
                    : "badge-medium"
                }`}
              >
                {currentCard.difficulty}
              </span>
              <div className="flex items-center gap-2">
                {currentCard.isAIGenerated && (
                  <span className="text-xs text-brand-500 flex items-center gap-1 font-medium">
                    <Sparkles className="w-3 h-3" /> AI
                  </span>
                )}
                <span className="text-xs text-slate-500 font-medium bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
                  {currentCard.category}
                </span>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <p className="text-center text-xl font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                {currentCard.question}
              </p>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4 font-medium">
              Tap to reveal answer
            </p>
          </div>

          {/* Back - Answer */}
          <div className="card-back absolute inset-0 rounded-2xl bg-brand-600 dark:bg-brand-700 shadow-glow p-8 flex flex-col text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm">
                Answer
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <p className="text-center text-xl font-semibold leading-relaxed">
                {currentCard.answer}
              </p>
            </div>

            {currentCard.explanation && (
              <div className="mt-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowExplanation(!showExplanation);
                  }}
                  className="w-full flex items-center justify-center gap-1 text-xs text-white/70 hover:text-white transition-colors font-medium"
                >
                  {showExplanation ? "Hide" : "Show"} explanation
                  {showExplanation ? (
                    <ChevronUp className="w-3 h-3" />
                  ) : (
                    <ChevronDown className="w-3 h-3" />
                  )}
                </button>
                {showExplanation && (
                  <div className="mt-2 p-4 bg-white/10 backdrop-blur-sm rounded-xl text-sm leading-relaxed animate-slide-down">
                    {currentCard.explanation}
                  </div>
                )}
              </div>
            )}

            <p className="text-center text-xs text-white/40 mt-3 font-medium">
              Tap to see question
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="w-11 h-11 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Previous card"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleMarkStudied}
          className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-white font-medium text-sm transition-all flex items-center gap-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:ring-offset-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Got it!
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex >= studyQueue.length - 1}
          className="w-11 h-11 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          aria-label="Next card"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Reset button */}
      <div className="text-center mt-5">
        <button
          onClick={handleReset}
          className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors flex items-center gap-1.5 mx-auto font-medium"
        >
          <RotateCcw className="w-3 h-3" />
          Reset session
        </button>
      </div>
    </div>
  );
}
