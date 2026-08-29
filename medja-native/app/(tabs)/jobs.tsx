import { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet } from "react-native";
import { useFocusEffect, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { c } from "@/lib/theme";
import { Card, Badge, Money, H1, Muted } from "@/components/ui";

interface Job { id: string; scheduled_at: string; type: string; status: string; value_kobo: number | null; clients: { name: string } | null }

export default function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const load = useCallback(async () => {
    const { data } = await supabase
      .from("jobs")
      .select("id, scheduled_at, type, status, value_kobo, clients(name)")
      .order("scheduled_at", { ascending: true })
      .limit(100);
    setJobs((data as unknown as Job[]) ?? []);
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <View style={st.head}><H1>Jobs</H1></View>
      <FlatList
        data={jobs}
        keyExtractor={(j) => j.id}
        contentContainerStyle={{ padding: 16, paddingTop: 0 }}
        ListEmptyComponent={<Card><Muted>No jobs scheduled.</Muted></Card>}
        renderItem={({ item: j }) => (
          <Link href={`/jobs/${j.id}`} asChild>
            <Card style={{ marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={st.time}>
                <Text style={st.timeText}>
                  {new Date(j.scheduled_at).toLocaleDateString("en-NG", { day: "2-digit", month: "short" })}
                </Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.name}>{j.clients?.name ?? "Client"}</Text>
                <Badge value={j.type} />
              </View>
              <Money kobo={j.value_kobo} />
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
  time: { backgroundColor: c.primarySoft, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 8 },
  timeText: { color: c.primary, fontWeight: "700", fontSize: 11 },
  name: { fontWeight: "700", color: c.ink, marginBottom: 3 },
});
