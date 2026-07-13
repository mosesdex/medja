"use client";

import { useTransition } from "react";
import { deleteExpense } from "./actions";

export function DeleteExpense({ id }: { id: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => deleteExpense(id))}
      disabled={pending}
      aria-label="Delete expense"
      className="px-2 text-muted hover:text-danger disabled:opacity-50"
    >
      {pending ? "…" : "✕"}
    </button>
  );
}
