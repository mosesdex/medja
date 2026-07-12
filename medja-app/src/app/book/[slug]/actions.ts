"use server";

import { createServerClient } from "@/lib/supabase/server";

export interface BookingResult {
  ok: boolean;
  error?: string;
}

/** Public booking: creates a lead client + booked job for the company slug. */
export async function submitBooking(
  slug: string,
  formData: FormData,
): Promise<BookingResult> {
  const supabase = await createServerClient();
  const when = new Date(String(formData.get("when")));
  const { error } = await supabase.rpc("public_booking", {
    p_slug: slug,
    p_client_name: String(formData.get("name") ?? "").trim(),
    p_phone: String(formData.get("phone") ?? "").trim(),
    p_type: String(formData.get("type") ?? "residential"),
    p_when: when.toISOString(),
    p_note: String(formData.get("note") ?? "").trim() || null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
