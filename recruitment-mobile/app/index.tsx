import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { getToken } from "./services/tokenStorage";

export default function StartupScreen() {
  const router = useRouter();

  useEffect(() => {
    async function checkAuth() {
      const token = await getToken();

      if (token) {
        console.log("Token found, auto-login");
        router.replace("/(tabs)");
      } else {
        console.log("No token, go to login");
        router.replace("/(auth)/login");
      }
    }

    checkAuth();
  }, []);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <ActivityIndicator size="large" />
    </View>
  );
}
