import { useCallback, useState } from "react";
import { View, Text, ScrollView, Linking, StyleSheet } from "react-native";
import { useLocalSearchParams, useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { c } from "@/lib/theme";
import { Card, Badge, Btn, Muted } from "@/components/ui";
import { formatNaira } from "@/lib/money";
import { waLink } from "@/lib/whatsapp";
import { vettingProgress, VETTING_CHECKLIST } from "@/features/staff/vetting";

type DocField = "photo_path" | "nin_doc_path" | "guarantor_id_path";

interface Staff {
  id: string; name: string; role_title: string | null; phone: string | null; vetting_status: string;
  nin: string | null; nin_doc_path: string | null; photo_path: string | null;
  guarantor_name: string | null; guarantor_phone: string | null; guarantor_address: string | null;
  guarantor_id_path: string | null; background_check: string | null; pay_kobo: number | null; pay_basis: string | null;
}

export default function StaffDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { member } = useAuth();
  const [s, setS] = useState<Staff | null>(null);
  const [busy, setBusy] = useState<DocField | null>(null);

  const load = useCallback(async () => {
    const { data } = await supabase.from("staff_profiles").select("*").eq("id", id).maybeSingle();
    setS(data as unknown as Staff);
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  async function upload(field: DocField, key: string) {
    setBusy(field);
    try {
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) { setBusy(null); return; }
      const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.6 });
      if (res.canceled || !res.assets[0]) { setBusy(null); return; }
      const blob = await (await fetch(res.assets[0].uri)).blob();
      const path = `${member!.companyId}/${id}/${key}-${Date.now()}.jpg`;
      const { error } = await supabase.storage.from("staff-docs").upload(path, blob, { contentType: "image/jpeg" });
      if (!error) { await supabase.from("staff_profiles").update({ [field]: path }).eq("id", id); await load(); }
    } catch { /* best effort */ }
    setBusy(null);
  }

  if (!s) return <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} />;
  const prog = vettingProgress(s);
  const first = s.name.split(/\s+/)[0];
  const wa = s.phone ? waLink(s.phone, `Your cleaner today is ${first} from our team — vetted with ID and guarantor on record.`) : null;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={st.head}>
          <Text onPress={() => router.back()} style={st.back}>←</Text>
          <View style={{ flex: 1 }}>
            <Text style={st.title}>{s.name}</Text>
            <Muted>{s.role_title ?? "Cleaner"} · {s.phone ?? "—"}</Muted>
          </View>
          <Badge value={s.vetting_status === "vetted" ? "vetted" : "pending"} />
        </View>

        <Card style={{ marginBottom: 12 }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
            <Text style={st.section}>Vetting record</Text>
            <Muted>{prog.done}/{prog.total}</Muted>
          </View>
          {VETTING_CHECKLIST.map((v) => {
            const on = Boolean((s as unknown as Record<string, unknown>)[v.key]);
            return (
              <View key={v.key} style={st.row}>
                <Text style={{ color: c.muted, fontSize: 13 }}>{v.label}</Text>
                <Text style={{ color: on ? c.accent : c.muted, fontWeight: "700" }}>{on ? "✓" : "—"}</Text>
              </View>
            );
          })}
          <View style={st.row}>
            <Text style={{ color: c.muted, fontSize: 13 }}>Guarantor</Text>
            <Text style={{ fontWeight: "600", fontSize: 13 }}>{s.guarantor_name ?? "—"}{s.guarantor_phone ? ` · ${s.guarantor_phone}` : ""}</Text>
          </View>
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <Text style={st.section}>Documents</Text>
          <Muted>Stored privately. Only your company can view.</Muted>
          <Doc label="Staff photo" done={Boolean(s.photo_path)} busy={busy === "photo_path"} onPress={() => upload("photo_path", "photo")} />
          <Doc label="NIN / ID document" done={Boolean(s.nin_doc_path)} busy={busy === "nin_doc_path"} onPress={() => upload("nin_doc_path", "nin")} />
          <Doc label="Guarantor ID" done={Boolean(s.guarantor_id_path)} busy={busy === "guarantor_id_path"} onPress={() => upload("guarantor_id_path", "guarantor")} />
        </Card>

        <Card style={{ marginBottom: 12 }}>
          <Text style={st.section}>Pay</Text>
          <View style={st.row}>
            <Text style={{ color: c.muted, fontSize: 13 }}>Rate</Text>
            <Text style={{ fontWeight: "600", fontSize: 13 }}>{s.pay_kobo ? `${formatNaira(s.pay_kobo)} ${String(s.pay_basis).replace("_", " ")}` : "—"}</Text>
          </View>
        </Card>

        {wa ? <Btn title="Share verified profile" kind="outline" onPress={() => Linking.openURL(wa)} /> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Doc({ label, done, busy, onPress }: { label: string; done: boolean; busy: boolean; onPress: () => void }) {
  return (
    <View style={st.row}>
      <Text style={{ color: c.muted, fontSize: 13 }}>{label}</Text>
      <Text onPress={onPress} style={{ color: done ? c.accent : c.primary, fontWeight: "700" }}>
        {busy ? "Uploading…" : done ? "✓ On file · replace" : "Upload"}
      </Text>
    </View>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  back: { fontSize: 24, color: c.ink, width: 30 },
  title: { fontSize: 18, fontWeight: "800", color: c.ink },
  section: { fontSize: 14, fontWeight: "700", color: c.ink, marginBottom: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8, borderTopWidth: 1, borderTopColor: c.line },
});
