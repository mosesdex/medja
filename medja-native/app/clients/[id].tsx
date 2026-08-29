import { useCallback, useState } from "react";
import { View, Text, ScrollView, Linking, StyleSheet } from "react-native";
import { useLocalSearchParams, useFocusEffect, router, Link } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { c } from "@/lib/theme";
import { Card, Badge, Money, Btn, Muted, StatTile } from "@/components/ui";
import { formatNaira } from "@/lib/money";
import { waLink } from "@/lib/whatsapp";

interface Client { id: string; name: string; phone: string | null; kind: string; notes: string | null }
interface Site { id: string; label: string; address: string | null; access_note: string | null }
interface Job { id: string; type: string; status: string; scheduled_at: string; value_kobo: number | null }

export default function ClientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [ltv, setLtv] = useState(0);
  const [outstanding, setOutstanding] = useState(0);

  const load = useCallback(async () => {
    const { data: cl } = await supabase.from("clients").select("id, name, phone, kind, notes").eq("id", id).maybeSingle();
    setClient(cl as unknown as Client);
    const { data: s } = await supabase.from("client_sites").select("id, label, address, access_note").eq("client_id", id);
    setSites((s as unknown as Site[]) ?? []);
    const { data: j } = await supabase.from("jobs").select("id, type, status, scheduled_at, value_kobo").eq("client_id", id).order("scheduled_at", { ascending: false }).limit(10);
    setJobs((j as unknown as Job[]) ?? []);
    const { data: inv } = await supabase.from("invoices").select("total_kobo, deposit_kobo, status").eq("client_id", id);
    const rows = (inv ?? []) as { total_kobo: number; deposit_kobo: number; status: string }[];
    setLtv(rows.filter((i) => i.status === "paid").reduce((a, i) => a + i.total_kobo, 0));
    setOutstanding(rows.filter((i) => i.status !== "paid").reduce((a, i) => a + (i.total_kobo - i.deposit_kobo), 0));
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!client) return <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} />;
  const wa = client.phone ? waLink(client.phone, `Hello ${client.name}, `) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={st.head}>
          <Text onPress={() => router.back()} style={st.back}>←</Text>
          <View style={{ flex: 1 }}>
            <Text style={st.title}>{client.name}</Text>
            <Muted>{client.phone ?? "—"}</Muted>
          </View>
          <Badge value={client.kind} />
        </View>

        <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
          <StatTile label="Lifetime value" value={formatNaira(ltv)} tone="green" />
          <StatTile label="Outstanding" value={formatNaira(outstanding)} tone={outstanding > 0 ? "amber" : "default"} />
        </View>

        {wa ? <Btn title="Message on WhatsApp" kind="outline" onPress={() => Linking.openURL(wa)} /> : null}

        {client.notes ? (
          <Card style={{ marginTop: 12 }}>
            <Text style={st.section}>Notes</Text>
            <Text style={{ color: c.ink, fontSize: 13 }}>{client.notes}</Text>
          </Card>
        ) : null}

        <Text style={[st.section, { marginTop: 16 }]}>Sites</Text>
        {sites.map((s) => (
          <Card key={s.id} style={{ marginBottom: 8 }}>
            <Text style={{ fontWeight: "700", color: c.ink }}>{s.label}</Text>
            <Muted>{s.address ?? "—"}</Muted>
            {s.access_note ? <Text style={{ fontSize: 13, color: c.ink, marginTop: 4 }}>Access: {s.access_note}</Text> : null}
          </Card>
        ))}

        <Text style={[st.section, { marginTop: 8 }]}>Recent jobs</Text>
        {jobs.length === 0 ? <Muted>No jobs yet.</Muted> : jobs.map((j) => (
          <Link key={j.id} href={`/jobs/${j.id}`} asChild>
            <Card style={{ marginBottom: 8, flexDirection: "row", alignItems: "center", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Badge value={j.type} />
                <Muted>{new Date(j.scheduled_at).toLocaleDateString("en-NG", { day: "numeric", month: "short" })}</Muted>
              </View>
              <Money kobo={j.value_kobo} />
              <Badge value={j.status} />
            </Card>
          </Link>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  back: { fontSize: 24, color: c.ink, width: 30 },
  title: { fontSize: 18, fontWeight: "800", color: c.ink },
  section: { fontSize: 14, fontWeight: "700", color: c.ink, marginBottom: 8 },
});
