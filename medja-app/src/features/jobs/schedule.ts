export interface TimeWindow {
  start: number; // epoch ms
  end: number;
}

/** Default job duration when none is given (2 hours). */
export const DEFAULT_JOB_MS = 2 * 60 * 60 * 1000;

/** True if two windows overlap. */
export function overlaps(a: TimeWindow, b: TimeWindow): boolean {
  return a.start < b.end && b.start < a.end;
}

/**
 * Given a proposed window and existing windows for the same staff/team,
 * return the count of conflicts. Non-blocking: callers warn, not reject.
 */
export function countConflicts(
  proposed: TimeWindow,
  existing: TimeWindow[],
): number {
  return existing.filter((w) => overlaps(proposed, w)).length;
}
