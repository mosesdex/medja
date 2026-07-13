import { describe, it, expect } from "vitest";
import { computeAttendance, formatDuration } from "@/features/attendance/compute";

describe("computeAttendance", () => {
  it("pairs check-in/out into sessions and sums minutes", () => {
    const [a] = computeAttendance([
      { staffId: "s1", type: "check_in", at: "2026-07-11T08:00:00Z" },
      { staffId: "s1", type: "check_out", at: "2026-07-11T10:30:00Z" },
    ]);
    expect(a).toEqual({ staffId: "s1", sessions: 1, openSessions: 0, minutes: 150 });
  });

  it("handles unordered events", () => {
    const [a] = computeAttendance([
      { staffId: "s1", type: "check_out", at: "2026-07-11T10:00:00Z" },
      { staffId: "s1", type: "check_in", at: "2026-07-11T09:00:00Z" },
    ]);
    expect(a.minutes).toBe(60);
    expect(a.sessions).toBe(1);
  });

  it("counts a check-in with no check-out as an open session", () => {
    const [a] = computeAttendance([
      { staffId: "s1", type: "check_in", at: "2026-07-11T08:00:00Z" },
    ]);
    expect(a).toMatchObject({ sessions: 0, openSessions: 1, minutes: 0 });
  });

  it("separates staff and ignores null staff", () => {
    const res = computeAttendance([
      { staffId: "s1", type: "check_in", at: "2026-07-11T08:00:00Z" },
      { staffId: "s1", type: "check_out", at: "2026-07-11T09:00:00Z" },
      { staffId: "s2", type: "check_in", at: "2026-07-11T08:00:00Z" },
      { staffId: "s2", type: "check_out", at: "2026-07-11T11:00:00Z" },
      { staffId: null, type: "check_in", at: "2026-07-11T08:00:00Z" },
    ]);
    expect(res).toHaveLength(2);
    expect(res.find((r) => r.staffId === "s2")!.minutes).toBe(180);
  });
});

describe("formatDuration", () => {
  it("formats hours and minutes", () => {
    expect(formatDuration(135)).toBe("2h 15m");
    expect(formatDuration(120)).toBe("2h");
    expect(formatDuration(45)).toBe("45m");
    expect(formatDuration(0)).toBe("0m");
  });
});
