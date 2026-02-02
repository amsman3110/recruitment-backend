import { useRouter } from "expo-router";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const DEV_LOGIN_BYPASS = true; // 👈 DEV ONLY

export default function LoginScreen() {
  const router = useRouter();

  function handleLogin() {
    if (DEV_LOGIN_BYPASS) {
      // ✅ Go to the REAL home: app/(tabs)/index.tsx
      router.replace("/(tabs)");
      return;
    }

    // Real login will be implemented later
  }

  function handleGoToRegister() {
    router.push("/(auth)/register");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        placeholder="Email Address"
        style={styles.input}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        placeholder="Password"
        style={styles.input}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleGoToRegister}>
        <Text style={styles.registerText}>
          Don’t have an account? <Text style={styles.registerLink}>Create one</Text>
        </Text>
      </TouchableOpacity>

      <Text style={styles.devHint}>
        DEV MODE: Login works without credentials
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cccccc",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  registerText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
    color: "#444444",
  },
  registerLink: {
    color: "#007AFF",
    fontWeight: "600",
  },
  devHint: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
    color: "#888888",
  },
});
