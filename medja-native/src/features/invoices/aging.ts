export type AgingBucket = "current" | "1-30" | "31-60" | "60+";

export const AGING_LABELS: Record<AgingBucket, string> = {
  current: "Not yet due",
  "1-30": "1–30 days",
  "31-60": "31–60 days",
  "60+": "60+ days",
};

export interface UnpaidInvoice {
  id: string;
  balanceKobo: number;
  dueAt: string | null; // ISO date the invoice is/was due
}

/** Which aging bucket an invoice falls into, given days overdue. */
export function agingBucket(dueAt: string | null, now: Date): AgingBucket {
  if (!dueAt) return "current";
  const days = Math.floor((now.getTime() - new Date(dueAt).getTime()) / 86_400_000);
  if (days <= 0) return "current";
  if (days <= 30) return "1-30";
  if (days <= 60) return "31-60";
  return "60+";
}

export interface AgingSummary {
  buckets: Record<AgingBucket, number>; // total kobo per bucket
  totalKobo: number;
  overdueKobo: number; // everything except "current"
}

/** Total outstanding kobo per aging bucket across unpaid invoices. */
export function summarizeAging(invoices: UnpaidInvoice[], now: Date): AgingSummary {
  const buckets: Record<AgingBucket, number> = {
    current: 0,
    "1-30": 0,
    "31-60": 0,
    "60+": 0,
  };
  for (const inv of invoices) {
    buckets[agingBucket(inv.dueAt, now)] += inv.balanceKobo;
  }
  const totalKobo = Object.values(buckets).reduce((s, v) => s + v, 0);
  return { buckets, totalKobo, overdueKobo: totalKobo - buckets.current };
}
