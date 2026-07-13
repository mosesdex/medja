import { describe, it, expect } from "vitest";
import { classifyChurn } from "@/features/clients/churn";

describe("classifyChurn", () => {
  const now = new Date("2026-07-11T00:00:00Z");

  it("marks recent clients active", () => {
    const [c] = classifyChurn(
      [{ clientId: "1", name: "A", lastJobAt: "2026-07-01" }],
      now,
    );
    expect(c.status).toBe("active");
    expect(c.daysSince).toBe(10);
  });

  it("marks 30-90 day clients at risk", () => {
    const [c] = classifyChurn(
      [{ clientId: "1", name: "A", lastJobAt: "2026-05-20" }], // ~52 days
      now,
    );
    expect(c.status).toBe("at_risk");
  });

  it("marks >90 day and never-booked clients churned", () => {
    const res = classifyChurn(
      [
        { clientId: "1", name: "Old", lastJobAt: "2026-01-01" },
        { clientId: "2", name: "New", lastJobAt: null },
      ],
      now,
    );
    expect(res[0].status).toBe("churned");
    expect(res[1].status).toBe("churned");
    expect(res[1].daysSince).toBeNull();
  });
});
