"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";

export async function assignStaff(jobId: string, staffId: string) {
  const member = await getMember();
  if (!member) throw new Error("No company");
  const supabase = await createServerClient();
  await supabase
    .from("job_assignments")
    .upsert(
      { company_id: member.companyId, job_id: jobId, staff_id: staffId },
      { onConflict: "job_id,staff_id" },
    );
  revalidatePath(`/jobs/${jobId}`);
}

export async function unassignStaff(jobId: string, staffId: string) {
  const supabase = await createServerClient();
  await supabase
    .from("job_assignments")
    .delete()
    .eq("job_id", jobId)
    .eq("staff_id", staffId);
  revalidatePath(`/jobs/${jobId}`);
}
