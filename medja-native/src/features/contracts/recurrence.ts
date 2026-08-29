/**
 * Recurrence: given a contract's weekdays + time and a horizon, produce the
 * job datetimes that should exist but don't yet. Pure and deterministic.
 */
export interface RecurrenceSpec {
  weekdays: number[]; // 0=Sun..6=Sat
  hour: number;
  minute: number;
}

/**
 * All occurrence datetimes from `from` (inclusive) through `horizonDays`,
 * excluding any already present in `existing` (compared by ISO date+time).
 */
export function occurrences(
  spec: RecurrenceSpec,
  from: Date,
  horizonDays: number,
  existing: Date[] = [],
): Date[] {
  const seen = new Set(existing.map((d) => dayKey(d)));
  const out: Date[] = [];
  const start = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  for (let i = 0; i <= horizonDays; i++) {
    const day = new Date(start.getTime() + i * 86_400_000);
    if (!spec.weekdays.includes(day.getDay())) continue;
    const when = new Date(
      day.getFullYear(),
      day.getMonth(),
      day.getDate(),
      spec.hour,
      spec.minute,
    );
    if (when.getTime() < from.getTime()) continue;
    if (seen.has(dayKey(when))) continue;
    out.push(when);
  }
  return out;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** True if today is the contract's billing day (day-of-month). */
export function isBillingDay(billingDay: number, today: Date): boolean {
  return today.getDate() === billingDay;
}
