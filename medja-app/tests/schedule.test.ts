import { describe, it, expect } from "vitest";
import { overlaps, countConflicts } from "@/features/jobs/schedule";

describe("schedule conflicts", () => {
  const w = (s: number, e: number) => ({ start: s, end: e });

  it("detects overlap", () => {
    expect(overlaps(w(0, 10), w(5, 15))).toBe(true);
    expect(overlaps(w(0, 10), w(10, 20))).toBe(false); // touching, not overlapping
    expect(overlaps(w(0, 10), w(11, 20))).toBe(false);
  });

  it("counts conflicts against existing windows", () => {
    const existing = [w(0, 10), w(20, 30), w(8, 12)];
    expect(countConflicts(w(5, 9), existing)).toBe(2);
    expect(countConflicts(w(31, 40), existing)).toBe(0);
  });
});
