import { useEffect, useState } from "react";
import { View, Text, ScrollView, Platform, Pressable, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { c } from "@/lib/theme";
import { Card, Btn, Field } from "@/components/ui";
import { toKobo } from "@/lib/money";
import { DEFAULT_CHECKLISTS } from "@/features/jobs/checklists";

const TYPES = [
  { v: "residential", l: "Residential" },
  { v: "commercial", l: "Commercial" },
  { v: "post_construction", l: "Post-const." },
];

interface Client { id: string; name: string; client_sites: { id: string; label: string }[] }

export default function NewJob() {
  const { member } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [siteId, setSiteId] = useState("");
  const [type, setType] = useState("residential");
  const [when, setWhen] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [naira, setNaira] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("clients").select("id, name, client_sites(id, label)").order("name").then(({ data }) => {
      const cs = (data as unknown as Client[]) ?? [];
      setClients(cs);
      if (cs[0]) setClientId(cs[0].id);
    });
  }, []);

  const sites = clients.find((c) => c.id === clientId)?.client_sites ?? [];

  async function save() {
    if (!clientId) { setError("Pick a client."); return; }
    setLoading(true); setError(null);
    const { data: job, error } = await supabase.from("jobs").insert({
      company_id: member!.companyId, client_id: clientId, site_id: siteId || null,
      type, scheduled_at: when.toISOString(), value_kobo: naira ? toKobo(Number(naira)) : null,
    }).select("id").single();
    if (error) { setLoading(false); setError(error.message); return; }
    const items = (DEFAULT_CHECKLISTS[type] ?? []).map((label, i) => ({
      company_id: member!.companyId, job_id: (job as { id: string }).id, label, position: i,
    }));
    if (items.length) await supabase.from("job_checklist_items").insert(items);
    setLoading(false);
    router.replace(`/jobs/${(job as { id: string }).id}`);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={st.head}>
          <Text onPress={() => router.back()} style={st.back}>←</Text>
          <Text style={st.title}>New job</Text>
        </View>
        {clients.length === 0 ? (
          <Card><Text style={{ color: c.muted }}>Add a client first.</Text></Card>
        ) : (
          <Card style={{ padding: 18 }}>
            <Text style={st.lbl}>Client</Text>
            <View style={st.chips}>
              {clients.map((cl) => (
                <Text key={cl.id} onPress={() => { setClientId(cl.id); setSiteId(""); }}
                  style={[st.chip, clientId === cl.id ? { backgroundColor: c.primary, color: c.white } : { color: c.muted }]}>
                  {cl.name}
                </Text>
              ))}
            </View>
            {sites.length > 0 && (
              <>
                <Text style={st.lbl}>Site</Text>
                <View style={st.chips}>
                  {sites.map((s) => (
                    <Text key={s.id} onPress={() => setSiteId(s.id)}
                      style={[st.chip, siteId === s.id ? { backgroundColor: c.primary, color: c.white } : { color: c.muted }]}>
                      {s.label}
                    </Text>
                  ))}
                </View>
              </>
            )}
            <Text style={st.lbl}>Type</Text>
            <View style={st.chips}>
              {TYPES.map((t) => (
                <Text key={t.v} onPress={() => setType(t.v)}
                  style={[st.chip, type === t.v ? { backgroundColor: c.primary, color: c.white } : { color: c.muted }]}>
                  {t.l}
                </Text>
              ))}
            </View>
            <Text style={st.lbl}>When</Text>
            <Pressable onPress={() => setShowPicker(true)} style={st.dateBtn}>
              <Text style={{ fontSize: 16, color: c.ink }}>
                {when.toLocaleString("en-NG", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </Text>
            </Pressable>
            {showPicker && (
              <DateTimePicker
                value={when}
                mode="datetime"
                onChange={(_e, d) => { setShowPicker(Platform.OS === "ios"); if (d) setWhen(d); }}
              />
            )}
            <Field label="Value (₦)" value={naira} onChangeText={setNaira} placeholder="55000" keyboardType="number-pad" />
            {error ? <Text style={st.err}>{error}</Text> : null}
            <Btn title="Book job" onPress={save} loading={loading} />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  back: { fontSize: 24, color: c.ink, width: 30 },
  title: { fontSize: 18, fontWeight: "800", color: c.ink },
  lbl: { fontSize: 13, fontWeight: "600", color: c.ink, marginBottom: 6, marginTop: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 6 },
  chip: { borderWidth: 1.5, borderColor: c.line, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, fontSize: 13, fontWeight: "600", overflow: "hidden" },
  dateBtn: { borderWidth: 1, borderColor: c.line, borderRadius: 12, padding: 13, marginBottom: 12, backgroundColor: c.white },
  err: { color: c.danger, fontSize: 13, marginBottom: 8 },
});
