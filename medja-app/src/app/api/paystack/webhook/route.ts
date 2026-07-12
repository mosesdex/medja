import { NextResponse, type NextRequest } from "next/server";
import { verifyWebhookSignature } from "@/lib/paystack";
import { createServiceClient } from "@/lib/supabase/server";

/**
 * Paystack webhook. Verifies the signature, then on charge.success marks the
 * matching pending payment confirmed and the invoice paid. Idempotent: a
 * repeat delivery for an already-confirmed reference is a no-op.
 */
export async function POST(req: NextRequest) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!verifyWebhookSignature(raw, signature)) {
    return NextResponse.json({ error: "bad signature" }, { status: 401 });
  }

  const event = JSON.parse(raw);
  if (event.event !== "charge.success") {
    return NextResponse.json({ ok: true });
  }

  const reference: string | undefined = event.data?.reference;
  if (!reference) return NextResponse.json({ ok: true });

  const supabase = createServiceClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, invoice_id, status")
    .eq("reference", reference)
    .maybeSingle();

  const p = payment as
    | { id: string; invoice_id: string | null; status: string }
    | null;
  if (!p || p.status === "confirmed") {
    return NextResponse.json({ ok: true }); // unknown or already handled
  }

  await supabase.from("payments").update({ status: "confirmed" }).eq("id", p.id);
  if (p.invoice_id) {
    await supabase.from("invoices").update({ status: "paid" }).eq("id", p.invoice_id);
  }
  return NextResponse.json({ ok: true });
}
