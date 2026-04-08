"use client";

import { BookOpen } from "lucide-react";
import type { Flashcard } from "@/hooks/useFlashcards";

/** Rich book cover colors — warm, muted, library-inspired */
const BOOK_PALETTE = [
  { cover: "#6B3A2A", spine: "#4A2820", text: "#F5E6D3" },
  { cover: "#2C4A3E", spine: "#1A3830", text: "#E8F0EC" },
  { cover: "#4A3055", spine: "#352040", text: "#F0E8F5" },
  { cover: "#2E3A50", spine: "#1E2A40", text: "#E0E8F5" },
  { cover: "#7A3030", spine: "#5A2020", text: "#F5E0E0" },
  { cover: "#5C4033", spine: "#3C2823", text: "#F5EDE5" },
  { cover: "#4A5040", spine: "#3A4030", text: "#E8F0E0" },
  { cover: "#6B4C3B", spine: "#4B3425", text: "#F5EDE5" },
];

export function getBookColor(category: string) {
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = category.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BOOK_PALETTE[Math.abs(hash) % BOOK_PALETTE.length];
}

interface BookCardProps {
  category: string;
  cards: Flashcard[];
  onClick: () => void;
  index: number;
}

export default function BookCard({ category, cards, onClick, index }: BookCardProps) {
  const color = getBookColor(category);
  const cardCount = cards.length;
  const easyCount = cards.filter((c) => c.difficulty === "easy").length;
  const hardCount = cards.filter((c) => c.difficulty === "hard").length;
  const mediumCount = cardCount - easyCount - hardCount;

  return (
    <div
      className="book-perspective cursor-pointer group"
      onClick={onClick}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="book-container relative w-full" style={{ aspectRatio: "3 / 4" }}>
        {/* Page edges (visible on right side) */}
        <div
          className="page-edges absolute top-[3px] bottom-[3px] right-0 w-[14px] rounded-r-[3px]"
          style={{ zIndex: 1 }}
        />

        {/* Book cover */}
        <div
          className="absolute inset-0 rounded-lg overflow-hidden shadow-warm-lg group-hover:shadow-warm-xl transition-shadow duration-300"
          style={{ zIndex: 2 }}
        >
          {/* Spine */}
          <div
            className="absolute left-0 top-0 bottom-0 w-[18px]"
            style={{ backgroundColor: color.spine }}
          >
            {/* Spine line details */}
            <div
              className="absolute left-[5px] top-4 bottom-4 w-[1px] opacity-20"
              style={{ backgroundColor: color.text }}
            />
            <div
              className="absolute right-[4px] top-4 bottom-4 w-[1px] opacity-10"
              style={{ backgroundColor: color.text }}
            />
          </div>

          {/* Cover face */}
          <div
            className="absolute inset-0 ml-[18px] flex flex-col justify-between p-5"
            style={{ backgroundColor: color.cover }}
          >
            {/* Decorative top line */}
            <div
              className="w-12 h-[1px] opacity-30"
              style={{ backgroundColor: color.text }}
            />

            {/* Title area */}
            <div className="flex-1 flex flex-col justify-center">
              <h3
                className="font-display text-xl sm:text-2xl italic leading-tight mb-2"
                style={{ color: color.text }}
              >
                {category}
              </h3>
              <div className="flex items-center gap-1.5" style={{ color: color.text, opacity: 0.6 }}>
                <BookOpen className="w-3.5 h-3.5" />
                <span className="text-xs font-medium">
                  {cardCount} card{cardCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Bottom — difficulty dots */}
            <div className="flex items-center gap-3">
              {easyCount > 0 && (
                <div className="flex items-center gap-1" style={{ color: color.text, opacity: 0.5 }}>
                  <span className="w-2 h-2 rounded-full bg-emerald-400/60" />
                  <span className="text-[10px] font-medium">{easyCount}</span>
                </div>
              )}
              {mediumCount > 0 && (
                <div className="flex items-center gap-1" style={{ color: color.text, opacity: 0.5 }}>
                  <span className="w-2 h-2 rounded-full bg-amber-400/60" />
                  <span className="text-[10px] font-medium">{mediumCount}</span>
                </div>
              )}
              {hardCount > 0 && (
                <div className="flex items-center gap-1" style={{ color: color.text, opacity: 0.5 }}>
                  <span className="w-2 h-2 rounded-full bg-rose-400/60" />
                  <span className="text-[10px] font-medium">{hardCount}</span>
                </div>
              )}
            </div>

            {/* Decorative bottom line */}
            <div
              className="w-8 h-[1px] opacity-20 mt-3"
              style={{ backgroundColor: color.text }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
