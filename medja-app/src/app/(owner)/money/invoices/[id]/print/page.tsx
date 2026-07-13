import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";
import { formatNaira } from "@/lib/money";
import { PrintButton } from "./PrintButton";

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMember();
  const supabase = await createServerClient();

  const { data: inv } = await supabase
    .from("invoices")
    .select(
      "id, number, subtotal_kobo, vat_kobo, deposit_kobo, total_kobo, status, created_at, due_at, clients(name, phone)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!inv) notFound();

  const { data: lines } = await supabase
    .from("invoice_lines")
    .select("label, amount_kobo")
    .eq("invoice_id", id);

  const { data: company } = await supabase
    .from("companies")
    .select("name, city")
    .eq("id", member?.companyId ?? "")
    .maybeSingle();

  const client = inv.clients as unknown as { name: string; phone: string | null } | null;
  const co = company as { name: string; city: string | null } | null;
  const balance = inv.total_kobo - inv.deposit_kobo;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={`/money/invoices/${id}`} className="btn-outline px-3 py-2">← Back</Link>
        <PrintButton />
      </div>

      <div className="rounded-2xl border border-line bg-white p-8 print:border-0 print:p-0">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary font-display text-base font-bold text-white">
                {co?.name?.[0] ?? "M"}
              </div>
              <div className="font-display text-lg font-bold">{co?.name ?? "Medja"}</div>
            </div>
            {co?.city && <div className="mt-1 text-sm text-muted">{co.city}, Nigeria</div>}
          </div>
          <div className="text-right">
            <div className="font-display text-xl font-bold">INVOICE</div>
            <div className="text-sm text-muted">{inv.number}</div>
            <div className="mt-1 text-xs text-muted">
              {new Date(inv.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm">
          <div className="text-muted">Bill to</div>
          <div className="font-bold">{client?.name}</div>
          {client?.phone && <div className="text-muted">{client.phone}</div>}
        </div>

        <table className="mt-6 w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-muted">
              <th className="pb-2">Description</th>
              <th className="pb-2 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {lines?.map((l, i) => (
              <tr key={i} className="border-b border-line">
                <td className="py-2">{l.label}</td>
                <td className="py-2 text-right money">{formatNaira(l.amount_kobo)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-64 text-sm">
          <div className="flex justify-between py-1">
            <span className="text-muted">Subtotal</span>
            <span className="money">{formatNaira(inv.subtotal_kobo)}</span>
          </div>
          {inv.vat_kobo > 0 && (
            <div className="flex justify-between py-1">
              <span className="text-muted">VAT (7.5%)</span>
              <span className="money">{formatNaira(inv.vat_kobo)}</span>
            </div>
          )}
          {inv.deposit_kobo > 0 && (
            <div className="flex justify-between py-1">
              <span className="text-muted">Deposit received</span>
              <span className="money text-accent">−{formatNaira(inv.deposit_kobo)}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-line py-2 font-display text-base font-bold">
            <span>Balance due</span>
            <span className="money">{formatNaira(balance)}</span>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          Thank you for your business. Pay by card, bank transfer or USSD via the link we sent on WhatsApp.
        </p>
      </div>
    </div>
  );
}
