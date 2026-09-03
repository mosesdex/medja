import { useCallback, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { c } from "@/lib/theme";
import { Card, StatTile, Muted } from "@/components/ui";
import { formatNaira } from "@/lib/money";

const TYPE_LABEL: Record<string, string> = {
  residential: "Residential", commercial: "Commercial", post_construction: "Post-construction",
};

export default function Reports() {
  const [revenue, setRevenue] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [avgRating, setAvgRating] = useState<string | null>(null);
  const [byType, setByType] = useState<[string, number][]>([]);
  const [topClients, setTopClients] = useState<[string, number][]>([]);

  const load = useCallback(async () => {
    const { data: paid } = await supabase.from("invoices").select("total_kobo, clients(name)").eq("status", "paid");
    const { data: jobs } = await supabase.from("jobs").select("type, value_kobo");
    const { data: exp } = await supabase.from("expenses").select("amount_kobo");
    const { data: ratings } = await supabase.from("ratings").select("stars");

    setRevenue((paid ?? []).reduce((s, i) => s + (i.total_kobo as number), 0));
    setExpenseTotal((exp ?? []).reduce((s, e) => s + (e.amount_kobo as number), 0));
    const rc = ratings?.length ?? 0;
    setAvgRating(rc ? (ratings!.reduce((s, r) => s + (r.stars as number), 0) / rc).toFixed(1) : null);

    const t = new Map<string, number>();
    for (const j of jobs ?? []) t.set(j.type as string, (t.get(j.type as string) ?? 0) + ((j.value_kobo as number) ?? 0));
    setByType([...t.entries()]);

    const cl = new Map<string, number>();
    for (const i of paid ?? []) {
      const n = (i.clients as unknown as { name: string } | null)?.name ?? "—";
      cl.set(n, (cl.get(n) ?? 0) + (i.total_kobo as number));
    }
    setTopClients([...cl.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5));
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const typeMax = Math.max(1, ...byType.map(([, v]) => v));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={st.head}>
          <Text onPress={() => router.back()} style={st.back}>←</Text>
          <Text style={st.title}>Reports</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
          <StatTile label="Revenue" value={formatNaira(revenue)} tone="green" />
          <StatTile label="Expenses" value={formatNaira(expenseTotal)} tone="amber" />
          <StatTile label="Net" value={formatNaira(revenue - expenseTotal)} />
        </View>
        <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
          <StatTile label="Avg rating" value={avgRating ? `★ ${avgRating}` : "—"} />
        </View>

        <Card style={{ marginBottom: 12 }}>
          <Text style={st.section}>Revenue by service type</Text>
          {byType.length === 0 ? <Muted>No jobs yet.</Muted> : byType.map(([type, kobo]) => (
            <View key={type} style={{ marginBottom: 10 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 4 }}>
                <Text style={{ fontSize: 13, color: c.ink }}>{TYPE_LABEL[type] ?? type}</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: c.ink }}>{formatNaira(kobo)}</Text>
              </View>
              <View style={st.barBg}><View style={[st.bar, { width: `${(kobo / typeMax) * 100}%` }]} /></View>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={st.section}>Top clients</Text>
          {topClients.length === 0 ? <Muted>No paid invoices yet.</Muted> : topClients.map(([name, kobo]) => (
            <View key={name} style={st.row}>
              <Text style={{ fontSize: 13, color: c.ink }}>{name}</Text>
              <Text style={{ fontSize: 13, fontWeight: "700", color: c.ink }}>{formatNaira(kobo)}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  back: { fontSize: 24, color: c.ink, width: 30 },
  title: { fontSize: 18, fontWeight: "800", color: c.ink },
  section: { fontSize: 14, fontWeight: "700", color: c.ink, marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 6, borderTopWidth: 1, borderTopColor: c.line },
  barBg: { height: 10, borderRadius: 99, backgroundColor: c.mutedBg, overflow: "hidden" },
  bar: { height: 10, borderRadius: 99, backgroundColor: c.primary },
});
