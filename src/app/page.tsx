"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Plus, Search, SlidersHorizontal, X, Loader2, Inbox, AlertTriangle, Sparkles } from "lucide-react";
import Header from "@/components/Header";
import FlashcardCard from "@/components/FlashcardCard";
import CreateEditModal from "@/components/CreateEditModal";
import AIGenerator from "@/components/AIGenerator";
import StudyMode from "@/components/StudyMode";
import DiscussPanel from "@/components/DiscussPanel";
import { useFlashcards } from "@/hooks/useFlashcards";
import type { Flashcard, FlashcardInput } from "@/hooks/useFlashcards";

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
    discussWithAI,
  } = useFlashcards();

  const [activeTab, setActiveTab] = useState("cards");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCard, setEditCard] = useState<Flashcard | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [discussCard, setDiscussCard] = useState<Flashcard | null>(null);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    flashcards.forEach((card) => {
      counts[card.category] = (counts[card.category] || 0) + 1;
    });
    return counts;
  }, [flashcards]);

  const handleCreate = async (input: FlashcardInput) => {
    await createFlashcard(input);
    toast.success("Flashcard created!");
  };

  const handleUpdate = async (id: string, input: Partial<FlashcardInput>) => {
    await updateFlashcard(id, input);
    toast.success("Flashcard updated!");
  };

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

  const handleAIGenerate = async (topic: string, count: number, difficulty: string) => {
    const cards = await generateWithAI(topic, count, difficulty);
    toast.success(`Generated ${cards.length} flashcard${cards.length > 1 ? "s" : ""}!`);
    setActiveTab("cards");
  };

  const handleEdit = (card: Flashcard) => {
    setEditCard(card);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setEditCard(null);
  };

  const handleDiscuss = (card: Flashcard) => {
    // Get the latest version of the card from state
    const latest = flashcards.find((c) => c._id === card._id) || card;
    setDiscussCard(latest);
  };

  const handleDiscussMessage = async (cardId: string, message: string) => {
    const updated = await discussWithAI(cardId, message);
    // Keep the discuss panel in sync with latest card data
    setDiscussCard(updated);
    return updated;
  };

  const hasActiveFilters = filters.category !== "all" || filters.difficulty !== "all";

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        cardCount={flashcards.length}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full px-5 sm:px-8 py-8">
        {/* Cards View */}
        {activeTab === "cards" && (
          <div className="animate-fade-in">
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-8">
              <div className="relative flex-1 w-full sm:max-w-sm">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400 dark:text-ink-500" />
                <input
                  type="text"
                  placeholder="Search flashcards..."
                  value={filters.search}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, search: e.target.value }))
                  }
                  className="input-field !pl-10 !pr-9"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters((prev) => ({ ...prev, search: "" }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-ink-700 dark:hover:text-surface-300 transition-colors cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    showFilters || hasActiveFilters
                      ? "border-accent-300 dark:border-accent-700 text-accent-700 dark:text-accent-300 bg-accent-50 dark:bg-accent-900/20"
                      : "border-surface-200 dark:border-ink-700 text-surface-600 dark:text-ink-300 bg-white dark:bg-ink-900 hover:border-surface-300 dark:hover:border-ink-600"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {hasActiveFilters && (
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />
                  )}
                </button>

                <button
                  onClick={() => {
                    setEditCard(null);
                    setShowCreateModal(true);
                  }}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Card</span>
                </button>
              </div>
            </div>

            {/* Filter panel */}
            {showFilters && (
              <div className="mb-8 p-5 bg-white dark:bg-ink-900 rounded-2xl border border-surface-200/80 dark:border-ink-800 animate-slide-down shadow-warm-sm">
                <div className="flex flex-wrap gap-6">
                  <div>
                    <label className="block text-[10px] font-semibold text-surface-500 dark:text-ink-400 mb-2.5 uppercase tracking-widest">
                      Category
                    </label>
                    <div className="flex flex-wrap gap-1.5">
                      <button
                        onClick={() => setFilters((prev) => ({ ...prev, category: "all" }))}
                        className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all duration-200 cursor-pointer ${
                          filters.category === "all"
                            ? "bg-ink-950 dark:bg-surface-100 text-white dark:text-ink-950"
                            : "bg-surface-100 dark:bg-ink-800 text-surface-500 dark:text-ink-400 hover:bg-surface-200 dark:hover:bg-ink-700"
                        }`}
                      >
                        All
                      </button>
                      {categories.map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setFilters((prev) => ({ ...prev, category: cat }))}
                          className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all duration-200 cursor-pointer ${
                            filters.category === cat
                              ? "bg-ink-950 dark:bg-surface-100 text-white dark:text-ink-950"
                              : "bg-surface-100 dark:bg-ink-800 text-surface-500 dark:text-ink-400 hover:bg-surface-200 dark:hover:bg-ink-700"
                          }`}
                        >
                          {cat} ({categoryCounts[cat]})
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-semibold text-surface-500 dark:text-ink-400 mb-2.5 uppercase tracking-widest">
                      Difficulty
                    </label>
                    <div className="flex gap-1.5">
                      {["all", "easy", "medium", "hard"].map((d) => (
                        <button
                          key={d}
                          onClick={() => setFilters((prev) => ({ ...prev, difficulty: d }))}
                          className={`text-xs px-3 py-1.5 rounded-full capitalize font-semibold transition-all duration-200 cursor-pointer ${
                            filters.difficulty === d
                              ? "bg-ink-950 dark:bg-surface-100 text-white dark:text-ink-950"
                              : "bg-surface-100 dark:bg-ink-800 text-surface-500 dark:text-ink-400 hover:bg-surface-200 dark:hover:bg-ink-700"
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

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
                <Loader2 className="w-6 h-6 text-accent-500 animate-spin mb-3" />
                <p className="text-sm text-surface-500 dark:text-ink-400 font-medium">Loading your cards...</p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="text-center py-24 animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="font-display text-xl italic text-ink-800 dark:text-surface-200 mb-1">
                  Connection error
                </h3>
                <p className="text-sm text-surface-500 dark:text-ink-400 mb-5 max-w-xs mx-auto">
                  {error}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="text-sm text-accent-600 dark:text-accent-400 hover:underline font-semibold cursor-pointer"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Empty */}
            {!loading && !error && flashcards.length === 0 && (
              <div className="text-center py-24 animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-surface-100 dark:bg-ink-800 flex items-center justify-center mx-auto mb-5">
                  <Inbox className="w-7 h-7 text-surface-400 dark:text-ink-500" />
                </div>
                <h3 className="font-display text-2xl italic text-ink-800 dark:text-surface-200 mb-2">
                  Start your collection
                </h3>
                <p className="text-sm text-surface-500 dark:text-ink-400 mb-8 max-w-xs mx-auto">
                  Create your first flashcard or let AI generate a set for you.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setEditCard(null);
                      setShowCreateModal(true);
                    }}
                    className="btn-secondary"
                  >
                    <Plus className="w-4 h-4" />
                    Create Manually
                  </button>
                  <button
                    onClick={() => setActiveTab("ai")}
                    className="btn-primary"
                  >
                    <Sparkles className="w-4 h-4" />
                    Generate with AI
                  </button>
                </div>
              </div>
            )}

            {/* Grid */}
            {!loading && !error && flashcards.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {flashcards.map((card) => (
                  <FlashcardCard
                    key={card._id}
                    card={card}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onDiscuss={handleDiscuss}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Study */}
        {activeTab === "study" && (
          <div className="animate-fade-in py-4">
            <StudyMode flashcards={flashcards} onDiscuss={handleDiscuss} />
          </div>
        )}

        {/* AI Generate */}
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

      {/* Discuss Panel */}
      {discussCard && (
        <DiscussPanel
          card={discussCard}
          onDiscuss={handleDiscussMessage}
          onClose={() => setDiscussCard(null)}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div
            className="modal-content bg-white dark:bg-ink-900 rounded-2xl p-7 max-w-sm w-full shadow-warm-xl border border-surface-200/60 dark:border-ink-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className="w-14 h-14 rounded-2xl bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-7 h-7 text-accent-500" />
              </div>
              <h3 className="font-display text-xl italic text-ink-900 dark:text-surface-100 mb-2">
                Delete this card?
              </h3>
              <p className="text-sm text-surface-500 dark:text-ink-400 mb-6">
                This action cannot be undone.
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
