import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { apiPost } from "../services/api";
import { saveAuth } from "../services/auth";

export default function RecruiterLoginScreen() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    console.log("=== RECRUITER LOGIN START ===");
    console.log("Email:", email);

    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      console.log("Sending recruiter login request...");

      const response = await apiPost("/auth/login-recruiter", {
        email: email,
        password: password,
      });

      console.log("✅ Recruiter login successful:", response);

      // FIXED: Use saveAuth instead of AsyncStorage
      await saveAuth(
        response.token,
        {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name || response.company?.company_name || email,
          role: 'recruiter',
        },
        true
      );

      Alert.alert("Success", "Login successful!");
      router.replace("/(recruiter-tabs)");
    } catch (error) {
      console.error("❌ Recruiter login error:", error);

      const message =
        (error && typeof error === "object" && "message" in error && (error as any).message) ||
        "Login failed. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }

  function handleGoToRegister() {
    // FIXED: Correct path to recruiter register
    router.push("/(auth)/recruiter-register");
  }

  function handleBackToSelector() {
    router.back();
  }

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={handleBackToSelector}>
        <Text style={styles.backButtonText}>← Back</Text>
      </Pressable>

      <Text style={styles.title}>Recruiter Login</Text>
      <Text style={styles.subtitle}>Access your company account</Text>

      <TextInput
        style={styles.input}
        placeholder="Email Address"
        placeholderTextColor="#999999"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <Pressable
        style={styles.button}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login as Recruiter"}
        </Text>
      </Pressable>

      <Pressable onPress={handleGoToRegister}>
        <Text style={styles.registerText}>
          Don't have a recruiter account? Register here
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#121212",
  },
  backButton: {
    position: "absolute",
    top: 60,
    left: 24,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
    color: "#34C759",
  },
  subtitle: {
    fontSize: 16,
    color: "#AAAAAA",
    textAlign: "center",
    marginBottom: 32,
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
    backgroundColor: "#34C759",
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
});