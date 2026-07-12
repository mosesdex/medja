export interface StaffPay {
  staffId: string;
  name: string;
  payKobo: number;
  payBasis: "per_job" | "per_day" | "monthly";
  jobsCount: number;
  distinctDays: number;
}

export interface PayrollItem {
  staffId: string;
  name: string;
  jobsCount: number;
  amountKobo: number;
}

/**
 * Compute a payroll line per staff member for a period.
 * - per_job: rate × completed jobs
 * - per_day: rate × distinct days worked
 * - monthly: flat rate
 */
export function computePayroll(staff: StaffPay[]): {
  items: PayrollItem[];
  totalKobo: number;
} {
  const items = staff.map((s) => {
    let amountKobo = 0;
    if (s.payBasis === "per_job") amountKobo = s.payKobo * s.jobsCount;
    else if (s.payBasis === "per_day") amountKobo = s.payKobo * s.distinctDays;
    else amountKobo = s.payKobo; // monthly
    return { staffId: s.staffId, name: s.name, jobsCount: s.jobsCount, amountKobo };
  });
  return { items, totalKobo: items.reduce((sum, i) => sum + i.amountKobo, 0) };
}
