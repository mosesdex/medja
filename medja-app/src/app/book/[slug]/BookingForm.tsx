"use client";

import { useState } from "react";
import { submitBooking } from "./actions";

export function BookingForm({ slug }: { slug: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const field =
    "mt-1 w-full rounded-xl border border-line px-4 py-3 text-base outline-none focus:border-primary";

  if (done) {
    return (
      <div className="card p-6 text-center">
        <div className="font-display text-lg font-semibold text-accent">Booking received ✓</div>
        <p className="mt-2 text-sm text-muted">
          Thank you — the cleaning company will confirm your appointment shortly.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        setError(null);
        const res = await submitBooking(slug, new FormData(e.currentTarget));
        setPending(false);
        if (res.ok) setDone(true);
        else setError(res.error ?? "Something went wrong");
      }}
      className="card flex flex-col gap-4 p-5"
    >
      <label className="text-sm font-semibold">
        Your name
        <input name="name" required className={field} />
      </label>
      <label className="text-sm font-semibold">
        Phone (WhatsApp)
        <input name="phone" type="tel" required className={field} placeholder="0803…" />
      </label>
      <label className="text-sm font-semibold">
        Service
        <select name="type" className={field} defaultValue="residential">
          <option value="residential">Home / residential</option>
          <option value="commercial">Office / commercial</option>
          <option value="post_construction">Post-construction</option>
        </select>
      </label>
      <label className="text-sm font-semibold">
        Preferred date & time
        <input name="when" type="datetime-local" required className={field} />
      </label>
      <label className="text-sm font-semibold">
        Anything we should know?
        <input name="note" className={field} placeholder="Address, number of rooms…" />
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? "Sending…" : "Request booking"}
      </button>
    </form>
  );
}
