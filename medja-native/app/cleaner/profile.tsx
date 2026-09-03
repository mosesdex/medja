import { useCallback, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { c } from "@/lib/theme";
import { Card, Badge, Btn, Muted, H1 } from "@/components/ui";

export default function CleanerProfile() {
  const { member, signOut } = useAuth();
  const [s, setS] = useState<{ name: string; role_title: string | null; phone: string | null; vetting_status: string } | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("staff_profiles").select("name, role_title, phone, vetting_status").eq("user_id", member?.userId ?? "").maybeSingle();
    setS(data as typeof s);
  }, [member]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <View style={st.head}><H1>My profile</H1></View>
      <View style={{ padding: 16, paddingTop: 0 }}>
        <Card style={{ marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 16, fontWeight: "700", color: c.ink }}>{s?.name ?? member?.name}</Text>
            <Muted>{s?.role_title ?? "Cleaner"} · {s?.phone ?? "—"}</Muted>
          </View>
          {s ? <Badge value={s.vetting_status === "vetted" ? "vetted" : "pending"} /> : null}
        </Card>
        <Btn title="Sign out" kind="outline" onPress={signOut} />
      </View>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({ head: { paddingHorizontal: 16, paddingVertical: 12 } });
