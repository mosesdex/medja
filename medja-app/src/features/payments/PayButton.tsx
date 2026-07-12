"use client";

import { useState, useTransition } from "react";
import { createPaymentLink } from "./actions";

export function PayButton({ invoiceId }: { invoiceId: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function pay() {
    setError(null);
    start(async () => {
      try {
        const url = await createPaymentLink(invoiceId);
        window.open(url, "_blank", "noopener");
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not create link");
      }
    });
  }

  return (
    <div className="flex-1">
      <button onClick={pay} disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? "Creating link…" : "Pay with Paystack"}
      </button>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
