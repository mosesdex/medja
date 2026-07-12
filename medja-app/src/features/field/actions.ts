"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";

async function currentStaffId(companyId: string): Promise<string | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("staff_profiles")
    .select("id")
    .eq("company_id", companyId)
    .eq("user_id", user.id)
    .maybeSingle();
  return (data as { id: string } | null)?.id ?? null;
}

export async function checkEvent(
  jobId: string,
  type: "check_in" | "check_out",
  coords: { lat: number; lng: number } | null,
) {
  const member = await getMember();
  if (!member) throw new Error("No company");
  const supabase = await createServerClient();

  await supabase.from("job_events").insert({
    company_id: member.companyId,
    job_id: jobId,
    staff_id: await currentStaffId(member.companyId),
    type,
    lat: coords?.lat ?? null,
    lng: coords?.lng ?? null,
    located: coords != null,
  });

  if (type === "check_in") {
    await supabase.from("jobs").update({ status: "in_progress" }).eq("id", jobId);
  }
  revalidatePath(`/my-jobs/${jobId}`);
}

export async function completeJob(jobId: string) {
  const supabase = await createServerClient();
  await supabase.from("jobs").update({ status: "done" }).eq("id", jobId);
  revalidatePath(`/my-jobs/${jobId}`);
  revalidatePath("/my-jobs");
}
