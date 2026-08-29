import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useFocusEffect, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { c } from "@/lib/theme";
import { Card, Badge, Money, StatTile, H1, Muted } from "@/components/ui";
import { formatNaira } from "@/lib/money";

interface Inv { id: string; number: string; total_kobo: number; deposit_kobo: number; status: string; clients: { name: string } | null }

export default function MoneyTab() {
  const [invoices, setInvoices] = useState<Inv[]>([]);
  const load = useCallback(async () => {
    const { data } = await supabase
      .from("invoices")
      .select("id, number, total_kobo, deposit_kobo, status, clients(name)")
      .order("created_at", { ascending: false })
      .limit(50);
    setInvoices((data as unknown as Inv[]) ?? []);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const collected = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + i.total_kobo, 0);
  const outstanding = invoices.filter((i) => i.status !== "paid").reduce((s, i) => s + (i.total_kobo - i.deposit_kobo), 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <View style={[st.head, { flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
        <H1>Money</H1>
        <Link href="/invoices/new" style={{ color: c.primary, fontWeight: "700", fontSize: 15 }}>+ New</Link>
      </View>
      <FlatList
        data={invoices}
        keyExtractor={(i) => i.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListHeaderComponent={
          <View style={st.tiles}>
            <StatTile label="Collected" value={formatNaira(collected)} tone="green" />
            <StatTile label="Outstanding" value={formatNaira(outstanding)} tone="amber" />
          </View>
        }
        ListEmptyComponent={<Card><Muted>No invoices yet.</Muted></Card>}
        renderItem={({ item: i }) => (
          <Link href={`/invoices/${i.id}`} asChild>
            <Card style={{ marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Text style={st.name}>{i.number}</Text>
                <Muted>{i.clients?.name ?? "Client"}</Muted>
              </View>
              <Money kobo={i.total_kobo} />
              <Badge value={i.status} />
            </Card>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingVertical: 12 },
  tiles: { flexDirection: "row", gap: 10, marginBottom: 14 },
  name: { fontWeight: "700", color: c.ink },
});
