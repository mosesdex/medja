import { useCallback, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { c } from "@/lib/theme";
import { StatTile, Muted, H1 } from "@/components/ui";
import { formatNaira } from "@/lib/money";

export default function CleanerPay() {
  const { member } = useAuth();
  const [rate, setRate] = useState(0);
  const [basis, setBasis] = useState("per_job");
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    const { data: s } = await supabase.from("staff_profiles").select("id, pay_kobo, pay_basis").eq("user_id", member?.userId ?? "").maybeSingle();
    const staff = s as { id: string; pay_kobo: number | null; pay_basis: string } | null;
    setRate(staff?.pay_kobo ?? 0);
    setBasis(staff?.pay_basis ?? "per_job");
    if (staff) {
      const { count } = await supabase.from("job_assignments").select("id", { count: "exact", head: true }).eq("staff_id", staff.id);
      setCount(count ?? 0);
    }
  }, [member]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <View style={st.head}><H1>My pay</H1></View>
      <View style={{ padding: 16, paddingTop: 0 }}>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <StatTile label="Jobs assigned" value={String(count)} />
          <StatTile label={`Rate (${basis.replace("_", " ")})`} value={formatNaira(rate)} tone="green" />
        </View>
        <View style={{ marginTop: 12 }}>
          <Muted>Full payroll runs (per-job / daily / monthly) are computed by your company.</Muted>
        </View>
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({ head: { paddingHorizontal: 16, paddingVertical: 12 } });
