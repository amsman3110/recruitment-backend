import { useRouter } from "expo-router";
import { Pressable, Text, TextInput, View } from "react-native";
import { saveToken } from "../services/tokenStorage";

export default function LoginScreen() {
  const router = useRouter();

  async function handleLogin() {
    await saveToken("mock-jwt-token");
    router.replace("/(tabs)");
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
            textAlign: "center",
            marginBottom: 32,
          }}
        >
          Login
        </Text>

        <Text style={{ fontSize: 14, marginBottom: 6 }}>
          Email
        </Text>
        <TextInput
          placeholder="email@example.com"
          autoCapitalize="none"
          style={{
            borderWidth: 1,
            borderRadius: 10,
            padding: 14,
            marginBottom: 20,
          }}
        />

        <Text style={{ fontSize: 14, marginBottom: 6 }}>
          Password
        </Text>
        <TextInput
          placeholder="Password"
          secureTextEntry
          style={{
            borderWidth: 1,
            borderRadius: 10,
            padding: 14,
            marginBottom: 30,
          }}
        />

        <Pressable
          onPress={handleLogin}
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
            Login
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
