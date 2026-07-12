"use client";

import { useState, useTransition } from "react";
import { recordDeposit } from "./actions";

export function DepositForm({ invoiceId }: { invoiceId: string }) {
  const [amount, setAmount] = useState("");
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn-outline w-full">
        Record deposit / part-payment
      </button>
    );
  }

  return (
    <div className="card flex gap-2 p-3">
      <input
        type="number"
        min="0"
        step="500"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="₦ amount"
        className="flex-1 rounded-xl border border-line px-3 py-2.5 text-base outline-none focus:border-primary"
      />
      <button
        onClick={() => {
          const n = Number(amount);
          if (n > 0) start(() => recordDeposit(invoiceId, n).then(() => setOpen(false)));
        }}
        disabled={pending}
        className="btn-primary disabled:opacity-60"
      >
        {pending ? "…" : "Record"}
      </button>
    </div>
  );
}
