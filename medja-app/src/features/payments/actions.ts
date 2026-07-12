"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";
import { toKobo } from "@/lib/money";
import { initTransaction } from "@/lib/paystack";

/** Create a Paystack checkout link for an invoice's outstanding balance. */
export async function createPaymentLink(invoiceId: string): Promise<string> {
  const member = await getMember();
  if (!member) throw new Error("No company");
  const supabase = await createServerClient();

  const { data: inv } = await supabase
    .from("invoices")
    .select("id, number, total_kobo, deposit_kobo, clients(name, phone)")
    .eq("id", invoiceId)
    .maybeSingle();
  if (!inv) throw new Error("Invoice not found");

  const client = inv.clients as unknown as { name: string; phone: string | null } | null;
  const balance = inv.total_kobo - inv.deposit_kobo;
  const email = `${(client?.phone ?? "client").replace(/\D/g, "") || "client"}@medja-pay.app`;

  const { authorization_url, reference } = await initTransaction({
    email,
    amountKobo: balance,
    metadata: { invoiceId, company: member.companyId, number: inv.number },
    callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/money/invoices/${invoiceId}`,
  });

  await supabase.from("payments").insert({
    company_id: member.companyId,
    invoice_id: invoiceId,
    amount_kobo: balance,
    method: "paystack",
    status: "pending",
    reference,
  });

  revalidatePath(`/money/invoices/${invoiceId}`);
  return authorization_url;
}

/** Cleaner logs cash collected at a job; pending owner confirmation. */
export async function logCash(jobId: string, invoiceId: string | null, naira: number) {
  const member = await getMember();
  if (!member) throw new Error("No company");
  const supabase = await createServerClient();
  await supabase.from("payments").insert({
    company_id: member.companyId,
    job_id: jobId,
    invoice_id: invoiceId,
    amount_kobo: toKobo(naira),
    method: "cash",
    status: "pending",
  });
  revalidatePath("/money");
}

/** Owner confirms a pending cash/transfer payment; marks the invoice paid if cleared. */
export async function confirmPayment(paymentId: string) {
  const supabase = await createServerClient();
  const { data: p } = await supabase
    .from("payments")
    .update({ status: "confirmed" })
    .eq("id", paymentId)
    .select("invoice_id, amount_kobo")
    .maybeSingle();

  const pay = p as { invoice_id: string | null; amount_kobo: number } | null;
  if (pay?.invoice_id) {
    const { data: inv } = await supabase
      .from("invoices")
      .select("total_kobo, deposit_kobo")
      .eq("id", pay.invoice_id)
      .maybeSingle();
    const row = inv as { total_kobo: number; deposit_kobo: number } | null;
    if (row) {
      const { data: paidRows } = await supabase
        .from("payments")
        .select("amount_kobo")
        .eq("invoice_id", pay.invoice_id)
        .eq("status", "confirmed");
      const paid =
        (paidRows ?? []).reduce((s, r) => s + (r.amount_kobo as number), 0) +
        row.deposit_kobo;
      if (paid >= row.total_kobo) {
        await supabase.from("invoices").update({ status: "paid" }).eq("id", pay.invoice_id);
      }
    }
  }
  revalidatePath("/money");
}
