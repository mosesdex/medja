"use server";

import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

/** Create the caller's company and seed default quote templates. */
export async function createCompany(formData: FormData) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const ownerName = String(formData.get("owner_name") ?? "").trim();
  const serviceTypes = formData.getAll("service_types").map(String);

  if (!name || !ownerName) {
    throw new Error("Company name and your name are required.");
  }

  const { data: companyId, error } = await supabase.rpc("create_company", {
    p_name: name,
    p_city: city,
    p_service_types: serviceTypes,
    p_owner_name: ownerName,
  });
  if (error) throw new Error(error.message);

  if (companyId) {
    await supabase.rpc("seed_default_templates", { p_company: companyId });
  }

  redirect("/dashboard");
}
