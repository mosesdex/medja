import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { createJob } from "@/features/jobs/actions";
import { EmptyState } from "@/components/ui";

export default async function NewJobPage() {
  const supabase = await createServerClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("id, name, client_sites(id, label)")
    .order("name");

  const field =
    "mt-1 w-full rounded-xl border border-line px-4 py-3 text-base outline-none focus:border-primary";

  if (!clients?.length) {
    return (
      <div className="mx-auto max-w-lg">
        <header className="mb-4 flex items-center gap-3">
          <Link href="/jobs" className="btn-outline px-3 py-2">←</Link>
          <h1 className="font-display text-xl font-bold">New job</h1>
        </header>
        <EmptyState
          title="Add a client first"
          hint="You need at least one client before booking a job."
        />
        <Link href="/clients/new" className="btn-primary mt-3 w-full">
          + New client
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/jobs" className="btn-outline px-3 py-2">←</Link>
        <h1 className="font-display text-xl font-bold">New job</h1>
      </header>
      <form action={createJob} className="card flex flex-col gap-4 p-5">
        <label className="text-sm font-semibold">
          Client
          <select name="client_id" required className={field}>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Site (optional)
          <select name="site_id" className={field}>
            <option value="">—</option>
            {clients.flatMap((c) =>
              (c.client_sites as { id: string; label: string }[]).map((s) => (
                <option key={s.id} value={s.id}>
                  {c.name} — {s.label}
                </option>
              )),
            )}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Job type
          <select name="type" required className={field} defaultValue="residential">
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="post_construction">Post-construction</option>
          </select>
        </label>
        <label className="text-sm font-semibold">
          Date & time
          <input name="scheduled_at" type="datetime-local" required className={field} />
        </label>
        <label className="text-sm font-semibold">
          Value (₦)
          <input name="value_naira" type="number" min="0" step="500" className={field} placeholder="55000" />
        </label>
        <label className="text-sm font-semibold">
          Notes
          <input name="notes" className={field} placeholder="Anything the team should know" />
        </label>
        <button type="submit" className="btn-primary w-full">
          Book job
        </button>
      </form>
    </div>
  );
}
