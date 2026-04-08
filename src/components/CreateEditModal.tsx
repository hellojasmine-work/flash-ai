"use client";

import { useState, useEffect } from "react";
import { X, Save, Plus } from "lucide-react";
import type { Flashcard, FlashcardInput } from "@/hooks/useFlashcards";

interface CreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: FlashcardInput) => Promise<void>;
  onUpdate?: (id: string, input: Partial<FlashcardInput>) => Promise<void>;
  editCard?: Flashcard | null;
  existingCategories: string[];
}

/**
 * Modal for creating a new flashcard or editing an existing one.
 * Supports manual input with category autocomplete.
 */
export default function CreateEditModal({
  isOpen,
  onClose,
  onSave,
  onUpdate,
  editCard,
  existingCategories,
}: CreateEditModalProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [explanation, setExplanation] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEditing = !!editCard;

  // Populate form when editing
  useEffect(() => {
    if (editCard) {
      setQuestion(editCard.question);
      setAnswer(editCard.answer);
      setExplanation(editCard.explanation || "");
      setCategory(editCard.category);
      setDifficulty(editCard.difficulty);
    } else {
      setQuestion("");
      setAnswer("");
      setExplanation("");
      setCategory("");
      setDifficulty("medium");
    }
    setErrors({});
  }, [editCard, isOpen]);

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!question.trim()) newErrors.question = "Question is required";
    if (!answer.trim()) newErrors.answer = "Answer is required";
    if (!category.trim()) newErrors.category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      const input: FlashcardInput = {
        question: question.trim(),
        answer: answer.trim(),
        explanation: explanation.trim(),
        category: category.trim(),
        difficulty,
      };

      if (isEditing && editCard && onUpdate) {
        await onUpdate(editCard._id, input);
      } else {
        await onSave(input);
      }
      onClose();
    } catch {
      setErrors({ form: "Failed to save. Please try again." });
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-full max-w-lg bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-lg font-semibold">
            {isEditing ? "Edit Flashcard" : "Create Flashcard"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {errors.form && (
            <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-sm rounded-xl">
              {errors.form}
            </div>
          )}

          {/* Question */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Question <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter your question..."
              rows={2}
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                errors.question
                  ? "border-rose-300 dark:border-rose-700"
                  : "border-gray-200 dark:border-gray-700"
              } bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none text-sm`}
            />
            {errors.question && (
              <p className="mt-1 text-xs text-rose-500">{errors.question}</p>
            )}
          </div>

          {/* Answer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Answer <span className="text-rose-500">*</span>
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter the answer..."
              rows={2}
              className={`w-full px-3.5 py-2.5 rounded-xl border ${
                errors.answer
                  ? "border-rose-300 dark:border-rose-700"
                  : "border-gray-200 dark:border-gray-700"
              } bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none text-sm`}
            />
            {errors.answer && (
              <p className="mt-1 text-xs text-rose-500">{errors.answer}</p>
            )}
          </div>

          {/* Explanation (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Explanation <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Add a detailed explanation..."
              rows={2}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all resize-none text-sm"
            />
          </div>

          {/* Category + Difficulty row */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Category <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., JavaScript"
                list="category-list"
                className={`w-full px-3.5 py-2.5 rounded-xl border ${
                  errors.category
                    ? "border-rose-300 dark:border-rose-700"
                    : "border-gray-200 dark:border-gray-700"
                } bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm`}
              />
              <datalist id="category-list">
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              {errors.category && (
                <p className="mt-1 text-xs text-rose-500">{errors.category}</p>
              )}
            </div>

            <div className="w-36">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all text-sm"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium text-sm hover:from-violet-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isEditing ? (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Create Flashcard
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
