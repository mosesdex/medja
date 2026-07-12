"use client";

import { useState, useTransition } from "react";
import { seedDemoData } from "./seed";

export function SeedButton() {
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <div>
      <button
        onClick={() =>
          start(async () => {
            const r = await seedDemoData();
            setMsg(r.skipped ? "You already have data — skipped." : "Sample data loaded ✓");
          })
        }
        disabled={pending}
        className="btn-outline disabled:opacity-60"
      >
        {pending ? "Loading…" : "Load sample data"}
      </button>
      {msg && <p className="mt-2 text-sm text-muted">{msg}</p>}
    </div>
  );
}
