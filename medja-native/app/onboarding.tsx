import { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { c } from "@/lib/theme";
import { Card, Btn, Field } from "@/components/ui";

const SERVICES = [
  { v: "residential", l: "Home / residential" },
  { v: "commercial", l: "Office / commercial" },
  { v: "post_construction", l: "Post-construction" },
];

export default function Onboarding() {
  const { refreshMember } = useAuth();
  const [name, setName] = useState("");
  const [owner, setOwner] = useState("");
  const [city, setCity] = useState("");
  const [svc, setSvc] = useState<string[]>(["residential", "commercial", "post_construction"]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(v: string) {
    setSvc((s) => (s.includes(v) ? s.filter((x) => x !== v) : [...s, v]));
  }

  async function create() {
    if (!name.trim() || !owner.trim()) {
      setError("Company name and your name are required.");
      return;
    }
    setLoading(true);
    setError(null);
    const { data: companyId, error } = await supabase.rpc("create_company", {
      p_name: name.trim(),
      p_city: city.trim(),
      p_service_types: svc,
      p_owner_name: owner.trim(),
    });
    if (error) {
      setLoading(false);
      setError(error.message);
      return;
    }
    if (companyId) await supabase.rpc("seed_default_templates", { p_company: companyId });
    await refreshMember();
    setLoading(false);
    router.replace("/");
  }

  return (
    <ScrollView contentContainerStyle={st.wrap}>
      <Text style={st.h}>Set up your company</Text>
      <Text style={st.sub}>A few details and you&apos;re ready to schedule jobs.</Text>
      <Card style={{ padding: 20 }}>
        <Field label="Your name" value={owner} onChangeText={setOwner} placeholder="e.g. Dex" />
        <Field label="Company name" value={name} onChangeText={setName} placeholder="SparkleClean Services Ltd" />
        <Field label="City" value={city} onChangeText={setCity} placeholder="Lagos" />
        <Text style={{ fontSize: 13, fontWeight: "600", color: c.ink, marginBottom: 6 }}>Services you offer</Text>
        {SERVICES.map((sv) => {
          const on = svc.includes(sv.v);
          return (
            <Text
              key={sv.v}
              onPress={() => toggle(sv.v)}
              style={[st.svc, on ? { borderColor: c.primary, backgroundColor: c.primarySoft, color: c.primary } : { color: c.muted }]}
            >
              {on ? "✓ " : "  "}{sv.l}
            </Text>
          );
        })}
        {error ? <Text style={st.err}>{error}</Text> : null}
        <View style={{ height: 6 }} />
        <Btn title="Create company" onPress={create} loading={loading} />
      </Card>
    </ScrollView>
  );
}

const st = StyleSheet.create({
  wrap: { padding: 22, paddingTop: 70, backgroundColor: c.bg, flexGrow: 1 },
  h: { fontSize: 24, fontWeight: "800", color: c.ink },
  sub: { fontSize: 13, color: c.muted, marginTop: 2, marginBottom: 18 },
  svc: { borderWidth: 1.5, borderColor: c.line, borderRadius: 12, padding: 12, marginBottom: 8, fontSize: 14, fontWeight: "600", overflow: "hidden" },
  err: { color: c.danger, fontSize: 13, marginTop: 8 },
});
