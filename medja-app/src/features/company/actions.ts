"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";
import { seedDemoData } from "./seed";

/**
 * Guided onboarding: create the company, seed default quote templates, and
 * (optionally) load sample data, then land on the dashboard.
 */
export async function completeOnboarding(formData: FormData) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "").trim();
  const ownerName = String(formData.get("owner_name") ?? "").trim();
  if (!name || !ownerName) throw new Error("Company name and your name are required.");

  const serviceTypes = formData.getAll("service_types").map(String);
  const { data: companyId, error } = await supabase.rpc("create_company", {
    p_name: name,
    p_city: String(formData.get("city") ?? "").trim(),
    p_service_types: serviceTypes,
    p_owner_name: ownerName,
  });
  if (error) throw new Error(error.message);

  if (companyId) {
    await supabase.rpc("seed_default_templates", { p_company: companyId });
  }
  if (formData.get("seed") === "sample") {
    try {
      await seedDemoData();
    } catch {
      // sample data is best-effort — never block onboarding on it
    }
  }

  redirect("/dashboard");
}

/** Normalize a booking slug: lowercase, alphanumeric + single hyphens. */
function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

/** Update the company's display profile (name, city). Owner only. */
export async function updateCompanyProfile(formData: FormData) {
  const member = await getMember();
  if (!member) throw new Error("No company");
  if (member.role !== "owner") throw new Error("Only owners can change this");
  const supabase = await createServerClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Company name is required");
  const { error } = await supabase
    .from("companies")
    .update({ name, city: String(formData.get("city") ?? "").trim() || null })
    .eq("id", member.companyId);
  if (error) throw new Error(error.message);
  revalidatePath("/settings");
}

/** Set the company's public booking slug (owner only). */
export async function setCompanySlug(formData: FormData) {
  const member = await getMember();
  if (!member) throw new Error("No company");
  if (member.role !== "owner") throw new Error("Only owners can change this");
  const supabase = await createServerClient();

  const slug = normalizeSlug(String(formData.get("slug") ?? ""));
  if (!slug) throw new Error("Enter a valid name");

  const { error } = await supabase
    .from("companies")
    .update({ slug })
    .eq("id", member.companyId);
  if (error) {
    // unique_violation → slug already taken
    throw new Error(
      error.code === "23505" ? "That link name is taken — try another." : error.message,
    );
  }
  revalidatePath("/settings");
}
