"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";

export async function createClient(formData: FormData) {
  const member = await getMember();
  if (!member) throw new Error("No company");
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from("clients")
    .insert({
      company_id: member.companyId,
      name: String(formData.get("name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim() || null,
      kind: String(formData.get("kind") ?? "residential"),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);

  const siteLabel = String(formData.get("site_label") ?? "").trim();
  if (siteLabel && data) {
    await supabase.from("client_sites").insert({
      company_id: member.companyId,
      client_id: (data as { id: string }).id,
      label: siteLabel,
      address: String(formData.get("site_address") ?? "").trim() || null,
      access_note: String(formData.get("site_access") ?? "").trim() || null,
    });
  }
  revalidatePath("/clients");
  redirect("/clients");
}

export async function addSite(formData: FormData) {
  const member = await getMember();
  if (!member) throw new Error("No company");
  const supabase = await createServerClient();
  const clientId = String(formData.get("client_id"));
  await supabase.from("client_sites").insert({
    company_id: member.companyId,
    client_id: clientId,
    label: String(formData.get("label") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim() || null,
    access_note: String(formData.get("access_note") ?? "").trim() || null,
  });
  revalidatePath(`/clients/${clientId}`);
}
