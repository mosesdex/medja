import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { addSite } from "@/features/clients/actions";
import { Badge, Naira } from "@/components/ui";

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

      <section className="mb-4">
        <h2 className="mb-2 font-display text-base font-semibold">Sites</h2>
        <div className="flex flex-col gap-2">
          {sites?.map((s) => (
            <div key={s.id} className="card p-3">
              <div className="font-bold">{s.label}</div>
              <div className="text-sm text-muted">{s.address ?? "—"}</div>
              {s.access_note && (
                <div className="mt-1 text-sm">
                  <span className="text-muted">Access:</span> {s.access_note}
                </div>
              )}
            </div>
          ))}
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
