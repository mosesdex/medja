import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { Badge, Naira } from "@/components/ui";
import { Checklist } from "@/features/jobs/Checklist";
import { AssignControl } from "@/features/dispatch/AssignControl";
import { waLink } from "@/lib/whatsapp";

export default async function JobCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();

  const { data: job } = await supabase
    .from("jobs")
    .select(
      "id, type, status, scheduled_at, value_kobo, notes, clients(name, phone), client_sites(label, address, access_note)",
    )
    .eq("id", id)
    .maybeSingle();
  if (!job) notFound();

  const { data: items } = await supabase
    .from("job_checklist_items")
    .select("id, label, done")
    .eq("job_id", id)
    .order("position");

  const { data: allStaff } = await supabase
    .from("staff_profiles")
    .select("id, name")
    .order("name");
  const { data: assigned } = await supabase
    .from("job_assignments")
    .select("staff_id")
    .eq("job_id", id);
  const assignedIds = (assigned ?? []).map((a) => a.staff_id as string);

  const client = job.clients as unknown as {
    name: string;
    phone: string | null;
  } | null;
  const site = job.client_sites as unknown as {
    label: string;
    address: string | null;
    access_note: string | null;
  } | null;

  const when = new Date(job.scheduled_at).toLocaleString("en-NG", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  const wa =
    client?.phone &&
    waLink(
      client.phone,
      `Hello ${client.name}, this is an update on your cleaning job scheduled ${when}.`,
    );

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/jobs" className="btn-outline px-3 py-2">←</Link>
        <h1 className="flex-1 font-display text-lg font-bold">Job card</h1>
        <Badge value={job.status} />
      </header>

      <div className="card mb-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="font-display text-base font-semibold">{client?.name}</div>
            <div className="text-sm text-muted">{site?.label ?? "No site set"}</div>
          </div>
          <Badge value={job.type} />
        </div>
        <dl className="mt-3 divide-y divide-line text-sm">
          <Row k="When" v={when} />
          {site?.address && <Row k="Address" v={site.address} />}
          {site?.access_note && <Row k="Access" v={site.access_note} />}
          <Row k="Value" v={<Naira kobo={job.value_kobo} />} />
          {job.notes && <Row k="Notes" v={job.notes} />}
        </dl>
      </div>

      <div className="mb-3">
        <AssignControl
          jobId={id}
          allStaff={(allStaff ?? []) as { id: string; name: string }[]}
          assignedIds={assignedIds}
        />
      </div>

      {items && items.length > 0 && <Checklist jobId={id} items={items} />}

      <div className="mt-3 flex gap-2">
        {wa && (
          <a href={wa} target="_blank" rel="noopener" className="btn-outline flex-1">
            WhatsApp client
          </a>
        )}
        <Link href={`/money/invoices/new?job=${id}`} className="btn-primary flex-1">
          Create invoice
        </Link>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2">
      <dt className="text-muted">{k}</dt>
      <dd className="text-right font-semibold">{v}</dd>
    </div>
  );
}
