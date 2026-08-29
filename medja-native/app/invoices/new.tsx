import { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, StyleSheet } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/auth";
import { c } from "@/lib/theme";
import { Card, Btn, Field } from "@/components/ui";
import { toKobo, formatNaira, applyVat } from "@/lib/money";
import { computeInvoice } from "@/features/invoices/calc";

interface Client { id: string; name: string }

export default function NewInvoice() {
  const { member } = useAuth();
  const { job } = useLocalSearchParams<{ job?: string }>();
  const [clients, setClients] = useState<Client[]>([]);
  const [clientId, setClientId] = useState("");
  const [lines, setLines] = useState([{ label: "", amount: "" }]);
  const [vat, setVat] = useState(false);
  const [deposit, setDeposit] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("clients").select("id, name").order("name").then(({ data }) => {
      const cs = (data as Client[]) ?? [];
      setClients(cs);
      if (cs[0]) setClientId(cs[0].id);
    });
    if (job) {
      supabase.from("jobs").select("client_id").eq("id", job).maybeSingle().then(({ data }) => {
        const cid = (data as { client_id: string } | null)?.client_id;
        if (cid) setClientId(cid);
      });
    }
  }, [job]);

  const subtotal = lines.reduce((s, l) => s + toKobo(Number(l.amount) || 0), 0);
  const vatKobo = vat ? applyVat(subtotal).vat : 0;
  const total = subtotal + vatKobo;
  const balance = Math.max(0, total - toKobo(Number(deposit) || 0));

  async function save() {
    const clean = lines.map((l) => ({ label: l.label.trim(), amount_kobo: toKobo(Number(l.amount) || 0) })).filter((l) => l.label && l.amount_kobo > 0);
    if (!clientId || !clean.length) { setError("Pick a client and add a line."); return; }
    setLoading(true); setError(null);
    const t = computeInvoice(clean, { vat, deposit_kobo: toKobo(Number(deposit) || 0) });
    const { data: number } = await supabase.rpc("next_invoice_number", { p_company: member!.companyId });
    const { data: inv, error } = await supabase.from("invoices").insert({
      company_id: member!.companyId, client_id: clientId, job_id: job || null,
      number: number ?? "INV-0001", subtotal_kobo: t.subtotal_kobo, vat_kobo: t.vat_kobo,
      deposit_kobo: toKobo(Number(deposit) || 0), total_kobo: t.total_kobo,
      status: t.balance_kobo <= 0 ? "paid" : "balance_due",
    }).select("id").single();
    if (error) { setLoading(false); setError(error.message); return; }
    const iid = (inv as { id: string }).id;
    await supabase.from("invoice_lines").insert(clean.map((l) => ({ company_id: member!.companyId, invoice_id: iid, label: l.label, amount_kobo: l.amount_kobo })));
    setLoading(false);
    router.replace(`/invoices/${iid}`);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={st.head}>
          <Text onPress={() => router.back()} style={st.back}>←</Text>
          <Text style={st.title}>New invoice</Text>
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

            <Text style={st.lbl}>Lines</Text>
            {lines.map((l, i) => (
              <View key={i} style={{ flexDirection: "row", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Field value={l.label} onChangeText={(t) => setLines((s) => s.map((x, j) => j === i ? { ...x, label: t } : x))} placeholder="Deep clean — 4-bed" />
                </View>
                <View style={{ width: 100 }}>
                  <Field value={l.amount} onChangeText={(t) => setLines((s) => s.map((x, j) => j === i ? { ...x, amount: t } : x))} placeholder="₦" keyboardType="number-pad" />
                </View>
              </View>
            ))}
            <Text onPress={() => setLines((s) => [...s, { label: "", amount: "" }])} style={{ color: c.primary, fontWeight: "700", marginBottom: 10 }}>+ Add line</Text>

            <Pressable onPress={() => setVat((v) => !v)} style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <View style={[st.box, vat && { backgroundColor: c.primary, borderColor: c.primary }]}>{vat ? <Text style={{ color: c.white, fontWeight: "800" }}>✓</Text> : null}</View>
              <Text style={{ fontWeight: "600", color: c.ink }}>Add 7.5% VAT</Text>
            </Pressable>
            <Field label="Deposit already paid (₦)" value={deposit} onChangeText={setDeposit} placeholder="0" keyboardType="number-pad" />

            <View style={st.totals}>
              <Row k="Subtotal" v={formatNaira(subtotal)} />
              {vat ? <Row k="VAT (7.5%)" v={formatNaira(vatKobo)} /> : null}
              <Row k="Total" v={formatNaira(total)} />
              <Row k="Balance due" v={formatNaira(balance)} bold />
            </View>
            {error ? <Text style={st.err}>{error}</Text> : null}
            <Btn title="Create invoice" onPress={save} loading={loading} />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return (
    <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 3 }}>
      <Text style={{ color: bold ? c.ink : c.muted, fontWeight: bold ? "800" : "400" }}>{k}</Text>
      <Text style={{ color: c.ink, fontWeight: bold ? "800" : "600" }}>{v}</Text>
    </View>
  );
}

const st = StyleSheet.create({
  head: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  back: { fontSize: 24, color: c.ink, width: 30 },
  title: { fontSize: 18, fontWeight: "800", color: c.ink },
  lbl: { fontSize: 13, fontWeight: "600", color: c.ink, marginBottom: 6, marginTop: 4 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 6 },
  chip: { borderWidth: 1.5, borderColor: c.line, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7, fontSize: 13, fontWeight: "600", overflow: "hidden" },
  box: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: c.line, alignItems: "center", justifyContent: "center" },
  totals: { backgroundColor: c.mutedBg, borderRadius: 12, padding: 12, marginVertical: 12 },
  err: { color: c.danger, fontSize: 13, marginBottom: 8 },
});
