import React from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ActivityIndicator,
  StyleSheet,
  TextInputProps,
  ViewStyle,
} from "react-native";
import { c, badgeStyle, badgeLabel } from "@/lib/theme";
import { formatNaira } from "@/lib/money";

export function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Btn({
  title,
  onPress,
  kind = "primary",
  loading,
  disabled,
}: {
  title: string;
  onPress?: () => void;
  kind?: "primary" | "green" | "outline";
  loading?: boolean;
  disabled?: boolean;
}) {
  const bg = kind === "primary" ? c.primary : kind === "green" ? c.accent : c.card;
  const fg = kind === "outline" ? c.ink : c.white;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        kind === "outline" && { borderWidth: 1.5, borderColor: c.line },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <Text style={[s.btnText, { color: fg }]}>{title}</Text>
      )}
    </Pressable>
  );
}

export function Field(props: TextInputProps & { label?: string }) {
  const { label, ...rest } = props;
  return (
    <View style={{ marginBottom: 12 }}>
      {label ? <Text style={s.label}>{label}</Text> : null}
      <TextInput placeholderTextColor={c.muted} style={s.input} {...rest} />
    </View>
  );
}

export function Badge({ value }: { value: string }) {
  const st = badgeStyle[value] ?? { bg: c.mutedBg, fg: c.muted };
  const label = badgeLabel[value] ?? value.charAt(0).toUpperCase() + value.slice(1);
  return (
    <View style={[s.badge, { backgroundColor: st.bg }]}>
      <Text style={[s.badgeText, { color: st.fg }]}>{label}</Text>
    </View>
  );
}

export function Money({ kobo }: { kobo: number | null | undefined }) {
  return <Text style={s.money}>{formatNaira(kobo ?? 0)}</Text>;
}

export function StatTile({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "green" | "amber";
}) {
  const color = tone === "green" ? c.accent : tone === "amber" ? c.amber : c.ink;
  return (
    <View style={[s.card, { flex: 1, padding: 14 }]}>
      <Text style={{ fontSize: 12, color: c.muted, fontWeight: "600" }}>{label}</Text>
      <Text style={{ fontSize: 20, fontWeight: "800", marginTop: 4, color }}>{value}</Text>
    </View>
  );
}

export function H1({ children }: { children: React.ReactNode }) {
  return <Text style={s.h1}>{children}</Text>;
}
export function Muted({ children }: { children: React.ReactNode }) {
  return <Text style={{ color: c.muted, fontSize: 13 }}>{children}</Text>;
}

const s = StyleSheet.create({
  card: { backgroundColor: c.card, borderRadius: 14, borderWidth: 1, borderColor: c.line, padding: 14 },
  btn: { minHeight: 50, borderRadius: 13, alignItems: "center", justifyContent: "center", paddingHorizontal: 18 },
  btnText: { fontSize: 15, fontWeight: "700" },
  label: { fontSize: 13, fontWeight: "600", color: c.ink, marginBottom: 4 },
  input: {
    borderWidth: 1, borderColor: c.line, borderRadius: 12, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 16, color: c.ink, backgroundColor: c.white,
  },
  badge: { alignSelf: "flex-start", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: "700" },
  money: { fontVariant: ["tabular-nums"], fontWeight: "700", color: c.ink },
  h1: { fontSize: 22, fontWeight: "800", color: c.ink },
});
