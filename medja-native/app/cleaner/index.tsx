import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useFocusEffect, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { c } from "@/lib/theme";
import { Card, Badge, Muted } from "@/components/ui";

interface Job { id: string; scheduled_at: string; type: string; status: string; clients: { name: string } | null; client_sites: { label: string } | null }

export default function CleanerJobs() {
  const { member } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const load = useCallback(async () => {
    // RLS (jobs_select_assigned) limits to jobs assigned to this cleaner.
    const { data } = await supabase
      .from("jobs")
      .select("id, scheduled_at, type, status, clients(name), client_sites(label)")
      .order("scheduled_at");
    setJobs((data as unknown as Job[]) ?? []);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const today = new Date().toLocaleDateString("en-NG", { weekday: "long", day: "numeric", month: "long" });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <View style={st.head}>
        <Muted>Cleaner app</Muted>
        <Text style={st.hi}>Hi {member?.name}</Text>
      </View>
      <FlatList
        data={jobs}
        keyExtractor={(j) => j.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListHeaderComponent={
          <View style={st.banner}>
            <Text style={st.bannerText}>{today}</Text>
            <Text style={st.bannerSub}>{jobs.length} job(s) assigned to you</Text>
          </View>
        }
        ListEmptyComponent={<Card><Muted>No jobs assigned.</Muted></Card>}
        renderItem={({ item: j }) => (
          <Link href={`/jobs/${j.id}`} asChild>
            <Card style={{ marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={st.time}>
                <Text style={st.timeText}>
                  {new Date(j.scheduled_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.name}>{j.clients?.name ?? "Client"}</Text>
                <Muted>{j.client_sites?.label ?? ""}</Muted>
              </View>
              <Badge value={j.status} />
            </Card>
          </Link>
        )}
      />
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  head: { paddingHorizontal: 16, paddingVertical: 12 },
  hi: { fontSize: 22, fontWeight: "800", color: c.ink },
  banner: { backgroundColor: c.accent, borderRadius: 14, padding: 14, marginBottom: 12 },
  bannerText: { color: c.white, fontWeight: "700", fontSize: 15 },
  bannerSub: { color: c.white, opacity: 0.9, fontSize: 13, marginTop: 2 },
  time: { backgroundColor: c.primarySoft, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 8 },
  timeText: { color: c.primary, fontWeight: "700", fontSize: 12 },
  name: { fontWeight: "700", color: c.ink },
});
