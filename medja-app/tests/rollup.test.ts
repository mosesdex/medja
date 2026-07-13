import { describe, it, expect } from "vitest";
import { rollupBySite } from "@/features/clients/rollup";

describe("rollupBySite", () => {
  it("aggregates jobs, completed count and value per site", () => {
    const r = rollupBySite([
      { siteId: "a", valueKobo: 1000, status: "paid" },
      { siteId: "a", valueKobo: 2000, status: "booked" },
      { siteId: "b", valueKobo: 5000, status: "done" },
    ]);
    const a = r.find((x) => x.siteId === "a")!;
    expect(a).toEqual({ siteId: "a", jobs: 2, completed: 1, valueKobo: 3000 });
    const b = r.find((x) => x.siteId === "b")!;
    expect(b.completed).toBe(1);
  });

  it("sorts by value desc with null-site last", () => {
    const r = rollupBySite([
      { siteId: null, valueKobo: 9999, status: "paid" },
      { siteId: "a", valueKobo: 100, status: "paid" },
      { siteId: "b", valueKobo: 500, status: "paid" },
    ]);
    expect(r.map((x) => x.siteId)).toEqual(["b", "a", null]);
  });

  it("treats null job value as zero", () => {
    const [r] = rollupBySite([{ siteId: "a", valueKobo: null, status: "booked" }]);
    expect(r.valueKobo).toBe(0);
    expect(r.jobs).toBe(1);
  });
});
