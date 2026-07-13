import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Badge, StatTile, EmptyState } from "@/components/ui";
import { formatNaira } from "@/lib/money";
import { waLink } from "@/lib/whatsapp";
import { agingBucket, AGING_LABELS, type AgingBucket } from "@/features/invoices/aging";

const ORDER: AgingBucket[] = ["60+", "31-60", "1-30", "current"];

export default async function OverduePage() {
  const supabase = await createServerClient();

  const { data: invoices } = await supabase
    .from("invoices")
    .select("id, number, total_kobo, deposit_kobo, status, due_at, created_at, clients(name, phone)")
    .neq("status", "paid")
    .order("due_at", { ascending: true });

  const now = new Date();
  const rows = (invoices ?? []).map((i) => {
    const client = i.clients as unknown as { name: string; phone: string | null } | null;
    const balance = i.total_kobo - i.deposit_kobo;
    const due = (i.due_at as string | null) ?? null;
    return {
      id: i.id as string,
      number: i.number as string,
      clientName: client?.name ?? "Client",
      phone: client?.phone ?? null,
      balance,
      bucket: agingBucket(due, now),
    };
  });

  const byBucket: Record<string, number> = { current: 0, "1-30": 0, "31-60": 0, "60+": 0 };
  for (const r of rows) byBucket[r.bucket] += r.balance;
  const totalKobo = rows.reduce((s, r) => s + r.balance, 0);
  const overdueKobo = totalKobo - byBucket.current;

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/money" className="btn-outline px-3 py-2">←</Link>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">Receivables</h1>
          <p className="text-sm text-muted">Chase what you&apos;re owed</p>
        </div>
      </header>

      <div className="mb-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile label="Outstanding" value={formatNaira(totalKobo)} tone="amber" />
        <StatTile label="Overdue" value={formatNaira(overdueKobo)} tone={overdueKobo > 0 ? "amber" : "default"} />
        <StatTile label="60+ days" value={formatNaira(byBucket["60+"])} tone={byBucket["60+"] > 0 ? "amber" : "default"} />
        <StatTile label="Invoices" value={String(rows.length)} />
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Nothing outstanding 🎉" hint="Every invoice is paid." />
      ) : (
        <div className="flex flex-col gap-4">
          {ORDER.filter((b) => rows.some((r) => r.bucket === b)).map((bucket) => (
            <section key={bucket}>
              <h2 className="mb-2 text-sm font-semibold text-muted">
                {AGING_LABELS[bucket]} · {formatNaira(byBucket[bucket])}
              </h2>
              <div className="flex flex-col gap-2">
                {rows
                  .filter((r) => r.bucket === bucket)
                  .map((r) => {
                    const wa =
                      r.phone &&
                      waLink(
                        r.phone,
                        `Hello ${r.clientName}, a friendly reminder that invoice ${r.number} (${formatNaira(r.balance)}) is outstanding. You can pay by card, transfer or USSD. Thank you.`,
                      );
                    return (
                      <div key={r.id} className="card flex items-center gap-3 p-3">
                        <Link href={`/money/invoices/${r.id}`} className="min-w-0 flex-1">
                          <div className="font-bold">{r.clientName}</div>
                          <div className="text-sm text-muted">
                            {r.number} · {formatNaira(r.balance)}
                          </div>
                        </Link>
                        {bucket !== "current" && <Badge value="overdue" />}
                        {wa && (
                          <a href={wa} target="_blank" rel="noopener" className="btn-outline px-3 py-2 text-sm">
                            Remind
                          </a>
                        )}
                      </div>
                    );
                  })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
