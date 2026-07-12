"use client";

import { useTransition } from "react";
import { updateJobStatus } from "./actions";

const FLOW: Record<string, { next: string; label: string } | null> = {
  booked: { next: "en_route", label: "Mark en route" },
  en_route: { next: "in_progress", label: "Mark started" },
  in_progress: { next: "done", label: "Mark done" },
  done: null,
  invoiced: null,
  paid: null,
};

export function StatusControl({
  jobId,
  status,
}: {
  jobId: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  const step = FLOW[status];
  if (!step) return null;
  return (
    <button
      onClick={() => start(() => updateJobStatus(jobId, step.next))}
      disabled={pending}
      className="btn-green w-full disabled:opacity-60"
    >
      {pending ? "Saving…" : step.label}
    </button>
  );
}
