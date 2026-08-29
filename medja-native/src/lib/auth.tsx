import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export type Role = "owner" | "supervisor" | "accountant" | "cleaner";
export interface Member {
  userId: string;
  companyId: string;
  role: Role;
  name: string;
}

interface AuthState {
  loading: boolean;
  session: Session | null;
  member: Member | null;
  refreshMember: () => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState>({
  loading: true,
  session: null,
  member: null,
  refreshMember: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [member, setMember] = useState<Member | null>(null);

  async function loadMember(s: Session | null) {
    if (!s) {
      setMember(null);
      return;
    }
    const { data } = await supabase
      .from("members")
      .select("user_id, company_id, role, name")
      .eq("user_id", s.user.id)
      .maybeSingle();
    if (data) {
      const r = data as { user_id: string; company_id: string; role: string; name: string };
      setMember({ userId: r.user_id, companyId: r.company_id, role: r.role as Role, name: r.name });
    } else {
      setMember(null);
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      await loadMember(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(async (_e, s) => {
      setSession(s);
      await loadMember(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <Ctx.Provider
      value={{
        loading,
        session,
        member,
        refreshMember: () => loadMember(session),
        signOut: async () => {
          await supabase.auth.signOut();
        },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
