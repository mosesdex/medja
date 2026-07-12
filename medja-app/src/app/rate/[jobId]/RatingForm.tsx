"use client";

import { useState } from "react";
import { submitRating } from "./actions";

export function RatingForm({ jobId }: { jobId: string }) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  if (done) {
    return (
      <div className="card p-6 text-center">
        <div className="font-display text-lg font-semibold text-accent">Thank you! ★</div>
        <p className="mt-2 text-sm text-muted">Your feedback helps us serve you better.</p>
      </div>
    );
  }

  async function submit() {
    if (stars < 1) {
      setError("Please tap a star rating");
      return;
    }
    setPending(true);
    setError(null);
    const res = await submitRating(jobId, stars, comment);
    setPending(false);
    if (res.ok) setDone(true);
    else setError(res.error ?? "Something went wrong");
  }

  return (
    <div className="card flex flex-col gap-4 p-5">
      <div className="text-center">
        <div className="mb-2 text-sm font-semibold">How was your cleaning?</div>
        <div className="flex justify-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setStars(n)}
              className={`text-4xl transition ${n <= stars ? "text-amber" : "text-line"}`}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Any comments? (optional)"
        rows={3}
        className="w-full rounded-xl border border-line px-4 py-3 text-base outline-none focus:border-primary"
      />
      {error && <p className="text-sm text-danger">{error}</p>}
      <button onClick={submit} disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? "Sending…" : "Submit rating"}
      </button>
    </div>
  );
}
