"use client";

import { useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Inbox,
  Trophy,
  MessageCircle,
} from "lucide-react";
import type { Flashcard } from "@/hooks/useFlashcards";

interface StudyModeProps {
  flashcards: Flashcard[];
  onDiscuss: (card: Flashcard) => void;
}

export default function StudyMode({ flashcards, onDiscuss }: StudyModeProps) {
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([...flashcards]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState<string[]>([]);

  const currentCard = studyQueue[currentIndex];
  const totalCards = flashcards.length;
  const progress = totalCards > 0 ? (completed.length / totalCards) * 100 : 0;

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleNext = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex < studyQueue.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [currentIndex, studyQueue.length]);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleMarkStudied = useCallback(() => {
    if (!currentCard) return;
    setCompleted((prev) => [...prev, currentCard._id]);
    const newQueue = studyQueue.filter((_, i) => i !== currentIndex);
    setStudyQueue(newQueue);
    setIsFlipped(false);
    if (currentIndex >= newQueue.length && newQueue.length > 0) {
      setCurrentIndex(newQueue.length - 1);
    }
  }, [currentCard, currentIndex, studyQueue]);

  const handleReset = useCallback(() => {
    setStudyQueue([...flashcards]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted([]);
  }, [flashcards]);

  // Empty state
  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-ink-800 flex items-center justify-center mb-5">
          <Inbox className="w-7 h-7 text-surface-400 dark:text-ink-500" />
        </div>
        <h3 className="font-display text-2xl italic text-ink-800 dark:text-surface-200 mb-2">
          No cards yet
        </h3>
        <p className="text-sm text-surface-500 dark:text-ink-400 max-w-xs">
          Create some flashcards first, then come back to study them.
        </p>
      </div>
    );
  }

  // Completed state
  if (studyQueue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-sage-50 dark:bg-sage-900/30 flex items-center justify-center mb-5">
          <Trophy className="w-10 h-10 text-sage-500" />
        </div>
        <h3 className="font-display text-3xl italic text-ink-900 dark:text-surface-100 mb-2">
          Well done!
        </h3>
        <p className="text-sm text-surface-500 dark:text-ink-400 mb-8">
          You studied all {totalCards} card{totalCards !== 1 ? "s" : ""} in this session.
        </p>
        <button onClick={handleReset} className="btn-primary">
          <RotateCcw className="w-4 h-4" />
          Study Again
        </button>
      </div>
    );
  }

  const noteCount = currentCard.notes?.length || 0;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs text-surface-500 dark:text-ink-400 font-semibold uppercase tracking-wider">
            Progress
          </span>
          <span className="text-xs font-bold text-accent-600 dark:text-accent-400 tabular-nums">
            {completed.length}/{totalCards}
          </span>
        </div>
        <div className="h-1.5 bg-surface-200 dark:bg-ink-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-accent-500 rounded-full transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Card counter */}
      <div className="text-center mb-5">
        <span className="text-sm text-surface-500 dark:text-ink-400 font-medium tabular-nums">
          Card {currentIndex + 1} of {studyQueue.length}
        </span>
      </div>

      {/* Study card */}
      <div className="perspective mb-8">
        <div
          className={`card-flip relative w-full min-h-[340px] cursor-pointer ${
            isFlipped ? "flipped" : ""
          }`}
          onClick={handleFlip}
        >
          {/* Front */}
          <div className="card-front absolute inset-0 rounded-2xl bg-white dark:bg-ink-900 border border-surface-200/80 dark:border-ink-800 shadow-warm-lg p-8 sm:p-10 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <span
                className={`text-[10px] tracking-wide uppercase px-2.5 py-1 rounded-full ${
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
                  <span className="text-[10px] text-accent-500 flex items-center gap-1 font-semibold uppercase tracking-wide">
                    <Sparkles className="w-3 h-3" /> AI
                  </span>
                )}
                <span className="text-[10px] text-surface-500 font-medium bg-surface-100 dark:bg-ink-800 px-2.5 py-0.5 rounded-full">
                  {currentCard.category}
                </span>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <p className="text-center text-xl sm:text-2xl font-semibold text-ink-900 dark:text-surface-100 leading-relaxed">
                {currentCard.question}
              </p>
            </div>

            <p className="text-center text-[11px] text-surface-400 dark:text-ink-500 mt-4 font-medium tracking-wide">
              tap to reveal
            </p>
          </div>

          {/* Back */}
          <div className="card-back absolute inset-0 rounded-2xl bg-ink-950 dark:bg-surface-100 shadow-warm-lg p-8 sm:p-10 flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-white/10 dark:bg-ink-950/10 text-white/70 dark:text-ink-600">
                Answer
              </span>
            </div>

            <div className="flex-1 flex items-center justify-center">
              <p className="text-center text-xl sm:text-2xl font-semibold leading-relaxed text-surface-100 dark:text-ink-900">
                {currentCard.answer}
              </p>
            </div>

            {/* Discuss with AI */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDiscuss(currentCard);
              }}
              className="mt-3 w-full flex items-center justify-center gap-1.5 text-[12px] font-semibold text-white/60 dark:text-ink-500 hover:text-white dark:hover:text-ink-700 transition-colors cursor-pointer py-2.5 rounded-xl hover:bg-white/5 dark:hover:bg-ink-950/5"
            >
              <MessageCircle className="w-4 h-4" />
              Discuss with AI
              {noteCount > 0 && (
                <span className="ml-0.5 text-[10px] bg-white/15 dark:bg-ink-950/10 px-1.5 py-0.5 rounded-full">
                  {noteCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full border border-surface-200 dark:border-ink-700 flex items-center justify-center text-surface-500 hover:text-ink-700 dark:hover:text-surface-300 hover:bg-surface-50 dark:hover:bg-ink-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Previous card"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={handleMarkStudied}
          className="px-7 py-3 rounded-full bg-sage-600 hover:bg-sage-700 active:scale-[0.97] text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-warm cursor-pointer focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:ring-offset-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Got it!
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex >= studyQueue.length - 1}
          className="w-12 h-12 rounded-full border border-surface-200 dark:border-ink-700 flex items-center justify-center text-surface-500 hover:text-ink-700 dark:hover:text-surface-300 hover:bg-surface-50 dark:hover:bg-ink-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Next card"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Reset */}
      <div className="text-center mt-6">
        <button
          onClick={handleReset}
          className="text-xs text-surface-400 hover:text-surface-600 dark:text-ink-500 dark:hover:text-ink-300 transition-colors flex items-center gap-1.5 mx-auto font-medium cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          Reset session
        </button>
      </div>
    </div>
  );
}
