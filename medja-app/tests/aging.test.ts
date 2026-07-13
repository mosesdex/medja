import { describe, it, expect } from "vitest";
import { agingBucket, summarizeAging } from "@/features/invoices/aging";

describe("agingBucket", () => {
  const now = new Date("2026-07-11T00:00:00Z");
  it("buckets by days overdue", () => {
    expect(agingBucket(null, now)).toBe("current");
    expect(agingBucket("2026-07-20", now)).toBe("current"); // not yet due
    expect(agingBucket("2026-07-01", now)).toBe("1-30"); // 10 days
    expect(agingBucket("2026-06-01", now)).toBe("31-60"); // 40 days
    expect(agingBucket("2026-04-01", now)).toBe("60+"); // 101 days
  });
});

describe("summarizeAging", () => {
  const now = new Date("2026-07-11T00:00:00Z");
  it("sums balances per bucket and computes overdue total", () => {
    const s = summarizeAging(
      [
        { id: "a", balanceKobo: 1000, dueAt: "2026-07-20" }, // current
        { id: "b", balanceKobo: 2000, dueAt: "2026-07-01" }, // 1-30
        { id: "c", balanceKobo: 5000, dueAt: "2026-04-01" }, // 60+
      ],
      now,
    );
    expect(s.buckets.current).toBe(1000);
    expect(s.buckets["1-30"]).toBe(2000);
    expect(s.buckets["60+"]).toBe(5000);
    expect(s.totalKobo).toBe(8000);
    expect(s.overdueKobo).toBe(7000);
  });
});
