import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { createContract } from "@/features/contracts/actions";
import { EmptyState } from "@/components/ui";

const DAYS = [
  { v: 1, l: "Mon" },
  { v: 2, l: "Tue" },
  { v: 3, l: "Wed" },
  { v: 4, l: "Thu" },
  { v: 5, l: "Fri" },
  { v: 6, l: "Sat" },
  { v: 0, l: "Sun" },
];

export default async function NewContractPage() {
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
          <Link href="/money/contracts" className="btn-outline px-3 py-2">←</Link>
          <h1 className="font-display text-xl font-bold">New contract</h1>
        </header>
        <EmptyState title="Add a client first" hint="Contracts need a client." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/money/contracts" className="btn-outline px-3 py-2">←</Link>
        <h1 className="font-display text-xl font-bold">New contract</h1>
      </header>
      <form action={createContract} className="card flex flex-col gap-4 p-5">
        <label className="text-sm font-semibold">
          Title
          <input name="title" required className={field} placeholder="Halogen HQ — daily clean" />
        </label>
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
                <option key={s.id} value={s.id}>{c.name} — {s.label}</option>
              )),
            )}
          </select>
        </label>
        <fieldset>
          <legend className="text-sm font-semibold">Days</legend>
          <div className="mt-2 flex flex-wrap gap-3">
            {DAYS.map((d) => (
              <label key={d.v} className="flex items-center gap-1.5 text-sm">
                <input
                  type="checkbox"
                  name="weekdays"
                  value={d.v}
                  defaultChecked={d.v >= 1 && d.v <= 5}
                  className="h-5 w-5 accent-primary"
                />
                {d.l}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="grid grid-cols-2 gap-3">
          <label className="text-sm font-semibold">
            Time
            <input name="time_of_day" type="time" defaultValue="08:00" className={field} />
          </label>
          <label className="text-sm font-semibold">
            Billing day
            <input name="billing_day" type="number" min="1" max="28" defaultValue="1" className={field} />
          </label>
        </div>
        <label className="text-sm font-semibold">
          Monthly amount (₦)
          <input name="monthly_naira" type="number" min="0" step="1000" className={field} placeholder="180000" />
        </label>
        <button type="submit" className="btn-primary w-full">Create contract</button>
      </form>
    </div>
  );
}
