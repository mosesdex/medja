"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";
import { toKobo } from "@/lib/money";

export async function createContract(formData: FormData) {
  const member = await getMember();
  if (!member) throw new Error("No company");
  const supabase = await createServerClient();

  const weekdays = formData.getAll("weekdays").map((d) => Number(d));

  await supabase.from("contracts").insert({
    company_id: member.companyId,
    client_id: String(formData.get("client_id")),
    site_id: String(formData.get("site_id") ?? "") || null,
    title: String(formData.get("title") ?? "").trim(),
    weekdays: weekdays.length ? weekdays : [1, 2, 3, 4, 5],
    time_of_day: String(formData.get("time_of_day") ?? "08:00"),
    monthly_kobo: toKobo(Number(formData.get("monthly_naira") ?? 0)),
    billing_day: Number(formData.get("billing_day") ?? 1),
  });

  revalidatePath("/money/contracts");
  redirect("/money/contracts");
}
