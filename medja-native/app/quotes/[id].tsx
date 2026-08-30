import { useCallback, useState } from "react";
import { View, Text, ScrollView, Linking, StyleSheet } from "react-native";
import { useLocalSearchParams, useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { c } from "@/lib/theme";
import { Card, Badge, Money, Btn } from "@/components/ui";
import { formatNaira } from "@/lib/money";
import { waLink } from "@/lib/whatsapp";

interface Quote { id: string; total_kobo: number; status: string; client_id: string; clients: { name: string; phone: string | null } | null }
interface Line { label: string; amount_kobo: number }

export default function QuoteDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { member } = useAuth();
  const [q, setQ] = useState<Quote | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase.from("quotes").select("id, total_kobo, status, client_id, clients(name, phone)").eq("id", id).maybeSingle();
    setQ(data as unknown as Quote);
    const { data: l } = await supabase.from("quote_lines").select("label, amount_kobo").eq("quote_id", id);
    setLines((l as unknown as Line[]) ?? []);
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!q) return <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} />;
  const client = q.clients;
  const wa = client?.phone ? waLink(client.phone, `Hello ${client.name}, here is your cleaning quote:\n${lines.map((l) => `• ${l.label}: ${formatNaira(l.amount_kobo)}`).join("\n")}\n\nTotal: ${formatNaira(q.total_kobo)}. Reply to book.`) : null;

  async function convert() {
    setBusy(true);
    const { data: number } = await supabase.rpc("next_invoice_number", { p_company: member!.companyId });
    const { data: inv } = await supabase.from("invoices").insert({
      company_id: member!.companyId, client_id: q!.client_id, number: number ?? "INV-0001",
      subtotal_kobo: q!.total_kobo, vat_kobo: 0, deposit_kobo: 0, total_kobo: q!.total_kobo, status: "balance_due",
    }).select("id").single();
    const iid = (inv as { id: string }).id;
    await supabase.from("invoice_lines").insert(lines.map((l) => ({ company_id: member!.companyId, invoice_id: iid, label: l.label, amount_kobo: l.amount_kobo })));
    await supabase.from("quotes").update({ status: "invoiced" }).eq("id", id);
    setBusy(false);
    router.replace(`/invoices/${iid}`);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={st.head}>
          <Text onPress={() => router.back()} style={st.back}>←</Text>
          <Text style={st.title}>Quote</Text>
          <Badge value={q.status} />
        </View>
        <Card>
          <Text style={st.client}>{client?.name}</Text>
          <View style={{ marginTop: 8 }}>
            {lines.map((l, i) => (
              <View key={i} style={st.row}>
                <Text style={{ color: c.muted, fontSize: 13 }}>{l.label}</Text>
                <Money kobo={l.amount_kobo} />
              </View>
            ))}
            <View style={[st.row, { borderTopWidth: 1, borderTopColor: c.line }]}>
              <Text style={{ fontWeight: "800", color: c.ink }}>Total</Text>
              <Money kobo={q.total_kobo} />
            </View>
          </View>
        </Card>
        {wa ? <View style={{ marginTop: 12 }}><Btn title="Send quote via WhatsApp" kind="outline" onPress={() => Linking.openURL(wa)} /></View> : null}
        {q.status !== "invoiced" ? <View style={{ marginTop: 8 }}><Btn title="Convert to invoice" kind="primary" onPress={convert} loading={busy} /></View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  back: { fontSize: 24, color: c.ink, width: 30 },
  title: { flex: 1, fontSize: 18, fontWeight: "800", color: c.ink },
  client: { fontSize: 16, fontWeight: "700", color: c.ink },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
});
