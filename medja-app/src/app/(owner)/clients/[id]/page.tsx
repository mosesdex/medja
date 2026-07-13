import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { addSite } from "@/features/clients/actions";
import { Badge, Naira, StatTile } from "@/components/ui";
import { formatNaira } from "@/lib/money";
import { waLink } from "@/lib/whatsapp";
import { rollupBySite } from "@/features/clients/rollup";

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: client } = await supabase
    .from("clients")
    .select("id, name, phone, kind")
    .eq("id", id)
    .maybeSingle();
  if (!client) notFound();

  const { data: sites } = await supabase
    .from("client_sites")
    .select("id, label, address, access_note")
    .eq("client_id", id);

  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, type, status, scheduled_at, value_kobo")
    .eq("client_id", id)
    .order("scheduled_at", { ascending: false })
    .limit(10);

  // All jobs (site + value + status) for the per-site rollup.
  const { data: allJobs } = await supabase
    .from("jobs")
    .select("site_id, value_kobo, status")
    .eq("client_id", id);
  const siteRollup = new Map(
    rollupBySite(
      (allJobs ?? []).map((j) => ({
        siteId: j.site_id as string | null,
        valueKobo: j.value_kobo as number | null,
        status: j.status as string,
      })),
    ).map((r) => [r.siteId, r]),
  );

  const { data: invoices } = await supabase
    .from("invoices")
    .select("total_kobo, deposit_kobo, status")
    .eq("client_id", id);
  const lifetimeKobo = (invoices ?? [])
    .filter((i) => i.status === "paid")
    .reduce((s, i) => s + i.total_kobo, 0);
  const outstandingKobo = (invoices ?? [])
    .filter((i) => i.status !== "paid")
    .reduce((s, i) => s + (i.total_kobo - i.deposit_kobo), 0);

  const wa = client.phone
    ? waLink(client.phone, `Hello ${client.name}, `)
    : null;

  const field =
    "mt-1 w-full rounded-xl border border-line px-4 py-3 text-base outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/clients" className="btn-outline px-3 py-2">
          ←
        </Link>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">{client.name}</h1>
          <p className="text-sm text-muted">{client.phone ?? "—"}</p>
        </div>
        <Badge value={client.kind} />
      </header>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <StatTile label="Lifetime value" value={formatNaira(lifetimeKobo)} tone="green" />
        <StatTile label="Outstanding" value={formatNaira(outstandingKobo)} tone={outstandingKobo > 0 ? "amber" : "default"} />
      </div>

      {wa && (
        <a href={wa} target="_blank" rel="noopener" className="btn-outline mb-4 w-full">
          Message on WhatsApp
        </a>
      )}

      <section className="mb-4">
        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="font-display text-base font-semibold">
            Sites{(sites?.length ?? 0) > 1 ? ` (${sites!.length})` : ""}
          </h2>
          {(sites?.length ?? 0) > 1 && (
            <span className="text-xs text-muted">per-site activity</span>
          )}
        </div>
        <div className="flex flex-col gap-2">
          {sites?.map((s) => {
            const r = siteRollup.get(s.id);
            return (
              <div key={s.id} className="card p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-bold">{s.label}</div>
                    <div className="text-sm text-muted">{s.address ?? "—"}</div>
                  </div>
                  {r && (
                    <div className="text-right">
                      <div className="font-semibold money">{formatNaira(r.valueKobo)}</div>
                      <div className="text-xs text-muted">
                        {r.jobs} job{r.jobs === 1 ? "" : "s"} · {r.completed} done
                      </div>
                    </div>
                  )}
                </div>
                {s.access_note && (
                  <div className="mt-1 text-sm">
                    <span className="text-muted">Access:</span> {s.access_note}
                  </div>
                )}
              </div>
            );
          })}
          <details className="card p-3">
            <summary className="cursor-pointer text-sm font-semibold text-primary">
              + Add a site
            </summary>
            <form action={addSite} className="mt-3 flex flex-col gap-3">
              <input type="hidden" name="client_id" value={client.id} />
              <input name="label" required placeholder="Site label" className={field} />
              <input name="address" placeholder="Address" className={field} />
              <input name="access_note" placeholder="Access note" className={field} />
              <button className="btn-primary w-full">Add site</button>
            </form>
          </details>
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-display text-base font-semibold">Recent jobs</h2>
        {!jobs?.length ? (
          <p className="text-sm text-muted">No jobs yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {jobs.map((j) => (
              <Link key={j.id} href={`/jobs/${j.id}`} className="card flex items-center gap-3 p-3 hover:bg-muted-bg">
                <div className="flex-1">
                  <Badge value={j.type} />
                  <div className="mt-1 text-sm text-muted">
                    {new Date(j.scheduled_at).toLocaleDateString("en-NG", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                </div>
                <Naira kobo={j.value_kobo} />
                <Badge value={j.status} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
