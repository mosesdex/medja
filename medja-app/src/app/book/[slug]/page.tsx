import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { BookingForm } from "./BookingForm";

export default async function BookingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createServerClient();
  const { data } = await supabase.rpc("company_by_slug", { p_slug: slug });
  const company = (data as { id: string; name: string }[] | null)?.[0];
  if (!company) notFound();

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-6 py-10">
      <div className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary font-display text-2xl font-bold text-white">
          {company.name[0]}
        </div>
        <h1 className="font-display text-2xl font-bold">Book {company.name}</h1>
        <p className="text-sm text-muted">Request a cleaning — we&apos;ll confirm on WhatsApp.</p>
      </div>
      <BookingForm slug={slug} />
      <p className="text-center text-xs text-muted">Powered by Medja</p>
    </main>
  );
}
