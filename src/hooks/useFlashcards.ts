"use client";

import { useState, useEffect, useCallback } from "react";

export interface Note {
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Flashcard {
  _id: string;
  question: string;
  answer: string;
  explanation: string;
  category: string;
  difficulty: "easy" | "medium" | "hard";
  isAIGenerated: boolean;
  notes: Note[];
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardInput {
  question: string;
  answer: string;
  explanation?: string;
  category: string;
  difficulty?: "easy" | "medium" | "hard";
}

interface Filters {
  category: string;
  difficulty: string;
  search: string;
}

/**
 * Custom hook for managing flashcard data and CRUD operations.
 * Centralizes all API calls and state management.
 */
export function useFlashcards() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Filters>({
    category: "all",
    difficulty: "all",
    search: "",
  });

  // Fetch all flashcards with current filters
  const fetchFlashcards = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filters.category !== "all") params.set("category", filters.category);
      if (filters.difficulty !== "all") params.set("difficulty", filters.difficulty);
      if (filters.search) params.set("search", filters.search);

      const res = await fetch(`/api/flashcards?${params.toString()}`);
      const json = await res.json();

      if (!json.success) throw new Error(json.error);
      setFlashcards(json.data);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load flashcards";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Create a new flashcard
  const createFlashcard = async (input: FlashcardInput): Promise<Flashcard> => {
    const res = await fetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    setFlashcards((prev) => [json.data, ...prev]);
    return json.data;
  };

  // Update an existing flashcard
  const updateFlashcard = async (
    id: string,
    input: Partial<FlashcardInput>
  ): Promise<Flashcard> => {
    const res = await fetch(`/api/flashcards/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    setFlashcards((prev) =>
      prev.map((card) => (card._id === id ? json.data : card))
    );
    return json.data;
  };

  // Delete a flashcard
  const deleteFlashcard = async (id: string): Promise<void> => {
    const res = await fetch(`/api/flashcards/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    setFlashcards((prev) => prev.filter((card) => card._id !== id));
  };

  // AI generate flashcards
  const generateWithAI = async (
    topic: string,
    count: number,
    difficulty: string
  ): Promise<Flashcard[]> => {
    const res = await fetch("/api/ai/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, count, difficulty }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);

    setFlashcards((prev) => [...json.data, ...prev]);
    return json.data;
  };

  // Send a discuss message — only returns updated card, does NOT update global state
  // This avoids re-rendering the entire card grid on every chat message.
  const discussWithAI = async (
    id: string,
    message: string
  ): Promise<Flashcard> => {
    const res = await fetch(`/api/flashcards/${id}/discuss`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    return json.data;
  };

  // Sync a card's notes back into global state (call when closing discuss panel)
  const syncCardNotes = (id: string, notes: Note[]) => {
    setFlashcards((prev) =>
      prev.map((card) => (card._id === id ? { ...card, notes } : card))
    );
  };

  // Get unique categories from existing flashcards
  const categories = Array.from(
    new Set(flashcards.map((card) => card.category))
  ).sort();

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  return {
    flashcards,
    loading,
    error,
    filters,
    setFilters,
    categories,
    createFlashcard,
    updateFlashcard,
    deleteFlashcard,
    generateWithAI,
    discussWithAI,
    syncCardNotes,
    refetch: fetchFlashcards,
  };
}
