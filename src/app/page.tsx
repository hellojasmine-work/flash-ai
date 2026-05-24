"use client";

import { useState, useMemo } from "react";
import toast from "react-hot-toast";
import { Plus, Search, X, Loader2, Inbox, AlertTriangle, Sparkles, ArrowLeft, SlidersHorizontal } from "lucide-react";
import Header from "@/components/Header";
import BookCard from "@/components/BookCard";
import FlashcardCard from "@/components/FlashcardCard";
import CreateEditModal from "@/components/CreateEditModal";
import AIGenerator from "@/components/AIGenerator";
import StudyDeck from "@/components/StudyDeck";
import DiscussPanel from "@/components/DiscussPanel";
import AuthModal from "@/components/AuthModal";
import AdminPanel from "@/components/AdminPanel";
import ProfilePanel from "@/components/ProfilePanel";
import { useFlashcards } from "@/hooks/useFlashcards";
import { useAuth } from "@/hooks/useAuth";
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
    syncCardNotes,
  } = useFlashcards();

  const { user, loading: authLoading, login, register, logout, logHistory } = useAuth();

  const [activeTab, setActiveTab] = useState("cards");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [editCard, setEditCard] = useState<Flashcard | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [discussCard, setDiscussCard] = useState<Flashcard | null>(null);
  const [openBook, setOpenBook] = useState<string | null>(null);
  const [showDiffFilter, setShowDiffFilter] = useState(false);

  // Group flashcards by category into "books"
  const bookGroups = useMemo(() => {
    const groups: Record<string, Flashcard[]> = {};
    flashcards.forEach((card) => {
      if (filters.search) {
        const s = filters.search.toLowerCase();
        if (!card.question.toLowerCase().includes(s) && !card.answer.toLowerCase().includes(s)) return;
      }
      if (filters.difficulty !== "all" && card.difficulty !== filters.difficulty) return;
      if (!groups[card.category]) groups[card.category] = [];
      groups[card.category].push(card);
    });
    return groups;
  }, [flashcards, filters.search, filters.difficulty]);

  const bookCategories = Object.keys(bookGroups).sort();

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
    const latest = flashcards.find((c) => c._id === card._id) || card;
    setDiscussCard(latest);
    logHistory(card._id, card.question, card.category, "discuss");
  };

  const handleCardView = (card: Flashcard) => {
    logHistory(card._id, card.question, card.category, "view");
  };

  const handleCardStudied = (card: Flashcard) => {
    logHistory(card._id, card.question, card.category, "study");
  };

  const handleDiscussMessage = async (cardId: string, message: string) => {
    return await discussWithAI(cardId, message);
  };

  const handleDiscussClose = (cardId: string, notes: import("@/hooks/useFlashcards").Note[]) => {
    syncCardNotes(cardId, notes);
    setDiscussCard(null);
  };

  const handleLogin = async (email: string, password: string) => {
    await login(email, password);
    toast.success("Welcome back!");
  };

  const handleRegister = async (username: string, email: string, password: string) => {
    await register(username, email, password);
    toast.success("Account created!");
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Signed out");
    // Bounce away from tabs that require auth
    if (activeTab === "admin" || activeTab === "profile") setActiveTab("cards");
  };

  const hasActiveFilters = filters.difficulty !== "all";

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          setOpenBook(null);
        }}
        cardCount={flashcards.length}
        user={user}
        authLoading={authLoading}
        onLoginClick={() => setShowAuthModal(true)}
        onLogout={handleLogout}
      />

      <main className="flex-1 max-w-6xl mx-auto w-full px-5 sm:px-8 py-8">
        {/* ========== CARDS / BOOKS VIEW ========== */}
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
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
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
                  onClick={() => setShowDiffFilter(!showDiffFilter)}
                  className={`px-4 py-3 rounded-xl border text-sm font-semibold transition-all duration-200 flex items-center gap-2 cursor-pointer ${
                    showDiffFilter || hasActiveFilters
                      ? "border-accent-300 dark:border-accent-700 text-accent-700 dark:text-accent-300 bg-accent-50 dark:bg-accent-900/20"
                      : "border-surface-200 dark:border-ink-700 text-surface-600 dark:text-ink-300 bg-white dark:bg-ink-900"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span className="hidden sm:inline">Difficulty</span>
                  {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-accent-500" />}
                </button>
                <button
                  onClick={() => { setEditCard(null); setShowCreateModal(true); }}
                  className="btn-primary"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">New Card</span>
                </button>
              </div>
            </div>

            {/* Difficulty filter */}
            {showDiffFilter && (
              <div className="mb-8 flex gap-1.5 animate-slide-down">
                {["all", "easy", "medium", "hard"].map((d) => (
                  <button
                    key={d}
                    onClick={() => setFilters((prev) => ({ ...prev, difficulty: d }))}
                    className={`text-xs px-3 py-1.5 rounded-full capitalize font-semibold transition-all cursor-pointer ${
                      filters.difficulty === d
                        ? "bg-ink-950 dark:bg-surface-100 text-white dark:text-ink-950"
                        : "bg-surface-100 dark:bg-ink-800 text-surface-500 dark:text-ink-400 hover:bg-surface-200 dark:hover:bg-ink-700"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            )}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center justify-center py-24 animate-fade-in">
                <Loader2 className="w-6 h-6 text-accent-500 animate-spin mb-3" />
                <p className="text-sm text-surface-500 dark:text-ink-400 font-medium">Loading your books...</p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="text-center py-24 animate-fade-in">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="font-display text-xl italic text-ink-800 dark:text-surface-200 mb-1">Connection error</h3>
                <p className="text-sm text-surface-500 dark:text-ink-400 mb-5 max-w-xs mx-auto">{error}</p>
                <button onClick={() => window.location.reload()} className="text-sm text-accent-600 dark:text-accent-400 hover:underline font-semibold cursor-pointer">
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
                <h3 className="font-display text-2xl italic text-ink-800 dark:text-surface-200 mb-2">Start your library</h3>
                <p className="text-sm text-surface-500 dark:text-ink-400 mb-8 max-w-xs mx-auto">
                  Create your first flashcard or generate a set with AI.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => { setEditCard(null); setShowCreateModal(true); }} className="btn-secondary">
                    <Plus className="w-4 h-4" />
                    Create Manually
                  </button>
                  <button onClick={() => setActiveTab("ai")} className="btn-primary">
                    <Sparkles className="w-4 h-4" />
                    Generate with AI
                  </button>
                </div>
              </div>
            )}

            {/* Book shelf */}
            {!loading && !error && flashcards.length > 0 && !openBook && (
              <>
                {bookCategories.length === 0 && filters.search && (
                  <div className="text-center py-16">
                    <p className="text-sm text-surface-500 dark:text-ink-400">No cards match your search.</p>
                  </div>
                )}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
                  {bookCategories.map((cat, i) => (
                    <BookCard
                      key={cat}
                      category={cat}
                      cards={bookGroups[cat]}
                      onClick={() => setOpenBook(cat)}
                      index={i}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Open book — cards inside */}
            {!loading && !error && openBook && bookGroups[openBook] && (
              <div className="animate-fade-in">
                <button
                  onClick={() => setOpenBook(null)}
                  className="flex items-center gap-1.5 text-sm text-surface-500 dark:text-ink-400 hover:text-ink-700 dark:hover:text-surface-200 font-medium transition-colors cursor-pointer mb-6"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to shelf
                </button>

                <div className="mb-8">
                  <h2 className="font-display text-3xl italic text-ink-950 dark:text-surface-50 mb-1">
                    {openBook}
                  </h2>
                  <p className="text-sm text-surface-500 dark:text-ink-400">
                    {bookGroups[openBook].length} card{bookGroups[openBook].length !== 1 ? "s" : ""} in this book
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {bookGroups[openBook].map((card) => (
                    <FlashcardCard
                      key={card._id}
                      card={card}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                      onDiscuss={handleDiscuss}
                      onView={handleCardView}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Open book — filtered out */}
            {!loading && !error && openBook && !bookGroups[openBook] && (
              <div className="animate-fade-in text-center py-16">
                <p className="text-sm text-surface-500 dark:text-ink-400 mb-4">No cards match your current filters.</p>
                <button onClick={() => setOpenBook(null)} className="text-sm text-accent-600 hover:underline font-semibold cursor-pointer">
                  Back to shelf
                </button>
              </div>
            )}
          </div>
        )}

        {/* ========== STUDY VIEW ========== */}
        {activeTab === "study" && (
          <div className="animate-fade-in py-4">
            <StudyDeck
              flashcards={flashcards}
              onDiscuss={handleDiscuss}
              onStudied={handleCardStudied}
            />
          </div>
        )}

        {/* ========== AI GENERATE ========== */}
        {activeTab === "ai" && (
          <div className="animate-fade-in py-4">
            <AIGenerator onGenerate={handleAIGenerate} />
          </div>
        )}

        {/* ========== PROFILE PANEL ========== */}
        {activeTab === "profile" && user && (
          <div className="animate-fade-in py-4">
            <ProfilePanel user={user} />
          </div>
        )}

        {/* ========== ADMIN PANEL ========== */}
        {activeTab === "admin" && user?.role === "admin" && (
          <div className="animate-fade-in py-4">
            <AdminPanel />
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

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
          onClose={handleDiscussClose}
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
              <h3 className="font-display text-xl italic text-ink-900 dark:text-surface-100 mb-2">Delete this card?</h3>
              <p className="text-sm text-surface-500 dark:text-ink-400 mb-6">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={confirmDelete} className="btn-danger flex-1">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
