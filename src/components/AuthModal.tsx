"use client";

import { useState } from "react";
import { X, LogIn, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (username: string, email: string, password: string) => Promise<void>;
}

export default function AuthModal({ isOpen, onClose, onLogin, onRegister }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const reset = () => {
    setUsername("");
    setEmail("");
    setPassword("");
    setError("");
    setShowPassword(false);
  };

  const switchMode = (next: "login" | "register") => {
    setMode(next);
    reset();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await onLogin(email, password);
      } else {
        await onRegister(username, email, password);
      }
      reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content w-full max-w-sm bg-white dark:bg-ink-900 rounded-2xl shadow-warm-xl border border-surface-200/60 dark:border-ink-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-0">
          <div>
            <h2 className="font-display text-2xl italic text-ink-950 dark:text-surface-50">
              {mode === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-xs text-surface-500 dark:text-ink-400 mt-1 font-medium">
              {mode === "login" ? "Sign in to your account" : "Start your learning journey"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-surface-400 hover:text-ink-700 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-ink-800 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mx-6 mt-4 border-t border-surface-200/60 dark:border-ink-800" />

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300 text-sm rounded-xl border border-accent-200/60 dark:border-accent-800/30 font-medium">
              {error}
            </div>
          )}

          {mode === "register" && (
            <div>
              <label className="block text-xs font-semibold text-surface-500 dark:text-ink-400 mb-2 uppercase tracking-wider">
                Username <span className="text-accent-500">*</span>
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="your_username"
                required
                minLength={3}
                className="input-field"
                disabled={loading}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-surface-500 dark:text-ink-400 mb-2 uppercase tracking-wider">
              Email <span className="text-accent-500">*</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="input-field"
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-surface-500 dark:text-ink-400 mb-2 uppercase tracking-wider">
              Password <span className="text-accent-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === "register" ? "At least 6 characters" : "Enter password"}
                required
                minLength={6}
                className="input-field !pr-10"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-ink-700 dark:hover:text-surface-200 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : mode === "login" ? (
              <>
                <LogIn className="w-4 h-4" />
                Sign In
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                Create Account
              </>
            )}
          </button>
        </form>

        {/* Switch mode */}
        <div className="px-6 pb-6 text-center">
          <p className="text-sm text-surface-500 dark:text-ink-400">
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}
            {" "}
            <button
              onClick={() => switchMode(mode === "login" ? "register" : "login")}
              className="text-accent-600 dark:text-accent-400 font-semibold hover:underline cursor-pointer"
            >
              {mode === "login" ? "Sign up" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
