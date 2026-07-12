"use server";

import { createServerClient } from "@/lib/supabase/server";

export interface RateResult {
  ok: boolean;
  error?: string;
}

/** Public: submit a 1-5 star rating for a job via the security-definer RPC. */
export async function submitRating(
  jobId: string,
  stars: number,
  comment: string,
): Promise<RateResult> {
  const supabase = await createServerClient();
  const { error } = await supabase.rpc("submit_rating", {
    p_job_id: jobId,
    p_stars: stars,
    p_comment: comment,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
