"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";

export type StaffDocField = "nin_doc_path" | "guarantor_id_path" | "photo_path";

/** Record a staff document path after the client uploaded it to Storage. */
export async function recordStaffDoc(
  staffId: string,
  field: StaffDocField,
  path: string,
) {
  const member = await getMember();
  if (!member) throw new Error("No company");
  const supabase = await createServerClient();
  await supabase
    .from("staff_profiles")
    .update({ [field]: path })
    .eq("id", staffId);
  revalidatePath(`/staff/${staffId}`);
}

/** Short-lived signed URL for a private staff document (owner view). */
export async function signedStaffDoc(path: string): Promise<string | null> {
  const supabase = await createServerClient();
  const { data } = await supabase.storage
    .from("staff-docs")
    .createSignedUrl(path, 60 * 60);
  return data?.signedUrl ?? null;
}
