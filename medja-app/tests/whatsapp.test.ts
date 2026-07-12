import { describe, it, expect } from "vitest";
import { normalizeNgPhone, waLink } from "@/lib/whatsapp";

describe("whatsapp", () => {
  it("normalizes Nigerian numbers to intl format", () => {
    expect(normalizeNgPhone("0803 123 4567")).toBe("2348031234567");
    expect(normalizeNgPhone("+2348031234567")).toBe("2348031234567");
    expect(normalizeNgPhone("8031234567")).toBe("2348031234567");
  });

  it("builds a wa.me link with encoded message", () => {
    const link = waLink("08031234567", "Hello & welcome");
    expect(link).toBe("https://wa.me/2348031234567?text=Hello%20%26%20welcome");
  });
});
