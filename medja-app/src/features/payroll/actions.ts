"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";
import { computePayroll, type StaffPay } from "./compute";

/**
 * Compute payroll for the given month (YYYY-MM) from completed jobs and staff
 * rates, then persist a run + items. Attendance/days come from GPS check-ins.
 */
export async function runPayroll(formData: FormData) {
  const member = await getMember();
  if (!member) throw new Error("No company");
  const supabase = await createServerClient();

  const month = String(formData.get("month")); // YYYY-MM
  const [y, m] = month.split("-").map(Number);
  const start = new Date(y, m - 1, 1);
  const end = new Date(y, m, 1);

  const { data: staff } = await supabase
    .from("staff_profiles")
    .select("id, name, pay_kobo, pay_basis");

  const staffPay: StaffPay[] = [];
  for (const s of staff ?? []) {
    // completed jobs assigned to this staff member in the period
    const { data: assigns } = await supabase
      .from("job_assignments")
      .select("jobs(scheduled_at, status)")
      .eq("staff_id", s.id);

    const jobs = (assigns ?? [])
      .map((a) => a.jobs as unknown as { scheduled_at: string; status: string } | null)
      .filter((j): j is { scheduled_at: string; status: string } => !!j)
      .filter((j) => {
        const t = new Date(j.scheduled_at);
        return t >= start && t < end && (j.status === "done" || j.status === "paid" || j.status === "invoiced");
      });

    const days = new Set(jobs.map((j) => new Date(j.scheduled_at).toDateString()));
    staffPay.push({
      staffId: s.id as string,
      name: s.name as string,
      payKobo: (s.pay_kobo as number) ?? 0,
      payBasis: (s.pay_basis as "per_job" | "per_day" | "monthly") ?? "per_job",
      jobsCount: jobs.length,
      distinctDays: days.size,
    });
  }

  const { items, totalKobo } = computePayroll(staffPay);

  const { data: run } = await supabase
    .from("payroll_runs")
    .insert({
      company_id: member.companyId,
      period_start: start.toISOString().slice(0, 10),
      period_end: new Date(end.getTime() - 1).toISOString().slice(0, 10),
      total_kobo: totalKobo,
    })
    .select("id")
    .single();

  if (run) {
    await supabase.from("payroll_items").insert(
      items.map((i) => ({
        company_id: member.companyId,
        run_id: (run as { id: string }).id,
        staff_id: i.staffId,
        jobs_count: i.jobsCount,
        amount_kobo: i.amountKobo,
      })),
    );
  }
  revalidatePath("/staff/payroll");
}
