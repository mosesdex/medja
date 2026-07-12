"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";

/** Record a job photo row after the client uploaded the file to Storage. */
export async function recordJobPhoto(
  jobId: string,
  kind: "before" | "after",
  path: string,
) {
  const member = await getMember();
  if (!member) throw new Error("No company");
  const supabase = await createServerClient();
  await supabase.from("job_photos").insert({
    company_id: member.companyId,
    job_id: jobId,
    kind,
    path,
  });
  revalidatePath(`/my-jobs/${jobId}`);
  revalidatePath(`/jobs/${jobId}`);
}
