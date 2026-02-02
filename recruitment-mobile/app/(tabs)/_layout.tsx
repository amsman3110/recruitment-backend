import { Link, Tabs } from "expo-router";
import { Text, TouchableOpacity } from "react-native";
import { removeToken } from "../services/tokenStorage";

export default function TabsLayout() {
  /**
   * Tabs layout must stay declarative.
   * Token removal is allowed, navigation is declarative via <Link>.
   */

  async function handleLogout() {
    console.log("Logout pressed → removing token");
    await removeToken();
  }

  return (
    <Tabs
      screenOptions={{
        headerRight: () => (
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity
              onPress={handleLogout}
              style={{ marginRight: 16 }}
            >
              <Text style={{ color: "red", fontWeight: "600" }}>
                Logout
              </Text>
            </TouchableOpacity>
          </Link>
        ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="jobs" options={{ title: "Jobs" }} />
      <Tabs.Screen name="explore" options={{ title: "Explore" }} />
    </Tabs>
  );
}