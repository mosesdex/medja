import { useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { c } from "@/lib/theme";
import { Card, Btn, Field } from "@/components/ui";
import { toKobo } from "@/lib/money";
import { vettingProgress } from "@/features/staff/vetting";

export default function NewStaff() {
  const { member } = useAuth();
  const [f, setF] = useState({
    name: "", phone: "", role_title: "Cleaner", nin: "",
    guarantor_name: "", guarantor_phone: "", guarantor_address: "", background_check: "", pay: "",
  });
  const [basis, setBasis] = useState("per_job");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (k: string) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  async function save() {
    if (!f.name.trim()) { setError("Name required."); return; }
    setLoading(true); setError(null);
    const fields = {
      nin: f.nin.trim() || null,
      guarantor_name: f.guarantor_name.trim() || null,
      guarantor_phone: f.guarantor_phone.trim() || null,
      guarantor_address: f.guarantor_address.trim() || null,
      background_check: f.background_check.trim() || null,
    };
    const { error } = await supabase.from("staff_profiles").insert({
      company_id: member!.companyId, name: f.name.trim(), phone: f.phone.trim() || null,
      role_title: f.role_title.trim() || "Cleaner", ...fields,
      pay_kobo: f.pay ? toKobo(Number(f.pay)) : null, pay_basis: basis,
      vetting_status: vettingProgress(fields).complete ? "vetted" : "pending",
    });
    if (error) { setLoading(false); setError(error.message); return; }
    setLoading(false);
    router.back();
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={st.head}>
          <Text onPress={() => router.back()} style={st.back}>←</Text>
          <Text style={st.title}>Add staff</Text>
        </View>
        <Card style={{ padding: 18 }}>
          <Field label="Name" value={f.name} onChangeText={set("name")} placeholder="Chidinma Okafor" />
          <Field label="Phone" value={f.phone} onChangeText={set("phone")} placeholder="0803…" keyboardType="phone-pad" />
          <Field label="Role" value={f.role_title} onChangeText={set("role_title")} placeholder="Cleaner" />
          <Text style={st.sub}>Vetting record</Text>
          <Field label="NIN" value={f.nin} onChangeText={set("nin")} placeholder="National ID number" />
          <Field label="Guarantor name" value={f.guarantor_name} onChangeText={set("guarantor_name")} />
          <Field label="Guarantor phone" value={f.guarantor_phone} onChangeText={set("guarantor_phone")} keyboardType="phone-pad" />
          <Field label="Guarantor address" value={f.guarantor_address} onChangeText={set("guarantor_address")} />
          <Field label="Background check" value={f.background_check} onChangeText={set("background_check")} placeholder="cleared 2026-02" />
          <Text style={st.sub}>Pay</Text>
          <Field label="Rate (₦)" value={f.pay} onChangeText={set("pay")} placeholder="4500" keyboardType="number-pad" />
          <View style={st.chips}>
            {["per_job", "per_day", "monthly"].map((b) => (
              <Text key={b} onPress={() => setBasis(b)}
                style={[st.chip, basis === b ? { backgroundColor: c.primary, color: c.white } : { color: c.muted }]}>{b.replace("_", " ")}</Text>
            ))}
          </View>
          {error ? <Text style={st.err}>{error}</Text> : null}
          <Btn title="Save staff" onPress={save} loading={loading} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  back: { fontSize: 24, color: c.ink, width: 30 },
  title: { fontSize: 18, fontWeight: "800", color: c.ink },
  sub: { fontSize: 13, fontWeight: "700", color: c.muted, marginTop: 6, marginBottom: 6 },
  chips: { flexDirection: "row", gap: 8, marginBottom: 12 },
  chip: { borderWidth: 1.5, borderColor: c.line, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6, fontSize: 12, fontWeight: "600", overflow: "hidden" },
  err: { color: c.danger, fontSize: 13, marginBottom: 8 },
});
