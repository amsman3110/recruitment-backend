import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { apiPost } from "../services/api";
import { saveAuth } from "../services/auth";

export default function RecruiterLoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert("Error", "Please enter email and password");
      return;
    }

    try {
      setLoading(true);
      const response = await apiPost("/auth/login-recruiter", {
        email: email.trim(),
        password: password.trim(),
      });

      // Passing rememberMe state to the auth service
      await saveAuth(
        response.token,
        {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name || response.company?.company_name,
          role: 'recruiter'
        },
        rememberMe
      );

      router.replace("/(recruiter-tabs)");
    } catch (error) {
      Alert.alert("Login Failed", error.message || "Invalid recruiter credentials");
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recruiter Portal</Text>
      <Text style={styles.subtitle}>Log in to manage your hiring</Text>

      <TextInput
        style={styles.input}
        placeholder="Recruiter Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setRememberMe(!rememberMe)}
      >
        <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
          {rememberMe && <Text style={styles.checkmark}>✓</Text>}
        </View>
        <Text style={styles.checkboxLabel}>Remember Me</Text>
      </TouchableOpacity>

      <Pressable 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login as Recruiter</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push("/(auth)/recruiter-register")}>
        <Text style={styles.registerText}>
          Don't have a recruiter account? Register here
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: "center", backgroundColor: "#121212" },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 8, textAlign: "center", color: "#34C759" },
  subtitle: { fontSize: 16, color: "#AAAAAA", textAlign: "center", marginBottom: 32 },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: "#000",
  },
  checkboxContainer: { flexDirection: "row", alignItems: "center", marginBottom: 24 },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#34C759",
    borderRadius: 4,
    marginRight: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: { backgroundColor: "#34C759" },
  checkmark: { color: "#fff", fontSize: 14, fontWeight: "bold" },
  checkboxLabel: { fontSize: 14, color: "#AAAAAA" },
  button: { backgroundColor: "#34C759", padding: 18, borderRadius: 8, alignItems: "center", marginBottom: 16 },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  registerText: { color: "#34C759", textAlign: "center", marginTop: 16, fontSize: 14 },
});