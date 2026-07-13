import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { StatTile } from "@/components/ui";
import { formatNaira } from "@/lib/money";
import { classifyChurn } from "@/features/clients/churn";

const TYPE_LABEL: Record<string, string> = {
  residential: "Residential",
  commercial: "Commercial",
  post_construction: "Post-construction",
};

export default async function ReportsPage() {
  const supabase = await createServerClient();

  const { data: paidInvoices } = await supabase
    .from("invoices")
    .select("total_kobo, client_id, clients(name)")
    .eq("status", "paid");

  const { data: jobs } = await supabase.from("jobs").select("type, value_kobo");
  const { data: expenses } = await supabase.from("expenses").select("amount_kobo, category");
  const { data: ratings } = await supabase.from("ratings").select("stars");

  // Client churn: most recent job per client.
  const { data: clientRows } = await supabase
    .from("clients")
    .select("id, name, jobs(scheduled_at)");
  const churn = classifyChurn(
    (clientRows ?? []).map((c) => {
      const cjobs = (c.jobs as unknown as { scheduled_at: string }[]) ?? [];
      const last = cjobs
        .map((j) => j.scheduled_at)
        .sort()
        .at(-1) ?? null;
      return { clientId: c.id as string, name: c.name as string, lastJobAt: last };
    }),
    new Date(),
  );
  const lapsing = churn
    .filter((c) => c.status !== "active")
    .sort((a, b) => (b.daysSince ?? 9999) - (a.daysSince ?? 9999));

  const revenue = (paidInvoices ?? []).reduce((s, i) => s + i.total_kobo, 0);
  const expenseTotal = (expenses ?? []).reduce((s, e) => s + e.amount_kobo, 0);

  const ratingCount = ratings?.length ?? 0;
  const avgRating =
    ratingCount > 0
      ? (ratings!.reduce((s, r) => s + (r.stars as number), 0) / ratingCount).toFixed(1)
      : null;

  // Expenses by category
  const byCategory = new Map<string, number>();
  for (const e of expenses ?? []) {
    byCategory.set(e.category as string, (byCategory.get(e.category as string) ?? 0) + e.amount_kobo);
  }

  // Revenue by service type (from job values)
  const byType = new Map<string, number>();
  for (const j of jobs ?? []) {
    byType.set(j.type, (byType.get(j.type) ?? 0) + (j.value_kobo ?? 0));
  }
  const typeMax = Math.max(1, ...byType.values());

  // Top clients by paid invoice value
  const byClient = new Map<string, number>();
  for (const i of paidInvoices ?? []) {
    const name = (i.clients as unknown as { name: string } | null)?.name ?? "—";
    byClient.set(name, (byClient.get(name) ?? 0) + i.total_kobo);
  }
  const topClients = [...byClient.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 font-display text-xl font-bold">Reports</h1>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Revenue (paid)" value={formatNaira(revenue)} tone="green" />
        <StatTile label="Expenses" value={formatNaira(expenseTotal)} tone="amber" />
        <StatTile label="Net" value={formatNaira(revenue - expenseTotal)} />
        <StatTile label="Avg rating" value={avgRating ? `★ ${avgRating}` : "—"} />
      </div>

      <div className="card mb-4 p-4">
        <h2 className="mb-3 font-display text-sm font-semibold">Revenue by service type</h2>
        <div className="flex flex-col gap-3">
          {[...byType.entries()].map(([type, kobo]) => (
            <div key={type}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{TYPE_LABEL[type] ?? type}</span>
                <span className="font-semibold money">{formatNaira(kobo)}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-muted-bg">
                <div className="h-full rounded-full bg-primary" style={{ width: `${(kobo / typeMax) * 100}%` }} />
              </div>
            </div>
          ))}
          {byType.size === 0 && <p className="text-sm text-muted">No jobs yet.</p>}
        </div>
      </div>

      <div className="card p-4">
        <h2 className="mb-3 font-display text-sm font-semibold">Top clients</h2>
        <div className="divide-y divide-line">
          {topClients.map(([name, kobo]) => (
            <div key={name} className="flex justify-between py-2 text-sm">
              <span>{name}</span>
              <span className="font-semibold money">{formatNaira(kobo)}</span>
            </div>
          ))}
          {topClients.length === 0 && <p className="text-sm text-muted">No paid invoices yet.</p>}
        </div>
      </div>

      <div className="card mt-4 p-4">
        <h2 className="mb-3 font-display text-sm font-semibold">Clients to win back</h2>
        <div className="divide-y divide-line">
          {lapsing.map((c) => (
            <Link
              key={c.clientId}
              href={`/clients/${c.clientId}`}
              className="flex items-center justify-between py-2 text-sm hover:opacity-80"
            >
              <span>{c.name}</span>
              <span className={`badge ${c.status === "churned" ? "bg-red-50 text-danger" : "bg-amber-soft text-amber"}`}>
                {c.daysSince === null ? "no jobs yet" : `${c.daysSince}d since last`}
              </span>
            </Link>
          ))}
          {lapsing.length === 0 && (
            <p className="text-sm text-muted">Every client has been served recently 🎉</p>
          )}
        </div>
      </div>

      <div className="card mt-4 p-4">
        <h2 className="mb-3 font-display text-sm font-semibold">Expenses by category</h2>
        <div className="divide-y divide-line">
          {[...byCategory.entries()].sort((a, b) => b[1] - a[1]).map(([cat, kobo]) => (
            <div key={cat} className="flex justify-between py-2 text-sm">
              <span className="capitalize">{cat}</span>
              <span className="font-semibold money">{formatNaira(kobo)}</span>
            </div>
          ))}
          {byCategory.size === 0 && <p className="text-sm text-muted">No expenses logged yet.</p>}
        </div>
      </div>
    </div>
  );
}
