"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Users,
  Loader2,
  Trash2,
  BookOpen,
  CheckCircle2,
  MessageCircle,
  Clock,
  Eye,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Layers,
  Sparkles,
  UserCircle2,
} from "lucide-react";

interface UserStats {
  totalActions: number;
  views: number;
  studied: number;
  discussed: number;
  lastActive: string | null;
  cardsCreated: number;
  aiGenerated: number;
}

interface AdminUser {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  stats: UserStats;
}

interface AdminSummary {
  totalUsers: number;
  totalCards: number;
  anonymousCards: number;
  cardsByUsers: number;
}

interface HistoryEntry {
  _id: string;
  userId: { _id: string; username: string; email: string };
  flashcardId: string;
  flashcardQuestion: string;
  flashcardCategory: string;
  action: "view" | "study" | "discuss";
  createdAt: string;
}

export default function AdminPanel() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "history">("users");

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data);
        if (json.summary) setSummary(json.summary);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const res = await fetch("/api/view-history?limit=50");
      if (res.ok) {
        const json = await res.json();
        setHistory(json.data);
      }
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchHistory();
  }, [fetchUsers, fetchHistory]);

  const handleDelete = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setUsers((prev) => prev.filter((u) => u._id !== userId));
        setHistory((prev) => prev.filter((h) => h.userId?._id !== userId));
      }
    } finally {
      setDeleteConfirm(null);
    }
  };

  const formatDate = (iso: string | null) => {
    if (!iso) return "Never";
    return new Date(iso).toLocaleDateString("en-AU", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const actionIcon = (action: string) => {
    if (action === "study") return <CheckCircle2 className="w-3.5 h-3.5 text-sage-500" />;
    if (action === "discuss") return <MessageCircle className="w-3.5 h-3.5 text-accent-500" />;
    return <Eye className="w-3.5 h-3.5 text-ink-400 dark:text-ink-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="font-display text-3xl italic text-ink-950 dark:text-surface-50">
          Admin Panel
        </h2>
      </div>

      {/* Dashboard summary */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            {
              label: "Total Users",
              value: summary.totalUsers,
              icon: <UserCircle2 className="w-4 h-4" />,
            },
            {
              label: "Total Cards",
              value: summary.totalCards,
              icon: <Layers className="w-4 h-4" />,
            },
            {
              label: "Cards by Users",
              value: summary.cardsByUsers,
              icon: <BookOpen className="w-4 h-4" />,
            },
            {
              label: "Legacy / Anonymous",
              value: summary.anonymousCards,
              icon: <Sparkles className="w-4 h-4" />,
            },
          ].map(({ label, value, icon }) => (
            <div
              key={label}
              className="bg-white dark:bg-ink-900 rounded-2xl border border-surface-200/80 dark:border-ink-800 shadow-warm p-4"
            >
              <div className="flex items-center gap-2 text-surface-400 dark:text-ink-500 mb-1">
                {icon}
                <span className="text-[10px] font-semibold uppercase tracking-wide">
                  {label}
                </span>
              </div>
              <div className="text-2xl font-bold text-ink-900 dark:text-surface-100">
                {value}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub-tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-ink-950 dark:bg-surface-100 text-white dark:text-ink-950"
              : "bg-surface-100 dark:bg-ink-800 text-surface-600 dark:text-ink-400 hover:bg-surface-200 dark:hover:bg-ink-700"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" /> Users ({users.length})
          </span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
            activeTab === "history"
              ? "bg-ink-950 dark:bg-surface-100 text-white dark:text-ink-950"
              : "bg-surface-100 dark:bg-ink-800 text-surface-600 dark:text-ink-400 hover:bg-surface-200 dark:hover:bg-ink-700"
          }`}
        >
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" /> Learning History ({history.length})
          </span>
        </button>
      </div>

      {/* USERS TAB */}
      {activeTab === "users" && (
        <>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-accent-500" />
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-16 text-surface-500 dark:text-ink-400 text-sm">
              No users found.
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((u) => (
                <div
                  key={u._id}
                  className="bg-white dark:bg-ink-900 rounded-2xl border border-surface-200/80 dark:border-ink-800 shadow-warm overflow-hidden"
                >
                  <div className="flex items-center justify-between p-4 sm:p-5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-accent-50 dark:bg-accent-900/20 flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-bold text-accent-600 dark:text-accent-400">
                          {u.username[0].toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-ink-900 dark:text-surface-100 truncate">
                            {u.username}
                          </span>
                          {u.role === "admin" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 uppercase tracking-wide">
                              Admin
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-surface-500 dark:text-ink-400 truncate">{u.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* Stats pills */}
                      <div className="hidden sm:flex items-center gap-3">
                        <span
                          className="flex items-center gap-1 text-xs text-surface-500 dark:text-ink-400"
                          title="Cards created"
                        >
                          <Layers className="w-3 h-3" /> {u.stats.cardsCreated}
                        </span>
                        <span
                          className="flex items-center gap-1 text-xs text-surface-500 dark:text-ink-400"
                          title="Total learning actions"
                        >
                          <BookOpen className="w-3 h-3" /> {u.stats.totalActions}
                        </span>
                      </div>

                      <button
                        onClick={() => setExpandedUser(expandedUser === u._id ? null : u._id)}
                        className="w-7 h-7 flex items-center justify-center rounded-full text-surface-400 hover:bg-surface-100 dark:hover:bg-ink-800 transition-colors cursor-pointer"
                      >
                        {expandedUser === u._id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>

                      {u.role !== "admin" && (
                        <button
                          onClick={() => setDeleteConfirm(u._id)}
                          className="w-7 h-7 flex items-center justify-center rounded-full text-surface-400 hover:text-accent-600 dark:hover:text-accent-400 hover:bg-accent-50 dark:hover:bg-accent-900/20 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded stats */}
                  {expandedUser === u._id && (
                    <div className="px-5 pb-5 border-t border-surface-100 dark:border-ink-800 pt-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-3">
                        {[
                          { label: "Cards Created", value: u.stats.cardsCreated, icon: <Layers className="w-3.5 h-3.5" /> },
                          { label: "AI Generated", value: u.stats.aiGenerated, icon: <Sparkles className="w-3.5 h-3.5" /> },
                          { label: "Total Actions", value: u.stats.totalActions, icon: <BookOpen className="w-3.5 h-3.5" /> },
                          { label: "Cards Viewed", value: u.stats.views, icon: <Eye className="w-3.5 h-3.5" /> },
                          { label: "Cards Studied", value: u.stats.studied, icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
                          { label: "Discussions", value: u.stats.discussed, icon: <MessageCircle className="w-3.5 h-3.5" /> },
                        ].map(({ label, value, icon }) => (
                          <div key={label} className="bg-surface-50 dark:bg-ink-800/50 rounded-xl p-3 text-center">
                            <div className="flex justify-center mb-1 text-surface-400 dark:text-ink-500">{icon}</div>
                            <div className="text-lg font-bold text-ink-900 dark:text-surface-100">{value}</div>
                            <div className="text-[10px] text-surface-500 dark:text-ink-400 font-medium">{label}</div>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-surface-400 dark:text-ink-500">
                        <span>Joined: {formatDate(u.createdAt)}</span>
                        <span>•</span>
                        <span>Last active: {formatDate(u.stats.lastActive)}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* HISTORY TAB */}
      {activeTab === "history" && (
        <>
          {historyLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-5 h-5 animate-spin text-accent-500" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-16 text-surface-500 dark:text-ink-400 text-sm">
              No learning history yet.
            </div>
          ) : (
            <div className="bg-white dark:bg-ink-900 rounded-2xl border border-surface-200/80 dark:border-ink-800 shadow-warm overflow-hidden">
              <div className="divide-y divide-surface-100 dark:divide-ink-800">
                {history.map((entry) => (
                  <div key={entry._id} className="flex items-center gap-3 px-5 py-3">
                    <div className="flex-shrink-0">{actionIcon(entry.action)}</div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ink-800 dark:text-surface-200 truncate">
                        <span className="font-semibold">{entry.userId?.username || "Unknown"}</span>
                        {" "}
                        <span className="text-surface-500 dark:text-ink-400">
                          {entry.action === "study" ? "studied" : entry.action === "discuss" ? "discussed" : "viewed"}
                        </span>
                        {" "}
                        <span className="italic">{entry.flashcardQuestion.slice(0, 60)}{entry.flashcardQuestion.length > 60 ? "…" : ""}</span>
                      </p>
                      <p className="text-[11px] text-surface-400 dark:text-ink-500 mt-0.5">
                        {entry.flashcardCategory} · {formatDate(entry.createdAt)}
                      </p>
                    </div>
                    <span
                      className={`flex-shrink-0 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${
                        entry.action === "study"
                          ? "bg-sage-50 dark:bg-sage-900/20 text-sage-600 dark:text-sage-400"
                          : entry.action === "discuss"
                          ? "bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400"
                          : "bg-surface-100 dark:bg-ink-800 text-surface-500 dark:text-ink-400"
                      }`}
                    >
                      {entry.action}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Delete confirmation */}
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
              <h3 className="font-display text-xl italic text-ink-900 dark:text-surface-100 mb-2">Delete this user?</h3>
              <p className="text-sm text-surface-500 dark:text-ink-400 mb-6">
                This will permanently delete the account and all their learning history.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
