"use client";

import { useTransition } from "react";
import { markInvoicePaid } from "@/features/invoices/actions";

export function MarkPaidButton({ invoiceId }: { invoiceId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => markInvoicePaid(invoiceId))}
      disabled={pending}
      className="btn-green flex-1 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Mark as paid"}
    </button>
  );
}
