import { createServerClient } from "@/lib/supabase/server";

export interface DashboardSummary {
  jobsToday: { id: string; when: string; client: string; type: string; status: string; valueKobo: number | null }[];
  collectedTodayKobo: number;
  outstandingKobo: number;
  overdueCount: number;
}

/** Start/end of today in the server's locale (WAT in production). */
function todayBounds() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);
  return { start, end };
}

export async function dashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createServerClient();
  const { start, end } = todayBounds();

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, scheduled_at, type, status, value_kobo, clients(name)")
    .gte("scheduled_at", start.toISOString())
    .lt("scheduled_at", end.toISOString())
    .order("scheduled_at");

  const { data: invoices } = await supabase
    .from("invoices")
    .select("total_kobo, deposit_kobo, status, created_at");

  const collectedTodayKobo = (invoices ?? [])
    .filter((i) => i.status === "paid" && new Date(i.created_at) >= start)
    .reduce((s, i) => s + i.total_kobo, 0);

  const outstandingKobo = (invoices ?? [])
    .filter((i) => i.status !== "paid")
    .reduce((s, i) => s + (i.total_kobo - i.deposit_kobo), 0);

  const overdueCount = (invoices ?? []).filter((i) => i.status === "overdue").length;

  return {
    jobsToday: (jobs ?? []).map((j) => ({
      id: j.id,
      when: new Date(j.scheduled_at).toLocaleTimeString("en-NG", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      client: (j.clients as unknown as { name: string } | null)?.name ?? "Client",
      type: j.type,
      status: j.status,
      valueKobo: j.value_kobo,
    })),
    collectedTodayKobo,
    outstandingKobo,
    overdueCount,
  };
}
