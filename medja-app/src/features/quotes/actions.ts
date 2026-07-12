"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";
import { toKobo, addKobo } from "@/lib/money";

export async function createQuote(formData: FormData) {
  const member = await getMember();
  if (!member) throw new Error("No company");
  const supabase = await createServerClient();

  const labels = formData.getAll("line_label").map(String);
  const amounts = formData.getAll("line_amount").map((a) => toKobo(Number(a)));
  const lines = labels
    .map((label, i) => ({ label, amount_kobo: amounts[i] ?? 0 }))
    .filter((l) => l.label && l.amount_kobo > 0);
  if (!lines.length) throw new Error("Add at least one line");

  const total = addKobo(...lines.map((l) => l.amount_kobo));
  const { data: quote, error } = await supabase
    .from("quotes")
    .insert({
      company_id: member.companyId,
      client_id: String(formData.get("client_id")),
      total_kobo: total,
      status: "draft",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const quoteId = (quote as { id: string }).id;
  await supabase.from("quote_lines").insert(
    lines.map((l) => ({
      company_id: member.companyId,
      quote_id: quoteId,
      label: l.label,
      amount_kobo: l.amount_kobo,
    })),
  );

  revalidatePath("/money/quotes");
  redirect(`/money/quotes/${quoteId}`);
}

export async function setQuoteStatus(quoteId: string, status: string) {
  const supabase = await createServerClient();
  await supabase.from("quotes").update({ status }).eq("id", quoteId);
  revalidatePath(`/money/quotes/${quoteId}`);
}

/** Convert an accepted quote into an invoice, copying its lines. */
export async function quoteToInvoice(quoteId: string) {
  const member = await getMember();
  if (!member) throw new Error("No company");
  const supabase = await createServerClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("id, client_id, total_kobo")
    .eq("id", quoteId)
    .maybeSingle();
  if (!quote) throw new Error("Quote not found");
  const q = quote as { id: string; client_id: string; total_kobo: number };

  const { data: lines } = await supabase
    .from("quote_lines")
    .select("label, amount_kobo")
    .eq("quote_id", quoteId);

  const { data: number } = await supabase.rpc("next_invoice_number", {
    p_company: member.companyId,
  });

  const { data: invoice, error } = await supabase
    .from("invoices")
    .insert({
      company_id: member.companyId,
      client_id: q.client_id,
      number: number ?? "INV-0001",
      subtotal_kobo: q.total_kobo,
      total_kobo: q.total_kobo,
      status: "balance_due",
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const invoiceId = (invoice as { id: string }).id;
  if (lines?.length) {
    await supabase.from("invoice_lines").insert(
      lines.map((l) => ({
        company_id: member.companyId,
        invoice_id: invoiceId,
        label: l.label as string,
        amount_kobo: l.amount_kobo as number,
      })),
    );
  }
  await supabase.from("quotes").update({ status: "invoiced" }).eq("id", quoteId);

  revalidatePath("/money");
  redirect(`/money/invoices/${invoiceId}`);
}
