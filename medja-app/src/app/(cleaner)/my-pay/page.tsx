import { getMember } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { formatNaira } from "@/lib/money";
import { StatTile } from "@/components/ui";

export default async function MyPayPage() {
  const member = await getMember();
  const supabase = await createServerClient();

  const { data: staff } = await supabase
    .from("staff_profiles")
    .select("id, pay_kobo, pay_basis")
    .eq("user_id", member?.userId ?? "")
    .maybeSingle();

  // Count this month's completed jobs assigned to this staff member.
  const { count } = await supabase
    .from("job_assignments")
    .select("id", { count: "exact", head: true })
    .eq("staff_id", (staff as { id: string } | null)?.id ?? "");

  const rate = (staff as { pay_kobo: number | null } | null)?.pay_kobo ?? 0;
  const basis = (staff as { pay_basis: string } | null)?.pay_basis ?? "per_job";

  return (
    <div>
      <h1 className="mb-4 font-display text-xl font-bold">My pay</h1>
      <div className="grid grid-cols-2 gap-3">
        <StatTile label="Jobs assigned" value={String(count ?? 0)} />
        <StatTile label={`Rate (${basis.replace("_", " ")})`} value={formatNaira(rate)} tone="green" />
      </div>
      <p className="mt-4 text-sm text-muted">
        Full payroll runs (per-job / daily / monthly) arrive in Phase 4.
      </p>
    </div>
  );
}
