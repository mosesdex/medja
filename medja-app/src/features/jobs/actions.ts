"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";
import { toKobo } from "@/lib/money";
import { DEFAULT_CHECKLISTS } from "./checklists";

export async function createJob(formData: FormData) {
  const member = await getMember();
  if (!member) throw new Error("No company");
  const supabase = await createServerClient();

  const type = String(formData.get("type") ?? "residential");
  const naira = Number(formData.get("value_naira") ?? 0);

  const { data: job, error } = await supabase
    .from("jobs")
    .insert({
      company_id: member.companyId,
      client_id: String(formData.get("client_id")),
      site_id: String(formData.get("site_id") ?? "") || null,
      type,
      scheduled_at: new Date(String(formData.get("scheduled_at"))).toISOString(),
      value_kobo: naira ? toKobo(naira) : null,
      notes: String(formData.get("notes") ?? "").trim() || null,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const items = (DEFAULT_CHECKLISTS[type] ?? []).map((label, i) => ({
    company_id: member.companyId,
    job_id: (job as { id: string }).id,
    label,
    position: i,
  }));
  if (items.length) await supabase.from("job_checklist_items").insert(items);

  revalidatePath("/jobs");
  redirect(`/jobs/${(job as { id: string }).id}`);
}

export async function toggleChecklistItem(itemId: string, done: boolean, jobId: string) {
  const supabase = await createServerClient();
  await supabase.from("job_checklist_items").update({ done }).eq("id", itemId);
  revalidatePath(`/jobs/${jobId}`);
}

export async function updateJobStatus(jobId: string, status: string) {
  const supabase = await createServerClient();
  await supabase
    .from("jobs")
    // status is a validated enum on the DB side
    .update({ status: status as never })
    .eq("id", jobId);
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/jobs");
}

/** Reschedule a job and/or update its notes. */
export async function editJob(formData: FormData) {
  const supabase = await createServerClient();
  const jobId = String(formData.get("job_id"));
  const scheduledAt = String(formData.get("scheduled_at") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();
  const patch: { scheduled_at?: string; notes?: string | null } = {};
  if (scheduledAt) patch.scheduled_at = new Date(scheduledAt).toISOString();
  patch.notes = notes || null;
  await supabase.from("jobs").update(patch).eq("id", jobId);
  revalidatePath(`/jobs/${jobId}`);
  revalidatePath("/jobs");
}

/** Cancel (delete) a job. Its checklist/assignments cascade-delete. */
export async function deleteJob(jobId: string) {
  const supabase = await createServerClient();
  await supabase.from("jobs").delete().eq("id", jobId);
  revalidatePath("/jobs");
  redirect("/jobs");
}
