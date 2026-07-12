import { getMember } from "@/lib/auth";
import { createServerClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui";

export default async function MyProfilePage() {
  const member = await getMember();
  const supabase = await createServerClient();
  const { data: staff } = await supabase
    .from("staff_profiles")
    .select("name, role_title, phone, vetting_status")
    .eq("user_id", member?.userId ?? "")
    .maybeSingle();

  const s = staff as {
    name: string;
    role_title: string;
    phone: string | null;
    vetting_status: string;
  } | null;

  return (
    <div>
      <h1 className="mb-4 font-display text-xl font-bold">My profile</h1>
      <div className="card p-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-display text-base font-semibold">{s?.name ?? member?.name}</div>
            <div className="text-sm text-muted">{s?.role_title ?? "Cleaner"} · {s?.phone ?? "—"}</div>
          </div>
          {s && <Badge value={s.vetting_status === "vetted" ? "vetted" : "pending"} />}
        </div>
      </div>
    </div>
  );
}
