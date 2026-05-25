"use client";

import { useState } from "react";
import { X, Eye, EyeOff, User, Lock, CheckCircle } from "lucide-react";
import type { AuthUser } from "@/hooks/useAuth";

interface ProfileModalProps {
  user: AuthUser;
  onClose: () => void;
  onUpdate: (data: { email?: string; currentPassword?: string; newPassword?: string }) => Promise<void>;
}

export default function ProfileModal({ user, onClose, onUpdate }: ProfileModalProps) {
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [emailLoading, setEmailLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess(false);
    if (!email.trim() || email.trim() === user.email) return;
    setEmailLoading(true);
    try {
      await onUpdate({ email: email.trim() });
      setEmailSuccess(true);
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : "Failed to update email");
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters");
      return;
    }
    setPasswordLoading(true);
    try {
      await onUpdate({ currentPassword, newPassword });
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-ink-900 rounded-2xl shadow-warm-lg border border-surface-200/60 dark:border-ink-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 dark:border-ink-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-accent-500 flex items-center justify-center">
              <span className="text-sm font-bold text-white">{user.username[0].toUpperCase()}</span>
            </div>
            <div>
              <p className="text-sm font-bold text-ink-900 dark:text-surface-100">{user.username}</p>
              <p className="text-[11px] text-surface-500 dark:text-ink-400">Edit your profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-surface-400 hover:text-ink-800 dark:text-ink-500 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-ink-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Email Section */}
          <form onSubmit={handleEmailSubmit} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-surface-500 dark:text-ink-400 uppercase tracking-wide">
              <User className="w-3.5 h-3.5" />
              Change Email
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailSuccess(false); setEmailError(""); }}
              disabled={emailLoading}
              className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-ink-700 bg-surface-50 dark:bg-ink-800 text-ink-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-60"
              placeholder="New email address"
            />
            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
            {emailSuccess && (
              <p className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <CheckCircle className="w-3.5 h-3.5" /> Email updated successfully
              </p>
            )}
            <button
              type="submit"
              disabled={emailLoading || !email.trim() || email.trim() === user.email}
              className="btn-primary !px-4 !py-2 !text-xs w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {emailLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : (
                "Update Email"
              )}
            </button>
          </form>

          <div className="border-t border-surface-100 dark:border-ink-800" />

          {/* Password Section */}
          <form onSubmit={handlePasswordSubmit} className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-surface-500 dark:text-ink-400 uppercase tracking-wide">
              <Lock className="w-3.5 h-3.5" />
              Change Password
            </div>
            <div className="space-y-2">
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => { setCurrentPassword(e.target.value); setPasswordSuccess(false); setPasswordError(""); }}
                  disabled={passwordLoading}
                  className="w-full px-3 py-2 pr-9 rounded-lg border border-surface-200 dark:border-ink-700 bg-surface-50 dark:bg-ink-800 text-ink-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-60"
                  placeholder="Current password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-300 cursor-pointer"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => { setNewPassword(e.target.value); setPasswordSuccess(false); setPasswordError(""); }}
                  disabled={passwordLoading}
                  className="w-full px-3 py-2 pr-9 rounded-lg border border-surface-200 dark:border-ink-700 bg-surface-50 dark:bg-ink-800 text-ink-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-60"
                  placeholder="New password (min. 6 characters)"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-surface-400 dark:text-ink-500 hover:text-ink-700 dark:hover:text-ink-300 cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setPasswordSuccess(false); setPasswordError(""); }}
                disabled={passwordLoading}
                className="w-full px-3 py-2 rounded-lg border border-surface-200 dark:border-ink-700 bg-surface-50 dark:bg-ink-800 text-ink-900 dark:text-surface-100 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500 disabled:opacity-60"
                placeholder="Confirm new password"
              />
            </div>
            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            {passwordSuccess && (
              <p className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
                <CheckCircle className="w-3.5 h-3.5" /> Password updated successfully
              </p>
            )}
            <button
              type="submit"
              disabled={passwordLoading || !currentPassword || !newPassword || !confirmPassword}
              className="btn-primary !px-4 !py-2 !text-xs w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {passwordLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving…
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
