import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { runPayroll } from "@/features/payroll/actions";
import { Naira, EmptyState } from "@/components/ui";

export default async function PayrollPage() {
  const supabase = await createServerClient();
  const { data: runs } = await supabase
    .from("payroll_runs")
    .select("id, period_start, period_end, total_kobo, payroll_items(staff_id, jobs_count, amount_kobo, staff_profiles(name))")
    .order("created_at", { ascending: false })
    .limit(6);

  const thisMonth = new Date().toISOString().slice(0, 7);

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/staff" className="btn-outline px-3 py-2">←</Link>
        <h1 className="font-display text-xl font-bold">Payroll</h1>
      </header>

      <form action={runPayroll} className="card mb-4 flex items-end gap-3 p-4">
        <label className="flex-1 text-sm font-semibold">
          Month
          <input
            name="month"
            type="month"
            defaultValue={thisMonth}
            className="mt-1 w-full rounded-xl border border-line px-4 py-3 text-base outline-none focus:border-primary"
          />
        </label>
        <button className="btn-primary">Run payroll</button>
      </form>

      {!runs?.length ? (
        <EmptyState title="No payroll runs yet" hint="Run payroll for a month to compute staff payouts from completed jobs." />
      ) : (
        <div className="flex flex-col gap-3">
          {runs.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="font-bold">
                  {new Date(r.period_start).toLocaleDateString("en-NG", { month: "long", year: "numeric" })}
                </div>
                <span className="font-display font-bold text-accent money"><Naira kobo={r.total_kobo} /></span>
              </div>
              <div className="divide-y divide-line text-sm">
                {(r.payroll_items as unknown as { staff_id: string; jobs_count: number; amount_kobo: number; staff_profiles: { name: string } | null }[]).map((it, idx) => (
                  <div key={idx} className="flex justify-between py-1.5">
                    <span>{it.staff_profiles?.name ?? "Staff"} · {it.jobs_count} jobs</span>
                    <Naira kobo={it.amount_kobo} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
