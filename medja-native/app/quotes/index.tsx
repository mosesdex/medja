import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useFocusEffect, Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { c } from "@/lib/theme";
import { Card, Badge, Money, Muted } from "@/components/ui";

interface Quote { id: string; total_kobo: number; status: string; clients: { name: string } | null }

export default function Quotes() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const load = useCallback(async () => {
    const { data } = await supabase.from("quotes").select("id, total_kobo, status, clients(name)").order("created_at", { ascending: false }).limit(50);
    setQuotes((data as unknown as Quote[]) ?? []);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <View style={st.head}>
        <Text onPress={() => router.back()} style={st.back}>←</Text>
        <Text style={st.title}>Quotes</Text>
        <Link href="/quotes/new" style={{ color: c.primary, fontWeight: "700", fontSize: 15 }}>+ New</Link>
      </View>
      <FlatList
        data={quotes}
        keyExtractor={(q) => q.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListEmptyComponent={<Card><Muted>No quotes yet.</Muted></Card>}
        renderItem={({ item: q }) => (
          <Link href={`/quotes/${q.id}`} asChild>
            <Card style={{ marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: "700", color: c.ink }}>{q.clients?.name ?? "Client"}</Text>
              </View>
              <Money kobo={q.total_kobo} />
              <Badge value={q.status} />
            </Card>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 12 },
  back: { fontSize: 24, color: c.ink, width: 30 },
  title: { flex: 1, fontSize: 20, fontWeight: "800", color: c.ink },
});
