import { addKobo, applyVat } from "@/lib/money";

export interface LineInput {
  label: string;
  amount_kobo: number;
}

export interface InvoiceTotals {
  subtotal_kobo: number;
  vat_kobo: number;
  total_kobo: number;
  balance_kobo: number;
}

/**
 * Compute invoice totals from lines, optional VAT, and a deposit already paid.
 * All integer kobo. Balance is what the client still owes.
 */
export function computeInvoice(
  lines: LineInput[],
  opts: { vat?: boolean; vatRate?: number; deposit_kobo?: number } = {},
): InvoiceTotals {
  const subtotal_kobo = addKobo(...lines.map((l) => l.amount_kobo));
  const { vat, total } = opts.vat
    ? applyVat(subtotal_kobo, opts.vatRate ?? 7.5)
    : { vat: 0, total: subtotal_kobo };
  const deposit = opts.deposit_kobo ?? 0;
  return {
    subtotal_kobo,
    vat_kobo: vat,
    total_kobo: total,
    balance_kobo: Math.max(0, total - deposit),
  };
}

/** Derive the invoice status from its balance and due date. */
export function invoiceStatus(
  balance_kobo: number,
  dueAt: Date | null,
  now: Date,
): "paid" | "overdue" | "balance_due" {
  if (balance_kobo <= 0) return "paid";
  if (dueAt && dueAt.getTime() < now.getTime()) return "overdue";
  return "balance_due";
}
