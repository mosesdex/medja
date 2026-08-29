import { useCallback, useState } from "react";
import { View, Text, ScrollView, RefreshControl, StyleSheet } from "react-native";
import { useFocusEffect, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { c } from "@/lib/theme";
import { Card, Badge, Money, StatTile, H1, Muted } from "@/components/ui";
import { formatNaira } from "@/lib/money";

interface Job { id: string; scheduled_at: string; type: string; status: string; value_kobo: number | null; clients: { name: string } | null }

export default function Dashboard() {
  const { member, signOut } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [collected, setCollected] = useState(0);
  const [outstanding, setOutstanding] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 86400000);
    const { data: j } = await supabase
      .from("jobs")
      .select("id, scheduled_at, type, status, value_kobo, clients(name)")
      .gte("scheduled_at", start.toISOString())
      .lt("scheduled_at", end.toISOString())
      .order("scheduled_at");
    setJobs((j as unknown as Job[]) ?? []);
    const { data: inv } = await supabase.from("invoices").select("total_kobo, deposit_kobo, status, created_at");
    const rows = (inv ?? []) as { total_kobo: number; deposit_kobo: number; status: string; created_at: string }[];
    setCollected(rows.filter((i) => i.status === "paid" && new Date(i.created_at) >= start).reduce((s, i) => s + i.total_kobo, 0));
    setOutstanding(rows.filter((i) => i.status !== "paid").reduce((s, i) => s + (i.total_kobo - i.deposit_kobo), 0));
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView
        contentContainerStyle={st.wrap}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
      >
        <View style={st.head}>
          <View>
            <H1>Hi {member?.name}</H1>
            <Muted>{today}</Muted>
          </View>
          <Text onPress={signOut} style={{ color: c.muted, fontSize: 13 }}>Sign out</Text>
        </View>

        <View style={st.tiles}>
          <StatTile label="Jobs today" value={String(jobs.length)} />
          <StatTile label="Collected" value={formatNaira(collected)} tone="green" />
          <StatTile label="Outstanding" value={formatNaira(outstanding)} tone="amber" />
        </View>

        <Text style={st.section}>Today&apos;s jobs</Text>
        {jobs.length === 0 ? (
          <Card><Muted>No jobs today.</Muted></Card>
        ) : (
          jobs.map((j) => (
            <Link key={j.id} href={`/jobs/${j.id}`} asChild>
              <Card style={{ marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 10 }}>
                <View style={st.time}>
                  <Text style={st.timeText}>
                    {new Date(j.scheduled_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={st.jobName}>{j.clients?.name ?? "Client"}</Text>
                  <Badge value={j.type} />
                </View>
                <Money kobo={j.value_kobo} />
                <Badge value={j.status} />
              </Card>
            </Link>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  wrap: { padding: 16, paddingBottom: 40 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  tiles: { flexDirection: "row", gap: 10, marginBottom: 18 },
  section: { fontSize: 15, fontWeight: "700", color: c.ink, marginBottom: 8 },
  time: { backgroundColor: c.primarySoft, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 8 },
  timeText: { color: c.primary, fontWeight: "700", fontSize: 12 },
  jobName: { fontWeight: "700", color: c.ink, marginBottom: 3 },
});
