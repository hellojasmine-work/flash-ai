"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Plus, Search, SlidersHorizontal, X, Loader2, Inbox, AlertTriangle, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import FlashcardCard from "@/components/FlashcardCard";
import CreateEditModal from "@/components/CreateEditModal";
import AIGenerator from "@/components/AIGenerator";
import StudyMode from "@/components/StudyMode";
import { useFlashcards } from "@/hooks/useFlashcards";
import type { Flashcard, FlashcardInput } from "@/hooks/useFlashcards";

/**
 * Main application page — Single Page Application.
 * All views (Cards, Study, AI Generate) are rendered within this page
 * and switched via client-side state (no page reloads).
 */
export default function Home() {
  const {
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
  } = useFlashcards();

  const [activeTab, setActiveTab] = useState("cards");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCard, setEditCard] = useState<Flashcard | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Category counts for filter display
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    flashcards.forEach((card) => {
      counts[card.category] = (counts[card.category] || 0) + 1;
    });
    return counts;
  }, [flashcards]);

  // Handle creating a new flashcard
  const handleCreate = async (input: FlashcardInput) => {
    await createFlashcard(input);
    toast.success("Flashcard created!");
  };

  // Handle updating a flashcard
  const handleUpdate = async (id: string, input: Partial<FlashcardInput>) => {
    await updateFlashcard(id, input);
    toast.success("Flashcard updated!");
  };

  // Handle deleting a flashcard
  const handleDelete = async (id: string) => {
    setDeleteConfirm(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteFlashcard(deleteConfirm);
      toast.success("Flashcard deleted");
    } catch {
      toast.error("Failed to delete flashcard");
    }
    setDeleteConfirm(null);
  };

  // Handle AI generation
  const handleAIGenerate = async (topic: string, count: number, difficulty: string) => {
    const cards = await generateWithAI(topic, count, difficulty);
    toast.success(`Generated ${cards.length} flashcard${cards.length > 1 ? "s" : ""}!`);
    setActiveTab("cards");
  };

  // Handle edit
  const handleEdit = (card: Flashcard) => {
    setEditCard(card);
    setShowCreateModal(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditCard(null);
  };

  const hasActiveFilters = filters.category !== "all" || filters.difficulty !== "all";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cardCount={flashcards.length}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {/* Cards View */}
        {activeTab === "cards" && (
          <div className="animate-fade-in">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
              {/* Search bar */}
              <div className="relative flex-1 w-full sm:max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search flashcards..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="input-base !pl-10 !pr-8"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Filter toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                    showFilters || hasActiveFilters
                      ? "border-brand-300 dark:border-brand-600 text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
                  )}
                </button>

                {/* Create button */}
                <button
                  onClick={() => {
                    setEditCard(null);
                    setShowCreateModal(true);
                  }}
                  className="btn-primary flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Card</span>
                </button>
              </div>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div className="mb-6 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 animate-slide-down shadow-soft">
                <div className="flex flex-wrap gap-6">
                  {/* Category filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, category: "all" }))
                        }
                        className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                          filters.category === "all"
                            ? "bg-brand-600 text-white shadow-sm"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        All
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, category: cat }))
                          }
                          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all duration-200 cursor-pointer ${
                            filters.category === cat
                              ? "bg-brand-600 text-white shadow-sm"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {cat} ({categoryCounts[cat]})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">
                      Difficulty
                    </label>
                    <div className="flex gap-1.5">
                      {["all", "easy", "medium", "hard"].map((d) => (
                        <button
                          key={d}
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, difficulty: d }))
                          }
                          className={`text-xs px-3 py-1.5 rounded-lg capitalize font-medium transition-all duration-200 cursor-pointer ${
                            filters.difficulty === d
                              ? "bg-brand-600 text-white shadow-sm"
                              : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
                <Loader2 className="w-8 h-8 text-brand-500 animate-spin mb-3" />
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading flashcards...</p>
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="text-center py-20 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-8 h-8 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Connection Error
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 max-w-sm mx-auto">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-brand-600 dark:text-brand-400 hover:underline font-medium cursor-pointer"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && flashcards.length === 0 && (
              <div className="text-center py-20 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Inbox className="w-8 h-8 text-slate-400 dark:text-slate-500" />
                </div>
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  No flashcards yet
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
                  Create your first flashcard manually or let AI generate a set for you!
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setEditCard(null);
                      setShowCreateModal(true);
                    }}
                    className="btn-secondary flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Create Manually
                  </button>
                  <button
                    onClick={() => setActiveTab("ai")}
                    className="btn-primary flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate with AI
                  </button>
                </div>
              </div>
            )}

            {/* Flashcard grid */}
            {!loading && !error && flashcards.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {flashcards.map((card) => (
                  <FlashcardCard
                    key={card._id}
                    card={card}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Study View */}
        {activeTab === "study" && (
          <div className="animate-fade-in py-4">
            <StudyMode flashcards={flashcards} />
          </div>
        )}

        {/* AI Generate View */}
        {activeTab === "ai" && (
          <div className="animate-fade-in py-4">
            <AIGenerator onGenerate={handleAIGenerate} />
          </div>
        )}
      </main>

      {/* Create/Edit Modal */}
      <CreateEditModal
        isOpen={showCreateModal}
        onClose={handleCloseModal}
        onSave={handleCreate}
        onUpdate={handleUpdate}
        editCard={editCard}
        existingCategories={categories}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div
            className="modal-content bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full shadow-soft-xl border border-slate-200/80 dark:border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-rose-500" />
              </div>
              <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-2">
                Delete Flashcard?
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
                This action cannot be undone. The flashcard will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="btn-danger flex-1"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
