import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { Badge, Naira } from "@/components/ui";
import { formatNaira } from "@/lib/money";
import { waLink } from "@/lib/whatsapp";
import { QuoteActions } from "@/features/quotes/QuoteActions";

export default async function QuoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: quote } = await supabase
    .from("quotes")
    .select("id, total_kobo, status, clients(name, phone)")
    .eq("id", id)
    .maybeSingle();
  if (!quote) notFound();

  const { data: lines } = await supabase
    .from("quote_lines")
    .select("label, amount_kobo")
    .eq("quote_id", id);

  const client = quote.clients as unknown as { name: string; phone: string | null } | null;

  const wa =
    client?.phone &&
    waLink(
      client.phone,
      `Hello ${client.name}, here is your cleaning quote:\n${(lines ?? [])
        .map((l) => `• ${l.label}: ${formatNaira(l.amount_kobo as number)}`)
        .join("\n")}\n\nTotal: ${formatNaira(quote.total_kobo)}. Reply to book.`,
    );

  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/money/quotes" className="btn-outline px-3 py-2">←</Link>
        <h1 className="flex-1 font-display text-lg font-bold">Quote</h1>
        <Badge value={quote.status} />
      </header>

      <div className="card p-4">
        <div className="mb-3 font-display text-base font-semibold">{client?.name}</div>
        <div className="divide-y divide-line text-sm">
          {lines?.map((l, i) => (
            <div key={i} className="flex justify-between py-2">
              <span className="text-muted">{l.label}</span>
              <Naira kobo={l.amount_kobo as number} />
            </div>
          ))}
          <div className="flex justify-between py-2 font-display text-base font-bold">
            <span>Total</span>
            <Naira kobo={quote.total_kobo} />
          </div>
        </div>
      </div>

      {wa && (
        <a href={wa} target="_blank" rel="noopener" className="btn-outline mt-3 w-full">
          Send quote via WhatsApp
        </a>
      )}
      <div className="mt-2">
        <QuoteActions quoteId={quote.id} status={quote.status} />
      </div>
    </div>
  );
}
