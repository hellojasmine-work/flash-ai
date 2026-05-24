"use client";

import { useState, useEffect, useRef } from "react";
import { Sun, Moon, BookOpen, GraduationCap, Wand2, LogIn, LogOut, Shield } from "lucide-react";
import type { AuthUser } from "@/hooks/useAuth";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cardCount: number;
  user: AuthUser | null;
  authLoading: boolean;
  onLoginClick: () => void;
  onLogout: () => void;
}

export default function Header({
  activeTab,
  onTabChange,
  cardCount,
  user,
  authLoading,
  onLoginClick,
  onLogout,
}: HeaderProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = stored ? stored === "true" : prefersDark;
    setDarkMode(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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
    ...(user?.role === "admin" ? [{ id: "admin", label: "Admin", icon: Shield }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 glass border-b border-surface-200/60 dark:border-ink-800/60">
      <div className="max-w-6xl mx-auto px-5 sm:px-8">
        {/* Top bar */}
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <h1 className="font-display text-2xl italic text-ink-950 dark:text-surface-50 tracking-tight">
              Flash<span className="gradient-text not-italic">Mind</span> AI
            </h1>
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

            {/* Auth area */}
            {authLoading ? (
              <div className="w-8 h-8 rounded-full bg-surface-100 dark:bg-ink-800 animate-pulse" />
            ) : user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-100 dark:bg-ink-800 hover:bg-surface-200 dark:hover:bg-ink-700 transition-all cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white">
                      {user.username[0].toUpperCase()}
                    </span>
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-ink-800 dark:text-surface-200 max-w-[80px] truncate">
                    {user.username}
                  </span>
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-ink-900 rounded-xl shadow-warm-lg border border-surface-200/60 dark:border-ink-800 py-1 animate-scale-in z-50">
                    <div className="px-4 py-2.5 border-b border-surface-100 dark:border-ink-800">
                      <p className="text-xs font-bold text-ink-900 dark:text-surface-100">{user.username}</p>
                      <p className="text-[11px] text-surface-500 dark:text-ink-400 truncate">{user.email}</p>
                      {user.role === "admin" && (
                        <span className="text-[10px] font-bold text-accent-600 dark:text-accent-400 uppercase tracking-wide">
                          Admin
                        </span>
                      )}
                    </div>
                    {user.role === "admin" && (
                      <button
                        onClick={() => { onTabChange("admin"); setUserMenuOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-600 dark:text-ink-300 hover:bg-surface-50 dark:hover:bg-ink-800 transition-colors cursor-pointer"
                      >
                        <Shield className="w-4 h-4" /> Admin Panel
                      </button>
                    )}
                    <button
                      onClick={() => { onLogout(); setUserMenuOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-600 dark:text-ink-300 hover:bg-surface-50 dark:hover:bg-ink-800 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={onLoginClick} className="btn-primary !px-3.5 !py-2 !text-xs">
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            )}
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
