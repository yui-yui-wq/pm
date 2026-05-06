"use client";

import { FormEvent, useEffect, useState } from "react";
import { KanbanBoard } from "@/components/KanbanBoard";

const SESSION_KEY = "pm-authenticated";
const DEMO_USER = "user";
const DEMO_PASSWORD = "password";

export const AuthGate = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setAuthenticated(sessionStorage.getItem(SESSION_KEY) === "true");
    setReady(true);
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (username === DEMO_USER && password === DEMO_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, "true");
      setAuthenticated(true);
      setError("");
      return;
    }
    setError("IDかパスワードが違います。もう一度確認してください。");
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setAuthenticated(false);
    setUsername("");
    setPassword("");
    setError("");
  };

  if (!ready) {
    return null;
  }

  if (!authenticated) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-xl items-center px-6 py-12">
        <section className="w-full rounded-3xl border border-[var(--stroke)] bg-white p-8 shadow-[var(--shadow)]">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--gray-text)]">
            Sign In Required
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-[var(--navy-dark)]">
            Kanban Studio
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--gray-text)]">
            まずログインしてください。MVPではテスト用の固定アカウントを使います。
          </p>
          <div className="mt-4 rounded-xl bg-[var(--surface)] p-4 text-sm text-[var(--navy-dark)]">
            <p>
              ID: <span className="font-semibold">user</span>
            </p>
            <p>
              Password: <span className="font-semibold">password</span>
            </p>
          </div>
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--navy-dark)]">
                User ID
              </span>
              <input
                className="w-full rounded-xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary-blue)]"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-[var(--navy-dark)]">
                Password
              </span>
              <input
                className="w-full rounded-xl border border-[var(--stroke)] bg-white px-4 py-3 text-sm outline-none transition focus:border-[var(--primary-blue)]"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>
            {error ? (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </p>
            ) : null}
            <button
              className="w-full rounded-xl bg-[var(--secondary-purple)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              type="submit"
            >
              Sign in
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <>
      <div className="sticky top-0 z-20 border-b border-[var(--stroke)] bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-[1500px] items-center justify-between px-6 py-3">
          <p className="text-sm text-[var(--gray-text)]">
            Logged in as <span className="font-semibold text-[var(--navy-dark)]">user</span>
          </p>
          <button
            className="rounded-lg border border-[var(--stroke)] px-3 py-2 text-sm font-semibold text-[var(--navy-dark)] hover:bg-[var(--surface)]"
            onClick={handleLogout}
            type="button"
          >
            Log out
          </button>
        </div>
      </div>
      <KanbanBoard />
    </>
  );
};
