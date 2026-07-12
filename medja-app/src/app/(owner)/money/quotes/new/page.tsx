import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { QuoteForm } from "./QuoteForm";
import { EmptyState } from "@/components/ui";

export default async function NewQuotePage() {
  const supabase = await createServerClient();
  const { data: clients } = await supabase.from("clients").select("id, name").order("name");
  const { data: templates } = await supabase
    .from("quote_templates")
    .select("label, floor_kobo")
    .order("position");

  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/money/quotes" className="btn-outline px-3 py-2">←</Link>
        <h1 className="font-display text-xl font-bold">New quote</h1>
      </header>
      {!clients?.length ? (
        <EmptyState title="Add a client first" hint="Quotes need a client." />
      ) : (
        <QuoteForm
          clients={clients}
          templates={(templates ?? []) as { label: string; floor_kobo: number }[]}
        />
      )}
    </div>
  );
}
