import { describe, it, expect } from "vitest";
import crypto from "node:crypto";
import { verifyWebhookSignature } from "@/lib/paystack";
import { occurrences, isBillingDay } from "@/features/contracts/recurrence";

describe("paystack webhook signature", () => {
  const key = "sk_test_example";
  const body = JSON.stringify({ event: "charge.success", data: { reference: "r1" } });
  const sig = crypto.createHmac("sha512", key).update(body).digest("hex");

  it("accepts a valid signature", () => {
    expect(verifyWebhookSignature(body, sig, key)).toBe(true);
  });
  it("rejects a bad signature", () => {
    expect(verifyWebhookSignature(body, "deadbeef", key)).toBe(false);
  });
  it("rejects a missing signature", () => {
    expect(verifyWebhookSignature(body, null, key)).toBe(false);
  });
});

describe("contract recurrence", () => {
  // Mon–Fri at 08:00
  const spec = { weekdays: [1, 2, 3, 4, 5], hour: 8, minute: 0 };

  it("generates weekday occurrences over a horizon", () => {
    const from = new Date(2026, 6, 6, 0, 0); // Mon 6 Jul 2026
    const days = occurrences(spec, from, 6); // one week
    // Mon..Fri = 5 jobs
    expect(days.length).toBe(5);
    expect(days.every((d) => [1, 2, 3, 4, 5].includes(d.getDay()))).toBe(true);
  });

  it("skips dates already generated", () => {
    const from = new Date(2026, 6, 6, 0, 0);
    const existing = [new Date(2026, 6, 6, 8, 0), new Date(2026, 6, 7, 8, 0)];
    const days = occurrences(spec, from, 6, existing);
    expect(days.length).toBe(3); // Wed, Thu, Fri remain
  });

  it("knows the billing day", () => {
    expect(isBillingDay(1, new Date(2026, 6, 1))).toBe(true);
    expect(isBillingDay(1, new Date(2026, 6, 2))).toBe(false);
  });
});
