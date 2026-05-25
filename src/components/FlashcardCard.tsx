"use client";

import { useState } from "react";
import { useSpring, animated } from "@react-spring/web";
import { Pencil, Trash2, Sparkles, MessageCircle } from "lucide-react";
import type { Flashcard } from "@/hooks/useFlashcards";

interface FlashcardCardProps {
  card: Flashcard;
  onEdit: (card: Flashcard) => void;
  onDelete: (id: string) => void;
  onDiscuss: (card: Flashcard) => void;
  onView?: (card: Flashcard) => void;
}

export default function FlashcardCard({ card, onEdit, onDelete, onDiscuss, onView }: FlashcardCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [hovered, setHovered] = useState(false);

  const difficultyClass =
    card.difficulty === "easy" ? "badge-easy" : card.difficulty === "hard" ? "badge-hard" : "badge-medium";

  const noteCount = card.notes?.length || 0;

  // Spring flip
  const flipSpring = useSpring({
    rotateY: isFlipped ? 180 : 0,
    config: { tension: 250, friction: 26 },
  });

  // Spring hover lift
  const hoverSpring = useSpring({
    y: hovered ? -4 : 0,
    shadow: hovered ? 1 : 0,
    config: { tension: 300, friction: 20 },
  });

  return (
    <animated.div
      className="cursor-pointer group"
      style={{
        transform: hoverSpring.y.to((y) => `translateY(${y}px)`),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ perspective: "1200px" }}>
        <animated.div
          className="relative w-full"
          style={{
            minHeight: "240px",
            transformStyle: "preserve-3d",
            transform: flipSpring.rotateY.to((r) => `rotateY(${r}deg)`),
          }}
          onClick={() => { setIsFlipped(!isFlipped); if (!isFlipped && onView) onView(card); }}
        >
          {/* Front */}
          <div className="card-front absolute inset-0 rounded-2xl bg-white dark:bg-ink-900 border border-surface-200/80 dark:border-ink-800/80 shadow-card dark:shadow-dark-card hover:shadow-card-hover dark:hover:shadow-dark-card-hover transition-shadow duration-300 p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className={`text-[10px] tracking-wide uppercase px-2.5 py-0.5 rounded-full ${difficultyClass}`}>{card.difficulty}</span>
              <div className="flex items-center gap-1.5">
                {card.isAIGenerated && (
                  <span className="text-[10px] text-accent-500 dark:text-accent-400 flex items-center gap-0.5 font-semibold tracking-wide uppercase">
                    <Sparkles className="w-3 h-3" />AI
                  </span>
                )}
                <span className="text-[10px] text-surface-500 dark:text-ink-400 px-2 py-0.5 bg-surface-100 dark:bg-ink-800 rounded-full truncate max-w-[100px] font-medium">{card.category}</span>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center px-2">
              <p className="text-center text-ink-800 dark:text-surface-200 font-semibold leading-relaxed text-[15px]">{card.question}</p>
            </div>

            <p className="text-center text-[11px] text-surface-400 dark:text-ink-500 mt-3 font-medium tracking-wide">tap to flip</p>

            {/* Edit/Delete buttons */}
            <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <button
                onClick={(e) => { e.stopPropagation(); onEdit(card); }}
                className="w-8 h-8 rounded-full bg-surface-50 dark:bg-ink-800 border border-surface-200 dark:border-ink-700 flex items-center justify-center text-surface-400 hover:text-ink-700 dark:hover:text-surface-200 hover:border-surface-300 dark:hover:border-ink-600 transition-all cursor-pointer"
                aria-label="Edit flashcard"
              >
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(card._id); }}
                className="w-8 h-8 rounded-full bg-surface-50 dark:bg-ink-800 border border-surface-200 dark:border-ink-700 flex items-center justify-center text-surface-400 hover:text-accent-600 dark:hover:text-accent-400 hover:border-accent-300 dark:hover:border-accent-700 transition-all cursor-pointer"
                aria-label="Delete flashcard"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>


            </div>
          </div>

          {/* Back */}
          <div className="card-back absolute inset-0 rounded-2xl bg-ink-950 dark:bg-surface-100 shadow-card dark:shadow-dark-card p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2.5 py-0.5 rounded-full bg-white/10 dark:bg-ink-950/10 text-white/80 dark:text-ink-800">Answer</span>
            </div>

            <div className="flex-1 flex items-center justify-center px-2">
              <p className="text-center font-semibold leading-relaxed text-[15px] text-surface-100 dark:text-ink-900">{card.answer}</p>
            </div>

            <button
              onClick={(e) => { e.stopPropagation(); onDiscuss(card); }}
              className="mt-3 w-full flex items-center justify-center gap-1.5 text-[11px] font-semibold text-white/60 dark:text-ink-500 hover:text-white dark:hover:text-ink-700 transition-colors cursor-pointer py-2 rounded-xl hover:bg-white/5 dark:hover:bg-ink-950/5"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              Discuss with AI
              {noteCount > 0 && <span className="ml-0.5 text-[9px] bg-white/15 dark:bg-ink-950/10 px-1.5 py-0.5 rounded-full">{noteCount}</span>}
            </button>
          </div>
        </animated.div>
      </div>
    </animated.div>
  );
}
