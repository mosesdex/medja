import { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { c } from "@/lib/theme";
import { Card, Btn, Field } from "@/components/ui";

const KINDS = ["residential", "commercial", "developer"];

export default function NewClient() {
  const { member } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [kind, setKind] = useState("residential");
  const [siteLabel, setSiteLabel] = useState("");
  const [siteAddr, setSiteAddr] = useState("");
  const [siteAccess, setSiteAccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    if (!name.trim()) { setError("Name required."); return; }
    setLoading(true); setError(null);
    const { data, error } = await supabase
      .from("clients")
      .insert({ company_id: member!.companyId, name: name.trim(), phone: phone.trim() || null, kind })
      .select("id").single();
    if (error) { setLoading(false); setError(error.message); return; }
    if (siteLabel.trim() && data) {
      await supabase.from("client_sites").insert({
        company_id: member!.companyId, client_id: (data as { id: string }).id,
        label: siteLabel.trim(), address: siteAddr.trim() || null, access_note: siteAccess.trim() || null,
      });
    }
    setLoading(false);
    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={st.head}>
          <Text onPress={() => router.back()} style={st.back}>←</Text>
          <Text style={st.title}>New client</Text>
        </View>
        <Card style={{ padding: 18 }}>
          <Field label="Name" value={name} onChangeText={setName} placeholder="Mrs. Adebayo" />
          <Field label="Phone (WhatsApp)" value={phone} onChangeText={setPhone} placeholder="0803 123 4567" keyboardType="phone-pad" />
          <Text style={st.lbl}>Client type</Text>
          <View style={st.chips}>
            {KINDS.map((k) => (
              <Text key={k} onPress={() => setKind(k)}
                style={[st.chip, kind === k ? { backgroundColor: c.primary, color: c.white } : { color: c.muted }]}>
                {k}
              </Text>
            ))}
          </View>
          <Text style={[st.lbl, { marginTop: 8 }]}>First site (optional)</Text>
          <Field value={siteLabel} onChangeText={setSiteLabel} placeholder="Site label (Lekki home)" />
          <Field value={siteAddr} onChangeText={setSiteAddr} placeholder="Address" />
          <Field value={siteAccess} onChangeText={setSiteAccess} placeholder="Access note" />
          {error ? <Text style={st.err}>{error}</Text> : null}
          <Btn title="Save client" onPress={save} loading={loading} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  back: { fontSize: 24, color: c.ink, width: 30 },
  title: { fontSize: 18, fontWeight: "800", color: c.ink },
  lbl: { fontSize: 13, fontWeight: "600", color: c.ink, marginBottom: 6 },
  chips: { flexDirection: "row", gap: 8, marginBottom: 8 },
  chip: { borderWidth: 1.5, borderColor: c.line, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, fontSize: 13, fontWeight: "600", textTransform: "capitalize", overflow: "hidden" },
  err: { color: c.danger, fontSize: 13, marginBottom: 8 },
});
