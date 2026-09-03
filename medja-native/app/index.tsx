import { Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/lib/auth";
import { c } from "@/lib/theme";

export default function Index() {
  const { loading, session, member } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.bg }}>
        <ActivityIndicator color={c.primary} size="large" />
      </View>
    );
  }
  if (!session) return <Redirect href="/login" />;
  if (!member) return <Redirect href="/onboarding" />;
  if (member.role === "cleaner") return <Redirect href="/cleaner" />;
  return <Redirect href="/(tabs)" />;
}
