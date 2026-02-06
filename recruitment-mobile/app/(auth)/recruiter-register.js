import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { apiPost } from "../services/api";
import { saveAuth } from "../services/auth";

export default function RecruiterRegister() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    console.log("=== RECRUITER REGISTER START ===");
    console.log("Email:", email);
    console.log("Company:", companyName);

    if (!email || !password || !confirmPassword || !companyName) {
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);
      console.log("Sending recruiter registration request...");

      const response = await apiPost("/auth/register-recruiter", {
        email: email.trim(),
        password: password,
        companyName: companyName,
        industry: industry || null,
      });

      console.log("✅ Recruiter registration successful:", response);

      // Save auth for auto-login
      await saveAuth(
        response.token,
        {
          id: response.user.id,
          email: response.user.email,
          name: response.user.name || companyName,
          role: 'recruiter',
        },
        true
      );

      Alert.alert("Success", "Registration successful!");
      router.replace("/(recruiter-tabs)");
    } catch (error) {
      console.error("❌ Recruiter registration error:", error);

      const message =
        (error && typeof error === "object" && "message" in error && error.message) ||
        "Registration failed. Please try again.";
      Alert.alert("Error", message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <Text style={styles.title}>Register as Recruiter</Text>
          <Text style={styles.subtitle}>
            Create your company account
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Company Name *"
            value={companyName}
            onChangeText={setCompanyName}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Industry (e.g., Technology, Finance)"
            value={industry}
            onChangeText={setIndustry}
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Email Address *"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Password (min 6 characters) *"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!loading}
          />

          <TextInput
            style={styles.input}
            placeholder="Confirm Password *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            editable={!loading}
          />

          <Text style={styles.requiredNote}>* Required fields</Text>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Register as Recruiter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/(auth)/recruiter-login")}
            disabled={loading}
          >
            <Text style={styles.linkText}>
              Already have an account? <Text style={styles.linkBold}>Login</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  formContainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
    color: "#4CAF50",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
  },
  requiredNote: {
    fontSize: 12,
    color: "#999",
    marginBottom: 15,
    fontStyle: "italic",
  },
  button: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linkText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
  },
  linkBold: {
    color: "#4CAF50",
    fontWeight: "600",
  },
});