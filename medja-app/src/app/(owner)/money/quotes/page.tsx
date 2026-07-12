import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Badge, Naira, EmptyState } from "@/components/ui";

export default async function QuotesPage() {
  const supabase = await createServerClient();
  const { data: quotes } = await supabase
    .from("quotes")
    .select("id, total_kobo, status, created_at, clients(name)")
    .order("created_at", { ascending: false })
    .limit(30);

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/money" className="btn-outline px-3 py-2">←</Link>
        <h1 className="flex-1 font-display text-xl font-bold">Quotes</h1>
        <Link href="/money/quotes/new" className="btn-primary">+ New</Link>
      </header>

      {!quotes?.length ? (
        <EmptyState title="No quotes yet" hint="Build a quote from your room-count templates and send it on WhatsApp." />
      ) : (
        <div className="flex flex-col gap-2">
          {quotes.map((q) => {
            const client = q.clients as unknown as { name: string } | null;
            return (
              <Link key={q.id} href={`/money/quotes/${q.id}`} className="card flex items-center gap-3 p-3 hover:bg-muted-bg">
                <div className="flex-1">
                  <div className="font-bold">{client?.name}</div>
                  <div className="text-sm text-muted">
                    {new Date(q.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}
                  </div>
                </div>
                <Naira kobo={q.total_kobo} />
                <Badge value={q.status} />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
