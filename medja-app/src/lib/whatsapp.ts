/**
 * Build a wa.me share link with a prefilled message.
 * Normalizes Nigerian numbers: 0803... -> 234803..., +234... -> 234...
 */
export function normalizeNgPhone(phone: string): string {
  const digits = phone.replace(/[^\d]/g, "");
  if (digits.startsWith("234")) return digits;
  if (digits.startsWith("0")) return "234" + digits.slice(1);
  if (digits.length === 10) return "234" + digits; // 803...
  return digits;
}

export function waLink(phone: string, message: string): string {
  const to = normalizeNgPhone(phone);
  return `https://wa.me/${to}?text=${encodeURIComponent(message)}`;
}
