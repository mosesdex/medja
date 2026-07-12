"use client";

import { useState } from "react";
import { createQuote } from "@/features/quotes/actions";
import { formatNaira, toKobo } from "@/lib/money";

interface Client {
  id: string;
  name: string;
}
interface Template {
  label: string;
  floor_kobo: number;
}

export function QuoteForm({
  clients,
  templates,
}: {
  clients: Client[];
  templates: Template[];
}) {
  const [lines, setLines] = useState([{ label: "", amount: "" }]);

  const total = lines.reduce((s, l) => s + toKobo(Number(l.amount) || 0), 0);
  const field =
    "w-full rounded-xl border border-line px-3 py-2.5 text-base outline-none focus:border-primary";

  function addTemplate(t: Template) {
    setLines((prev) => {
      const next = prev.filter((l) => l.label || l.amount);
      next.push({
        label: t.label,
        amount: t.floor_kobo > 0 ? String(t.floor_kobo / 100) : "",
      });
      return next;
    });
  }

  return (
    <form action={createQuote} className="card flex flex-col gap-4 p-5">
      <label className="text-sm font-semibold">
        Client
        <select name="client_id" required className={`mt-1 ${field}`}>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </label>

      {templates.length > 0 && (
        <div>
          <div className="mb-1 text-sm font-semibold">Quick add from templates</div>
          <div className="flex flex-wrap gap-2">
            {templates.map((t) => (
              <button
                key={t.label}
                type="button"
                onClick={() => addTemplate(t)}
                className="badge bg-primary-soft text-primary"
              >
                + {t.label}
                {t.floor_kobo > 0 ? ` (${formatNaira(t.floor_kobo)})` : ""}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-1 text-sm font-semibold">Lines</div>
        <div className="flex flex-col gap-2">
          {lines.map((l, i) => (
            <div key={i} className="flex gap-2">
              <input
                name="line_label"
                placeholder="Description"
                value={l.label}
                onChange={(e) => {
                  const next = [...lines];
                  next[i].label = e.target.value;
                  setLines(next);
                }}
                className={field}
              />
              <input
                name="line_amount"
                type="number"
                min="0"
                step="500"
                placeholder="₦"
                value={l.amount}
                onChange={(e) => {
                  const next = [...lines];
                  next[i].amount = e.target.value;
                  setLines(next);
                }}
                className="w-28 rounded-xl border border-line px-3 py-2.5 text-base outline-none focus:border-primary"
              />
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setLines([...lines, { label: "", amount: "" }])}
          className="mt-2 text-sm font-semibold text-primary"
        >
          + Add line
        </button>
      </div>

      <div className="flex justify-between rounded-xl bg-muted-bg p-3 font-display text-base font-bold">
        <span>Total</span>
        <span className="money">{formatNaira(total)}</span>
      </div>

      <button type="submit" className="btn-primary w-full">Create quote</button>
    </form>
  );
}
