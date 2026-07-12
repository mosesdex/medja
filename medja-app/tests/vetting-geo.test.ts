import { describe, it, expect } from "vitest";
import { vettingProgress } from "@/features/staff/vetting";
import { distanceMeters, isAtSite } from "@/lib/geo";

describe("vettingProgress", () => {
  it("reports all missing for an empty profile", () => {
    const p = vettingProgress({});
    expect(p.done).toBe(0);
    expect(p.total).toBe(6);
    expect(p.complete).toBe(false);
  });

  it("reports complete when all fields present", () => {
    const p = vettingProgress({
      nin: "123",
      nin_doc_path: "x",
      guarantor_name: "Emeka",
      guarantor_phone: "0803",
      guarantor_address: "Ikoyi",
      background_check: "cleared",
    });
    expect(p).toMatchObject({ done: 6, complete: true, missing: [] });
  });

  it("lists the specific missing items", () => {
    const p = vettingProgress({ nin: "123", guarantor_name: "Emeka" });
    expect(p.done).toBe(2);
    expect(p.missing).toContain("Background check");
  });
});

describe("geo", () => {
  const lekki = { lat: 6.4478, lng: 3.4723 };

  it("is ~0m from itself", () => {
    expect(distanceMeters(lekki, lekki)).toBeLessThan(1);
  });

  it("treats a nearby point as at-site and a far one as not", () => {
    const near = { lat: 6.4479, lng: 3.4724 }; // ~15m
    const far = { lat: 6.6018, lng: 3.3515 }; // Ikeja, ~20km
    expect(isAtSite(near, lekki)).toBe(true);
    expect(isAtSite(far, lekki)).toBe(false);
  });
});
