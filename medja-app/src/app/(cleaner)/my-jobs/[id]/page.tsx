import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";
import { Checklist } from "@/features/jobs/Checklist";
import { CheckInButton } from "@/features/field/CheckInButton";
import { CompleteButton } from "@/features/field/CompleteButton";
import { PhotoUpload } from "@/features/field/PhotoUpload";

export default async function CleanerJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMember();
  const supabase = await createServerClient();

  const { data: job } = await supabase
    .from("jobs")
    .select("id, type, status, scheduled_at, clients(name), client_sites(label, address, access_note)")
    .eq("id", id)
    .maybeSingle();
  if (!job) notFound();

  const { data: items } = await supabase
    .from("job_checklist_items")
    .select("id, label, done")
    .eq("job_id", id)
    .order("position");

  const { data: events } = await supabase
    .from("job_events")
    .select("type")
    .eq("job_id", id)
    .eq("type", "check_in")
    .limit(1);

  const client = job.clients as unknown as { name: string } | null;
  const site = job.client_sites as unknown as {
    label: string;
    address: string | null;
    access_note: string | null;
  } | null;
  const alreadyIn = (events?.length ?? 0) > 0 || job.status !== "booked";

  return (
    <div>
      <header className="mb-4 flex items-center gap-3">
        <Link href="/my-jobs" className="btn-outline px-3 py-2">←</Link>
        <h1 className="font-display text-lg font-bold">{client?.name}</h1>
      </header>

      <div className="card mb-3 p-4 text-sm">
        <div className="flex justify-between border-b border-line py-2">
          <span className="text-muted">Address</span>
          <span className="text-right font-semibold">{site?.address ?? site?.label ?? "—"}</span>
        </div>
        {site?.access_note && (
          <div className="flex justify-between py-2">
            <span className="text-muted">Access</span>
            <span className="text-right font-semibold">{site.access_note}</span>
          </div>
        )}
      </div>

      <div className="mb-3">
        <CheckInButton jobId={id} alreadyIn={alreadyIn} />
      </div>

      {items && items.length > 0 && <Checklist jobId={id} items={items} />}

      <div className="mt-3 grid grid-cols-2 gap-2">
        <PhotoUpload jobId={id} companyId={member!.companyId} kind="before" />
        <PhotoUpload jobId={id} companyId={member!.companyId} kind="after" />
      </div>

      <div className="mt-3 flex gap-2">
        <CompleteButton jobId={id} />
      </div>
      <p className="mt-3 text-center text-xs text-muted">
        Photo capture uploads to Supabase Storage once connected. Check-in time and
        GPS are recorded on the job card.
      </p>
    </div>
  );
}
