"use client";

import { useState } from "react";
import { Lock, Mail, User as UserIcon, Shield, Loader2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import type { AuthUser } from "@/hooks/useAuth";

interface ProfilePanelProps {
  user: AuthUser;
}

export default function ProfilePanel({ user }: ProfilePanelProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (currentPassword === newPassword) {
      toast.error("New password must be different from current");
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);

      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update password");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h2 className="font-display text-3xl italic text-ink-950 dark:text-surface-50 mb-1">
          My Profile
        </h2>
        <p className="text-sm text-surface-500 dark:text-ink-400">
          Your account details and security settings.
        </p>
      </div>

      {/* Account info card */}
      <div className="bg-white dark:bg-ink-900 rounded-2xl border border-surface-200/80 dark:border-ink-800 shadow-warm p-6 mb-5">
        <h3 className="font-semibold text-sm text-ink-900 dark:text-surface-100 mb-4 flex items-center gap-2">
          <UserIcon className="w-4 h-4" /> Account Information
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-surface-400 dark:text-ink-500 mb-1.5">
              Username
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-50 dark:bg-ink-800/60 border border-surface-200/60 dark:border-ink-700/60">
              <UserIcon className="w-4 h-4 text-surface-400 dark:text-ink-500" />
              <span className="text-sm text-ink-900 dark:text-surface-100 font-medium">
                {user.username}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-surface-400 dark:text-ink-500 mb-1.5">
              Email
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-50 dark:bg-ink-800/60 border border-surface-200/60 dark:border-ink-700/60">
              <Mail className="w-4 h-4 text-surface-400 dark:text-ink-500" />
              <span className="text-sm text-ink-900 dark:text-surface-100 font-medium truncate">
                {user.email}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-surface-400 dark:text-ink-500 mb-1.5">
              Role
            </label>
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-surface-50 dark:bg-ink-800/60 border border-surface-200/60 dark:border-ink-700/60">
              <Shield className="w-4 h-4 text-surface-400 dark:text-ink-500" />
              <span className="text-sm text-ink-900 dark:text-surface-100 font-medium capitalize">
                {user.role}
              </span>
              {user.role === "admin" && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 uppercase tracking-wide">
                  Elevated
                </span>
              )}
            </div>
          </div>

          <p className="text-[11px] text-surface-400 dark:text-ink-500 pt-1">
            Username and email cannot be changed in this version.
          </p>
        </div>
      </div>

      {/* Change password card */}
      <div className="bg-white dark:bg-ink-900 rounded-2xl border border-surface-200/80 dark:border-ink-800 shadow-warm p-6">
        <h3 className="font-semibold text-sm text-ink-900 dark:text-surface-100 mb-1 flex items-center gap-2">
          <Lock className="w-4 h-4" /> Change Password
        </h3>
        <p className="text-xs text-surface-500 dark:text-ink-400 mb-5">
          Pick a new password of at least 6 characters. You stay signed in afterwards.
        </p>

        <form onSubmit={handleChangePassword} className="space-y-4">
          {/* Current password */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-surface-400 dark:text-ink-500 mb-1.5">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrent ? "text" : "password"}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 rounded-xl bg-white dark:bg-ink-800 border border-surface-200 dark:border-ink-700 text-sm text-ink-900 dark:text-surface-100 focus:outline-none focus:border-accent-400 dark:focus:border-accent-500 transition-colors"
                placeholder="Enter your current password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-ink-700 dark:hover:text-surface-300 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-surface-400 dark:text-ink-500 mb-1.5">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNew ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2.5 pr-10 rounded-xl bg-white dark:bg-ink-800 border border-surface-200 dark:border-ink-700 text-sm text-ink-900 dark:text-surface-100 focus:outline-none focus:border-accent-400 dark:focus:border-accent-500 transition-colors"
                placeholder="At least 6 characters"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-ink-700 dark:hover:text-surface-300 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-surface-400 dark:text-ink-500 mb-1.5">
              Confirm New Password
            </label>
            <input
              type={showNew ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-ink-800 border border-surface-200 dark:border-ink-700 text-sm text-ink-900 dark:text-surface-100 focus:outline-none focus:border-accent-400 dark:focus:border-accent-500 transition-colors"
              placeholder="Repeat your new password"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full mt-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Updating…
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" /> Update Password
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
