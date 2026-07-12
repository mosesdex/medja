import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Badge, Naira, EmptyState } from "@/components/ui";

export default async function JobsPage() {
  const supabase = await createServerClient();
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, type, status, scheduled_at, value_kobo, clients(name)")
    .order("scheduled_at", { ascending: true })
    .limit(50);

  // group by day
  const byDay = new Map<string, typeof jobs>();
  for (const j of jobs ?? []) {
    const day = new Date(j.scheduled_at).toLocaleDateString("en-NG", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
    if (!byDay.has(day)) byDay.set(day, []);
    byDay.get(day)!.push(j);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-4 flex items-center justify-between">
        <h1 className="font-display text-xl font-bold">Jobs</h1>
        <Link href="/jobs/new" className="btn-primary">
          + New job
        </Link>
      </header>

      {!jobs?.length ? (
        <EmptyState title="No jobs scheduled" hint="Book your first job to see it here." />
      ) : (
        <div className="flex flex-col gap-5">
          {[...byDay.entries()].map(([day, dayJobs]) => (
            <section key={day}>
              <h2 className="mb-2 text-sm font-semibold text-muted">{day}</h2>
              <div className="flex flex-col gap-2">
                {dayJobs!.map((j) => {
                  const client = j.clients as unknown as { name: string } | null;
                  return (
                    <Link
                      key={j.id}
                      href={`/jobs/${j.id}`}
                      className="card flex items-center gap-3 p-3 hover:bg-muted-bg"
                    >
                      <div className="rounded-xl bg-primary-soft px-2 py-2 text-center font-display text-xs font-semibold text-primary">
                        {new Date(j.scheduled_at).toLocaleTimeString("en-NG", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold">{client?.name ?? "Client"}</div>
                        <Badge value={j.type} />
                      </div>
                      <Naira kobo={j.value_kobo} />
                      <Badge value={j.status} />
                    </Link>
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
