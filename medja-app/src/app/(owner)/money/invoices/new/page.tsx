import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { InvoiceForm } from "./InvoiceForm";
import { EmptyState } from "@/components/ui";

export default async function NewInvoicePage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const { job } = await searchParams;
  const supabase = await createServerClient();
  const { data: clients } = await supabase.from("clients").select("id, name").order("name");

  let defaultClientId: string | undefined;
  if (job) {
    const { data: jobRow } = await supabase
      .from("jobs")
      .select("client_id")
      .eq("id", job)
      .maybeSingle();
    defaultClientId = (jobRow as { client_id: string } | null)?.client_id;
  }

  return (
    <div className="mx-auto max-w-lg">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/money" className="btn-outline px-3 py-2">←</Link>
        <h1 className="font-display text-xl font-bold">New invoice</h1>
      </header>
      {!clients?.length ? (
        <EmptyState title="Add a client first" hint="Invoices need a client." />
      ) : (
        <InvoiceForm clients={clients} jobId={job} defaultClientId={defaultClientId} />
      )}
    </div>
  );
}
