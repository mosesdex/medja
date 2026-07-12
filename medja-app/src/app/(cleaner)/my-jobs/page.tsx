import Link from "next/link";
import { getMember } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { Badge, EmptyState } from "@/components/ui";

export default async function MyJobsPage() {
  const member = await getMember();
  const supabase = await createServerClient();

  // RLS (jobs_select_assigned) already limits jobs to those assigned to this user.
  const { data: jobs } = await supabase
    .from("jobs")
    .select("id, type, status, scheduled_at, clients(name), client_sites(label)")
    .order("scheduled_at");

  return (
    <div>
      <header className="mb-4">
        <p className="text-sm text-muted">Cleaner app</p>
        <h1 className="font-display text-xl font-bold">Hi {member?.name}</h1>
      </header>

      <div className="mb-4 rounded-2xl bg-accent px-4 py-3 text-white">
        <div className="font-display text-base font-semibold">
          {new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" })}
        </div>
        <div className="text-sm opacity-90">{jobs?.length ?? 0} job(s) assigned to you</div>
      </div>

      {!jobs?.length ? (
        <EmptyState title="No jobs assigned" hint="Your supervisor will assign jobs to you." />
      ) : (
        <div className="flex flex-col gap-2">
          {jobs.map((j) => {
            const client = j.clients as unknown as { name: string } | null;
            const site = j.client_sites as unknown as { label: string } | null;
            return (
              <Link key={j.id} href={`/my-jobs/${j.id}`} className="card flex items-center gap-3 p-3">
                <div className="rounded-xl bg-primary-soft px-2 py-2 text-center font-display text-xs font-semibold text-primary">
                  {new Date(j.scheduled_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                </div>
                <div className="flex-1">
                  <div className="font-bold">{client?.name}</div>
                  <div className="text-sm text-muted">{site?.label ?? ""}</div>
                </div>
                <Badge value={j.status} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
