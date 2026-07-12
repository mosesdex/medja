"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";
import { toKobo } from "@/lib/money";
import { computeInvoice, type LineInput } from "./calc";

export async function createInvoice(formData: FormData) {
  const member = await getMember();
  if (!member) throw new Error("No company");
  const supabase = await createServerClient();

  const labels = formData.getAll("line_label").map(String);
  const amounts = formData.getAll("line_amount").map((a) => toKobo(Number(a)));
  const lines: LineInput[] = labels
    .map((label, i) => ({ label, amount_kobo: amounts[i] ?? 0 }))
    .filter((l) => l.label && l.amount_kobo > 0);
  if (!lines.length) throw new Error("Add at least one line");

  const vat = formData.get("vat") === "on";
  const deposit_kobo = toKobo(Number(formData.get("deposit_naira") ?? 0));
  const totals = computeInvoice(lines, { vat, deposit_kobo });

  const { data: number } = await supabase.rpc("next_invoice_number", {
    p_company: member.companyId,
  });

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      company_id: member.companyId,
      client_id: String(formData.get("client_id")),
      job_id: String(formData.get("job_id") ?? "") || null,
      number: number ?? "INV-0001",
      subtotal_kobo: totals.subtotal_kobo,
      vat_kobo: totals.vat_kobo,
      deposit_kobo,
      total_kobo: totals.total_kobo,
      status: totals.balance_kobo <= 0 ? "paid" : "balance_due",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const invoiceId = (invoice as { id: string }).id;
  await supabase.from("invoice_lines").insert(
    lines.map((l) => ({
      company_id: member.companyId,
      invoice_id: invoiceId,
      label: l.label,
      amount_kobo: l.amount_kobo,
    })),
  );

  revalidatePath("/money");
  redirect(`/money/invoices/${invoiceId}`);
}

export async function markInvoicePaid(invoiceId: string) {
  const supabase = await createServerClient();
  await supabase.from("invoices").update({ status: "paid" }).eq("id", invoiceId);
  revalidatePath(`/money/invoices/${invoiceId}`);
  revalidatePath("/money");
}
