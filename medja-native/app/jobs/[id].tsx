import { useCallback, useState } from "react";
import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from "react-native";
import { useLocalSearchParams, useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { c } from "@/lib/theme";
import { Card, Badge, Money, Btn, Muted } from "@/components/ui";
import { waLink } from "@/lib/whatsapp";

interface Job {
  id: string; type: string; status: string; scheduled_at: string; value_kobo: number | null; notes: string | null;
  clients: { name: string; phone: string | null } | null;
  client_sites: { label: string; address: string | null; access_note: string | null } | null;
}
interface Item { id: string; label: string; done: boolean }

export default function JobDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [items, setItems] = useState<Item[]>([]);

  const load = useCallback(async () => {
    const { data: j } = await supabase
      .from("jobs")
      .select("id, type, status, scheduled_at, value_kobo, notes, clients(name, phone), client_sites(label, address, access_note)")
      .eq("id", id).maybeSingle();
    setJob(j as unknown as Job);
    const { data: it } = await supabase.from("job_checklist_items").select("id, label, done").eq("job_id", id).order("position");
    setItems((it as unknown as Item[]) ?? []);
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function toggle(itemId: string, done: boolean) {
    setItems((s) => s.map((i) => (i.id === itemId ? { ...i, done } : i)));
    await supabase.from("job_checklist_items").update({ done }).eq("id", itemId);
  }

  if (!job) return <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} />;
  const client = job.clients;
  const site = job.client_sites;
  const when = new Date(job.scheduled_at).toLocaleString("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const wa = client?.phone ? waLink(client.phone, `Hello ${client.name}, update on your cleaning job scheduled ${when}.`) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={st.head}>
          <Text onPress={() => router.back()} style={st.back}>←</Text>
          <Text style={st.title}>Job card</Text>
          <Badge value={job.status} />
        </View>

        <Card style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={st.client}>{client?.name}</Text>
            <Badge value={job.type} />
          </View>
          <Row k="When" v={when} />
          {site?.address ? <Row k="Address" v={site.address} /> : null}
          {site?.access_note ? <Row k="Access" v={site.access_note} /> : null}
          <Row k="Value" v={<Money kobo={job.value_kobo} />} />
          {job.notes ? <Row k="Notes" v={job.notes} /> : null}
        </Card>

        {items.length > 0 && (
          <Card style={{ marginBottom: 12 }}>
            <Text style={st.section}>Checklist</Text>
            {items.map((i) => (
              <Pressable key={i.id} onPress={() => toggle(i.id, !i.done)} style={st.chk}>
                <View style={[st.box, i.done && { backgroundColor: c.accent, borderColor: c.accent }]}>
                  {i.done ? <Text style={{ color: c.white, fontWeight: "800" }}>✓</Text> : null}
                </View>
                <Text style={[st.chkText, i.done && { color: c.muted, textDecorationLine: "line-through" }]}>{i.label}</Text>
              </Pressable>
            ))}
          </Card>
        )}

        {wa ? <Btn title="WhatsApp client" kind="outline" onPress={() => Linking.openURL(wa)} /> : <Muted>No client phone on file.</Muted>}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <View style={st.row}>
      <Text style={{ color: c.muted, fontSize: 13 }}>{k}</Text>
      <Text style={{ fontWeight: "600", fontSize: 13, color: c.ink }}>{v}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  back: { fontSize: 24, color: c.ink, width: 30 },
  title: { flex: 1, fontSize: 18, fontWeight: "800", color: c.ink },
  client: { fontSize: 16, fontWeight: "700", color: c.ink },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderTopWidth: 1, borderTopColor: c.line, marginTop: 8 },
  section: { fontSize: 14, fontWeight: "700", color: c.ink, marginBottom: 8 },
  chk: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10 },
  box: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, borderColor: c.line, alignItems: "center", justifyContent: "center" },
  chkText: { flex: 1, fontSize: 14, fontWeight: "600", color: c.ink },
});
