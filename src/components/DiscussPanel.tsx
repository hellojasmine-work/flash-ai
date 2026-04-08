"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2, MessageCircle, X } from "lucide-react";
import type { Flashcard, Note } from "@/hooks/useFlashcards";

interface DiscussPanelProps {
  card: Flashcard;
  onDiscuss: (cardId: string, message: string) => Promise<Flashcard>;
  onClose: () => void;
}

/**
 * Discussion panel for chatting with AI about a flashcard.
 * The explanation (if any) appears as the first assistant message.
 * All messages are persisted as notes on the card.
 */
export default function DiscussPanel({ card, onDiscuss, onClose }: DiscussPanelProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState<Note[]>(card.notes || []);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Build display messages: explanation first, then notes
  const displayMessages: { role: "user" | "assistant"; content: string }[] = [];
  if (card.explanation) {
    displayMessages.push({ role: "assistant", content: card.explanation });
  }
  displayMessages.push(...notes);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [notes]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || sending) return;

    const userMsg = message.trim();
    setMessage("");
    setError("");
    setSending(true);

    // Optimistically add user message
    setNotes((prev) => [...prev, { role: "user", content: userMsg, createdAt: new Date().toISOString() }]);

    try {
      const updated = await onDiscuss(card._id, userMsg);
      setNotes(updated.notes || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send");
      // Remove optimistic user message on error
      setNotes((prev) => prev.slice(0, -1));
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: "rgba(26, 23, 20, 0.6)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white dark:bg-ink-900 sm:rounded-2xl rounded-t-2xl shadow-warm-xl border border-surface-200/60 dark:border-ink-800 flex flex-col max-h-[85vh] sm:max-h-[600px] animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200/60 dark:border-ink-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-4 h-4 text-accent-600 dark:text-accent-400" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-ink-900 dark:text-surface-100 truncate">
                Discuss with AI
              </h3>
              <p className="text-[11px] text-surface-500 dark:text-ink-400 truncate">
                {card.question.length > 50 ? card.question.slice(0, 50) + "..." : card.question}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-surface-400 hover:text-ink-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-ink-800 transition-all cursor-pointer"
            aria-label="Close discussion"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {displayMessages.length === 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-surface-400 dark:text-ink-500">
                Ask anything about this flashcard.
              </p>
            </div>
          )}

          {displayMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-ink-950 dark:bg-surface-100 text-white dark:text-ink-950 rounded-2xl rounded-br-md"
                    : "bg-surface-100 dark:bg-ink-800 text-ink-800 dark:text-surface-200 rounded-2xl rounded-bl-md"
                }`}
              >
                {i === 0 && card.explanation && msg.role === "assistant" && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-surface-400 dark:text-ink-500 block mb-1">
                    Explanation
                  </span>
                )}
                {msg.content}
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-start">
              <div className="bg-surface-100 dark:bg-ink-800 text-surface-400 dark:text-ink-500 rounded-2xl rounded-bl-md px-4 py-3">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-5 mb-2 p-2.5 bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 text-xs rounded-xl font-medium">
            {error}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSend} className="px-5 py-4 border-t border-surface-200/60 dark:border-ink-800">
          <div className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about this card..."
              disabled={sending}
              className="input-field flex-1 !py-2.5"
            />
            <button
              type="submit"
              disabled={sending || !message.trim()}
              className="w-10 h-10 rounded-xl bg-accent-600 hover:bg-accent-700 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
