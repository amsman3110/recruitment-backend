import { useRouter } from "expo-router";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const DEV_LOGIN_BYPASS = true;

export default function LoginScreen() {
  const router = useRouter();

  function handleLogin() {
    if (DEV_LOGIN_BYPASS) {
      router.replace("/(tabs)");
    }
  }

  function handleGoToRegister() {
    router.push("/(auth)/register");
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#999999"
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999999"
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={handleGoToRegister}>
        <Text style={styles.registerText}>
          Don't have an account? Create one
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
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
    color: "#007AFF",
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CCCCCC",
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
    color: "#000000",
  },
  button: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  registerText: {
    marginTop: 20,
    textAlign: "center",
    fontSize: 14,
    color: "#CCCCCC",
  },
  devHint: {
    marginTop: 16,
    textAlign: "center",
    fontSize: 12,
    color: "#AAAAAA",
  },
});
