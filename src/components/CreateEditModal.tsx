"use client";

import { useState, useEffect } from "react";
import { X, Save, Plus, Loader2 } from "lucide-react";
import type { Flashcard, FlashcardInput } from "@/hooks/useFlashcards";

interface CreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (input: FlashcardInput) => Promise<void>;
  onUpdate?: (id: string, input: Partial<FlashcardInput>) => Promise<void>;
  editCard?: Flashcard | null;
  existingCategories: string[];
}

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
        className="modal-content w-full max-w-lg bg-white dark:bg-ink-900 rounded-2xl shadow-warm-xl border border-surface-200/60 dark:border-ink-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h2 className="font-display text-2xl italic text-ink-950 dark:text-surface-50">
              {isEditing ? "Edit Card" : "New Card"}
            </h2>
            <p className="text-xs text-surface-500 dark:text-ink-400 mt-1 font-medium">
              {isEditing ? "Update your flashcard" : "Add to your collection"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-surface-400 hover:text-ink-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-ink-800 transition-all cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="mx-6 mt-4 mb-0 border-t border-surface-200/60 dark:border-ink-800" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errors.form && (
            <div className="p-3 bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 text-sm rounded-xl border border-accent-200/60 dark:border-accent-800/30 font-medium">
              {errors.form}
            </div>
          )}

          {/* Question */}
          <div>
            <label className="block text-xs font-semibold text-surface-500 dark:text-ink-400 mb-2 uppercase tracking-wider">
              Question <span className="text-accent-500">*</span>
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="What do you want to learn?"
              rows={2}
              className={`input-field resize-none ${
                errors.question ? "!border-accent-400 dark:!border-accent-600" : ""
              }`}
            />
            {errors.question && (
              <p className="mt-1.5 text-xs text-accent-600 font-medium">{errors.question}</p>
            )}
          </div>

          {/* Answer */}
          <div>
            <label className="block text-xs font-semibold text-surface-500 dark:text-ink-400 mb-2 uppercase tracking-wider">
              Answer <span className="text-accent-500">*</span>
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="The answer you want to remember"
              rows={2}
              className={`input-field resize-none ${
                errors.answer ? "!border-accent-400 dark:!border-accent-600" : ""
              }`}
            />
            {errors.answer && (
              <p className="mt-1.5 text-xs text-accent-600 font-medium">{errors.answer}</p>
            )}
          </div>

          {/* Explanation */}
          <div>
            <label className="block text-xs font-semibold text-surface-500 dark:text-ink-400 mb-2 uppercase tracking-wider">
              Explanation <span className="text-surface-400 dark:text-ink-600 normal-case tracking-normal font-medium">(optional)</span>
            </label>
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Add context or a deeper explanation..."
              rows={2}
              className="input-field resize-none"
            />
          </div>

          {/* Category + Difficulty */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs font-semibold text-surface-500 dark:text-ink-400 mb-2 uppercase tracking-wider">
                Category <span className="text-accent-500">*</span>
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., JavaScript"
                list="category-list"
                className={`input-field ${
                  errors.category ? "!border-accent-400 dark:!border-accent-600" : ""
                }`}
              />
              <datalist id="category-list">
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat} />
                ))}
              </datalist>
              {errors.category && (
                <p className="mt-1.5 text-xs text-accent-600 font-medium">{errors.category}</p>
              )}
            </div>

            <div className="w-36">
              <label className="block text-xs font-semibold text-surface-500 dark:text-ink-400 mb-2 uppercase tracking-wider">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as "easy" | "medium" | "hard")}
                className="input-field"
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
            className="btn-primary w-full !py-3"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
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
