"use client";

import { useState } from "react";
import { Sparkles, Wand2, Loader2, Zap } from "lucide-react";

interface AIGeneratorProps {
  onGenerate: (topic: string, count: number, difficulty: string) => Promise<void>;
}

/**
 * AI-powered flashcard generator panel.
 * Users enter a topic and the AI creates flashcards automatically.
 */
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
    "React Hooks",
    "Python Data Structures",
    "SQL Joins",
    "Machine Learning Basics",
    "CSS Flexbox & Grid",
    "REST API Design",
    "Git Version Control",
  ];

  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero section */}
      <div className="text-center mb-8">
        <div className="relative inline-flex mb-5">
          <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center shadow-glow animate-float">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          AI Flashcard Generator
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto leading-relaxed">
          Enter any topic and let AI create comprehensive flashcards with questions, answers, and detailed explanations.
        </p>
      </div>

      {/* Generator form */}
      <form onSubmit={handleGenerate} className="space-y-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-soft">
          {/* Topic input */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Topic
            </label>
            <div className="relative">
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., JavaScript Promises"
                className="input-base !py-3 !pl-4 !pr-10"
                disabled={loading}
              />
              <Wand2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
          </div>

          {/* Options row */}
          <div className="flex gap-3 mb-5">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Number of Cards
              </label>
              <select
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="input-base"
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
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="input-base"
                disabled={loading}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 text-sm rounded-xl border border-rose-200 dark:border-rose-500/20">
              {error}
            </div>
          )}

          {/* Generate button */}
          <button
            type="submit"
            disabled={loading || !topic.trim()}
            className="btn-primary w-full !py-3 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating flashcards...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate with AI
              </>
            )}
          </button>
        </div>
      </form>

      {/* Topic suggestions */}
      <div className="mt-8">
        <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 mb-3 text-center uppercase tracking-wider">
          Popular topics
        </p>
        <div className="flex flex-wrap gap-2 justify-center">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => setTopic(s)}
              disabled={loading}
              className="text-xs px-3.5 py-1.5 rounded-full border border-slate-200 dark:border-slate-700/80 text-slate-600 dark:text-slate-400 font-medium hover:border-brand-300 dark:hover:border-brand-600 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-all duration-200 disabled:opacity-50 cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
