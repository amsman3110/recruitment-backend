import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { removeToken } from "../services/tokenStorage";

export default function HomeScreen() {
  const router = useRouter();

  async function handleLogout() {
    await removeToken();
    router.replace("/(auth)/login");
  }

  return (
    <View
      style={{
        flex: 1,
        paddingHorizontal: 20,
        paddingBottom: 30,
        backgroundColor: "white",
      }}
    >
      <View style={{ marginTop: 80 }}>
        <Text
          style={{
            fontSize: 26,
            fontWeight: "700",
            marginBottom: 24,
          }}
        >
          Home
        </Text>

        <Text
          style={{
            fontSize: 16,
            color: "#555",
            marginBottom: 30,
          }}
        >
          Welcome to the Recruitment App
        </Text>

        <Pressable
          onPress={handleLogout}
          style={{
            backgroundColor: "#000",
            padding: 16,
            borderRadius: 12,
          }}
        >
          <Text
            style={{
              color: "white",
              textAlign: "center",
              fontSize: 16,
              fontWeight: "600",
            }}
          >
            Logout
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
