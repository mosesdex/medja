import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { c } from "@/lib/theme";
import { Card, Btn, Field } from "@/components/ui";
import { toKobo, formatNaira } from "@/lib/money";

interface Client { id: string; name: string }
interface Tpl { id: string; label: string; floor_kobo: number }

export default function NewQuote() {
  const { member } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [templates, setTemplates] = useState<Tpl[]>([]);
  const [lines, setLines] = useState<{ label: string; amount: string }[]>([{ label: "", amount: "" }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("clients").select("id, name").order("name").then(({ data }) => {
      const cs = (data as Client[]) ?? [];
      setClients(cs);
      if (cs[0]) setClientId(cs[0].id);
    });
    supabase.from("quote_templates").select("id, label, floor_kobo").order("position").then(({ data }) => {
      setTemplates((data as Tpl[]) ?? []);
    });
  }, []);

  const total = lines.reduce((s, l) => s + toKobo(Number(l.amount) || 0), 0);

  function addTemplate(t: Tpl) {
    setLines((s) => {
      const filled = s.filter((l) => l.label || l.amount);
      return [...filled, { label: t.label, amount: t.floor_kobo ? String(t.floor_kobo / 100) : "" }];
    });
  }

  async function save() {
    const clean = lines.map((l) => ({ label: l.label.trim(), amount_kobo: toKobo(Number(l.amount) || 0) })).filter((l) => l.label && l.amount_kobo > 0);
    if (!clientId || !clean.length) { setError("Pick a client and add a line."); return; }
    setLoading(true); setError(null);
    const { data: q, error } = await supabase.from("quotes").insert({
      company_id: member!.companyId, client_id: clientId, total_kobo: total, status: "draft",
    }).select("id").single();
    if (error) { setLoading(false); setError(error.message); return; }
    const qid = (q as { id: string }).id;
    await supabase.from("quote_lines").insert(clean.map((l) => ({ company_id: member!.companyId, quote_id: qid, label: l.label, amount_kobo: l.amount_kobo })));
    setLoading(false);
    router.replace(`/quotes/${qid}`);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={st.head}>
          <Text onPress={() => router.back()} style={st.back}>←</Text>
          <Text style={st.title}>New quote</Text>
        </View>
        {clients.length === 0 ? (
          <Card><Text style={{ color: c.muted }}>Add a client first.</Text></Card>
        ) : (
          <Card style={{ padding: 18 }}>
            <Text style={st.lbl}>Client</Text>
            <View style={st.chips}>
              {clients.map((cl) => (
                <Text key={cl.id} onPress={() => setClientId(cl.id)}
                  style={[st.chip, clientId === cl.id ? { backgroundColor: c.primary, color: c.white } : { color: c.muted }]}>{cl.name}</Text>
              ))}
            </View>

            {templates.length > 0 && (
              <>
                <Text style={st.lbl}>Add from template</Text>
                <View style={st.chips}>
                  {templates.map((t) => (
                    <Text key={t.id} onPress={() => addTemplate(t)} style={[st.chip, { color: c.primary, borderColor: c.primary }]}>
                      + {t.label}
                    </Text>
                  ))}
                </View>
              </>
            )}

            <Text style={st.lbl}>Lines</Text>
            {lines.map((l, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Field value={l.label} onChangeText={(t) => setLines((s) => s.map((x, j) => j === i ? { ...x, label: t } : x))} placeholder="2-bed deep clean" />
                </View>
                <View style={{ width: 100 }}>
                  <Field value={l.amount} onChangeText={(t) => setLines((s) => s.map((x, j) => j === i ? { ...x, amount: t } : x))} placeholder="₦" keyboardType="number-pad" />
                </View>
              </View>
            ))}
            <Text onPress={() => setLines((s) => [...s, { label: "", amount: "" }])} style={{ color: c.primary, fontWeight: "700", marginBottom: 10 }}>+ Add line</Text>

            <View style={st.total}>
              <Text style={{ fontWeight: "800", color: c.ink }}>Total</Text>
              <Text style={{ fontWeight: "800", color: c.ink }}>{formatNaira(total)}</Text>
            </View>
            {error ? <Text style={st.err}>{error}</Text> : null}
            <Btn title="Create quote" onPress={save} loading={loading} />
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
  total: { flexDirection: "row", justifyContent: "space-between", backgroundColor: c.mutedBg, borderRadius: 12, padding: 12, marginVertical: 12 },
  err: { color: c.danger, fontSize: 13, marginBottom: 8 },
});
