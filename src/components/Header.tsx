"use client";

import { useState, useEffect } from "react";
import { Brain, Sun, Moon, Sparkles } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cardCount: number;
}

/**
 * Application header with branding, navigation tabs, and dark mode toggle.
 */
export default function Header({ activeTab, onTabChange, cardCount }: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from system preference or localStorage
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
    { id: "cards", label: "My Cards", icon: "📚" },
    { id: "study", label: "Study", icon: "🧠" },
    { id: "ai", label: "AI Generate", icon: "✨" },
  ];

  return (
    <header className="sticky top-0 z-40 glass border-b border-gray-200/50 dark:border-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top bar */}
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight">
                Flash<span className="gradient-text">Mind</span>
              </h1>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 -mt-0.5 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                AI-Powered Learning
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full">
              {cardCount} card{cardCount !== 1 ? "s" : ""}
            </span>
            <button
              onClick={toggleDarkMode}
              className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>
          </div>
        </div>

        {/* Tab navigation */}
        <nav className="flex gap-1 -mb-px pb-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                relative px-4 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200
                ${
                  activeTab === tab.id
                    ? "text-violet-600 dark:text-violet-400 bg-white dark:bg-gray-900 border border-gray-200/50 dark:border-gray-800/50 border-b-transparent"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
                }
              `}
            >
              <span className="flex items-center gap-1.5">
                <span className="text-base">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
