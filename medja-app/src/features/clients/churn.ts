export type ChurnStatus = "active" | "at_risk" | "churned";

export interface ClientActivity {
  clientId: string;
  name: string;
  lastJobAt: string | null; // ISO date of most recent job, or null if none
}

export interface ClientChurn extends ClientActivity {
  status: ChurnStatus;
  daysSince: number | null;
}

/**
 * Classify clients by recency of their last job:
 *   active   — last job within `atRiskDays`
 *   at_risk  — last job between `atRiskDays` and `churnedDays` ago
 *   churned  — last job more than `churnedDays` ago (or never)
 */
export function classifyChurn(
  clients: ClientActivity[],
  now: Date,
  { atRiskDays = 30, churnedDays = 90 }: { atRiskDays?: number; churnedDays?: number } = {},
): ClientChurn[] {
  return clients.map((c) => {
    if (!c.lastJobAt) {
      return { ...c, status: "churned" as const, daysSince: null };
    }
    const daysSince = Math.floor(
      (now.getTime() - new Date(c.lastJobAt).getTime()) / 86_400_000,
    );
    let status: ChurnStatus = "active";
    if (daysSince > churnedDays) status = "churned";
    else if (daysSince > atRiskDays) status = "at_risk";
    return { ...c, status, daysSince };
  });
}
