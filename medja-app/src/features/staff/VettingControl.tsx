"use client";

import { useTransition } from "react";
import { setVettingStatus } from "./actions";

export function VettingControl({
  staffId,
  status,
}: {
  staffId: string;
  status: string;
}) {
  const [pending, start] = useTransition();
  return (
    <select
      defaultValue={status}
      disabled={pending}
      onChange={(e) => start(() => setVettingStatus(staffId, e.target.value))}
      className="rounded-xl border border-line px-3 py-2 text-sm font-semibold outline-none focus:border-primary disabled:opacity-60"
    >
      <option value="pending">Pending</option>
      <option value="in_progress">In progress</option>
      <option value="vetted">Vetted</option>
      <option value="rejected">Rejected</option>
    </select>
  );
}
