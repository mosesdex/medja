import Link from "next/link";
import { createServerClient } from "@/lib/supabase/server";
import { Badge, EmptyState } from "@/components/ui";

const initials = (name: string) =>
  name.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export default async function StaffPage() {
  const supabase = await createServerClient();
  const { data: staff } = await supabase
    .from("staff_profiles")
    .select("id, name, role_title, vetting_status")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl">
      <header className="mb-4 flex items-center justify-between gap-2">
        <h1 className="font-display text-xl font-bold">Staff</h1>
        <div className="flex gap-2">
          <Link href="/staff/payroll" className="btn-outline text-sm">Payroll</Link>
          <Link href="/staff/new" className="btn-primary">+ Add staff</Link>
        </div>
      </header>

      {!staff?.length ? (
        <EmptyState
          title="No staff yet"
          hint="Add your cleaners with ID and guarantor records for vetting."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {staff.map((s) => (
            <Link key={s.id} href={`/staff/${s.id}`} className="card flex items-center gap-3 p-3 hover:bg-muted-bg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary font-display text-sm font-bold text-white">
                {initials(s.name)}
              </div>
              <div className="flex-1">
                <div className="font-bold">{s.name}</div>
                <div className="text-sm text-muted">{s.role_title}</div>
              </div>
              <Badge value={s.vetting_status === "vetted" ? "vetted" : "pending"} />
            </Link>
          ))}
        </div>
      )}

      <div className="card mt-4 flex items-center gap-3 border-accent/30 bg-accent-soft p-3">
        <span className="text-sm font-semibold text-accent">
          Clients get a &ldquo;verified cleaner&rdquo; profile before each visit — the #1 trust concern, solved.
        </span>
      </div>
    </div>
  );
}
