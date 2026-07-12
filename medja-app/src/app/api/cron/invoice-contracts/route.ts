import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { isBillingDay } from "@/features/contracts/recurrence";

/**
 * Cron (run daily): for each active contract whose billing day is today and
 * that hasn't been invoiced this month, create a monthly invoice. Idempotent
 * via a per-month reference check on invoice number prefix.
 */
export async function GET(req: NextRequest) {
  if (
    process.env.CRON_SECRET &&
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const today = new Date();
  const monthTag = `${today.getFullYear()}-${today.getMonth() + 1}`;

  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, company_id, client_id, title, monthly_kobo, billing_day, active")
    .eq("active", true);

  let created = 0;
  for (const c of contracts ?? []) {
    if (!isBillingDay(c.billing_day as number, today)) continue;
    if (!c.monthly_kobo) continue;

    // Idempotency: has this contract already been invoiced this month?
    const { data: existing } = await supabase
      .from("invoices")
      .select("id")
      .eq("company_id", c.company_id)
      .eq("client_id", c.client_id)
      .gte("created_at", new Date(today.getFullYear(), today.getMonth(), 1).toISOString())
      .limit(1);
    if (existing?.length) continue;

    const { data: number } = await supabase.rpc("next_invoice_number", {
      p_company: c.company_id,
    });

    const { data: inv } = await supabase
      .from("invoices")
      .insert({
        company_id: c.company_id,
        client_id: c.client_id,
        number: number ?? "INV-0001",
        subtotal_kobo: c.monthly_kobo,
        total_kobo: c.monthly_kobo,
        status: "balance_due",
      })
      .select("id")
      .single();

    if (inv) {
      await supabase.from("invoice_lines").insert({
        company_id: c.company_id,
        invoice_id: (inv as { id: string }).id,
        label: `${c.title} — ${monthTag} monthly contract`,
        amount_kobo: c.monthly_kobo,
      });
      created += 1;
    }
  }

  return NextResponse.json({ ok: true, created });
}
