import { Tabs, Redirect } from "expo-router";
import { View, ActivityIndicator } from "react-native";
import { useAuth } from "@/lib/auth";
import { c } from "@/lib/theme";

export default function CleanerLayout() {
  const { loading, session, member } = useAuth();
  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: c.bg }}>
        <ActivityIndicator color={c.accent} />
      </View>
    );
  }
  if (!session) return <Redirect href="/login" />;
  if (!member) return <Redirect href="/onboarding" />;
  if (member.role !== "cleaner") return <Redirect href="/(tabs)" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.accent,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { borderTopColor: c.line },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "My jobs" }} />
      <Tabs.Screen name="pay" options={{ title: "My pay" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
