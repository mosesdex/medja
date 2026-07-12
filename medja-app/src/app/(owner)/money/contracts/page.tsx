import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Naira, EmptyState } from "@/components/ui";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default async function ContractsPage() {
  const supabase = await createServerClient();
  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, title, weekdays, monthly_kobo, billing_day, active, clients(name)")
    .order("created_at", { ascending: false });

  const recurring = (contracts ?? [])
    .filter((c) => c.active)
    .reduce((s, c) => s + c.monthly_kobo, 0);

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/money" className="btn-outline px-3 py-2">←</Link>
        <h1 className="flex-1 font-display text-xl font-bold">Contracts</h1>
        <Link href="/money/contracts/new" className="btn-primary">+ New</Link>
      </header>

      {!contracts?.length ? (
        <EmptyState
          title="No contracts yet"
          hint="Recurring contracts auto-generate jobs and monthly invoices."
        />
      ) : (
        <>
          <div className="card mb-3 flex items-center justify-between p-4">
            <span className="text-sm text-muted">Total recurring</span>
            <span className="font-display text-lg font-bold text-accent money">
              <Naira kobo={recurring} />/mo
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {contracts.map((c) => {
              const client = c.clients as unknown as { name: string } | null;
              const days = (c.weekdays as number[]).map((d) => DAY_NAMES[d]).join(" ");
              return (
                <div key={c.id} className="card p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-bold">{c.title}</div>
                    <span className="font-display font-bold money"><Naira kobo={c.monthly_kobo} />/mo</span>
                  </div>
                  <div className="text-sm text-muted">
                    {client?.name} · {days} · invoices day {c.billing_day}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
      <p className="mt-4 text-xs text-muted">
        A daily cron generates jobs 14 days ahead and raises monthly invoices on
        each contract&apos;s billing day.
      </p>
    </div>
  );
}
