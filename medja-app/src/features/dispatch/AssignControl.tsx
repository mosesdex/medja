"use client";

import { useTransition } from "react";
import { assignStaff, unassignStaff } from "./actions";

interface Staff {
  id: string;
  name: string;
}

export function AssignControl({
  jobId,
  allStaff,
  assignedIds,
}: {
  jobId: string;
  allStaff: Staff[];
  assignedIds: string[];
}) {
  const [pending, start] = useTransition();
  const assigned = allStaff.filter((s) => assignedIds.includes(s.id));
  const available = allStaff.filter((s) => !assignedIds.includes(s.id));

  return (
    <div className="card p-4">
      <h3 className="mb-2 font-display text-sm font-semibold">Team</h3>
      <div className="mb-2 flex flex-wrap gap-2">
        {assigned.length === 0 && (
          <span className="text-sm text-muted">No one assigned yet.</span>
        )}
        {assigned.map((s) => (
          <button
            key={s.id}
            disabled={pending}
            onClick={() => start(() => unassignStaff(jobId, s.id))}
            className="badge bg-primary-soft text-primary"
            title="Tap to remove"
          >
            {s.name} ✕
          </button>
        ))}
      </div>
      {available.length > 0 && (
        <select
          defaultValue=""
          disabled={pending}
          onChange={(e) => {
            if (e.target.value) start(() => assignStaff(jobId, e.target.value));
          }}
          className="w-full rounded-xl border border-line px-3 py-2.5 text-sm outline-none focus:border-primary"
        >
          <option value="">+ Assign staff…</option>
          {available.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      )}
    </div>
  );
}
