"use client";

import { useState, useEffect, useCallback } from "react";

export interface AuthUser {
  _id: string;
  username: string;
  email: string;
  role: "user" | "admin";
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const json = await res.json();
        setUser(json.data);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const register = async (username: string, email: string, password: string) => {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    setUser(json.data);
    return json.data as AuthUser;
  };

  const login = async (email: string, password: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    setUser(json.data);
    return json.data as AuthUser;
  };

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
  };

  const logHistory = useCallback(
    async (
      flashcardId: string,
      flashcardQuestion: string,
      flashcardCategory: string,
      action: "view" | "study" | "discuss"
    ) => {
      if (!user) return;
      try {
        await fetch("/api/view-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ flashcardId, flashcardQuestion, flashcardCategory, action }),
        });
      } catch {
        // Non-critical, fail silently
      }
    },
    [user]
  );

  const updateProfile = async (data: {
    email?: string;
    currentPassword?: string;
    newPassword?: string;
  }) => {
    const res = await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error);
    setUser(json.data);
    return json.data as AuthUser;
  };

  return { user, loading, register, login, logout, logHistory, updateProfile, refetch: fetchMe };
}
