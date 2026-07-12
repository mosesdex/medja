import { describe, it, expect } from "vitest";
import { computeInvoice, invoiceStatus } from "@/features/invoices/calc";

describe("computeInvoice", () => {
  it("sums lines with no VAT, no deposit", () => {
    const t = computeInvoice([
      { label: "Deep clean", amount_kobo: 5500000 },
    ]);
    expect(t).toEqual({
      subtotal_kobo: 5500000,
      vat_kobo: 0,
      total_kobo: 5500000,
      balance_kobo: 5500000,
    });
  });

  it("applies VAT and subtracts a deposit for the balance", () => {
    const t = computeInvoice(
      [{ label: "Deep clean", amount_kobo: 5500000 }],
      { vat: true, deposit_kobo: 2000000 },
    );
    expect(t.vat_kobo).toBe(412500);
    expect(t.total_kobo).toBe(5912500);
    expect(t.balance_kobo).toBe(3912500);
  });

  it("never returns a negative balance when deposit exceeds total", () => {
    const t = computeInvoice([{ label: "x", amount_kobo: 1000 }], {
      deposit_kobo: 5000,
    });
    expect(t.balance_kobo).toBe(0);
  });
});

describe("invoiceStatus", () => {
  const now = new Date("2026-07-11T09:00:00Z");
  it("is paid when balance cleared", () => {
    expect(invoiceStatus(0, new Date("2026-07-01"), now)).toBe("paid");
  });
  it("is overdue when past due with balance", () => {
    expect(invoiceStatus(100, new Date("2026-07-01"), now)).toBe("overdue");
  });
  it("is balance_due when not yet due", () => {
    expect(invoiceStatus(100, new Date("2026-07-20"), now)).toBe("balance_due");
  });
});
