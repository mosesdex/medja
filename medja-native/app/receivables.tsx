import { useCallback, useState } from "react";
import { View, Text, ScrollView, Linking, StyleSheet } from "react-native";
import { useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { c } from "@/lib/theme";
import { Card, Badge, StatTile, Muted } from "@/components/ui";
import { formatNaira } from "@/lib/money";
import { waLink } from "@/lib/whatsapp";
import { agingBucket, AGING_LABELS, type AgingBucket } from "@/features/invoices/aging";

const ORDER: AgingBucket[] = ["60+", "31-60", "1-30", "current"];

interface Row { id: string; number: string; clientName: string; phone: string | null; balance: number; bucket: AgingBucket }

export default function Receivables() {
  const [rows, setRows] = useState<Row[]>([]);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("invoices")
      .select("id, number, total_kobo, deposit_kobo, due_at, clients(name, phone)")
      .neq("status", "paid")
      .order("due_at", { ascending: true });
    const now = new Date();
    setRows(((data ?? []) as unknown as {
      id: string; number: string; total_kobo: number; deposit_kobo: number; due_at: string | null;
      clients: { name: string; phone: string | null } | null;
    }[]).map((i) => ({
      id: i.id, number: i.number,
      clientName: i.clients?.name ?? "Client", phone: i.clients?.phone ?? null,
      balance: i.total_kobo - i.deposit_kobo, bucket: agingBucket(i.due_at, now),
    })));
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const byBucket: Record<string, number> = { current: 0, "1-30": 0, "31-60": 0, "60+": 0 };
  for (const r of rows) byBucket[r.bucket] += r.balance;
  const total = rows.reduce((s, r) => s + r.balance, 0);
  const overdue = total - byBucket.current;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={st.head}>
          <Text onPress={() => router.back()} style={st.back}>←</Text>
          <Text style={st.title}>Receivables</Text>
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 14 }}>
          <StatTile label="Outstanding" value={formatNaira(total)} tone="amber" />
          <StatTile label="Overdue" value={formatNaira(overdue)} tone={overdue > 0 ? "amber" : "default"} />
          <StatTile label="60+ days" value={formatNaira(byBucket["60+"])} tone={byBucket["60+"] > 0 ? "amber" : "default"} />
        </View>

        {rows.length === 0 ? (
          <Card><Muted>Nothing outstanding. 🎉</Muted></Card>
        ) : (
          ORDER.filter((b) => rows.some((r) => r.bucket === b)).map((bucket) => (
            <View key={bucket} style={{ marginBottom: 14 }}>
              <Text style={st.section}>{AGING_LABELS[bucket]} · {formatNaira(byBucket[bucket])}</Text>
              {rows.filter((r) => r.bucket === bucket).map((r) => {
                const wa = r.phone ? waLink(r.phone, `Hello ${r.clientName}, a reminder that invoice ${r.number} (${formatNaira(r.balance)}) is outstanding. Pay by card, transfer or USSD. Thank you.`) : null;
                return (
                  <Card key={r.id} style={{ marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 10 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "700", color: c.ink }}>{r.clientName}</Text>
                      <Muted>{r.number} · {formatNaira(r.balance)}</Muted>
                    </View>
                    {bucket !== "current" ? <Badge value="overdue" /> : null}
                    {wa ? <Text onPress={() => Linking.openURL(wa)} style={{ color: c.primary, fontWeight: "700" }}>Remind</Text> : null}
                  </Card>
                );
              })}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  back: { fontSize: 24, color: c.ink, width: 30 },
  title: { fontSize: 18, fontWeight: "800", color: c.ink },
  section: { fontSize: 13, fontWeight: "700", color: c.muted, marginBottom: 8 },
});
