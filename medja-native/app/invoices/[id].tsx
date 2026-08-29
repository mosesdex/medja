import { useCallback, useState } from "react";
import { View, Text, ScrollView, Linking, StyleSheet } from "react-native";
import { useLocalSearchParams, useFocusEffect, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { c } from "@/lib/theme";
import { Card, Badge, Btn, Money } from "@/components/ui";
import { formatNaira } from "@/lib/money";
import { waLink } from "@/lib/whatsapp";

interface Inv {
  id: string; number: string; subtotal_kobo: number; vat_kobo: number; deposit_kobo: number; total_kobo: number; status: string;
  clients: { name: string; phone: string | null } | null;
}
interface Line { label: string; amount_kobo: number }

export default function InvoiceDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [inv, setInv] = useState<Inv | null>(null);
  const [lines, setLines] = useState<Line[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const { data } = await supabase
      .from("invoices")
      .select("id, number, subtotal_kobo, vat_kobo, deposit_kobo, total_kobo, status, clients(name, phone)")
      .eq("id", id).maybeSingle();
    setInv(data as unknown as Inv);
    const { data: l } = await supabase.from("invoice_lines").select("label, amount_kobo").eq("invoice_id", id);
    setLines((l as unknown as Line[]) ?? []);
  }, [id]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!inv) return <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} />;
  const client = inv.clients;
  const balance = inv.total_kobo - inv.deposit_kobo;
  const wa = client?.phone ? waLink(client.phone, `Hello ${client.name}, invoice ${inv.number}. Balance due: ${formatNaira(balance)}. Thank you.`) : null;

  async function markPaid() {
    setSaving(true);
    await supabase.from("invoices").update({ status: "paid" }).eq("id", id);
    await load();
    setSaving(false);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={st.head}>
          <Text onPress={() => router.back()} style={st.back}>←</Text>
          <Text style={st.title}>{inv.number}</Text>
          <Badge value={inv.status} />
        </View>

        <Card>
          <Text style={st.client}>{client?.name}</Text>
          <View style={{ marginTop: 8 }}>
            {lines.map((l, i) => (
              <Row key={i} k={l.label} v={<Money kobo={l.amount_kobo} />} />
            ))}
            {inv.vat_kobo > 0 ? <Row k="VAT (7.5%)" v={<Money kobo={inv.vat_kobo} />} /> : null}
            {inv.deposit_kobo > 0 ? <Row k="Deposit received" v={<Text style={{ color: c.accent }}>-{formatNaira(inv.deposit_kobo)}</Text>} /> : null}
            <Row k="Balance due" v={<Money kobo={balance} />} bold />
          </View>
        </Card>

        {wa ? (
          <View style={{ marginTop: 12 }}>
            <Btn title="Send via WhatsApp" kind="outline" onPress={() => Linking.openURL(wa)} />
          </View>
        ) : null}
        {inv.status !== "paid" ? (
          <View style={{ marginTop: 8 }}>
            <Btn title="Mark as paid" kind="green" onPress={markPaid} loading={saving} />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ k, v, bold }: { k: string; v: React.ReactNode; bold?: boolean }) {
  return (
    <View style={[st.row, bold && { borderTopWidth: 1, borderTopColor: c.line }]}>
      <Text style={{ color: bold ? c.ink : c.muted, fontSize: bold ? 15 : 13, fontWeight: bold ? "800" : "400" }}>{k}</Text>
      <Text style={{ fontWeight: bold ? "800" : "600", fontSize: bold ? 15 : 13, color: c.ink }}>{v}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  back: { fontSize: 24, color: c.ink, width: 30 },
  title: { flex: 1, fontSize: 18, fontWeight: "800", color: c.ink },
  client: { fontSize: 16, fontWeight: "700", color: c.ink },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 8 },
});
