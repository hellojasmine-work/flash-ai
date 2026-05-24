"use client";

import { useState, useCallback, useMemo } from "react";
import { useSpring, useTrail, useTransition, animated } from "@react-spring/web";
import {
  ChevronLeft,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Inbox,
  Trophy,
  MessageCircle,
  ArrowLeft,
  BookOpen,
} from "lucide-react";
import { getBookColor } from "./BookCard";
import type { Flashcard } from "@/hooks/useFlashcards";

interface StudyDeckProps {
  flashcards: Flashcard[];
  onDiscuss: (card: Flashcard) => void;
  onStudied?: (card: Flashcard) => void;
}

export default function StudyDeck({ flashcards, onDiscuss, onStudied }: StudyDeckProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [studyQueue, setStudyQueue] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState<Flashcard[]>([]);

  const bookGroups = useMemo(() => {
    const groups: Record<string, Flashcard[]> = {};
    flashcards.forEach((card) => {
      if (!groups[card.category]) groups[card.category] = [];
      groups[card.category].push(card);
    });
    return groups;
  }, [flashcards]);

  const totalCards = selectedCategory ? bookGroups[selectedCategory]?.length || 0 : 0;
  const progress = totalCards > 0 ? (completed.length / totalCards) * 100 : 0;
  const currentCard = studyQueue[currentIndex] || null;

  // ===== useTransition for card enter/leave =====
  const cardTransitions = useTransition(currentCard, {
    keys: (item) => item?._id || "empty",
    from: { opacity: 0, x: 80, scale: 0.92 },
    enter: { opacity: 1, x: 0, scale: 1 },
    leave: { opacity: 0, x: -320, scale: 0.85, rotate: -15 },
    config: { tension: 200, friction: 22 },
  });

  // ===== Spring: Flip (resets when card changes) =====
  const flipSpring = useSpring({
    rotateY: isFlipped ? 180 : 0,
    config: { tension: 250, friction: 26 },
  });

  // ===== Spring: Progress bar =====
  const progressSpring = useSpring({
    width: progress,
    config: { tension: 120, friction: 14 },
  });

  // ===== Trail: Book selection =====
  const cats = Object.keys(bookGroups);
  const bookTrail = useTrail(cats.length, {
    from: { opacity: 0, y: 24, scale: 0.95 },
    to: { opacity: selectedCategory ? 0 : 1, y: selectedCategory ? -10 : 0, scale: selectedCategory ? 0.95 : 1 },
    config: { tension: 220, friction: 20 },
  });

  const handleSelectBook = useCallback((category: string) => {
    const cards = bookGroups[category] || [];
    setSelectedCategory(category);
    setStudyQueue([...cards]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted([]);
  }, [bookGroups]);

  const handleBack = useCallback(() => {
    setSelectedCategory(null);
    setStudyQueue([]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted([]);
  }, []);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handlePrev = useCallback(() => {
    setIsFlipped(false);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  }, [currentIndex]);

  const handleMarkStudied = useCallback(() => {
    if (!currentCard) return;
    if (onStudied) onStudied(currentCard);
    // Add to completed
    setCompleted((prev) => [...prev, currentCard]);
    // Remove from queue — this changes currentCard, triggering the transition
    const newQueue = studyQueue.filter((_, i) => i !== currentIndex);
    setStudyQueue(newQueue);
    setIsFlipped(false);
    if (currentIndex >= newQueue.length && newQueue.length > 0) {
      setCurrentIndex(newQueue.length - 1);
    }
  }, [currentCard, currentIndex, studyQueue, onStudied]);

  const handleReset = useCallback(() => {
    if (!selectedCategory) return;
    const cards = bookGroups[selectedCategory] || [];
    setStudyQueue([...cards]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCompleted([]);
  }, [selectedCategory, bookGroups]);

  // ===== EMPTY =====
  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-ink-800 flex items-center justify-center mb-5">
          <Inbox className="w-7 h-7 text-surface-400 dark:text-ink-500" />
        </div>
        <h3 className="font-display text-2xl italic text-ink-800 dark:text-surface-200 mb-2">No cards yet</h3>
        <p className="text-sm text-surface-500 dark:text-ink-400 max-w-xs">Create some flashcards first.</p>
      </div>
    );
  }

  // ===== BOOK SELECTION =====
  if (!selectedCategory) {
    return (
      <div>
        <div className="text-center mb-10">
          <h2 className="font-display text-3xl sm:text-4xl italic text-ink-950 dark:text-surface-50 mb-2">Choose a book</h2>
          <p className="text-sm text-surface-500 dark:text-ink-400">Pick a category to study</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 max-w-3xl mx-auto">
          {bookTrail.map((style, i) => {
            const cat = cats[i];
            const color = getBookColor(cat);
            const count = bookGroups[cat].length;
            return (
              <animated.button
                key={cat}
                style={{ opacity: style.opacity, transform: style.y.to((y) => `translateY(${y}px) scale(${style.scale.get()})`) }}
                onClick={() => handleSelectBook(cat)}
                className="cursor-pointer text-left"
              >
                <div className="book-perspective">
                  <div className="book-container relative w-full rounded-lg overflow-hidden shadow-warm hover:shadow-warm-lg transition-shadow" style={{ aspectRatio: "3 / 4" }}>
                    <div className="absolute left-0 top-0 bottom-0 w-3" style={{ backgroundColor: color.spine }} />
                    <div className="absolute inset-0 ml-3 flex flex-col justify-center items-center p-4" style={{ backgroundColor: color.cover }}>
                      <BookOpen className="w-5 h-5 mb-2 opacity-40" style={{ color: color.text }} />
                      <h4 className="font-display text-base italic text-center leading-snug mb-1" style={{ color: color.text }}>{cat}</h4>
                      <span className="text-[10px] font-medium opacity-50" style={{ color: color.text }}>{count} card{count !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>
              </animated.button>
            );
          })}
        </div>
      </div>
    );
  }

  // ===== COMPLETED =====
  if (studyQueue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-2xl bg-sage-50 dark:bg-sage-900/30 flex items-center justify-center mb-5">
          <Trophy className="w-10 h-10 text-sage-500" />
        </div>
        <h3 className="font-display text-3xl italic text-ink-900 dark:text-surface-100 mb-2">Well done!</h3>
        <p className="text-sm text-surface-500 dark:text-ink-400 mb-8">
          You studied all {totalCards} card{totalCards !== 1 ? "s" : ""} from <em>{selectedCategory}</em>.
        </p>
        <div className="flex gap-3">
          <button onClick={handleBack} className="btn-secondary"><ArrowLeft className="w-4 h-4" />Other Books</button>
          <button onClick={handleReset} className="btn-primary"><RotateCcw className="w-4 h-4" />Study Again</button>
        </div>
      </div>
    );
  }

  // ===== DECK STUDY =====
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="relative flex items-center justify-center mb-6">
        <button onClick={handleBack} className="absolute left-0 flex items-center gap-1.5 text-sm text-surface-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-surface-200 font-medium transition-colors cursor-pointer">
          <ArrowLeft className="w-4 h-4" />Books
        </button>
        <span className="font-display text-lg italic text-ink-900 dark:text-surface-100">{selectedCategory}</span>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-surface-500 dark:text-ink-400 font-semibold uppercase tracking-wider">Progress</span>
          <span className="text-xs font-bold text-accent-600 dark:text-accent-400 tabular-nums">{completed.length}/{totalCards}</span>
        </div>
        <div className="h-1.5 bg-surface-200 dark:bg-ink-800 rounded-full overflow-hidden">
          <animated.div className="h-full bg-accent-500 rounded-full" style={{ width: progressSpring.width.to((w) => `${w}%`) }} />
        </div>
      </div>

      {/* Deck area */}
      <div className="relative flex items-start justify-center gap-6 sm:gap-8 mb-8" style={{ minHeight: "360px" }}>
        {/* Studied pile */}
        <div className="relative w-28 sm:w-36 flex-shrink-0" style={{ height: "280px" }}>
          {completed.length === 0 && (
            <div className="absolute inset-0 border-2 border-dashed border-surface-200 dark:border-ink-800 rounded-2xl flex items-center justify-center">
              <span className="text-[10px] font-medium text-surface-400 dark:text-ink-600 uppercase tracking-wider">Studied</span>
            </div>
          )}
          {completed.slice(-6).map((card, i) => {
            const rotation = ((card._id.charCodeAt(0) % 11) - 5) * 1.8;
            const offsetX = ((card._id.charCodeAt(1) % 7) - 3) * 2;
            return (
              <div
                key={card._id}
                className="absolute inset-0 rounded-2xl bg-surface-100 dark:bg-ink-800 border border-surface-200/50 dark:border-ink-700/50 shadow-warm-sm"
                style={{ transform: `rotate(${rotation}deg) translateX(${offsetX}px)`, zIndex: i }}
              />
            );
          })}
        </div>

        {/* Active deck */}
        <div className="relative flex-1 max-w-xs sm:max-w-sm" style={{ height: "340px" }}>
          {/* Background stack cards */}
          {studyQueue.slice(currentIndex + 1, currentIndex + 3).map((_, i) => (
            <div
              key={`bg-${i}`}
              className="absolute inset-0 rounded-2xl bg-white dark:bg-ink-900 border border-surface-200/60 dark:border-ink-800/60 shadow-warm-sm"
              style={{
                transform: `translateY(${(i + 1) * 6}px) scale(${1 - (i + 1) * 0.02})`,
                zIndex: 10 - i,
                opacity: 1 - (i + 1) * 0.2,
              }}
            />
          ))}

          {/* Current card — useTransition handles enter/leave */}
          {cardTransitions((transitionStyle, card) => {
            if (!card) return null;
            const noteCount = card.notes?.length || 0;
            return (
              <animated.div
                className="absolute inset-0"
                style={{
                  zIndex: 20,
                  opacity: transitionStyle.opacity,
                  transform: transitionStyle.x.to(
                    (x) => `translateX(${x}px) scale(${transitionStyle.scale.get()}) rotate(${(transitionStyle as Record<string, unknown>).rotate !== undefined ? `${(transitionStyle as Record<string, unknown>).rotate}deg` : '0deg'})`
                  ),
                }}
              >
                <div style={{ perspective: "1200px", width: "100%", height: "100%" }}>
                  <animated.div
                    className="relative w-full h-full cursor-pointer"
                    style={{ transformStyle: "preserve-3d", transform: flipSpring.rotateY.to((r) => `rotateY(${r}deg)`) }}
                    onClick={handleFlip}
                  >
                    {/* Front */}
                    <div className="card-front absolute inset-0 rounded-2xl bg-white dark:bg-ink-900 border border-surface-200/80 dark:border-ink-800 shadow-warm-lg p-6 sm:p-8 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-[10px] tracking-wide uppercase px-2.5 py-1 rounded-full ${
                          card.difficulty === "easy" ? "badge-easy" : card.difficulty === "hard" ? "badge-hard" : "badge-medium"
                        }`}>{card.difficulty}</span>
                        <div className="flex items-center gap-2">
                          {card.isAIGenerated && (
                            <span className="text-[10px] text-accent-500 flex items-center gap-0.5 font-semibold uppercase"><Sparkles className="w-3 h-3" /> AI</span>
                          )}
                          <span className="text-[10px] text-surface-500 dark:text-ink-400 font-medium tabular-nums">{currentIndex + 1}/{studyQueue.length}</span>
                        </div>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-center text-lg sm:text-xl font-semibold text-ink-900 dark:text-surface-100 leading-relaxed">{card.question}</p>
                      </div>
                      <p className="text-center text-[11px] text-surface-400 dark:text-ink-500 mt-3 font-medium tracking-wide">tap to reveal</p>
                    </div>

                    {/* Back */}
                    <div className="card-back absolute inset-0 rounded-2xl bg-ink-950 dark:bg-surface-100 shadow-warm-lg p-6 sm:p-8 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full bg-white/10 dark:bg-ink-950/10 text-white/70 dark:text-ink-600">Answer</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center">
                        <p className="text-center text-lg sm:text-xl font-semibold leading-relaxed text-surface-100 dark:text-ink-900">{card.answer}</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); onDiscuss(card); }}
                        className="mt-2 w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold text-white/50 dark:text-ink-500 hover:text-white/80 dark:hover:text-ink-700 transition-colors cursor-pointer py-2 rounded-xl hover:bg-white/5 dark:hover:bg-ink-950/5"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Discuss with AI
                        {noteCount > 0 && <span className="text-[9px] bg-white/15 dark:bg-ink-950/10 px-1.5 py-0.5 rounded-full">{noteCount}</span>}
                      </button>
                    </div>
                  </animated.div>
                </div>
              </animated.div>
            );
          })}
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3">
        <button onClick={handlePrev} disabled={currentIndex === 0}
          className="w-12 h-12 rounded-full border border-surface-200 dark:border-ink-700 flex items-center justify-center text-surface-500 hover:text-ink-700 dark:hover:text-surface-300 hover:bg-surface-50 dark:hover:bg-ink-800 disabled:opacity-25 disabled:cursor-not-allowed transition-all cursor-pointer"
          aria-label="Previous card">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button onClick={handleMarkStudied}
          className="px-7 py-3 rounded-full bg-sage-600 hover:bg-sage-700 active:scale-[0.97] text-white font-semibold text-sm transition-all flex items-center gap-2 shadow-warm cursor-pointer focus:outline-none focus:ring-2 focus:ring-sage-500/30 focus:ring-offset-2">
          <CheckCircle2 className="w-4 h-4" />Nailed it!
        </button>

        <button onClick={handleReset}
          className="w-12 h-12 rounded-full border border-surface-200 dark:border-ink-700 flex items-center justify-center text-surface-500 hover:text-ink-700 dark:hover:text-surface-300 hover:bg-surface-50 dark:hover:bg-ink-800 transition-all cursor-pointer"
          aria-label="Reset session">
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
