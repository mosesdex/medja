import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { c } from "@/lib/theme";
import { Card, Badge, H1, Muted } from "@/components/ui";

interface Staff { id: string; name: string; role_title: string | null; vetting_status: string }

const initials = (n: string) => n.split(/\s+/).slice(0, 2).map((w) => w[0]).join("").toUpperCase();

export default function StaffTab() {
  const [staff, setStaff] = useState<Staff[]>([]);
  const load = useCallback(async () => {
    const { data } = await supabase.from("staff_profiles").select("id, name, role_title, vetting_status").order("created_at", { ascending: false });
    setStaff((data as unknown as Staff[]) ?? []);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <View style={st.head}><H1>Staff</H1></View>
      <FlatList
        data={staff}
        keyExtractor={(s) => s.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListEmptyComponent={<Card><Muted>No staff yet.</Muted></Card>}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={st.avatar}><Text style={st.avatarText}>{initials(item.name)}</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={st.name}>{item.name}</Text>
              <Muted>{item.role_title ?? "Cleaner"}</Muted>
            </View>
            <Badge value={item.vetting_status === "vetted" ? "vetted" : "pending"} />
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingVertical: 12 },
  name: { fontWeight: "700", color: c.ink },
  avatar: { width: 42, height: 42, borderRadius: 12, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" },
  avatarText: { color: c.white, fontWeight: "700", fontSize: 13 },
});
