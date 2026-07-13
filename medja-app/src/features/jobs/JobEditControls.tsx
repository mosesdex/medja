"use client";

import { useState, useTransition } from "react";
import { editJob, deleteJob } from "./actions";

/**
 * Reschedule a job / edit its notes, and cancel (delete) it.
 * `scheduledLocal` is the job's time pre-formatted for a datetime-local input.
 */
export function JobEditControls({
  jobId,
  scheduledLocal,
  notes,
}: {
  jobId: string;
  scheduledLocal: string;
  notes: string;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [pending, start] = useTransition();
  const field =
    "mt-1 w-full rounded-xl border border-line px-4 py-3 text-base outline-none focus:border-primary";

  return (
    <div className="card p-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-semibold"
      >
        Reschedule / edit
        <span className="text-muted">{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <form action={editJob} className="mt-3 flex flex-col gap-3">
          <input type="hidden" name="job_id" value={jobId} />
          <label className="text-sm font-semibold">
            Date & time
            <input
              name="scheduled_at"
              type="datetime-local"
              defaultValue={scheduledLocal}
              className={field}
            />
          </label>
          <label className="text-sm font-semibold">
            Notes
            <textarea name="notes" defaultValue={notes} rows={2} className={field} />
          </label>
          <button className="btn-primary w-full">Save changes</button>
        </form>
      )}

      <div className="mt-3 border-t border-line pt-3">
        {confirming ? (
          <div className="flex items-center gap-2">
            <span className="flex-1 text-sm text-danger">Cancel this job permanently?</span>
            <button onClick={() => setConfirming(false)} className="btn-outline px-3 py-2 text-sm">
              Keep
            </button>
            <button
              onClick={() => start(() => deleteJob(jobId))}
              disabled={pending}
              className="btn px-3 py-2 text-sm font-bold text-white"
              style={{ background: "var(--danger, #DC2626)" }}
            >
              {pending ? "…" : "Yes, cancel"}
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="text-sm font-semibold text-danger"
          >
            Cancel job
          </button>
        )}
      </div>
    </div>
  );
}
