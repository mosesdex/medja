import Link from "next/link";
import { getMember } from "@/lib/auth";
import { dashboardSummary } from "@/features/dashboard/queries";
import { RevenueChart } from "@/features/dashboard/RevenueChart";
import { Badge, Naira, StatTile, EmptyState } from "@/components/ui";
import { formatNaira } from "@/lib/money";

export default async function DashboardPage() {
  const member = await getMember();
  const s = await dashboardSummary();
  const today = new Date().toLocaleDateString("en-NG", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="mx-auto max-w-4xl">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold">Hi {member?.name}</h1>
          <p className="text-sm text-muted">{today}</p>
        </div>
        <Link href="/jobs/new" className="btn-primary">+ New job</Link>
      </header>

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3">
        <StatTile label="Jobs today" value={String(s.jobsToday.length)} />
        <StatTile label="Collected today" value={formatNaira(s.collectedTodayKobo)} tone="green" />
        <StatTile label="Outstanding" value={formatNaira(s.outstandingKobo)} tone="amber" />
      </div>

      {s.overdueCount > 0 && (
        <Link
          href="/money"
          className="card mb-4 flex items-center gap-3 border-amber/40 bg-amber-soft p-3"
        >
          <span className="text-sm font-semibold text-amber">
            {s.overdueCount} invoice{s.overdueCount > 1 ? "s" : ""} overdue — tap to review
          </span>
        </Link>
      )}

      {s.newBookings.length > 0 && (
        <div className="card mb-4 border-accent/30 bg-accent-soft p-3">
          <div className="mb-2 text-sm font-bold text-accent">
            {s.newBookings.length} new booking request{s.newBookings.length > 1 ? "s" : ""}
          </div>
          <div className="flex flex-col gap-1">
            {s.newBookings.map((b) => (
              <Link key={b.id} href={`/jobs/${b.id}`} className="flex justify-between text-sm hover:opacity-80">
                <span className="font-semibold">{b.client}</span>
                <span className="text-muted">{b.when}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="mb-4">
        <RevenueChart data={s.monthlyRevenue} />
      </div>

      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">Today&apos;s jobs</h2>
        <Link href="/jobs" className="text-sm font-semibold text-primary">Calendar</Link>
      </div>

      {!s.jobsToday.length ? (
        <EmptyState title="No jobs today" hint="Book a job to see it here." />
      ) : (
        <div className="flex flex-col gap-2">
          {s.jobsToday.map((j) => (
            <Link key={j.id} href={`/jobs/${j.id}`} className="card flex items-center gap-3 p-3 hover:bg-muted-bg">
              <div className="rounded-xl bg-primary-soft px-2 py-2 text-center font-display text-xs font-semibold text-primary">
                {j.when}
              </div>
              <div className="flex-1">
                <div className="font-bold">{j.client}</div>
                <Badge value={j.type} />
              </div>
              <Naira kobo={j.valueKobo} />
              <Badge value={j.status} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
