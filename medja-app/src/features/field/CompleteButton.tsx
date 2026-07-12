"use client";

import { useTransition } from "react";
import { completeJob } from "./actions";

export function CompleteButton({ jobId }: { jobId: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      onClick={() => start(() => completeJob(jobId))}
      disabled={pending}
      className="btn-primary flex-1 disabled:opacity-60"
    >
      {pending ? "Saving…" : "Complete job"}
    </button>
  );
}
