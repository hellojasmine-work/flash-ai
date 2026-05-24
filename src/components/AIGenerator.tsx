"use client";

import { useState } from "react";
import { Sparkles, Wand2, Loader2 } from "lucide-react";

interface AIGeneratorProps {
  onGenerate: (topic: string, count: number, difficulty: string) => Promise<void>;
}

export default function AIGenerator({ onGenerate }: AIGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [difficulty, setDifficulty] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError("");
    try {
      await onGenerate(topic.trim(), count, difficulty);
      setTopic("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "JavaScript Closures",
    "Spanish Vocabulary",
    "World Capitals",
    "Photosynthesis",
    "French Verb Conjugation",
    "Music Theory",
    "Calculus Derivatives",
    "Ancient Roman History",
  ];

  return (
    <div className="max-w-xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl sm:text-4xl italic text-ink-950 dark:text-surface-50">
          Generate with AI
        </h2>
      </div>

      {/* Form */}
      <form onSubmit={handleGenerate}>
        <div className="bg-white dark:bg-ink-900 rounded-2xl border border-surface-200/80 dark:border-ink-800 p-6 shadow-warm">
          {/* Topic */}
          <div className="mb-5">
            <label className="block text-xs font-semibold text-surface-500 dark:text-ink-400 mb-2 uppercase tracking-wider">
              Topic
            </label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Enter a topic and let AI create flashcards…"
                className="input-field !pr-10"
                disabled={loading}
              />
              <Wand2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-ink-500" />
            </div>
            {/* Suggestion chips */}
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setTopic(s)}
                  disabled={loading}
                  className="text-[8px] px-2 py-0.5 rounded-full bg-surface-50 dark:bg-ink-800/60 border border-surface-200/60 dark:border-ink-700/60 text-surface-500 dark:text-ink-400 font-medium hover:border-accent-300 dark:hover:border-accent-700 hover:text-accent-700 dark:hover:text-accent-300 transition-all duration-200 disabled:opacity-40 cursor-pointer"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Options */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-surface-500 dark:text-ink-400 mb-2 uppercase tracking-wider">
                Cards
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="input-field"
                disabled={loading}
              >
                {[1, 2, 3, 5, 8, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} card{n > 1 ? "s" : ""}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs font-semibold text-surface-500 dark:text-ink-400 mb-2 uppercase tracking-wider">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="input-field"
                disabled={loading}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 text-sm rounded-xl border border-accent-200/60 dark:border-accent-800/30 font-medium">
              {error}
            </div>
          )}

          {/* Generate */}
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="btn-primary w-full !py-3"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Flashcards
              </>
            )}
          </button>
        </div>
      </form>

    </div>
  );
}
