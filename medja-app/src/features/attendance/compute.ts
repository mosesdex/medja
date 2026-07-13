export interface JobEvent {
  staffId: string | null;
  type: "check_in" | "check_out";
  at: string; // ISO timestamp
}

export interface StaffAttendance {
  staffId: string;
  sessions: number; // completed check-in→check-out pairs
  openSessions: number; // check-ins without a matching check-out
  minutes: number; // total worked minutes across completed sessions
}

/**
 * Pair check-in / check-out events per staff into work sessions and sum the
 * minutes worked. Events may arrive unordered; we sort by time per staff.
 * An unmatched check-in counts as an open session with no minutes.
 */
export function computeAttendance(events: JobEvent[]): StaffAttendance[] {
  const byStaff = new Map<string, JobEvent[]>();
  for (const e of events) {
    if (!e.staffId) continue;
    if (!byStaff.has(e.staffId)) byStaff.set(e.staffId, []);
    byStaff.get(e.staffId)!.push(e);
  }

  const out: StaffAttendance[] = [];
  for (const [staffId, evs] of byStaff) {
    const sorted = [...evs].sort(
      (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
    );
    let minutes = 0;
    let sessions = 0;
    let openSessions = 0;
    let openAt: number | null = null;

    for (const e of sorted) {
      if (e.type === "check_in") {
        // a new check-in while one is open leaves the previous one open
        if (openAt !== null) openSessions++;
        openAt = new Date(e.at).getTime();
      } else if (e.type === "check_out" && openAt !== null) {
        minutes += Math.max(0, Math.round((new Date(e.at).getTime() - openAt) / 60000));
        sessions++;
        openAt = null;
      }
    }
    if (openAt !== null) openSessions++;
    out.push({ staffId, sessions, openSessions, minutes });
  }
  return out;
}

/** Format worked minutes as "Hh Mm" (e.g. 135 -> "2h 15m"). */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}
