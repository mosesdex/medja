import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getMember } from "@/lib/auth";

/** Exchanges the magic-link code for a session, then routes by membership. */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createServerClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  const member = await getMember();
  return NextResponse.redirect(origin + (member ? "/dashboard" : "/onboarding"));
}
