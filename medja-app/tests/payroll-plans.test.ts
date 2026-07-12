import { describe, it, expect } from "vitest";
import { computePayroll } from "@/features/payroll/compute";
import { canAddStaff, isTrialExpired, PLANS } from "@/features/billing/plans";

describe("computePayroll", () => {
  it("computes per-job, per-day and monthly correctly", () => {
    const { items, totalKobo } = computePayroll([
      { staffId: "a", name: "A", payKobo: 450000, payBasis: "per_job", jobsCount: 10, distinctDays: 6 },
      { staffId: "b", name: "B", payKobo: 800000, payBasis: "per_day", jobsCount: 10, distinctDays: 6 },
      { staffId: "c", name: "C", payKobo: 9000000, payBasis: "monthly", jobsCount: 20, distinctDays: 22 },
    ]);
    expect(items[0].amountKobo).toBe(4500000); // 450k × 10
    expect(items[1].amountKobo).toBe(4800000); // 800k × 6 days
    expect(items[2].amountKobo).toBe(9000000); // flat
    expect(totalKobo).toBe(18300000);
  });
});

describe("plan limits", () => {
  it("enforces staff limits per tier", () => {
    expect(canAddStaff("starter", 4)).toBe(true);
    expect(canAddStaff("starter", 5)).toBe(false);
    expect(canAddStaff("pro", 500)).toBe(true); // unlimited
  });

  it("detects an expired trial only for the trial tier", () => {
    const today = new Date("2026-07-20");
    expect(isTrialExpired("trial", "2026-07-11", today)).toBe(true);
    expect(isTrialExpired("trial", "2026-07-25", today)).toBe(false);
    expect(isTrialExpired("growth", "2026-07-11", today)).toBe(false);
  });

  it("prices plans in kobo", () => {
    expect(PLANS.growth.priceKobo).toBe(3_500_000);
  });
});
