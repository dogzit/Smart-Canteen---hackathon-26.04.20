// hooks/useAuth.ts
"use client";

const USERS_KEY = "app_users";
const SESSION_KEY = "app_session";

interface User {
  name: string;
  email: string;
  password: string;
}

function getUsers(): User[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function useAuth() {
  function signup(name: string, email: string, password: string) {
    const users = getUsers();
    if (users.find((u) => u.email === email))
      return { ok: false, msg: "Энэ имэйл аль хэдийн бүртгэлтэй." };
    users.push({ name, email, password });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    return { ok: true, msg: "" };
  }

  function login(email: string, password: string): boolean {
    const user = getUsers().find(
      (u) => u.email === email && u.password === password,
    );
    if (!user) return false;
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return true;
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY);
  }

  function getSession(): Omit<User, "password"> | null {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) return null;
      const { name, email } = JSON.parse(raw);
      return { name, email };
    } catch {
      return null;
    }
  }

  return { signup, login, logout, getSession };
}
