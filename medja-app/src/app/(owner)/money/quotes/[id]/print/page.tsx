import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";
import { formatNaira } from "@/lib/money";
import { PrintButton } from "@/app/(owner)/money/invoices/[id]/print/PrintButton";

export default async function QuotePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMember();
  const supabase = await createServerClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("id, total_kobo, status, created_at, clients(name, phone)")
    .eq("id", id)
    .maybeSingle();
  if (!quote) notFound();

  const { data: lines } = await supabase
    .from("quote_lines")
    .select("label, amount_kobo")
    .eq("quote_id", id);

  const { data: company } = await supabase
    .from("companies")
    .select("name, city")
    .eq("id", member?.companyId ?? "")
    .maybeSingle();

  const client = quote.clients as unknown as { name: string; phone: string | null } | null;
  const co = company as { name: string; city: string | null } | null;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-4 flex items-center justify-between print:hidden">
        <Link href={`/money/quotes/${id}`} className="btn-outline px-3 py-2">← Back</Link>
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
            <div className="font-display text-xl font-bold">QUOTE</div>
            <div className="mt-1 text-xs text-muted">
              {new Date(quote.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "long", year: "numeric" })}
            </div>
          </div>
        </div>

        <div className="mt-6 text-sm">
          <div className="text-muted">Prepared for</div>
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
                <td className="py-2 text-right money">{formatNaira(l.amount_kobo as number)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 ml-auto w-64 text-sm">
          <div className="flex justify-between border-t border-line py-2 font-display text-base font-bold">
            <span>Total</span>
            <span className="money">{formatNaira(quote.total_kobo)}</span>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          Quote valid for 30 days. Reply on WhatsApp to book. Prices in naira.
        </p>
      </div>
    </div>
  );
}
