import { NextResponse, type NextRequest } from "next/server";
import { createServiceClient } from "@/lib/supabase/server";
import { occurrences } from "@/features/contracts/recurrence";

const HORIZON_DAYS = 14;

/**
 * Cron: for each active contract, materialize jobs up to HORIZON_DAYS ahead.
 * Idempotent — occurrences already present (by day) are skipped.
 * Protect with CRON_SECRET (Vercel Cron sends it as a bearer token).
 */
export async function GET(req: NextRequest) {
  if (
    process.env.CRON_SECRET &&
    req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: contracts } = await supabase
    .from("contracts")
    .select("id, company_id, client_id, site_id, weekdays, time_of_day, active")
    .eq("active", true);

  const now = new Date();
  let created = 0;

  for (const c of contracts ?? []) {
    const [h, m] = String(c.time_of_day).split(":").map(Number);
    const { data: existing } = await supabase
      .from("jobs")
      .select("scheduled_at")
      .eq("contract_id", c.id)
      .gte("scheduled_at", now.toISOString());

    const dates = occurrences(
      { weekdays: c.weekdays as number[], hour: h ?? 8, minute: m ?? 0 },
      now,
      HORIZON_DAYS,
      (existing ?? []).map((e) => new Date(e.scheduled_at as string)),
    );

    if (dates.length) {
      await supabase.from("jobs").insert(
        dates.map((d) => ({
          company_id: c.company_id,
          client_id: c.client_id,
          site_id: c.site_id,
          contract_id: c.id,
          type: "commercial",
          scheduled_at: d.toISOString(),
        })),
      );
      created += dates.length;
    }
    await supabase
      .from("contracts")
      .update({ last_generated_on: now.toISOString().slice(0, 10) })
      .eq("id", c.id);
  }

  return NextResponse.json({ ok: true, created });
}
