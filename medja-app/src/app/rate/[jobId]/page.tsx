import { createServerClient } from "@/lib/supabase/server";
import { RatingForm } from "./RatingForm";

export default async function RatePage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const supabase = await createServerClient();
  const { data } = await supabase.rpc("job_for_rating", { p_job_id: jobId });
  const clientName = (data as { client_name: string }[] | null)?.[0]?.client_name;

  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-5 px-6 py-10">
      <div className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary font-display text-2xl font-bold text-white">
          M
        </div>
        <h1 className="font-display text-2xl font-bold">
          {clientName ? `Hi ${clientName}` : "Rate your cleaning"}
        </h1>
        <p className="text-sm text-muted">Tell us how we did.</p>
      </div>
      <RatingForm jobId={jobId} />
      <p className="text-center text-xs text-muted">Powered by Medja</p>
    </main>
  );
}
