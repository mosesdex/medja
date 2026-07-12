"use client";

import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function sendLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo:
          (process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin) +
          "/auth/callback",
      },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSent(true);
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary font-display text-xl font-bold text-white">
          M
        </div>
        <span className="font-display text-2xl font-bold">Medja</span>
      </div>

      {sent ? (
        <div className="card p-6 text-center">
          <h1 className="font-display text-lg font-semibold">Check your email</h1>
          <p className="mt-2 text-sm text-muted">
            We sent a sign-in link to <b>{email}</b>. Open it on this phone to
            continue.
          </p>
        </div>
      ) : (
        <form onSubmit={sendLink} className="card flex flex-col gap-4 p-6">
          <div>
            <h1 className="font-display text-lg font-semibold">Sign in</h1>
            <p className="text-sm text-muted">
              Enter your email — we&apos;ll send a magic link.
            </p>
          </div>
          <label className="text-sm font-semibold">
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-1 w-full rounded-xl border border-line px-4 py-3 text-base outline-none focus:border-primary"
            />
          </label>
          {error && <p className="text-sm text-danger">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send sign-in link"}
          </button>
        </form>
      )}
    </main>
  );
}
