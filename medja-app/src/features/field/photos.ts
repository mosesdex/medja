"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";

export interface JobPhoto {
  kind: "before" | "after";
  url: string;
}

/**
 * Fetch a job's photos as short-lived signed URLs (the bucket is private).
 * Returns before/after image URLs the owner page can render.
 */
export async function getJobPhotos(jobId: string): Promise<JobPhoto[]> {
  const supabase = await createServerClient();
  const { data: rows } = await supabase
    .from("job_photos")
    .select("kind, path")
    .eq("job_id", jobId)
    .order("created_at");
  if (!rows?.length) return [];

  const signed = await Promise.all(
    rows.map(async (r) => {
      const { data } = await supabase.storage
        .from("job-photos")
        .createSignedUrl(r.path as string, 60 * 60); // 1 hour
      return data?.signedUrl
        ? { kind: r.kind as "before" | "after", url: data.signedUrl }
        : null;
    }),
  );
  return signed.filter((p): p is JobPhoto => p !== null);
}

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
