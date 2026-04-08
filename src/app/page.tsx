"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Plus, Search, SlidersHorizontal, X, Loader2 } from "lucide-react";
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

  return (
    <div className="min-h-screen flex flex-col">
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
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search flashcards..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                {/* Filter toggle */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-1.5 ${
                    showFilters || filters.category !== "all" || filters.difficulty !== "all"
                      ? "border-violet-300 dark:border-violet-600 text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/10"
                      : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                </button>

                {/* Create button */}
                <button
                  onClick={() => {
                    setEditCard(null);
                    setShowCreateModal(true);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium text-sm hover:from-violet-600 hover:to-indigo-700 transition-all flex items-center gap-1.5 shadow-sm shadow-violet-500/20"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Card</span>
                </button>
              </div>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div className="mb-6 p-4 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 animate-slide-down">
                <div className="flex flex-wrap gap-4">
                  {/* Category filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, category: "all" }))
                        }
                        className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                          filters.category === "all"
                            ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
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
                          className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                            filters.category === cat
                              ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                          }`}
                        >
                          {cat} ({categoryCounts[cat]})
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Difficulty filter */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                      Difficulty
                    </label>
                    <div className="flex gap-1.5">
                      {["all", "easy", "medium", "hard"].map((d) => (
                        <button
                          key={d}
                          onClick={() =>
                            setFilters((prev) => ({ ...prev, difficulty: d }))
                          }
                          className={`text-xs px-2.5 py-1 rounded-lg capitalize transition-all ${
                            filters.difficulty === d
                              ? "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 font-medium"
                              : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
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
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 text-violet-500 animate-spin" />
              </div>
            )}

            {/* Error state */}
            {error && !loading && (
              <div className="text-center py-20">
                <div className="text-4xl mb-3">⚠️</div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Connection Error
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-violet-600 dark:text-violet-400 hover:underline"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && flashcards.length === 0 && (
              <div className="text-center py-20 animate-fade-in">
                <div className="text-5xl mb-4">🃏</div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  No flashcards yet
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm mx-auto">
                  Create your first flashcard manually or let AI generate a set for you!
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setEditCard(null);
                      setShowCreateModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    Create Manually
                  </button>
                  <button
                    onClick={() => setActiveTab("ai")}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-indigo-600 text-white font-medium text-sm hover:from-violet-600 hover:to-indigo-700 transition-all flex items-center gap-1.5"
                  >
                    ✨ Generate with AI
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
            className="modal-content bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-200 dark:border-gray-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="text-4xl mb-3">🗑️</div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Delete Flashcard?
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                This action cannot be undone. The flashcard will be permanently removed.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium transition-all"
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
