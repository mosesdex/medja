"use client";

import { useTransition } from "react";
import { setQuoteStatus, quoteToInvoice } from "./actions";

export function QuoteActions({
  quoteId,
  status,
}: {
  quoteId: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  const invoiced = status === "invoiced";

  return (
    <div className="flex gap-2">
      {status === "draft" && (
        <button
          onClick={() => start(() => setQuoteStatus(quoteId, "accepted"))}
          disabled={pending}
          className="btn-outline flex-1 disabled:opacity-60"
        >
          Mark accepted
        </button>
      )}
      {!invoiced && (
        <button
          onClick={() => start(() => quoteToInvoice(quoteId))}
          disabled={pending}
          className="btn-primary flex-1 disabled:opacity-60"
        >
          {pending ? "Working…" : "Convert to invoice"}
        </button>
      )}
      {invoiced && (
        <div className="flex-1 rounded-xl bg-accent-soft px-4 py-3 text-center text-sm font-bold text-accent">
          ✓ Converted to invoice
        </div>
      )}
    </div>
  );
}
