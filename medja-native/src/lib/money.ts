/**
 * Money is always stored and computed as integer kobo (₦1 = 100 kobo).
 * Never use floats for money. These helpers are the single source of truth.
 */

export const KOBO = 100;

/** Convert a naira amount (may have decimals) to integer kobo. */
export function toKobo(naira: number): number {
  return Math.round(naira * KOBO);
}

/** Convert integer kobo to a naira number (for display math only). */
export function toNaira(kobo: number): number {
  return kobo / KOBO;
}

/** Sum any number of kobo amounts, staying integer-safe. */
export function addKobo(...amounts: number[]): number {
  return amounts.reduce((sum, a) => sum + Math.round(a), 0);
}

/** Format integer kobo as a naira string, e.g. 5500000 -> "₦55,000". */
export function formatNaira(kobo: number): string {
  const naira = Math.round(kobo) / KOBO;
  const hasFraction = Math.round(kobo) % KOBO !== 0;
  return (
    "₦" +
    naira.toLocaleString("en-NG", {
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2,
    })
  );
}

/**
 * Apply Nigerian VAT (default 7.5%) to a kobo amount.
 * Returns integer kobo vat and total.
 */
export function applyVat(
  kobo: number,
  ratePercent = 7.5,
): { vat: number; total: number } {
  const vat = Math.round((kobo * ratePercent) / 100);
  return { vat, total: kobo + vat };
}
