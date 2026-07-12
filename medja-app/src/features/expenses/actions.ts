"use server";

import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";
import { toKobo } from "@/lib/money";

export async function addExpense(formData: FormData) {
  const member = await getMember();
  if (!member) throw new Error("No company");
  const supabase = await createServerClient();
  await supabase.from("expenses").insert({
    company_id: member.companyId,
    category: String(formData.get("category") ?? "supplies"),
    note: String(formData.get("note") ?? "").trim() || null,
    amount_kobo: toKobo(Number(formData.get("amount_naira") ?? 0)),
  });
  revalidatePath("/money/expenses");
}
