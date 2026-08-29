import { useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase";
import { c } from "@/lib/theme";
import { Card, Btn, Field } from "@/components/ui";

export default function Login() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [stage, setStage] = useState<"email" | "code">("email");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setStage("code");
  }

  async function verify() {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });
    setLoading(false);
    if (error) setError(error.message);
    else router.replace("/");
  }

  return (
    <View style={st.wrap}>
      <View style={st.brand}>
        <View style={st.logo}>
          <Text style={st.logoText}>M</Text>
        </View>
        <Text style={st.name}>Medja</Text>
      </View>

      <Card style={{ padding: 22 }}>
        {stage === "email" ? (
          <>
            <Text style={st.h}>Sign in</Text>
            <Text style={st.sub}>Enter your email — we&apos;ll send a 6-digit code.</Text>
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@company.com"
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
            />
            {error ? <Text style={st.err}>{error}</Text> : null}
            <Btn title="Send code" onPress={sendCode} loading={loading} disabled={!email.trim()} />
          </>
        ) : (
          <>
            <Text style={st.h}>Enter code</Text>
            <Text style={st.sub}>We sent a code to {email}.</Text>
            <Field
              label="6-digit code"
              value={code}
              onChangeText={setCode}
              placeholder="123456"
              keyboardType="number-pad"
              maxLength={6}
            />
            {error ? <Text style={st.err}>{error}</Text> : null}
            <Btn title="Verify & sign in" onPress={verify} loading={loading} disabled={code.length < 6} />
            <View style={{ height: 8 }} />
            <Btn title="Change email" kind="outline" onPress={() => setStage("email")} />
          </>
        )}
      </Card>
    </View>
  );
}

const st = StyleSheet.create({
  wrap: { flex: 1, justifyContent: "center", paddingHorizontal: 22, backgroundColor: c.bg },
  brand: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 22 },
  logo: { width: 44, height: 44, borderRadius: 12, backgroundColor: c.primary, alignItems: "center", justifyContent: "center" },
  logoText: { color: c.white, fontWeight: "800", fontSize: 22 },
  name: { fontSize: 24, fontWeight: "800", color: c.ink },
  h: { fontSize: 19, fontWeight: "700", color: c.ink },
  sub: { fontSize: 13, color: c.muted, marginTop: 2, marginBottom: 14 },
  err: { color: c.danger, fontSize: 13, marginBottom: 8 },
});
