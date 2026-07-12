import { describe, it, expect } from "vitest";
import { toKobo, formatNaira, addKobo, applyVat } from "@/lib/money";

describe("money helpers", () => {
  it("converts naira to integer kobo", () => {
    expect(toKobo(55000)).toBe(5500000);
    expect(toKobo(199.99)).toBe(19999);
  });

  it("formats kobo as naira with thousands separators", () => {
    expect(formatNaira(5500000)).toBe("₦55,000");
    expect(formatNaira(1200000)).toBe("₦12,000");
    expect(formatNaira(0)).toBe("₦0");
  });

  it("shows kobo fraction only when present", () => {
    expect(formatNaira(5912500)).toBe("₦59,125");
    expect(formatNaira(5912550)).toBe("₦59,125.50");
  });

  it("sums kobo integer-safely", () => {
    expect(addKobo(1000, 2000, 3000)).toBe(6000);
  });

  it("applies 7.5% VAT integer-safely", () => {
    expect(applyVat(5500000)).toEqual({ vat: 412500, total: 5912500 });
  });
});
