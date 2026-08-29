export interface RollupJob {
  siteId: string | null;
  valueKobo: number | null;
  status: string;
}

export interface SiteRollup {
  siteId: string | null;
  jobs: number;
  completed: number;
  valueKobo: number; // sum of job values (all jobs)
}

const DONE_STATUSES = new Set(["done", "invoiced", "paid"]);

/**
 * Aggregate a client's jobs by site: job count, completed count, and total
 * value per site. Jobs with no site are grouped under a null key.
 */
export function rollupBySite(jobs: RollupJob[]): SiteRollup[] {
  const map = new Map<string | null, SiteRollup>();
  for (const j of jobs) {
    const key = j.siteId;
    if (!map.has(key)) {
      map.set(key, { siteId: key, jobs: 0, completed: 0, valueKobo: 0 });
    }
    const r = map.get(key)!;
    r.jobs += 1;
    if (DONE_STATUSES.has(j.status)) r.completed += 1;
    r.valueKobo += j.valueKobo ?? 0;
  }
  // Sort by value desc, null-site last.
  return [...map.values()].sort((a, b) => {
    if (a.siteId === null) return 1;
    if (b.siteId === null) return -1;
    return b.valueKobo - a.valueKobo;
  });
}
