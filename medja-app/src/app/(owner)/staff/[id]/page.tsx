import Link from "next/link";
import { notFound } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui";
import { formatNaira } from "@/lib/money";
import { waLink } from "@/lib/whatsapp";
import { vettingProgress, VETTING_CHECKLIST } from "@/features/staff/vetting";
import { VettingControl } from "@/features/staff/VettingControl";

export default async function StaffDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerClient();
  const { data: s } = await supabase
    .from("staff_profiles")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (!s) notFound();

  const prog = vettingProgress(s);
  const firstName = String(s.name).split(/\s+/)[0];
  const shareMsg = `Your cleaner today is ${firstName} from our team — vetted with ID and guarantor on record. They will arrive shortly.`;
  const wa = s.phone ? waLink(s.phone, shareMsg) : null;

  return (
    <div className="mx-auto max-w-2xl">
      <header className="mb-4 flex items-center gap-3">
        <Link href="/staff" className="btn-outline px-3 py-2">←</Link>
        <h1 className="flex-1 font-display text-lg font-bold">{s.name}</h1>
        <Badge value={s.vetting_status === "vetted" ? "vetted" : "pending"} />
      </header>

      <div className="card mb-3 p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-base font-semibold">{s.role_title}</div>
            <div className="text-sm text-muted">{s.phone ?? "—"}</div>
          </div>
          <VettingControl staffId={s.id} status={s.vetting_status} />
        </div>
      </div>

      <div className="card mb-3 p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="font-display text-sm font-semibold">Vetting record</h2>
          <span className="text-xs font-bold text-muted">{prog.done}/{prog.total}</span>
        </div>
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted-bg">
          <div className="h-full rounded-full bg-accent" style={{ width: `${(prog.done / prog.total) * 100}%` }} />
        </div>
        <dl className="divide-y divide-line text-sm">
          {VETTING_CHECKLIST.map((c) => {
            const val = s[c.key as keyof typeof s];
            return (
              <div key={c.key} className="flex justify-between py-2">
                <dt className="text-muted">{c.label}</dt>
                <dd className={val ? "font-semibold text-accent" : "text-muted"}>
                  {val ? "✓" : "—"}
                </dd>
              </div>
            );
          })}
          <div className="flex justify-between py-2">
            <dt className="text-muted">Guarantor</dt>
            <dd className="font-semibold">
              {s.guarantor_name ?? "—"}
              {s.guarantor_phone ? ` · ${s.guarantor_phone}` : ""}
            </dd>
          </div>
        </dl>
      </div>

      <div className="card mb-3 p-4">
        <h2 className="mb-2 font-display text-sm font-semibold">Pay</h2>
        <div className="flex justify-between text-sm">
          <span className="text-muted">Rate</span>
          <span className="font-semibold money">
            {s.pay_kobo ? `${formatNaira(s.pay_kobo)} ${String(s.pay_basis).replace("_", " ")}` : "—"}
          </span>
        </div>
      </div>

      {wa && (
        <a href={wa} target="_blank" rel="noopener" className="btn-outline w-full">
          Share verified-cleaner profile with a client
        </a>
      )}
    </div>
  );
}
