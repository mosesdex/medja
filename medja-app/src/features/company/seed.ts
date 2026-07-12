"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";
import { DEFAULT_CHECKLISTS } from "@/features/jobs/checklists";

/**
 * Seed realistic Lagos demo data for the current company so the app looks alive
 * for demos/pilots. Idempotent-ish: skips if demo clients already exist.
 */
export async function seedDemoData() {
  const member = await getMember();
  if (!member) throw new Error("No company");
  const cid = member.companyId;
  const supabase = await createServerClient();

  const { count } = await supabase
    .from("clients")
    .select("id", { count: "exact", head: true });
  if ((count ?? 0) > 0) {
    return { skipped: true as const };
  }

  // Clients + sites
  const clients = [
    { name: "Mrs. Adebayo", phone: "08031234567", kind: "residential", site: { label: "Lekki home", address: "12 Admiralty Way, Lekki Phase 1", access_note: "Gateman: Sunday, call on arrival" } },
    { name: "Halogen HQ", phone: "08039998877", kind: "commercial", site: { label: "VI office", address: "5 Adeola Odeku, Victoria Island", access_note: "Report to facilities desk" } },
    { name: "Emerald Court (Dev.)", phone: "08025556644", kind: "developer", site: { label: "Ikeja site", address: "18 Isaac John, Ikeja GRA", access_note: "New build, 6 flats" } },
    { name: "Mr. Eze", phone: "08127773311", kind: "residential", site: { label: "Yaba flat", address: "3 Herbert Macaulay, Yaba", access_note: null } },
  ];

  const clientIds: Record<string, string> = {};
  const siteIds: Record<string, string> = {};
  for (const c of clients) {
    const { data: cl } = await supabase
      .from("clients")
      .insert({ company_id: cid, name: c.name, phone: c.phone, kind: c.kind })
      .select("id")
      .single();
    const clientId = (cl as { id: string }).id;
    clientIds[c.name] = clientId;
    const { data: st } = await supabase
      .from("client_sites")
      .insert({ company_id: cid, client_id: clientId, ...c.site })
      .select("id")
      .single();
    siteIds[c.name] = (st as { id: string }).id;
  }

  // Staff
  const staff = [
    { name: "Chidinma Okafor", role_title: "Team A lead", vetting_status: "vetted", nin: "12345678901", guarantor_name: "Emeka Okafor", guarantor_phone: "08030000001", guarantor_address: "22 Awolowo Rd, Ikoyi", background_check: "cleared 2026-02", pay_kobo: 450000 },
    { name: "Blessing Adeyemi", role_title: "Cleaner", vetting_status: "vetted", nin: "22345678902", guarantor_name: "Tunde Adeyemi", guarantor_phone: "08030000002", guarantor_address: "10 Bode Thomas, Surulere", background_check: "cleared 2026-03", pay_kobo: 400000 },
    { name: "Funke Balogun", role_title: "New hire", vetting_status: "pending", pay_kobo: 350000 },
  ];
  const staffIds: string[] = [];
  for (const s of staff) {
    const { data } = await supabase
      .from("staff_profiles")
      .insert({ company_id: cid, pay_basis: "per_job", ...s })
      .select("id")
      .single();
    staffIds.push((data as { id: string }).id);
  }

  // Jobs today + this week
  const now = new Date();
  const at = (dayOffset: number, hour: number) => {
    const d = new Date(now);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(hour, 0, 0, 0);
    return d.toISOString();
  };
  const jobs = [
    { client: "Mrs. Adebayo", type: "residential", when: at(0, 8), value_kobo: 5500000, status: "in_progress" },
    { client: "Halogen HQ", type: "commercial", when: at(0, 11), value_kobo: 18000000, status: "booked" },
    { client: "Emerald Court (Dev.)", type: "post_construction", when: at(0, 14), value_kobo: 24000000, status: "booked" },
    { client: "Mr. Eze", type: "residential", when: at(1, 16), value_kobo: 2200000, status: "booked" },
  ];
  for (const j of jobs) {
    const { data: job } = await supabase
      .from("jobs")
      .insert({
        company_id: cid,
        client_id: clientIds[j.client],
        site_id: siteIds[j.client],
        type: j.type,
        status: j.status,
        scheduled_at: j.when,
        value_kobo: j.value_kobo,
      })
      .select("id")
      .single();
    const jobId = (job as { id: string }).id;
    const items = (DEFAULT_CHECKLISTS[j.type] ?? []).map((label, i) => ({
      company_id: cid,
      job_id: jobId,
      label,
      position: i,
    }));
    if (items.length) await supabase.from("job_checklist_items").insert(items);
    if (staffIds[0]) {
      await supabase.from("job_assignments").insert({ company_id: cid, job_id: jobId, staff_id: staffIds[0] });
    }
  }

  // One paid invoice for the dashboard
  const { data: number } = await supabase.rpc("next_invoice_number", { p_company: cid });
  const { data: inv } = await supabase
    .from("invoices")
    .insert({
      company_id: cid,
      client_id: clientIds["Halogen HQ"],
      number: number ?? "INV-0001",
      subtotal_kobo: 18000000,
      total_kobo: 18000000,
      status: "paid",
    })
    .select("id")
    .single();
  if (inv) {
    await supabase.from("invoice_lines").insert({
      company_id: cid,
      invoice_id: (inv as { id: string }).id,
      label: "Daily office clean — monthly",
      amount_kobo: 18000000,
    });
  }

  revalidatePath("/dashboard");
  return { skipped: false as const };
}
