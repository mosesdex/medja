"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";
import { toKobo } from "@/lib/money";
import { vettingProgress } from "./vetting";

export async function createStaff(formData: FormData) {
  const member = await getMember();
  if (!member) throw new Error("No company");
  const supabase = await createServerClient();

  const fields = {
    nin: String(formData.get("nin") ?? "").trim() || null,
    guarantor_name: String(formData.get("guarantor_name") ?? "").trim() || null,
    guarantor_phone: String(formData.get("guarantor_phone") ?? "").trim() || null,
    guarantor_address: String(formData.get("guarantor_address") ?? "").trim() || null,
    background_check: String(formData.get("background_check") ?? "").trim() || null,
  };
  const pay = Number(formData.get("pay_naira") ?? 0);

  await supabase.from("staff_profiles").insert({
    company_id: member.companyId,
    name: String(formData.get("name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || null,
    role_title: String(formData.get("role_title") ?? "Cleaner"),
    ...fields,
    pay_kobo: pay ? toKobo(pay) : null,
    pay_basis: String(formData.get("pay_basis") ?? "per_job"),
    vetting_status: vettingProgress(fields).complete ? "vetted" : "pending",
  });

  revalidatePath("/staff");
  redirect("/staff");
}

export async function setVettingStatus(staffId: string, status: string) {
  const supabase = await createServerClient();
  await supabase
    .from("staff_profiles")
    .update({ vetting_status: status })
    .eq("id", staffId);
  revalidatePath(`/staff/${staffId}`);
  revalidatePath("/staff");
}
