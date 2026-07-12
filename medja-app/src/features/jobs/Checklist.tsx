"use client";

import { useState, useTransition } from "react";
import { toggleChecklistItem } from "./actions";

interface Item {
  id: string;
  label: string;
  done: boolean;
}

export function Checklist({ jobId, items }: { jobId: string; items: Item[] }) {
  const [state, setState] = useState(items);
  const [, startTransition] = useTransition();

  const done = state.filter((i) => i.done).length;
  const pct = state.length ? Math.round((done / state.length) * 100) : 0;

  function toggle(id: string) {
    const next = state.map((i) => (i.id === id ? { ...i, done: !i.done } : i));
    setState(next);
    const item = next.find((i) => i.id === id)!;
    startTransition(() => toggleChecklistItem(id, item.done, jobId));
  }

  return (
    <div className="card p-4">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold">Checklist</h3>
        <span className="text-xs font-bold text-muted">
          {done}/{state.length} done
        </span>
      </div>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted-bg">
        <div
          className="h-full rounded-full bg-accent transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
      {state.map((i) => (
        <button
          key={i.id}
          onClick={() => toggle(i.id)}
          className="flex w-full items-center gap-3 border-b border-line py-3 text-left last:border-none"
        >
          <span
            className={`flex h-6 w-6 flex-none items-center justify-center rounded-lg border-2 text-white transition ${
              i.done ? "border-accent bg-accent" : "border-line"
            }`}
          >
            {i.done && "✓"}
          </span>
          <span
            className={`flex-1 text-sm font-semibold ${
              i.done ? "text-muted line-through" : ""
            }`}
          >
            {i.label}
          </span>
        </button>
      ))}
    </div>
  );
}
