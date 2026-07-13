import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { computeAttendance, formatDuration } from "@/features/attendance/compute";
import { EmptyState } from "@/components/ui";

const initials = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export default async function AttendancePage() {
  const supabase = await createServerClient();

  // This month's GPS check-in/out events.
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const { data: events } = await supabase
    .from("job_events")
    .select("staff_id, type, at")
    .gte("at", start.toISOString());

  const { data: staff } = await supabase
    .from("staff_profiles")
    .select("id, name");

  const attendance = computeAttendance(
    (events ?? []).map((e) => ({
      staffId: e.staff_id as string | null,
      type: e.type as "check_in" | "check_out",
      at: e.at as string,
    })),
  );
  const byStaff = new Map(attendance.map((a) => [a.staffId, a]));

  const monthLabel = start.toLocaleDateString("en-NG", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/staff" className="btn-outline px-3 py-2">←</Link>
        <div className="flex-1">
          <h1 className="font-display text-xl font-bold">Attendance</h1>
          <p className="text-sm text-muted">{monthLabel} · from GPS check-ins</p>
        </div>
      </header>

      {!staff?.length ? (
        <EmptyState title="No staff yet" hint="Add staff and their GPS check-ins will appear here." />
      ) : (
        <div className="card divide-y divide-line">
          {(staff ?? []).map((s) => {
            const a = byStaff.get(s.id as string);
            return (
              <div key={s.id} className="flex items-center gap-3 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary font-display text-xs font-bold text-white">
                  {initials(s.name as string)}
                </div>
                <div className="flex-1">
                  <div className="font-bold">{s.name}</div>
                  <div className="text-sm text-muted">
                    {a ? `${a.sessions} session${a.sessions === 1 ? "" : "s"}` : "No check-ins"}
                    {a && a.openSessions > 0 ? ` · ${a.openSessions} open` : ""}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display font-bold">
                    {a ? formatDuration(a.minutes) : "—"}
                  </div>
                  <div className="text-xs text-muted">this month</div>
                </div>
              </div>
            );
          })}
          {staff.some((s) => !byStaff.has(s.id as string)) && (
            <p className="p-3 text-xs text-muted">
              Hours are derived from cleaners&apos; GPS check-in / check-out on jobs.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
