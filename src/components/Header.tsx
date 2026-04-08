"use client";

import { useState, useEffect } from "react";
import { Sun, Moon, Sparkles, BookOpen, GraduationCap, Wand2 } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cardCount: number;
}

export default function Header({ activeTab, onTabChange, cardCount }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "true" : prefersDark;
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem("darkMode", String(next));
    document.documentElement.classList.toggle("dark", next);
  };

  const tabs = [
    { id: "cards", label: "My Cards", icon: BookOpen },
    { id: "study", label: "Study", icon: GraduationCap },
    { id: "ai", label: "AI Generate", icon: Wand2 },
  ];

  return (
    <header className="sticky top-0 z-40 glass border-b border-surface-200/60 dark:border-ink-800/60">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl italic text-ink-950 dark:text-surface-50 tracking-tight">
              Flash<span className="gradient-text not-italic">Mind</span>
            </h1>
            <div className="hidden sm:flex items-center gap-1 text-[11px] text-surface-500 dark:text-ink-400 bg-surface-100 dark:bg-ink-900 px-2.5 py-1 rounded-full font-medium tracking-wide uppercase">
              <Sparkles className="w-3 h-3" />
              AI
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-surface-500 dark:text-ink-400 font-medium tabular-nums">
              {cardCount} card{cardCount !== 1 ? "s" : ""}
            </span>
            <div className="w-px h-4 bg-surface-200 dark:bg-ink-800 hidden sm:block" />
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 rounded-full flex items-center justify-center text-surface-500 hover:text-ink-800 dark:text-ink-400 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-ink-800 transition-all duration-200 cursor-pointer"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-[18px] h-[18px]" /> : <Moon className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="flex gap-1 -mb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  relative px-4 py-2.5 text-[13px] font-semibold rounded-full mb-3 transition-all duration-200 cursor-pointer
                  ${
                    isActive
                      ? "bg-ink-950 dark:bg-surface-100 text-white dark:text-ink-950 shadow-warm-sm"
                      : "text-surface-500 dark:text-ink-400 hover:text-ink-800 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-ink-800/60"
                  }
                `}
              >
                <span className="flex items-center gap-1.5">
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
