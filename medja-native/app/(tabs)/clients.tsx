import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { c } from "@/lib/theme";
import { Card, Badge, H1, Muted } from "@/components/ui";

interface Client { id: string; name: string; phone: string | null; kind: string }

export default function Clients() {
  const [clients, setClients] = useState<Client[]>([]);
  const load = useCallback(async () => {
    const { data } = await supabase.from("clients").select("id, name, phone, kind").order("created_at", { ascending: false });
    setClients((data as unknown as Client[]) ?? []);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <View style={st.head}><H1>Clients</H1></View>
      <FlatList
        data={clients}
        keyExtractor={(c) => c.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListEmptyComponent={<Card><Muted>No clients yet.</Muted></Card>}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Text style={st.name}>{item.name}</Text>
              <Muted>{item.phone ?? "—"}</Muted>
            </View>
            <Badge value={item.kind} />
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingVertical: 12 },
  name: { fontWeight: "700", color: c.ink },
});
