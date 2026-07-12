"use client";

import { useState, useTransition } from "react";
import { checkEvent } from "./actions";

export function CheckInButton({
  jobId,
  alreadyIn,
}: {
  jobId: string;
  alreadyIn: boolean;
}) {
  const [done, setDone] = useState(alreadyIn);
  const [pending, start] = useTransition();
  const [note, setNote] = useState<string | null>(null);

  function checkIn() {
    if (!("geolocation" in navigator)) {
      start(() => checkEvent(jobId, "check_in", null).then(() => setDone(true)));
      setNote("Checked in (no location available)");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        start(() =>
          checkEvent(jobId, "check_in", {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          }).then(() => setDone(true)),
        );
        setNote("Checked in — GPS location recorded");
      },
      () => {
        start(() => checkEvent(jobId, "check_in", null).then(() => setDone(true)));
        setNote("Checked in (location permission denied)");
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }

  if (done) {
    return (
      <div className="rounded-xl bg-accent-soft px-4 py-3 text-center text-sm font-bold text-accent">
        ✓ Checked in{note ? ` — ${note.replace("Checked in — ", "").replace("Checked in ", "")}` : ""}
      </div>
    );
  }

  return (
    <button onClick={checkIn} disabled={pending} className="btn-green w-full disabled:opacity-60">
      {pending ? "Checking in…" : "Check in at site"}
    </button>
  );
}
