import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Badge, Naira, StatTile, EmptyState } from "@/components/ui";
import { formatNaira } from "@/lib/money";

export default async function MoneyPage() {
  const supabase = await createServerClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, number, total_kobo, deposit_kobo, status, clients(name)")
    .order("created_at", { ascending: false })
    .limit(25);

  const { data: templates } = await supabase
    .from("quote_templates")
    .select("label, floor_kobo")
    .order("position");

  const collected = (invoices ?? [])
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.total_kobo, 0);
  const outstanding = (invoices ?? [])
    .filter((i) => i.status !== "paid")
    .reduce((s, i) => s + (i.total_kobo - i.deposit_kobo), 0);

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">Money</h1>
        <Link href="/money/invoices/new" className="btn-primary">
          + New invoice
        </Link>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        <Link href="/money/overdue" className="btn-outline text-sm">
          Receivables
        </Link>
        <Link href="/money/quotes" className="btn-outline text-sm">
          Quotes
        </Link>
        <Link href="/money/contracts" className="btn-outline text-sm">
          Contracts
        </Link>
        <Link href="/money/expenses" className="btn-outline text-sm">
          Expenses
        </Link>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile label="Collected" value={formatNaira(collected)} tone="green" />
        <StatTile label="Outstanding" value={formatNaira(outstanding)} tone="amber" />
        <StatTile label="Invoices" value={String(invoices?.length ?? 0)} />
      </div>

      <h2 className="mb-2 font-display text-base font-semibold">Invoices</h2>
      {!invoices?.length ? (
        <EmptyState title="No invoices yet" hint="Create one from a job or from scratch." />
      ) : (
        <div className="mb-6 flex flex-col gap-2">
          {invoices.map((i) => {
            const client = i.clients as unknown as { name: string } | null;
            return (
              <Link
                key={i.id}
                href={`/money/invoices/${i.id}`}
                className="card flex items-center gap-3 p-3 hover:bg-muted-bg"
              >
                <div className="flex-1">
                  <div className="font-bold">{i.number}</div>
                  <div className="text-sm text-muted">{client?.name}</div>
                </div>
                <Naira kobo={i.total_kobo} />
                <Badge value={i.status} />
              </Link>
            );
          })}
        </div>
      )}

      <h2 className="mb-2 font-display text-base font-semibold">Quote templates</h2>
      <div className="card divide-y divide-line px-4">
        {templates?.map((t) => (
          <div key={t.label} className="flex justify-between py-2.5 text-sm">
            <span className="text-muted">{t.label}</span>
            <span className="font-semibold money">
              {t.floor_kobo > 0 ? `from ${formatNaira(t.floor_kobo)}` : "custom quote"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
