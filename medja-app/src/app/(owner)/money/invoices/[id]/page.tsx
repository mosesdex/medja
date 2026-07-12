import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { Badge, Naira } from "@/components/ui";
import { formatNaira } from "@/lib/money";
import { waLink } from "@/lib/whatsapp";
import { MarkPaidButton } from "./MarkPaidButton";
import { PayButton } from "@/features/payments/PayButton";
import { DepositForm } from "@/features/invoices/DepositForm";

export default async function InvoiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: inv } = await supabase
    .from("invoices")
    .select(
      "id, number, subtotal_kobo, vat_kobo, deposit_kobo, total_kobo, status, clients(name, phone)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!inv) notFound();

  const { data: lines } = await supabase
    .from("invoice_lines")
    .select("label, amount_kobo")
    .eq("invoice_id", id);

  const client = inv.clients as unknown as { name: string; phone: string | null } | null;
  const balance = inv.total_kobo - inv.deposit_kobo;

  const overdue = inv.status === "overdue";
  const wa =
    client?.phone &&
    waLink(
      client.phone,
      overdue
        ? `Hello ${client.name}, a friendly reminder that invoice ${inv.number} (balance ${formatNaira(balance)}) is now due. You can pay by card, transfer or USSD. Thank you.`
        : `Hello ${client.name}, here is invoice ${inv.number} from us. Balance due: ${formatNaira(balance)}. Thank you.`,
    );

  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/money" className="btn-outline px-3 py-2">←</Link>
        <h1 className="flex-1 font-display text-lg font-bold">{inv.number}</h1>
        <Badge value={inv.status} />
      </header>

      <div className="card p-4">
        <div className="mb-3 font-display text-base font-semibold">{client?.name}</div>
        <div className="divide-y divide-line text-sm">
          {lines?.map((l, i) => (
            <div key={i} className="flex justify-between py-2">
              <span className="text-muted">{l.label}</span>
              <Naira kobo={l.amount_kobo} />
            </div>
          ))}
          {inv.vat_kobo > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-muted">VAT (7.5%)</span>
              <Naira kobo={inv.vat_kobo} />
            </div>
          )}
          {inv.deposit_kobo > 0 && (
            <div className="flex justify-between py-2">
              <span className="text-muted">Deposit received</span>
              <span className="money text-accent">−{formatNaira(inv.deposit_kobo)}</span>
            </div>
          )}
          <div className="flex justify-between py-2 font-display text-base font-bold">
            <span>Balance due</span>
            <Naira kobo={balance} />
          </div>
        </div>
      </div>

      {inv.status !== "paid" && (
        <div className="mt-3 flex flex-col gap-2">
          <PayButton invoiceId={inv.id} />
          <DepositForm invoiceId={inv.id} />
        </div>
      )}
      <div className="mt-2 flex gap-2">
        {wa && (
          <a href={wa} target="_blank" rel="noopener" className="btn-outline flex-1">
            {overdue ? "Send reminder" : "Send via WhatsApp"}
          </a>
        )}
        {inv.status !== "paid" && <MarkPaidButton invoiceId={inv.id} />}
      </div>
      <p className="mt-3 text-center text-xs text-muted">
        Paystack link accepts card, bank transfer and USSD; the webhook marks the
        invoice paid automatically.
      </p>
    </div>
  );
}
