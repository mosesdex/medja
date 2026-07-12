import { redirect } from "next/navigation";
import { createServerClient } from "@/lib/supabase/server";

export type Role = "owner" | "supervisor" | "accountant" | "cleaner";

export interface Member {
  userId: string;
  companyId: string;
  role: Role;
  name: string;
}

/** Returns the current auth user or null. */
export async function getUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

/** Redirects to /login if not authenticated; returns the user otherwise. */
export async function requireUser() {
  const user = await getUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Returns the caller's membership (company + role), or null if the
 * authenticated user has not yet created/joined a company.
 */
export async function getMember(): Promise<Member | null> {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("members")
    .select("user_id, company_id, role, name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return null;
  const row = data as {
    user_id: string;
    company_id: string;
    role: string;
    name: string;
  };
  return {
    userId: row.user_id,
    companyId: row.company_id,
    role: row.role as Role,
    name: row.name,
  };
}

/** Requires an authenticated user WITH a company; else redirects appropriately. */
export async function requireMember(): Promise<Member> {
  const user = await getUser();
  if (!user) redirect("/login");
  const member = await getMember();
  if (!member) redirect("/onboarding");
  return member;
}

/** Requires the caller to hold one of the given roles. */
export async function requireRole(...roles: Role[]): Promise<Member> {
  const member = await requireMember();
  if (!roles.includes(member.role)) redirect("/dashboard");
  return member;
}
